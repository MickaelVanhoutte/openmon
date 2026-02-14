import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Weather } from '../battle/battle-field';
import {
	RainEffect,
	SunEffect,
	SandstormEffect,
	HailEffect
} from '../pokemons/effects/weather-effects';
import type { PokemonInstance } from '../pokemons/pokedex';

describe('Weather Duration Rock Items', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	function createMockPokemon(itemName: string | undefined): PokemonInstance {
		const pokemon = {
			heldItem: itemName ? { name: itemName } : undefined,
			hasItem: function (name: string) {
				return this.heldItem?.name === name;
			}
		};
		return pokemon as unknown as PokemonInstance;
	}

	describe('Rain (Damp Rock)', () => {
		it('should last 5 turns without Damp Rock', () => {
			const effect = new RainEffect();
			const user = createMockPokemon(undefined);
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.RAIN);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should last 8 turns with Damp Rock', () => {
			const effect = new RainEffect();
			const user = createMockPokemon('Damp Rock');
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.RAIN);
			expect(battleField.weatherTurns).toBe(8);
		});
	});

	describe('Sun (Heat Rock)', () => {
		it('should last 5 turns without Heat Rock', () => {
			const effect = new SunEffect();
			const user = createMockPokemon(undefined);
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.SUN);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should last 8 turns with Heat Rock', () => {
			const effect = new SunEffect();
			const user = createMockPokemon('Heat Rock');
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.SUN);
			expect(battleField.weatherTurns).toBe(8);
		});
	});

	describe('Sandstorm (Smooth Rock)', () => {
		it('should last 5 turns without Smooth Rock', () => {
			const effect = new SandstormEffect();
			const user = createMockPokemon(undefined);
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.SAND);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should last 8 turns with Smooth Rock', () => {
			const effect = new SandstormEffect();
			const user = createMockPokemon('Smooth Rock');
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.SAND);
			expect(battleField.weatherTurns).toBe(8);
		});
	});

	describe('Hail (Icy Rock)', () => {
		it('should last 5 turns without Icy Rock', () => {
			const effect = new HailEffect();
			const user = createMockPokemon(undefined);
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.HAIL);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should last 8 turns with Icy Rock', () => {
			const effect = new HailEffect();
			const user = createMockPokemon('Icy Rock');
			effect.applyWeather(battleField, 5, user);
			expect(battleField.weather).toBe(Weather.HAIL);
			expect(battleField.weatherTurns).toBe(8);
		});
	});
});
