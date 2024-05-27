import type { Bag } from "../items/bag";
import { Position } from "../mapping/positions";
import type { PokemonInstance } from "../pokemons/pokedex";
import type { Script } from "../scripting/scripts";
import type { MasteryType } from "./mastery-model";
import type { ComboJauge } from "./player";


export const WALKING_SPEED: number = .5;
export const RUNNING_SPEED: number = 1;

export interface Interactive {
    isBehindCounter(): boolean;
    interact(playerPosition: Position): (Script | undefined)[];
}

export interface Character {
    spriteId: number;
    name: string;
    gender: 'MALE' | 'FEMALE';
    monsters: PokemonInstance[];
    bag: Bag;
    moving: boolean;
    position: CharacterPosition;
    comboJauge: ComboJauge;

    getMasteryBonus(type: MasteryType): number;
}

export class CharacterPosition {
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';
    public targetDirection: 'up' | 'down' | 'left' | 'right' = 'down';
    public positionOnMap: Position = { x: 0, y: 0 };
    public targetPosition: Position = { x: 0, y: 0 };

    public positionInPx: Position = { x: 0, y: 0 };
    public targetPositionInPx: Position = { x: 0, y: 0 };

    constructor(initialPosition?: Position, initialDirection?: 'up' | 'down' | 'left' | 'right', tileSize: number = 16, scale: number = 2.5) {
        if (initialPosition) {
            this.positionOnMap.x = initialPosition.x
            this.targetPosition.x = initialPosition.x
            this.positionInPx.x = initialPosition.x * tileSize * scale;
            this.targetPositionInPx.x = initialPosition.x * tileSize * scale;
            this.positionOnMap.y = initialPosition.y;
            this.targetPosition.y = initialPosition.y;
            this.positionInPx.y = initialPosition.y * tileSize * scale;
            this.targetPositionInPx.y = initialPosition.y * tileSize * scale;
        };

        if (initialDirection) {
            this.direction = initialDirection;
            this.targetDirection = initialDirection;
        }
    }

    public setPosition(position: Position, tileSize: number = 16, scale: number = 2.5) {

        this.positionOnMap = position;
        this.positionInPx = new Position(position.x * tileSize * scale, position.y * tileSize * scale);
        this.targetPosition = position;
        this.targetPositionInPx = new Position(position.x * tileSize * scale, position.y * tileSize * scale);
    }

    public setFuturePosition(x: number, y: number, onEnd?: () => void, tileSize: number = 16, scale: number = 2.5) {
        this.targetPosition = new Position(x, y);
        this.targetPositionInPx = new Position(x * tileSize * scale, y * tileSize * scale);

        // callback when the character reaches the target position
        if (onEnd) {
            let unsubscribe = setInterval(() => {
                if (this.positionOnMap.x === x && this.positionOnMap.y === y) {
                    onEnd();
                    clearInterval(unsubscribe);
                }
            });
        }
        console.log(this);
    }

}
