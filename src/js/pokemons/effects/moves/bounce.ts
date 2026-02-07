import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Bounce }])
export class Bounce implements Effect {
	move_effect_id: number = 264;
	abr: string = 'BNC';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	bouncing: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.bouncing) {
			this.bouncing = true;
			return new EffectResult(this, `${user?.name} sprang up!`);
		}
		this.bouncing = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.bouncing) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}
