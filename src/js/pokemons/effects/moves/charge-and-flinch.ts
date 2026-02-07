import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: ChargeAndFlinch }])
export class ChargeAndFlinch implements Effect {
	move_effect_id: number = 76;
	abr: string = 'CHF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual charging and flinch chance logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(
			undefined,
			'The charging and flinch chance is handled in the battle system!'
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
