import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Refresh }])
export class Refresh implements Effect {
	move_effect_id: number = 194;
	abr: string = 'RFR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		if (
			user.status?.abr === 'BRN' ||
			user.status?.abr === 'PAR' ||
			user.status?.abr === 'PSN' ||
			user.status?.abr === 'PSN+'
		) {
			user.status = undefined;
			return new EffectResult(undefined, `${user.name} was cured of its status!`);
		}
		return new EffectResult(undefined, 'But it failed!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
