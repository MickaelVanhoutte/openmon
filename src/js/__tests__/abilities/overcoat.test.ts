import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Weather } from '../../battle/battle-field';
import { applyWeatherDamage } from '../../pokemons/effects/weather-effects';

describe('Overcoat Ability', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	it('should prevent Sandstorm damage for Pokemon with Overcoat', () => {
		battleField.setWeather(Weather.SAND);
		const maxHp = 100;
		const types = ['normal'];
		const ability = 'Overcoat';

		const damage = applyWeatherDamage(battleField, maxHp, types, ability);
		expect(damage).toBe(0);
	});

	it('should prevent Hail damage for Pokemon with Overcoat', () => {
		battleField.setWeather(Weather.HAIL);
		const maxHp = 100;
		const types = ['normal'];
		const ability = 'Overcoat';

		const damage = applyWeatherDamage(battleField, maxHp, types, ability);
		expect(damage).toBe(0);
	});

	it('should still deal damage in Sandstorm if Pokemon does NOT have Overcoat', () => {
		battleField.setWeather(Weather.SAND);
		const maxHp = 100;
		const types = ['normal'];
		const ability = 'Intimidate';

		const damage = applyWeatherDamage(battleField, maxHp, types, ability);
		expect(damage).toBe(6);
	});
});
