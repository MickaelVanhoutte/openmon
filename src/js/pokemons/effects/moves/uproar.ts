import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Uproar }])
export class Uproar implements Effect {
	move_effect_id: number = 160;
	abr: string = 'UPR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		// Duration is 2-5 turns
		this.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(this, `${user.name} caused an uproar!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The uproar ended.');
		}
		return new EffectForTurn(true, `${user?.name} is making an uproar!`);
	}
}
