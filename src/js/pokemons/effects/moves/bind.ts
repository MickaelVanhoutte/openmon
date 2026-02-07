import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Bind }])
export class Bind implements Effect {
	move_effect_id: number = 43;
	abr: string = 'BND';
	duration: number = 0;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			const bind = new Bind();
			// Duration is 2-5 turns
			// 3/8 chance for 2 or 3 turns, 1/8 chance for 4 or 5 turns
			const rand = Math.random();
			if (rand < 0.375) {
				bind.duration = 2;
			} else if (rand < 0.75) {
				bind.duration = 3;
			} else if (rand < 0.875) {
				bind.duration = 4;
			} else {
				bind.duration = 5;
			}

			bind.damages = Math.floor(target[0].currentStats.hp / 16);
			return new EffectResult(bind, `${target[0].name} was trapped in the vortex!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;

		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `${target.name} was freed from the bind!`);
		}

		target.removeHp(this.damages);
		return new EffectForTurn(true, `${target.name} is hurt by Bind!`);
	}
}
