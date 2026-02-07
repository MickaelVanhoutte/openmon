import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Taunt }])
export class Taunt implements Effect {
	move_effect_id: number = 176;
	abr: string = 'TNT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		// Duration is 3-5 turns
		this.duration = Math.floor(Math.random() * 3) + 3;
		return new EffectResult(this, `${target[0].name} fell for the taunt!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `${target.name}'s taunt wore off!`);
		}
		return new EffectForTurn(true);
	}
}
