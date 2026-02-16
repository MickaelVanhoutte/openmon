import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deltaStream } from '../../battle/abilities/tiers/tier2-on-switch';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import { BattleField, Weather } from '../../battle/battle-field';
import { typeChart, type PokemonType } from '../../battle/battle-model';
import { Attack } from '../../battle/actions/actions-selectable';

describe('Delta Stream Ability', () => {
	let mockBattleContext: BattleContext;
	let battleField: BattleField;
	let deltaStreamPokemon: PokemonInstance;

	beforeEach(() => {
		battleField = new BattleField();

		deltaStreamPokemon = {
			name: 'Rayquaza',
			types: ['dragon', 'flying'],
			fainted: false
		} as unknown as PokemonInstance;

		mockBattleContext = {
			addToStack: vi.fn(),
			battleField,
			oppSide: []
		} as unknown as BattleContext;
	});

	it('should have correct metadata', () => {
		expect(deltaStream.id).toBe(191);
		expect(deltaStream.name).toBe('Delta Stream');
		expect(deltaStream.description).toBe(
			'Summons strong winds that weaken Flying-type weaknesses.'
		);
	});

	it('should set STRONG_WINDS weather on switch-in', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: deltaStreamPokemon
		};

		deltaStream.onSwitchIn?.(ctx);

		expect(battleField.weather).toBe(Weather.STRONG_WINDS);
	});

	it('should display the correct message on switch-in', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: deltaStreamPokemon
		};

		deltaStream.onSwitchIn?.(ctx);

		expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
			expect.objectContaining({
				description: 'A mysterious air current is protecting Flying-type Pokemon!'
			})
		);
	});

	it('should return true to show popup', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: deltaStreamPokemon
		};

		const result = deltaStream.onSwitchIn?.(ctx);

		expect(result).toBe(true);
	});

	it('should set weather with 0 turns (permanent until removed)', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: deltaStreamPokemon
		};

		deltaStream.onSwitchIn?.(ctx);

		expect(battleField.weather).toBe(Weather.STRONG_WINDS);
		expect(battleField.weatherTurns).toBe(0);
	});
});

describe('STRONG_WINDS Weather Guard', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
		battleField.setWeather(Weather.STRONG_WINDS, 0);
	});

	it('should not be overwritten by normal weather', () => {
		battleField.setWeather(Weather.RAIN, 5);
		expect(battleField.weather).toBe(Weather.STRONG_WINDS);

		battleField.setWeather(Weather.SUN, 5);
		expect(battleField.weather).toBe(Weather.STRONG_WINDS);

		battleField.setWeather(Weather.SAND, 5);
		expect(battleField.weather).toBe(Weather.STRONG_WINDS);

		battleField.setWeather(Weather.HAIL, 5);
		expect(battleField.weather).toBe(Weather.STRONG_WINDS);
	});

	it('should be clearable with Weather.NONE', () => {
		battleField.setWeather(Weather.NONE);
		expect(battleField.weather).toBe(Weather.NONE);
	});

	it('should be replaceable by another STRONG_WINDS', () => {
		battleField.setWeather(Weather.STRONG_WINDS, 0);
		expect(battleField.weather).toBe(Weather.STRONG_WINDS);
	});

	it('should not tick down with 0 turns', () => {
		battleField.tickTurn();
		expect(battleField.weather).toBe(Weather.STRONG_WINDS);
		expect(battleField.weatherTurns).toBe(0);
	});
});

describe('STRONG_WINDS Type Effectiveness Override', () => {
	let attack: Attack;
	let mockCtx: BattleContext;
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
		battleField.setWeather(Weather.STRONG_WINDS, 0);

		mockCtx = {
			battleField,
			fromTypeChart: (type1: string, type2: string) => {
				return typeChart[type1.toLowerCase() as PokemonType][type2.toLowerCase() as PokemonType];
			}
		} as unknown as BattleContext;

		attack = new Attack(
			{} as unknown as import('../../pokemons/pokedex').MoveInstance,
			[],
			{} as unknown as PokemonInstance
		);
	});

	it('should neutralize super-effective moves against Flying types', () => {
		const calcTypeEff = (attack as any).calculateTypeEffectiveness.bind(attack);

		const iceVsFlying = calcTypeEff('ice', ['flying'], mockCtx);
		expect(iceVsFlying).toBe(1);

		const electricVsFlying = calcTypeEff('electric', ['flying'], mockCtx);
		expect(electricVsFlying).toBe(1);

		const rockVsFlying = calcTypeEff('rock', ['flying'], mockCtx);
		expect(rockVsFlying).toBe(1);
	});

	it('should not affect non-super-effective moves against Flying types', () => {
		const calcTypeEff = (attack as any).calculateTypeEffectiveness.bind(attack);

		const waterVsFlying = calcTypeEff('water', ['flying'], mockCtx);
		expect(waterVsFlying).toBe(1);

		const grassVsFlying = calcTypeEff('grass', ['flying'], mockCtx);
		expect(grassVsFlying).toBe(0.5);
	});

	it('should not affect super-effective moves against non-Flying types', () => {
		const calcTypeEff = (attack as any).calculateTypeEffectiveness.bind(attack);

		const iceVsDragon = calcTypeEff('ice', ['dragon'], mockCtx);
		expect(iceVsDragon).toBe(2);

		const electricVsWater = calcTypeEff('electric', ['water'], mockCtx);
		expect(electricVsWater).toBe(2);
	});

	it('should only neutralize the Flying component of dual-typed Pokemon', () => {
		const calcTypeEff = (attack as any).calculateTypeEffectiveness.bind(attack);

		const iceVsDragonFlying = calcTypeEff('ice', ['dragon', 'flying'], mockCtx);
		expect(iceVsDragonFlying).toBe(2);

		const rockVsFireFlying = calcTypeEff('rock', ['fire', 'flying'], mockCtx);
		expect(rockVsFireFlying).toBe(2);
	});

	it('should use normal type chart when STRONG_WINDS is not active', () => {
		battleField.setWeather(Weather.NONE);

		const calcTypeEff = (attack as any).calculateTypeEffectiveness.bind(attack);

		const iceVsFlying = calcTypeEff('ice', ['flying'], mockCtx);
		expect(iceVsFlying).toBe(2);

		const electricVsFlying = calcTypeEff('electric', ['flying'], mockCtx);
		expect(electricVsFlying).toBe(2);

		const rockVsFlying = calcTypeEff('rock', ['flying'], mockCtx);
		expect(rockVsFlying).toBe(2);
	});
});
