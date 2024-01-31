import {PlayerSpriteDrawer, PlayerSprites, Position} from "../sprites/sprites";
import type {PokemonInstance} from "../pokemons/pokemon";
import "@abraham/reflection";
import {container} from "tsyringe";

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
        this.drawer = container.resolve(PlayerSpriteDrawer);
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


