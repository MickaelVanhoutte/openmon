import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Weather } from '../../../battle/battle-field';

@injectable()
@registry([{ token: 'Effect', useClass: RainDance }])
export class RainDance implements Effect {
	move_effect_id: number = 137;
	abr: string = 'RAN';
	duration: number = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Weather change should be handled by the battle context
		// Duration is 5 turns, or 8 if user holds Damp Rock
		const duration = user?.hasItem('Damp Rock') ? 8 : 5;
		const effect = new RainDance();
		effect.duration = duration;
		return new EffectResult(effect, `It started to rain!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `The rain stopped.`);
		}
		return new EffectForTurn(true);
	}
}
