import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RapidSpin }])
export class RapidSpin implements Effect {
	move_effect_id: number = 130;
	abr: string = 'RSP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		// Remove binding effects
		user.status = undefined;
		return new EffectResult(undefined, `${user.name} blew away hazards!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
