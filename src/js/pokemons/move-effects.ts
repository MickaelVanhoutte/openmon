import "@abraham/reflection";
import { injectable, injectAll, registry, singleton } from "tsyringe";
import { PokemonInstance, MoveInstance } from "./pokedex";
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
@registry([{ token: 'Effect', useClass: Reflect }])
class Reflect implements Effect {
    move_effect_id = 36;
    abr = "RFL";
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
            return new EffectResult(undefined, "But it failed!");
        }
        this.duration = user.hasItem('Light Clay') ? 8 : 5;
        return new EffectResult(this, "A barrier appeared!");
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
@registry([{ token: 'Effect', useClass: Rage }])
class Rage implements Effect {
    move_effect_id: number = 39;
    abr: string = 'RAG';
    duration: number = -1;
    when: EffectTiming = EffectTiming.AFTER_MOVE;
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (user) {
            return new EffectResult(this, `${user.name} is getting angry!`);
        }
        return new EffectResult();
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
        'chatter', 'metronome', 'mimic', 'sketch', 'struggle', 'transform'
    ]);

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (!target[0]?.lastMove) {
            return new EffectResult(undefined, "But it failed!");
        }

        // Check if the move can be mimicked
        if (this.IGNORED_MOVES.has(target[0].lastMove.name.toLowerCase())) {
            return new EffectResult(undefined, "The move cannot be mimicked!");
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

@injectable()
@registry([{ token: 'Effect', useClass: FocusEnergy }])
class FocusEnergy implements Effect {
    move_effect_id: number = 48;
    abr: string = 'FOC';
    duration: number = -1;  // Lasts until the user leaves the field
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
            return new EffectResult(undefined, "But it failed!");
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
@registry([{ token: "Effect", useClass: Transform }])
export class Transform implements Effect {
    move_effect_id = 58;
    abr = "TRN";
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
        user.moves = target.moves.map(move => new MoveInstance(
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
        ));
        
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
@registry([{ token: "Effect", useClass: LowerAttack2 }])
export class LowerAttack2 implements Effect {
    move_effect_id = 59;
    abr = "ATK--";
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
@registry([{ token: "Effect", useClass: LowerDefense2 }])
export class LowerDefense2 implements Effect {
    move_effect_id = 60;
    abr = "DEF--";
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
@registry([{ token: "Effect", useClass: LowerSpeed2 }])
export class LowerSpeed2 implements Effect {
    move_effect_id = 61;
    abr = "SPE--";
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
@registry([{ token: "Effect", useClass: LowerSpecialAttack2 }])
export class LowerSpecialAttack2 implements Effect {
    move_effect_id = 62;
    abr = "SPA--";
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
@registry([{ token: "Effect", useClass: LowerSpecialDefense2 }])
export class LowerSpecialDefense2 implements Effect {
    move_effect_id = 63;
    abr = "SPD--";
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
@registry([{ token: "Effect", useClass: LightScreen }])
export class LightScreen implements Effect {
    move_effect_id = 66;
    abr = "LSCR";
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
            return new EffectResult(undefined, "But it failed!");
        }
        this.duration = user.hasItem('Light Clay') ? 8 : 5;
        return new EffectResult(this, "A barrier of light appeared!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: BreakScreens }])
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
        return new EffectResult(undefined, "The protective barriers were broken!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: DelayedSleep }])
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
@registry([{ token: "Effect", useClass: DropItem }])
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
        if (target[0].hasItem("")) {
            return new EffectResult(undefined, `${target[0].name} dropped its item!`);
        }
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: ChanceToLowerDefense }])
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
        return new EffectResult(undefined, "The chance to lower defense is handled in the battle system!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: ChanceToLowerSpeed }])
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
            return new EffectResult(undefined, "The chance to lower speed is handled in the battle system!");
        }
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: ChanceToLowerSpAtk }])
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
            return new EffectResult(undefined, "The chance to lower special attack is handled in the battle system!");
        }
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: ChanceToLowerSpDef }])
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
            return new EffectResult(undefined, "The chance to lower special defense is handled in the battle system!");
        }
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: ChanceToLowerAccuracy }])
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
            return new EffectResult(undefined, "The chance to lower accuracy is handled in the battle system!");
        }
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: MysticalFire }])
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
@registry([{ token: "Effect", useClass: ChargeAndFlinch }])
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
        return new EffectResult(undefined, "The charging and flinch chance is handled in the battle system!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: ChanceToConfuse }])
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
        return new EffectResult(undefined, "The chance to confuse is handled in the battle system!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: TwoHitPoison }])
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
        return new EffectResult(undefined, "Hit twice! The chance to poison is handled in the battle system!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: NeverMissEffect }])
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
@registry([{ token: "Effect", useClass: Substitute }])
class Substitute implements Effect {
    move_effect_id: number = 80;
    abr: string = 'SUB';
    duration: number = -1;  // Lasts until broken
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
            return new EffectResult(undefined, "But it failed!");
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
@registry([{ token: "Effect", useClass: RechargeEffect }])
class RechargeEffect implements Effect {
    move_effect_id: number = 81;
    abr: string = 'RCH';
    duration: number = 1;  // Recharge takes one turn
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
@registry([{ token: "Effect", useClass: RageEffect }])
class RageEffect implements Effect {
    move_effect_id: number = 82;
    abr: string = 'RAG';
    duration: number = -1;  // Lasts until the user switches out
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
@registry([{ token: "Effect", useClass: Mimic2 }])
class Mimic2 implements Effect {
    move_effect_id: number = 83;
    abr: string = 'MIM2';
    duration: number = -1;  // Lasts until the user switches out
    when: EffectTiming = EffectTiming.AFTER_MOVE;
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    // List of moves that cannot be mimicked
    private readonly IGNORED_MOVES = new Set([
        'chatter', 'metronome', 'mimic', 'sketch', 'struggle'
    ]);

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (!target[0]?.lastMove) {
            return new EffectResult(undefined, "But it failed!");
        }

        // Check if the move can be mimicked
        if (this.IGNORED_MOVES.has(target[0].lastMove.name.toLowerCase())) {
            return new EffectResult(undefined, "The move cannot be mimicked!");
        }

        // This represents copying the last used move with 5 PP
        return new EffectResult(this, `${user?.name} copied ${target[0].lastMove.name}!`);
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: Metronome }])
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
        'assist', 'chatter', 'copycat', 'counter', 'covet', 'destiny-bond', 
        'detect', 'endure', 'feint', 'focus-punch', 'follow-me', 'helping-hand', 
        'me-first', 'metronome', 'mimic', 'mirror-coat', 'mirror-move', 'protect', 
        'quick-guard', 'sketch', 'sleep-talk', 'snatch', 'struggle', 'switcheroo', 
        'thief', 'trick', 'wide-guard'
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
@registry([{ token: "Effect", useClass: LeechSeed }])
class LeechSeed implements Effect {
    move_effect_id: number = 85;
    abr: string = 'SEED';
    duration: number = -1;  // Lasts until the Pokémon leaves the field
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
@registry([{ token: "Effect", useClass: Splash }])
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
        return new EffectResult(undefined, "But nothing happened!");
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: Disable }])
class Disable implements Effect {
    move_effect_id: number = 87;
    abr: string = 'DSB';
    duration: number = 0;  // Duration is randomly set in apply
    when: EffectTiming = EffectTiming.BEFORE_MOVE;
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;
    disabledMove: string = '';

    apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
        if (!target[0] || !target[0].lastMove) {
            return new EffectResult(undefined, "But it failed!");
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
            return new EffectForTurn(true, `${target.name}'s ${this.disabledMove} is no longer disabled!`);
        }
        
        // Prevent using the disabled move
        if (target.selectedMove?.name === this.disabledMove) {
            return new EffectForTurn(false, `${target.name}'s ${this.disabledMove} is disabled!`);
        }
        
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: LevelDamage }])
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
@registry([{ token: "Effect", useClass: RandomDamage }])
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
        this.damages = Math.floor(baseLevel * percentage / 100);
        
        // Apply damage
        target[0].removeHp(this.damages);
        
        return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
    }

    playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{ token: "Effect", useClass: Counter }])
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
            return new EffectResult(undefined, "But it failed!");
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
@registry([{ token: "Effect", useClass: Encore }])
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
            return new EffectResult(undefined, "But it failed!");
        }

        // Set a random duration between 4-8 turns
        this.duration = Math.floor(Math.random() * 5) + 4;
        this.encoreMove = target[0].lastMove.name;

        // Check if the move can be encored
        const IGNORED_MOVES = new Set([
            'encore', 'mimic', 'mirror-move', 'sketch', 'struggle', 'transform'
        ]);

        if (IGNORED_MOVES.has(this.encoreMove.toLowerCase())) {
            return new EffectResult(undefined, "But it failed!");
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
@registry([{ token: "Effect", useClass: PainSplit }])
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
