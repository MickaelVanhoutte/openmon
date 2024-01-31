import {PokemonInstance} from "../pokemons/pokemon";
import "@abraham/reflection";
import {injectable, singleton} from "tsyringe";

export class Position {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

@injectable()
export class PokemonSpriteDrawer {

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

    draw(ctx: CanvasRenderingContext2D, pokemon: PokemonInstance, type: "front" | "back", animate: boolean = true, frameOffset: number = 0, xOffset: number = 0, yOffset: number = 0) {
        if (pokemon.sprites) {

            this.updateScale(ctx.canvas.width, ctx.canvas.height);

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
                let futureImage = new Image();
                futureImage.src = imageSrc;
                futureImage.onload = () => {
                    this.currentImage = futureImage;
                }
            }

            this.goingDown = this.animateFrames <= 10;
            this.yOffset = this.goingDown ? this.yOffset + 1 : this.yOffset - 1;
            this.animateFrames++;
            if (this.animateFrames >= 20) {
                this.animateFrames = 0;
            }

            if (this.currentImage?.complete) {
                let position = this.getPosition(ctx, type, xOffset, yOffset);

                ctx.drawImage(this.currentImage,
                    0,
                    0,
                    this.dimensions.width,
                    this.dimensions.height,
                    position.x,
                    position.y + (animate ? this.yOffset : 0),
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

@singleton()
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

    public draw(ctx: CanvasRenderingContext2D, battlefield: 'default' | 'grass' | 'water' | 'rock' | 'rainy' = 'default') {

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


@singleton()
export class PlayerSpriteDrawer {

    private frames = {max: 3, val: 0, elapsed: 0};
    private images: Record<string, HTMLImageElement> = {};

    draw(ctx: CanvasRenderingContext2D, position: Position, movedOffset: Position, scale: number, bgWidth: number, bgHeight: number, sprite: string, moving: boolean) {

        let image = this.images[sprite];
        if (image && image.complete) {
            this.drawImage(ctx, image, position, movedOffset, scale, bgWidth, bgHeight, sprite, moving);
        } else {
            image = new Image();
            image.src = sprite;
            image.onload = () => {
                this.images[sprite] = image;
                this.drawImage(ctx, image, position, movedOffset, scale, bgWidth, bgHeight, sprite, moving);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, position: Position, movedOffset: Position, scale: number, bgWidth: number, bgHeight: number, sprite: string, moving: boolean) {

        let scaledBgWidth = bgWidth * scale;
        let scaledBgHeight = bgHeight * scale;
        // center
        let x = ctx.canvas.width / 2 - scaledBgWidth / 2;
        let y = ctx.canvas.height / 2 - scaledBgHeight / 2;

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
            x + (position.x),
            y + (position.y) - 10,
            (image.width / this.frames.max) * scale,
            image.height * scale
        );
    }
}



