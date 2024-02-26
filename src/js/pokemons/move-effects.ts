import "@abraham/reflection";
import {injectable, injectAll, registry, singleton} from "tsyringe";
import type {PokemonInstance} from "./pokedex";
import {MoveEffect} from "./pokedex";

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
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint';
    damages: number;

    turnsPassed: number;
    healed: boolean;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult;

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn;
}

@injectable()
@registry([{token: 'Effect', useClass: RegularDamageEffect}])
class RegularDamageEffect implements Effect {
    move_effect_id: number = 1;
    abr: string = '';
    duration: number = -1;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint' = 'after-move';
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    constructor() {
    }

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        console.log('RegularDamageEffect');
        return new EffectResult();
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        // nothing
        return new EffectForTurn();
    }

}

@injectable()
@registry([{token: 'Effect', useClass: Sleep}])
class Sleep implements Effect {
    move_effect_id: number = 2;
    abr: string = 'SLP';
    duration: number = 0;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint' = 'start-turn'
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    constructor() {
    }

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        console.log('Sleep');
        let sleep = new Sleep();
        sleep.duration = Math.floor(Math.random() * 4) + 2;
        return new EffectResult(sleep, `${target[0].name} fell asleep`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        this.turnsPassed++;

        if (this.turnsPassed >= this.duration) {
            this.healed = true;
            target.status = undefined;
        }
        return new EffectForTurn(this.healed, this.healed ? `${target.name} woke up !` : `${target.name} is deep asleep`)
    }
}


@injectable()
@registry([{token: 'Effect', useClass: Poison}])
class Poison implements Effect {
    move_effect_id: number = 3;
    abr: string = 'PSN';
    duration: number = -1;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint' = 'end-turn';
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    constructor() {
    }

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        console.log('Poison');
        let poison = new Poison();
        poison.damages = Math.floor(target[0].stats.hp / 16);
        return new EffectResult(poison, `${target[0].name} is poisoned`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        target.removeHp(this.damages);
        return new EffectForTurn(true, `${target.name} is hurt by poison`);
    }
}

/* TODO
{
    "move_effect_id": 4,
    "local_language_id": 9,
    "short_effect": "Drains half the damage inflicted to heal the user.",
    "effect": "Inflicts [regular damage]{mechanic:regular-damage}.  [Drains]{mechanic:drain} half the damage inflicted to heal the user."
},
*/

@injectable()
@registry([{token: 'Effect', useClass: Burn}])
class Burn implements Effect {
    move_effect_id = 5;
    abr: string = 'BRN';
    duration: number = -1;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint' = 'end-turn';
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    constructor() {
    }

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        console.log('burn');
        let burn = new Burn();
        burn.damages = Math.floor(target[0].stats.hp / 16);
        return new EffectResult(burn, `${target[0].name} is burnt`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        target.removeHp(this.damages);
        return new EffectForTurn(true, `${target.name} is hurt by burn`);
    }

}

@injectable()
@registry([{token: 'Effect', useClass: Freeze}])
class Freeze implements Effect {
    move_effect_id = 6;
    abr: string = 'FRZ';
    duration: number = -1;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint' = "start-turn";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    constructor() {

    }

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        return new EffectResult(new Freeze(), `${target[0].name} is frozen`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        if (Math.random() < 0.2) {
            this.healed = true;
            target.status = undefined;
        }

        return new EffectForTurn(this.healed, this.healed ? `${target.name} thawed out` : `${target.name} is frozen solid`);
    }
}

@injectable()
@registry([{token: 'Effect', useClass: Paralyze}])
class Paralyze implements Effect {
    move_effect_id = 7;
    abr: string = 'PAR';
    duration: number = -1;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint' = "start-turn";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    constructor() {
    }

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        console.log('paralyse');
        return new EffectResult(new Paralyze(), `${target[0].name} is paralyzed`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        let canPlay = Math.random() < 0.25;
        return new EffectForTurn(canPlay, canPlay ? undefined : `${target.name} is fully paralyzed`);
    }

}

/* TODO
{
    "move_effect_id": 8,
    "local_language_id": 9,
    "short_effect": "User faints.",
    "effect": "User [faint]{mechanic:faint}s, even if the attack [fail]{mechanic:fail}s or [miss]{mechanic:miss}es.  Inflicts [regular damage]{mechanic:regular-damage}."
},
{
    "move_effect_id": 9,
    "local_language_id": 9,
    "short_effect": "Only works on sleeping Pokémon.  Drains half the damage inflicted to heal the user.",
    "effect": "[Fails]{mechanic:fail} if not used on a [sleep]{mechanic:sleep}ing Pokémon.  Inflicts [regular damage]{mechanic:regular-damage}.  [Drains]{mechanic:drain} half the damage inflicted to heal the user."
},
{
    "move_effect_id": 10,
    "local_language_id": 9,
    "short_effect": "Uses the target's last used move.",
    "effect": "Uses the last move targeted at the user by a Pokémon still on the [field]{mechanic:field}.  A move counts as targeting the user even if it hit multiple Pokémon, as long as the user was one of them; however, moves targeting the [field]{mechanic:field} itself do not count.  If the user has not been targeted by an appropriate move since entering the [field]{mechanic:field}, or if no Pokémon that targeted the user remains on the [field]{mechanic:field}, this move will [fail]{mechanic:fail}.\n\nMoves that [fail]{mechanic:fail}ed, [miss]{mechanic:miss}ed, had [no effect]{mechanic:no-effect}, or were [block]{mechanic:block}ed are still copied.\n\nAssist moves, time-delayed moves, “meta” moves that operate on other moves/Pokémon/abilities, and some other special moves cannot be copied and are ignored; if the last move to hit the user was such a move, the previous move will be used instead.  The full list of ignored moves is: []{move:acid-armor}, []{move:acupressure}, []{move:after-you}, []{move:agility}, []{move:ally-switch}, []{move:amnesia}, []{move:aqua-ring}, []{move:aromatherapy}, []{move:aromatic-mist}, []{move:assist}, []{move:autotomize}, []{move:barrier}, []{move:baton-pass}, []{move:belch}, []{move:belly-drum}, []{move:bide}, []{move:bulk-up}, []{move:calm-mind}, []{move:camouflage}, []{move:celebrate}, []{move:charge}, []{move:coil}, []{move:conversion}, []{move:conversion-2}, []{move:copycat}, []{move:cosmic-power}, []{move:cotton-guard}, []{move:counter}, []{move:crafty-shield}, []{move:curse}, []{move:defend-order}, []{move:defense-curl}, []{move:destiny-bond}, []{move:detect}, []{move:doom-desire}, []{move:double-team}, []{move:dragon-dance}, []{move:electric-terrain}, []{move:endure}, []{move:final-gambit}, []{move:flower-shield}, []{move:focus-energy}, []{move:focus-punch}, []{move:follow-me}, []{move:future-sight}, []{move:geomancy}, []{move:grassy-terrain}, []{move:gravity}, []{move:growth}, []{move:grudge}, []{move:guard-split}, []{move:hail}, []{move:happy-hour}, []{move:harden}, []{move:haze}, []{move:heal-bell}, []{move:heal-order}, []{move:heal-pulse}, []{move:healing-wish}, []{move:helping-hand}, []{move:hold-hands}, []{move:hone-claws}, []{move:howl}, []{move:imprison}, []{move:ingrain}, []{move:ion-deluge}, []{move:iron-defense}, []{move:kings-shield}, []{move:light-screen}, []{move:lucky-chant}, []{move:lunar-dance}, []{move:magic-coat}, []{move:magnet-rise}, []{move:magnetic-flux}, []{move:mat-block}, []{move:me-first}, []{move:meditate}, []{move:metronome}, []{move:milk-drink}, []{move:mimic}, []{move:minimize}, []{move:mirror-coat}, []{move:mirror-move}, []{move:mist}, []{move:misty-terrain}, []{move:moonlight}, []{move:morning-sun}, []{move:mud-sport}, []{move:nasty-plot}, []{move:nature-power}, []{move:perish-song}, []{move:power-split}, []{move:power-trick}, []{move:protect}, []{move:psych-up}, []{move:quick-guard}, []{move:quiver-dance}, []{move:rage-powder}, []{move:rain-dance}, []{move:recover}, []{move:recycle}, []{move:reflect}, []{move:reflect-type}, []{move:refresh}, []{move:rest}, []{move:rock-polish}, []{move:role-play}, []{move:roost}, []{move:rototiller}, []{move:safeguard}, []{move:sandstorm}, []{move:shadow-blast}, []{move:shadow-bolt}, []{move:shadow-half}, []{move:shadow-rush}, []{move:shadow-shed}, []{move:shadow-sky}, []{move:shadow-storm}, []{move:shadow-wave}, []{move:sharpen}, []{move:shell-smash}, []{move:shift-gear}, []{move:sketch}, []{move:slack-off}, []{move:sleep-talk}, []{move:snatch}, []{move:soft-boiled}, []{move:spikes}, []{move:spiky-shield}, []{move:spit-up}, []{move:splash}, []{move:stealth-rock}, []{move:sticky-web}, []{move:stockpile}, []{move:struggle}, []{move:substitute}, []{move:sunny-day}, []{move:swallow}, []{move:swords-dance}, []{move:synthesis}, []{move:tail-glow}, []{move:tailwind}, []{move:teleport}, []{move:toxic-spikes}, []{move:transform}, []{move:water-sport}, []{move:wide-guard}, []{move:wish}, []{move:withdraw} and []{move:work-up}.\n\nThis move cannot be selected by []{move:assist}, []{move:metronome}, or []{move:sleep-talk}, nor forced by []{move:encore}."
},
*/

@injectable()
@registry([{token: 'Effect', useClass: RaiseAttack}])
class RaiseAttack implements Effect {
    move_effect_id: number = 11;
    abr: string = 'ATK+';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        user.changeBattleStats('attack', 1);
        return new EffectResult(undefined, `${user.name}'s attack rose`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: RaiseDefense}])
class RaiseDefense implements Effect {
    move_effect_id: number = 12;
    abr: string = 'DEF+';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        user.changeBattleStats('defense', 1);
        return new EffectResult(undefined, `${user.name}'s defense rose`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: RaiseSPAttack}])
class RaiseSPAttack implements Effect {
    move_effect_id: number = 14;
    abr: string = 'DEF+';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        user.changeBattleStats('specialAttack', 1);
        return new EffectResult(undefined, `${user.name}'s special attack rose`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: RaiseEvasion}])
class RaiseEvasion implements Effect {
    move_effect_id: number = 17;
    abr: string = 'DEF+';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        user.changeBattleStats('evasion', 1);
        return new EffectResult(undefined, `${user.name}'s evasion rose`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

/* TODDO
{
    "move_effect_id": 18,
    "local_language_id": 9,
    "short_effect": "Never misses.",
    "effect": "Inflicts [regular damage]{mechanic:regular-damage}.  Ignores [accuracy]{mechanic:accuracy} and [evasion]{mechanic:evasion} modifiers."
},
*/

@injectable()
@registry([{token: 'Effect', useClass: LowerAttack}])
class LowerAttack implements Effect {
    move_effect_id: number = 19;
    abr: string = 'ATK-';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        target[0].changeBattleStats('attack', -1);
        return new EffectResult(undefined, `${target[0].name}'s attack dropped`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: LowerDefense}])
class LowerDefense implements Effect {
    move_effect_id: number = 20;
    abr: string = 'DEF-';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        target[0].changeBattleStats('defense', -1);
        return new EffectResult(undefined, `${target[0].name}'s defense dropped`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: LowerSpeed}])
class LowerSpeed implements Effect {
    move_effect_id: number = 21;
    abr: string = 'SPE-';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        target[0].changeBattleStats('speed', -1);
        return new EffectResult(undefined, `${target[0].name}'s speed dropped`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: LowerAccuracy}])
class LowerAccuracy implements Effect {
    move_effect_id: number = 24;
    abr: string = 'ACC-';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        target[0].changeBattleStats('accuracy', -1);
        return new EffectResult(undefined, `${target[0].name}'s accuracy dropped`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}

@injectable()
@registry([{token: 'Effect', useClass: LowerEvasion}])
class LowerEvasion implements Effect {
    move_effect_id: number = 25;
    abr: string = 'EVA-';
    duration: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "after-move";
    damages: number = 0;

    turnsPassed: number = 0;
    healed = false;

    apply(target: PokemonInstance[], user: PokemonInstance): EffectResult {
        target[0].changeBattleStats('evasion', -1);
        return new EffectResult(undefined, `${target[0].name}'s evasion dropped`);
    }

    playEffect(target: PokemonInstance, user: PokemonInstance): EffectForTurn {
        return new EffectForTurn();
    }
}


class UnknownEffect implements Effect {
    damages: number = 0;
    abr: string = '???';
    duration: number = 0;
    move_effect_id: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "start-turn";
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
