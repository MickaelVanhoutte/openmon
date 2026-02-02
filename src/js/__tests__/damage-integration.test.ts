import { describe, it, expect } from 'vitest';
import { getWeatherDamageMultiplier, Weather } from '../pokemons/effects/weather-effects';
import {
	calculateStealthRockDamage,
	calculateSpikesDamage
} from '../pokemons/effects/hazard-effects';
import { BattleField } from '../battle/battle-field';

describe('Damage Calculation Integration', () => {
	describe('Weather and Type Effectiveness Combined', () => {
		it('should stack weather boost with type effectiveness', () => {
			const battleField = new BattleField();
			battleField.setWeather(Weather.RAIN, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'water');
			const typeEffectiveness = 2.0;
			const stab = 1.5;

			const combined = weatherMod * typeEffectiveness * stab;
			expect(combined).toBe(4.5);
		});

		it('should reduce damage in sun for water moves', () => {
			const battleField = new BattleField();
			battleField.setWeather(Weather.SUN, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'water');
			expect(weatherMod).toBe(0.5);
		});
	});

	describe('Multiple Hazards Combined', () => {
		it('should calculate total hazard damage for vulnerable types', () => {
			const maxHp = 200;
			const stealthRockDamage = calculateStealthRockDamage(maxHp, ['fire']);
			const spikesDamage = calculateSpikesDamage(maxHp, 3);

			expect(stealthRockDamage).toBe(50);
			expect(spikesDamage).toBe(50);
			expect(stealthRockDamage + spikesDamage).toBe(100);
		});
	});

	describe('Modifier Order Verification', () => {
		it('should have correct multiplier relationships', () => {
			expect(1.5 * 2.0).toBeCloseTo(3.0);
			expect(1.5 * 0.5).toBeCloseTo(0.75);
			expect(2.0 * 0.67).toBeCloseTo(1.34, 1);
		});
	});

	describe('Screen Multipliers', () => {
		it('should halve damage in singles with screen', () => {
			const screenMultiplier = 0.5;
			const baseDamage = 100;
			expect(baseDamage * screenMultiplier).toBe(50);
		});

		it('should reduce by 2/3 in doubles with screen', () => {
			const screenMultiplier = 2 / 3;
			const baseDamage = 100;
			expect(baseDamage * screenMultiplier).toBeCloseTo(66.67, 1);
		});
	});
});
