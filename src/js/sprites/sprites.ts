import charactersJson from "../../assets/characts/final/characters.json";
import { Position } from "../mapping/positions";

export class SpriteFromSheet {
    source: string;
    height: number;
    width: number;
    frameNumber: number = 4;

    constructor(source: string, height: number, width: number, frameNumber: number = 4) {
        this.source = source;
        this.height = height;
        this.width = width;
        this.frameNumber = frameNumber;
    }
}

export class SpritesHolder {

    private spritesByCharacter: Record<number, PlayerSprite> = {};
    public ready = false;

    constructor() {
        charactersJson.forEach(value => {
            this.spritesByCharacter[value.id] = new PlayerSprite(
                value.id,
                value.name,
                new SpriteFromSheet(
                    value.full.source,
                    value.full.height,
                    value.full.width,
                    value.full.frameNumber
                ),
                new SpriteFromSheet(
                    value.face.source,
                    value.face.height,
                    value.face.width,
                    value.face.frameNumber
                ),
                {
                    walking: new SpriteFromSheet(
                        value.overworld.walking.source,
                        value.overworld.walking.height,
                        value.overworld.walking.width,
                        value.overworld.walking.frameNumber
                    ),
                    running: value.overworld.running ? new SpriteFromSheet(
                        value.overworld.running.source,
                        value.overworld.running.height,
                        value.overworld.running.width,
                        value.overworld.running.frameNumber
                    ) : undefined,
                    biking: value.overworld.biking ? new SpriteFromSheet(
                        value.overworld.biking.source,
                        value.overworld.biking.height,
                        value.overworld.biking.width,
                        value.overworld.biking.frameNumber
                    ) : undefined,
                    surfing: value.overworld.surfing ? new SpriteFromSheet(
                        value.overworld.surfing.source,
                        value.overworld.surfing.height,
                        value.overworld.surfing.width,
                        value.overworld.surfing.frameNumber
                    ) : undefined
                },
                value.throwing ? new SpriteFromSheet(
                    value.throwing.source,
                    value.throwing.height,
                    value.throwing.width,
                    value.throwing.frameNumber
                ) : undefined,
            )
        });
        this.ready = true;
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
    let minLeftSide = Math.min(centerX / 2, window.innerWidth / 4 - (objectWidth * scale / 2));
    let minTopSide = Math.min(centerY / 2, window.innerHeight / 4 - (objectWidth * scale / 2));
    let minRightSide = mapDim.width - Math.min(centerX / 2, window.innerWidth / 4 - (objectWidth * scale / 2));
    let minBottomSide = mapDim.height - Math.min(centerY / 2, window.innerHeight / 4 - (objectWidth * scale / 2));

    let leftThreshold = objectPosition.x < minLeftSide;
    let topThreshold = objectPosition.y < minTopSide;
    let rightThreshold = objectPosition.x > minRightSide;
    let bottomThreshold = objectPosition.y > minBottomSide;

    if (leftThreshold) {
        offsetX = minLeftSide - objectPosition.x;
    }
    if (topThreshold) {
        offsetY = minTopSide - objectPosition.y;
    }
    if (rightThreshold) {
        offsetX = minRightSide - objectPosition.x;
    }
    if (bottomThreshold) {
        offsetY = minBottomSide - objectPosition.y;
    }
    return { centerX, centerY, offsetX, offsetY };
}

export class PlayerSprite {

    public id: number;
    public name: string;
    public full: SpriteFromSheet;
    public face: SpriteFromSheet;
    public throwing?: SpriteFromSheet;
    public overworld: {
        walking: SpriteFromSheet,
        running?: SpriteFromSheet
        biking?: SpriteFromSheet,
        surfing?: SpriteFromSheet
    };

    public fullImg: HTMLImageElement;
    public faceImg: HTMLImageElement;
    public throwingImg?: HTMLImageElement;
    public worldWalkingImg: HTMLImageElement;
    public worldRunningImg?: HTMLImageElement;

    public frames = { max: 4, val: 0, elapsed: 0 };

    public orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }

    constructor(id: number, name: string, full: SpriteFromSheet, face: SpriteFromSheet, overworld: {
        walking: SpriteFromSheet,
        running?: SpriteFromSheet,
        biking?: SpriteFromSheet,
        surfing?: SpriteFromSheet
    }, throwing?: SpriteFromSheet) {
        this.id = id;
        this.name = name;
        this.full = full;
        this.face = face;
        this.overworld = overworld;

        this.fullImg = new Image();
        this.fullImg.src = full.source;

        this.faceImg = new Image();
        this.faceImg.src = face.source;

        if(throwing){
            this.throwing = throwing;
            this.throwingImg = new Image();
            this.throwingImg.src = throwing.source;
        }

        this.worldWalkingImg = new Image();
        this.worldWalkingImg.src = overworld.walking.source;

        if (this.overworld.running?.source) {
            this.worldRunningImg = new Image();
            // @ts-ignore
            this.worldRunningImg.src = overworld.running.source;
        }
    }
}

export const CHARACTER_SPRITES = new SpritesHolder();