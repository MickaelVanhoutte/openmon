import '@abraham/reflection';
import { injectable, injectAll, registry, singleton } from 'tsyringe';
import { PokemonInstance, MoveInstance } from './pokedex';
import { MoveEffect } from './pokedex';
import { EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS } from './effects/types';
import type { Effect } from './effects/types';

export { EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS };
export type { Effect };

@injectable()
@registry([{ token: 'Effect', useClass: RegularDamageEffect }])
class RegularDamageEffect implements Effect {
	move_effect_id: number = 1;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		//console.log('RegularDamageEffect');
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// nothing
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Sleep }])
class Sleep implements Effect {
	move_effect_id: number = 2;
	abr: string = 'SLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Sleep for 2-5 turns
		let sleep = new Sleep();
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

@injectable()
@registry([{ token: 'Effect', useClass: Poison }])
class Poison implements Effect {
	move_effect_id: number = 3;
	abr: string = 'PSN';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		let poison = new Poison();
		poison.damages = Math.floor(target[0].currentStats.hp / 16);
		return new EffectResult(poison, `${target[0].name} is poisoned`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		target.removeHp(this.damages);
		return new EffectForTurn(true, `${target.name} is hurt by poison`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Drain }])
class Drain implements Effect {
	move_effect_id: number = 4;
	abr: string = 'DRN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && target[0]) {
			// Drain half the damage dealt
			const healAmount = Math.floor(this.damages / 2);
			user.heal(healAmount);
			return new EffectResult(undefined, `${user.name} had its energy drained!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Burn }])
class Burn implements Effect {
	move_effect_id = 5;
	abr: string = 'BRN';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		let burn = new Burn();
		burn.damages = Math.floor(target[0].currentStats.hp / 16);
		return new EffectResult(burn, `${target[0].name} is burnt`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		target.removeHp(this.damages);
		return new EffectForTurn(true, `${target.name} is hurt by burn`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Freeze }])
class Freeze implements Effect {
	move_effect_id = 6;
	abr: string = 'FRZ';
	duration: number = -1;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(new Freeze(), `${target[0].name} is frozen`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (Math.random() < 0.2) {
			this.healed = true;
			target.status = undefined;
		}

		return new EffectForTurn(
			this.healed,
			this.healed ? `${target.name} thawed out` : `${target.name} is frozen solid`
		);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Paralyze }])
class Paralyze implements Effect {
	move_effect_id = 7;
	abr: string = 'PAR';
	duration: number = -1;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(new Paralyze(), `${target[0].name} is paralyzed`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		let canPlay = Math.random() < 0.25;
		return new EffectForTurn(canPlay, canPlay ? undefined : `${target.name} is fully paralyzed`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Faint }])
class Faint implements Effect {
	move_effect_id: number = 8;
	abr: string = 'FNT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			// User faints after using the move
			user.currentStats.hp = 0;
			user.fainted = true;
			return new EffectResult(undefined, `${user.name} fainted from recoil!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: DreamEater }])
class DreamEater implements Effect {
	move_effect_id: number = 9;
	abr: string = 'DRM';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && target[0]) {
			// Check if target is sleeping
			if (target[0].status?.abr !== 'SLP') {
				return new EffectResult(undefined, `${target[0].name} must be sleeping!`);
			}

			// Drain half the damage dealt
			const healAmount = Math.floor(this.damages / 2);
			user.heal(healAmount);
			return new EffectResult(undefined, `${user.name} ate ${target[0].name}'s dreams!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: CopyLastMove }])
class CopyLastMove implements Effect {
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

@injectable()
@registry([{ token: 'Effect', useClass: RaiseAttack }])
class RaiseAttack implements Effect {
	move_effect_id: number = 11;
	abr: string = 'ATK+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('attack', 1);
			return new EffectResult(undefined, `${user.name}'s attack rose`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseDefense }])
class RaiseDefense implements Effect {
	move_effect_id: number = 12;
	abr: string = 'DEF+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('defense', 1);
			return new EffectResult(undefined, `${user.name}'s defense rose`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Confusion }])
class Confusion implements Effect {
	move_effect_id: number = 13;
	abr: string = 'CNF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Confusion lasts 2-5 turns
		let confusion = new Confusion();
		confusion.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(confusion, `${target[0].name} became confused!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;

		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			target.status = undefined;
			return new EffectForTurn(true, `${target.name} snapped out of confusion!`);
		}

		// 33% chance to hurt itself in confusion
		if (Math.random() < 0.33) {
			// Damage is calculated as if the Pokémon hit itself with a 40-power typeless physical move
			const damage = Math.floor(
				(target.currentStats.attack * 40) / target.currentStats.defense / 50 + 2
			);
			target.removeHp(damage);
			return new EffectForTurn(false, `${target.name} hurt itself in its confusion!`);
		}

		return new EffectForTurn(true, `${target.name} is confused!`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseSPAttack }])
class RaiseSPAttack implements Effect {
	move_effect_id: number = 14;
	abr: string = 'DEF+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('specialAttack', 1);
			return new EffectResult(undefined, `${user.name}'s special attack rose`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseSpeed }])
class RaiseSpeed implements Effect {
	move_effect_id: number = 15;
	abr: string = 'SPE+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('speed', 1);
			return new EffectResult(undefined, `${user.name}'s speed rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseSpecialDefense }])
class RaiseSpecialDefense implements Effect {
	move_effect_id: number = 16;
	abr: string = 'SPD+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('specialDefense', 1);
			return new EffectResult(undefined, `${user.name}'s special defense rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: NeverMiss }])
class NeverMiss implements Effect {
	move_effect_id: number = 18;
	abr: string = 'ACC∞';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// This effect is handled in the accuracy calculation
		// The move will ignore accuracy and evasion modifiers
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerAttack }])
class LowerAttack implements Effect {
	move_effect_id: number = 19;
	abr: string = 'ATK-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('attack', -1);
			return new EffectResult(undefined, `${target[0].name}'s attack dropped`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerDefense }])
class LowerDefense implements Effect {
	move_effect_id: number = 20;
	abr: string = 'DEF-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('defense', -1);
			return new EffectResult(undefined, `${target[0].name}'s defense dropped`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpeed }])
class LowerSpeed implements Effect {
	move_effect_id: number = 21;
	abr: string = 'SPE-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('speed', -1);
			return new EffectResult(undefined, `${target[0].name}'s speed dropped`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpecialAttack }])
class LowerSpecialAttack implements Effect {
	move_effect_id: number = 22;
	abr: string = 'SPA-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('specialAttack', -1);
			return new EffectResult(undefined, `${target[0].name}'s special attack fell!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpecialDefense }])
class LowerSpecialDefense implements Effect {
	move_effect_id: number = 23;
	abr: string = 'SPD-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('specialDefense', -1);
			return new EffectResult(undefined, `${target[0].name}'s special defense fell!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerAccuracy }])
class LowerAccuracy implements Effect {
	move_effect_id: number = 24;
	abr: string = 'ACC-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('accuracy', -1);
			return new EffectResult(undefined, `${target[0].name}'s accuracy dropped`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerEvasion }])
class LowerEvasion implements Effect {
	move_effect_id: number = 25;
	abr: string = 'EVA-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			target[0].changeBattleStats('evasion', -1);
			return new EffectResult(undefined, `${target[0].name}'s evasion dropped`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseAllStats }])
class RaiseAllStats implements Effect {
	move_effect_id: number = 26;
	abr: string = 'ALL+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('attack', 1);
			user.changeBattleStats('defense', 1);
			user.changeBattleStats('specialAttack', 1);
			user.changeBattleStats('specialDefense', 1);
			user.changeBattleStats('speed', 1);
			return new EffectResult(undefined, `${user.name}'s stats all rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: OneHitKO }])
class OneHitKO implements Effect {
	move_effect_id: number = 27;
	abr: string = 'KO';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// Set HP to 0 and mark as fainted
			target[0].currentStats.hp = 0;
			target[0].fainted = true;
			return new EffectResult(undefined, `It's a one-hit KO!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChargeSkip }])
class ChargeSkip implements Effect {
	move_effect_id: number = 28;
	abr: string = 'CHG';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// This effect is handled in the move execution logic
		// It allows the move to skip its charging turn
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ForceSwitch }])
class ForceSwitch implements Effect {
	move_effect_id: number = 29;
	abr: string = 'SWT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual switching logic should be handled by the battle system
		return new EffectResult(undefined, `${target[0].name} was forced to switch out!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: MultiHit }])
class MultiHit implements Effect {
	move_effect_id: number = 30;
	abr: string = 'MLT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual multi-hit logic is handled in the move execution
		// 3/8 chance for 2 or 3 hits, 1/8 chance for 4 or 5 hits
		const rand = Math.random();
		const hits = rand < 0.375 ? 2 : rand < 0.75 ? 3 : rand < 0.875 ? 4 : 5;
		return new EffectResult(undefined, `Hit ${hits} times!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: TypeChange }])
class TypeChange implements Effect {
	move_effect_id: number = 31;
	abr: string = 'TYP';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			// The actual type change should be handled by the battle system
			// It should randomly select one of the user's move types
			return new EffectResult(undefined, `${user.name}'s type changed!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Flinch }])
class Flinch implements Effect {
	move_effect_id: number = 32;
	abr: string = 'FLN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(new Flinch(), `${target[0].name} flinched!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(false, `${target.name} flinched and couldn't move!`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Restore }])
class Restore implements Effect {
	move_effect_id: number = 33;
	abr: string = 'RST';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			const healAmount = Math.floor(user.stats.hp / 2);
			user.heal(healAmount);
			return new EffectResult(undefined, `${user.name} restored HP!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: BadlyPoison }])
class BadlyPoison implements Effect {
	move_effect_id: number = 34;
	abr: string = 'PSN+';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		let badlyPoison = new BadlyPoison();
		badlyPoison.damages = Math.floor(target[0].currentStats.hp / 16);
		return new EffectResult(badlyPoison, `${target[0].name} was badly poisoned!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		// Damage increases by 1/16 each turn
		const damage = Math.floor(this.damages * this.turnsPassed);
		target.removeHp(damage);
		return new EffectForTurn(true, `${target.name} is hurt by poison!`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: PayDay }])
class PayDay implements Effect {
	move_effect_id: number = 35;
	abr: string = 'PAY';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			// Money calculation: 5 times the user's level
			const money = user.level * 5;
			// Note: The actual money reward should be handled by the battle system
			return new EffectResult(undefined, `Coins scattered everywhere!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Reflect }])
class Reflect implements Effect {
	move_effect_id = 36;
	abr = 'RFL';
	duration = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		// Reflect reduces physical damage by half for 5 turns
		// In double battles, the reduction is 1/3 (not implemented yet)
		// If the user is holding Light Clay, the barrier lasts for 8 turns
		if (user.hasEffect('Reflect')) {
			return new EffectResult(undefined, 'But it failed!');
		}
		this.duration = user.hasItem('Light Clay') ? 8 : 5;
		return new EffectResult(this, 'A barrier appeared!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: TriStatus }])
class TriStatus implements Effect {
	move_effect_id: number = 37;
	abr: string = 'TRI';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			// Randomly select one of the three status effects
			const rand = Math.random();
			if (rand < 0.33) {
				// Burn
				let burn = new Burn();
				burn.damages = Math.floor(target[0].currentStats.hp / 16);
				return new EffectResult(burn, `${target[0].name} was burned!`);
			} else if (rand < 0.66) {
				// Freeze
				return new EffectResult(new Freeze(), `${target[0].name} was frozen solid!`);
			} else {
				// Paralyze
				return new EffectResult(new Paralyze(), `${target[0].name} was paralyzed!`);
			}
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Recharge }])
class Recharge implements Effect {
	move_effect_id: number = 38;
	abr: string = 'RCH';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `${user?.name} must recharge!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true);
		}
		return new EffectForTurn(false, `${user?.name} must recharge!`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Mimic }])
class Mimic implements Effect {
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

@injectable()
@registry([{ token: 'Effect', useClass: HalfHP }])
class HalfHP implements Effect {
	move_effect_id: number = 41;
	abr: string = 'HLF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// Calculate half of current HP
			const damage = Math.floor(target[0].currentStats.hp / 2);
			target[0].removeHp(damage);
			return new EffectResult(undefined, `${target[0].name} lost half of its HP!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: FixedDamage }])
class FixedDamage implements Effect {
	move_effect_id: number = 42;
	abr: string = 'FIX';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 40; // Fixed damage amount

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			target[0].removeHp(this.damages);
			return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Bind }])
class Bind implements Effect {
	move_effect_id: number = 43;
	abr: string = 'BND';
	duration: number = 0;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			let bind = new Bind();
			// Duration is 2-5 turns
			// 3/8 chance for 2 or 3 turns, 1/8 chance for 4 or 5 turns
			const rand = Math.random();
			if (rand < 0.375) bind.duration = 2;
			else if (rand < 0.75) bind.duration = 3;
			else if (rand < 0.875) bind.duration = 4;
			else bind.duration = 5;

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

@injectable()
@registry([{ token: 'Effect', useClass: HighCritical }])
class HighCritical implements Effect {
	move_effect_id: number = 44;
	abr: string = 'CRT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The increased critical hit rate is handled in the move's damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: DoubleHit }])
class DoubleHit implements Effect {
	move_effect_id: number = 45;
	abr: string = 'DBL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The double hit is handled in the move's damage calculation
		return new EffectResult(undefined, `Hit 2 times!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RecoilIfMiss }])
class RecoilIfMiss implements Effect {
	move_effect_id: number = 46;
	abr: string = 'RCL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;
	missed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && this.missed) {
			// If the move missed, deal half of user's max HP as recoil
			const recoilDamage = Math.floor(user.currentStats.hp / 2);
			user.removeHp(recoilDamage);
			return new EffectResult(undefined, `${user.name} kept going and crashed!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([
	{
		token: 'Effect',
		useValue: 'stat-protect'
	}
])
export class StatProtect implements Effect {
	move_effect_id: number = 47;
	abr: string = 'MIST';
	duration: number = 5;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		return new EffectResult(this, 'A protective mist surrounds your team!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true, 'The mist prevents stat changes!');
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: FocusEnergy }])
class FocusEnergy implements Effect {
	move_effect_id: number = 48;
	abr: string = 'FOC';
	duration: number = -1; // Lasts until the user leaves the field
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// Check if user already has Focus Energy
		if (user.status?.abr === 'FOC') {
			return new EffectResult(undefined, 'But it failed!');
		}

		return new EffectResult(this, `${user.name} is getting pumped!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Recoil }])
class Recoil implements Effect {
	move_effect_id: number = 49;
	abr: string = 'RCL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && this.damages > 0) {
			// User takes 1/4 of the damage it inflicted as recoil
			const recoilDamage = Math.floor(this.damages / 4);
			user.removeHp(recoilDamage);
			return new EffectResult(undefined, `${user.name} is hit with recoil!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: SimpleConfuse }])
class SimpleConfuse implements Effect {
	move_effect_id: number = 50;
	abr: string = 'CNF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Confusion lasts 2-5 turns
		let confusion = new Confusion();
		confusion.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(confusion, `${target[0].name} became confused!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseAttack2 }])
class RaiseAttack2 implements Effect {
	move_effect_id: number = 51;
	abr: string = 'ATK++';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('attack', 2);
			return new EffectResult(undefined, `${user.name}'s attack sharply rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseDefense2 }])
class RaiseDefense2 implements Effect {
	move_effect_id: number = 52;
	abr: string = 'DEF++';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('defense', 2);
			return new EffectResult(undefined, `${user.name}'s defense sharply rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseSpeed2 }])
class RaiseSpeed2 implements Effect {
	move_effect_id: number = 53;
	abr: string = 'SPE++';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('speed', 2);
			return new EffectResult(undefined, `${user.name}'s speed sharply rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseSpecialAttack2 }])
class RaiseSpecialAttack2 implements Effect {
	move_effect_id: number = 54;
	abr: string = 'SPA++';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('specialAttack', 2);
			return new EffectResult(undefined, `${user.name}'s special attack sharply rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseSpecialDefense2 }])
class RaiseSpecialDefense2 implements Effect {
	move_effect_id: number = 55;
	abr: string = 'SPD++';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('specialDefense', 2);
			return new EffectResult(undefined, `${user.name}'s special defense sharply rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseAccuracy }])
class RaiseAccuracy implements Effect {
	move_effect_id: number = 56;
	abr: string = 'ACC';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('accuracy', 1);
			return new EffectResult(undefined, `${user.name}'s accuracy rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RaiseEvasion }])
class RaiseEvasion implements Effect {
	move_effect_id: number = 57;
	abr: string = 'EVA';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('evasion', 1);
			return new EffectResult(undefined, `${user.name}'s evasiveness rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Transform }])
export class Transform implements Effect {
	move_effect_id = 58;
	abr = 'TRN';
	duration = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0 || !user) {
			return new EffectResult();
		}

		const target = targets[0];

		// Copy only necessary attributes
		user.types = [...target.types];
		user.moves = target.moves.map(
			(move) =>
				new MoveInstance(
					move.id,
					move.name,
					move.type,
					move.category,
					move.power,
					move.accuracy,
					5, // PP is set to 5 for all moves
					move.priority,
					move.target,
					move.effect,
					move.effectChance,
					move.description,
					move.level
				)
		);

		// Copy current stats (except HP)
		const oldHp = user.currentStats.hp;
		const oldCurrentHp = user.currentHp;
		user.stats = { ...target.stats };
		user.currentStats = { ...target.currentStats };
		user.currentStats.hp = oldHp;
		user.currentHp = oldCurrentHp;

		// Set sprite to target's sprite
		user.sprites = target.sprites;

		return new EffectResult(undefined, `${user.name} transformed into ${target.name}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerAttack2 }])
export class LowerAttack2 implements Effect {
	move_effect_id = 59;
	abr = 'ATK--';
	duration = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0) {
			return new EffectResult();
		}
		targets[0].changeBattleStats('attack', -2);
		return new EffectResult(undefined, `${targets[0].name}'s Attack fell sharply!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerDefense2 }])
export class LowerDefense2 implements Effect {
	move_effect_id = 60;
	abr = 'DEF--';
	duration = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0) {
			return new EffectResult();
		}
		targets[0].changeBattleStats('defense', -2);
		return new EffectResult(undefined, `${targets[0].name}'s Defense fell sharply!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpeed2 }])
export class LowerSpeed2 implements Effect {
	move_effect_id = 61;
	abr = 'SPE--';
	duration = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0) {
			return new EffectResult();
		}
		targets[0].changeBattleStats('speed', -2);
		return new EffectResult(undefined, `${targets[0].name}'s Speed fell sharply!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpecialAttack2 }])
export class LowerSpecialAttack2 implements Effect {
	move_effect_id = 62;
	abr = 'SPA--';
	duration = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0) {
			return new EffectResult();
		}
		targets[0].changeBattleStats('specialAttack', -2);
		return new EffectResult(undefined, `${targets[0].name}'s Special Attack fell sharply!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerSpecialDefense2 }])
export class LowerSpecialDefense2 implements Effect {
	move_effect_id = 63;
	abr = 'SPD--';
	duration = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0) {
			return new EffectResult();
		}
		targets[0].changeBattleStats('specialDefense', -2);
		return new EffectResult(undefined, `${targets[0].name}'s Special Defense fell sharply!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerAccuracy2 }])
class LowerAccuracy2 implements Effect {
	move_effect_id: number = 64;
	abr: string = 'ACC-2';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			target[0].changeBattleStats('accuracy', -2);
			return new EffectResult(undefined, `${target[0].name}'s accuracy harshly fell!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LowerEvasion2 }])
class LowerEvasion2 implements Effect {
	move_effect_id: number = 65;
	abr: string = 'EVA-2';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			target[0].changeBattleStats('evasion', -2);
			return new EffectResult(undefined, `${target[0].name}'s evasiveness harshly fell!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: LightScreen }])
export class LightScreen implements Effect {
	move_effect_id = 66;
	abr = 'LSCR';
	duration = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		// Light Screen reduces physical damage by half for 5 turns
		// In double battles, the reduction is 1/3 (not implemented yet)
		// If the user is holding Light Clay, the barrier lasts for 8 turns
		if (user.hasEffect('LightScreen')) {
			return new EffectResult(undefined, 'But it failed!');
		}
		this.duration = user.hasItem('Light Clay') ? 8 : 5;
		return new EffectResult(this, 'A barrier of light appeared!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: BreakScreens }])
class BreakScreens implements Effect {
	move_effect_id: number = 67;
	abr: string = 'BRK';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual screen breaking should be handled by the battle system
		// This is just the effect definition
		return new EffectResult(undefined, 'The protective barriers were broken!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: DelayedSleep }])
class DelayedSleep implements Effect {
	move_effect_id: number = 68;
	abr: string = 'SLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// This effect is handled in the move execution logic
		// It allows the move to skip its charging turn
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: DropItem }])
class DropItem implements Effect {
	move_effect_id: number = 69;
	abr: string = 'DRP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual item dropping should be handled by the battle system
		// This is just the effect definition
		if (target[0].hasItem('')) {
			return new EffectResult(undefined, `${target[0].name} dropped its item!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerDefense }])
class ChanceToLowerDefense implements Effect {
	move_effect_id: number = 70;
	abr: string = 'LDEF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual chance to lower defense logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(
			undefined,
			'The chance to lower defense is handled in the battle system!'
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerSpeed }])
class ChanceToLowerSpeed implements Effect {
	move_effect_id: number = 71;
	abr: string = 'LSPE';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// The actual chance to lower speed logic is handled in the battle system
			// This is just the effect definition
			return new EffectResult(
				undefined,
				'The chance to lower speed is handled in the battle system!'
			);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerSpAtk }])
class ChanceToLowerSpAtk implements Effect {
	move_effect_id: number = 72;
	abr: string = 'LSPA';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// The actual chance to lower special attack logic is handled in the battle system
			// This is just the effect definition
			return new EffectResult(
				undefined,
				'The chance to lower special attack is handled in the battle system!'
			);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerSpDef }])
class ChanceToLowerSpDef implements Effect {
	move_effect_id: number = 73;
	abr: string = 'LSPD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// The actual chance to lower special defense logic is handled in the battle system
			// This is just the effect definition
			return new EffectResult(
				undefined,
				'The chance to lower special defense is handled in the battle system!'
			);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToLowerAccuracy }])
class ChanceToLowerAccuracy implements Effect {
	move_effect_id: number = 74;
	abr: string = 'LACC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// The actual chance to lower accuracy logic is handled in the battle system
			// This is just the effect definition
			return new EffectResult(
				undefined,
				'The chance to lower accuracy is handled in the battle system!'
			);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: MysticalFire }])
class MysticalFire implements Effect {
	move_effect_id: number = 75;
	abr: string = 'MYST';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			target[0].changeBattleStats('specialAttack', -1);
			return new EffectResult(undefined, `${target[0].name}'s Special Attack fell!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChargeAndFlinch }])
class ChargeAndFlinch implements Effect {
	move_effect_id: number = 76;
	abr: string = 'CHF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual charging and flinch chance logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(
			undefined,
			'The charging and flinch chance is handled in the battle system!'
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: ChanceToConfuse }])
class ChanceToConfuse implements Effect {
	move_effect_id: number = 77;
	abr: string = 'CNF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual confusion chance logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(undefined, 'The chance to confuse is handled in the battle system!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: TwoHitPoison }])
class TwoHitPoison implements Effect {
	move_effect_id: number = 78;
	abr: string = 'THP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual two-hit and poison chance logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(
			undefined,
			'Hit twice! The chance to poison is handled in the battle system!'
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: NeverMissEffect }])
class NeverMissEffect implements Effect {
	move_effect_id: number = 79;
	abr: string = 'NME';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// This effect is handled in the accuracy calculation
		// The move will ignore accuracy and evasion modifiers
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Substitute }])
class Substitute implements Effect {
	move_effect_id: number = 80;
	abr: string = 'SUB';
	duration: number = -1; // Lasts until broken
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;
	hp: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// Calculate HP cost (1/4 of max HP)
		const hpCost = Math.floor(user.stats.hp / 4);

		// Check if user has enough HP
		if (user.currentHp <= hpCost) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Create substitute
		user.removeHp(hpCost);
		this.hp = hpCost;

		return new EffectResult(this, `${user.name} created a substitute!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// The substitute's effects (blocking status moves, taking damage, etc.)
		// are handled in the battle system
		return new EffectForTurn(true);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RechargeEffect }])
class RechargeEffect implements Effect {
	move_effect_id: number = 81;
	abr: string = 'RCH';
	duration: number = 1; // Recharge takes one turn
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		return new EffectResult(this, `${user.name} must recharge!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true);
		}
		return new EffectForTurn(false, `${user?.name} must recharge!`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RageEffect }])
class RageEffect implements Effect {
	move_effect_id: number = 82;
	abr: string = 'RAG';
	duration: number = -1; // Lasts until the user switches out
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		return new EffectResult(this, `${user.name} is getting angry!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (user) {
			user.changeBattleStats('attack', 1);
			return new EffectForTurn(true, `${user.name}'s rage is building!`);
		}
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Mimic2 }])
class Mimic2 implements Effect {
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

@injectable()
@registry([{ token: 'Effect', useClass: Metronome }])
class Metronome implements Effect {
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

@injectable()
@registry([{ token: 'Effect', useClass: LeechSeed }])
class LeechSeed implements Effect {
	move_effect_id: number = 85;
	abr: string = 'SEED';
	duration: number = -1; // Lasts until the Pokémon leaves the field
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		// Check if target is Grass type (immune to Leech Seed)
		if (target[0].hasType('Grass')) {
			return new EffectResult(undefined, "It doesn't affect the target!");
		}

		return new EffectResult(this, `${target[0].name} was seeded!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (!target || !user) {
			return new EffectForTurn();
		}

		// Calculate damage (1/8 of target's max HP)
		const damage = Math.floor(target.stats.hp / 8);

		// Damage target and heal user
		target.removeHp(damage);
		user.restoreHp(damage);

		return new EffectForTurn(true, `${target.name}'s health is sapped by Leech Seed!`);
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Splash }])
class Splash implements Effect {
	move_effect_id: number = 86;
	abr: string = 'SPL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Splash does nothing
		return new EffectResult(undefined, 'But nothing happened!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Disable }])
class Disable implements Effect {
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

@injectable()
@registry([{ token: 'Effect', useClass: LevelDamage }])
class LevelDamage implements Effect {
	move_effect_id: number = 88;
	abr: string = 'LVL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// Damage equal to user's level
		this.damages = user.level;

		// Apply damage
		target[0].removeHp(this.damages);

		return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: RandomDamage }])
class RandomDamage implements Effect {
	move_effect_id: number = 89;
	abr: string = 'RND';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// Random damage between 50% and 150% of user's level
		const baseLevel = user.level;
		const percentage = (Math.floor(Math.random() * 11) + 5) * 10; // 50% to 150% in increments of 10%
		this.damages = Math.floor((baseLevel * percentage) / 100);

		// Apply damage
		target[0].removeHp(this.damages);

		return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Counter }])
class Counter implements Effect {
	move_effect_id: number = 90;
	abr: string = 'CNT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// In a real implementation, this would check if the user was hit by a physical move
		// and return double the damage. For now, we'll just simulate it.
		const lastDamageTaken = user.lastDamageTaken || 0;

		if (lastDamageTaken <= 0 || !user.lastAttacker) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Double the damage
		this.damages = lastDamageTaken * 2;

		// Apply damage to the last attacker
		user.lastAttacker.removeHp(this.damages);

		return new EffectResult(undefined, `${user.lastAttacker.name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

@injectable()
@registry([{ token: 'Effect', useClass: Encore }])
class Encore implements Effect {
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

@injectable()
@registry([{ token: 'Effect', useClass: PainSplit }])
class PainSplit implements Effect {
	move_effect_id: number = 92;
	abr: string = 'PSP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// Calculate the average HP
		const totalHP = user.currentHp + target[0].currentHp;
		const averageHP = Math.floor(totalHP / 2);

		// Set both Pokémon to the average HP
		const userOldHP = user.currentHp;
		const targetOldHP = target[0].currentHp;

		user.setHp(averageHP);
		target[0].setHp(averageHP);

		return new EffectResult(undefined, `The battlers shared their pain!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 104: Inflicts regular damage with no additional effect
@injectable()
@registry([{ token: 'Effect', useClass: RegularDamageNoEffect }])
class RegularDamageNoEffect implements Effect {
	move_effect_id: number = 104;
	abr: string = '';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// No additional effect, just regular damage
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 199: User receives 1/3 the damage inflicted in recoil
@injectable()
@registry([{ token: 'Effect', useClass: RecoilThird }])
class RecoilThird implements Effect {
	move_effect_id: number = 199;
	abr: string = 'RCL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && this.damages > 0) {
			// User takes 1/3 of the damage it inflicted as recoil
			const recoilDamage = Math.floor(this.damages / 3);
			user.removeHp(recoilDamage);
			return new EffectResult(undefined, `${user.name} is damaged by recoil!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 157: Raises user's Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: RaiseUserDefense }])
class RaiseUserDefense implements Effect {
	move_effect_id: number = 157;
	abr: string = 'DEF+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			user.changeBattleStats('defense', 1);
			return new EffectResult(undefined, `${user.name}'s Defense rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 141: Has a chance to raise all of the user's stats by one stage
@injectable()
@registry([{ token: 'Effect', useClass: ChanceRaiseAllStats }])
class ChanceRaiseAllStats implements Effect {
	move_effect_id: number = 141;
	abr: string = 'ALL+';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10; // Default 10% chance

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && Math.random() * 100 < this.effectChance) {
			user.changeBattleStats('attack', 1);
			user.changeBattleStats('defense', 1);
			user.changeBattleStats('specialAttack', 1);
			user.changeBattleStats('specialDefense', 1);
			user.changeBattleStats('speed', 1);
			return new EffectResult(undefined, `All of ${user.name}'s stats rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 125: Safeguard - Protects the user's field from major status ailments and confusion for five turns
@injectable()
@registry([{ token: 'Effect', useClass: Safeguard }])
class Safeguard implements Effect {
	move_effect_id: number = 125;
	abr: string = 'SFG';
	duration: number = 5;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			if (user.hasEffect('Safeguard')) {
				return new EffectResult(undefined, 'But it failed!');
			}
			return new EffectResult(new Safeguard(), `${user.name}'s team is protected by Safeguard!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `The Safeguard wore off!`);
		}
		return new EffectForTurn(true);
	}
}

// Effect 118: Rollout - Power doubles every turn this move is used in succession after the first
@injectable()
@registry([{ token: 'Effect', useClass: Rollout }])
class Rollout implements Effect {
	move_effect_id: number = 118;
	abr: string = 'ROL';
	duration: number = 5;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	consecutiveUses: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		this.consecutiveUses++;
		// Power multiplier: 1, 2, 4, 8, 16 (capped at 5 turns)
		const powerMultiplier = Math.pow(2, Math.min(this.consecutiveUses - 1, 4));
		return new EffectResult(this, `Power multiplied by ${powerMultiplier}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			this.consecutiveUses = 0;
		}
		return new EffectForTurn(true);
	}
}

// Effect 114: Foresight - Forces the target to have no Evade, and allows it to be hit by Normal and Fighting moves even if it's a Ghost
@injectable()
@registry([{ token: 'Effect', useClass: Foresight }])
class Foresight implements Effect {
	move_effect_id: number = 114;
	abr: string = 'FST';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			// Reset evasion to 0
			target[0].statsChanges.evasion = 0;
			// Mark as identified (for Ghost type immunity removal)
			return new EffectResult(this, `${target[0].name} was identified!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// Evasion is always 0 while this effect is active
		target.statsChanges.evasion = 0;
		return new EffectForTurn(true);
	}
}

// Effect 137: Rain Dance - Changes the weather to rain for five turns
@injectable()
@registry([{ token: 'Effect', useClass: RainDance }])
class RainDance implements Effect {
	move_effect_id: number = 137;
	abr: string = 'RAN';
	duration: number = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Weather change should be handled by the battle context
		// Duration is 5 turns, or 8 if user holds Damp Rock
		const duration = user?.hasItem('Damp Rock') ? 8 : 5;
		const effect = new RainDance();
		effect.duration = duration;
		return new EffectResult(effect, `It started to rain!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `The rain stopped.`);
		}
		return new EffectForTurn(true);
	}
}

// Effect 274: Has a chance to burn the target
@injectable()
@registry([{ token: 'Effect', useClass: ChanceBurn }])
class ChanceBurn implements Effect {
	move_effect_id: number = 274;
	abr: string = 'BRN?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10; // Default 10% chance

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			// Check if target can be burned (not Fire type, not already burned)
			if (target[0].status || target[0].types.includes('fire')) {
				return new EffectResult();
			}
			const burn = new Burn();
			burn.damages = Math.floor(target[0].currentStats.hp / 16);
			target[0].status = burn;
			return new EffectResult(burn, `${target[0].name} was burned!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 129: Pursuit - Has double power against, and can hit, Pokémon attempting to switch out
@injectable()
@registry([{ token: 'Effect', useClass: Pursuit }])
class Pursuit implements Effect {
	move_effect_id: number = 129;
	abr: string = 'PRS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	targetSwitching: boolean = false;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// If target is switching, power is doubled (handled in damage calculation)
		if (this.targetSwitching) {
			return new EffectResult(undefined, `${target[0]?.name} can't escape!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 133: Heals the user by half its max HP. Affected by weather
@injectable()
@registry([{ token: 'Effect', useClass: WeatherHeal }])
class WeatherHeal implements Effect {
	move_effect_id: number = 133;
	abr: string = 'WHL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	weather?: string;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			let healPercent = 0.5; // Default: 50%

			// Modify heal amount based on weather
			if (this.weather === 'sun' || this.weather === 'sunny') {
				healPercent = 2 / 3; // 66.7% in sun
			} else if (
				this.weather === 'rain' ||
				this.weather === 'sandstorm' ||
				this.weather === 'hail'
			) {
				healPercent = 0.25; // 25% in bad weather
			}

			const healAmount = Math.floor(user.stats.hp * healPercent);
			user.heal(healAmount);
			return new EffectResult(undefined, `${user.name} restored HP!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 39: One-Hit KO (alternative for Fissure, Guillotine, Horn Drill, Sheer Cold)
@injectable()
@registry([{ token: 'Effect', useClass: OHKO }])
class OHKO implements Effect {
	move_effect_id: number = 39;
	abr: string = 'OHKO';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0] || !user) {
			return new EffectResult(undefined, 'But it failed!');
		}
		// OHKO only works if user level >= target level
		if (user.level < target[0].level) {
			return new EffectResult(undefined, 'But it failed!');
		}
		target[0].currentStats.hp = 0;
		target[0].fainted = true;
		return new EffectResult(undefined, "It's a one-hit KO!");
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 100: Flail/Reversal - Inflicts more damage when the user has less HP remaining
@injectable()
@registry([{ token: 'Effect', useClass: FlailReversal }])
class FlailReversal implements Effect {
	move_effect_id: number = 100;
	abr: string = 'FLR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power is calculated based on remaining HP percentage
		// This is handled in damage calculation - just a marker effect
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 107: Mean Look/Block - Prevents the target from leaving battle
@injectable()
@registry([{ token: 'Effect', useClass: Trap }])
class Trap implements Effect {
	move_effect_id: number = 107;
	abr: string = 'TRP';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			return new EffectResult(this, `${target[0].name} can no longer escape!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(false, `${target.name} can't escape!`);
	}
}

// Effect 112: Protect/Detect - Prevents any moves from hitting the user this turn
@injectable()
@registry([{ token: 'Effect', useClass: Protect }])
class Protect implements Effect {
	move_effect_id: number = 112;
	abr: string = 'PRT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	consecutiveUses: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		// Consecutive uses halve success rate
		const successRate = Math.pow(0.5, this.consecutiveUses);
		if (Math.random() > successRate) {
			this.consecutiveUses = 0;
			return new EffectResult(undefined, 'But it failed!');
		}

		this.consecutiveUses++;
		return new EffectResult(this, `${user.name} protected itself!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 116: Sandstorm - Changes the weather to a sandstorm for five turns
@injectable()
@registry([{ token: 'Effect', useClass: Sandstorm }])
class Sandstorm implements Effect {
	move_effect_id: number = 116;
	abr: string = 'SND';
	duration: number = 5;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const duration = user?.hasItem('Smooth Rock') ? 8 : 5;
		const effect = new Sandstorm();
		effect.duration = duration;
		return new EffectResult(effect, 'A sandstorm kicked up!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The sandstorm subsided.');
		}
		// Damage non-Rock/Ground/Steel types
		if (!target.hasType('Rock') && !target.hasType('Ground') && !target.hasType('Steel')) {
			const damage = Math.floor(target.stats.hp / 16);
			target.removeHp(damage);
			return new EffectForTurn(true, `${target.name} is buffeted by the sandstorm!`);
		}
		return new EffectForTurn(true);
	}
}

// Effect 117: Endure - Prevents the user's HP from lowering below 1 this turn
@injectable()
@registry([{ token: 'Effect', useClass: Endure }])
class Endure implements Effect {
	move_effect_id: number = 117;
	abr: string = 'END';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	consecutiveUses: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		const successRate = Math.pow(0.5, this.consecutiveUses);
		if (Math.random() > successRate) {
			this.consecutiveUses = 0;
			return new EffectResult(undefined, 'But it failed!');
		}

		this.consecutiveUses++;
		return new EffectResult(this, `${user.name} braced itself!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 128: Baton Pass - Allows the trainer to switch out the user and pass effects along
@injectable()
@registry([{ token: 'Effect', useClass: BatonPass }])
class BatonPass implements Effect {
	move_effect_id: number = 128;
	abr: string = 'BTP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();
		// The actual stat passing logic should be handled by the battle system
		return new EffectResult(undefined, `${user.name} is passing the baton!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 130: Rapid Spin - Frees the user from binding moves, removes Leech Seed, and blows away Spikes
@injectable()
@registry([{ token: 'Effect', useClass: RapidSpin }])
class RapidSpin implements Effect {
	move_effect_id: number = 130;
	abr: string = 'RSP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();
		// Remove binding effects
		user.status = undefined;
		return new EffectResult(undefined, `${user.name} blew away hazards!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 131: Sonic Boom - Inflicts 20 points of damage
@injectable()
@registry([{ token: 'Effect', useClass: FixedDamage20 }])
class FixedDamage20 implements Effect {
	move_effect_id: number = 131;
	abr: string = 'FX20';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 20;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			target[0].removeHp(this.damages);
			return new EffectResult(undefined, `${target[0].name} took 20 damage!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 138: Sunny Day - Changes the weather to sunny for five turns
@injectable()
@registry([{ token: 'Effect', useClass: SunnyDay }])
class SunnyDay implements Effect {
	move_effect_id: number = 138;
	abr: string = 'SUN';
	duration: number = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const duration = user?.hasItem('Heat Rock') ? 8 : 5;
		const effect = new SunnyDay();
		effect.duration = duration;
		return new EffectResult(effect, 'The sunlight turned harsh!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The sunlight faded.');
		}
		return new EffectForTurn(true);
	}
}

// Effect 139: Has a chance to raise the user's Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: ChanceRaiseDefense }])
class ChanceRaiseDefense implements Effect {
	move_effect_id: number = 139;
	abr: string = 'DEF?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && Math.random() * 100 < this.effectChance) {
			user.changeBattleStats('defense', 1);
			return new EffectResult(undefined, `${user.name}'s Defense rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 140: Has a chance to raise the user's Attack by one stage
@injectable()
@registry([{ token: 'Effect', useClass: ChanceRaiseAttack }])
class ChanceRaiseAttack implements Effect {
	move_effect_id: number = 140;
	abr: string = 'ATK?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && Math.random() * 100 < this.effectChance) {
			user.changeBattleStats('attack', 1);
			return new EffectResult(undefined, `${user.name}'s Attack rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 143: Belly Drum - User pays half its max HP to max out its Attack
@injectable()
@registry([{ token: 'Effect', useClass: BellyDrum }])
class BellyDrum implements Effect {
	move_effect_id: number = 143;
	abr: string = 'BLD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		const hpCost = Math.floor(user.stats.hp / 2);
		if (user.currentHp <= hpCost) {
			return new EffectResult(undefined, 'But it failed!');
		}

		user.removeHp(hpCost);
		user.statsChanges.attack = 6; // Max out attack
		return new EffectResult(undefined, `${user.name} maximized its Attack!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 144: Psych Up - Discards the user's stat changes and copies the target's
@injectable()
@registry([{ token: 'Effect', useClass: PsychUp }])
class PsychUp implements Effect {
	move_effect_id: number = 144;
	abr: string = 'PSY';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		user.statsChanges = { ...target[0].statsChanges };
		return new EffectResult(undefined, `${user.name} copied the stat changes!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 145: Mirror Coat - Inflicts twice the damage the user received from the last special hit
@injectable()
@registry([{ token: 'Effect', useClass: MirrorCoat }])
class MirrorCoat implements Effect {
	move_effect_id: number = 145;
	abr: string = 'MRC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		const lastDamageTaken = user.lastDamageTaken || 0;
		if (lastDamageTaken <= 0) {
			return new EffectResult(undefined, 'But it failed!');
		}

		this.damages = lastDamageTaken * 2;
		target[0].removeHp(this.damages);
		return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 147: Sky Attack / Stomp flinch effect - Has a chance to make the target flinch
@injectable()
@registry([{ token: 'Effect', useClass: ChanceFlinchStomp }])
class ChanceFlinchStomp implements Effect {
	move_effect_id: number = 147;
	abr: string = 'FLN?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Flinch(), `${target[0].name} flinched!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 148: Earthquake - Inflicts regular damage and can hit Dig users
@injectable()
@registry([{ token: 'Effect', useClass: HitDigUsers }])
class HitDigUsers implements Effect {
	move_effect_id: number = 148;
	abr: string = 'DIG';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// This effect is handled in the accuracy/hit calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 149: Future Sight / Doom Desire - Hits the target two turns later
@injectable()
@registry([{ token: 'Effect', useClass: DelayedAttack }])
class DelayedAttack implements Effect {
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

// Effect 150: Thunder / Hurricane - Can hit Pokémon in the air
@injectable()
@registry([{ token: 'Effect', useClass: HitFlyingUsers }])
class HitFlyingUsers implements Effect {
	move_effect_id: number = 150;
	abr: string = 'FLY';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// This effect is handled in the accuracy/hit calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 151: Stomp / Body Slam flinch - Has a chance to make the target flinch (double vs Minimize)
@injectable()
@registry([{ token: 'Effect', useClass: ChanceFlinchMinimize }])
class ChanceFlinchMinimize implements Effect {
	move_effect_id: number = 151;
	abr: string = 'FLN!';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Flinch(), `${target[0].name} flinched!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 152: Solar Beam - Requires a turn to charge before attacking
@injectable()
@registry([{ token: 'Effect', useClass: SolarBeam }])
class SolarBeam implements Effect {
	move_effect_id: number = 152;
	abr: string = 'SOL';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	charging: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.charging) {
			this.charging = true;
			return new EffectResult(this, `${user?.name} is absorbing light!`);
		}
		this.charging = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.charging) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}

// Effect 153: Thunder - Has a chance to paralyze the target (100% in rain, 50% acc in sun)
@injectable()
@registry([{ token: 'Effect', useClass: ThunderEffect }])
class ThunderEffect implements Effect {
	move_effect_id: number = 153;
	abr: string = 'THN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Paralyze(), `${target[0].name} is paralyzed!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 154: Teleport - Immediately ends wild battles. No effect otherwise
@injectable()
@registry([{ token: 'Effect', useClass: Teleport }])
class Teleport implements Effect {
	move_effect_id: number = 154;
	abr: string = 'TLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Wild battle escape is handled by the battle system
		return new EffectResult(undefined, `${user?.name} teleported away!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 155: Beat Up - Hits once for every conscious Pokémon the trainer has
@injectable()
@registry([{ token: 'Effect', useClass: BeatUp }])
class BeatUp implements Effect {
	move_effect_id: number = 155;
	abr: string = 'BTU';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Multi-hit based on party is handled by battle system
		return new EffectResult(undefined, 'The party attacked together!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 159: Fake Out - Can only be used as the first move after the user enters battle. Causes flinch
@injectable()
@registry([{ token: 'Effect', useClass: FakeOut }])
class FakeOut implements Effect {
	move_effect_id: number = 159;
	abr: string = 'FKO';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			return new EffectResult(new Flinch(), `${target[0].name} flinched!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 160: Uproar - Forced to use this move for several turns. Pokémon cannot fall asleep
@injectable()
@registry([{ token: 'Effect', useClass: Uproar }])
class Uproar implements Effect {
	move_effect_id: number = 160;
	abr: string = 'UPR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();
		// Duration is 2-5 turns
		this.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(this, `${user.name} caused an uproar!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The uproar ended.');
		}
		return new EffectForTurn(true, `${user?.name} is making an uproar!`);
	}
}

// Effect 161: Stockpile - Stores energy up to three times for use with Spit Up and Swallow
@injectable()
@registry([{ token: 'Effect', useClass: Stockpile }])
class Stockpile implements Effect {
	move_effect_id: number = 161;
	abr: string = 'STK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	stockpileCount: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		if (this.stockpileCount >= 3) {
			return new EffectResult(undefined, 'But it failed!');
		}

		this.stockpileCount++;
		user.changeBattleStats('defense', 1);
		user.changeBattleStats('specialDefense', 1);
		return new EffectResult(this, `${user.name} stockpiled ${this.stockpileCount}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 162: Spit Up - Power is 100 times the amount of energy Stockpiled
@injectable()
@registry([{ token: 'Effect', useClass: SpitUp }])
class SpitUp implements Effect {
	move_effect_id: number = 162;
	abr: string = 'SPU';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on stockpile is handled in damage calculation
		return new EffectResult(undefined, 'Stockpile power was released!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 163: Swallow - Recovers HP based on Stockpile count
@injectable()
@registry([{ token: 'Effect', useClass: Swallow }])
class Swallow implements Effect {
	move_effect_id: number = 163;
	abr: string = 'SWL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		// This should check the stockpile count - for now just heal 1/4
		const healAmount = Math.floor(user.stats.hp / 4);
		user.heal(healAmount);
		return new EffectResult(undefined, `${user.name} recovered health!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 165: Hail - Changes the weather to a hailstorm for five turns
@injectable()
@registry([{ token: 'Effect', useClass: Hail }])
class Hail implements Effect {
	move_effect_id: number = 165;
	abr: string = 'HAL';
	duration: number = 5;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const duration = user?.hasItem('Icy Rock') ? 8 : 5;
		const effect = new Hail();
		effect.duration = duration;
		return new EffectResult(effect, 'It started to hail!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The hail stopped.');
		}
		// Damage non-Ice types
		if (!target.hasType('Ice')) {
			const damage = Math.floor(target.stats.hp / 16);
			target.removeHp(damage);
			return new EffectForTurn(true, `${target.name} is pelted by hail!`);
		}
		return new EffectForTurn(true);
	}
}

// Effect 166: Torment - Prevents the target from using the same move twice in a row
@injectable()
@registry([{ token: 'Effect', useClass: Torment }])
class Torment implements Effect {
	move_effect_id: number = 166;
	abr: string = 'TOR';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			return new EffectResult(this, `${target[0].name} was subjected to torment!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// Prevent same move twice logic is handled by battle system
		return new EffectForTurn(true);
	}
}

// Effect 167: Flatter - Raises the target's Special Attack by one stage and confuses
@injectable()
@registry([{ token: 'Effect', useClass: Flatter }])
class Flatter implements Effect {
	move_effect_id: number = 167;
	abr: string = 'FLT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		target[0].changeBattleStats('specialAttack', 1);
		const confusion = new Confusion();
		confusion.duration = Math.floor(Math.random() * 4) + 2;
		target[0].status = confusion;
		return new EffectResult(confusion, `${target[0].name}'s Sp. Attack rose! It became confused!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 168: Will-O-Wisp - Burns the target
@injectable()
@registry([{ token: 'Effect', useClass: WillOWisp }])
class WillOWisp implements Effect {
	move_effect_id: number = 168;
	abr: string = 'WOW';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		if (target[0].status || target[0].types.includes('fire')) {
			return new EffectResult(undefined, 'But it failed!');
		}

		const burn = new Burn();
		burn.damages = Math.floor(target[0].currentStats.hp / 16);
		target[0].status = burn;
		return new EffectResult(burn, `${target[0].name} was burned!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 169: Memento - Lowers the target's Attack and Special Attack by two stages. User faints
@injectable()
@registry([{ token: 'Effect', useClass: Memento }])
class Memento implements Effect {
	move_effect_id: number = 169;
	abr: string = 'MEM';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		target[0].changeBattleStats('attack', -2);
		target[0].changeBattleStats('specialAttack', -2);
		user.currentStats.hp = 0;
		user.fainted = true;
		return new EffectResult(undefined, `${user.name} fainted! ${target[0].name}'s stats fell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 175: Charge - Raises the user's Special Defense by one stage. Electric moves have doubled power next turn
@injectable()
@registry([{ token: 'Effect', useClass: Charge }])
class Charge implements Effect {
	move_effect_id: number = 175;
	abr: string = 'CHG';
	duration: number = 1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('specialDefense', 1);
		return new EffectResult(this, `${user.name} began charging power!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
		}
		return new EffectForTurn(true);
	}
}

// Effect 176: Taunt - For the next few turns, the target can only use damaging moves
@injectable()
@registry([{ token: 'Effect', useClass: Taunt }])
class Taunt implements Effect {
	move_effect_id: number = 176;
	abr: string = 'TNT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		// Duration is 3-5 turns
		this.duration = Math.floor(Math.random() * 3) + 3;
		return new EffectResult(this, `${target[0].name} fell for the taunt!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `${target.name}'s taunt wore off!`);
		}
		return new EffectForTurn(true);
	}
}

// Effect 177: Helping Hand - Ally's next move inflicts half more damage
@injectable()
@registry([{ token: 'Effect', useClass: HelpingHand }])
class HelpingHand implements Effect {
	move_effect_id: number = 177;
	abr: string = 'HLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0]) {
			return new EffectResult(this, `${user?.name} is ready to help ${target[0].name}!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 178: Trick/Switcheroo - User and target swap items
@injectable()
@registry([{ token: 'Effect', useClass: Trick }])
class Trick implements Effect {
	move_effect_id: number = 178;
	abr: string = 'TRK';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		// Item swap is handled by battle system
		return new EffectResult(undefined, `${user.name} swapped items with ${target[0].name}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 179: Role Play - Copies the target's ability
@injectable()
@registry([{ token: 'Effect', useClass: RolePlay }])
class RolePlay implements Effect {
	move_effect_id: number = 179;
	abr: string = 'RLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		return new EffectResult(undefined, `${user.name} copied ${target[0].name}'s ability!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 180: Wish - User will recover half its max HP at the end of the next turn
@injectable()
@registry([{ token: 'Effect', useClass: Wish }])
class Wish implements Effect {
	move_effect_id: number = 180;
	abr: string = 'WSH';
	duration: number = 2;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	healAmount: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		this.healAmount = Math.floor(user.stats.hp / 2);
		return new EffectResult(this, `${user.name} made a wish!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			target.heal(this.healAmount);
			return new EffectForTurn(true, `${target.name}'s wish came true!`);
		}
		return new EffectForTurn(true);
	}
}

// Effect 182: Ingrain - Prevents the user from leaving battle. User regains 1/16 of its max HP every turn
@injectable()
@registry([{ token: 'Effect', useClass: Ingrain }])
class Ingrain implements Effect {
	move_effect_id: number = 182;
	abr: string = 'ING';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		return new EffectResult(this, `${user.name} planted its roots!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		const healAmount = Math.floor(target.stats.hp / 16);
		target.heal(healAmount);
		return new EffectForTurn(true, `${target.name} absorbed nutrients with its roots!`);
	}
}

// Effect 183: Superpower - Lowers the user's Attack and Defense by one stage after inflicting damage
@injectable()
@registry([{ token: 'Effect', useClass: Superpower }])
class Superpower implements Effect {
	move_effect_id: number = 183;
	abr: string = 'SPP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('attack', -1);
		user.changeBattleStats('defense', -1);
		return new EffectResult(undefined, `${user.name}'s Attack and Defense fell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 184: Magic Coat - Reflects back the first effect move used on the user this turn
@injectable()
@registry([{ token: 'Effect', useClass: MagicCoat }])
class MagicCoat implements Effect {
	move_effect_id: number = 184;
	abr: string = 'MGC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		return new EffectResult(this, `${user.name} shrouded itself with Magic Coat!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 185: Recycle - User recovers the item it last used up
@injectable()
@registry([{ token: 'Effect', useClass: Recycle }])
class Recycle implements Effect {
	move_effect_id: number = 185;
	abr: string = 'RCY';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		// Item recovery is handled by battle system
		return new EffectResult(undefined, `${user.name} found one item!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 186: Revenge/Avalanche - Inflicts double damage if the user takes damage before attacking this turn
@injectable()
@registry([{ token: 'Effect', useClass: Revenge }])
class Revenge implements Effect {
	move_effect_id: number = 186;
	abr: string = 'RVG';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 187: Brick Break - Destroys Reflect and Light Screen
@injectable()
@registry([{ token: 'Effect', useClass: BrickBreak }])
class BrickBreak implements Effect {
	move_effect_id: number = 187;
	abr: string = 'BRK';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Screen breaking is handled by battle system
		return new EffectResult(undefined, 'The wall shattered!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 188: Yawn - Target sleeps at the end of the next turn
@injectable()
@registry([{ token: 'Effect', useClass: Yawn }])
class Yawn implements Effect {
	move_effect_id: number = 188;
	abr: string = 'YWN';
	duration: number = 2;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

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

// Effect 189: Knock Off - Target drops its held item
@injectable()
@registry([{ token: 'Effect', useClass: KnockOff }])
class KnockOff implements Effect {
	move_effect_id: number = 189;
	abr: string = 'KOF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		// Item removal is handled by battle system
		return new EffectResult(undefined, `${target[0].name} dropped its item!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 190: Endeavor - Lowers the target's HP to equal the user's
@injectable()
@registry([{ token: 'Effect', useClass: Endeavor }])
class Endeavor implements Effect {
	move_effect_id: number = 190;
	abr: string = 'END';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		if (target[0].currentHp <= user.currentHp) {
			return new EffectResult(undefined, 'But it failed!');
		}

		const damage = target[0].currentHp - user.currentHp;
		target[0].removeHp(damage);
		return new EffectResult(undefined, `${target[0].name}'s HP was reduced to ${user.currentHp}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 191: Eruption/Water Spout - Inflicts more damage when the user has more HP remaining
@injectable()
@registry([{ token: 'Effect', useClass: EruptionWaterSpout }])
class EruptionWaterSpout implements Effect {
	move_effect_id: number = 191;
	abr: string = 'ERU';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on HP is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 193: Imprison - Prevents the target from using any moves that the user also knows
@injectable()
@registry([{ token: 'Effect', useClass: Imprison }])
class Imprison implements Effect {
	move_effect_id: number = 193;
	abr: string = 'IMP';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		return new EffectResult(this, `${user.name} sealed any moves its target shares with it!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 194: Refresh - Cleanses the user of a burn, paralysis, or poison
@injectable()
@registry([{ token: 'Effect', useClass: Refresh }])
class Refresh implements Effect {
	move_effect_id: number = 194;
	abr: string = 'RFR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		if (
			user.status?.abr === 'BRN' ||
			user.status?.abr === 'PAR' ||
			user.status?.abr === 'PSN' ||
			user.status?.abr === 'PSN+'
		) {
			user.status = undefined;
			return new EffectResult(undefined, `${user.name} was cured of its status!`);
		}
		return new EffectResult(undefined, 'But it failed!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 195: Grudge - If the user faints this turn, the PP of the move that fainted it drops to 0
@injectable()
@registry([{ token: 'Effect', useClass: Grudge }])
class Grudge implements Effect {
	move_effect_id: number = 195;
	abr: string = 'GRD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_FAINT;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		return new EffectResult(this, `${user.name} wants its target to bear a grudge!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 197: Low Kick/Grass Knot - Inflicts more damage to heavier targets
@injectable()
@registry([{ token: 'Effect', useClass: WeightBasedDamage }])
class WeightBasedDamage implements Effect {
	move_effect_id: number = 197;
	abr: string = 'WGT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on weight is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 203: Cross Poison - Has a chance to badly poison the target
@injectable()
@registry([{ token: 'Effect', useClass: ChanceBadlyPoison }])
class ChanceBadlyPoison implements Effect {
	move_effect_id: number = 203;
	abr: string = 'TOX?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			const badlyPoison = new BadlyPoison();
			badlyPoison.damages = Math.floor(target[0].currentStats.hp / 16);
			target[0].status = badlyPoison;
			return new EffectResult(badlyPoison, `${target[0].name} was badly poisoned!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 205: Overheat/Draco Meteor - Lowers the user's Special Attack by two stages
@injectable()
@registry([{ token: 'Effect', useClass: LowerUserSpAtk2 }])
class LowerUserSpAtk2 implements Effect {
	move_effect_id: number = 205;
	abr: string = 'SPA--';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('specialAttack', -2);
		return new EffectResult(undefined, `${user.name}'s Special Attack harshly fell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 206: Tickle - Lowers the target's Attack and Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: Tickle }])
class Tickle implements Effect {
	move_effect_id: number = 206;
	abr: string = 'TKL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		target[0].changeBattleStats('attack', -1);
		target[0].changeBattleStats('defense', -1);
		return new EffectResult(undefined, `${target[0].name}'s Attack and Defense fell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 207: Cosmic Power - Raises the user's Defense and Special Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: CosmicPower }])
class CosmicPower implements Effect {
	move_effect_id: number = 207;
	abr: string = 'COS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('defense', 1);
		user.changeBattleStats('specialDefense', 1);
		return new EffectResult(undefined, `${user.name}'s Defense and Sp. Def rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 209: Bulk Up - Raises the user's Attack and Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: BulkUp }])
class BulkUp implements Effect {
	move_effect_id: number = 209;
	abr: string = 'BLK';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('attack', 1);
		user.changeBattleStats('defense', 1);
		return new EffectResult(undefined, `${user.name}'s Attack and Defense rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 211: Mud Sport - Halves all Fire-type damage
@injectable()
@registry([{ token: 'Effect', useClass: MudSport }])
class MudSport implements Effect {
	move_effect_id: number = 211;
	abr: string = 'MUD';
	duration: number = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, "Fire's power was weakened!");
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
		}
		return new EffectForTurn(true);
	}
}

// Effect 212: Calm Mind - Raises the user's Special Attack and Special Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: CalmMind }])
class CalmMind implements Effect {
	move_effect_id: number = 212;
	abr: string = 'CLM';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('specialAttack', 1);
		user.changeBattleStats('specialDefense', 1);
		return new EffectResult(undefined, `${user.name}'s Sp. Attack and Sp. Def rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 213: Dragon Dance - Raises the user's Attack and Speed by one stage
@injectable()
@registry([{ token: 'Effect', useClass: DragonDance }])
class DragonDance implements Effect {
	move_effect_id: number = 213;
	abr: string = 'DDN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('attack', 1);
		user.changeBattleStats('speed', 1);
		return new EffectResult(undefined, `${user.name}'s Attack and Speed rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 215: Roost - Heals the user by half its max HP
@injectable()
@registry([{ token: 'Effect', useClass: Roost }])
class Roost implements Effect {
	move_effect_id: number = 215;
	abr: string = 'RST';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		const healAmount = Math.floor(user.stats.hp / 2);
		user.heal(healAmount);
		return new EffectResult(undefined, `${user.name} regained health!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 217: Miracle Eye - Forces the target to have no evasion, Dark takes Psychic damage
@injectable()
@registry([{ token: 'Effect', useClass: MiracleEye }])
class MiracleEye implements Effect {
	move_effect_id: number = 217;
	abr: string = 'MRE';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		target[0].statsChanges.evasion = 0;
		return new EffectResult(this, `${target[0].name} was identified!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		target.statsChanges.evasion = 0;
		return new EffectForTurn(true);
	}
}

// Effect 218: Wake-Up Slap - If the target is asleep, has double power and wakes it up
@injectable()
@registry([{ token: 'Effect', useClass: WakeUpSlap }])
class WakeUpSlap implements Effect {
	move_effect_id: number = 218;
	abr: string = 'WUS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		if (target[0].status?.abr === 'SLP') {
			target[0].status = undefined;
			return new EffectResult(undefined, `${target[0].name} woke up!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 219: Hammer Arm - Lowers user's Speed by one stage
@injectable()
@registry([{ token: 'Effect', useClass: LowerUserSpeed }])
class LowerUserSpeed implements Effect {
	move_effect_id: number = 219;
	abr: string = 'SPE-';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('speed', -1);
		return new EffectResult(undefined, `${user.name}'s Speed fell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 220: Gyro Ball - Power raises when the user has lower Speed
@injectable()
@registry([{ token: 'Effect', useClass: GyroBall }])
class GyroBall implements Effect {
	move_effect_id: number = 220;
	abr: string = 'GYR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on speed difference is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 221: Healing Wish - User faints. Its replacement has its HP fully restored
@injectable()
@registry([{ token: 'Effect', useClass: HealingWish }])
class HealingWish implements Effect {
	move_effect_id: number = 221;
	abr: string = 'HLW';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.currentStats.hp = 0;
		user.fainted = true;
		return new EffectResult(this, `${user.name}'s healing wish came true for its ally!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 222: Brine - Has double power against Pokémon that have less than half their max HP remaining
@injectable()
@registry([{ token: 'Effect', useClass: Brine }])
class Brine implements Effect {
	move_effect_id: number = 222;
	abr: string = 'BRN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 224: Feint - Hits through Protect and Detect
@injectable()
@registry([{ token: 'Effect', useClass: Feint }])
class Feint implements Effect {
	move_effect_id: number = 224;
	abr: string = 'FNT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Protect breaking is handled in battle system
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 226: Tailwind - For three turns, friendly Pokémon have doubled Speed
@injectable()
@registry([{ token: 'Effect', useClass: Tailwind }])
class Tailwind implements Effect {
	move_effect_id: number = 226;
	abr: string = 'TLW';
	duration: number = 4;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, 'A tailwind blew from behind your team!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The tailwind petered out!');
		}
		return new EffectForTurn(true);
	}
}

// Effect 229: U-turn/Volt Switch - User must switch out after attacking
@injectable()
@registry([{ token: 'Effect', useClass: UTurn }])
class UTurn implements Effect {
	move_effect_id: number = 229;
	abr: string = 'UTN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		// Force switch is handled by battle system
		return new EffectResult(undefined, `${user.name} went back!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 230: Close Combat - Lowers the user's Defense and Special Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: CloseCombat }])
class CloseCombat implements Effect {
	move_effect_id: number = 230;
	abr: string = 'CC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('defense', -1);
		user.changeBattleStats('specialDefense', -1);
		return new EffectResult(undefined, `${user.name}'s Defense and Sp. Def fell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 231: Payback - Power is doubled if the target has already moved this turn
@injectable()
@registry([{ token: 'Effect', useClass: Payback }])
class Payback implements Effect {
	move_effect_id: number = 231;
	abr: string = 'PBK';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 232: Assurance - Power is doubled if the target has already received damage this turn
@injectable()
@registry([{ token: 'Effect', useClass: Assurance }])
class Assurance implements Effect {
	move_effect_id: number = 232;
	abr: string = 'ASR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 238: Wring Out/Crush Grip - Power increases against targets with more HP remaining
@injectable()
@registry([{ token: 'Effect', useClass: WringOut }])
class WringOut implements Effect {
	move_effect_id: number = 238;
	abr: string = 'WRO';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on target HP is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 240: Gastro Acid - Nullifies target's ability until it leaves battle
@injectable()
@registry([{ token: 'Effect', useClass: GastroAcid }])
class GastroAcid implements Effect {
	move_effect_id: number = 240;
	abr: string = 'GAC';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		// Ability suppression is handled by battle system
		return new EffectResult(this, `${target[0].name}'s Ability was suppressed!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 247: Last Resort - Can only be used after all of the user's other moves have been used
@injectable()
@registry([{ token: 'Effect', useClass: LastResort }])
class LastResort implements Effect {
	move_effect_id: number = 247;
	abr: string = 'LRS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Move usage check is handled by battle system
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 248: Worry Seed - Changes the target's ability to Insomnia
@injectable()
@registry([{ token: 'Effect', useClass: WorrySeed }])
class WorrySeed implements Effect {
	move_effect_id: number = 248;
	abr: string = 'WRS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		return new EffectResult(undefined, `${target[0].name}'s ability became Insomnia!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 250: Toxic Spikes - Scatters poisoned spikes, poisoning opposing Pokémon that switch in
@injectable()
@registry([{ token: 'Effect', useClass: ToxicSpikes }])
class ToxicSpikes implements Effect {
	move_effect_id: number = 250;
	abr: string = 'TSK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	layers: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (this.layers >= 2) {
			return new EffectResult(undefined, 'But it failed!');
		}
		this.layers++;
		return new EffectResult(this, 'Poison spikes were scattered on the ground!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (!target.hasType('Poison') && !target.hasType('Steel') && !target.hasType('Flying')) {
			if (this.layers === 1) {
				const poison = new Poison();
				poison.damages = Math.floor(target.stats.hp / 16);
				target.status = poison;
				return new EffectForTurn(true, `${target.name} was poisoned!`);
			} else {
				const badlyPoison = new BadlyPoison();
				badlyPoison.damages = Math.floor(target.stats.hp / 16);
				target.status = badlyPoison;
				return new EffectForTurn(true, `${target.name} was badly poisoned!`);
			}
		}
		return new EffectForTurn(true);
	}
}

// Effect 252: Aqua Ring - Restores 1/16 of the user's max HP each turn
@injectable()
@registry([{ token: 'Effect', useClass: AquaRing }])
class AquaRing implements Effect {
	move_effect_id: number = 252;
	abr: string = 'AQR';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		return new EffectResult(this, `${user.name} surrounded itself with a veil of water!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		const healAmount = Math.floor(target.stats.hp / 16);
		target.heal(healAmount);
		return new EffectForTurn(true, `Aqua Ring restored ${target.name}'s HP!`);
	}
}

// Effect 253: Magnet Rise - User is immune to Ground moves and effects for five turns
@injectable()
@registry([{ token: 'Effect', useClass: MagnetRise }])
class MagnetRise implements Effect {
	move_effect_id: number = 253;
	abr: string = 'MGR';
	duration: number = 5;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		return new EffectResult(this, `${user.name} levitated with electromagnetism!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The electromagnetism wore off.');
		}
		return new EffectForTurn(true);
	}
}

// Effect 254: Flare Blitz - User takes 1/3 the damage inflicted in recoil. Has a chance to burn
@injectable()
@registry([{ token: 'Effect', useClass: FlareBlitz }])
class FlareBlitz implements Effect {
	move_effect_id: number = 254;
	abr: string = 'FLB';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		// Recoil damage
		if (this.damages > 0) {
			const recoilDamage = Math.floor(this.damages / 3);
			user.removeHp(recoilDamage);
		}

		// Chance to burn
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			const burn = new Burn();
			burn.damages = Math.floor(target[0].currentStats.hp / 16);
			target[0].status = burn;
			return new EffectResult(
				burn,
				`${user.name} is damaged by recoil! ${target[0].name} was burned!`
			);
		}
		return new EffectResult(undefined, `${user.name} is damaged by recoil!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 256: Dive - User dives underwater, dodging all attacks, and hits next turn
@injectable()
@registry([{ token: 'Effect', useClass: Dive }])
class Dive implements Effect {
	move_effect_id: number = 256;
	abr: string = 'DIV';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	diving: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.diving) {
			this.diving = true;
			return new EffectResult(this, `${user?.name} dove underwater!`);
		}
		this.diving = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.diving) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}

// Effect 257: Dig - User digs underground, dodging all attacks, and hits next turn
@injectable()
@registry([{ token: 'Effect', useClass: Dig }])
class Dig implements Effect {
	move_effect_id: number = 257;
	abr: string = 'DIG';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	digging: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.digging) {
			this.digging = true;
			return new EffectResult(this, `${user?.name} dug a hole!`);
		}
		this.digging = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.digging) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}

// Effect 261: Freeze Dry - Has a chance to freeze the target
@injectable()
@registry([{ token: 'Effect', useClass: ChanceFreeze }])
class ChanceFreeze implements Effect {
	move_effect_id: number = 261;
	abr: string = 'FRZ?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			if (target[0].types.includes('ice')) return new EffectResult();
			return new EffectResult(new Freeze(), `${target[0].name} was frozen solid!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 264: Bounce - User bounces high into the air, dodging all attacks, and hits next turn
@injectable()
@registry([{ token: 'Effect', useClass: Bounce }])
class Bounce implements Effect {
	move_effect_id: number = 264;
	abr: string = 'BNC';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	bouncing: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.bouncing) {
			this.bouncing = true;
			return new EffectResult(this, `${user?.name} sprang up!`);
		}
		this.bouncing = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.bouncing) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}

// Effect 267: Stealth Rock - Causes damage when opposing Pokémon switch in
@injectable()
@registry([{ token: 'Effect', useClass: StealthRock }])
class StealthRock implements Effect {
	move_effect_id: number = 267;
	abr: string = 'SRK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, 'Pointed stones float in the air around the opposing team!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// Damage based on type effectiveness to Rock
		const baseDamage = Math.floor(target.stats.hp / 8);
		target.removeHp(baseDamage);
		return new EffectForTurn(true, `${target.name} was hurt by the pointed stones!`);
	}
}

// Effect 275: Ice Fang/Fire Fang etc. - Has a chance to freeze and flinch
@injectable()
@registry([{ token: 'Effect', useClass: ChanceFreezeAndFlinch }])
class ChanceFreezeAndFlinch implements Effect {
	move_effect_id: number = 275;
	abr: string = 'FFN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		let message = '';

		// Chance to freeze
		if (!target[0].status && Math.random() * 100 < this.effectChance) {
			if (!target[0].types.includes('ice')) {
				target[0].status = new Freeze();
				message += `${target[0].name} was frozen solid! `;
			}
		}

		// Chance to flinch
		if (Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Flinch(), message + `${target[0].name} flinched!`);
		}

		return message ? new EffectResult(undefined, message) : new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 276: Thunder Fang etc. - Has a chance to paralyze and flinch
@injectable()
@registry([{ token: 'Effect', useClass: ChanceParalyzeAndFlinch }])
class ChanceParalyzeAndFlinch implements Effect {
	move_effect_id: number = 276;
	abr: string = 'PFN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		let message = '';

		// Chance to paralyze
		if (!target[0].status && Math.random() * 100 < this.effectChance) {
			target[0].status = new Paralyze();
			message += `${target[0].name} is paralyzed! `;
		}

		// Chance to flinch
		if (Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Flinch(), message + `${target[0].name} flinched!`);
		}

		return message ? new EffectResult(undefined, message) : new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 277: Charge Beam - Has a chance to raise the user's Special Attack by one stage
@injectable()
@registry([{ token: 'Effect', useClass: ChanceRaiseSpAtk }])
class ChanceRaiseSpAtk implements Effect {
	move_effect_id: number = 277;
	abr: string = 'SPA?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 70;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && Math.random() * 100 < this.effectChance) {
			user.changeBattleStats('specialAttack', 1);
			return new EffectResult(undefined, `${user.name}'s Special Attack rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 283: Psyshock - Inflicts damage based on the target's Defense, not Special Defense
@injectable()
@registry([{ token: 'Effect', useClass: Psyshock }])
class Psyshock implements Effect {
	move_effect_id: number = 283;
	abr: string = 'PSS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Damage calculation using Defense is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 285: Autotomize - Raises the user's Speed by two stages and halves the user's weight
@injectable()
@registry([{ token: 'Effect', useClass: Autotomize }])
class Autotomize implements Effect {
	move_effect_id: number = 285;
	abr: string = 'ATM';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('speed', 2);
		return new EffectResult(undefined, `${user.name} became nimble!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 290: Earthquake in doubles - Deals splash damage to Pokémon next to the target
@injectable()
@registry([{ token: 'Effect', useClass: SplashDamage }])
class SplashDamage implements Effect {
	move_effect_id: number = 290;
	abr: string = 'SPL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Splash damage in doubles is handled by battle system
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 291: Quiver Dance - Raises the user's Special Attack, Special Defense, and Speed by one stage each
@injectable()
@registry([{ token: 'Effect', useClass: QuiverDance }])
class QuiverDance implements Effect {
	move_effect_id: number = 291;
	abr: string = 'QVD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('specialAttack', 1);
		user.changeBattleStats('specialDefense', 1);
		user.changeBattleStats('speed', 1);
		return new EffectResult(undefined, `${user.name}'s Sp. Atk, Sp. Def, and Speed rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 294: Electro Ball - Power is higher when the user has greater Speed than the target
@injectable()
@registry([{ token: 'Effect', useClass: ElectroBall }])
class ElectroBall implements Effect {
	move_effect_id: number = 294;
	abr: string = 'ELB';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on speed difference is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 296: Flame Charge - Inflicts regular damage. Raises the user's Speed by one stage
@injectable()
@registry([{ token: 'Effect', useClass: FlameCharge }])
class FlameCharge implements Effect {
	move_effect_id: number = 296;
	abr: string = 'FLC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('speed', 1);
		return new EffectResult(undefined, `${user.name}'s Speed rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 304: Chip Away - Ignores the target's stat modifiers
@injectable()
@registry([{ token: 'Effect', useClass: ChipAway }])
class ChipAway implements Effect {
	move_effect_id: number = 304;
	abr: string = 'CHP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Ignoring stat modifiers is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 305: Haze/Clear Smog - Removes all of the target's stat modifiers
@injectable()
@registry([{ token: 'Effect', useClass: ClearStats }])
class ClearStats implements Effect {
	move_effect_id: number = 305;
	abr: string = 'CLR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		target[0].statsChanges = {
			attack: 0,
			defense: 0,
			specialAttack: 0,
			specialDefense: 0,
			speed: 0,
			accuracy: 0,
			evasion: 0,
			hp: 0,
			total: 0
		};
		return new EffectResult(undefined, `${target[0].name}'s stat changes were eliminated!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 309: Shell Smash - Raises Attack, Special Attack, and Speed by two stages. Lowers Defense and Special Defense by one stage
@injectable()
@registry([{ token: 'Effect', useClass: ShellSmash }])
class ShellSmash implements Effect {
	move_effect_id: number = 309;
	abr: string = 'SMS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('attack', 2);
		user.changeBattleStats('specialAttack', 2);
		user.changeBattleStats('speed', 2);
		user.changeBattleStats('defense', -1);
		user.changeBattleStats('specialDefense', -1);
		return new EffectResult(undefined, `${user.name} smashed its shell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 310: Heal Pulse - Heals the target for half its max HP
@injectable()
@registry([{ token: 'Effect', useClass: HealPulse }])
class HealPulse implements Effect {
	move_effect_id: number = 310;
	abr: string = 'HLP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) return new EffectResult();

		const healAmount = Math.floor(target[0].stats.hp / 2);
		target[0].heal(healAmount);
		return new EffectResult(undefined, `${target[0].name} had its HP restored!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 311: Hex - Has double power if the target has a major status ailment
@injectable()
@registry([{ token: 'Effect', useClass: Hex }])
class Hex implements Effect {
	move_effect_id: number = 311;
	abr: string = 'HEX';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling for status is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 314: Circle Throw/Dragon Tail - Ends wild battles. Forces trainers to switch Pokémon
@injectable()
@registry([{ token: 'Effect', useClass: CircleThrow }])
class CircleThrow implements Effect {
	move_effect_id: number = 314;
	abr: string = 'CTR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Force switch is handled by battle system
		return new EffectResult(undefined, `${target[0]?.name} was forced to switch out!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 317: Work Up - Raises the user's Attack and Special Attack by one stage
@injectable()
@registry([{ token: 'Effect', useClass: WorkUp }])
class WorkUp implements Effect {
	move_effect_id: number = 317;
	abr: string = 'WKU';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('attack', 1);
		user.changeBattleStats('specialAttack', 1);
		return new EffectResult(undefined, `${user.name}'s Attack and Sp. Attack rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 318: Acrobatics - Has double power if the user has no held item
@injectable()
@registry([{ token: 'Effect', useClass: Acrobatics }])
class Acrobatics implements Effect {
	move_effect_id: number = 318;
	abr: string = 'ACR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling for no item is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 320: Retaliate - Has double power if a friendly Pokémon fainted last turn
@injectable()
@registry([{ token: 'Effect', useClass: Retaliate }])
class Retaliate implements Effect {
	move_effect_id: number = 320;
	abr: string = 'RTL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

// Effect 321: Final Gambit - Inflicts damage equal to the user's remaining HP. User faints
@injectable()
@registry([{ token: 'Effect', useClass: FinalGambit }])
class FinalGambit implements Effect {
	move_effect_id: number = 321;
	abr: string = 'FGB';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		const damage = user.currentHp;
		target[0].removeHp(damage);
		user.currentStats.hp = 0;
		user.fainted = true;
		return new EffectResult(undefined, `${user.name} sacrificed itself to deal ${damage} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 323: Coil - Raises the user's Attack, Defense, and accuracy by one stage each
@injectable()
@registry([{ token: 'Effect', useClass: Coil }])
class Coil implements Effect {
	move_effect_id: number = 323;
	abr: string = 'COL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('attack', 1);
		user.changeBattleStats('defense', 1);
		user.changeBattleStats('accuracy', 1);
		return new EffectResult(undefined, `${user.name}'s Attack, Defense, and accuracy rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 324: Bestow - Gives the user's held item to the target
@injectable()
@registry([{ token: 'Effect', useClass: Bestow }])
class Bestow implements Effect {
	move_effect_id: number = 324;
	abr: string = 'BST';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) return new EffectResult();

		// Item giving is handled by battle system
		return new EffectResult(undefined, `${user.name} gave its item to ${target[0].name}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 328: Rototiller - Raises the Attack and Special Attack of Grass-types
@injectable()
@registry([{ token: 'Effect', useClass: Rototiller }])
class Rototiller implements Effect {
	move_effect_id: number = 328;
	abr: string = 'ROT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		if (user.hasType('Grass')) {
			user.changeBattleStats('attack', 1);
			user.changeBattleStats('specialAttack', 1);
			return new EffectResult(undefined, `${user.name}'s Attack and Sp. Attack rose!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 329: Cotton Guard - Raises the user's Defense by three stages
@injectable()
@registry([{ token: 'Effect', useClass: CottonGuard }])
class CottonGuard implements Effect {
	move_effect_id: number = 329;
	abr: string = 'CTG';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) return new EffectResult();

		user.changeBattleStats('defense', 3);
		return new EffectResult(undefined, `${user.name}'s Defense drastically rose!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

// Effect 334: Hurricane confuse chance
@injectable()
@registry([{ token: 'Effect', useClass: HurricaneConfuse }])
class HurricaneConfuse implements Effect {
	move_effect_id: number = 334;
	abr: string = 'HRC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			const confusion = new Confusion();
			confusion.duration = Math.floor(Math.random() * 4) + 2;
			return new EffectResult(confusion, `${target[0].name} became confused!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}

class UnknownEffect implements Effect {
	damages: number = 0;
	abr: string = '???';
	duration: number = 0;
	move_effect_id: number = 0;
	when: EffectTiming = EffectTiming.START_TURN;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[]): EffectResult {
		return new EffectResult(undefined, 'Effect not implemented yet...');
	}

	playEffect(target: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true, 'Effect not implemented yet...');
	}
}

@singleton()
export class MoveEffectApplier {
	constructor(@injectAll('Effect') private moveEffects: Effect[]) {}

	public apply(moveEffect: MoveEffect, target: PokemonInstance[], user: PokemonInstance) {
		return (
			this.findEffect(moveEffect)?.apply(target, user) || new EffectResult(new UnknownEffect())
		);
	}

	public findEffect(moveEffect: MoveEffect) {
		return (
			this.moveEffects.find((effect) => effect.move_effect_id === moveEffect.move_effect_id) ||
			new UnknownEffect()
		);
	}
}
