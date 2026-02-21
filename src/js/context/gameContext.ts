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
import { CustomScriptable, Dialog, Message, Script } from '../scripting/scripts';
import { OverworldItem } from '../items/overworldItem';
import { SeededRNG } from '../dungeon/prng';
import { NPC } from '../characters/npc';
import { ItemsReferences } from '../items/items';
import { get, writable, type Writable } from 'svelte/store';
import { SaveContext, SavesHolder } from './savesHolder';
import type { Jonction } from '../mapping/collisions';
import { OverworldSpawn } from '../characters/overworld-spawn';
import { Flags, ObjectiveState, Quest, QuestState } from '../scripting/quests';
import { Notifications } from '../scripting/notifications';
import { BattleType } from '../battle/battle-model';
import { AudioManager, QuestManager, ScriptRunner, SoundManager } from './managers';

import { DungeonContext, dungeonContext } from '../dungeon/dungeon-context';
import { generateFloor } from '../dungeon/floor-generator';
import { generateRestFloor, generateBossFloor } from '../dungeon/special-floors';
import { getBiomeForFloor } from '../dungeon/biomes';
import { populateFloor } from '../dungeon/trainer-factory';
import { placeItems as placeDungeonItems } from '../dungeon/item-placer';
import { persistDungeonState } from '../dungeon/dungeon-save';
import {
	registerThrelteMap,
	clearThrelteMapCache,
	getThrelteMap
} from '../mapping/threlte-maps/threlte-map-registry';
import { TileType3D } from '../mapping/threlte-maps/types';
import { getPositionsInFront } from './helpers/movement-helpers';
import {
	registerPrologueMap,
	PROLOGUE_MAP_ID,
	PROLOGUE_WAKE_UP_POS
} from '../mapping/prologue-map';
import { DEBUG } from '../env';

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

	hasEvolutions: boolean = false;
	spawned?: OverworldSpawn;

	// Guides
	//tg: TourGuideClient;
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

		// Sync quest data from manager to GameContext (for backwards compatibility)
		this.questStates = this.questManager.questStates;
		this.quests = this.questManager.quests;
		this.currentQuest = this.questManager.currentQuest;
		this.flags = this.questManager.flags;

		// Index scripts using ScriptRunner
		const allScripts = this.scriptRunner.collectAllScripts(this.map.scripts, this.map.npcs);
		this.scriptRunner.indexScripts(allScripts);

		this.bindKeys();
		this.checkForGameStart();
		this.loadMap(this.map);
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
		// if(this.weather){
		//     if(this.weather.running){
		//         // check date to stop it
		//         let stop = false;
		//         if(stop){
		//             this.weather.running = false;
		//         }
		//     }
		// }else {

		// }
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

	/**
	 * Updates the menuAvailability$ store with current availability for all menu types.
	 * Call this whenever quest objectives change.
	 */
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

				// interactive behind counters
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
		// Allow direction changes to be queued even while moving
		if (value && !this.overWorldContext.getPaused()) {
			this.player.position.targetDirection = direction;
		}

		// Block movement input while still moving between tiles
		if (
			this.player.position.positionOnMap.x !== this.player.position.targetPosition.x ||
			this.player.position.positionOnMap.y !== this.player.position.targetPosition.y
		) {
			return;
		}

		if (value && !this.overWorldContext.getPaused()) {
			// Apply queued direction change
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

			if (!this.map.hasBoundaryAt(futurePosition)) {
				if (this.currentQuest && this.hasQuestLimit(futurePosition)) {
					this.playScript(
						new Script('onStep', [new Dialog([new Message(this.currentQuest.leaveMessage)])])
					);
				} else {
					this.player.moving = true;
					this.player.position.setFuturePosition(futureX, futureY, () => {
						// on reach destination
						this.checkForStepInScript();
						this.checkForJunction();
						this.checkForStairs();
						this.checkForBattle();
						this.checkForInSight();

						// wait for the follower to end it's movement before setting next

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

	checkForGameStart(): boolean {
		if (this.isNewGame && !this.overWorldContext.scenes.wakeUp) {
			const dc = get(dungeonContext);

			if (dc && !dc.prologueCompleted) {
				const prologueTemplate = this.MAPS[PROLOGUE_MAP_ID];
				if (prologueTemplate) {
					this.map = OpenMap.fromInstance(prologueTemplate, PROLOGUE_WAKE_UP_POS);
					this.player.position = new CharacterPosition(PROLOGUE_WAKE_UP_POS);
				}
				this.overWorldContext.startScene(SceneType.PROLOGUE);

				setTimeout(() => {
					this.overWorldContext.endScene(SceneType.PROLOGUE);
					this.isNewGame = false;
				}, 5000);

				return true;
			}

			const script = this.scriptRunner.getByTrigger('onGameStart');
			this.overWorldContext.startScene(SceneType.WAKE_UP);

			setTimeout(() => {
				this.overWorldContext.endScene(SceneType.WAKE_UP);
				this.isNewGame = false;
				if (script) {
					this.playScript(script, undefined, () => {
						this.questManager.notifyCurrentQuest();
					});
				}
			}, 5000);

			return true;
		} else {
			this.questManager.notifyCurrentQuest();
		}
		return false;
	}

	checkForJunction() {
		if (this.map === undefined) {
			return;
		}
		const jonction = this.map.jonctionAt(this.player.position.positionOnMap);
		if (jonction !== undefined) {
			this.changeMap(jonction);
		}
	}

	changeMap(jonction: Jonction) {
		// Fade out map audio
		this.audioManager.fadeOutMapSound();

		// Stop all scripts
		this.scriptRunner.interruptCurrent();
		this.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());

		// Clear script index and re-index for new map
		this.scriptRunner.clear();

		const map = OpenMap.fromInstance(this.MAPS[jonction.mapIdx], new Position(0, 0));
		this.player.position.setPosition(jonction.start || new Position(0, 0));
		this.loadMap(map);
	}

	playMapSound() {
		this.audioManager.playMapSound(this.map?.sound);
	}

	loadMap(map: OpenMap) {
		this.overWorldContext.changingMap = true;
		//overworldContext.displayChangingMap = true;

		let onEnterScript: Script | undefined;
		if (map.scripts && map.scripts?.length > 0) {
			onEnterScript = map.scripts?.find((s) => s.triggerType === 'onEnter');
		}

		const npcOnEnter = map.npcs?.filter((npc) => npc.movingScript);

		this.map = map;
		this.overWorldContext.map = map;

		// Re-index scripts for the new map
		const allScripts = this.scriptRunner.collectAllScripts(map.scripts, map.npcs);
		this.scriptRunner.indexScripts(allScripts);

		setTimeout(() => {
			this.overWorldContext.changingMap = false;

			this.playMapSound();

			if (onEnterScript) {
				this.playScript(onEnterScript);
			}
			if (npcOnEnter?.length > 0) {
				this.scriptRunner.playMovements(npcOnEnter, this);
			}
		}, 1000);
		setTimeout(() => {
			//overworldContext.displayChangingMap = false;
			//checkForGameStart();
		}, 2000);
	}

	checkForStepInScript() {
		let stepScript: Script | undefined;
		if (this.map?.scripts && this.map.scripts?.length > 0 && !this.scriptRunner.isPlaying()) {
			// TODO allow range of positions
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

	/*
    Battle start
     */
	checkForBattle() {
		const dc = get(dungeonContext);
		const encounterRate =
			dc?.isDungeonMode && dc?.isRunActive ? getBiomeForFloor(dc.currentFloor).encounterRate : 0.07;

		if (
			this.map &&
			this.map.hasBattleZoneAt(this.player.position.positionOnMap) &&
			Math.random() < encounterRate
		) {
			const monster = this.map.randomMonster();

			let level: number;
			if (dc?.isDungeonMode && dc?.isRunActive) {
				const variance = Math.floor(Math.random() * 3) - 1;
				level = Math.max(1, Math.min(dc.currentFloor + 2 + variance, 100));
			} else {
				level =
					Math.floor(
						this.player.monsters.reduce((acc, pkmn) => acc + pkmn.level, 0) /
							this.player.monsters.length
					) - 1;
			}

			this.startBattle(
				this.POKEDEX.findById(monster.id).result.instanciate(level),
				BattleType.SINGLE
			);
		}
	}

	checkForStairs() {
		const dc = get(dungeonContext);
		if (!dc?.isDungeonMode) {
			return;
		}

		const threlteMap = getThrelteMap(this.map.mapId);
		if (!threlteMap) {
			return;
		}

		const px = this.player.position.positionOnMap.x;
		const py = this.player.position.positionOnMap.y;

		if (
			py >= 0 &&
			py < threlteMap.tiles.length &&
			px >= 0 &&
			px < threlteMap.tiles[py].length &&
			threlteMap.tiles[py][px] === TileType3D.STAIRS_DOWN
		) {
			if (dc.isFloorBoss(dc.currentFloor)) {
				const bossId = `boss_floor_${dc.currentFloor}`;
				if (!dc.defeatedTrainers.has(bossId)) {
					this.playScript(
						new Script('onStep', [
							new Dialog([new Message('The way forward is blocked. Defeat the boss first!')])
						])
					);
					return;
				}
			}

			this.changeDungeonFloor(dc);
		}
	}

	private generateDungeonFloorData(dungeonCtx: DungeonContext) {
		const floor = dungeonCtx.currentFloor;

		if (dungeonCtx.isFloorRest(floor)) {
			return generateRestFloor(floor, dungeonCtx.runSeed);
		}

		if (dungeonCtx.isFloorBoss(floor)) {
			return generateBossFloor(floor, dungeonCtx.runSeed);
		}

		const biome = getBiomeForFloor(floor);
		const floorData = generateFloor(dungeonCtx.runSeed, floor, biome);

		if (floor === 1 && !dungeonCtx.starterPicked && !dungeonCtx.prologueCompleted) {
			const STARTERS = [1, 4, 7];
			const rng = new SeededRNG(dungeonCtx.runSeed + '-starter');
			const starterId = rng.pick(STARTERS);
			const starterBall = new OverworldItem(
				'Pokeball',
				true,
				floorData.starterItemPosition,
				'src/assets/menus/pokeball.png',
				undefined,
				[
					new Script('onInteract', [
						new Dialog([new Message('You found a starter Pokemon!', 'System')]),
						new CustomScriptable((ctx: GameContext) => {
							const pokemon = ctx.POKEDEX.findById(starterId).result?.instanciate(5);
							if (pokemon) {
								ctx.player.monsters.push(pokemon);
								ctx.player.setFollower(pokemon);
								ctx.POKEDEX.setCaught(starterId);
								dungeonCtx.starterPicked = true;
								ctx.updateMenuAvailability();
							}
						})
					])
				]
			);
			floorData.openMap.items.push(starterBall);
		}

		const populateRng = new SeededRNG(dungeonCtx.runSeed + '-populate-' + floor);
		const npcs = populateFloor(floorData, floor, biome, populateRng);
		floorData.openMap.npcs.push(...npcs);
		const dungeonItems = placeDungeonItems(floorData.itemPositions, floor, populateRng);
		floorData.openMap.items.push(...dungeonItems);

		return floorData;
	}

	changeDungeonFloor(dungeonCtx: DungeonContext, savesHolder?: SavesHolder) {
		if (!dungeonCtx.prologueCompleted && this.map?.mapId === PROLOGUE_MAP_ID) {
			dungeonCtx.advanceFloor();

			const floorData = this.generateDungeonFloorData(dungeonCtx);

			registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
			this.MAPS[floorData.openMap.mapId] = floorData.openMap;

			dungeonContext.set(dungeonCtx);
			if (savesHolder) {
				persistDungeonState(dungeonCtx, savesHolder);
			}
			return;
		}

		this.overWorldContext.setPaused(true, 'dungeon-floor-transition');
		this.audioManager.fadeOutMapSound();

		this.scriptRunner.interruptCurrent();
		this.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		this.scriptRunner.clear();

		this.overWorldContext.changingMap = true;

		setTimeout(() => {
			const previousMapId = 1000 + dungeonCtx.currentFloor;

			dungeonCtx.advanceFloor();

			const floorData = this.generateDungeonFloorData(dungeonCtx);

			clearThrelteMapCache(previousMapId);

			registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
			this.MAPS[floorData.openMap.mapId] = floorData.openMap;

			this.map = floorData.openMap;
			this.overWorldContext.map = floorData.openMap;
			this.player.position.setPosition(floorData.playerStart);

			const allScripts = this.scriptRunner.collectAllScripts(
				floorData.openMap.scripts,
				floorData.openMap.npcs
			);
			this.scriptRunner.indexScripts(allScripts);

			dungeonContext.set(dungeonCtx);

			if (savesHolder) {
				persistDungeonState(dungeonCtx, savesHolder);
			}

			setTimeout(() => {
				this.overWorldContext.changingMap = false;
				this.overWorldContext.setPaused(false, 'dungeon-floor-transition');
				this.playMapSound();
			}, 500);
		}, 500);
	}

	/**
	 * Debug-only: teleport directly to any floor number without walking stairs.
	 * Sets currentFloor directly, generates the floor, and transitions the map.
	 */
	jumpToFloor(targetFloor: number, dungeonCtx: DungeonContext) {
		if (!dungeonCtx.isRunActive) return;

		this.overWorldContext.setPaused(true, 'dungeon-floor-transition');
		this.audioManager.fadeOutMapSound();
		this.scriptRunner.interruptCurrent();
		this.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		this.scriptRunner.clear();
		this.overWorldContext.changingMap = true;

		setTimeout(() => {
			const previousMapId = 1000 + dungeonCtx.currentFloor;

			dungeonCtx.currentFloor = targetFloor;
			dungeonCtx.currentBiome = getBiomeForFloor(targetFloor);

			const floorData = this.generateDungeonFloorData(dungeonCtx);

			clearThrelteMapCache(previousMapId);
			registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
			this.MAPS[floorData.openMap.mapId] = floorData.openMap;

			this.map = floorData.openMap;
			this.overWorldContext.map = floorData.openMap;
			this.player.position.setPosition(floorData.playerStart);

			const allScripts = this.scriptRunner.collectAllScripts(
				floorData.openMap.scripts,
				floorData.openMap.npcs
			);
			this.scriptRunner.indexScripts(allScripts);

			dungeonContext.set(dungeonCtx);

			setTimeout(() => {
				this.overWorldContext.changingMap = false;
				this.overWorldContext.setPaused(false, 'dungeon-floor-transition');
				this.playMapSound();
			}, 500);
		}, 500);
	}

	restartDungeonFloor(dungeonCtx: DungeonContext) {
		this.overWorldContext.changingMap = true;

		this.scriptRunner.interruptCurrent();
		this.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		this.scriptRunner.clear();

		const currentMapId = 1000 + dungeonCtx.currentFloor;

		dungeonCtx.defeatedTrainers.clear();
		dungeonCtx.pickedItems.clear();

		const floorData = this.generateDungeonFloorData(dungeonCtx);

		clearThrelteMapCache(currentMapId);

		registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
		this.MAPS[floorData.openMap.mapId] = floorData.openMap;

		this.map = floorData.openMap;
		this.overWorldContext.map = floorData.openMap;
		this.player.position.setPosition(floorData.playerStart);

		const allScripts = this.scriptRunner.collectAllScripts(
			floorData.openMap.scripts,
			floorData.openMap.npcs
		);
		this.scriptRunner.indexScripts(allScripts);

		dungeonContext.set(dungeonCtx);

		setTimeout(() => {
			this.overWorldContext.changingMap = false;
		}, 500);
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

					setTimeout(() => {
						npc.alerted = false;
						const move = npc.movingScript?.interrupt();
						this.playScript(npc.mainScript, move);
					}, 600);
				}
			});
		}
	}

	private haveInSight(npc: NPC): boolean {
		// player is in sight if the npc looks in his direction and is within 3 tiles
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
		this.overWorldContext.setPaused(true, 'battle-start gameContext');

		// Handle audio transition to battle
		this.audioManager.startBattleTransition();

		setTimeout(() => {
			this.audioManager.playBattleMusic();
		}, 1500);

		if (battleType === BattleType.DOUBLE && this.player.monsters.length < 2) {
			battleType = BattleType.SINGLE;
		}

		if (opponent instanceof NPC && opponent?.monsterIds?.length > 0) {
			if (opponent.dungeonTeam && opponent.dungeonTeam.length > 0) {
				opponent.monsters = opponent.dungeonTeam.map((config) => {
					const pokemon = this.POKEDEX.findById(config.speciesId).result.instanciate(config.level);
					if (config.heldItemId) {
						const heldItem = this.ITEMS.getHeldItemById(config.heldItemId);
						if (heldItem) {
							pokemon.heldItem = heldItem;
						}
					}
					return pokemon;
				});
			} else {
				opponent.monsters = opponent.monsterIds.map((id) => {
					let level = Math.floor(
						this.player.monsters.reduce((acc, pkmn) => acc + pkmn.level, 0) /
							this.player.monsters.length
					);
					// randomly add -1 to 2 levels
					level += Math.floor(Math.random() * 4) - 1;
					return this.POKEDEX.findById(id).result.instanciate(level);
				});
			}
		}

		const battleContext = new BattleContext(this.player, opponent, this.settings, battleType);
		const unsubscribe = battleContext.events.end.subscribe((result) => {
			if (result) {
				this.audioManager.fadeOutBattleMusic();

				battleContext.events.ending.set(true);

				if (opponent instanceof PokemonInstance) {
					this.POKEDEX.setViewed(opponent.id);
				} else {
					opponent.monsters.forEach((pkmn) => this.POKEDEX.setViewed(pkmn.id));
				}

				unsubscribe();
				try {
					if (!result.win) {
						const dc = get(dungeonContext);
						if (dc?.isDungeonMode && dc?.isRunActive) {
							this.player.monsters.forEach((pkmn) => {
								pkmn.fullHeal();
							});
							this.restartDungeonFloor(dc);
						} else {
							// tp back to the start // TODO pokecenter position
							this.player.position.positionOnMap = this.map.playerInitialPosition;
							this.player.monsters.forEach((pkmn) => {
								pkmn.fullHeal();
							});
						}
					} else if (result.win && opponent instanceof PokemonInstance && !result.caught) {
						// Wild battle win (KO, not catch): grant money based on opponent level
						const reward = Math.floor(opponent.level * 10 + 20);
						this.player.bag.money += reward;
					}

					if (result.caught) {
						this.POKEDEX.setCaught(result.caught.id);
						// add caught pokemon to team if space or in the box
						if (this.player.monsters.length < 6) {
							this.player.monsters.push(result.caught);
						} else {
							const availableBox = this.boxes.find((box) => !box.isFull());
							if (availableBox) {
								availableBox.add(result.caught);
							}
						}
						if (!this.player.follower) {
							this.player.setFollower(result.caught);
						}
					}
				} catch (e) {
					console.error('Error during battle end handling:', e);
				} finally {
					setTimeout(() => {
						this.playMapSound();
					}, 1000);

					setTimeout(() => {
						// End of battle, 2 sec later for fade out
						this.overWorldContext.setPaused(false, 'battle-end gameContext');
						this.battleContext.set(undefined);
						this.audioManager.stopBattleMusic();
						this.hasEvolutions = this.player.monsters.some(
							(pkmn) => battleContext.leveledUpMonsterIds.has(pkmn.id) && pkmn.canEvolve()
						);
						if (onEnd) {
							onEnd();
						}
					}, 2000);
				}
			}
		});

		const unsubscribe2 = setInterval(() => {
			if (!this.player.moving) {
				this.battleContext.set(battleContext);
				battleContext.events.starting.set(true);
				clearInterval(unsubscribe2);
			}
		}, 200);
	}

	playScript(script?: Script, previous?: Script, onEnd?: () => void, pause: boolean = true) {
		this.scriptRunner.play(script, this, this.overWorldContext, previous, onEnd, pause);
	}

	playMvts(npcs: (NPC | undefined)[]) {
		this.scriptRunner.playMovements(npcs, this);
	}

	// TODO : rework following code
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
		}

		return save;
	}
}
