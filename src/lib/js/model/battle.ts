import {Position} from "./sprites";
import {Character} from "./player";
import {Monster, Move} from "./monster";

export class BattleState {

    public player: Character;
    public playerCurrentMonster: Monster;

    public opponent: Character | Monster;
    public opponentCurrentMonster: Monster;

    public isPlayerTurn: boolean = false;

    public turnStack: Action[];
    private initialOpponentPosition: Position;
    private initialAllyPosition: Position;

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
        this.isPlayerTurn = this.playerCurrentMonster.currentStats.speed >= this.opponentCurrentMonster.currentStats.speed;

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
    }

    public selectAction(action: Action) {
        this.turnStack.push(action);
        this.isPlayerTurn = !this.isPlayerTurn;

        this.selectOpponentAction();
    }

    public resolveStack() {
        console.log("resolving stack");
        this.turnStack.forEach((action) => {
            if (action instanceof Attack) {
                this.attack(action);
            } else if (action instanceof ChangePokemon) {
                //this.changePokemon(action);
            } else if (action instanceof RunAway) {
                this.runAway();
            } else if (action instanceof BagObject) {
                //this.useItem(action);
            }
        });
        this.turnStack = [];
        this.isPlayerTurn = !this.isPlayerTurn;
    }

    private runAway() {
        console.log("executing runaway");
        if (this.wild) {

            // randomized based on opponent speed
            const random = Math.random() * 255;
            const f = Math.floor((this.opponentCurrentMonster.currentStats.speed * 128) / this.playerCurrentMonster.currentStats.speed) + 30 * random;
            if (f > 255) {
                this.currentMessage = 'Got away safely!';
                setTimeout(() => {
                    this.onClose();
                }, 1000);
            } else {
                this.currentMessage = 'Failed to run away!';
            }
        } else {
            this.currentMessage = 'You can\'t run away from a trainer battle!';
        }

    }

    private attack(action: Attack) {
        const attacker = action.target === 'opponent' ? this.playerCurrentMonster : this.opponentCurrentMonster;
        const defender = action.target === 'opponent' ? this.opponentCurrentMonster : this.playerCurrentMonster;

        const damage = this.calculateDamage(attacker, defender, action.move);
        console.log(damage);
        defender.currentStats.HP -= damage;
        if (defender.currentStats.HP <= 0) {
            defender.currentStats.HP = 0;
            defender.fainted = true;
        }
    }

    private calculateDamage(attacker: Monster, defender: Monster, move: Move) {
        debugger
        if (move.category !== 'Status') {
            const attack = move.category === 'Physical' ? attacker.currentStats.attack : attacker.currentStats.specialAttack;
            const defense = move.category === 'Physical' ? defender.currentStats.defense : defender.currentStats.specialDefense;
            const modifier = this.calculateModifier(attacker, defender, move);
            return Math.floor((((2 * attacker.level / 5 + 2) * move.power * attack / defense) / 50 + 2) * modifier);
        }
        return 0;
    }

    private calculateModifier(attacker: Monster, defender: Monster, move: Move) {
        const typeEffectiveness = this.calculateTypeEffectiveness(move.type, defender.types);
        const critical = this.calculateCritical();
        const random = Math.random() * (1 - 0.85) + 0.85;
        const stab = this.calculateStab(attacker, move);
        const other = 1;
        return typeEffectiveness * critical * random * stab * other;
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
        this.turnStack.push(new Attack('Attack', 'Attack', move, 'ally'));
        this.resolveStack();
    }
}

export interface Action {
    name: string;
    description: string;
}

export class RunAway implements Action {
    public description: string;
    public name: string;

    constructor() {
        this.name = 'Run Away';
        this.description = 'Run away from the battle';
    }
}

export class ChangePokemon implements Action {
    public description: string;
    public name: string;
    public targetIdx: number;

    constructor(targetIdx: number) {
        this.name = 'Change Pokemon';
        this.description = 'Change the current pokemon';
        this.targetIdx = targetIdx;
    }
}

export class Attack implements Action {
    public name: string;
    public description: string;
    public move: Move;
    public target: 'opponent' | 'ally';

    constructor(name: string, description: string, move: Move, target: 'opponent' | 'ally') {
        this.name = name;
        this.description = description;
        this.move = move;
        this.target = target;
    }
}

export class BagObject implements Action {
    description: string;
    name: string;
    public itemId: string;
    public targetType: 'opponent' | 'ally';
    public targetIdx: number;

    constructor(name: string, description: string, itemId: string, targetType: 'opponent' | 'ally', targetIdx = 0) {
        this.name = name;
        this.description = description;
        this.itemId = itemId;
        this.targetType = targetType;
        this.targetIdx = targetIdx;
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


function fromTypeChart(type1: string, type2: string) {
    const type = typeChart.find((type) => type.name === type1);
    if (!!type) {
        if (type.immunes.includes(type2)) return 0;
        else if (type.weaknesses.includes(type2)) return 2;
        else if (type.strengths.includes(type2)) return 0.5;
        else return 1;
    }
    return 0;
}

export const typeChart = [{"name": "Normal", "immunes": ["Ghost"], "weaknesses": ["Rock", "Steel"], "strengths": []},
    {
        "name": "Fire",
        "immunes": [],
        "weaknesses": ["Fire", "Water", "Rock", "Dragon"],
        "strengths": ["Grass", "Ice", "Bug", "Steel"]
    },
    {
        "name": "Water",
        "immunes": [],
        "weaknesses": ["Water", "Grass", "Dragon"],
        "strengths": ["Fire", "Ground", "Rock"]
    },
    {
        "name": "Electric",
        "immunes": ["Ground"],
        "weaknesses": ["Electric", "Grass", "Dragon"],
        "strengths": ["Water", "Flying"]
    },
    {
        "name": "Grass",
        "immunes": [],
        "weaknesses": ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"],
        "strengths": ["Water", "Ground", "Rock"]
    },
    {
        "name": "Ice",
        "immunes": [],
        "weaknesses": ["Fire", "Water", "Ice", "Steel"],
        "strengths": ["Grass", "Ground", "Flying", "Dragon"]
    },
    {
        "name": "Fighting",
        "immunes": ["Ghost"],
        "weaknesses": ["Poison", "Flying", "Psychic", "Bug", "Fairy"],
        "strengths": ["Normal", "Ice", "Rock", "Dark", "Steel"]
    },
    {
        "name": "Poison",
        "immunes": ["Steel"],
        "weaknesses": ["Poison", "Ground", "Rock", "Ghost"],
        "strengths": ["Grass", "Fairy"]
    },
    {
        "name": "Ground",
        "immunes": ["Flying"],
        "weaknesses": ["Grass", "Bug"],
        "strengths": ["Fire", "Electric", "Poison", "Rock", "Steel"]
    },
    {
        "name": "Flying",
        "immunes": [],
        "weaknesses": ["Electric", "Rock", "Steel"],
        "strengths": ["Grass", "Fighting", "Bug"]
    },
    {"name": "Psychic", "immunes": ["Dark"], "weaknesses": ["Psychic", "Steel"], "strengths": ["Fighting", "Poison"]},
    {
        "name": "Bug",
        "immunes": [],
        "weaknesses": ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"],
        "strengths": ["Grass", "Psychic", "Dark"]
    },
    {
        "name": "Rock",
        "immunes": [],
        "weaknesses": ["Fighting", "Ground", "Steel"],
        "strengths": ["Fire", "Ice", "Flying", "Bug"]
    },
    {"name": "Ghost", "immunes": ["Normal"], "weaknesses": ["Dark"], "strengths": ["Psychic", "Ghost"]},
    {"name": "Dragon", "immunes": ["Fairy"], "weaknesses": ["Steel"], "strengths": ["Dragon"]},
    {"name": "Dark", "immunes": [], "weaknesses": ["Fighting", "Dark", "Fairy"], "strengths": ["Psychic", "Ghost"]},
    {
        "name": "Steel",
        "immunes": [],
        "weaknesses": ["Fire", "Water", "Electric", "Steel"],
        "strengths": ["Ice", "Rock", "Fairy"]
    },
    {
        "name": "Fairy",
        "immunes": [],
        "weaknesses": ["Fire", "Poison", "Steel"],
        "strengths": ["Fighting", "Dragon", "Dark"]
    }];
