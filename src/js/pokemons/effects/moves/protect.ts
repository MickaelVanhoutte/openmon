import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Protect }])
export class Protect implements Effect {
	move_effect_id: number = 112;
	abr: string = 'PRT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	consecutiveUses: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// Consecutive uses halve success rate
		const successRate = Math.pow(0.5, this.consecutiveUses);
		if (Math.random() > successRate) {
			this.consecutiveUses = 0;
			return new EffectResult(undefined, 'But it failed!');
		}

		this.consecutiveUses++;
		return new EffectResult(this, `${user.name} protected itself!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
