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


export interface Effect {
    move_effect_id: number;
    duration: number;
    when: 'start-turn' | 'end-turn' | 'before-move' | 'after-move' | 'before-switch' | 'after-switch' | 'before-faint' | 'after-faint';
    damages: number;

    turnsPassed: number;
    healed: boolean;

    apply(target: PokemonInstance[]): EffectResult;

    playEffect(target: PokemonInstance): void;

    canPlay(): boolean;
}

@injectable()
class RegularDamageEffect implements Effect {
    move_effect_id: number = 1;
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

    playEffect(target: PokemonInstance): void {
        // nothing
    }

    canPlay(): boolean {
        return true;
    }


}

@injectable()
class Sleep implements Effect {
    move_effect_id: number = 2;
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

    playEffect(target: PokemonInstance): void {
        this.turnsPassed++;

        if (this.turnsPassed >= this.duration) {
            this.healed = true;
            target.status = undefined;
        }
    }

    canPlay(): boolean {
        return this.healed;
    }
}


@injectable()
class Poison implements Effect {
    move_effect_id: number = 3;
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

    playEffect(target: PokemonInstance): void {
        target.removeHp(this.damages);
    }

    canPlay(): boolean {
        return true;
    }
}

// 4 Drain

@injectable()
class Burn implements Effect {
    move_effect_id = 5;
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

    playEffect(target: PokemonInstance): void {
        target.removeHp(this.damages);
    }

    canPlay(): boolean {
        return true;
    }
}

@injectable()
class Freeze implements Effect {
    move_effect_id = 6;
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

    playEffect(target: PokemonInstance): void {
        if (Math.random() < 0.2) {
            this.healed = true;
            target.status = undefined;
        }
    }

    canPlay(): boolean {
        return this.healed;
    }
}

@injectable()
class Paralyze implements Effect {
    move_effect_id = 7;
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

    playEffect(target: PokemonInstance): void {

    }

    canPlay(): boolean {
        return Math.random() < 0.25;
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
    duration: number = 0;
    move_effect_id: number = 0;
    when: "start-turn" | "end-turn" | "before-move" | "after-move" | "before-switch" | "after-switch" | "before-faint" | "after-faint" = "start-turn";
    turnsPassed: number = 0;
    healed: boolean = false;

    apply(target: PokemonInstance[]): EffectResult {
        return new EffectResult(new UnknownEffect(), 'Effect not implemented yet...');
    }

    canPlay(): boolean {
        return true;
    }

    playEffect(target: PokemonInstance): void {
        target.status = undefined;
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
