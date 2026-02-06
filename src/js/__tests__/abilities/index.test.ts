import { describe, it, expect } from 'vitest';
import { createTestPokemon, createTestBattleContext, mockAbilityEngine } from './test-helpers';
import { Weather } from '../../battle/battle-field';

describe('Ability Test Infrastructure', () => {
	describe('createTestPokemon', () => {
		it('should create a pokemon with default values', () => {
			const pokemon = createTestPokemon();
			expect(pokemon.name).toBe('Test Pokemon');
			expect(pokemon.currentAbility).toBe('None');
			expect(pokemon.level).toBe(50);
			expect(pokemon.battleStats.speed).toBe(100);
		});

		it('should apply overrides correctly', () => {
			const pokemon = createTestPokemon({
				name: 'Pikachu',
				ability: 'Static',
				speed: 150,
				types: ['Electric']
			});
			expect(pokemon.name).toBe('Pikachu');
			expect(pokemon.currentAbility).toBe('Static');
			expect(pokemon.battleStats.speed).toBe(150);
			expect(pokemon.hasType('Electric')).toBe(true);
		});
	});

	describe('createTestBattleContext', () => {
		it('should create a context with default values', () => {
			const ctx = createTestBattleContext();
			expect(ctx.battleField.weather).toBe(Weather.NONE);
			expect(ctx.playerSide).toEqual([]);
		});

		it('should apply options correctly', () => {
			const ally = createTestPokemon();
			const ctx = createTestBattleContext({
				weather: Weather.RAIN,
				allySide: [ally]
			});
			expect(ctx.battleField.weather).toBe(Weather.RAIN);
			expect(ctx.playerSide).toContain(ally);
		});
	});

	describe('mockAbilityEngine', () => {
		it('should create a mock engine with required methods', () => {
			const engine = mockAbilityEngine();
			expect(engine.runEvent).toBeDefined();
			expect(engine.sortBySpeed).toBeDefined();
		});

		it('should sort pokemon by speed correctly', () => {
			const engine = mockAbilityEngine();
			const slow = createTestPokemon({ speed: 50 });
			const fast = createTestPokemon({ speed: 150 });
			const sorted = engine.sortBySpeed([slow, fast]);
			expect(sorted[0]).toBe(fast);
			expect(sorted[1]).toBe(slow);
		});
	});
});
