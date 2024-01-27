import {Position, Sprite} from "./sprites";


class BattleSprite extends Sprite {
    constructor(position: Position, image: HTMLImageElement) {
        super(position, image);
    }

    draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, canvas.width, canvas.height);
    }
}

const battleImg = new Image();
battleImg.src = 'src/assets/battle/battle_bg.png';

export const battleSprite = new BattleSprite(
    new Position(0, 0),
    battleImg,
);
