import '@abraham/reflection';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Weather, BattleField } from '../battle/battle-field';
import { container } from 'tsyringe';
import { PokemonInstance, MoveInstance } from '../pokemons/pokedex';
import { Attack } from '../battle/actions/actions-selectable';
import { BattleContext } from '../context/battleContext';

describe('Weather Ball Mechanics', () => {
	let battleField: BattleField;
	let user: PokemonInstance;
	let target: PokemonInstance;
	let ctx: BattleContext;

	beforeEach(() => {
		vi.spyOn(Math, 'random').mockReturnValue(0.9);
		battleField = new BattleField();
		container.registerInstance('BattleField', battleField);

		user = {
			name: 'Castform',
			level: 50,
			types: ['normal'],
			battleStats: {
				attack: 100,
				defense: 100,
				specialAttack: 100,
				specialDefense: 100,
				speed: 100
			},
			statsChanges: {
				attack: 0,
				defense: 0,
				specialAttack: 0,
				specialDefense: 0,
				speed: 0,
				accuracy: 0,
				evasion: 0
			}
		} as unknown as PokemonInstance;

		target = {
			name: 'Mew',
			level: 50,
			types: ['psychic'],
			battleStats: {
				attack: 100,
				defense: 100,
				specialAttack: 100,
				specialDefense: 100,
				speed: 100
			},
			statsChanges: {
				attack: 0,
				defense: 0,
				specialAttack: 0,
				specialDefense: 0,
				speed: 0,
				accuracy: 0,
				evasion: 0
			}
		} as unknown as PokemonInstance;

		ctx = {
			battleField,
			playerSide: [user],
			oppSide: [target],
			fromTypeChart: () => 1.0,
			runAbilityEvent: () => undefined
		} as unknown as BattleContext;
	});

	const createWeatherBall = () => {
		return new MoveInstance(
			311,
			'Weather Ball',
			'normal',
			'special',
			50,
			100,
			10,
			0,
			'selected-pokemon',
			{ move_effect_id: 204 } as any,
			0,
			'Weather Ball',
			1
		);
	};

	it('should be Normal type and 50 power in no weather', () => {
		battleField.setWeather(Weather.NONE);
		const move = createWeatherBall();
		const attack = new Attack(move, [target], user);

		const result = (attack as any).calculateDamage(user, target, move, ctx, user, 1);

		expect(result.damages).toBeGreaterThanOrEqual(30);
		expect(result.damages).toBeLessThanOrEqual(36);
	});

	it('should be Fire type and 100 power in Sun', () => {
		battleField.setWeather(Weather.SUN);
		const move = createWeatherBall();
		const attack = new Attack(move, [target], user);

		const result = (attack as any).calculateDamage(user, target, move, ctx, user, 1);

		expect(result.damages).toBeGreaterThanOrEqual(58);
		expect(result.damages).toBeLessThanOrEqual(69);
	});

	it('should be Water type and 100 power in Rain', () => {
		battleField.setWeather(Weather.RAIN);
		const move = createWeatherBall();
		const attack = new Attack(move, [target], user);

		const result = (attack as any).calculateDamage(user, target, move, ctx, user, 1);

		expect(result.damages).toBeGreaterThanOrEqual(58);
		expect(result.damages).toBeLessThanOrEqual(69);
	});

	it('should be Rock type and 100 power in Sandstorm', () => {
		battleField.setWeather(Weather.SAND);
		const move = createWeatherBall();
		const attack = new Attack(move, [target], user);

		const result = (attack as any).calculateDamage(user, target, move, ctx, user, 1);

		expect(result.damages).toBeGreaterThanOrEqual(39);
		expect(result.damages).toBeLessThanOrEqual(46);
	});

	it('should be Ice type and 100 power in Hail', () => {
		battleField.setWeather(Weather.HAIL);
		const move = createWeatherBall();
		const attack = new Attack(move, [target], user);

		const result = (attack as any).calculateDamage(user, target, move, ctx, user, 1);

		expect(result.damages).toBeGreaterThanOrEqual(39);
		expect(result.damages).toBeLessThanOrEqual(46);
	});
});
