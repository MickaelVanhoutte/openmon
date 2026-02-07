import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: CottonGuard }])
export class CottonGuard implements Effect {
	move_effect_id: number = 329;
	abr: string = 'CTG';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		user.changeBattleStats('defense', 3);
		return new EffectResult(undefined, `${user.name}'s Defense drastically rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
