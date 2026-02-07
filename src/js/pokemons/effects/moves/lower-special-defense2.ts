import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpecialDefense2 }])
export class LowerSpecialDefense2 implements Effect {
	move_effect_id = 63;
	abr = 'SPD--';
	duration = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0) {
			return new EffectResult();
		}
		targets[0].changeBattleStats('specialDefense', -2);
		return new EffectResult(undefined, `${targets[0].name}'s Special Defense fell sharply!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
