import {BackMonsterSprite, Sprite} from "./sprites";
import {Position} from "./sprites";

export class Player {
    public name: string;
    public sprite: Sprite;
    public monsters: BackMonsterSprite[];

    constructor(name: string, canvas: HTMLCanvasElement) {
        this.name = name;

        // Init images

        const playerImg = new Image();
        playerImg.src = 'src/assets/sprites/char_front-bicubic.png';

        const playerBackImg = new Image();
        playerBackImg.src = 'src/assets/sprites/char_back-bicubic.png';

        const playerLeftImg = new Image();
        playerLeftImg.src = 'src/assets/sprites/char_left-bicubic.png';

        const playerRightImg = new Image();
        playerRightImg.src = 'src/assets/sprites/char_right-bicubic.png';

        this.sprite = new Sprite(
            new Position(canvas.width / 2 - (playerImg.width / 3) / 2,
                canvas.height / 2 - (playerImg.height / 3) / 2
            ),
            playerImg,
            {max: 3},
            {
                front: playerImg,
                back: playerBackImg,
                right: playerRightImg,
                left: playerLeftImg
            }
        );

        this.monsters = [];

        // debug, initial monster
        const image = new Image();
        image.src = 'src/assets/monsters/heartgold-soulsilver/back/104.png';
        image.onload = () => {
            this.monsters.push(new BackMonsterSprite(
                image,
                new Position(
                    canvas.width * 0.20,
                    (canvas.height * 0.75) - (image.height * 5) + (20 * 3)
                )));
        }
    }

    updatePosition(canvas: HTMLCanvasElement) {
        this.sprite.position.x = canvas.width / 2 - (this.sprite.image.width / 3) / 2;
        this.sprite.position.y = canvas.height / 2 - (this.sprite.image.height / 3) / 2;
    }
}

