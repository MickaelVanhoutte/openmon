import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: QuiverDance }])
export class QuiverDance implements Effect {
	move_effect_id: number = 291;
	abr: string = 'QVD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		user.changeBattleStats('specialAttack', 1);
		user.changeBattleStats('specialDefense', 1);
		user.changeBattleStats('speed', 1);
		return new EffectResult(undefined, `${user.name}'s Sp. Atk, Sp. Def, and Speed rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
