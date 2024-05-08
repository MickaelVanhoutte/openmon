import { Script } from "../scripting/scripts";
import { CharacterPosition, type Character, WALKING_SPEED, type Interactive } from "./characters-model";
import { Bag } from "../items/bag";
import type { PokemonInstance } from "../pokemons/pokedex";
import { Position } from "../mapping/positions";
import { centerObject, CHARACTER_SPRITES } from "../sprites/sprites";
import { ComboJauge } from "./player";
import type { MasteryType } from "./mastery-model";

export class NPC implements Character, Interactive {
    id: number;
    spriteId: number;
    name: string;
    gender: 'MALE' | 'FEMALE';
    monsterIds: number[];
    monsters: PokemonInstance[];
    comboJauge: ComboJauge = new ComboJauge();
    bag: Bag;
    moving: boolean = false;
    direction: 'up' | 'down' | 'left' | 'right' = 'down';

    mainScript?: Script;
    dialogScripts: Script[];
    movingScript?: Script;

    position: CharacterPosition;

    constructor(id: number, name: string, spriteId: number, position: Position,
        direction: 'up' | 'down' | 'left' | 'right',
        gender: 'MALE' | 'FEMALE', monstersIds?: number[], bag?: Bag,
        mainScript?: Script, dialogScripts?: Script[], movingScript?: Script) {
        this.id = id;
        this.name = name;
        this.spriteId = spriteId;
        this.position = new CharacterPosition(position, direction);
        this.gender = gender;
        this.monsterIds = monstersIds || [];
        this.monsters = [];
        this.bag = bag || new Bag();
        this.mainScript = mainScript ? new Script(mainScript?.triggerType, mainScript?.actions, mainScript?.stepPosition, mainScript?.replayable) : undefined;
        this.dialogScripts = dialogScripts?.map((script) => new Script(script.triggerType, script.actions, script.stepPosition, script.replayable)) || [];
        this.movingScript = movingScript ? new Script(movingScript?.triggerType, movingScript?.actions, movingScript?.stepPosition, movingScript?.replayable) : undefined;
    }

    getMasteryBonus(type: MasteryType): number {
        return 0;
    }

    interact(playerPosition: Position): (Script | undefined)[] {
        let previous = this.movingScript?.interrupt();
        let newScript: Script | undefined;

        // change direction toward player
        if (this.position.positionOnMap.x > playerPosition.x) {
            this.direction = 'left';
        } else if (this.position.positionOnMap.x < playerPosition.x) {
            this.direction = 'right';
        } else if (this.position.positionOnMap.y > playerPosition.y) {
            this.direction = 'up';
        } else if (this.position.positionOnMap.y < playerPosition.y) {
            this.direction = 'down';
        }

        if (this.mainScript && (!this.mainScript?.played || this.mainScript?.replayable)) {
            newScript = this.mainScript;
        } else if (this.dialogScripts) {
            const randomIndex = Math.floor(Math.random() * this.dialogScripts.length);
            newScript = this.dialogScripts[randomIndex];
        }
        return [newScript, previous];
    }

    private orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }
    private images: Record<string, HTMLImageElement> = {};
    private frames = { max: 4, val: 0, elapsed: 0 };

    draw(ctx: CanvasRenderingContext2D, playerPosition: Position, npc: NPC, scale: number, mapDim: {
        width: number,
        height: number
    }) {

        let image = this.images[npc.spriteId];
        if (image && image.complete) {
            this.drawImage(ctx, image, playerPosition, npc.direction, scale, mapDim);
        } else {
            image = new Image();
            image.src = CHARACTER_SPRITES.getSprite(npc.spriteId).overworld.walking.source;
            image.onload = () => {
                this.images[npc.spriteId] = image;
                this.drawImage(ctx, image, playerPosition, npc.direction, scale, mapDim);
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
            const speed = WALKING_SPEED;

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
        const relativeX = this.position.positionInPx.x - playerPosition.x;
        const relativeY = this.position.positionInPx.y - playerPosition.y;

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
