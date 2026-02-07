import '@abraham/reflection';
import { describe, it, expect, beforeEach } from 'vitest';
import { Weather, BattleField } from '../battle/battle-field';
import { container } from 'tsyringe';
import { ShoreUp } from '../pokemons/effects/moves';
import { PokemonInstance } from '../pokemons/pokedex';

describe('Shore Up Move Effect', () => {
	let battleField: BattleField;
	let user: any;

	beforeEach(() => {
		battleField = new BattleField();
		container.registerInstance('BattleField', battleField);

		user = {
			name: 'Palossand',
			currentHp: 50,
			currentStats: { hp: 100 },
			heal: function (hp: number) {
				this.currentHp = Math.min(this.currentHp + hp, this.currentStats.hp);
			}
		};
	});

	it('should heal 50% HP in neutral weather', () => {
		battleField.setWeather(Weather.NONE);
		const shoreUpEffect = new ShoreUp();

		user.currentHp = 20;
		shoreUpEffect.apply([], user as unknown as PokemonInstance);

		expect(user.currentHp).toBe(70);
	});

	it('should heal 66% HP in Sandstorm', () => {
		battleField.setWeather(Weather.SAND);
		const shoreUpEffect = new ShoreUp();

		user.currentHp = 20;
		shoreUpEffect.apply([], user as unknown as PokemonInstance);

		expect(user.currentHp).toBe(86);
	});

	it('should heal 50% HP in other weathers (e.g. Rain)', () => {
		battleField.setWeather(Weather.RAIN);
		const shoreUpEffect = new ShoreUp();

		user.currentHp = 20;
		shoreUpEffect.apply([], user as unknown as PokemonInstance);

		expect(user.currentHp).toBe(70);
	});
});
