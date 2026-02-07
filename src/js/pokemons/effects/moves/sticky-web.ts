import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: StickyWeb }])
export class StickyWeb implements Effect {
	move_effect_id: number = 341;
	abr: string = 'SWB';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], _user?: PokemonInstance): EffectResult {
		return new EffectResult(this, 'A sticky web spreads out on the ground!');
	}

	playEffect(target: PokemonInstance, _user?: PokemonInstance): EffectForTurn {
		if (!target.hasType('Flying')) {
			target.statsChanges.speed -= 1;
			return new EffectForTurn(true, `${target.name}'s Speed was lowered by the sticky web!`);
		}
		return new EffectForTurn();
	}
}
