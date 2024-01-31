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
