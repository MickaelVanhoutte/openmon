import { MapSave } from '../mapping/maps';
import { Player } from '../characters/player';
import { PokemonBox } from '../pokemons/boxes';
import { Pokedex, PokemonInstance, SavedEntry, UnknownMonster } from '../pokemons/pokedex';
import { Settings } from '../characters/settings';
import { GameContext } from './gameContext';
import { get, writable, type Writable } from 'svelte/store';
import { Flags, ObjectiveState, QuestState } from '../scripting/quests';
import { QUESTS } from '../scripting/quests';

/**
 * One save in storage
 */
export class SaveContext {
	id: number = 0;
	version: number = 1;
	created: number = Date.now();
	updated: number = Date.now();
	playTime: number = 0;
	currentMap: MapSave;
	player: Player;
	boxes: Array<PokemonBox>;
	settings: Settings;
	isNewGame: boolean;
	viewedGuides: number[];
	savedEntry: SavedEntry[];
	questStates: QuestState[] = [];
	flags: Flags;
	// TODO store script played

	// Dungeon run state (optional for backward compat with old saves)
	dungeonSeed?: string; // runSeed from DungeonContext (it's a string, not number)
	dungeonFloor?: number; // currentFloor
	dungeonDefeated?: string[]; // Array from defeatedTrainers Set (Set<string>)
	dungeonItems?: string[]; // Array from pickedItems Set (Set<string>)
	dungeonCurrency?: number; // runCurrency
	dungeonActive?: boolean; // whether a dungeon run is in progress
	dungeonStarterPicked?: boolean; // whether starter ball was already picked up

	constructor(
		id: number,
		updated: number,
		currentMap: MapSave,
		player: Player,
		boxes: Array<PokemonBox>,
		settings: Settings,
		isNewGame: boolean = false,
		viewedGuides: number[] = [],
		savedEntry: SavedEntry[] = [],
		questStates: QuestState[] = [],
		flags: Flags,
		playTime: number = 0
	) {
		this.id = id;
		this.updated = updated;
		this.currentMap = currentMap;
		this.player = player;
		this.boxes = boxes;
		this.settings = settings;
		this.isNewGame = isNewGame;
		this.viewedGuides = viewedGuides;
		this.savedEntry = savedEntry;
		this.questStates = questStates;
		this.flags = flags;
		this.playTime = playTime;
	}

	toGameContext(): GameContext {
		return new GameContext(this);
	}
}

/**
 * Handles the save storage
 */
export class SavesHolder {
	POKEDEX = new Pokedex();

	saves: SaveContext[] = [];

	_selectedSave: SaveContext | undefined = undefined;
	selectedSave$: Writable<SaveContext | undefined> = writable(undefined);

	requestNexGame$: Writable<boolean> = writable(false);

	currentVersion = 1;

	constructor() {
		const savesStr = localStorage.getItem('saves');
		this.saves =
			(savesStr?.length &&
				(JSON.parse(savesStr, this.reviver) as SaveContext[]).filter(
					(s) => s.version && s.version === this.currentVersion
				)) ||
			[];
		this.saves.forEach((save) => {
			Object.setPrototypeOf(save, SaveContext.prototype);
			Object.setPrototypeOf(save.player, Player.prototype);
			save.questStates =
				save.questStates?.map((questState) => {
					Object.setPrototypeOf(questState, QuestState.prototype);
					questState.objectives = questState.objectives.map((objectiveState) => {
						Object.setPrototypeOf(objectiveState, ObjectiveState.prototype);
						return objectiveState;
					});
					return questState;
				}) || [];
			save.flags = save?.flags ? new Flags(save?.flags?.flags) : new Flags();
		});
		this.saves = this.saves.sort((a, b) => b.updated - a.updated);
	}

	/**
	 * Waits for the POKEDEX to finish loading, then rehydrates all saved pokemon
	 * data. Must be awaited before accessing saves that contain pokemon.
	 */
	async init(): Promise<void> {
		await this.POKEDEX.ensureLoaded();
		this.saves.forEach((save) => {
			save.player.setPrototypes(this.POKEDEX);
			save.boxes = save.boxes.map((box) => {
				Object.setPrototypeOf(box, PokemonBox.prototype);
				box.values = box.values.map((pkmn) => {
					if (pkmn) {
						Object.setPrototypeOf(pkmn, PokemonInstance.prototype);
						pkmn.rehydrate(this.POKEDEX);
					}
					return pkmn;
				});
				return box;
			});
		});
	}

	// TODO: fix, seems to remove the bad one
	removeSave(id: number) {
		const index = this.saves.findIndex((s) => s.id === id);
		if (index !== -1) {
			this.saves.splice(index, 1);
			this.persist();
		}
	}

	selectSave(index: number) {
		this._selectedSave = this.saves[index];
		this.selectedSave$.set(this.saves[index]);
	}

	getActiveSave(): SaveContext | undefined {
		return get(this.selectedSave$);
	}

	newGame(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): SaveContext {
		const boxes: Array<PokemonBox> = new Array<PokemonBox>(32);
		let index = 1;
		for (let i = 0; i < 32; i++) {
			const pokeArray = new Array<PokemonInstance | undefined>(20);
			for (let j = 0; j < 20; j++) {
				const result = this.POKEDEX.findById(index).result;
				if (!(result instanceof UnknownMonster)) {
					pokeArray[j] = result.instanciate(75, 30, false);
				} else {
					pokeArray[j] = undefined;
				}
				index++;
			}
			boxes[i] = new PokemonBox('Box ' + (i + 1), pokeArray);
		}

		const newId = this.saves.length > 0 ? Math.max(...this.saves.map((s) => s.id)) + 1 : 0;
		const newSave = new SaveContext(
			newId,
			Date.now(),
			new MapSave(0),
			Player.fromScratch(spriteId, name, gender),
			boxes,
			new Settings(),
			true,
			[],
			[],
			QUESTS.map((q) => q.toState()),
			new Flags()
		);
		this.saves.push(newSave);
		this.persist();
		this._selectedSave = newSave;
		this.selectedSave$.set(newSave);
		return newSave;
	}

	persist(save?: SaveContext) {
		if (save) {
			const existingSaveIndex = this.saves.findIndex((sv) => sv.id === save.id);
			if (existingSaveIndex !== -1) {
				this.saves[existingSaveIndex] = save;
			}
		}
		const encoded = JSON.stringify(this.saves, this.replacer);
		localStorage.setItem('saves', encoded);
	}

	private static readonly TRANSIENT_KEYS = new Set([
		'statCalc',
		'xpMgr',
		'moveMgr',
		'lastAttacker'
	]);

	replacer(key: any, value: any) {
		if (SavesHolder.TRANSIENT_KEYS.has(key)) {
			return undefined;
		}
		if (value instanceof Map) {
			return {
				dataType: 'Map',
				value: Array.from(value.entries()) // or with spread: value: [...value]
			};
		} else {
			return value;
		}
	}

	reviver(key: any, value: any) {
		if (typeof value === 'object' && value !== null) {
			if (value.dataType === 'Map') {
				return new Map(value.value);
			}
		}
		return value;
	}
}
