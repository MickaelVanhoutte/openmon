import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Sleep }])
export class Sleep implements Effect {
	move_effect_id: number = 2;
	abr: string = 'SLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Sleep for 2-5 turns
		const sleep = new Sleep();
		sleep.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(sleep, `${target[0].name} fell asleep!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;

		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			target.status = undefined;
			return new EffectForTurn(true, `${target.name} woke up!`);
		}

		return new EffectForTurn(false, `${target.name} is fast asleep!`);
	}
}
