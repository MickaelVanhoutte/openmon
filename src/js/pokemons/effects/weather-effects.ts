import { type Effect, EffectTiming, EffectResult, EffectForTurn } from './types';
import { Weather, BattleField } from '../../battle/battle-field';

export { Weather };

const SANDSTORM_IMMUNE_TYPES = ['rock', 'ground', 'steel'];
const HAIL_IMMUNE_TYPES = ['ice'];

export function getWeatherDamageMultiplier(battleField: BattleField, moveType: string): number {
	const weather = battleField.weather;
	const type = moveType.toLowerCase();

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
	pokemonTypes: string[]
): number {
	const weather = battleField.weather;
	const types = pokemonTypes.map((t) => t.toLowerCase());

	if (weather === Weather.SAND) {
		const isImmune = types.some((t) => SANDSTORM_IMMUNE_TYPES.includes(t));
		if (!isImmune) {
			return Math.floor(maxHp / 16);
		}
	} else if (weather === Weather.HAIL) {
		const isImmune = types.some((t) => HAIL_IMMUNE_TYPES.includes(t));
		if (!isImmune) {
			return Math.floor(maxHp / 16);
		}
	}

	return 0;
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

	apply(target: unknown[], user?: unknown): EffectResult {
		return new EffectResult(this, `Weather changed!`);
	}

	playEffect(target: unknown, user?: unknown): EffectForTurn {
		return new EffectForTurn(true);
	}

	applyWeather(battleField: BattleField, turns: number = 5): void {
		battleField.setWeather(this.weatherType, turns);
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
