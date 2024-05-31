import type { Interactive } from "../characters/characters-model";
import type { GameContext } from "../context/gameContext";
import type { Position } from "../mapping/positions";
import type { Script } from "../scripting/scripts";
import { centerObject } from "../sprites/sprites";
import type { AItem } from "./items-model";

export class OverworldItem implements Interactive {

    item?: AItem;
    name: string;
    visible: boolean;
    position: Position;
    spriteSrc: string
    pickedUp: boolean = false;
    scripts?: Script[];

    constructor(name: string, visible: boolean, position: Position, spriteSrc: string, item?: AItem, scripts?: Script[]) {
        this.name = name;
        this.item = item;
        this.visible = visible;
        this.position = position;
        this.spriteSrc = spriteSrc;
        this.scripts = scripts;
    }

    isBehindCounter(): boolean {
        return false;
    }

    isBlocking(): boolean {
        return !this.pickedUp && this.visible;
    }

    interact(playerPosition: Position, context: GameContext): (Script | undefined)[] {
        if (!this.pickedUp) {
            this.pickedUp = true;
            return this.scripts ? this.scripts : [];
        }
        return [];
    }

    // TODO draw method

    private images: Record<string, HTMLImageElement> = {};


    draw(ctx: CanvasRenderingContext2D, playerPosition: Position, scale: number, mapDim: {
        width: number,
        height: number
    }, center: { centerX: number, centerY: number, offsetX: number, offsetY: number } | undefined) {
        if (!this.pickedUp && this.visible) {
            let image = this.images[this.spriteSrc];
            if (image && image.complete) {
                this.drawImage(ctx, image, playerPosition, scale, mapDim, center);
            } else {
                image = new Image();
                image.src = this.spriteSrc;
                image.onload = () => {
                    this.images[this.spriteSrc] = image;
                    this.drawImage(ctx, image, playerPosition, scale, mapDim, center);
                }
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerPosition: Position,
        scale: number, mapDim: {
            width: number,
            height: number
        }, center: { centerX: number, centerY: number, offsetX: number, offsetY: number } | undefined) {

        let positionInPx = {
            x: this.position.x * 16 * scale,
            y: this.position.y * 16 * scale
        }

        // Calculate the position of the NPC relative to the player
        const relativeX = positionInPx.x - playerPosition.x;
        const relativeY = positionInPx.y - playerPosition.y;

        let { centerX, centerY, offsetX, offsetY } = center ? center : centerObject(ctx, scale, playerPosition, 16, mapDim);
        offsetY -= relativeY + 16;
        offsetX -= relativeX + 16;

        offsetX -= 16 * scale / 2 - image.width / 2;
        offsetY -= 16 * scale / 2 - image.height / 2;

        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);

        ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            image.width,
            image.height
        );

        ctx.restore();
    }
}