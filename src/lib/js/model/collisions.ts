import {Position} from "./sprites";

export class Boundary implements Rectangular {
    public position: Position;
    public width: number;
    public height: number;
    constructor(position: Position, width: number = 16*3, height: number = 16*3){
        this.position = position;
        this.width = width;
        this.height = height;
    }

    debug(ctx: CanvasRenderingContext2D, movedOffset: Position, color: string = 'red') {
        ctx.fillStyle = color;
        ctx.fillRect(
            (this.position.x + movedOffset.x) *this.width,
            (this.position.y + movedOffset.y) *this.height,
            this.width,
            this.height
        );
    }
}

export interface Rectangular {
    position: Position;
    width: number;
    height: number;
}

export function rectangularCollision(rect1: Rectangular, rect2: Rectangular) {
    return rect1.position.x + rect1.width >= rect2.position.x &&
        rect1.position.x <= rect2.position.x + rect2.width &&
        rect1.position.y + rect1.height >= rect2.position.y &&
        rect1.position.y <= rect2.position.y + rect2.height;
}
