import "@abraham/reflection";
import { injectable, injectAll, registry, singleton } from "tsyringe";
import type { PokemonInstance } from "./pokedex";
import { MoveEffect } from "./pokedex";

export enum EffectTiming {
    START_TURN = "start-turn",
    END_TURN = "end-turn",
    BEFORE_MOVE = "before-move",
    AFTER_MOVE = "after-move",
    BEFORE_SWITCH = "before-switch",
    AFTER_SWITCH = "after-switch",
    BEFORE_FAINT = "before-faint",
    AFTER_FAINT = "after-faint"
}

export class EffectResult {
    message?: string; // TODO duo battles ? string[] required and check effect chance here
    effect?: Effect;

    constructor(effect?: Effect, message?: string) {
        this.message = message;
        this.effect = effect;
    }
}

export class EffectForTurn {
    message?: string;
    canPlay?: boolean = true;

    constructor(canPlay?: boolean, message?: string) {
        this.canPlay = canPlay;
        this.message = message;
    }
}

export interface Effect {
    move_effect_id: number;
    abr: string;
    duration: number;
    when: EffectTiming;
    damages: number;

    turnsPassed: number;
    healed: boolean;

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult;

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn;
}

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

    constructor() {
    }

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

    constructor() {
    }

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        console.log('Poison');
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

    constructor() {
    }

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        console.log('burn');
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

    constructor() {

    }

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        return new EffectResult(new Freeze(), `${target[0].name} is frozen`);
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        if (Math.random() < 0.2) {
            this.healed = true;
            target.status = undefined;
        }

        return new EffectForTurn(this.healed, this.healed ? `${target.name} thawed out` : `${target.name} is frozen solid`);
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

    constructor() {
    }

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        console.log('paralyse');
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
        'acid-armor', 'acupressure', 'after-you', 'agility', 'ally-switch', 'amnesia',
        'aqua-ring', 'aromatherapy', 'aromatic-mist', 'assist', 'autotomize', 'barrier',
        'baton-pass', 'belch', 'belly-drum', 'bide', 'bulk-up', 'calm-mind', 'camouflage',
        'celebrate', 'charge', 'coil', 'conversion', 'conversion-2', 'copycat', 'cosmic-power',
        'cotton-guard', 'counter', 'crafty-shield', 'curse', 'defend-order', 'defense-curl',
        'destiny-bond', 'detect', 'doom-desire', 'double-team', 'dragon-dance', 'electric-terrain',
        'endure', 'final-gambit', 'flower-shield', 'focus-energy', 'focus-punch', 'follow-me',
        'future-sight', 'geomancy', 'grassy-terrain', 'gravity', 'growth', 'grudge', 'guard-split',
        'hail', 'happy-hour', 'harden', 'haze', 'heal-bell', 'heal-order', 'heal-pulse',
        'healing-wish', 'helping-hand', 'hold-hands', 'hone-claws', 'howl', 'imprison', 'ingrain',
        'ion-deluge', 'iron-defense', 'kings-shield', 'light-screen', 'lucky-chant', 'lunar-dance',
        'magic-coat', 'magnet-rise', 'magnetic-flux', 'mat-block', 'me-first', 'meditate',
        'metronome', 'milk-drink', 'mimic', 'minimize', 'mirror-coat', 'mirror-move', 'mist',
        'misty-terrain', 'moonlight', 'morning-sun', 'mud-sport', 'nasty-plot', 'nature-power',
        'perish-song', 'power-split', 'power-trick', 'protect', 'psych-up', 'quick-guard',
        'quiver-dance', 'rage-powder', 'rain-dance', 'recover', 'recycle', 'reflect', 'reflect-type',
        'refresh', 'rest', 'rock-polish', 'role-play', 'roost', 'rototiller', 'safeguard',
        'sandstorm', 'shadow-blast', 'shadow-bolt', 'shadow-half', 'shadow-rush', 'shadow-shed',
        'shadow-sky', 'shadow-storm', 'shadow-wave', 'sharpen', 'shell-smash', 'shift-gear',
        'sketch', 'slack-off', 'sleep-talk', 'snatch', 'soft-boiled', 'spikes', 'spiky-shield',
        'spit-up', 'splash', 'stealth-rock', 'sticky-web', 'stockpile', 'struggle', 'substitute',
        'sunny-day', 'swallow', 'swords-dance', 'synthesis', 'tail-glow', 'tailwind', 'teleport',
        'toxic-spikes', 'transform', 'water-sport', 'wide-guard', 'wish', 'withdraw', 'work-up'
    ]);

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (!target[0]?.lastMove) {
            return new EffectResult(undefined, "But it failed!");
        }

        // Check if the move can be copied
        if (this.IGNORED_MOVES.has(target[0].lastMove.name.toLowerCase())) {
            return new EffectResult(undefined, "The move cannot be copied!");
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
            const damage = Math.floor(target.currentStats.attack * 40 / target.currentStats.defense / 50 + 2);
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
@registry([{ token: 'Effect', useClass: RaiseEvasion }])
class RaiseEvasion implements Effect {
    move_effect_id: number = 17;
    abr: string = 'DEF+';
    duration: number = 0;
    when: EffectTiming = EffectTiming.AFTER_MOVE;
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (user) {
            user.changeBattleStats('evasion', 1);
            return new EffectResult(undefined, `${user.name}'s evasion rose`);
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
@registry([{ token: 'Effect', useClass: RaiseAccuracy }])
class RaiseAccuracy implements Effect {
    move_effect_id: number = 26;
    abr: string = 'ACC+';
    duration: number = 0;
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
        const damage = Math.floor((this.damages * this.turnsPassed));
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
@registry([{ token: 'Effect', useClass: LightScreen }])
class LightScreen implements Effect {
    move_effect_id: number = 36;
    abr: string = 'LSC';
    duration: number = 5;  // 5 turns by default, 8 with Light Clay
    when: EffectTiming = EffectTiming.BEFORE_MOVE;
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (user) {
            let lightScreen = new LightScreen();
            // Check for Light Clay (would need to be implemented in item system)
            // if (user.hasItem('Light Clay')) {
            //     lightScreen.duration = 8;
            // }
            return new EffectResult(lightScreen, `Light Screen raised ${user.name}'s team's Special Defense!`);
        }
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        this.turnsPassed++;
        
        if (this.turnsPassed >= this.duration) {
            this.healed = true;
            return new EffectForTurn(true, `The Light Screen wore off!`);
        }
        
        // The actual damage reduction should be handled in the damage calculation
        return new EffectForTurn(true);
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
    damages: number = 40;  // Fixed damage amount

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
@registry([{
    token: "Effect",
    useValue: "stat-protect"
}])
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

        return new EffectResult(this, "A protective mist surrounds your team!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn(true, "The mist prevents stat changes!");
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

    constructor(@injectAll('Effect') private moveEffects: Effect[]) {
    }

    public apply(moveEffect: MoveEffect, target: PokemonInstance[], user: PokemonInstance) {
        return this.findEffect(moveEffect)?.apply(target, user) || new EffectResult(new UnknownEffect());
    }

    public findEffect(moveEffect: MoveEffect) {
        return this.moveEffects.find(effect => effect.move_effect_id === moveEffect.move_effect_id) || new UnknownEffect();
    }
}
