import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: CopyLastMove }])
export class CopyLastMove implements Effect {
	move_effect_id: number = 10;
	abr: string = 'CPY';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	// List of moves that cannot be copied
	private readonly IGNORED_MOVES = new Set([
		'acid-armor',
		'acupressure',
		'after-you',
		'agility',
		'ally-switch',
		'amnesia',
		'aqua-ring',
		'aromatherapy',
		'aromatic-mist',
		'assist',
		'autotomize',
		'barrier',
		'baton-pass',
		'belch',
		'belly-drum',
		'bide',
		'bulk-up',
		'calm-mind',
		'camouflage',
		'celebrate',
		'charge',
		'coil',
		'conversion',
		'conversion-2',
		'copycat',
		'cosmic-power',
		'cotton-guard',
		'counter',
		'crafty-shield',
		'curse',
		'defend-order',
		'defense-curl',
		'destiny-bond',
		'detect',
		'doom-desire',
		'double-team',
		'dragon-dance',
		'electric-terrain',
		'endure',
		'final-gambit',
		'flower-shield',
		'focus-energy',
		'focus-punch',
		'follow-me',
		'future-sight',
		'geomancy',
		'grassy-terrain',
		'gravity',
		'growth',
		'grudge',
		'guard-split',
		'hail',
		'happy-hour',
		'harden',
		'haze',
		'heal-bell',
		'heal-order',
		'heal-pulse',
		'healing-wish',
		'helping-hand',
		'hold-hands',
		'hone-claws',
		'howl',
		'imprison',
		'ingrain',
		'ion-deluge',
		'iron-defense',
		'kings-shield',
		'light-screen',
		'lucky-chant',
		'lunar-dance',
		'magic-coat',
		'magnet-rise',
		'magnetic-flux',
		'mat-block',
		'me-first',
		'meditate',
		'metronome',
		'milk-drink',
		'mimic',
		'minimize',
		'mirror-coat',
		'mirror-move',
		'mist',
		'misty-terrain',
		'moonlight',
		'morning-sun',
		'mud-sport',
		'nasty-plot',
		'nature-power',
		'perish-song',
		'power-split',
		'power-trick',
		'protect',
		'psych-up',
		'quick-guard',
		'quiver-dance',
		'rage-powder',
		'rain-dance',
		'recover',
		'recycle',
		'reflect',
		'reflect-type',
		'refresh',
		'rest',
		'rock-polish',
		'role-play',
		'roost',
		'rototiller',
		'safeguard',
		'sandstorm',
		'shadow-blast',
		'shadow-bolt',
		'shadow-half',
		'shadow-rush',
		'shadow-shed',
		'shadow-sky',
		'shadow-storm',
		'shadow-wave',
		'sharpen',
		'shell-smash',
		'shift-gear',
		'sketch',
		'slack-off',
		'sleep-talk',
		'snatch',
		'soft-boiled',
		'spikes',
		'spiky-shield',
		'spit-up',
		'splash',
		'stealth-rock',
		'sticky-web',
		'stockpile',
		'struggle',
		'substitute',
		'sunny-day',
		'swallow',
		'swords-dance',
		'synthesis',
		'tail-glow',
		'tailwind',
		'teleport',
		'toxic-spikes',
		'transform',
		'water-sport',
		'wide-guard',
		'wish',
		'withdraw',
		'work-up'
	]);

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]?.lastMove) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Check if the move can be copied
		if (this.IGNORED_MOVES.has(target[0].lastMove.name.toLowerCase())) {
			return new EffectResult(undefined, 'The move cannot be copied!');
		}

		// Copy and use the last move
		return new EffectResult(undefined, `${user?.name} used ${target[0].lastMove.name}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
