import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RaiseDefense2 }])
export class RaiseDefense2 implements Effect {
	move_effect_id: number = 52;
	abr: string = 'DEF++';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('defense', 2);
			return new EffectResult(undefined, `${user.name}'s defense sharply rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
