import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceRaiseAllStats }])
export class ChanceRaiseAllStats implements Effect {
	move_effect_id: number = 141;
	abr: string = 'ALL+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10; // Default 10% chance

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && Math.random() * 100 < this.effectChance) {
			user.changeBattleStats('attack', 1);
			user.changeBattleStats('defense', 1);
			user.changeBattleStats('specialAttack', 1);
			user.changeBattleStats('specialDefense', 1);
			user.changeBattleStats('speed', 1);
			return new EffectResult(undefined, `All of ${user.name}'s stats rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
