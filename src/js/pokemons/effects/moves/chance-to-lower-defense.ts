import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerDefense }])
export class ChanceToLowerDefense implements Effect {
	move_effect_id: number = 70;
	abr: string = 'LDEF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual chance to lower defense logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(
			undefined,
			'The chance to lower defense is handled in the battle system!'
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
