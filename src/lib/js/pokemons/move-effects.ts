import "@abraham/reflection";
import {injectable, injectAll, registry, singleton} from "tsyringe";
import type {PokemonInstance} from "./pokedex";
import {MoveEffect} from "./pokedex";

export class EffectResult {
    message?: string; // TODO duo battles ? string[] required and check effect chance here
    effect?: Effect;

    constructor(effect: Effect, message?: string) {
        this.message = message;
        this.effect = effect;
    }
}

export class EffectForTurn {
    message?: string;
    canPlay?: boolean;

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

    apply(target: PokemonInstance[]): EffectResult;

    playEffect(target: PokemonInstance): EffectForTurn;
}

@injectable()
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

    apply(target: PokemonInstance[]): EffectResult {
        console.log('RegularDamageEffect');
        return new EffectResult(new RegularDamageEffect());
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        // nothing
        return new EffectForTurn(true);
    }

}

@injectable()
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

    apply(target: PokemonInstance[]): EffectResult {
        console.log('Sleep');
        let sleep = new Sleep();
        sleep.duration = Math.floor(Math.random() * 4) + 2;
        return new EffectResult(sleep, `${target[0].name} fell asleep`);
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        this.turnsPassed++;

        if (this.turnsPassed >= this.duration) {
            this.healed = true;
            target.status = undefined;
        }
        return new EffectForTurn(this.healed, this.healed ? `${target.name} woke up !` : `${target.name} is deep asleep`)
    }
}


@injectable()
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

    apply(target: PokemonInstance[]): EffectResult {
        console.log('Poison');
        let poison = new Poison();
        poison.damages = Math.floor(target[0].stats.hp / 16);
        return new EffectResult(poison, `${target[0].name} is poisoned`);
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        target.removeHp(this.damages);
        return new EffectForTurn(true, `${target.name} is hurt by poison`);
    }
}

// 4 Drain

@injectable()
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

    apply(target: PokemonInstance[]): EffectResult {
        console.log('burn');
        let burn = new Burn();
        burn.damages = Math.floor(target[0].stats.hp / 16);
        return new EffectResult(burn, `${target[0].name} is burnt`);
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        target.removeHp(this.damages);
        return new EffectForTurn(true, `${target.name} is hurt by burn`);
    }

}

@injectable()
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

    apply(target: PokemonInstance[]): EffectResult {
        return new EffectResult(new Freeze(), `${target[0].name} is frozen`);
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        if (Math.random() < 0.2) {
            this.healed = true;
            target.status = undefined;
        }

        return new EffectForTurn(this.healed, this.healed ? `${target.name} thawed out` : `${target.name} is frozen solid`);
    }
}

@injectable()
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

    apply(target: PokemonInstance[]): EffectResult {
        console.log('paralyse');
        return new EffectResult(new Paralyze(), `${target[0].name} is paralyzed`);
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        let canPlay = Math.random() < 0.25;
        return new EffectForTurn(canPlay, canPlay ? undefined : `${target.name} is fully paralyzed`);
    }

}


@registry([
    {token: Registry.token, useToken: RegularDamageEffect},
    {token: Registry.token, useToken: Sleep},
    {token: Registry.token, useToken: Poison},
    {token: Registry.token, useToken: Burn},
    {token: Registry.token, useToken: Freeze},
    {token: Registry.token, useToken: Paralyze},
])
abstract class Registry {
    static readonly token = Symbol("Effects");
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
        return new EffectResult(new UnknownEffect(), 'Effect not implemented yet...');
    }

    playEffect(target: PokemonInstance): EffectForTurn {
        target.status = undefined;
        return new EffectForTurn(true, 'Effect not implemented yet...');
    }

}

@singleton()
export class MoveEffectApplier {

    constructor(@injectAll(Registry.token) private moveEffects: Effect[]) {
    }

    public apply(moveEffect: MoveEffect, target: PokemonInstance[], user: PokemonInstance) {
        return this.moveEffects.find(effect => effect.move_effect_id === moveEffect.move_effect_id)?.apply(target) || new EffectResult(new UnknownEffect());
    }
}
