import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Trap }])
export class Trap implements Effect {
	move_effect_id: number = 107;
	abr: string = 'TRP';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			return new EffectResult(this, `${target[0].name} can no longer escape!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(false, `${target.name} can't escape!`);
	}
}
