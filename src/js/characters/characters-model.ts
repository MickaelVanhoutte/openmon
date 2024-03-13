import type { Bag } from "../items/bag";
import type { Position } from "../mapping/positions";
import type { PokemonInstance } from "../pokemons/pokedex";


export const WALKING_SPEED: number = .5;
export const RUNNING_SPEED: number = 1;

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

    public positionInPx: Position = { x: 0, y: 0 };
    public targetPositionInPx: Position = { x: 0, y: 0 };

    constructor(initialX?: number, initialY?: number, initialDirection?: 'up' | 'down' | 'left' | 'right', tileSize: number = 16, scale: number = 2.5) {
        if (initialX) {
            this.positionOnMap.x = initialX
            this.targetPosition.x = initialX
            this.positionInPx.x = initialX * tileSize * scale;
            this.targetPositionInPx.x = initialX * tileSize * scale;
        };
        if (initialY) {
            this.positionOnMap.y = initialY;
            this.targetPosition.y = initialY;
            this.positionInPx.y = initialY * tileSize * scale;
            this.targetPositionInPx.y = initialY * tileSize * scale;
        }
        if (initialDirection) {
            this.direction = initialDirection;
            this.targetDirection = initialDirection;
        }
    }

    public setFuturePosition(x: number, y: number, tileSize: number = 16, scale: number = 2.5) {
        this.targetPosition = { x, y };
        this.targetPositionInPx = { x: x * tileSize * scale, y: y * tileSize * scale };
    }

}
