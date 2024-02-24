import {PokemonInstance} from "../pokemons/pokedex";
import {CHARACTER_SPRITES} from "../const";
import {Bag} from "../items/bag";
import type {Position} from "../sprites/drawers";

export class Character {
    public spriteId: number;
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public monsters: PokemonInstance[];
    public bag = new Bag();
    public lvl: number = 1;
    public moving: boolean = false;
    public running: boolean = false;
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';

    constructor(spriteId: number, name: string, gender: 'MALE' | 'FEMALE', monsters: PokemonInstance[], bag: Bag, lvl: number, moving: boolean, direction: 'up' | 'down' | 'left' | 'right') {
        this.spriteId = 1;
        this.name = name;
        this.gender = gender;
        this.monsters = monsters;
        this.bag = bag;
        this.lvl = lvl;
        this.moving = moving;
        this.direction = direction;
    }

    public static fromScratch(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): Character {
        return new Character(
            spriteId,
            name,
            gender,
            [],
            new Bag(),
            1,
            false,
            'down',
        )
    }

    public static fromInstance(character: Character): Character {
        return new Character(
            character.spriteId,
            character.name,
            character.gender,
            character.monsters,
            character.bag,
            character.lvl,
            character.moving,
            character.direction,
        );
    }

    public setPrototypes(): Character {
        this.monsters.forEach((monster) => {
            Object.setPrototypeOf(monster, PokemonInstance.prototype);
        });
        this.bag = new Bag(this.bag);
        return this;
    }

    public draw(ctx: CanvasRenderingContext2D, type: 'front' | 'overworld', scale: number, playerPosition: Position, mapDim: {width: number, height: number}) {
        CHARACTER_SPRITES.draw(this.spriteId, ctx, type, this.direction, scale, this.moving, playerPosition, mapDim);
    }
}

