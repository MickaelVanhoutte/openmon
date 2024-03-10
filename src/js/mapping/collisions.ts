import {Position} from "./positions";

export class Jonction {
    public id: number;
    public mapIdx: number;
    public positions: Position[];
    public start: Position;

    constructor(id: number, mapIdx: number, positions: Position[], start: Position) {
        this.id = id;
        this.mapIdx = mapIdx;
        this.positions = positions;
        this.start = start;
    }
}

export class Boundary implements Rectangular {
    public position: Position;
    public width: number;
    public height: number;

    constructor(position: Position, width: number = 16, height: number = 16) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    debug(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number, bgStartX: number, bgStartY: number, color: string = 'red') {

        ctx.fillStyle = color;
        ctx.fillRect(
            bgStartX + (this.position.x * 16 * scale),
            bgStartY + (this.position.y * 16 * scale),
            this.width * scale,
            this.height * scale
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
