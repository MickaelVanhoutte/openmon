// DERIVED FROM MAIN ACTIONS

import { ActionType, type ActionV2Interface } from "./actions-model";
import { Move, MoveEffect, PokemonInstance } from "../../pokemons/pokedex";
import type { BattleContext } from "../../context/battleContext";
import { ComboJauge, Player } from "../../characters/player";
import { type Character } from "../../characters/characters-model";
import { NPC } from "../../characters/npc";
import { MOVE_EFFECT_APPLIER } from "../battle-model";

export class Message implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public initiator: PokemonInstance;

    constructor(message: string, initiator: PokemonInstance) {
        this.type = ActionType.MESSAGE;
        this.description = message;
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        ctx.currentMessage.set(this.description);
    }
}


export class ChangePokemon implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public initiator: PokemonInstance;
    public owner: Character;

    constructor(initiator: PokemonInstance, owner: Character) {
        this.type = ActionType.SWITCH_EFFECT;
        this.description = 'Change the current pokemon';
        this.initiator = initiator;
        this.owner = owner;
    }

    execute(ctx: BattleContext): void {
        if (this.owner instanceof Player) {
            ctx.playerPokemon = this.initiator;
            ctx.participants.add(ctx.playerPokemon);
        } else {
            ctx.opponentPokemon = this.initiator;
        }
        // order to change sprite to component
        ctx.events.pokemonChange.set(this.owner);
    }
}

export class ApplyEffect implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public moveEffect?: MoveEffect;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(moveEffect: MoveEffect, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.type = ActionType.APPLY_EFFECT;
        this.description = 'Apply Effect';
        this.moveEffect = moveEffect;
        this.target = target;
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        let target = this.initiator === ctx.playerPokemon ? ctx.opponentPokemon : ctx.playerPokemon;
        if (!target.fainted && this.moveEffect) {
            let result = MOVE_EFFECT_APPLIER.apply(this.moveEffect, [target], this.initiator);
            if (result?.effect) {
                target.status = result.effect;
            }
            if (result?.message) {
                ctx.addToStack(new Message(result.message, this.initiator));
            }
        }
    }
}

export class PlayAnimation implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public move: Move;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(move: Move, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.type = ActionType.PLAY_ANIMATION;
        this.description = 'Play Animation';
        this.move = move;
        this.target = target;
        this.initiator = initiator;
    }
    execute(ctx: BattleContext): void {
        ctx.events.animateAttack.set({
            move: this.move,
            target: this.target === 'opponent' ? 'opponent' : 'ally',
            initiator: this.initiator === ctx.playerPokemon ? 'ally' : 'opponent'
        });
    }
}

export class RemoveHP implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public damages: number;
    public target: 'opponent' | 'ally';
    public initiator: PokemonInstance;

    constructor(damages: number, target: 'opponent' | 'ally', initiator: PokemonInstance) {
        this.type = ActionType.REMOVE_HP;
        this.description = 'Remove HP';
        this.damages = damages;
        this.target = target;
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        const target = this.target === 'opponent' ?
            ctx.opponentPokemon :
            ctx.playerPokemon;

        target.currentHp = target.currentHp - this.damages;

        let actions = ctx.checkFainted(target, this.initiator);
        if (actions) {
            actions.forEach((action: ActionV2Interface) => {
                ctx.addToStack(action);
            });
        }
    }
}

export class ComboBoost implements ActionV2Interface {
    type: ActionType;
    description: string;
    initiator: PokemonInstance;
    controller: Character | PokemonInstance;
    superEffective: boolean;
    critical: boolean;

    constructor(initiator: PokemonInstance, controller: Character | PokemonInstance, superEffective: boolean, critical: boolean) {
        this.type = ActionType.COMBO_BOOST;
        this.description = 'Combo Boost';
        this.initiator = initiator;
        this.controller = controller;
        this.superEffective = superEffective;
        this.critical = critical;
    }

    execute(ctx: BattleContext): void {
        if (!(this.controller instanceof PokemonInstance) && !!this.controller.comboJauge) {
            let valueToAdd = 15;
            if (this.superEffective) {
                valueToAdd += 5;
            }
            if (this.critical) {
                valueToAdd += 5;
            }
            
            this.controller.comboJauge.addValue(valueToAdd);
            this.controller.comboJauge = new ComboJauge(this.controller.comboJauge.value, this.controller.comboJauge.stored);
        }
    }
}


// ON KILL
export class XPWin implements ActionV2Interface {
    type: ActionType;
    description: string;
    initiator: PokemonInstance;
    xp: number;

    constructor(initiator: PokemonInstance, xp: number) {
        this.type = ActionType.XP_WIN;
        this.description = `${initiator.name} won ${xp} XP!`;
        this.initiator = initiator;
        this.xp = xp;
    }

    execute(ctx: BattleContext): void {
        let result = this.initiator.addXpResult(this.xp, ctx.opponent instanceof Player ? 3 : 1);

        if (result.newMove?.length > 0) {
            result.newMove.forEach((move: string) => {
                ctx.addToStack(new Message(`${this.initiator.name} can now learn ${move}!`, this.initiator));
            });
        }

        if (result.levelup) {
            ctx.addToStack(new LvlUp(this.initiator, result.xpLeft));
        }
    }
}

export class LvlUp implements ActionV2Interface {
    type: ActionType;
    description: string;
    initiator: PokemonInstance;
    xpLeft: number;

    constructor(initiator: PokemonInstance, xpLeft: number = 0) {
        this.type = ActionType.LEVEL_UP;
        this.description = `${initiator.name} grew to level ${initiator.level + 1}!`;
        this.initiator = initiator;
        this.xpLeft = xpLeft;
    }

    execute(ctx: BattleContext): void {
        if (this.xpLeft > 0) {
            ctx.addToStack(new XPWin(this.initiator, this.xpLeft));
        }

        ctx.addToStack(new Message(this.description, this.initiator));
        this.initiator.levelUp();

        // todo display stats (ctx onLvlUp)
    }

}


// END CHECKS, END BATTLE

export class EndTurnChecks implements ActionV2Interface {
    type: ActionType;
    description: string;
    initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.type = ActionType.END_CHECKS;
        this.description = 'End Turn Checks';
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        // end turn effects (burn, poison..)
        let actions: ActionV2Interface[] = [];
        let opponent = this.initiator === ctx.playerPokemon ? ctx.opponentPokemon : ctx.playerPokemon;
        if (!this.initiator.fainted && this.initiator.status && this.initiator.status.when === 'end-turn') {
            let effect = this.initiator.status.playEffect(this.initiator, opponent);
            actions = ctx.checkFainted(this.initiator, opponent);

            if (effect?.message) {
                actions.push(new Message(effect.message, this.initiator));
            }
        }

        if ((ctx.isWild && ctx.opponent instanceof PokemonInstance && ctx.opponent.fainted) ||
            (ctx.opponent instanceof NPC && ctx.opponent.monsters.every((monster: PokemonInstance) => monster.fainted))) {
            //remove end turn action from stack
            ctx.actionStack.stack = ctx.actionStack.stack.filter((action: ActionV2Interface) => {
                return !(action.type === ActionType.MESSAGE && action?.description.startsWith('What should'));
            });
            ctx.battleResult.win = true;
            ctx.addToStack(new EndBattle(this.initiator));
            ctx.addToStack(new Message('You won the battle!', this.initiator));
        } else if (ctx.player.monsters.every((monster: PokemonInstance) => monster.fainted)) {
            ctx.battleResult.win = false;
            ctx.addToStack(new EndBattle(this.initiator));
            ctx.addToStack(new Message('You lost the battle...', this.initiator));
        } else if (ctx.opponentPokemon.fainted && ctx.opponent instanceof NPC) {
            if (ctx.settings?.difficulty === 'NORMAL') {
                // random non fainted
                let nonFainted = ctx.opponent.monsters.filter((monster: PokemonInstance) => !monster.fainted);
                ctx.opponentPokemon = nonFainted[Math.floor(Math.random() * nonFainted.length)];
            } else {
                // non fainted with best type advantage
                let nonFainted = ctx.opponent.monsters.filter((monster: PokemonInstance) => !monster.fainted);
                let bestTypeAdvantage = ctx.findBestPokemon(ctx.opponent.monsters, ctx.playerPokemon);
                ctx.opponentPokemon = bestTypeAdvantage || nonFainted[Math.floor(Math.random() * nonFainted.length)];
            }
            ctx.addToStack(new Message(`${ctx.opponent.name} sent out ${ctx.opponentPokemon.name}!`, ctx.opponentPokemon));
            ctx.events.pokemonChange.set(ctx.opponent);
        } else if (ctx.playerPokemon.fainted) {
            ctx.events.playerPokemonFaint.set(ctx.playerPokemon);
        }
        if (actions) {
            actions.forEach((action: ActionV2Interface) => {
                ctx.addToStack(action);
            });
        }
    }
}

export class EndBattle implements ActionV2Interface {
    public type: ActionType;
    public description: string;
    public initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.type = ActionType.END_BATTLE;
        this.description = 'End Battle';
        this.initiator = initiator;
    }

    execute(ctx: BattleContext): void {
        ctx.player.monsters?.forEach((monster: PokemonInstance) => {
            monster.resetBattleStats();
        });
        ctx?.opponent instanceof NPC && ctx.opponent.monsters.forEach((monster: PokemonInstance) => {
            monster.resetBattleStats();
        });
        ctx.clearStack();
        ctx.events.end.set(ctx.battleResult);
        ctx.events.battleEnded = true;
    }
}