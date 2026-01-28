import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Weather } from '../battle/battle-field';
import {
	RainEffect,
	SunEffect,
	SandstormEffect,
	HailEffect,
	getWeatherDamageMultiplier,
	applyWeatherDamage
} from '../pokemons/effects/weather-effects';

describe('Weather Effects', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Weather Setting', () => {
		it('should set Rain weather for 5 turns', () => {
			const effect = new RainEffect();
			effect.applyWeather(battleField);
			expect(battleField.weather).toBe(Weather.RAIN);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should set Sun weather for 5 turns', () => {
			const effect = new SunEffect();
			effect.applyWeather(battleField);
			expect(battleField.weather).toBe(Weather.SUN);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should set Sandstorm weather for 5 turns', () => {
			const effect = new SandstormEffect();
			effect.applyWeather(battleField);
			expect(battleField.weather).toBe(Weather.SAND);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should set Hail weather for 5 turns', () => {
			const effect = new HailEffect();
			effect.applyWeather(battleField);
			expect(battleField.weather).toBe(Weather.HAIL);
			expect(battleField.weatherTurns).toBe(5);
		});

		it('should allow custom turn duration', () => {
			const effect = new RainEffect();
			effect.applyWeather(battleField, 8);
			expect(battleField.weatherTurns).toBe(8);
		});
	});

	describe('Weather Damage Multipliers', () => {
		it('should boost Water moves in Rain (1.5x)', () => {
			battleField.setWeather(Weather.RAIN);
			expect(getWeatherDamageMultiplier(battleField, 'water')).toBe(1.5);
		});

		it('should reduce Fire moves in Rain (0.5x)', () => {
			battleField.setWeather(Weather.RAIN);
			expect(getWeatherDamageMultiplier(battleField, 'fire')).toBe(0.5);
		});

		it('should boost Fire moves in Sun (1.5x)', () => {
			battleField.setWeather(Weather.SUN);
			expect(getWeatherDamageMultiplier(battleField, 'fire')).toBe(1.5);
		});

		it('should reduce Water moves in Sun (0.5x)', () => {
			battleField.setWeather(Weather.SUN);
			expect(getWeatherDamageMultiplier(battleField, 'water')).toBe(0.5);
		});

		it('should return 1x for neutral type/weather combos', () => {
			battleField.setWeather(Weather.RAIN);
			expect(getWeatherDamageMultiplier(battleField, 'electric')).toBe(1);
		});

		it('should return 1x when no weather is active', () => {
			expect(getWeatherDamageMultiplier(battleField, 'water')).toBe(1);
		});
	});

	describe('Weather End-of-Turn Damage', () => {
		it('should deal 1/16 damage in Sandstorm to non-immune types', () => {
			battleField.setWeather(Weather.SAND);
			const maxHp = 100;
			const types = ['fire', 'water'];
			const damage = applyWeatherDamage(battleField, maxHp, types);
			expect(damage).toBe(6);
		});

		it('should deal 1/16 damage in Hail to non-Ice types', () => {
			battleField.setWeather(Weather.HAIL);
			const maxHp = 100;
			const types = ['fire', 'water'];
			const damage = applyWeatherDamage(battleField, maxHp, types);
			expect(damage).toBe(6);
		});

		it('should not damage Rock types in Sandstorm', () => {
			battleField.setWeather(Weather.SAND);
			const damage = applyWeatherDamage(battleField, 100, ['rock', 'fire']);
			expect(damage).toBe(0);
		});

		it('should not damage Ground types in Sandstorm', () => {
			battleField.setWeather(Weather.SAND);
			const damage = applyWeatherDamage(battleField, 100, ['ground']);
			expect(damage).toBe(0);
		});

		it('should not damage Steel types in Sandstorm', () => {
			battleField.setWeather(Weather.SAND);
			const damage = applyWeatherDamage(battleField, 100, ['steel', 'flying']);
			expect(damage).toBe(0);
		});

		it('should not damage Ice types in Hail', () => {
			battleField.setWeather(Weather.HAIL);
			const damage = applyWeatherDamage(battleField, 100, ['ice', 'water']);
			expect(damage).toBe(0);
		});

		it('should deal no damage in Rain or Sun', () => {
			battleField.setWeather(Weather.RAIN);
			expect(applyWeatherDamage(battleField, 100, ['fire'])).toBe(0);
			battleField.setWeather(Weather.SUN);
			expect(applyWeatherDamage(battleField, 100, ['water'])).toBe(0);
		});

		it('should deal no damage when no weather', () => {
			expect(applyWeatherDamage(battleField, 100, ['normal'])).toBe(0);
		});
	});
});
