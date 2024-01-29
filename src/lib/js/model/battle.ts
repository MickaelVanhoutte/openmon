import {Position} from "./sprites";
import {Character} from "./player";
import {Monster} from "./monster";

export class BattleState {

    public player: Character;
    public playerCurrentMonster: Monster;

    public opponent: Character | Monster;
    public opponentCurrentMonster: Monster;

    public isPlayerTurn: boolean = false;

    public turnStack: Action[];
    private initialOpponentPosition: Position;
    private initialAllyPosition: Position;

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
}

export class Action {
    public name: string;
    public description: string;
    public action: Function;

    constructor(name: string, description: string, action: Function) {
        this.name = name;
        this.description = description;
        this.action = action;
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
