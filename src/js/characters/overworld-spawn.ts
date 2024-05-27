import { Bag } from "../items/bag";
import type { Position } from "../mapping/positions";
import type { PokemonInstance } from "../pokemons/pokedex";
import { CHARACTER_SPRITES, centerObject } from "../sprites/sprites";
import { RUNNING_SPEED, WALKING_SPEED, type Character, type CharacterPosition } from "./characters-model";
import type { MasteryType } from "./mastery-model";
import { ComboJauge } from "./player";

export class OverworldSpawn implements Character {
    spriteId: number = 0;
    name: string = 'OverworldSpawn';
    gender: "MALE" | "FEMALE" = "MALE";
    monsters: PokemonInstance[] = [];
    bag: Bag = new Bag();
    moving: boolean = true;
    position: CharacterPosition;
    comboJauge: ComboJauge = new ComboJauge();
    pokemon: PokemonInstance;

    private orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }
    private images: Record<string, HTMLImageElement> = {};
    private frames = { max: 4, val: 0, elapsed: 0 };

    constructor(position: CharacterPosition, pokemon: PokemonInstance) {
        this.position = position;
        console.log('constructor', this.position);
        this.pokemon = pokemon;
    }

    getMasteryBonus(type: MasteryType): number {
        throw new Error("Method not implemented.");
    }

    draw(ctx: CanvasRenderingContext2D, playerPosition: Position, scale: number, mapDim: {
        width: number,
        height: number
    }) {

        let id = ("00" + this.pokemon.id).slice(-3);
        id = this.pokemon.isShiny ? id + 's' : id;
        let source = `src/assets/monsters/walking/${id}.png`;
        let image = this.images[source];

        if (image && image.complete) {
            this.drawImage(ctx, image, playerPosition, this.position.direction, scale, mapDim);
        } else {
            image = new Image();
            image.src = source;
            image.onload = () => {
                this.images[this.spriteId] = image;
                this.drawImage(ctx, image, playerPosition, this.position.direction, scale, mapDim);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerPosition: Position, orientation: 'up' | 'down' | 'left' | 'right',
        scale: number, mapDim: {
            width: number,
            height: number
        }) {

        if (this.moving) {

            if (this.frames.max > 1) {
                this.frames.elapsed += 1;
            }
            if (this.frames.elapsed % 2 === 0) {
                this.frames.val += 1
            }
            if (this.frames.val > this.frames.max - 1) {
                this.frames.val = 0;
            }
        } else {
            this.frames.val = 0;
        }

        let sY = this.orientationIndexes[orientation] * 64;

        if (this.moving) {
            const speed = RUNNING_SPEED;

            let deltaX = this.position.targetPosition.x - this.position.positionOnMap.x;
            let deltaY = this.position.targetPosition.y - this.position.positionOnMap.y;
            // max delta to 1 tile
            //console.log(deltaX, deltaY)
            if (deltaX > 1) {
                deltaX = 1;
            }
            if (deltaX < -1) {
                deltaX = -1;
            }
            if (deltaY > 1) {
                deltaY = 1;
            }
            if (deltaY < -1) {
                deltaY = -1;
            }

            const moveByX = Math.floor((16 * 2.5) / 2 * speed * deltaX);
            const moveByY = Math.floor((16 * 2.5) / 2 * speed * deltaY);

            if(this.position.positionInPx.x === this.position.targetPositionInPx.x){
                this.position.positionOnMap = this.position.targetPosition;
                this.moving = false;
            }else {
                this.position.positionInPx.x += moveByX;
                this.position.positionInPx.y += moveByY;
            }
        }

        // Calculate the position of the NPC relative to the player
        const relativeX = this.position.positionInPx.x - playerPosition.x;
        const relativeY = this.position.positionInPx.y - playerPosition.y;

        let { centerX, centerY, offsetX, offsetY } = centerObject(ctx, scale, playerPosition, 16, mapDim);
        offsetY -= relativeY - 12;
        offsetX -= relativeX;

        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);

        ctx.drawImage(
            image,
            this.frames.val * (64),
            sY,
            64,
            64,
            0,
            0,
            64 * scale,
            64 * scale
        );

        ctx.restore();
    }
}