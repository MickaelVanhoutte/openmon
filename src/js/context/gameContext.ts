import { MapSave, OpenMap } from '../mapping/maps';
import { Player } from '../characters/player';
import {
	CharacterPosition,
	type Character,
	type Interactive
} from '../characters/characters-model';
import { Settings } from '../characters/settings';
import { Pokedex, PokemonInstance } from '../pokemons/pokedex';
import { PokemonBox } from '../pokemons/boxes';
import { Position } from '../mapping/positions';
import { MenuType, OverworldContext, SceneType } from './overworldContext';
import { BattleContext } from './battleContext';
import { Dialog, Message, Script } from '../scripting/scripts';
import { NPC } from '../characters/npc';
import { ItemsReferences } from '../items/items';
import { get, writable, type Writable } from 'svelte/store';
import { SaveContext, SavesHolder } from './savesHolder';
import type { Jonction } from '../mapping/collisions';
import { Flags, ObjectiveState, Quest, QuestState } from '../scripting/quests';
import { Notifications } from '../scripting/notifications';
import { BattleType } from '../battle/battle-model';
import {
	AudioManager,
	QuestManager,
	ScriptRunner,
	SoundManager,
	DungeonService,
	MapService,
	BattleService
} from './managers';

import { DungeonContext, dungeonContext } from '../dungeon/dungeon-context';
import {
	registerPrologueMap,
	PROLOGUE_MAP_ID,
	PROLOGUE_WAKE_UP_POS
} from '../mapping/prologue-map';
import { getPositionsInFront } from './helpers/movement-helpers';
import { delay } from '../utils/async-utils';

/**
 * The current game context
 */
export class GameContext {
	ITEMS = new ItemsReferences();
	POKEDEX = new Pokedex();
	MAPS: Record<number, OpenMap> = {};

	id: number;
	updated: number;
	created: number;
	isNewGame: boolean;
	player: Player;
	boxes: Array<PokemonBox>;
	map: OpenMap;
	settings: Settings;

	questStates: QuestState[] = [];
	quests: Quest[] = [];
	currentQuest?: Quest;
	flags: Flags;

	overWorldContext: OverworldContext;
	battleContext: Writable<BattleContext | undefined> = writable(undefined);
	menuAvailability$: Writable<Record<MenuType, boolean>> = writable(
		{} as Record<MenuType, boolean>
	);
	private playTimeStart = Date.now();
	private savedPlayTime = 0;

	// Manager classes
	audioManager: AudioManager;
	soundManager: SoundManager;
	questManager: QuestManager;
	scriptRunner: ScriptRunner;

	// Extracted services
	dungeonService: DungeonService;
	mapService: MapService;
	battleService: BattleService;

	hasEvolutions: boolean = false;
	spawned?: import('../characters/overworld-spawn').OverworldSpawn;
	savesHolder?: SavesHolder;

	viewedGuides: number[];
	notifications: Notifications = new Notifications();

	weather?: {
		started: Date;
		type: 'SANDSTORM' | 'RAIN' | 'SNOW';
		intervalId: number;
		running: boolean;
	};

	constructor(save: SaveContext) {
		this.id = save.id;
		this.POKEDEX = new Pokedex(save.savedEntry);
		this.player = Player.fromInstance(save.player);
		this.boxes = save.boxes.map(
			(box) =>
				new PokemonBox(
					box.name,
					box.values.map((pkmn) => (pkmn ? (pkmn as PokemonInstance) : undefined))
				)
		);

		registerPrologueMap(this.MAPS);

		const mapTemplate = this.MAPS[save.currentMap.mapId] ?? OpenMap.empty();
		this.map = OpenMap.fromInstance(
			mapTemplate,
			save.isNewGame ? mapTemplate.playerInitialPosition : save.player.position.positionOnMap
		);
		this.map.items = this.map.items.filter((i) => !save.currentMap.pickedItems.includes(i.id || 0));
		this.settings = save.settings;
		this.isNewGame = save.isNewGame;
		this.created = save.created;
		this.updated = save.updated;

		this.overWorldContext = new OverworldContext(this.map);
		this.player.position = new CharacterPosition(this.map.playerInitialPosition);
		this.viewedGuides = save.viewedGuides;

		// Initialize managers
		this.audioManager = new AudioManager();
		this.soundManager = new SoundManager(this.settings);
		this.questManager = new QuestManager(save.questStates, save.flags, this.notifications);
		this.questManager.onObjectiveComplete = () => this.updateMenuAvailability();
		this.scriptRunner = new ScriptRunner();
		this.savedPlayTime = save.playTime || 0;
		this.playTimeStart = Date.now();

		// Initialize extracted services
		this.dungeonService = new DungeonService();
		this.mapService = new MapService();
		this.battleService = new BattleService();

		// Sync quest data from manager
		this.questStates = this.questManager.questStates;
		this.quests = this.questManager.quests;
		this.currentQuest = this.questManager.currentQuest;
		this.flags = this.questManager.flags;

		// Index scripts using ScriptRunner
		const allScripts = this.scriptRunner.collectAllScripts(this.map.scripts, this.map.npcs);
		this.scriptRunner.indexScripts(allScripts);

		this.bindKeys();
		this.checkForGameStart();
		this.mapService.loadMap(this, this.map);
		this.startWeatherLoop();
		this.updateMenuAvailability();
	}

	startWeatherLoop() {
		this.weather = {
			type: 'RAIN',
			started: new Date(),
			running: true,
			intervalId: 1
		};
	}

	validateQuestObjective(questId: number, objectiveId: number) {
		const quest = this.quests.find((q) => q.id === questId);
		const objective = quest?.objectives.find((o) => o.id === objectiveId);
		if (objective) {
			objective.complete();
			const questState = this.questStates.find((qs) => qs.id === questId);
			if (questState) {
				const obj = questState.objectives.find((o) => o.id === objectiveId);
				if (obj) {
					obj.completed = true;
					this.notifications.notify(`Objective completed: ${objective.description}`);
					this.updateMenuAvailability();
					if (quest && questState.objectives.every((o) => o.completed)) {
						questState.completed = true;
						this.notifications.notify(`Quest completed: ${quest.name}`);

						this.currentQuest = this.quests.find((q) => q.id === questId + 1) || undefined;
						if (this.currentQuest) {
							this.notifications.notify(`New quest: ${this.currentQuest.name}`);
						}
					}
				}
			} else if (quest) {
				this.questStates.push(
					new QuestState(
						questId,
						false,
						quest.objectives.map((o) => new ObjectiveState(o.id, o.completed))
					)
				);
			}
		}
	}

	isMenuAvailable(menuKey: MenuType): boolean {
		const hasMonsters = this.player.monsters.length > 0;
		switch (menuKey) {
			case MenuType.POKEMON_LIST:
			case MenuType.BOX:
			case MenuType.POKEDEX:
			case MenuType.TRAINER:
			case MenuType.BAG:
				return hasMonsters;
			default:
				return false;
		}
	}

	updateMenuAvailability(): void {
		this.menuAvailability$.set({
			[MenuType.MAIN]: true,
			[MenuType.POKEMON_LIST]: this.isMenuAvailable(MenuType.POKEMON_LIST),
			[MenuType.SWITCH]: true,
			[MenuType.BAG]: this.isMenuAvailable(MenuType.BAG),
			[MenuType.SUMMARY]: true,
			[MenuType.BOX]: this.isMenuAvailable(MenuType.BOX),
			[MenuType.POKEDEX]: this.isMenuAvailable(MenuType.POKEDEX),
			[MenuType.TRAINER]: this.isMenuAvailable(MenuType.TRAINER),
			[MenuType.MAP]: true
		} as Record<MenuType, boolean>);
	}

	bindKeys() {
		this.overWorldContext.keys.a.subscribe((value) => {
			if (value && !this.overWorldContext.getPaused()) {
				const interactive =
					this.map?.elementInFront(
						this.player.position.positionOnMap,
						this.player.position.direction
					) || this.followerInFront();
				let scripts = interactive?.interact(this.player.position.positionOnMap, this);

				if (!interactive) {
					const interactiveBehindCounter = this.map?.elementBehindCounter(
						this.player.position.positionOnMap,
						this.player.position.direction
					);
					scripts = interactiveBehindCounter?.interact(this.player.position.positionOnMap, this);
				}

				const newScript = scripts?.[0];
				const previous = scripts?.[1];
				if (newScript) {
					this.playScript(newScript, previous);
				} else {
					previous?.resume(this);
				}
			}
		});

		this.overWorldContext.keys.up.subscribe((value) => {
			this.handleDirectionKey(value, 'up');
		});
		this.overWorldContext.keys.down.subscribe((value) => {
			this.handleDirectionKey(value, 'down');
		});
		this.overWorldContext.keys.left.subscribe((value) => {
			this.handleDirectionKey(value, 'left');
		});
		this.overWorldContext.keys.right.subscribe((value) => {
			this.handleDirectionKey(value, 'right');
		});
	}

	followerInFront(): Interactive | undefined {
		const elementPosition = new Position(
			this.player.position.positionOnMap.x,
			this.player.position.positionOnMap.y
		);
		switch (this.player.position.direction) {
			case 'up':
				elementPosition.y -= 1;
				break;
			case 'down':
				elementPosition.y += 1;
				break;
			case 'left':
				elementPosition.x -= 1;
				break;
			case 'right':
				elementPosition.x += 1;
				break;
		}
		if (
			this.player.follower &&
			this.player.follower.position.positionOnMap.x === elementPosition.x &&
			this.player.follower.position.positionOnMap.y === elementPosition.y
		) {
			return this.player.follower;
		}
		return undefined;
	}

	handleDirectionKey(value: boolean, direction: 'up' | 'down' | 'left' | 'right') {
		if (value && !this.overWorldContext.getPaused()) {
			this.player.position.targetDirection = direction;
		}

		if (
			this.player.position.positionOnMap.x !== this.player.position.targetPosition.x ||
			this.player.position.positionOnMap.y !== this.player.position.targetPosition.y
		) {
			return;
		}

		if (value && !this.overWorldContext.getPaused()) {
			if (this.player.position.targetDirection !== this.player.position.direction) {
				this.player.position.direction = this.player.position.targetDirection;
			}

			const xChanger = (x: number) =>
				this.player.position.direction === 'left'
					? x - 1
					: this.player.position.direction === 'right'
						? x + 1
						: x;
			const yChanger = (y: number) =>
				this.player.position.direction === 'up'
					? y - 1
					: this.player.position.direction === 'down'
						? y + 1
						: y;

			const futureX = xChanger(this.player.position.targetPosition.x);
			const futureY = yChanger(this.player.position.targetPosition.y);

			if (
				Math.abs(futureX - this.player.position.positionOnMap.x) > 1 ||
				Math.abs(futureY - this.player.position.positionOnMap.y) > 1
			) {
				return;
			}

			const futurePosition = new Position(futureX, futureY);
			const savedPosition = { ...this.player.position.positionOnMap };

			// Intercept floor doors (delegated to DungeonService)
			if (this.dungeonService.checkFloorDoor(this, futureX, futureY)) {
				return;
			}

			if (!this.map.hasBoundaryAt(futurePosition)) {
				// Intercept legendary portals
				const futureJonction = this.map?.jonctionAt(futurePosition);
				if (futureJonction && (futureJonction.mapIdx >= 9500 || (this.map?.mapId ?? 0) >= 9500)) {
					this.mapService.changeMap(this, futureJonction);
					return;
				}

				if (this.currentQuest && this.hasQuestLimit(futurePosition)) {
					this.playScript(
						new Script('onStep', [new Dialog([new Message(this.currentQuest.leaveMessage)])])
					);
				} else {
					this.player.moving = true;
					this.player.position.setFuturePosition(futureX, futureY, () => {
						this.checkForStepInScript();
						this.mapService.checkForJunction(this);
						this.checkForStairs();
						this.battleService.checkForBattle(this);
						this.checkForInSight();

						if (this.player.follower) {
							this.player.follower.stepCounter += 1;
							this.player.follower.position.direction = this.player.position.direction;
							this.player.follower.moving = true;
							this.player.follower.position.setFuturePosition(savedPosition.x, savedPosition.y);
						}

						const heldDirection = this.overWorldContext.keys.getHeldDirection();
						if (heldDirection) {
							this.handleDirectionKey(true, heldDirection);
						}
					});
				}
			}
		}
	}

	hasQuestLimit(futurePosition: Position): boolean {
		return (
			!!this.currentQuest &&
			!!this.currentQuest.area &&
			this.isOutsideQuestBounds(futurePosition, this.currentQuest.area)
		);
	}

	isOutsideQuestBounds(
		futurePosition: Position,
		area: { start: Position; end: Position }
	): boolean {
		return (
			futurePosition.x < area.start.x ||
			futurePosition.x > area.end.x ||
			futurePosition.y < area.start.y ||
			futurePosition.y > area.end.y
		);
	}

	async checkForGameStart(): Promise<boolean> {
		if (this.isNewGame && !this.overWorldContext.scenes.wakeUp) {
			const dc = get(dungeonContext);

			if (dc && !dc.prologueCompleted) {
				const prologueTemplate = this.MAPS[PROLOGUE_MAP_ID];
				if (prologueTemplate) {
					const startPos = prologueTemplate.playerInitialPosition;
					this.map = OpenMap.fromInstance(prologueTemplate, startPos);
					this.player.position = new CharacterPosition(startPos);
				}
				this.overWorldContext.startScene(SceneType.PROLOGUE);

				await delay(5000);
				this.overWorldContext.endScene(SceneType.PROLOGUE);
				this.isNewGame = false;

				return true;
			}

			const script = this.scriptRunner.getByTrigger('onGameStart');
			this.overWorldContext.startScene(SceneType.WAKE_UP);

			await delay(5000);
			this.overWorldContext.endScene(SceneType.WAKE_UP);
			this.isNewGame = false;
			if (script) {
				this.playScript(script, undefined, () => {
					this.questManager.notifyCurrentQuest();
				});
			}

			return true;
		} else {
			this.questManager.notifyCurrentQuest();
		}
		return false;
	}

	checkForStairs() {
		// Floor transition handled by DungeonService.checkFloorDoor in handleDirectionKey
	}

	// Delegate to services (keep API for external callers)
	changeDungeonFloor(dungeonCtx: DungeonContext, savesHolder?: SavesHolder) {
		return this.dungeonService.changeFloor(this, dungeonCtx, savesHolder);
	}

	jumpToFloor(targetFloor: number, dungeonCtx: DungeonContext) {
		return this.dungeonService.jumpToFloor(this, targetFloor, dungeonCtx);
	}

	restartDungeonFloor(dungeonCtx: DungeonContext) {
		return this.dungeonService.restartFloor(this, dungeonCtx);
	}

	checkForInSightNpc(npcId: number): boolean {
		const npc = this.map?.npcs.find((npc) => npc.id === npcId);
		const haveInSightScript =
			!!npc &&
			!!npc?.mainScript &&
			(!npc.mainScript.played || npc.mainScript.replayable) &&
			npc.mainScript.triggerType === 'onSight';
		return !!npc && haveInSightScript && this.haveInSight(npc);
	}

	checkForInSight() {
		if (this.map?.npcs && this.map?.npcs?.length > 0) {
			const npcsWithInSightScript: NPC[] = this.map.npcs.filter(
				(npc) =>
					npc.mainScript &&
					(!npc.mainScript.played || npc.mainScript.replayable) &&
					npc.mainScript.triggerType === 'onSight' &&
					!npc.alerted
			);

			npcsWithInSightScript.forEach((npc) => {
				if (this.haveInSight(npc)) {
					npc.alerted = true;
					npc.alertedAt = Date.now();
					this.overWorldContext.setPaused(true, 'npc-alert');

					const oppositeDirection: Record<string, 'up' | 'down' | 'left' | 'right'> = {
						up: 'down',
						down: 'up',
						left: 'right',
						right: 'left'
					};
					this.player.position.direction = oppositeDirection[npc.direction];

					delay(600).then(() => {
						npc.alerted = false;
						const move = npc.movingScript?.interrupt();
						this.playScript(npc.mainScript, move);
					});
				}
			});
		}
	}

	private haveInSight(npc: NPC): boolean {
		const positionsInFront = getPositionsInFront(npc.position.positionOnMap, npc.direction, 3);
		const playerPos = this.player.position.positionOnMap;
		for (const pos of positionsInFront) {
			if (this.map.hasCollisionAt(pos)) {
				return false;
			}
			if (pos.x === playerPos.x && pos.y === playerPos.y) {
				return true;
			}
		}
		return false;
	}

	startBattle(opponent: PokemonInstance | Character, battleType: BattleType, onEnd?: () => void) {
		return this.battleService.startBattle(this, opponent, battleType, onEnd);
	}

	checkForStepInScript() {
		let stepScript: Script | undefined;
		if (this.map?.scripts && this.map.scripts?.length > 0 && !this.scriptRunner.isPlaying()) {
			stepScript = this.map.scripts.find(
				(s) =>
					s.triggerType === 'onStep' &&
					s.stepPosition?.x === this.player.position.positionOnMap.x &&
					s.stepPosition?.y === this.player.position.positionOnMap.y
			);
		}

		if ((stepScript !== undefined && !stepScript?.played) || stepScript?.replayable) {
			this.playScript(stepScript);
		}

		return stepScript;
	}

	playScript(script?: Script, previous?: Script, onEnd?: () => void, pause: boolean = true) {
		this.scriptRunner.play(script, this, this.overWorldContext, previous, onEnd, pause);
	}

	playMvts(npcs: (NPC | undefined)[]) {
		this.scriptRunner.playMovements(npcs, this);
	}

	playMapSound() {
		this.audioManager.playMapSound(this.map?.sound);
	}

	followerAt(position: Position): boolean {
		return (
			this.behindPlayerPosition()?.x === position.x && this.behindPlayerPosition()?.y === position.y
		);
	}

	behindPlayerPosition() {
		const playerPosition = this.player.position.positionOnMap;
		if (playerPosition) {
			const direction = this.player.position.direction;
			switch (direction) {
				case 'up':
					return new Position(playerPosition.x, playerPosition.y + 1);
				case 'down':
					return new Position(playerPosition.x, playerPosition.y - 1);
				case 'left':
					return new Position(playerPosition.x + 1, playerPosition.y);
				case 'right':
					return new Position(playerPosition.x - 1, playerPosition.y);
			}
		}
	}

	toSaveContext(): SaveContext {
		const save = new SaveContext(
			this.id,
			Date.now(),
			new MapSave(
				this.map.mapId,
				this.map.items.filter((i) => i.pickedUp).map((i) => i.id || 0)
			),
			this.player,
			this.boxes,
			this.settings,
			this.isNewGame,
			this.viewedGuides,
			this.POKEDEX.exportForSave(),
			this.questStates,
			this.flags,
			this.savedPlayTime + (Date.now() - this.playTimeStart)
		);

		const dc = get(dungeonContext);
		if (dc?.isDungeonMode) {
			save.dungeonSeed = dc.runSeed;
			save.dungeonFloor = dc.currentFloor;
			save.dungeonDefeated = Array.from(dc.defeatedTrainers);
			save.dungeonItems = Array.from(dc.pickedItems);
			save.dungeonCurrency = dc.runCurrency;
			save.dungeonActive = dc.isRunActive;
			save.dungeonStarterPicked = dc.starterPicked;
			save.dungeonPrologueCompleted = dc.prologueCompleted;
			save.dungeonLegendaryFloors = Array.from(dc.legendaryFloors.entries());
			save.dungeonEncounteredLegendaries = Array.from(dc.encounteredLegendaries);

			const activeSave = this.savesHolder?.getActiveSave();
			if (activeSave) {
				save.dungeonPlayerX = activeSave.dungeonPlayerX;
				save.dungeonPlayerY = activeSave.dungeonPlayerY;
				save.dungeonExplored = activeSave.dungeonExplored;
			}
		}

		return save;
	}
}
