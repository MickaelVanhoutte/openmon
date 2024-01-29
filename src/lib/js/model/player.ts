import {Frames, Position} from "./sprites";
import type {Monster} from "./monster";


export class Character {
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public sprites: PlayerSprites;
    public monsters: Monster[];
    public bag: any[] = [];
    public lvl: number = 1;
    public moving: boolean = false;
    public direction: 'up' | 'down' | 'left' | 'right' = 'down';
    public position: Position;
    public frames: Frames;
    public spriteScale: number = 1;

    constructor(name: string, gender: 'MALE' | 'FEMALE', sprites: PlayerSprites, monsters: Monster[] = []) {
        this.name = name;
        this.gender = gender;
        this.sprites = sprites;
        this.monsters = monsters;
        this.frames = {max: 3, val: 0, elapsed: 0};
        this.position = new Position(0, 0);
    }

    get sprite(): HTMLImageElement {
        return this.sprites[this.direction];
    }

    public draw(ctx: CanvasRenderingContext2D) {
        let image = this.sprite || this.sprites.down;
        ctx.drawImage(
            image,
            this.frames.val * (image.width / this.frames.max),
            0,
            image.width / this.frames.max,
            image.height,
            this.position.x,
            this.position.y,
            (image.width / this.frames.max) * 3,
            image.height * 3,
        );

        if (this.moving) {
            if (this.frames.max > 1) {
                this.frames.elapsed += 1;
            }
            if (this.frames.elapsed % 2 === 0) {
                this.frames.val += 1
                if (this.frames.val > this.frames.max - 1) {
                    this.frames.val = 0;
                }
            }
        }
    }
}

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

