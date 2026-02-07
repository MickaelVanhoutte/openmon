import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Disable }])
export class Disable implements Effect {
	move_effect_id: number = 87;
	abr: string = 'DSB';
	duration: number = 0; // Duration is randomly set in apply
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;
	disabledMove: string = '';

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0] || !target[0].lastMove) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Set a random duration between 4-7 turns
		this.duration = Math.floor(Math.random() * 4) + 4;
		this.disabledMove = target[0].lastMove.name;

		return new EffectResult(this, `${target[0].name}'s ${this.disabledMove} was disabled!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;

		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(
				true,
				`${target.name}'s ${this.disabledMove} is no longer disabled!`
			);
		}

		// Prevent using the disabled move
		if (target.selectedMove?.name === this.disabledMove) {
			return new EffectForTurn(false, `${target.name}'s ${this.disabledMove} is disabled!`);
		}

		return new EffectForTurn();
	}
}
