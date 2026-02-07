import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RageEffect }])
export class RageEffect implements Effect {
	move_effect_id: number = 82;
	abr: string = 'RAG';
	duration: number = -1; // Lasts until the user switches out
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		return new EffectResult(this, `${user.name} is getting angry!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (user) {
			user.changeBattleStats('attack', 1);
			return new EffectForTurn(true, `${user.name}'s rage is building!`);
		}
		return new EffectForTurn();
	}
}
