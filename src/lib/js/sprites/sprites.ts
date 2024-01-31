import {PokemonInstance} from "../pokemons/pokemon";

export class Position {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class Frames {
    val: number;
    elapsed: number;
    max: number;

    constructor(max: number, val: number = 0, elapsed = 1) {
        this.val = val;
        this.elapsed = elapsed;
        this.max = max;
    }
}


export class SpriteDrawer {

    private currentImage?: HTMLImageElement;

    public frameElapsed: number = 0;

    public spriteSize = 80;

    public spriteScale = 1.5;

    constructor() {
    }

    draw(ctx: CanvasRenderingContext2D, pokemon: PokemonInstance, type: "front" | "back", frameOffset: number = 0, xOffset: number = 0, yOffset: number = 0) {
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
                let futureImage = new Image();
                futureImage.src = imageSrc;
                futureImage.onload = () => {
                    this.currentImage = futureImage;
                }
            }

            if (this.currentImage?.complete) {
                let position = this.getPosition(ctx, type, xOffset, yOffset);

                ctx.drawImage(this.currentImage,
                    0,
                    0,
                    this.spriteSize,
                    this.spriteSize,
                    position.x,
                    position.y,
                    this.spriteSize * this.spriteScale * 2.5,
                    this.spriteSize * this.spriteScale * 2.5);

                this.frameElapsed++;
            }

        }
    }

    private getPosition(ctx: CanvasRenderingContext2D, type: "front" | "back", xOffset: number = 0, yOffset: number = 0) {
        let position = new Position();
        if (ctx.canvas.width < 1100) {
            if (type === 'front') {
                position = new Position(
                    (ctx.canvas.width / 4) * 3 - (this.spriteSize * 2 * this?.spriteScale / 2) + xOffset,
                    (ctx.canvas.height / 3.5 * 2) - ((this.spriteSize * 2 * this?.spriteScale)) - (16 * 2) + yOffset
                );
            } else {
                position = new Position(
                    (ctx.canvas.width / 4) - ((this.spriteSize * 2 * this.spriteScale) / 2) + xOffset,
                    (ctx.canvas.height * 0.75) - (this.spriteSize * 2 * this.spriteScale) + (16 * 2) + yOffset
                );
            }

        } else {
            if (type === 'front') {
                position = new Position(
                    (ctx.canvas.width / 4) * 3 - (this.spriteSize * 2.5 * this?.spriteScale / 2) + xOffset,
                    (ctx.canvas.height / 2) - ((this.spriteSize * 2.5 * this?.spriteScale)) - (12 * 2.5) + yOffset
                );
            } else {
                position = new Position(
                    (ctx.canvas.width / 4) - ((this.spriteSize * 2.5 * this.spriteScale) / 2) + xOffset,
                    (ctx.canvas.height * 0.75) - (this.spriteSize * 2.5 * this.spriteScale) + (15 * 2.5) + yOffset
                );
            }
        }
        return position;
    }
}


// TODO REWORK

class BattleSprite {
    private position: Position;
    private image: HTMLImageElement;
    private width: number = 0;
    private height: number = 0;

    constructor(position: Position, image: HTMLImageElement) {
        this.position = position;
        this.image = image;
        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;
        }
    }

    draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.drawImage(this.image,
            0,
            0,
            this.image.width,
            this.image.height,
            0,
            0,
            canvas.width,
            canvas.height * 0.75);
    }
}

// TODO : SHOULD BE GIVEN BY THE MAP DEPENDING USER POSITION

const battleImg = new Image();
battleImg.src = 'src/assets/battle/battle-grass.png';

export const battleBackground = new BattleSprite(
    new Position(0, 0),
    battleImg,
);



export class PlayerSprites {
    public down: HTMLImageElement;
    public up: HTMLImageElement;
    public left: HTMLImageElement;
    public right: HTMLImageElement;
    public battle: HTMLImageElement;

    public width: number = 80;
    public height: number = 80;

    constructor(front: HTMLImageElement, back: HTMLImageElement, left: HTMLImageElement, right: HTMLImageElement, battle: HTMLImageElement) {
        this.down = front;
        this.up = back;
        this.left = left;
        this.right = right;
        this.battle = battle;
    }
}
