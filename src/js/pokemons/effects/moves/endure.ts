import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Endure }])
export class Endure implements Effect {
	move_effect_id: number = 117;
	abr: string = 'END';
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

		const successRate = Math.pow(0.5, this.consecutiveUses);
		if (Math.random() > successRate) {
			this.consecutiveUses = 0;
			return new EffectResult(undefined, 'But it failed!');
		}

		this.consecutiveUses++;
		return new EffectResult(this, `${user.name} braced itself!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
