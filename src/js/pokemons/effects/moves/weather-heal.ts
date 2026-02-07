import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Weather } from '../../../battle/battle-field';

@injectable()
@registry([{ token: 'Effect', useClass: WeatherHeal }])
export class WeatherHeal implements Effect {
	move_effect_id: number = 133;
	abr: string = 'WHL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	weather?: string;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			let healPercent = 0.5; // Default: 50%

			// Modify heal amount based on weather
			if (this.weather === 'sun' || this.weather === 'sunny') {
				healPercent = 2 / 3; // 66.7% in sun
			} else if (
				this.weather === 'rain' ||
				this.weather === 'sandstorm' ||
				this.weather === 'hail'
			) {
				healPercent = 0.25; // 25% in bad weather
			}

			const healAmount = Math.floor(user.stats.hp * healPercent);
			user.heal(healAmount);
			return new EffectResult(undefined, `${user.name} restored HP!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
