import {PokemonInstance} from "../pokemons/pokedex";
import type {OpenMap} from "../mapping/maps";


export class Position {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class PokemonSpriteDrawer {

    private images: Record<string, HTMLImageElement> = {}
    private currentImage?: HTMLImageElement;
    private frameElapsed: number = 0;
    private dimensions = {
        width: 80,
        height: 80,
    }
    private spriteScale = 4;
    private animateFrames: number = 0;
    private goingDown: boolean = true;
    private yOffset = 0;

    constructor() {
    }

    draw(ctx: CanvasRenderingContext2D, pokemon: PokemonInstance, type: "front" | "back", animate: boolean = true, frameOffset: number = 0, xOffset: number = 0, yOffset: number = 0) {
        if (pokemon.sprites) {

            let spriteGroup = pokemon.gender !== 'unknown' ? pokemon.sprites[pokemon.gender][type] : pokemon.sprites['male'][type];
            let entry = 'frame'
            if (pokemon.isShiny) {
                entry = 'shiny';
            }

            if (this.frameElapsed + frameOffset < 100) {
                entry += '1';
            } else {
                entry += '2';
            }

            if (this.frameElapsed + frameOffset >= 200) {
                this.frameElapsed = 0;
            }

            // @ts-ignore
            let imageSrc = spriteGroup[entry] as string;

            if (!imageSrc) return;

            if (!this.currentImage || this.currentImage.src !== imageSrc) {
                if (!this.images[imageSrc]) {
                    let futureImage = new Image();
                    futureImage.src = imageSrc;
                    futureImage.onload = () => {
                        this.currentImage = futureImage;
                    }
                    this.images[imageSrc] = futureImage;
                } else {
                    this.currentImage = this.images[imageSrc];
                }
            }

            if (animate && !pokemon.fainted) {
                this.goingDown = this.animateFrames <= 10;
                this.yOffset = this.goingDown ? this.yOffset + 1 : this.yOffset - 1;
                this.animateFrames++;
                if (this.animateFrames >= 20) {
                    this.animateFrames = 0;
                }
            }
            if (pokemon.fainted) {
                this.yOffset += 25;
                this.animateFrames++;
                if (this.animateFrames >= 50) {
                    this.animateFrames = 0;
                }
            }


            if (this.currentImage?.complete) {
                let position = this.getPosition(ctx, type, xOffset, yOffset);

                ctx.drawImage(this.currentImage,
                    0,
                    0,
                    this.dimensions.width,
                    this.dimensions.height,
                    position.x,
                    position.y + (animate || pokemon.fainted ? this.yOffset : 0),
                    this.dimensions.width * this.spriteScale,
                    this.dimensions.height * this.spriteScale);

                this.frameElapsed++;
            }

        }
    }

    private getPosition(ctx: CanvasRenderingContext2D, type: "front" | "back", xOffset: number = 0, yOffset: number = 0) {
        let position = new Position();
        if (type === 'front') {
            position = new Position(
                // x = 3/4 of the screen - half of the sprite size
                (ctx.canvas.width / 4) * 3 - (this.dimensions.width * this?.spriteScale / 2) + xOffset,
                // y = 1/2 of the screen - the sprite size (*1.2)
                (ctx.canvas.height / 2) - ((this.dimensions.height * this?.spriteScale) * 1.2) + yOffset
            );
        } else {
            position = new Position(
                // x = 1/4 of the screen - half of the sprite size
                (ctx.canvas.width / 4) - ((this.dimensions.width * this.spriteScale) / 2) + xOffset,
                // y = 3/4 of the screen - 1/4 of the sprite size
                (ctx.canvas.height / 4) * 3 - (this.dimensions.height * this.spriteScale * 0.75) + yOffset
            );
        }

        return position;
    }

    private updateScale(width: number, height: number) {
        if (width < 1100) {
            this.spriteScale = 2;
        } else {
            this.spriteScale = 4;
        }
    }
}

export class WoldSpriteDrawer {
    private images: Record<string, HTMLImageElement> = {};

    constructor() {
    }


    draw(ctx: CanvasRenderingContext2D, map: OpenMap, movedOffset: Position, scale: number, debug: boolean = true) {
        let image = this.images[map.background];
        if (image && image.complete) {
            this.drawImage(ctx, image, map, movedOffset, scale, debug);
        } else {
            image = new Image();
            image.src = map.background;
            image.onload = () => {
                this.images[map.background] = image;
                this.drawImage(ctx, image, map, movedOffset, scale, debug);
            }
        }
    }


    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, map: OpenMap, movedOffset: Position, scale: number, debug: boolean = false) {

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
            movedOffset.x * (16 * scale),
            movedOffset.y * (16 * scale)
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

export class BattlefieldsDrawer {

    private images: Record<string, HTMLImageElement> = {};

    private battlefields = {
        'default': 'src/assets/battle/battle-default.png',
        'grass': 'src/assets/battle/battle-grass.png',
        'water': 'src/assets/battle/battle-water.png',
        'rock': 'src/assets/battle/battle-rock.png',
        'rainy': 'src/assets/battle/battle-rainy.png',
    }

    private dimensions = {
        width: 240,
        height: 112,
    }

    constructor() {
    }

    public draw(ctx: CanvasRenderingContext2D, animationStart: boolean, battlefield: 'default' | 'grass' | 'water' | 'rock' | 'rainy' = 'default') {

        let image = this.images[battlefield];
        if (image && image.complete) {
            this.drawImage(ctx, image);
        } else {
            image = new Image();
            image.src = this.battlefields[battlefield];
            image.onload = () => {
                this.images[battlefield] = image;
                ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
        ctx.drawImage(image,
            0,
            0,
            this.dimensions.width,
            this.dimensions.height,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height * 0.75)
    }
}


export class PlayerSpriteDrawer {

    private frames = {max: 3, val: 0, elapsed: 0};
    private images: Record<string, HTMLImageElement> = {};
    private lastImage: string = '';

    constructor() {
    }


    draw(ctx: CanvasRenderingContext2D, scale: number, sprite: string, moving: boolean) {

        let image = this.images[sprite];
        if (image && image.complete) {
            this.lastImage = sprite;
            this.drawImage(ctx, image, scale, moving);
        } else {
            if (this.images[this.lastImage]) {
                // fallback to latest
                this.drawImage(ctx, this.images[this.lastImage], scale, moving);
            }
            image = new Image();
            image.src = sprite;
            image.onload = () => {
                this.images[sprite] = image;
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, scale: number, moving: boolean) {

        if (moving) {

            if (this.frames.max > 1) {
                this.frames.elapsed += 1;
            }
            if (this.frames.elapsed % 2 === 0) {
                this.frames.val += 1
                if (this.frames.val > this.frames.max - 1) {
                    this.frames.val = 0;
                }
            }
        } else {
            this.frames.val = 1;
        }

        ctx.drawImage(
            image,
            this.frames.val * (image.width / this.frames.max),
            0,
            image.width / this.frames.max,
            image.height,
            ctx.canvas.width / 2 - (image.width / this.frames.max) * scale / 2,
            ctx.canvas.height / 2 - (image.height) * scale / 2 - image.height / 2,
            (image.width / this.frames.max) * scale,
            image.height * scale
        );
    }

}



