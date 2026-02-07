import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance, MoveInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Mimic }])
export class Mimic implements Effect {
	move_effect_id: number = 40;
	abr: string = 'MIM';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	// List of moves that cannot be mimicked
	private readonly IGNORED_MOVES = new Set([
		'chatter',
		'metronome',
		'mimic',
		'sketch',
		'struggle',
		'transform'
	]);

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]?.lastMove) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Check if the move can be mimicked
		if (this.IGNORED_MOVES.has(target[0].lastMove.name.toLowerCase())) {
			return new EffectResult(undefined, 'The move cannot be mimicked!');
		}

		// Create a copy of the last move with 5 PP
		const mimickedMove = new MoveInstance(
			target[0].lastMove.id,
			target[0].lastMove.name,
			target[0].lastMove.type,
			target[0].lastMove.category,
			target[0].lastMove.power,
			target[0].lastMove.accuracy,
			5, // PP is set to 5
			target[0].lastMove.priority,
			target[0].lastMove.target,
			target[0].lastMove.effect,
			target[0].lastMove.effectChance,
			target[0].lastMove.description,
			target[0].lastMove.level
		);

		// Replace one of the user's moves with the mimicked move
		if (user && user.moves.length > 0) {
			user.moves[0] = mimickedMove;
			return new EffectResult(undefined, `${user.name} learned ${target[0].lastMove.name}!`);
		}

		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
