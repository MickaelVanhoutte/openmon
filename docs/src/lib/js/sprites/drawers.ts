import type {OpenMap} from "../mapping/maps";


export class Position {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class WoldSpriteDrawer {
    private images: Record<string, HTMLImageElement> = {};

    constructor() {
    }


    draw(ctx: CanvasRenderingContext2D, map: OpenMap, scale: number, debug: boolean = true) {
        let image = this.images[map.background];
        if (image && image.complete) {
            this.drawImage(ctx, image, map, scale, debug);
        } else {
            image = new Image();
            image.src = map.background;
            image.onload = () => {
                this.images[map.background] = image;
                this.drawImage(ctx, image, map, scale, debug);
            }
        }
    }


    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, map: OpenMap, scale: number, debug: boolean = false) {

        // initial on map = 11, 11
        let initialPosition = new Position(
            (16 * scale) * map.playerInitialPosition.x,
            (16 * scale) * map.playerInitialPosition.y
        )

        // canvas half - half character width scaled
        let centerX = ctx.canvas.width / 2 - (16) * scale / 2;
        // canvas half - half character height scaled
        let centerY = ctx.canvas.height / 2 - (20) * scale / 2;

        // movedOffset
        let offsetInPx = new Position(
            map.playerMovedOffset.x * (16 * scale),
            map.playerMovedOffset.y * (16 * scale)
        )


        ctx.translate(centerX - offsetInPx.x - initialPosition.x, centerY - offsetInPx.y - initialPosition.y);


        ctx.drawImage(image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            image.width * scale,
            image.height * scale,
        );

        if (debug) {
            for (let i = 0; i < map.width; i++) {
                for (let j = 0; j < map.height; j++) {
                    if (map.hasBoundaryAt(new Position(i, j))) {
                        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                        ctx.fillRect(
                            i * 16 * scale,
                            j * 16 * scale,
                            16 * scale,
                            16 * scale);
                    } else if (map.hasBattleZoneAt(new Position(i, j))) {
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                        ctx.fillRect(
                            i * 16 * scale,
                            j * 16 * scale,
                            16 * scale,
                            16 * scale);
                    }
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.strokeRect(
                        i * 16 * scale,
                        j * 16 * scale,
                        16 * scale,
                        16 * scale);
                    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ctx.fillText(`[${i}, ${j}]`, i * 16 * scale + 4, j * 16 * scale + 12)
                }
            }

        }


        ctx.restore();
    }
}

export class PlayerSprite {

    public id: number;
    public name: string;
    public front: SpriteFromSheet;
    public overworld: SpriteFromSheet;

    private frontImg: HTMLImageElement;
    private worldImg: HTMLImageElement;

    private frames = {max: 3, val: 0, elapsed: 0};

    constructor(id: number, name: string, front: SpriteFromSheet, overworld: SpriteFromSheet) {
        this.id = id;
        this.name = name;
        this.front = front;
        this.overworld = overworld;

        this.frontImg = new Image();
        this.frontImg.src = front.source;
        this.worldImg = new Image();
        this.worldImg.src = overworld.source;
    }

    public draw(canvas: CanvasRenderingContext2D, type: 'front' | 'overworld',
                orientation: 'up' | 'down' | 'left' | 'right',
                scale: number, moving: boolean) {
        let sprite = this[type];
        let img = type === 'front' ? this.frontImg : this.worldImg;
        if (img.complete)

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
        let sY = OrientationIndexes[orientation] * sprite.height;


        canvas.drawImage(
            img,
            this.frames.val * (sprite.width),
            sY,
            sprite.width,
            sprite.height,
            canvas.canvas.width / 2 - (sprite.width) * scale / 2,
            canvas.canvas.height / 2 - (sprite.height) * scale / 2 - sprite.height * scale / 4,
            sprite.width * scale,
            sprite.height * scale
        );

    }
}

export const OrientationIndexes = {
    "down": 0,
    "left": 1,
    "right": 2,
    "up": 3,
}

export class SpriteFromSheet {
    source: string;
    startX: number;
    startY: number;
    height: number;
    width: number;
    frameNumber: number = 3;

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

    constructor(json: any[]) {
        json.forEach(value => {
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
                new SpriteFromSheet(
                    value.overworld.source,
                    value.overworld.startX,
                    value.overworld.startY,
                    value.overworld.height,
                    value.overworld.width,
                    value.overworld.frameNumber
                )
            )
        });
    }

    getSprite(id: number): PlayerSprite {
        return this.spritesByCharacter[id];
    }

    public draw(spriteId: number, canvas: CanvasRenderingContext2D, type: 'front' | 'overworld',
                orientation: 'up' | 'down' | 'left' | 'right',
                scale: number, moving: boolean){
        this.spritesByCharacter[spriteId].draw(canvas, type, orientation, scale, moving);
    }
}

