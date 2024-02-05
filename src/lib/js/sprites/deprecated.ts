/*
//Deprecated to remove
export class PokemonSpriteDrawer {

    private images: Record<string, HTMLImageElement> = {};
    private currentImage?: HTMLImageElement;
    private frameElapsed: number = 0;
    private dimensions = {
        width: 96,
        height: 96,
    }
    private spriteScale = 4;
    private animateFrames: number = 0;
    private goingDown: boolean = true;
    private yOffset = 0;
    private offsetPx = 1;

    constructor() {
    }

    draw(ctx: CanvasRenderingContext2D, pokemon: PokemonInstance, type: "front" | "back", animate: boolean = true, frameOffset: number = 0, reverse: boolean = false, xOffset: number = 0, yOffset: number = 0) {
        if (pokemon.sprites) {

            // @ts-ignore
            let spriteGroup = pokemon.gender !== 'unknown' && pokemon.sprites[pokemon.gender] !== undefined ? pokemon.sprites[pokemon.gender][type] : pokemon.sprites['male'][type];
            let entry = 'frame'
            if (pokemon.isShiny) {
                entry = 'shiny';
            }

            let frame = '1';
            // @ts-ignore
            if (this.frameElapsed + frameOffset > 100 && pokemon.sprites[pokemon.gender] && pokemon.sprites[pokemon.gender][type][entry + '2'] !== undefined) {
                frame = '2';
            }
            entry += frame;

            if (this.frameElapsed + frameOffset >= 200) {
                this.frameElapsed = 0;
            }

            // @ts-ignore
            let imageSrc = spriteGroup[entry] as string || 'src/assets/monsters/bw/0.png';

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
                this.yOffset += this.offsetPx;

                if (this.yOffset < 0 || this.yOffset > 10) {
                    this.offsetPx = this.offsetPx * -1;
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
                    position.y + this.yOffset,
                    this.dimensions.width * (type === 'back' ? this.spriteScale * 1.5 : this.spriteScale),
                    this.dimensions.height * (type === 'back' ? this.spriteScale * 1.5 : this.spriteScale));

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
                //(ctx.canvas.height / 2) - ((this.dimensions.height * this?.spriteScale) * 1.2) + yOffset
                // bottom of the image should start at 1/2 of the screen
                (ctx.canvas.height / 2) - (this.dimensions.height * this.spriteScale) + yOffset
            );
        } else {
            position = new Position(
                // x = 1/4 of the screen - half of the sprite size
                (ctx.canvas.width * .20) - (this.dimensions.width * this.spriteScale) / 2 + xOffset,
                // y = 3/4 of the screen - 1/4 of the sprite size
                //(ctx.canvas.height / 8) * 5 - (this.dimensions.height * this.spriteScale * 1.5) + yOffset

                // bottom of the image should start at 3/4 of the screen
                (ctx.canvas.height * 0.75) - (this.dimensions.height * .75 * this.spriteScale * 1.5) + yOffset
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

// Deprecated to remove
export class BattlefieldsDrawer {

    private images: Record<string, HTMLImageElement> = {};

    private player?: Character;

    private playerBattleImage?: HTMLImageElement;

    private frames = {max: 5, val: 0, elapsed: 0};

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

    constructor(player: Character | undefined) {
        this.player = player;
    }

    public draw(ctx: CanvasRenderingContext2D, animationStart: boolean, battlefield: 'default' | 'grass' | 'water' | 'rock' | 'rainy' = 'default') {

        let image = this.images[battlefield];
        if (image && image.complete) {
            this.drawImage(ctx, image, animationStart);
        } else {
            image = new Image();
            image.src = this.battlefields[battlefield];
            image.onload = () => {
                this.images[battlefield] = image;
                this.drawImage(ctx, image, animationStart);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, animationStart: boolean) {
        ctx.drawImage(image,
            0,
            0,
            this.dimensions.width,
            this.dimensions.height,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height * 0.75)

        // TODO
        /!* if (animationStart && this.player) {

             if (this.playerBattleImage && this.playerBattleImage.complete && this.frames.val < this.frames.max) {
                 this.frames.elapsed += 1;

                 if (this.frames.elapsed % 4 === 0) {
                     this.frames.val += 1
                 }
                 this.drawPlayerAnimation(ctx, this.playerBattleImage, this.frames.val);
             } else {
                 let image = new Image();
                 image.src = this.player.sprites.battle;
                 image.onload = () => {
                     this.playerBattleImage = image;
                 }
             }

         }*!/
    }

    private drawPlayerAnimation(ctx: CanvasRenderingContext2D, playerBattleImage: HTMLImageElement, val: number) {
        ctx.drawImage(
            playerBattleImage,
            this.frames.val * (playerBattleImage.width / this.frames.max),
            0,
            playerBattleImage.width / this.frames.max - 1,
            playerBattleImage.height,
            ctx.canvas.width / 100 * 5,
            ctx.canvas.height / 4 * 3 - playerBattleImage.height * 5,
            (playerBattleImage.width / this.frames.max) * 5,
            playerBattleImage.height * 5
        );
    }
}*/
