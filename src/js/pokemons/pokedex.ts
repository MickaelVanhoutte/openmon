import { EXPERIENCE_CHART } from './experience';
import type { Effect } from './effects/types';
import { typeChart, type PokemonType } from '../battle/battle-model';
import { VolatileTracker } from './volatile-status';
import { StatCalculator } from './helpers/stat-calculator';
import { XpManager } from './helpers/xp-manager';
import { MoveManager } from './helpers/move-manager';
import type { HeldItemData } from '$js/items/held-items-model';

export class Nature {
	public id: number;
	public identifier: string;
	public decreasedStatId: string;
	public increasedStatId: string;

	constructor(id: number, identifier: string, decreasedStatId: string, increasedStatId: string) {
		this.id = id;
		this.identifier = identifier;
		this.decreasedStatId = decreasedStatId;
		this.increasedStatId = increasedStatId;
	}
}

export class SavedEntry {
	public id: number;
	public viewed: boolean;
	public caught: boolean;

	constructor(id: number, viewed: boolean, caught: boolean) {
		this.id = id;
		this.viewed = viewed;
		this.caught = caught;
	}
}

export const NATURES: Nature[] = [
	{
		id: 1,
		identifier: 'hardy',
		decreasedStatId: 'attack',
		increasedStatId: 'attack'
	},
	{
		id: 2,
		identifier: 'bold',
		decreasedStatId: 'attack',
		increasedStatId: 'defense'
	},
	{
		id: 3,
		identifier: 'modest',
		decreasedStatId: 'attack',
		increasedStatId: 'specialAttack'
	},
	{
		id: 4,
		identifier: 'calm',
		decreasedStatId: 'attack',
		increasedStatId: 'specialDefense'
	},
	{
		id: 5,
		identifier: 'timid',
		decreasedStatId: 'attack',
		increasedStatId: 'speed'
	},
	{
		id: 6,
		identifier: 'lonely',
		decreasedStatId: 'defense',
		increasedStatId: 'attack'
	},
	{
		id: 7,
		identifier: 'docile',
		decreasedStatId: 'defense',
		increasedStatId: 'defense'
	},
	{
		id: 8,
		identifier: 'mild',
		decreasedStatId: 'defense',
		increasedStatId: 'specialAttack'
	},
	{
		id: 9,
		identifier: 'gentle',
		decreasedStatId: 'defense',
		increasedStatId: 'specialDefense'
	},
	{
		id: 10,
		identifier: 'hasty',
		decreasedStatId: 'defense',
		increasedStatId: 'speed'
	},
	{
		id: 11,
		identifier: 'adamant',
		decreasedStatId: 'specialAttack',
		increasedStatId: 'attack'
	},
	{
		id: 12,
		identifier: 'impish',
		decreasedStatId: 'specialAttack',
		increasedStatId: 'defense'
	},
	{
		id: 13,
		identifier: 'bashful',
		decreasedStatId: 'specialAttack',
		increasedStatId: 'specialAttack'
	},
	{
		id: 14,
		identifier: 'careful',
		decreasedStatId: 'specialAttack',
		increasedStatId: 'specialDefense'
	},
	{
		id: 15,
		identifier: 'rash',
		decreasedStatId: 'specialDefense',
		increasedStatId: 'specialAttack'
	},
	{
		id: 16,
		identifier: 'jolly',
		decreasedStatId: 'specialAttack',
		increasedStatId: 'speed'
	},
	{
		id: 17,
		identifier: 'naughty',
		decreasedStatId: 'specialDefense',
		increasedStatId: 'attack'
	},
	{
		id: 18,
		identifier: 'lax',
		decreasedStatId: 'specialDefense',
		increasedStatId: 'defense'
	},
	{
		id: 19,
		identifier: 'quirky',
		decreasedStatId: 'specialDefense',
		increasedStatId: 'specialDefense'
	},
	{
		id: 20,
		identifier: 'naive',
		decreasedStatId: 'specialDefense',
		increasedStatId: 'speed'
	},
	{
		id: 21,
		identifier: 'brave',
		decreasedStatId: 'speed',
		increasedStatId: 'attack'
	},
	{
		id: 22,
		identifier: 'relaxed',
		decreasedStatId: 'speed',
		increasedStatId: 'defense'
	},
	{
		id: 23,
		identifier: 'quiet',
		decreasedStatId: 'speed',
		increasedStatId: 'specialAttack'
	},
	{
		id: 24,
		identifier: 'sassy',
		decreasedStatId: 'speed',
		increasedStatId: 'specialDefense'
	},
	{
		id: 25,
		identifier: 'serious',
		decreasedStatId: 'speed',
		increasedStatId: 'speed'
	}
];

export const SHINY_RATE = 2048;

export class Pokedex {
	public entries: PokedexEntry[] = [];
	private entriesById: Map<number, PokedexEntry> = new Map();
	private initialized: boolean = false;
	private initPromise: Promise<void> | null = null;

	constructor(savedEntries: SavedEntry[] = []) {
		this.initPromise = this.loadPokedex(savedEntries);
	}

	private async loadPokedex(savedEntries: SavedEntry[]): Promise<void> {
		if (this.initialized) {
			return;
		}
		const response = await fetch('./data/pokedex-game.json');
		const pokedexJson = await response.json();
		this.importFromJson(pokedexJson, savedEntries);
		this.initialized = true;
	}

	public async ensureLoaded(): Promise<void> {
		if (this.initPromise) {
			await this.initPromise;
		}
	}

	private importFromJson(json: unknown[], savedEntries: SavedEntry[] = []) {
		if (this.entries?.length === 0) {
			const savedMap = new Map(savedEntries.map((e) => [e.id, e]));
			(json as Record<string, unknown>[]).forEach((pokemon) => {
				const saved = savedMap.get(pokemon.id as number);
				const entry = new PokedexEntry(
					pokemon.id,
					pokemon.regionalId,
					pokemon.name,
					pokemon.types,
					pokemon.abilities,
					pokemon.moves,
					pokemon.stats,
					pokemon.height,
					pokemon.weight,
					pokemon.description,
					pokemon.isLegendary,
					pokemon.captureRate,
					pokemon.growthRateId,
					pokemon.baseXp,
					pokemon.percentageMale,
					pokemon.evolution,
					pokemon.sprites,
					saved?.viewed,
					saved?.caught,
					pokemon.spriteName as string | undefined
				);
				this.entries.push(entry);
				this.entriesById.set(entry.id, entry);
			});
		}
	}

	findById(id: number): PokedexSearchResult {
		if (id === undefined || id === null || id < 1) {
			return new PokedexSearchResult(new UnknownMonster());
		}
		const entry = this.entriesById.get(id);
		return entry
			? new PokedexSearchResult(entry)
			: new PokedexSearchResult(new UnknownMonster());
	}

	findByName(name: string): PokedexSearchResult[] {
		if (name === undefined || name === null || name === '') {
			return [new PokedexSearchResult(new UnknownMonster())];
		}
		const entries = this.entries.filter((entry) =>
			entry.name.toLowerCase().includes(name.toLowerCase())
		);
		return entries.map((entry) =>
			entry.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster())
		);
	}

	setViewed(id: number) {
		const entry = this.entriesById.get(id);
		if (entry) {
			entry.viewed = true;
		}
	}

	setCaught(id: number) {
		const entry = this.entriesById.get(id);
		if (entry) {
			entry.caught = true;
			entry.viewed = true;
		}
	}

	exportForSave(): SavedEntry[] {
		return this.entries.map((entry) => {
			return new SavedEntry(entry.id, entry.viewed, entry.caught);
		});
	}

	getCaught(): PokedexEntry[] {
		return this.entries.filter((entry) => entry.caught);
	}

	getViewed(): PokedexEntry[] {
		return this.entries.filter((entry) => entry.viewed);
	}
}

export class PokedexSearchResult {
	public result: PokedexEntry;
	public found: boolean = false;

	constructor(PokedexEntry: PokedexEntry) {
		this.result = PokedexEntry;
		this.found = PokedexEntry !== undefined;
	}
}

export class PokedexEntry {
	public id: number;
	public regionalId: number;
	public name: string;
	public normalizedName: string;
	public spriteName: string;
	public types: string[];
	public abilities: string[];
	public moves: Move[];
	public stats: Stats;
	public height: number;
	public weight: number;
	public description: string;
	public isLegendary: boolean;
	public captureRate: number;
	public growthRateId: number;
	public baseXp: number;
	public percentageMale: number;
	public evolution: Evolution[];
	public sprites?: Sprites;

	public viewed: boolean = false;
	public caught: boolean = false;

	constructor(
		id: number,
		regionalId: number,
		name: string,
		types: string[],
		abilities: string[],
		moves: Move[],
		stats: Stats,
		height: number,
		weight: number,
		description: string,
		isLegendary: boolean,
		captureRate: number,
		growthRateId: number,
		baseXp: number,
		percentageMale: number,
		evolution: Evolution[],
		sprites?: Sprites,
		viewed: boolean = false,
		caught: boolean = false,
		spriteName?: string
	) {
		this.id = id;
		this.regionalId = regionalId;
		this.name = name;
		this.normalizedName = name
			.replace('♀', '-f')
			.replace('♂', '-m')
			.replace('-', '')
			.replace('. ', '')
			.replace("'", '')
			.replace(' ', '')
			.replace('.', '')
			.replaceAll('é', 'e')
			.replace(':', '')
			.toLowerCase();
		this.spriteName = spriteName ?? this.normalizedName;
		this.types = types;
		this.abilities = abilities;
		this.moves = moves;
		this.stats = stats;
		this.height = height;
		this.weight = weight;
		this.description = description;
		this.isLegendary = isLegendary;
		this.captureRate = captureRate;
		this.growthRateId = growthRateId;
		this.baseXp = baseXp;
		this.percentageMale = percentageMale;
		this.evolution = evolution;
		this.sprites = sprites;
		this.viewed = viewed;
		this.caught = caught;
	}

	get weaknesses(): string[] {
		return Object.entries(typeChart)
			.filter(([_key, value]) => {
				const type0 = this.types[0] as PokemonType;
				if (this.types?.length === 1) {
					return value[type0] > 1;
				} else {
					const type1 = this.types[1] as PokemonType;
					return value[type0] * value[type1] > 1;
				}
			})
			.map(([key, _value]) => key);
	}

	get weaknessValue(): { type: string; value: number }[] {
		return Object.entries(typeChart)
			.filter(([_key, value]) => {
				const type0 = this.types[0] as PokemonType;
				if (this.types?.length === 1) {
					return value[type0] > 1;
				} else {
					const type1 = this.types[1] as PokemonType;
					return value[type0] * value[type1] > 1;
				}
			})
			.map(([key, value]) => {
				const type0 = this.types[0] as PokemonType;
				if (this.types?.length === 1) {
					return { string: key, value: value[type0] };
				} else {
					const type1 = this.types[1] as PokemonType;
					return { string: key, value: value[type0] * value[type1] };
				}
			});
	}

	public instanciate(level: number, minIv = 0, forceShiny = false): PokemonInstance {
		// random nature
		const nature = NATURES[Math.floor(Math.random() * NATURES.length)];
		const shiny = forceShiny ? forceShiny : Math.floor(Math.random() * SHINY_RATE) === 0;
		let ivs = undefined;
		if (minIv > 0) {
			ivs = new Stats(
				this.getIvFromMin(minIv),
				this.getIvFromMin(minIv),
				this.getIvFromMin(minIv),
				this.getIvFromMin(minIv),
				this.getIvFromMin(minIv),
				this.getIvFromMin(minIv)
			);
		}

		return new PokemonInstance(this, level, nature, shiny, ivs);
	}

	private getIvFromMin(min: number): number {
		return Math.floor(Math.random() * (32 - min) + min);
	}

	getSprite(): string {
		return `src/assets/monsters/showdown/ani/${this.spriteName}.gif`;
	}
}

export class UnknownMonster extends PokedexEntry {
	constructor() {
		super(0, 0, 'Unknown', [], [], [], new Stats(), 0, 0, 'Unknown', false, 0, 0, 0, 0, []);
	}
}

export class Move {
	public id: number;
	public name: string;
	public type: string;
	public category: 'physical' | 'special' | 'no-damage';
	public power: number;
	public accuracy: number;
	public pp: number;
	public priority: number;
	public target: string;
	public effect: MoveEffect;
	public effectChance: number;
	public description: string;
	public level: number;
	public method: number;

	constructor(
		id: number,
		name: string,
		type: string,
		category: 'physical' | 'special' | 'no-damage',
		power: number,
		accuracy: number,
		pp: number,
		priority: number,
		target:
			| 'all-opponents'
			| 'selected-pokemon'
			| 'users-field'
			| 'user'
			| 'user-and-allies'
			| 'entire-field'
			| 'random-opponent'
			| 'all-other-pokemon'
			| 'specific-move'
			| 'opponents-field'
			| 'ally'
			| 'all-pokemon'
			| 'user-or-ally',
		effect: MoveEffect,
		effectChance: number,
		description: string,
		level: number,
		method: number = 1
	) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.category = category;
		this.power = power;
		this.accuracy = accuracy;
		this.pp = pp;
		this.priority = priority;
		this.target = target;
		this.effect = effect;
		this.effectChance = effectChance;
		this.description = description;
		this.level = level;
		this.method = method;
	}
}

export class MoveEffect {
	move_effect_id: number;
	local_language_id: number;
	short_effect: string;
	effect: string;

	constructor(
		move_effect_id: number,
		local_language_id: number,
		short_effect: string,
		effect: string
	) {
		this.move_effect_id = move_effect_id;
		this.local_language_id = local_language_id;
		this.short_effect = short_effect;
		this.effect = effect;
	}

	public apply(target: PokemonInstance[]) {
		// Effect chance is applied earlier since info is on the move
	}
}

export class Stats {
	public hp: number;
	public attack: number;
	public defense: number;
	public specialAttack: number;
	public specialDefense: number;
	public speed: number;
	public total: number;

	public accuracy: number;
	public evasion: number;

	constructor(
		hp: number = 0,
		attack: number = 0,
		defense: number = 0,
		specialAttack: number = 0,
		specialDefense: number = 0,
		speed: number = 0,
		evasion: number = 0,
		accuracy: number = 0,
		total?: number
	) {
		this.hp = hp;
		this.attack = attack;
		this.defense = defense;
		this.specialAttack = specialAttack;
		this.specialDefense = specialDefense;
		this.speed = speed;
		if (total) {
			this.total = total;
		} else {
			this.total =
				this.hp +
				this.attack +
				this.defense +
				this.specialAttack +
				this.specialDefense +
				this.speed;
		}
		this.accuracy = accuracy;
		this.evasion = evasion;
	}
}

export class Evolution {
	public id: number;
	public level: number;
	public method: string;

	constructor(nextId: number, level: number, method: string) {
		this.id = nextId;
		this.level = level;
		this.method = method;
	}
}

export class Sprites {
	public male: {
		front: SpriteGroup;
		back: SpriteGroup;
	};
	public female: {
		front: SpriteGroup;
		back: SpriteGroup;
	};

	constructor(
		male: {
			front: SpriteGroup;
			back: SpriteGroup;
		},
		female: {
			front: SpriteGroup;
			back: SpriteGroup;
		}
	) {
		this.male = male;
		this.female = female;
	}
}

export class SpriteGroup {
	frame1: string;
	frame2?: string;
	shiny1: string;
	shiny2?: string;

	constructor(frame1: string, shiny1: string, shiny2?: string, frame2?: string) {
		this.frame1 = frame1;
		this.frame2 = frame2;
		this.shiny1 = shiny1;
		this.shiny2 = shiny2;
	}
}

export class ComboMove extends Move {
	public pokemon2: PokemonInstance;
	public effects: MoveEffect[] = [];
	public effectsChances: number[] = [];
	public move1: MoveInstance;
	public move2: MoveInstance;

	constructor(move1: MoveInstance, move2: MoveInstance, pokemon2: PokemonInstance) {
		super(
			-1,
			`Combo ${move1.name} + ${move2.name}`,
			move1.type,
			move1.category,
			move1.power,
			100,
			move1.pp,
			move1.priority,
			move1.target as
				| 'all-opponents'
				| 'selected-pokemon'
				| 'users-field'
				| 'user'
				| 'user-and-allies'
				| 'entire-field'
				| 'random-opponent'
				| 'all-other-pokemon'
				| 'specific-move'
				| 'opponents-field'
				| 'ally'
				| 'all-pokemon'
				| 'user-or-ally',
			move1.effect,
			move1.effectChance * 1.5 > 100 ? 100 : move1.effectChance * 1.5,
			`Combo`,
			move1.level
		);
		this.move1 = move1;
		this.move2 = move2;
		this.pokemon2 = pokemon2;
		this.effects.push(move1.effect);
		this.effects.push(move2.effect);
		// effectChance haves 50% bonus (max 100%)
		this.effectsChances.push(move1.effectChance * 1.5 > 100 ? 100 : move1.effectChance * 1.5);
		this.effectsChances.push(move2.effectChance * 1.5 > 100 ? 100 : move2.effectChance * 1.5);
	}
}

export class MoveInstance extends Move {
	public currentPp: number;

	constructor(
		id: number,
		name: string,
		type: string,
		category: 'physical' | 'special' | 'no-damage',
		power: number,
		accuracy: number,
		pp: number,
		priority: number,
		target: string,
		effect: MoveEffect,
		effectChance: number,
		description: string,
		level: number
	) {
		super(
			id,
			name,
			type,
			category,
			power,
			accuracy,
			pp,
			priority,
			target as
				| 'all-opponents'
				| 'selected-pokemon'
				| 'users-field'
				| 'user'
				| 'user-and-allies'
				| 'entire-field'
				| 'random-opponent'
				| 'all-other-pokemon'
				| 'specific-move'
				| 'opponents-field'
				| 'ally'
				| 'all-pokemon'
				| 'user-or-ally',
			effect,
			effectChance,
			description,
			level
		);
		this.currentPp = pp;
	}

	toJSON() {
		return {
			id: this.id,
			currentPp: this.currentPp
		};
	}
}

export class PokemonInstance {
	/** Reference to the species data. Set by constructor or rehydrate(). */
	public entry!: PokedexEntry;
	public id: number;

	// Delegate PokedexEntry properties via getters (composition over inheritance)
	get regionalId() { return this.entry.regionalId; }
	get name() { return this.entry.name; }
	get normalizedName() { return this.entry.normalizedName; }
	get spriteName() { return this.entry.spriteName; }
	get types() { return this.entry.types; }
	get abilities() { return this.entry.abilities; }
	get stats() { return this.entry.stats; }
	get height() { return this.entry.height; }
	get weight() { return this.entry.weight; }
	get description() { return this.entry.description; }
	get isLegendary() { return this.entry.isLegendary; }
	get captureRate() { return this.entry.captureRate; }
	get growthRateId() { return this.entry.growthRateId; }
	get baseXp() { return this.entry.baseXp; }
	get percentageMale() { return this.entry.percentageMale; }
	get evolution() { return this.entry.evolution; }
	get sprites() { return this.entry.sprites; }
	get weaknesses() { return this.entry.weaknesses; }
	get weaknessValue() { return this.entry.weaknessValue; }

	// Instance-specific state
	public currentStats: Stats = new Stats();
	public statsChanges: Stats = new Stats();
	public currentHp: number = 1;
	public currentXp: number = 0;
	public xpToNextLevel: number = 0;
	public currentAbility: string = '';
	public level: number = 1;
	public evsToDistribute: number = 510;
	public fainted: boolean = false;
	public moves: MoveInstance[] = [];
	public ivs: Stats = new Stats();
	public evs: Stats = new Stats();
	public nature!: Nature;
	public gender!: 'male' | 'female' | 'unknown';
	public heldItem: HeldItemData | undefined = undefined;
	public choiceLockedMove: string | undefined = undefined;
	public lastMove?: MoveInstance;
	public lastDamageTaken?: number;
	public lastAttacker?: PokemonInstance;
	public lastHitCritical?: boolean;
	public selectedMove?: MoveInstance;

	public isShiny: boolean = false;

	public status?: Effect;
	public volatiles: VolatileTracker = new VolatileTracker();

	private statCalc!: StatCalculator;
	private xpMgr!: XpManager;
	private moveMgr!: MoveManager;

	get spriteScale(): number {
		return 1;
	}

	get totalEvs(): number {
		return (
			this.evs.attack +
			this.evs.defense +
			this.evs.specialAttack +
			this.evs.specialDefense +
			this.evs.speed +
			this.evs.hp
		);
	}

	get battleStats(): Stats {
		return this.statCalc.computeBattleStats();
	}

	constructor(
		pokedexEntry: PokedexEntry,
		level: number,
		nature: Nature,
		shiny: boolean,
		ivs?: Stats,
		fromInstance?: PokemonInstance
	) {
		this.entry = pokedexEntry;
		this.id = pokedexEntry.id;

		this.statCalc = new StatCalculator(this);
		this.xpMgr = new XpManager(this);
		this.moveMgr = new MoveManager(this);

		if (fromInstance) {
			// keep current if exists or random from new abilities
			this.currentAbility = pokedexEntry.abilities.includes(fromInstance.currentAbility)
				? fromInstance.currentAbility
				: pokedexEntry.abilities[Math.floor(Math.random() * pokedexEntry.abilities.length)];
			this.evs = fromInstance.evs;
			this.ivs = fromInstance.ivs;
			this.nature = fromInstance.nature;
			this.level = fromInstance.level;
			this.currentXp = fromInstance.currentXp;
			this.currentHp = fromInstance.currentHp;
			this.updateCurrentStats();
			this.moves = fromInstance.moves;
			this.isShiny = fromInstance.isShiny;
			this.gender = fromInstance.gender;
			this.evsToDistribute = fromInstance.evsToDistribute;
			this.heldItem = fromInstance.heldItem;
			this.lastMove = fromInstance.lastMove;
		} else {
			this.currentAbility = this.abilities[Math.floor(Math.random() * this.abilities.length)];
			this.evs = new Stats();
			this.ivs =
				ivs !== undefined
					? ivs
					: new Stats(
							Math.floor(Math.random() * 32),
							Math.floor(Math.random() * 32),
							Math.floor(Math.random() * 32),
							Math.floor(Math.random() * 32),
							Math.floor(Math.random() * 32),
							Math.floor(Math.random() * 32)
						);
			this.level = level || 5;
			this.currentXp = 0;
			this.nature = nature;

			this.updateCurrentStats();
			this.currentHp = this.currentStats.hp;
			this.moves = this.selectLatestMoves(pokedexEntry);
			this.isShiny = shiny;

			// random gender based on percentageMale attr (0-100)
			this.gender = this.percentageMale
				? Math.random() * 100 < this.percentageMale
					? 'male'
					: 'female'
				: 'unknown';
		}
	}

	public rehydrate(pokedex?: Pokedex): void {
		if (pokedex) {
			// Composition: just set the entry reference instead of copying every field
			this.entry = pokedex.findById(this.id).result;

			const savedMoves = this.moves as unknown as { id: number; currentPp: number }[];
			this.moves = savedMoves
				.map((saved) => {
					const move = this.entry.moves.find((m) => m.id === saved.id);
					if (!move) {
						return undefined;
					}
					const instance = Object.create(MoveInstance.prototype) as MoveInstance;
					Object.assign(instance, move);
					instance.currentPp = saved.currentPp;
					return instance;
				})
				.filter((m): m is MoveInstance => m !== undefined);
		}

		this.statCalc = new StatCalculator(this);
		this.xpMgr = new XpManager(this);
		this.moveMgr = new MoveManager(this);

		if (
			this.heldItem &&
			typeof this.heldItem === 'object' &&
			Object.keys(this.heldItem as object).length === 0
		) {
			this.heldItem = undefined;
		}

		this.statsChanges = new Stats();
		this.volatiles = new VolatileTracker();
	}

	toJSON() {
		return {
			id: this.id,
			currentStats: this.currentStats,
			currentHp: this.currentHp,
			currentXp: this.currentXp,
			xpToNextLevel: this.xpToNextLevel,
			currentAbility: this.currentAbility,
			level: this.level,
			evsToDistribute: this.evsToDistribute,
			fainted: this.fainted,
			moves: this.moves,
			ivs: this.ivs,
			evs: this.evs,
			nature: this.nature,
			gender: this.gender,
			heldItem: this.heldItem,
			isShiny: this.isShiny,
			status: this.status
		};
	}

	public changeBattleStats(
		stat:
			| 'hp'
			| 'attack'
			| 'defense'
			| 'specialAttack'
			| 'specialDefense'
			| 'speed'
			| 'evasion'
			| 'accuracy',
		value: number
	) {
		this.statCalc.changeBattleStats(stat, value);
	}

	public resetBattleStats() {
		this.statCalc.resetBattleStats();
	}

	public selectMove(iaLvl: 'Random' | 'Easy', target?: PokemonInstance): MoveInstance {
		return this.moveMgr.selectMove(iaLvl, target);
	}

	public canEvolve() {
		return this.xpMgr.canEvolve();
	}

	public removeHp(hp: number) {
		this.currentHp = Math.max(0, this.currentHp - hp);
		if (isNaN(this.currentHp) || this.currentHp <= 0) {
			this.currentHp = 0;
			this.fainted = true;
		}
	}

	public heal(hp: number) {
		this.currentHp += hp;
		if (this.currentHp > this.currentStats.hp) {
			this.currentHp = this.currentStats.hp;
		}
	}

	fullHeal() {
		this.revive(this.currentStats.hp);
	}

	public revive(hp: number) {
		this.fainted = false;
		this.currentHp = hp;
	}

	public howMuchXpWon(
		_opponent: PokemonInstance,
		participated: number = 1,
		fromTrainer: boolean = false,
		xpShare: boolean
	): number {
		return this.xpMgr.howMuchXpWon(participated, fromTrainer, xpShare);
	}

	public addXpResult(
		totalXp: number,
		evs: number
	): { levelup: boolean; xpLeft: number; newMove: string[] } {
		return this.xpMgr.addXpResult(totalXp, evs);
	}

	public addEv(
		ev: 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed',
		value: number
	) {
		this.xpMgr.addEv(ev, value);
	}

	public levelUp(): { oldStats?: Stats; newStats?: Stats; moves?: Move[] } {
		return this.xpMgr.levelUp();
	}

	evolve(future: PokedexSearchResult): PokemonInstance {
		if (future.found && future.result) {
			return new PokemonInstance(
				future.result,
				this.level,
				this.nature,
				this.isShiny,
				undefined,
				this
			);
		}
		return this;
	}

	public updateCurrentStats() {
		this.currentStats = this.statCalc.computeFromBaseStats();
		this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, this.growthRateId);
	}

	public hasEffect(effectName: string): boolean {
		return this.status?.constructor.name === effectName;
	}

	public hasItem(itemName: string): boolean {
		return this.heldItem?.name === itemName;
	}

	public consumeHeldItem(): void {
		this.heldItem = undefined;
	}

	private selectLatestMoves(pokedexEntry: PokedexEntry) {
		return this.moveMgr.selectLatestMoves(pokedexEntry);
	}

	public getSprite(back?: boolean): string {
		const dir = this.isShiny
			? (back ? 'ani-back-shiny' : 'ani-shiny')
			: (back ? 'ani-back' : 'ani');
		return `src/assets/monsters/showdown/${dir}/${this.spriteName}.gif`;
	}

	public hasType(type: string): boolean {
		return this.types.includes(type);
	}

	public restoreHp(amount: number) {
		this.heal(amount);
	}

	public setHp(amount: number) {
		this.currentHp = Math.min(amount, this.currentStats.hp);
		if (this.currentHp <= 0) {
			this.currentHp = 0;
			this.fainted = true;
		}
	}
}
