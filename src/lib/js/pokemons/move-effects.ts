import "reflect-metadata";
import {injectable, injectAll, registry, singleton} from "tsyringe";
import type {PokemonInstance} from "./pokedex";
import {MoveEffect} from "./pokedex";


interface Effect {
    move_effect_id: number;

    apply(target: PokemonInstance[]): void;
}

@injectable()
class RegularDamageEffect implements Effect {
    move_effect_id: number = 1;

    constructor() {
    }

    apply(target: PokemonInstance[]) {
        console.log('RegularDamageEffect');
    }
}

@injectable()
class Sleep implements Effect {
    move_effect_id: number = 2;

    constructor() {
    }

    apply(target: PokemonInstance[]) {
        console.log('Sleep');
    }
}


@injectable()
class Poison implements Effect {
    move_effect_id: number = 3;

    constructor() {
    }

    apply(target: PokemonInstance[]) {
        console.log('Poison');
    }
}

// 4 Drain

@injectable()
class Burn implements Effect {
    move_effect_id = 5;

    apply(target: PokemonInstance[]): void {
        console.log('burn');
    }
}

@injectable()
class Freeze implements Effect {
    move_effect_id = 6;

    apply(target: PokemonInstance[]): void {
        console.log('freeze');
    }
}

@injectable()
class Paralyze implements Effect {
    move_effect_id = 7;

    apply(target: PokemonInstance[]): void {
        console.log('paralyse');
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

@singleton()
export class MoveEffectApplier {

    constructor(@injectAll(Registry.token) private moveEffects: Effect[]) {
    }

    public apply(moveEffect: MoveEffect, target: PokemonInstance[], user: PokemonInstance) {
        this.moveEffects.find(effect => effect.move_effect_id === moveEffect.move_effect_id)?.apply(target) || console.log('No effect found');
    }
}
