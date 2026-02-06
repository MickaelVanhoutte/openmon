import '@abraham/reflection';
import { describe, it, expect, beforeEach } from 'vitest';
import { Weather, BattleField } from '../battle/battle-field';
import { container } from 'tsyringe';
import { MOVE_EFFECT_APPLIER } from '../battle/battle-model';
import { PokemonInstance } from '../pokemons/pokedex';
import { getWeatherDamageMultiplier } from '../pokemons/effects/weather-effects';

describe('Solar Beam / Solar Blade Mechanics', () => {
	let battleField: BattleField;
	let user: PokemonInstance;
	let target: PokemonInstance;

	beforeEach(() => {
		battleField = new BattleField();
		container.registerInstance('BattleField', battleField);

		user = {
			name: 'Bulbasaur',
			currentHp: 100,
			currentStats: { hp: 100 },
			status: undefined
		} as unknown as PokemonInstance;

		target = {
			name: 'Charmander',
			currentHp: 100,
			currentStats: { hp: 100 },
			status: undefined
		} as unknown as PokemonInstance;
	});

	describe('Charge Mechanics', () => {
		const solarBeamEffect = { move_effect_id: 152 } as any;

		it('should require charge in neutral weather', () => {
			battleField.setWeather(Weather.NONE);
			const effect = MOVE_EFFECT_APPLIER.findEffect(solarBeamEffect);

			(effect as any).charging = false;

			const result1 = effect.apply([target], user);
			expect(result1.message).toContain('absorbing light');
			expect((effect as any).charging).toBe(true);

			const result2 = effect.apply([target], user);
			expect(result2.message).toBeUndefined();
			expect((effect as any).charging).toBe(false);
		});

		it('should skip charge in Sun', () => {
			battleField.setWeather(Weather.SUN);
			const effect = MOVE_EFFECT_APPLIER.findEffect(solarBeamEffect);

			(effect as any).charging = false;

			const result = effect.apply([target], user);
			expect(result.message).toBeUndefined();
			expect((effect as any).charging).toBe(false);
		});

		it('should require charge in Rain', () => {
			battleField.setWeather(Weather.RAIN);
			const effect = MOVE_EFFECT_APPLIER.findEffect(solarBeamEffect);

			(effect as any).charging = false;

			const result = effect.apply([target], user);
			expect(result.message).toContain('absorbing light');
			expect((effect as any).charging).toBe(true);
		});
	});

	describe('Power Mechanics', () => {
		it('should have full power (1.0x) in neutral weather', () => {
			battleField.setWeather(Weather.NONE);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Beam')).toBe(1.0);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Blade')).toBe(1.0);
		});

		it('should have full power (1.0x) in Sun', () => {
			battleField.setWeather(Weather.SUN);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Beam')).toBe(1.0);
		});

		it('should have half power (0.5x) in Rain', () => {
			battleField.setWeather(Weather.RAIN);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Beam')).toBe(0.5);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Blade')).toBe(0.5);
		});

		it('should have half power (0.5x) in Sandstorm', () => {
			battleField.setWeather(Weather.SAND);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Beam')).toBe(0.5);
		});

		it('should have half power (0.5x) in Hail', () => {
			battleField.setWeather(Weather.HAIL);
			expect(getWeatherDamageMultiplier(battleField, 'grass', 'Solar Beam')).toBe(0.5);
		});
	});
});
