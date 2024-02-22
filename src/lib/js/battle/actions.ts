import {Move, MoveInstance, PokemonInstance} from "../pokemons/pokedex";
import {MOVE_EFFECT_APPLIER} from "../const";
import {Character} from "../player/player";
import {Pokeball} from "../items/items";
import {EXPERIENCE_CHART} from "../pokemons/experience";
import {ActionsContext, DamageResults, fromTypeChart} from "./battle";

export interface Action {
    name: string;
    description: string;
    initiator: PokemonInstance;

    execute(ctx: ActionsContext): void;
}

export class Message implements Action {
    public name: string;
    public description: string;
    public initiator: PokemonInstance;

    constructor(message: string, initiator: PokemonInstance) {
        this.name = 'Message';
        this.description = message;
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        ctx.currentMessage = this.description;
    }
}

// FLEE
export class RunAway implements Action {
    public description: string;
    public name: string;
    public initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'Run Away';
        this.description = 'Run away from the battle';
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        if (ctx.isWild) {
            // randomized based on opponent speed
            ctx.escapeAttempts++;
            const random = Math.random() * 255;
            const f = Math.floor((ctx.cOpponentMons.battleStats.speed * 128) / ctx.cPlayerMons.battleStats.speed) + 30 * ctx.escapeAttempts * random;

            if (f > 255) {
                ctx.clearStack();
                ctx.battleResult.win = true;
                ctx.addToStack(new EndBattle(ctx.cPlayerMons));
                ctx.addToStack(new Message('You ran away safely!', ctx.cPlayerMons));
            } else {
                ctx.addToStack(new Message('Failed to run away!', ctx.cPlayerMons));
            }
        } else {
            ctx.addToStack(new Message('You can\'t run away from a trainer battle!', ctx.cPlayerMons));
        }
    }
}

// SWITCH
export class ChangePokemon implements Action {
    public description: string;
    public name: string;
    public initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'Change Pokemon';
        this.description = 'Change the current pokemon';
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        ctx.cPlayerMons = this.initiator;
        ctx.participants.add(ctx.cPlayerMons);
        // order to change sprite to component
        ctx.onPokemonChange();
    }
}

export class SwitchAction implements Action {
    name: string;
    description: string;
    initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'Switch';
        this.description = 'Switch';
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        // Note : actions are pushed in reverse since they are popped from last to first
        ctx.addToStack(new ChangePokemon(this.initiator));
        ctx.addToStack(new Message(`${this.initiator.name}, go!`, this.initiator));
        ctx.addToStack(new Message(`${ctx.cPlayerMons.name}, come back!`, this.initiator));
    }
}

// ATTACK
export class Attack implements Action {
    public name: string;
    public description: string;
    public move: MoveInstance;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(move: MoveInstance, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.name = move.name;
        this.description = move.description;
        this.move = move;
        this.target = target;
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        const attacker = this.initiator;
        const target = this.target === 'opponent' ? ctx.cOpponentMons : ctx.cPlayerMons;

        const actionsToPush: Action[] = [];
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

            const result = this.calculateDamage(attacker, target, this.move);
            let effect = MOVE_EFFECT_APPLIER.findEffect(this.move.effect);


            if (effect.when === 'before-move' && this.effectApplies(this.move)) {
                actionsToPush.push(new ApplyEffect(this.move, this.target, this.initiator))
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


    private flushActions(ctx: ActionsContext, actionsToPush: Action[]) {
        if (actionsToPush && actionsToPush.length > 0) {
            actionsToPush.reverse().forEach((action: Action) => ctx.addToStack(action));
        }
    }

    private calculateDamage(attacker: PokemonInstance, defender: PokemonInstance, move: MoveInstance): DamageResults {
        let result = new DamageResults();
        const typeEffectiveness = this.calculateTypeEffectiveness(move.type, defender.types);
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

    private calculateTypeEffectiveness(type: string, types: string[]) {
        return types.reduce((acc, type2) => {
            const effectiveness = fromTypeChart(type, type2);
            return acc * effectiveness;
        }, 1);
    }

    private calculateCritical() {
        return Math.random() < 0.0625 ? 1.5 : 1;
    }

    private calculateStab(attacker: PokemonInstance, move: MoveInstance) {
        return attacker.types.includes(move.type) ? 1.5 : 1;
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

export class RemoveHP implements Action {
    public name: string;
    public description: string;
    public damages: number;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(damages: number, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.name = 'Remove HP';
        this.description = 'Remove HP';
        this.damages = damages;
        this.target = target;
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {

        const target = this.target === 'opponent' ?
            ctx.cOpponentMons :
            ctx.cPlayerMons;

        target.currentHp = target.currentHp - this.damages;

        ctx.checkFainted(target, this.initiator);
    }
}

export class ApplyEffect implements Action {
    public name: string;
    public description: string;
    public move: Move;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(move: Move, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.name = 'Apply Effect';
        this.description = 'Apply Effect';
        this.move = move;
        this.target = target;
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        let target = this.initiator === ctx.cPlayerMons ? ctx.cOpponentMons : ctx.cPlayerMons;
        if (!target.fainted) {
            let result = MOVE_EFFECT_APPLIER.apply(this.move.effect, [target], this.initiator);
            if (result?.effect) {
                target.status = result.effect;
            }
            if (result?.message) {
                ctx.addToStack(new Message(result.message, this.initiator));
            }
        }
    }
}


// ON KILL
export class XPWin implements Action {
    name: string;
    description: string;
    initiator: PokemonInstance;
    xp: number;

    constructor(initiator: PokemonInstance, xp: number) {
        this.name = 'XP Win';
        this.description = `${initiator.name} won ${xp} XP!`;
        this.initiator = initiator;
        this.xp = xp;
    }

    execute(ctx: ActionsContext): void {
        let result = this.initiator.addXpResult(this.xp, ctx.opponent instanceof Character ? 3 : 1);

        if (result.levelup) {
            ctx.addToStack(new LvlUp(this.initiator, result.xpLeft));
        }
    }
}

export class LvlUp implements Action {
    name: string;
    description: string;
    initiator: PokemonInstance;
    xpLeft: number;

    constructor(initiator: PokemonInstance, xpLeft: number = 0) {
        this.name = 'Level Up';
        this.description = `${initiator.name} grew to level ${initiator.level + 1}!`;
        this.initiator = initiator;
        this.xpLeft = xpLeft;
    }

    execute(ctx: ActionsContext): void {
        if (this.xpLeft > 0) {
            ctx.addToStack(new XPWin(this.initiator, this.xpLeft));
        }

        ctx.addToStack(new Message(this.description, this.initiator));
        this.initiator.levelUp();

        // todo display stats (ctx onLvlUp)
    }

}

// USE ITEM
export class BagObject implements Action {
    description: string;
    name: string;
    public itemId: number;
    public target: PokemonInstance;
    public initiator: PokemonInstance;
    public player: Character;

    constructor(itemId: number, target: PokemonInstance, initiator: PokemonInstance, player: Character) {
        this.name = 'Bag Object';
        this.description = 'Use a bag object';
        this.itemId = itemId;
        this.target = target;
        this.initiator = initiator;
        this.player = player;
    }

    execute(ctx: ActionsContext): void {
        let item = this.player.bag.getItem(this.itemId);
        if (item && !(item instanceof Pokeball)) {
            let result = item.apply(this.target);
            if (!result.success) {
                ctx.addToStack(new Message('It failed!', this.initiator));
            }
        }

        if (item instanceof Pokeball) {
            let result = item.apply(this.target, ctx.cPlayerMons);
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

        ctx.addToStack(new Message(`${this.player.name} used ${item?.name}!`, this.initiator));
    }
}


// END TURN, BATTLE

export class EndTurnChecks implements Action {
    name: string;
    description: string;
    initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'End Turn Checks';
        this.description = 'End Turn Checks';
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        // end turn effects (burn, poison..)
        let opponent = this.initiator === ctx.cPlayerMons ? ctx.cOpponentMons : ctx.cPlayerMons;
        if (!this.initiator.fainted && this.initiator.status && this.initiator.status.when === 'end-turn') {
            let effect = this.initiator.status.playEffect(this.initiator, opponent);
            ctx.checkFainted(this.initiator, opponent);
            if (effect?.message) {
                ctx.addToStack(new Message(effect.message, this.initiator));
            }
        }

        if ((ctx.isWild && ctx.opponent instanceof PokemonInstance && ctx.opponent.fainted) ||
            (ctx.opponent instanceof Character && ctx.opponent.monsters.every((monster: PokemonInstance) => monster.fainted))) {
            //remove end turn action from stack
            ctx.turnStack = ctx.turnStack.filter((action: Action) => {
                return !(action instanceof EndTurn) && (!(action instanceof Message) && action?.description.startsWith('What should'));
            });
            ctx.battleResult.win = true;
            ctx.addToStack(new EndBattle(this.initiator));
            ctx.addToStack(new Message('You won the battle!', this.initiator));
        } else if (ctx.player.monsters.every((monster: PokemonInstance) => monster.fainted)) {
            //remove end turn action from stack
            ctx.turnStack = ctx.turnStack.filter((action: Action) => {
                return !(action instanceof EndTurn);
            });
            ctx.battleResult.win = false;
            ctx.addToStack(new EndBattle(this.initiator));
            ctx.addToStack(new Message('You lose the battle...', this.initiator));
        } else if (ctx.cPlayerMons.fainted) {
            console.log('change pokemon (TODO)');
            //TODO
            ctx.forceChangePokemon();
        }
    }
}

export class EndTurn implements Action {
    name: string;
    description: string;
    initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'End Turn';
        this.description = 'End Turn';
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        ctx.currentMessage = `What should ${ctx.cPlayerMons.name} do ?`;
        ctx.isPlayerTurn = true;
    }

}

export class EndBattle implements Action {
    public name: string;
    public description: string;
    public initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'End Battle';
        this.description = 'End Battle';
        this.initiator = initiator;
    }

    execute(ctx: ActionsContext): void {
        ctx.clearStack();
        ctx.onClose(ctx.battleResult);
    }
}
