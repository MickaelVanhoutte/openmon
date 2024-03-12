import type { Bag } from "../items/bag";
import type { Position } from "../mapping/positions";
import type { PokemonInstance } from "../pokemons/pokedex";


export const WALKING_SPEED: number = .3;
export const RUNNING_SPEED: number = .6;

export interface Character {
    spriteId: number;
    name: string;
    gender: 'MALE' | 'FEMALE';
    monsters: PokemonInstance[];
    bag: Bag;
    moving: boolean;
    position: CharacterPosition;
}

export class CharacterPosition {
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';
    public targetDirection: 'up' | 'down' | 'left' | 'right' = 'down';
    public positionOnMap: Position = { x: 0, y: 0 };
    public targetPosition: Position = { x: 0, y: 0 };

    constructor(initialX?: number, initialY?: number, initialDirection?: 'up' | 'down' | 'left' | 'right') {
        if (initialX) {
            this.positionOnMap.x = initialX
            this.targetPosition.x = initialX
        };
        if (initialY) {
            this.positionOnMap.y = initialY;
            this.targetPosition.y = initialY;
        }
        if (initialDirection) {
            this.direction = initialDirection;
            this.targetDirection = initialDirection;
        }
    }
}
