import {Character} from "../player/player";
import {Move, MoveInstance, PokemonInstance} from "../pokemons/pokedex";
import {writable} from "svelte/store";
import {EXPERIENCE_CHART} from "../pokemons/experience";

//import {MOVE_EFFECT_APPLIER} from "../pokemons/move-effects";


export class BattleContext {
    public state?: BattleState;

    constructor(state?: BattleState) {
        this.state = state;
    }
}

export const BATTLE_STATE = writable(new BattleContext());

export class BattleState {

    // for transition animation
    public starting = true;
    public ending = false;

    public pokemonsAppearing = false;

    public player: Character;
    public playerCurrentMonster: PokemonInstance;

    public opponent: Character | PokemonInstance;
    public opponentCurrentMonster: PokemonInstance;

    public turnStack: Action[];

    private escapeAttempts: number = 0;

    public isPlayerTurnV: boolean;
    public opponentHpV: number;
    public allyHpV: number;
    public currentMessageV: string;


    public onClose: () => void = () => {
    };

    get wild(): boolean {
        return this.opponent instanceof PokemonInstance;
    }

    constructor(player: Character, opponent: Character | PokemonInstance) {
        this.player = player;
        this.opponent = opponent;
        this.playerCurrentMonster = player.monsters[0];
        this.opponentCurrentMonster = this.wild ? opponent as PokemonInstance : (opponent as Character).monsters[0];

        this.turnStack = [];

        this.isPlayerTurnV = true;
        this.opponentHpV = this.opponentCurrentMonster.currentHp;
        this.allyHpV = this.playerCurrentMonster.currentHp;
        this.currentMessageV = `What should ${this.playerCurrentMonster.name} do ?`;
    }

    public selectAction(action: Action) {
        this.isPlayerTurnV = false;

        if (action instanceof Attack && this.playerCurrentMonster.currentStats.speed > this.opponentCurrentMonster.currentStats.speed
            || action instanceof RunAway
            || action instanceof ChangePokemon
            || action instanceof BagObject) {
            this.addToStack(action);
            this.selectOpponentAction();
        } else {
            this.selectOpponentAction();
            this.addToStack(action);
        }

        this.executeAction(this.turnStack?.shift());
    }

    sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    private executeAction(action?: Action) {
        if (action !== undefined) {
            console.debug('executing ' + action?.name)

            if (action instanceof Attack && !action.initiator.fainted) {
                this.attack(action);
            } else if (action instanceof RunAway) {
                this.runAway();
            } else if (action instanceof ChangePokemon) {
                // this.changePokemon(action);
            } else if (action instanceof BagObject) {
                // this.useBagObject(action);
            } else if (action instanceof Message) {
                this.currentMessageV = action.description;
            } else if (action instanceof RemoveHP) {
                this.removeHP(action);
            } else if (action instanceof Faint) {
                action.initiator.fainted = true;
            } else if (action instanceof XPWin) {
                let result = action.initiator.addXpResult(action.xp, 1);
                if (result.levelup) {
                    this.addToStack(new Message(`${action.initiator.name} grew to level ${action.initiator.level + 1}!`, action.initiator));
                    action.initiator.level += 1;
                    action.initiator.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(action.initiator.level, action.initiator.growthRateId);
                }
                if (result.xpLeft > 0) {
                    this.addToStack(new XPWin(action.initiator, result.xpLeft));
                }

            } else if (action instanceof ApplyEffect) {
                //MOVE_EFFECT_APPLIER.apply(action.move.effect, action.target === 'opponent' ? [this.opponentCurrentMonster] : [action.initiator], action.initiator);
            } else if (action instanceof EndTurn) {
                this.endTurn(action)
            } else if (action instanceof EndBattle) {
                this.ending = true;
                this.onClose();
            }
            BATTLE_STATE.set(new BattleContext(this));

            // TODO wait for input
            this.sleep(1000).then(
                () => {
                    let nextAction = this.turnStack?.shift();
                    this.executeAction(nextAction);
                }
            );
        }
    }

    private addToStack(action: Action, unshift: boolean = false) {
        if (unshift) {
            this.turnStack.unshift(action);
        } else {
            this.turnStack.push(action);
        }
    }

    private runAway() {
        if (this.wild) {
            // randomized based on opponent speed
            this.escapeAttempts++;
            const random = Math.random() * 255;
            const f = Math.floor((this.opponentCurrentMonster.currentStats.speed * 128) / this.playerCurrentMonster.currentStats.speed) + 30 * this.escapeAttempts * random;

            if (f > 255) {
                this.turnStack = [];
                this.addToStack(new EndBattle(this.playerCurrentMonster));
                this.addToStack(new Message('You ran away safely!', this.playerCurrentMonster), true);
            } else {
                this.addToStack(new Message('Failed to run away!', this.playerCurrentMonster), true);
            }
        } else {
            this.addToStack(new Message('You can\'t run away from a trainer battle!', this.playerCurrentMonster), true);
        }

    }

    private attack(action: Attack) {
        const attacker = action.initiator;
        const target = action.target === 'opponent' ? this.opponentCurrentMonster : this.playerCurrentMonster;
        const actionsToPush: Action[] = [];
        const success = this.accuracyApplies(action.move);

        console.debug('attack', {attacker}, {target}, {success});

        if (success) {

            const result = this.calculateDamage(attacker, target, action.move);

            console.debug({result})

            actionsToPush.push(new Message(attacker.name + ' used ' + action.move.name + '!', action.initiator));

            if (result.immune) {
                actionsToPush.push(new Message('It doesn\'t affect ' + target.name + '...', action.initiator));
            } else if (result.notVeryEffective) {
                actionsToPush.push(new Message('It\'s not very effective...', action.initiator));
            } else if (result.superEffective) {
                actionsToPush.push(new Message('It\'s super effective!', action.initiator));
            }
            if (result.critical) {
                actionsToPush.push(new Message('A critical hit!', action.initiator));
            }

            actionsToPush.push(new RemoveHP(result.damages, action.target, action.initiator));

            if (!result.immune && this.effectApplies(action.move)) {
                actionsToPush.push(new ApplyEffect(action.move, action.target, action.initiator))
            }
        } else {
            actionsToPush.push(new Message('But it failed!', action.initiator));
        }

        console.debug('actions from attack ', actionsToPush);
        if (actionsToPush) {
            actionsToPush.reverse().forEach((action: Action) => this.addToStack(action, true));
        }
    }

    private removeHP(action: RemoveHP) {
        let actionsToPush = [];
        const target = action.target === 'opponent' ?
            this.opponentCurrentMonster :
            this.playerCurrentMonster;

        target.currentHp = target.currentHp - action.damages;

        if (target.currentHp <= 0) {
            target.currentHp = 0;

            // clear stack
            this.turnStack = [];

            action.target === 'opponent' ? this.opponentHpV = target.currentHp : this.allyHpV = target.currentHp;

            this.addToStack(new Message(target.name + ' fainted!', action.initiator));
            this.addToStack(new Faint(target));

            if (target === this.opponentCurrentMonster) {
                let xp = EXPERIENCE_CHART.howMuchIGet(action.initiator, target, 1, false, false);
                this.addToStack(new Message(`${action.initiator.name} gets ${xp} experience!`, action.initiator));
                this.addToStack(new XPWin(action.initiator, xp));
            }

            this.addToStack(new EndTurn(action.initiator));
        }
    }

    private calculateDamage(attacker: PokemonInstance, defender: PokemonInstance, move: MoveInstance): DamageResults {
        let result = new DamageResults();
        if (move.category !== 'status') {
            const attack = move.category === 'physical' ? attacker.currentStats.attack : attacker.currentStats.specialAttack;
            const defense = move.category === 'physical' ? defender.currentStats.defense : defender.currentStats.specialDefense;

            const typeEffectiveness = this.calculateTypeEffectiveness(move.type, defender.types);
            result.superEffective = typeEffectiveness > 1;
            result.notVeryEffective = typeEffectiveness < 1;
            result.immune = typeEffectiveness === 0;

            const critical = result.immune ? 0 : this.calculateCritical();
            result.critical = critical > 1;

            const random = Math.random() * (1 - 0.85) + 0.85;
            const stab = this.calculateStab(attacker, move);
            const other = 1; // burn, weather, badges  ...
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

    private selectOpponentAction() {
        const move = this.opponentCurrentMonster.selectMove('Easy');
        //this.turnStack.push(new Attack(move, 'ally', this.opponentCurrentMonster));
        this.addToStack(new Attack(move, 'ally', this.opponentCurrentMonster));
    }

    private accuracyApplies(move: MoveInstance) {
        return move.accuracy === 100 || move.accuracy === 0 || !Number.isInteger(move.effectChance) || Math.random() * 100 < move.accuracy;
    }

    private effectApplies(move: MoveInstance) {
        return move.effect && Number.isInteger(move.effectChance) && Math.random() * 100 < move.effectChance;
    }

    private endTurn(action: Action) {
        if (this.wild || (this.opponent instanceof Character && this.opponent.monsters.every((monster: PokemonInstance) => monster.fainted))) {
            this.addToStack(new Message('You won the battle!', action.initiator));
            this.addToStack(new EndBattle(action.initiator));
        }else if (this.player.monsters.every((monster: PokemonInstance) => monster.fainted)) {
            this.addToStack(new Message('You lose the battle...', action.initiator));
            this.addToStack(new EndBattle(action.initiator));
        }else {
            this.isPlayerTurnV = true;
            this.currentMessageV = `What should ${this.playerCurrentMonster.name} do ?`;

        }
        BATTLE_STATE.set(new BattleContext(this));
    }
}

export class DamageResults {
    superEffective: boolean = false;
    notVeryEffective: boolean = false;
    immune: boolean = false;
    critical: boolean = false;
    effectSuccess: boolean = false;
    effectApplied: string = "";
    damages: number = 0;

    constructor() {
    }
}

export interface Action {
    name: string;
    description: string;
    initiator: PokemonInstance;
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

}

export class Faint implements Action {
    name: string;
    description: string;
    initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'Faint';
        this.description = `${initiator.name} fainted!`;
        this.initiator = initiator;
    }
}

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
}

export class RunAway implements Action {
    public description: string;
    public name: string;
    public initiator: PokemonInstance;

    constructor(initiator: PokemonInstance) {
        this.name = 'Run Away';
        this.description = 'Run away from the battle';
        this.initiator = initiator;
    }
}

export class ChangePokemon implements Action {
    public description: string;
    public name: string;
    public targetIdx: number;
    public initiator: PokemonInstance;

    constructor(targetIdx: number, initiator: PokemonInstance) {
        this.name = 'Change Pokemon';
        this.description = 'Change the current pokemon';
        this.targetIdx = targetIdx;
        this.initiator = initiator;
    }
}

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
}

export class BagObject implements Action {
    description: string;
    name: string;
    public itemId: string;
    public targetType: 'opponent' | 'ally';
    public targetIdx: number;
    public initiator: PokemonInstance;

    constructor(name: string, description: string, itemId: string, targetType: 'opponent' | 'ally', initiator: PokemonInstance, targetIdx = 0) {
        this.name = name;
        this.description = description;
        this.itemId = itemId;
        this.targetType = targetType;
        this.targetIdx = targetIdx;
        this.initiator = initiator;
    }
}

function fromTypeChart(type1: string, type2: string): number {
    // @ts-ignore
    return typeChart[type1.toLowerCase()][type2.toLowerCase()] as number;
}

export const typeChart = {
    "normal": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 0.5,
        "ghost": 0,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5
    },
    "fire": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 1,
        "grass": 2,
        "ice": 2,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 2,
        "rock": 0.5,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 2
    },
    "water": {
        "normal": 1,
        "fire": 2,
        "water": 0.5,
        "electric": 1,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 2,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 2,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 1
    },
    "electric": {
        "normal": 1,
        "fire": 1,
        "water": 2,
        "electric": 0.5,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 0,
        "flying": 2,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 1
    },
    "grass": {
        "normal": 1,
        "fire": 0.5,
        "water": 2,
        "electric": 1,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 0.5,
        "ground": 2,
        "flying": 0.5,
        "psychic": 1,
        "bug": 0.5,
        "rock": 2,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 0.5
    },
    "ice": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 1,
        "grass": 2,
        "ice": 0.5,
        "fighting": 1,
        "poison": 1,
        "ground": 2,
        "flying": 2,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 1,
        "steel": 0.5
    },
    "fighting": {
        "normal": 2,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 2,
        "fighting": 1,
        "poison": 0.5,
        "ground": 1,
        "flying": 0.5,
        "psychic": 0.5,
        "bug": 0.5,
        "rock": 2,
        "ghost": 0,
        "dragon": 1,
        "dark": 2,
        "steel": 2
    },
    "poison": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 2,
        "ice": 1,
        "fighting": 1,
        "poison": 0.5,
        "ground": 0.5,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 0.5,
        "ghost": 0.5,
        "dragon": 1,
        "dark": 1,
        "steel": 0
    },
    "ground": {
        "normal": 1,
        "fire": 2,
        "water": 1,
        "electric": 2,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 2,
        "ground": 1,
        "flying": 0,
        "psychic": 1,
        "bug": 0.5,
        "rock": 2,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 2
    },
    "flying": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 0.5,
        "grass": 2,
        "ice": 1,
        "fighting": 2,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 2,
        "rock": 0.5,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5
    },
    "psychic": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 2,
        "poison": 2,
        "ground": 1,
        "flying": 1,
        "psychic": 0.5,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 1,
        "dark": 0,
        "steel": 0.5
    },
    "bug": {
        "normal": 1,
        "fire": 0.5,
        "water": 1,
        "electric": 1,
        "grass": 2,
        "ice": 1,
        "fighting": 0.5,
        "poison": 0.5,
        "ground": 1,
        "flying": 0.5,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 0.5,
        "dragon": 1,
        "dark": 2,
        "steel": 0.5
    },
    "rock": {
        "normal": 1,
        "fire": 2,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 2,
        "fighting": 0.5,
        "poison": 1,
        "ground": 0.5,
        "flying": 2,
        "psychic": 1,
        "bug": 2,
        "rock": 1,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5
    },
    "ghost": {
        "normal": 0,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 2,
        "dragon": 1,
        "dark": 0.5,
        "steel": 0.5
    },
    "dragon": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 1,
        "steel": 0.5
    },
    "dark": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 0.5,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 2,
        "dragon": 1,
        "dark": 0.5,
        "steel": 0.5
    },
    "steel": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 0.5,
        "grass": 1,
        "ice": 2,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 2,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5
    }
}
