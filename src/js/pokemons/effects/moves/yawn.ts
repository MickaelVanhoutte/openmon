import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Sleep } from './sleep';

@injectable()
@registry([{ token: 'Effect', useClass: Yawn }])
export class Yawn implements Effect {
	move_effect_id: number = 188;
	abr: string = 'YWN';
	duration: number = 2;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		if (target[0].status) {
			return new EffectResult(undefined, 'But it failed!');
		}

		return new EffectResult(this, `${target[0].name} became drowsy!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			if (!target.status) {
				const sleep = new Sleep();
				sleep.duration = Math.floor(Math.random() * 4) + 2;
				target.status = sleep;
				return new EffectForTurn(true, `${target.name} fell asleep!`);
			}
		}
		return new EffectForTurn(true);
	}
}
