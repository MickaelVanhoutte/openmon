import {PokemonInstance} from "../pokemons/pokedex";
import {CHARACTER_SPRITES} from "../const";
import {Bag} from "../items/bag";
import type {Position} from "../sprites/drawers";

export interface Character {
    spriteId: number;
    name: string;
    gender: 'MALE' | 'FEMALE';
    monsters: PokemonInstance[];
    bag: Bag;
    moving: boolean;
    direction: 'up' | 'down' | 'left' | 'right';
}

export class Player  implements Character{
    public spriteId: number;
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public monsters: PokemonInstance[];
    public bag = new Bag();
    public lvl: number = 1;
    public moving: boolean = false;
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';

    constructor(spriteId: number, name: string, gender: 'MALE' | 'FEMALE', monsters: PokemonInstance[], bag: Bag, lvl: number, moving: boolean, direction: 'up' | 'down' | 'left' | 'right') {
        this.spriteId = spriteId;
        this.name = name;
        this.gender = gender;
        this.monsters = monsters;
        this.bag = bag;
        this.lvl = lvl;
        this.moving = moving;
        this.direction = direction;
    }

    public static fromScratch(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): Player {
        return new Player(
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

    public static fromInstance(character: Player): Player {
        return new Player(
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

    public setPrototypes(): Player {
        this.monsters.forEach((monster) => {
            Object.setPrototypeOf(monster, PokemonInstance.prototype);
        });
        this.bag = new Bag(this.bag);
        return this;
    }

    public draw(ctx: CanvasRenderingContext2D, type: 'front' | 'overworld', scale: number, playerPosition: Position, mapDim: {
        width: number,
        height: number
    }, drawGrass:boolean) {
        CHARACTER_SPRITES.draw(this.spriteId, ctx, type, this.direction, scale, this.moving, playerPosition, mapDim, drawGrass);
    }
}

