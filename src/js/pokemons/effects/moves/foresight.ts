import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Foresight }])
export class Foresight implements Effect {
	move_effect_id: number = 114;
	abr: string = 'FST';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// Reset evasion to 0
			target[0].statsChanges.evasion = 0;
			// Mark as identified (for Ghost type immunity removal)
			return new EffectResult(this, `${target[0].name} was identified!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// Evasion is always 0 while this effect is active
		target.statsChanges.evasion = 0;
		return new EffectForTurn(true);
	}
}
