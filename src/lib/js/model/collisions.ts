import {Position} from "./sprites";
import {tile_size} from "./maps";

export class Boundary implements Rectangular {
    public position: Position;
    public width: number;
    public height: number;
    constructor(position: Position){
        this.position = position;
        this.width = tile_size;
        this.height = tile_size;
    }

    debug(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
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
