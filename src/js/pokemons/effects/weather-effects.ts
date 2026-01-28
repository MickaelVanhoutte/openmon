import { Effect, EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS } from './types';
import { PokemonInstance } from '../pokedex';
import { Weather, BattleField } from '../../battle/battle-field';

export { Weather };

export abstract class WeatherEffect implements Effect {
	abstract move_effect_id: number;
	abstract weatherType: Weather;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `Weather changed!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
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
