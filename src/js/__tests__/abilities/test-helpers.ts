import { vi } from 'vitest';
import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import { Weather, Terrain } from '../../battle/battle-field';

export interface TestPokemonOptions {
	ability?: string;
	name?: string;
	hp?: number;
	maxHp?: number;
	speed?: number;
	attack?: number;
	defense?: number;
	spAttack?: number;
	spDefense?: number;
	level?: number;
	types?: string[];
}

export function createTestPokemon(options: TestPokemonOptions = {}): PokemonInstance {
	const maxHp = options.maxHp || 100;
	const stats = {
		hp: maxHp,
		attack: options.attack || 100,
		defense: options.defense || 100,
		specialAttack: options.spAttack || 100,
		specialDefense: options.spDefense || 100,
		speed: options.speed || 100,
		accuracy: 100,
		evasion: 100,
		total: 600
	};

	const types = options.types || ['Normal'];

	return {
		name: options.name || 'Test Pokemon',
		nickname: options.name || 'Test Pokemon',
		currentAbility: options.ability || 'None',
		currentHp: options.hp ?? maxHp,
		level: options.level || 50,
		types: types,
		currentStats: stats,
		battleStats: stats,
		statsChanges: {
			hp: 0,
			attack: 0,
			defense: 0,
			specialAttack: 0,
			specialDefense: 0,
			speed: 0,
			accuracy: 0,
			evasion: 0,
			total: 0
		},
		fainted: false,
		status: undefined,
		volatiles: {
			has: vi.fn(() => false),
			get: vi.fn(),
			add: vi.fn(),
			remove: vi.fn()
		},
		hasType: function (type: string) {
			return types.map((t: string) => t.toLowerCase()).includes(type.toLowerCase());
		},
		changeBattleStats: vi.fn(),
		removeHp: vi.fn(),
		heal: vi.fn(),
		resetBattleStats: vi.fn(),
		updateCurrentStats: vi.fn()
	} as unknown as PokemonInstance;
}

export interface TestContextOptions {
	weather?: Weather;
	terrain?: Terrain;
	allySide?: PokemonInstance[];
	oppSide?: PokemonInstance[];
}

export function createTestBattleContext(options: TestContextOptions = {}): BattleContext {
	return {
		battleField: {
			weather: options.weather || Weather.NONE,
			terrain: options.terrain || Terrain.NONE,
			allySide: { screens: new Map(), hazards: new Map() },
			enemySide: { screens: new Map(), hazards: new Map() }
		},
		playerSide: options.allySide || [],
		oppSide: options.oppSide || [],
		actionStack: {
			push: vi.fn(),
			pop: vi.fn(),
			clear: vi.fn(),
			stack: []
		},
		addToStack: vi.fn(),
		runAbilityEvent: vi.fn(),
		runAbilityEventForAll: vi.fn()
	} as unknown as BattleContext;
}

export function mockAbilityEngine() {
	return {
		runEvent: vi.fn(),
		sortBySpeed: vi.fn((pokemon: PokemonInstance[]) => {
			return [...pokemon].sort((a, b) => b.battleStats.speed - a.battleStats.speed);
		})
	};
}
