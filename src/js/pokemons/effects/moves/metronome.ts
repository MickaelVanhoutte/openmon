import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Metronome }])
export class Metronome implements Effect {
	move_effect_id: number = 84;
	abr: string = 'MTR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	// List of moves that cannot be selected by Metronome
	private readonly IGNORED_MOVES = new Set([
		'assist',
		'chatter',
		'copycat',
		'counter',
		'covet',
		'destiny-bond',
		'detect',
		'endure',
		'feint',
		'focus-punch',
		'follow-me',
		'helping-hand',
		'me-first',
		'metronome',
		'mimic',
		'mirror-coat',
		'mirror-move',
		'protect',
		'quick-guard',
		'sketch',
		'sleep-talk',
		'snatch',
		'struggle',
		'switcheroo',
		'thief',
		'trick',
		'wide-guard'
	]);

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// In a real implementation, this would randomly select a move
		// and execute it, excluding moves in IGNORED_MOVES
		return new EffectResult(this, `${user.name} used Metronome!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
