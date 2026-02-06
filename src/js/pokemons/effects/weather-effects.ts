import { type Effect, EffectTiming, EffectResult, EffectForTurn } from './types';
import { Weather, BattleField } from '../../battle/battle-field';
import type { PokemonInstance } from '../pokedex';

export { Weather };

const SANDSTORM_IMMUNE_TYPES = ['rock', 'ground', 'steel'];
const HAIL_IMMUNE_TYPES = ['ice'];

export function getWeatherDamageMultiplier(
	battleField: BattleField,
	moveType: string,
	moveName?: string
): number {
	const weather = battleField.weather;
	const type = moveType.toLowerCase();
	const name = moveName?.toLowerCase();

	if (weather === Weather.RAIN || weather === Weather.SAND || weather === Weather.HAIL) {
		if (
			name === 'solar beam' ||
			name === 'solar-beam' ||
			name === 'solar blade' ||
			name === 'solar-blade'
		) {
			return 0.5;
		}
	}

	if (weather === Weather.RAIN) {
		if (type === 'water') {
			return 1.5;
		}
		if (type === 'fire') {
			return 0.5;
		}
	} else if (weather === Weather.SUN) {
		if (type === 'fire') {
			return 1.5;
		}
		if (type === 'water') {
			return 0.5;
		}
	}

	return 1;
}

export function getWeatherSpDefMultiplier(
	battleField: BattleField,
	pokemonTypes: string[]
): number {
	const weather = battleField.weather;
	const types = pokemonTypes.map((t) => t.toLowerCase());

	if (weather === Weather.SAND && types.includes('rock')) {
		return 1.5;
	}

	return 1;
}

export function applyWeatherDamage(
	battleField: BattleField,
	maxHp: number,
	pokemonTypes: string[],
	ability?: string
): number {
	const weather = battleField.weather;
	const types = pokemonTypes.map((t) => t.toLowerCase());
	const normalizedAbility = ability?.toLowerCase().trim().replace(/\s+/g, '-');

	if (normalizedAbility === 'magic-guard' || normalizedAbility === 'overcoat') {
		return 0;
	}

	if (weather === Weather.SAND) {
		if (
			normalizedAbility === 'sand-veil' ||
			normalizedAbility === 'sand-force' ||
			normalizedAbility === 'sand-rush'
		) {
			return 0;
		}
		const isImmune = types.some((t) => SANDSTORM_IMMUNE_TYPES.includes(t));
		if (!isImmune) {
			return Math.floor(maxHp / 16);
		}
	} else if (weather === Weather.HAIL) {
		if (normalizedAbility === 'ice-body' || normalizedAbility === 'snow-cloak') {
			return 0;
		}
		const isImmune = types.some((t) => HAIL_IMMUNE_TYPES.includes(t));
		if (!isImmune) {
			return Math.floor(maxHp / 16);
		}
	}

	return 0;
}

export function getWeatherAccuracyOverride(
	battleField: BattleField,
	moveName: string,
	_baseAccuracy: number
): number | null {
	const weather = battleField.weather;
	const name = moveName.toLowerCase();

	if (weather === Weather.RAIN) {
		if (name === 'thunder' || name === 'hurricane') {
			return 100;
		}
	} else if (weather === Weather.SUN) {
		if (name === 'thunder' || name === 'hurricane') {
			return 50;
		}
	} else if (weather === Weather.HAIL) {
		if (name === 'blizzard') {
			return 100;
		}
	}

	return null;
}

export function getWeatherBallType(weather: Weather): string {
	switch (weather) {
		case Weather.SUN:
			return 'fire';
		case Weather.RAIN:
			return 'water';
		case Weather.SAND:
			return 'rock';
		case Weather.HAIL:
			return 'ice';
		default:
			return 'normal';
	}
}

export function getWeatherBallPower(weather: Weather): number {
	return weather !== Weather.NONE ? 100 : 50;
}

export function applyWeather(
	battleField: BattleField,
	weather: Weather,
	turns: number = 5,
	user?: PokemonInstance
): void {
	let duration = turns;
	if (user && typeof user.hasItem === 'function') {
		if (weather === Weather.RAIN && user.hasItem('Damp Rock')) {
			duration = 8;
		} else if (weather === Weather.SUN && user.hasItem('Heat Rock')) {
			duration = 8;
		} else if (weather === Weather.SAND && user.hasItem('Smooth Rock')) {
			duration = 8;
		} else if (weather === Weather.HAIL && user.hasItem('Icy Rock')) {
			duration = 8;
		}
	}
	battleField.setWeather(weather, duration);
}

export abstract class WeatherEffect implements Effect {
	abstract move_effect_id: number;
	abstract weatherType: Weather;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(_target: unknown[], _user?: unknown): EffectResult {
		return new EffectResult(this, `Weather changed!`);
	}

	playEffect(_target: unknown, _user?: unknown): EffectForTurn {
		return new EffectForTurn(true);
	}

	applyWeather(battleField: BattleField, turns: number = 5, user?: PokemonInstance): void {
		applyWeather(battleField, this.weatherType, turns, user);
	}
}

export class RainEffect extends WeatherEffect {
	move_effect_id: number = 137;
	weatherType: Weather = Weather.RAIN;
}

export class SunEffect extends WeatherEffect {
	move_effect_id: number = 138;
	weatherType: Weather = Weather.SUN;
}

export class SandstormEffect extends WeatherEffect {
	move_effect_id: number = 116;
	weatherType: Weather = Weather.SAND;
}

export class HailEffect extends WeatherEffect {
	move_effect_id: number = 165;
	weatherType: Weather = Weather.HAIL;
}
