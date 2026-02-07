import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Encore }])
export class Encore implements Effect {
	move_effect_id: number = 91;
	abr: string = 'ENC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;
	encoreMove: string = '';

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0] || !target[0].lastMove) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Set a random duration between 4-8 turns
		this.duration = Math.floor(Math.random() * 5) + 4;
		this.encoreMove = target[0].lastMove.name;

		// Check if the move can be encored
		const IGNORED_MOVES = new Set([
			'encore',
			'mimic',
			'mirror-move',
			'sketch',
			'struggle',
			'transform'
		]);

		if (IGNORED_MOVES.has(this.encoreMove.toLowerCase())) {
			return new EffectResult(undefined, 'But it failed!');
		}

		return new EffectResult(this, `${target[0].name} got an encore!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;

		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `${target.name}'s encore ended!`);
		}

		// Force the target to use the encored move
		return new EffectForTurn(true, `${target.name} is forced to use ${this.encoreMove}!`);
	}
}
