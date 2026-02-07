import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: MiracleEye }])
export class MiracleEye implements Effect {
	move_effect_id: number = 217;
	abr: string = 'MRE';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		target[0].statsChanges.evasion = 0;
		return new EffectResult(this, `${target[0].name} was identified!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		target.statsChanges.evasion = 0;
		return new EffectForTurn(true);
	}
}
