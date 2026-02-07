import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Mimic2 }])
export class Mimic2 implements Effect {
	move_effect_id: number = 83;
	abr: string = 'MIM2';
	duration: number = -1; // Lasts until the user switches out
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	// List of moves that cannot be mimicked
	private readonly IGNORED_MOVES = new Set(['chatter', 'metronome', 'mimic', 'sketch', 'struggle']);

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]?.lastMove) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Check if the move can be mimicked
		if (this.IGNORED_MOVES.has(target[0].lastMove.name.toLowerCase())) {
			return new EffectResult(undefined, 'The move cannot be mimicked!');
		}

		// This represents copying the last used move with 5 PP
		return new EffectResult(this, `${user?.name} copied ${target[0].lastMove.name}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
