import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: DelayedAttack }])
export class DelayedAttack implements Effect {
	move_effect_id: number = 149;
	abr: string = 'DLY';
	duration: number = 3;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `${user?.name} foresaw an attack!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			if (this.damages > 0) {
				target.removeHp(this.damages);
				return new EffectForTurn(true, `${target.name} took the delayed attack!`);
			}
		}
		return new EffectForTurn(true);
	}
}
