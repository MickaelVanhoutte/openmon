/*


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


@registry([
    {token: Registry.token, useToken: RegularDamageEffect},

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

export const MOVE_EFFECT_APPLIER = container.resolve(MoveEffectApplier);
*/
