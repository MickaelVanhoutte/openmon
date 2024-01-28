export class Sprite {
    public position: Position;
    public image: HTMLImageElement;
    public frames: { val: number; elapsed: number; max: number };
    public sprites?: {
        front: HTMLImageElement,
        back: HTMLImageElement,
        right: HTMLImageElement,
        left: HTMLImageElement
    };
    public width: number = 0;
    public height: number = 0;
    public moving: boolean;

    constructor(position: Position, image: HTMLImageElement, frames: Frames = {max: 1, val: 0, elapsed: 0}, sprites?: {
        front: HTMLImageElement,
        back: HTMLImageElement,
        right: HTMLImageElement,
        left: HTMLImageElement
    }) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0};
        this.sprites = sprites;
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.moving = false;
    }

    draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.drawImage(this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height,
        )

        if (this.moving) {
            if (this.frames.max > 1) {
                this.frames.elapsed += 1;
            }
            if (this.frames.elapsed % 10 === 0) {
                this.frames.val += 1
                if (this.frames.val > this.frames.max - 1) {
                    this.frames.val = 0;
                }
            }
        }
    }
}

export class MonsterSprite extends Sprite {
    constructor(image: HTMLImageElement, canvas: HTMLCanvasElement) {
        super(
            new Position(
                canvas.width - (canvas.width * 0.26),
                (canvas.height * 0.08)
            ), image
        );
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.image,
            this.frames.val * this.width,
            0,
            this.image.width,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width * 4,
            this.image.height * 4,
        )
    }
}

export class BackMonsterSprite extends Sprite {
    constructor(image: HTMLImageElement, position: Position) {
        super(position, image);
    }

    draw(ctx: CanvasRenderingContext2D) {
        // draw in the bottom left
        ctx.drawImage(this.image,
            0,
            0,
            this.image.width,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width * 5,
            this.image.height * 5,
        )
    }
}


export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Frames {
    val: number;
    elapsed: number;
    max: number;

    constructor(max: number, val: number = 0, elapsed = 0) {
        this.val = val;
        this.elapsed = elapsed;
        this.max = max;
    }
}
