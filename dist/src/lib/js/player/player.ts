import {PlayerSpriteDrawer, Position} from "../sprites/drawers";
import {PokemonInstance} from "../pokemons/pokedex";

export class Character {
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public sprites: PlayerSprites;
    public monsters: PokemonInstance[];
    public bag: any[] = [];
    public lvl: number = 1;
    public moving: boolean = false;
    public running: boolean = false;
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';

    private drawer: PlayerSpriteDrawer;

    constructor(name: string, gender: 'MALE' | 'FEMALE', sprites: PlayerSprites, monsters: PokemonInstance[], bag: any[], lvl: number, moving: boolean, direction: 'up' | 'down' | 'left' | 'right') {
        this.name = name;
        this.gender = gender;
        this.sprites = sprites;
        this.monsters = monsters;
        this.bag = bag;
        this.lvl = lvl;
        this.moving = moving;
        this.direction = direction;
        this.drawer = new PlayerSpriteDrawer();
    }

    public static fromScratch(name: string, gender: 'MALE' | 'FEMALE', sprites: PlayerSprites): Character {
        return new Character(
            name,
            gender,
            sprites,
            [],
            [],
            1,
            false,
            'down',
        )
    }

    public static fromInstance(character: Character): Character {
        return new Character(
            character.name,
            character.gender,
            character.sprites,
            character.monsters,
            character.bag,
            character.lvl,
            character.moving,
            character.direction,
        );
    }

    public setPrototypes(): Character {
        Object.setPrototypeOf(this.sprites, PlayerSprites.prototype);
        this.monsters.forEach((monster) => {
            Object.setPrototypeOf(monster, PokemonInstance.prototype);
        });
        this.drawer = new PlayerSpriteDrawer();
        return this;
    }

    get sprite(): string {
        return this.sprites[this.direction];
    }

    public draw(ctx: CanvasRenderingContext2D, scale: number) {
        this.drawer.draw(ctx, scale, this.sprite, this.moving);
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

