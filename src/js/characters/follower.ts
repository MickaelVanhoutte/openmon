import { Bag } from "../items/bag";
import type { Position } from "../mapping/positions";
import { PokemonInstance } from "../pokemons/pokedex";
import type { Script } from "../scripting/scripts";
import { centerObject } from "../sprites/sprites";
import { WALKING_SPEED, type Character, CharacterPosition, type Interactive, RUNNING_SPEED } from "./characters-model";

export class Follower implements Character, Interactive {

    position: CharacterPosition;
    spriteId: number = 0;
    name: string = "Follower";
    gender: "MALE" | "FEMALE" = "MALE";
    monsters: PokemonInstance[] = [];
    bag: Bag = new Bag();
    moving: boolean = false;

    pokemon: PokemonInstance;

    constructor(position: CharacterPosition, pokemon: PokemonInstance) {
        this.position = position;
        this.pokemon = pokemon;
    }

    static fromInstance(follower: Follower): Follower {
        let followerProto = new Follower(
            new CharacterPosition(follower.position.positionOnMap, follower.position.direction),
            follower.pokemon
        );
        Object.setPrototypeOf(followerProto.pokemon, PokemonInstance.prototype);
        return followerProto;
    }

    interact(playerPosition: Position): (Script | undefined)[] {
        throw new Error("Method not implemented.");
    }

    private orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }
    private images: Record<string, HTMLImageElement> = {};
    private frames = { max: 4, val: 0, elapsed: 0 };

    draw(ctx: CanvasRenderingContext2D, playerPosition: Position, scale: number, mapDim: {
        width: number,
        height: number
    }, drawGrass: boolean, running: boolean) {

        let id = ("00" + this.pokemon.id).slice(-3);
        id = this.pokemon.isShiny ? id + 's' : id;
        let source = `src/assets/monsters/walking/${id}.png`;
        let image = this.images[source];

        if (image && image.complete) {
            this.drawImage(ctx, image, playerPosition, scale, mapDim, drawGrass, running);
        } else {
            image = new Image();
            image.src = source;
            image.onload = () => {
                this.images[source] = image;
                this.drawImage(ctx, image, playerPosition, scale, mapDim, drawGrass, running);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerPosition: Position,
        scale: number, mapDim: {
            width: number,
            height: number
        }, drawGrass: boolean, running: boolean) {

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

        let sY = this.orientationIndexes[this.position.direction] * image.width / 4;

        if (this.moving) {
            const speed = running ? RUNNING_SPEED : WALKING_SPEED;

            const deltaX = this.position.targetPosition.x - this.position.positionOnMap.x;
            const deltaY = this.position.targetPosition.y - this.position.positionOnMap.y;

            const deltaXPx = this.position.targetPositionInPx.x - this.position.positionInPx.x;
            const deltaYPx = this.position.targetPositionInPx.y - this.position.positionInPx.y;

            const moveByX = Math.floor((16 * 2.5) / 2 * speed * deltaX);
            const moveByY = Math.floor((16 * 2.5) / 2 * speed * deltaY);

            const distance = Math.sqrt(deltaXPx * deltaXPx + deltaYPx * deltaYPx);

            if (distance < ((16 * 2.5) / 2 * speed) + 1) {
                this.position.positionInPx.x = this.position.targetPositionInPx.x;
                this.position.positionInPx.y = this.position.targetPositionInPx.y;
                this.position.positionOnMap = this.position.targetPosition;
                this.moving = false;
            } else {
                this.position.positionInPx.x += moveByX;
                this.position.positionInPx.y += moveByY;
            }
        }

        // Calculate the position of the NPC relative to the player
        let imageWidth = image.width / this.frames.max * scale//image.width / this.frames.max * scale;
        let imageHeight = image.height / this.frames.max * scale//image.height / this.frames.max * scale;

        let relativeX = this.position.positionInPx.x - playerPosition.x;
        let relativeY = this.position.positionInPx.y - playerPosition.y;

        // switch (this.position.direction) {

        //     case 'up':

        //         break;
        //     case 'down':

        //         break;
        //     case 'left':
        //         relativeY -= 16 - imageHeight;
        //         relativeX -= 32 -imageWidth;
        //         break;
        //     case 'right':
        //         relativeY -= 16 - imageHeight;
        //         relativeX += 16 - imageWidth;
        //         break;
        // }

        let { centerX, centerY, offsetX, offsetY } = centerObject(ctx, scale, playerPosition, imageWidth, mapDim);
        //console.log(relativeY, ((image.height / 4 - 16) / 4));
        //offsetY -= relativeY// adjust for different sprite sizes
        //offsetX -= relativeX;

        // adjust offset based on size ((image.width / 4 - 16) / 4), positively or negatively depending on direction
        //offsetX -= (16 * 2.5) - (imageWidth / 2);
        //offsetY -= (16 * 2.5) - (imageHeight / 2);

        switch (this.position.direction) {
            case 'up':
                offsetY -= 8;
                offsetX -= (16 * scale);
                break;
            case 'down':
                offsetY -= (32 * scale) - imageHeight / 2;
                offsetX -= (16 * scale);
                break;
            case 'left':
                offsetY -= (40 * scale) - imageHeight / 2;
                offsetX -= imageWidth / 4;
                break;
            case 'right':
                offsetY -= (40 * scale) - imageHeight / 2;
                offsetX -= (32 * scale) - imageWidth / 4;
                break;
        }
        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);


        // ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        // ctx.fillRect(relativeX, relativeY, imageWidth, imageHeight);

        ctx.drawImage(
            image,
            this.frames.val * (image.height / this.frames.max),
            sY,
            image.width / this.frames.max,
            drawGrass ? image.height / this.frames.max * .85 : image.height / this.frames.max,
            relativeX,
            relativeY,
            imageWidth,
            drawGrass ? imageHeight * .85 : imageHeight
        );

        ctx.restore();
    }

}




//todo: make interactive
export class PokeWalkerSpriteDrawer {
    private images: Record<string, HTMLImageElement> = {};

    private frames = { max: 4, val: 0, elapsed: 0 };

    private orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }


    draw(ctx: CanvasRenderingContext2D, playerPosition: Position, orientation: 'up' | 'down' | 'left' | 'right',
        scale: number, moving: boolean, walkerPosition: Position, pokemon: PokemonInstance, mapDim: {
            width: number,
            height: number
        }, drawGrass: boolean = true) {

        let id = ("00" + pokemon.id).slice(-3);
        id = pokemon.isShiny ? id + 's' : id;
        let source = `src/assets/monsters/walking/${id}.png`;
        let image = this.images[source];
        if (image && image.complete) {
            this.drawImage(ctx, image, playerPosition, orientation, scale, moving, walkerPosition, mapDim);
        } else {
            image = new Image();
            image.src = source;
            image.onload = () => {
                this.images[source] = image;
                this.drawImage(ctx, image, playerPosition, orientation, scale, moving, walkerPosition, mapDim);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerPosition: Position, orientation: 'up' | 'down' | 'left' | 'right',
        scale: number, moving: boolean, walkerPosition: Position, mapDim: {
            width: number,
            height: number
        }) {

        if (moving) {

            if (this.frames.max > 1) {
                this.frames.elapsed += 1;
            }
            this.frames.val += 1
            if (this.frames.val > this.frames.max - 1) {
                this.frames.val = 0;
            }
        } else {
            this.frames.val = 0;
        }

        let sY = this.orientationIndexes[orientation] * 64;

        // Calculate the position of the NPC relative to the player
        const relativeX = walkerPosition.x - playerPosition.x;
        const relativeY = walkerPosition.y - playerPosition.y;

        let { centerX, centerY, offsetX, offsetY } = centerObject(ctx, scale, playerPosition, 16, mapDim);
        offsetY -= relativeY - 6;
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