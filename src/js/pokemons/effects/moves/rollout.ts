import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Rollout }])
export class Rollout implements Effect {
	move_effect_id: number = 118;
	abr: string = 'ROL';
	duration: number = 5;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	consecutiveUses: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		this.consecutiveUses++;
		// Power multiplier: 1, 2, 4, 8, 16 (capped at 5 turns)
		const powerMultiplier = Math.pow(2, Math.min(this.consecutiveUses - 1, 4));
		return new EffectResult(this, `Power multiplied by ${powerMultiplier}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			this.consecutiveUses = 0;
		}
		return new EffectForTurn(true);
	}
}
