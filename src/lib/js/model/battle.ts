import {Position} from "./sprites";
import {Character} from "./player";
import {Monster, Move} from "./monster";

export class BattleState {

    public player: Character;
    public playerCurrentMonster: Monster;

    public opponent: Character | Monster;
    public opponentCurrentMonster: Monster;

    public isPlayerTurn: boolean;

    public turnStack: Action[];
    private initialOpponentPosition: Position;
    private initialAllyPosition: Position;

    private escapeAttempts: number = 0;

    public onClose: () => void = () => {
    };

    public currentMessage: string = 'What will you do ?';

    get wild(): boolean {
        return this.opponent instanceof Monster;
    }

    constructor(player: Character, opponent: Character | Monster, canvas: HTMLCanvasElement) {
        this.player = player;
        this.opponent = opponent;
        this.playerCurrentMonster = player.monsters[0];
        this.opponentCurrentMonster = this.wild ? opponent as Monster : (opponent as Character).monsters[0];

        this.turnStack = [];

        this.initialOpponentPosition = new Position(
            (canvas.width / 4) * 3 - (opponent?.sprites.width * 2.5 * opponent?.spriteScale / 2),
            (canvas.height / 2) - ((opponent?.sprites.height * 2.5 * opponent?.spriteScale)) - (12 * 2.5)
        );

        this.initialAllyPosition = new Position(
            (canvas.width / 4) - ((this.playerCurrentMonster?.sprites.width * 2.5 * this.playerCurrentMonster.spriteScale) / 2),
            (canvas.height * 0.75) - (this.playerCurrentMonster?.sprites.height * 2.5 * this.playerCurrentMonster.spriteScale) + (15 * 2.5)
        );

        this.playerCurrentMonster.position = this.initialAllyPosition;
        this.opponentCurrentMonster.position = this.initialOpponentPosition;

        this.isPlayerTurn = true;
    }

    public selectAction(action: Action) {
        this.isPlayerTurn = false;
        if (action instanceof Attack && this.playerCurrentMonster.currentStats.speed > this.opponentCurrentMonster.currentStats.speed
            || action instanceof RunAway
            || action instanceof ChangePokemon
            || action instanceof BagObject) {
            this.turnStack.push(action);
            this.selectOpponentAction();
        } else {
            this.selectOpponentAction();
            this.turnStack.push(action);
        }

        this.executeAction(this.turnStack.shift());
    }

    private runAway() {
        if (this.wild) {
            // randomized based on opponent speed
            this.escapeAttempts++;
            const random = Math.random() * 255;
            const f = Math.floor((this.opponentCurrentMonster.currentStats.speed * 128) / this.playerCurrentMonster.currentStats.speed) + 30 * this.escapeAttempts * random;

            if (f > 255) {
                this.turnStack = [];
                this.turnStack.push(new EndBattle(this.playerCurrentMonster));
                this.turnStack.unshift(new Message('You ran away safely!', this.playerCurrentMonster));
            } else {
                this.turnStack.unshift(new Message('Failed to run away!', this.playerCurrentMonster));
            }
        } else {
            this.turnStack.unshift(new Message('You can\'t run away from a trainer battle!', this.playerCurrentMonster));
        }

    }

    private attack(action: Attack) {
        const attacker = action.initiator;
        const defender = action.target === 'opponent' ? this.opponentCurrentMonster : this.playerCurrentMonster;

        const result = this.calculateDamage(attacker, defender, action.move);
        const actionsToPush: Action[] = [];


        actionsToPush.push(new Message(attacker.name + ' used ' + action.move.name + '!', action.initiator));

        if (result.immune) {
            actionsToPush.push(new Message('It doesn\'t affect ' + defender.name + '...', action.initiator));
        } else if (result.notVeryEffective) {
            actionsToPush.push(new Message('It\'s not very effective...', action.initiator));
        } else if (result.superEffective) {
            actionsToPush.push(new Message('It\'s super effective!', action.initiator));
        }
        if (result.critical) {
            actionsToPush.push(new Message('A critical hit!', action.initiator));
        }

        actionsToPush.push(new RemoveHP(result.damages, action.target, action.initiator));
        actionsToPush.reverse().forEach((action: Action) => this.turnStack.unshift(action));
    }

    private calculateDamage(attacker: Monster, defender: Monster, move: Move): DamageResults {
        let result = new DamageResults();
        if (move.category !== 'Status') {
            const attack = move.category === 'Physical' ? attacker.currentStats.attack : attacker.currentStats.specialAttack;
            const defense = move.category === 'Physical' ? defender.currentStats.defense : defender.currentStats.specialDefense;

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

    private calculateStab(attacker: Monster, move: Move) {
        return attacker.types.includes(move.type) ? 1.5 : 1;
    }

    private selectOpponentAction() {
        const move = this.opponentCurrentMonster.selectMove('Easy');
        this.turnStack.push(new Attack(move, 'ally', this.opponentCurrentMonster));
    }

    sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    private executeAction(action?: Action) {

        if (action) {
            if (action instanceof Attack && !action.initiator.fainted) {
                this.attack(action);
            } else if (action instanceof RunAway) {
                this.runAway();
            } else if (action instanceof ChangePokemon) {
                // this.changePokemon(action);
            } else if (action instanceof BagObject) {
                // this.useBagObject(action);
            } else if (action instanceof Message) {
                this.currentMessage = action.description;
            } else if (action instanceof RemoveHP) {
                this.removeHP(action);
            } else if(action instanceof EndBattle) {
                this.onClose();
            }
        }

        if (this.turnStack?.length || 0 > 0) {
            this.sleep(1000).then(
                () => this.executeAction(this.turnStack?.shift())
            );
            //this.executeAction(stack?.shift(), stack)
        } else {
            this.isPlayerTurn = true;
        }
    }

    private removeHP(action: RemoveHP) {
        const target = action.target === 'opponent' ? this.opponentCurrentMonster : this.playerCurrentMonster;
        target.currentHp -= action.damages;
        if (target.currentHp <= 0) {
            target.currentHp = 0;
            target.fainted = true;

            this.turnStack = [];
            this.turnStack.push(new Message(target.name + ' fainted!', action.initiator));

            if (this.wild || (this.opponent instanceof Character && this.opponent.monsters.every((monster: Monster) => monster.fainted))) {
                this.turnStack.unshift(new EndBattle(action.initiator));
                this.turnStack.unshift(new Message('You won the battle!', action.initiator));
                setTimeout(() => {
                    this.onClose();
                }, 1000);
            }
        }
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
    initiator: Monster;
}

export class EndBattle implements Action {
    public name: string;
    public description: string;
    public initiator: Monster;

    constructor(initiator: Monster) {
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
    public initiator: Monster;

    constructor(damages: number, target: 'opponent' | 'ally', initiator: Monster) {
        this.name = 'Remove HP';
        this.description = 'Remove HP';
        this.damages = damages;
        this.target = target;
        this.initiator = initiator;
    }
}

export class Message implements Action {
    public name: string;
    public description: string;
    public initiator: Monster;

    constructor(message: string, initiator: Monster) {
        this.name = 'Message';
        this.description = message;
        this.initiator = initiator;
    }
}

export class RunAway implements Action {
    public description: string;
    public name: string;
    public initiator: Monster;

    constructor(initiator: Monster) {
        this.name = 'Run Away';
        this.description = 'Run away from the battle';
        this.initiator = initiator;
    }
}

export class ChangePokemon implements Action {
    public description: string;
    public name: string;
    public targetIdx: number;
    public initiator: Monster;

    constructor(targetIdx: number, initiator: Monster) {
        this.name = 'Change Pokemon';
        this.description = 'Change the current pokemon';
        this.targetIdx = targetIdx;
        this.initiator = initiator;
    }
}

export class Attack implements Action {
    public name: string;
    public description: string;
    public move: Move;
    public target: 'opponent' | 'ally';
    public initiator: Monster;

    constructor(move: Move, target: 'opponent' | 'ally', initiator: Monster) {
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
    public initiator: Monster;

    constructor(name: string, description: string, itemId: string, targetType: 'opponent' | 'ally', initiator: Monster, targetIdx = 0) {
        this.name = name;
        this.description = description;
        this.itemId = itemId;
        this.targetType = targetType;
        this.targetIdx = targetIdx;
        this.initiator = initiator;
    }
}

class BattleSprite {
    private position: Position;
    private image: HTMLImageElement;
    private width: number = 0;
    private height: number = 0;

    constructor(position: Position, image: HTMLImageElement) {
        this.position = position;
        this.image = image;
        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;
        }
    }

    draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.drawImage(this.image,
            0,
            0,
            this.image.width,
            this.image.height,
            0,
            0,
            canvas.width,
            canvas.height * 0.75);
    }
}

const battleImg = new Image();
battleImg.src = 'src/assets/battle/battle-grass.png';

export const battleBackground = new BattleSprite(
    new Position(0, 0),
    battleImg,
);


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
