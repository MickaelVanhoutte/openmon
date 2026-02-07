import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerSpDef }])
export class ChanceToLowerSpDef implements Effect {
	move_effect_id: number = 73;
	abr: string = 'LSPD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// The actual chance to lower special defense logic is handled in the battle system
			// This is just the effect definition
			return new EffectResult(
				undefined,
				'The chance to lower special defense is handled in the battle system!'
			);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
