import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Weather, Screen, Terrain } from '../battle/battle-field';
import { getWeatherDamageMultiplier } from '../pokemons/effects/weather-effects';
import { getScreenDamageMultiplier } from '../pokemons/effects/screen-effects';
import { getTerrainDamageMultiplier } from '../pokemons/effects/terrain-effects';

describe('Damage Calculation Modifiers', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Weather Modifiers', () => {
		it('should boost Water moves by 1.5x in Rain', () => {
			battleField.setWeather(Weather.RAIN, 5);
			const multiplier = getWeatherDamageMultiplier(battleField, 'water');
			expect(multiplier).toBe(1.5);
		});

		it('should reduce Fire moves by 0.5x in Rain', () => {
			battleField.setWeather(Weather.RAIN, 5);
			const multiplier = getWeatherDamageMultiplier(battleField, 'fire');
			expect(multiplier).toBe(0.5);
		});

		it('should boost Fire moves by 1.5x in Sun', () => {
			battleField.setWeather(Weather.SUN, 5);
			const multiplier = getWeatherDamageMultiplier(battleField, 'fire');
			expect(multiplier).toBe(1.5);
		});

		it('should reduce Water moves by 0.5x in Sun', () => {
			battleField.setWeather(Weather.SUN, 5);
			const multiplier = getWeatherDamageMultiplier(battleField, 'water');
			expect(multiplier).toBe(0.5);
		});

		it('should not affect other types', () => {
			battleField.setWeather(Weather.RAIN, 5);
			expect(getWeatherDamageMultiplier(battleField, 'electric')).toBe(1);
			expect(getWeatherDamageMultiplier(battleField, 'grass')).toBe(1);
		});
	});

	describe('Screen Modifiers', () => {
		it('should halve physical damage with Reflect', () => {
			battleField.addScreen('ally', Screen.REFLECT, 5);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'physical');
			expect(multiplier).toBe(0.5);
		});

		it('should halve special damage with Light Screen', () => {
			battleField.addScreen('ally', Screen.LIGHT_SCREEN, 5);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'special');
			expect(multiplier).toBe(0.5);
		});

		it('should not affect special moves with Reflect', () => {
			battleField.addScreen('ally', Screen.REFLECT, 5);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'special');
			expect(multiplier).toBe(1);
		});

		it('should not affect physical moves with Light Screen', () => {
			battleField.addScreen('ally', Screen.LIGHT_SCREEN, 5);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'physical');
			expect(multiplier).toBe(1);
		});
	});

	describe('Terrain Modifiers', () => {
		it('should boost Electric moves by 1.3x on Electric Terrain', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', true);
			expect(multiplier).toBeCloseTo(1.3);
		});

		it('should boost Grass moves by 1.3x on Grassy Terrain', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.GRASSY, 'grass', true);
			expect(multiplier).toBeCloseTo(1.3);
		});

		it('should halve Earthquake on Grassy Terrain', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.GRASSY, 'ground', true, 'earthquake');
			expect(multiplier).toBe(0.5);
		});

		it('should boost Psychic moves by 1.3x on Psychic Terrain', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.PSYCHIC, 'psychic', true);
			expect(multiplier).toBeCloseTo(1.3);
		});

		it('should halve Dragon moves on Misty Terrain', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.MISTY, 'dragon', true);
			expect(multiplier).toBe(0.5);
		});

		it('should not affect non-grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', false);
			expect(multiplier).toBe(1);
		});
	});

	describe('Combined Modifiers', () => {
		it('should stack multiplicatively: Rain + Reflect = 0.75x for Water Physical', () => {
			battleField.setWeather(Weather.RAIN, 5);
			battleField.addScreen('enemy', Screen.REFLECT, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'water');
			const screenMod = getScreenDamageMultiplier(battleField, 'enemy', 'physical');
			const combined = weatherMod * screenMod;

			expect(combined).toBe(0.75);
		});

		it('should stack: Sun + Light Screen = 0.75x for Fire Special', () => {
			battleField.setWeather(Weather.SUN, 5);
			battleField.addScreen('enemy', Screen.LIGHT_SCREEN, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'fire');
			const screenMod = getScreenDamageMultiplier(battleField, 'enemy', 'special');
			const combined = weatherMod * screenMod;

			expect(combined).toBe(0.75);
		});

		it('should stack: Rain + No Screen = 1.5x for Water', () => {
			battleField.setWeather(Weather.RAIN, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'water');
			const screenMod = getScreenDamageMultiplier(battleField, 'enemy', 'special');
			const combined = weatherMod * screenMod;

			expect(combined).toBe(1.5);
		});

		it('should handle all three: Electric Terrain + Rain + No Screen', () => {
			battleField.setWeather(Weather.RAIN, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'electric');
			const screenMod = getScreenDamageMultiplier(battleField, 'enemy', 'special');
			const terrainMod = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', true);
			const combined = weatherMod * screenMod * terrainMod;

			expect(combined).toBeCloseTo(1.3);
		});
	});
});
