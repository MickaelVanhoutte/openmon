import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RaiseAllStats }])
export class RaiseAllStats implements Effect {
	move_effect_id: number = 26;
	abr: string = 'ALL+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('attack', 1);
			user.changeBattleStats('defense', 1);
			user.changeBattleStats('specialAttack', 1);
			user.changeBattleStats('specialDefense', 1);
			user.changeBattleStats('speed', 1);
			return new EffectResult(undefined, `${user.name}'s stats all rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
