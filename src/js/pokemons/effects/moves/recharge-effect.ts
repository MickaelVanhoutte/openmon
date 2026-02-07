import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RechargeEffect }])
export class RechargeEffect implements Effect {
	move_effect_id: number = 81;
	abr: string = 'RCH';
	duration: number = 1; // Recharge takes one turn
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		return new EffectResult(this, `${user.name} must recharge!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true);
		}
		return new EffectForTurn(false, `${user?.name} must recharge!`);
	}
}
