import charactersJson from "../../assets/characts/characts.json";
import {Position} from "../mapping/positions";

export class SpriteFromSheet {
    source: string;
    startX: number;
    startY: number;
    height: number;
    width: number;
    frameNumber: number = 4;

    constructor(source: string, startX: number, startY: number, height: number, width: number, frameNumber: number = 4) {
        this.source = source;
        this.startX = startX;
        this.startY = startY;
        this.height = height;
        this.width = width;
        this.frameNumber = frameNumber;
    }
}

export class SpritesHolder {

    private spritesByCharacter: Record<number, PlayerSprite> = {};

    constructor() {
        charactersJson.forEach(value => {
            this.spritesByCharacter[value.id] = new PlayerSprite(
                value.id,
                value.name,
                new SpriteFromSheet(
                    value.front.source,
                    value.front.startX,
                    value.front.startY,
                    value.front.height,
                    value.front.width,
                    value.front.frameNumber
                ),
                {
                    walking: new SpriteFromSheet(
                        value.overworld.walking.source,
                        value.overworld.walking.startX,
                        value.overworld.walking.startY,
                        value.overworld.walking.height,
                        value.overworld.walking.width,
                        value.overworld.walking.frameNumber
                    ),
                    running: value.overworld.running? new SpriteFromSheet(
                        value.overworld.running.source,
                        value.overworld.running.startX,
                        value.overworld.running.startY,
                        value.overworld.running.height,
                        value.overworld.running.width,
                        value.overworld.running.frameNumber
                    ) : undefined
                } 
            )
        });
    }

    getSprite(id: number): PlayerSprite {
        return this.spritesByCharacter[id];
    }
}

export function centerObject(canvas: CanvasRenderingContext2D, scale: number, objectPosition: Position, objectWidth: number, mapDim: {
    width: number;
    height: number
}) {
    let centerX = canvas.canvas.width / 2 - objectWidth * scale / 2;
    // canvas half - half character height scaled
    let centerY = canvas.canvas.height / 2 - objectWidth * scale / 2;

    let offsetX = 0;
    let offsetY = 0;

    // translate near the edges
    let leftThreshold = objectPosition.x < Math.min(centerX, window.innerWidth / 2 - (objectWidth * scale / 2));
    let topThreshold = objectPosition.y < Math.min(centerY, window.innerHeight / 2 - (objectWidth * scale / 2));
    let rightThreshold = objectPosition.x > mapDim.width - Math.min(centerX, window.innerWidth / 2 - (objectWidth * scale / 2));
    let bottomThreshold = objectPosition.y > mapDim.height - Math.min(centerY, window.innerHeight / 2 - (objectWidth * scale / 2));

    if (leftThreshold) {
        offsetX = Math.min(centerX, window.innerWidth / 2 - (objectWidth * scale / 2)) - objectPosition.x;
    }
    if (topThreshold) {
        offsetY = Math.min(centerY, window.innerHeight / 2 - (objectWidth * scale / 2)) - objectPosition.y;
    }
    if (rightThreshold) {
        offsetX = mapDim.width - Math.min(centerX, window.innerWidth / 2 - (objectWidth * scale / 2)) - objectPosition.x;
    }
    if (bottomThreshold) {
        offsetY = mapDim.height - Math.min(centerY, window.innerHeight / 2 - (objectWidth * scale / 2)) - objectPosition.y;
    }
    return {centerX, centerY, offsetX, offsetY};
}

export class PlayerSprite {

    public id: number;
    public name: string;
    public front: SpriteFromSheet;
    public overworld: {
        walking: SpriteFromSheet,
        running?: SpriteFromSheet
    };

    public frontImg: HTMLImageElement;
    public worldWalkingImg: HTMLImageElement;
    public worldRunningImg?: HTMLImageElement;

    public frames = {max: 4, val: 0, elapsed: 0};

    public orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }

    constructor(id: number, name: string, front: SpriteFromSheet, overworld: {
        walking: SpriteFromSheet,
        running?: SpriteFromSheet
    }) {
        this.id = id;
        this.name = name;
        this.front = front;
        this.overworld = overworld;

        this.frontImg = new Image();
        this.frontImg.src = front.source;
        this.worldWalkingImg = new Image();
        this.worldWalkingImg.src = overworld.walking.source;

        if(this.overworld.running?.source){
            this.worldRunningImg = new Image();
            // @ts-ignore
            this.worldRunningImg.src = overworld.running.source;
        }
    }
}

export const CHARACTER_SPRITES = new SpritesHolder();