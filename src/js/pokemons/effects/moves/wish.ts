import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Wish }])
export class Wish implements Effect {
	move_effect_id: number = 180;
	abr: string = 'WSH';
	duration: number = 2;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	healAmount: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		this.healAmount = Math.floor(user.stats.hp / 2);
		return new EffectResult(this, `${user.name} made a wish!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			target.heal(this.healAmount);
			return new EffectForTurn(true, `${target.name}'s wish came true!`);
		}
		return new EffectForTurn(true);
	}
}
