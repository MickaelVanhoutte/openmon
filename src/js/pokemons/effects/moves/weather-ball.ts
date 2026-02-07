import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Weather } from '../../../battle/battle-field';

@injectable()
@registry([{ token: 'Effect', useClass: WeatherBall }])
export class WeatherBall implements Effect {
	move_effect_id: number = 204;
	abr: string = 'WTH';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(_target: PokemonInstance[], _user?: PokemonInstance): EffectResult {
		return new EffectResult();
	}

	playEffect(_target: PokemonInstance, _user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
