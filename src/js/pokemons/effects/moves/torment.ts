import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Torment }])
export class Torment implements Effect {
	move_effect_id: number = 166;
	abr: string = 'TOR';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			return new EffectResult(this, `${target[0].name} was subjected to torment!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// Prevent same move twice logic is handled by battle system
		return new EffectForTurn(true);
	}
}
