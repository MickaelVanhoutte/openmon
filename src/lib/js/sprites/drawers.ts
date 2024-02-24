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

    prepareMap(map: OpenMap) {
        if (!this.images[map.background]) {
            let image = new Image();
            image.src = map.background;
            this.images[map.background] = image;
        }
    }

    draw(ctx: CanvasRenderingContext2D, map: OpenMap, scale: number, playerPosition: Position, debug: boolean = true): {
        width: number,
        height: number
    } {
        let image = this.images[map.background];
        if (image && image.complete) {
            return this.drawImage(ctx, image, map, scale, playerPosition, debug);
        } else {
            image = new Image();
            image.src = map.background;
            image.onload = () => {
                this.images[map.background] = image;
                return this.drawImage(ctx, image, map, scale, playerPosition, debug);
            }
        }
        return {width: 0, height: 0};
    }

    drawFG(ctx: CanvasRenderingContext2D, map: OpenMap, scale: number, playerPosition: Position, debug: boolean = true) {
        if (map.foreground !== undefined) {
            let image = this.images[map.foreground];
            if (image && image.complete) {
                this.drawImage(ctx, image, map, scale, playerPosition, debug);
            } else {
                image = new Image();
                image.src = map.foreground;
                image.onload = () => {
                    if (map.foreground) {
                        this.images[map.foreground] = image;
                        this.drawImage(ctx, image, map, scale, playerPosition, debug);
                    }
                }
            }
        }
    }


    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, map: OpenMap, scale: number, playerPosition: Position, debug: boolean = false): {
        width: number,
        height: number
    } {

        // canvas half - half character width scaled


        /*if(offsetX < ctx.canvas.width / 3){
            offsetX = ctx.canvas.width / 3;
        }
        if(offsetX > map.width * scale - ctx.canvas.width / 3){
            offsetX = map.width * scale - ctx.canvas.width / 3;
        }
        if(offsetY < ctx.canvas.height / 3){
            offsetY = ctx.canvas.height / 3;
        }
        if(offsetY > map.height * scale - ctx.canvas.height / 3){
            offsetY = map.height * scale - ctx.canvas.height / 3;
        }*/

        // translation must be bordered to avoid seeing ouutside the map
        //console.log(playerPosition.x, window.innerWidth / 2 - (16 * .66 / 2), image.width * scale)
        // console.log(playerPosition.x,  map.width * scale - window.innerWidth / 2)
//console.log({offsetX}, {centerX}, {offsetY}, {centerY}, image.width * scale, image.height * scale);

        let screenDimensions = {
            width: ctx.canvas.width,
            height: ctx.canvas.height,
        }

        let centerX = screenDimensions.width / 2;
        // canvas half - half character height scaled
        let centerY = screenDimensions.height / 2;

        let offsetX = playerPosition.x;
        let offsetY = playerPosition.y;

        let leftThreshold = playerPosition.x < Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2));
        let topThreshold = playerPosition.y < Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2));
        let rightThreshold = playerPosition.x > image.width * scale - Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2));
        let bottomThreshold = playerPosition.y > image.height * scale - Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2));

        console.log(leftThreshold, topThreshold, rightThreshold, bottomThreshold);

        if (leftThreshold) {
            offsetX = Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2));
        }
        if (topThreshold) {
            offsetY = Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2));
        }
        if (rightThreshold) {
            offsetX = image.width * scale - Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2));
        }
        if (bottomThreshold) {
            offsetY = image.height * scale - Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2));
        }



        //console.log('map:', offsetX, offsetY);

        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);


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
            ctx.font = "8px Arial";
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

        return {width: image.width * scale, height: image.height * scale};
    }

    drawArrow(ctx: CanvasRenderingContext2D, direction: 'down' | 'up' | 'right' | 'left', positionOnMap: Position, imageScale: number) {
        let image = this.images['arrow'];
        if (image && image.complete) {
            this.drawArrowImg(ctx, image, direction, positionOnMap, imageScale);
        } else {
            image = new Image();
            image.src = 'src/assets/maps/arrow.png'
            image.onload = () => {
                this.images['arrow'] = image;
                this.drawArrowImg(ctx, image, direction, positionOnMap, imageScale);
            }
        }
    }

    private drawArrowImg(ctx: CanvasRenderingContext2D, image: HTMLImageElement, direction: 'down' | 'up' | 'right' | 'left', positionOnMap: Position, imageScale: number) {
        // rotate image to match direction
        let angle = 0;
        let x = 0;
        let y = 0;
        switch (direction) {
            case 'down':
                angle = Math.PI;
                y -= 30;
                break;
            case 'up':
                angle = 0;
                y -= 40;
                break;
            case 'right':
                angle = Math.PI / 2;
                x += 40;
                break;
            case 'left':
                angle = -Math.PI / 2;
                x -= 40;
                break;
        }

        ctx.save();

        // move to the center of the canvas
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

        // rotate the canvas to the specified degrees
        ctx.rotate(angle);

        // draw the image
        // since the context is rotated, the image will be rotated also
        ctx.drawImage(image, -image.width / 2 + x, -image.width / 2 + y);

        // we’re done with the rotating so restore the unrotated context
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
                scale: number, moving: boolean, playerPosition: Position, mapDim: { width: number, height: number }) {
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


        let centerX = canvas.canvas.width / 2 - (16) * scale / 2;
        // canvas half - half character height scaled
        let centerY = canvas.canvas.height / 2 - (20) * scale / 2;

        let offsetX = 0;
        let offsetY = 0;

        let leftThreshold = playerPosition.x < Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2));
        let topThreshold = playerPosition.y < Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2));
        let rightThreshold = playerPosition.x > mapDim.width - Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2));
        let bottomThreshold = playerPosition.y > mapDim.height - Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2));

        if (leftThreshold) {
            offsetX =  Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2)) - playerPosition.x;
        }
        if (topThreshold) {
            offsetY = Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2)) - playerPosition.y;
        }

        if (rightThreshold) {
            offsetX = mapDim.width - Math.min(centerX, window.innerWidth / 2 - (16 * .66 / 2)) - playerPosition.x;
        }
        if (bottomThreshold) {
            offsetY = mapDim.height - Math.min(centerY, window.innerHeight / 2 - (16 * .66 / 2)) - playerPosition.y;
        }


        canvas.save();
        canvas.translate(centerX - offsetX, centerY - offsetY);

        canvas.drawImage(
            img,
            this.frames.val * (sprite.width),
            sY,
            sprite.width,
            sprite.height,
            0,
            0,
            sprite.width * scale,
            sprite.height * scale
        );
        canvas.restore();
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
                scale: number, moving: boolean, playerPosition: Position, mapDim: { width: number, height: number }) {
        this.spritesByCharacter[spriteId].draw(canvas, type, orientation, scale, moving, playerPosition, mapDim);
    }
}

