import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Burn } from './burn';

@injectable()
@registry([{ token: 'Effect', useClass: WillOWisp }])
export class WillOWisp implements Effect {
	move_effect_id: number = 168;
	abr: string = 'WOW';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		if (target[0].status || target[0].types.includes('fire')) {
			return new EffectResult(undefined, 'But it failed!');
		}

		const burn = new Burn();
		burn.damages = Math.floor(target[0].currentStats.hp / 16);
		target[0].status = burn;
		return new EffectResult(burn, `${target[0].name} was burned!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
