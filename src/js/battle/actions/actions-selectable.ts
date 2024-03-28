import { MoveInstance, PokemonInstance } from "../../pokemons/pokedex";
import { ActionType, type ActionV2Interface } from "./actions-model";
import type { BattleContext } from "../../context/battleContext";
import { Player } from "../../characters/player";
import { type Character } from "../../characters/characters-model";
import { DamageResults, MOVE_EFFECT_APPLIER } from "../battle-model";
import { ApplyEffect, ChangePokemon, EndBattle, Message, PlayAnimation, RemoveHP } from "./actions-derived";
import { Pokeball } from "../../items/items";

// SELECTABLE ACTIONS
export class RunAway implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.type = ActionType.RUN;
        this.description = 'Run away from the battle';
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        if (ctx.isWild) {
            // randomized based on opponent speed
            ctx.escapeAttempts++;
            const random = Math.random() * 255;
            const f = Math.floor((ctx.opponentPokemon.battleStats.speed * 128) / ctx.playerPokemon.battleStats.speed) + 30 * ctx.escapeAttempts * random;

            if (f > 255) {
                ctx.clearStack();
                ctx.battleResult.win = true;
                ctx.events.runnaway.set(true);
                ctx.addToStack(new EndBattle(ctx.playerPokemon));
                ctx.addToStack(new Message('You ran away safely!', ctx.playerPokemon));
            } else {
                ctx.addToStack(new Message('Failed to run away!', ctx.playerPokemon));
            }
        } else {
            ctx.addToStack(new Message('You can\'t run away from a trainer battle!', ctx.playerPokemon));
        }
    }
}

export class Switch implements ActionV2Interface {
    type: ActionType;
    description: string;
    initiator: PokemonInstance;
    public owner: Character;

    constructor(initiator: PokemonInstance, owner: Character) {
        this.type = ActionType.SWITCH;
        this.description = 'Switch';
        this.initiator = initiator;
        this.owner = owner;
    }

    execute(ctx: BattleContext): void {
        // Note : actions are pushed in reverse since they are popped from last to first
        ctx.addToStack(new ChangePokemon(this.initiator, this.owner));
        ctx.addToStack(new Message(`${this.initiator.name}, go!`, this.initiator));
        let current = this.owner instanceof Player ? ctx.playerPokemon : ctx.opponentPokemon;
        ctx.addToStack(new Message(`${current.name}, come back!`, this.initiator));
    }
}

export class Attack implements ActionV2Interface {
    public type: ActionType;
    public name: string;
    public description: string;
    public move: MoveInstance;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(move: MoveInstance, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.type = ActionType.ATTACK;
        this.name = move.name;
        this.description = move.description;
        this.move = move;
        this.target = target;
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        const attacker = this.initiator;
        const target = this.target === 'opponent' ? ctx.opponentPokemon : ctx.playerPokemon;

        const actionsToPush: ActionV2Interface[] = [];
        const success = this.accuracyApplies(this.move);

        // start turn statuses (sleep, paralysis..)
        if (attacker.status?.when === 'start-turn') {
            let effect = attacker.status.playEffect(attacker, target);

            if (effect?.message) {
                actionsToPush.push(new Message(effect.message, attacker));
            }
            if (!effect.canPlay) {
                // Status prevent from attacking, skip the attack
                this.flushActions(ctx, actionsToPush);
                return;
            }
        }

        actionsToPush.push(new Message(attacker.name + ' used ' + this.move.name + '!', this.initiator));

        if (success) {

            const result = this.calculateDamage(attacker, target, this.move, ctx);
            let effect = MOVE_EFFECT_APPLIER.findEffect(this.move.effect);


            if (effect.when === 'before-move' && this.effectApplies(this.move)) {
                actionsToPush.push(new ApplyEffect(this.move, this.target, this.initiator))
            }

            if (!result.immune) {
                actionsToPush.push(new PlayAnimation(this.move, this.target, this.initiator));
            }
            if (result.immune) {
                actionsToPush.push(new Message('It doesn\'t affect ' + target.name + '...', this.initiator));
            } else if (result.notVeryEffective) {
                actionsToPush.push(new Message('It\'s not very effective...', this.initiator));
            } else if (result.superEffective) {
                actionsToPush.push(new Message('It\'s super effective!', this.initiator));
            }
            if (result.critical) {
                actionsToPush.push(new Message('A critical hit!', this.initiator));
            }


            actionsToPush.push(new RemoveHP(result.damages, this.target, this.initiator));

            // Apply attack effect
            if (!result.immune && this.effectApplies(this.move)) {
                actionsToPush.push(new ApplyEffect(this.move, this.target, this.initiator))
            }

        } else {
            actionsToPush.push(new Message('But it failed!', this.initiator));
        }

        this.flushActions(ctx, actionsToPush);
    }


    private flushActions(ctx: BattleContext, actionsToPush: ActionV2Interface[]) {
        console.log(actionsToPush);
        if (actionsToPush && actionsToPush.length > 0) {
            actionsToPush.reverse().forEach((action: ActionV2Interface) => ctx.addToStack(action));
        }
    }

    private calculateDamage(attacker: PokemonInstance, defender: PokemonInstance, move: MoveInstance, ctx: BattleContext): DamageResults {
        let result = new DamageResults();
        const typeEffectiveness = this.calculateTypeEffectiveness(move.type, defender.types, ctx);
        result.superEffective = typeEffectiveness > 1;
        result.notVeryEffective = typeEffectiveness < 1;
        result.immune = typeEffectiveness === 0;
        const critical = result.immune ? 0 : this.calculateCritical();
        result.critical = critical > 1;

        if (move.category !== 'no-damage' && move.power > 0) {
            const attack = move.category === 'physical' ? attacker.battleStats.attack : attacker.battleStats.specialAttack;
            const defense = move.category === 'physical' ? defender.battleStats.defense : defender.battleStats.specialDefense;

            const random = Math.random() * (1 - 0.85) + 0.85;
            const stab = this.calculateStab(attacker, move);
            const other = 1; // TODO weather, badges  ...
            const modifiers = typeEffectiveness * critical * random * stab * other;
            result.damages = Math.floor((((2 * attacker.level / 5 + 2) * move.power * attack / defense) / 50 + 2) * modifiers);

        } else {
            result.damages = 0;
        }

        return result;
    }

    private calculateTypeEffectiveness(type: string, types: string[], ctx: BattleContext) {
        return types.reduce((acc, type2) => {
            const effectiveness = ctx.fromTypeChart(type, type2);
            return acc * effectiveness;
        }, 1);
    }

    private calculateCritical() {
        return Math.random() < 0.0625 ? 1.5 : 1;
    }

    private calculateStab(attacker: PokemonInstance, move: MoveInstance) {
        return attacker.types.includes(move.type) ? 1.5 : 1; // TODO wtf
    }

    private accuracyApplies(move: MoveInstance) {
        return move.accuracy === 100 || move.accuracy === 0 || !Number.isInteger(move.effectChance) || Math.random() * 100 < move.accuracy;
    }

    private effectApplies(move: MoveInstance) {
        return move.effect &&
            ((Number.isInteger(move.effectChance) && Math.random() * 100 < move.effectChance) ||
                //  100%
                Number.isNaN(move.effectChance));
    }
}


export class UseItem implements ActionV2Interface {
    type: ActionType;
    description: string;
    itemId: number;
    target: PokemonInstance;
    initiator: PokemonInstance;
    owner: Character;

    constructor(itemId: number, target: PokemonInstance, initiator: PokemonInstance, owner: Character) {
        this.type = ActionType.ITEM
        this.description = 'Use a bag object';
        this.itemId = itemId;
        this.target = target;
        this.initiator = initiator;
        this.owner = owner;
    }

    execute(ctx: BattleContext): void {
        console.log('UseItem', this.itemId, this.target, this.initiator, this.owner);

        let item = this.owner.bag.getItem(this.itemId, ctx.ITEMS);


        if (item && !(item instanceof Pokeball)) {
            let result = item.apply(this.target);
            if (!result.success) {
                ctx.addToStack(new Message('It failed!', this.initiator));
            }
        }

        if (item instanceof Pokeball) {
            let result = item.apply(this.target, ctx.playerPokemon);
            if (result.success) {
                ctx.battleResult.caught = this.target;
                ctx.battleResult.win = true;
                ctx.addToStack(new EndBattle(this.initiator));
                // TODO, shakes (calculate number of shakes, use an Action for each, that throws a shake event to the view)
                ctx.addToStack(new Message('Gotcha! ' + this.target.name + ' was caught!', this.initiator));
            } else {
                ctx.addToStack(new Message('Oh no! The Pokémon broke free!', this.initiator))
            }
        }

        ctx.addToStack(new Message(`${this.owner.name} used ${item?.name}!`, this.initiator));
    }
}