import {PlayerSpriteDrawer, Position} from "../sprites/drawers";
import {PokemonInstance} from "../pokemons/pokemon";

export class Character {
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public sprites: PlayerSprites;
    public monsters: PokemonInstance[];
    public bag: any[] = [];
    public lvl: number = 1;
    public moving: boolean = false;
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';
    public positionOnScreen: Position;
    public positionOnMap: Position;

    private drawer: PlayerSpriteDrawer;

    constructor(name: string, gender: 'MALE' | 'FEMALE', sprites: PlayerSprites, monsters: PokemonInstance[] = []) {
        this.name = name;
        this.gender = gender;
        this.sprites = sprites;
        this.monsters = monsters;
        this.positionOnMap = new Position(0, 0);
        this.positionOnScreen = new Position(0, 0);
        this.drawer = new PlayerSpriteDrawer();
    }

    get sprite(): string {
        return this.sprites[this.direction];
    }

    public draw(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number, bgWidth: number, bgHeight: number){
        this.drawer.draw(ctx, this.positionOnScreen, movedOffset, scale, bgWidth, bgHeight, this.sprite, this.moving);
    }

    updatePosition(initial: Position, movedOffset: Position) {
        this.positionOnMap.x = initial.x + movedOffset.x;
        this.positionOnMap.y = initial.y + movedOffset.y;
    }
}

export class PlayerSprites {
    public down: string;
    public up: string;
    public left: string;
    public right: string;
    public battle: string;

    public width: number = 80;
    public height: number = 80;

    constructor(front: string, back: string, left: string, right: string, battle: string) {
        this.down = front;
        this.up = back;
        this.left = left;
        this.right = right;
        this.battle = battle;
    }
}

