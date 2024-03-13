import { PokemonInstance } from "../pokemons/pokedex";
import { Bag } from "../items/bag";
import { Position } from "../mapping/positions";
import { centerObject, CHARACTER_SPRITES, PlayerSprite } from "../sprites/sprites";
import { type Character, CharacterPosition, RUNNING_SPEED, WALKING_SPEED } from "./characters-model";

export class Player implements Character {
    public spriteId: number;
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public monsters: PokemonInstance[];
    public bag = new Bag();
    public lvl: number = 1;
    public moving: boolean = false;
    public running: boolean = false;
    public sprite: PlayerSprite;
    public walkerDrawer = new PokeWalkerSpriteDrawer();

    public position: CharacterPosition = new CharacterPosition();

    constructor(spriteId: number, name: string, gender: 'MALE' | 'FEMALE', monsters: PokemonInstance[], bag: Bag, lvl: number, moving: boolean, position: CharacterPosition) {
        this.spriteId = spriteId;
        this.name = name;
        this.gender = gender;
        this.monsters = monsters;
        this.bag = bag;
        this.lvl = lvl;
        this.moving = moving;
        this.position = new CharacterPosition();
        this.sprite = CHARACTER_SPRITES.getSprite(spriteId);
    }

    public static fromScratch(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): Player {
        return new Player(
            spriteId,
            name,
            gender,
            [],
            new Bag(),
            1,
            false,
            new CharacterPosition(),
        )
    }

    public static fromInstance(character: Player): Player {
        return new Player(
            character.spriteId,
            character.name,
            character.gender,
            character.monsters,
            character.bag,
            character.lvl,
            character.moving,
            character.position,
        );
    }

    public setPrototypes(): Player {
        this.monsters.forEach((monster) => {
            Object.setPrototypeOf(monster, PokemonInstance.prototype);
        });
        this.bag = new Bag(this.bag);
        return this;
    }


    public draw(ctx: CanvasRenderingContext2D, scale: number, mapDim: {
        width: number,
        height: number
    }, drawGrass: boolean) {

        if (this.monsters.length > 0) {
            if (this.position.direction === "up") {
                this.drawPlayer(ctx, scale, mapDim, drawGrass);
                //this.walkerDrawer.draw(ctx, playerPosition, this.direction, scale, this.moving, playerPosition, this.monsters[0], mapDim, drawGrass);
            } else {
                //this.walkerDrawer.draw(ctx, playerPosition, this.direction, scale, this.moving, playerPosition, this.monsters[0], mapDim, drawGrass);
                this.drawPlayer(ctx, scale, mapDim, drawGrass);
            }

        } else {
            this.drawPlayer(ctx, scale, mapDim, drawGrass);
        }

    }

    private drawPlayer(ctx: CanvasRenderingContext2D, scale: number, mapDim: {
        width: number;
        height: number
    }, drawGrass: boolean) {

        function easeInOutQuad(t: number) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }


        let sprite = this.running && this.moving ? this.sprite.overworld.running : this.sprite.overworld.walking;
        let img = this.running && this.moving ? this.sprite.worldRunningImg : this.sprite.worldWalkingImg;

        if (img && img.complete) {

            if (this.moving) {

                if (this.sprite.frames.max > 1) {
                    this.sprite.frames.elapsed += 1;
                }

                if (this.sprite.frames.elapsed % 2 === 0) {
                    this.sprite.frames.val += 1;
                }

                if (this.sprite.frames.val > this.sprite.frames.max - 1) {
                    this.sprite.frames.val = 0;
                }
            } else {
                this.sprite.frames.val = 0;
            }


            const sY = this.sprite.orientationIndexes[this.position.direction] * (sprite?.height || 64);

            if (this.moving) {
                const speed = this.running ? RUNNING_SPEED : WALKING_SPEED;

                const deltaX = this.position.targetPosition.x - this.position.positionOnMap.x;
                const deltaY = this.position.targetPosition.y - this.position.positionOnMap.y;

                const deltaXPx = this.position.targetPositionInPx.x - this.position.positionInPx.x;
                const deltaYPx = this.position.targetPositionInPx.y - this.position.positionInPx.y;


                const moveByX = Math.floor((16 * 2.5) / 2 * speed * deltaX);
                const moveByY = Math.floor((16 * 2.5) / 2 * speed * deltaY);

                const distance = Math.sqrt(deltaXPx * deltaXPx + deltaYPx * deltaYPx);

                if (distance < ((16 * 2.5) / 2 * speed) + 1) {
                    this.position.positionInPx.x = this.position.targetPositionInPx.x;
                    this.position.positionInPx.y = this.position.targetPositionInPx.y;
                    this.position.positionOnMap = this.position.targetPosition;
                    this.moving = false;
                } else {
                    this.position.positionInPx.x += moveByX;
                    this.position.positionInPx.y += moveByY;
                }
            }


            let { centerX, centerY, offsetX, offsetY } = centerObject(ctx, scale, this.position.positionInPx, 16, mapDim);
            offsetY += 6;

            ctx.save();
            ctx.translate(centerX - offsetX, centerY - offsetY);


            console.log(
                (sprite?.width || 64),
                drawGrass ? (sprite?.height || 64) * .20 : (sprite?.height || 64),
                0,
                0,
                (sprite?.width || 64) * scale,
                drawGrass ? (sprite?.height || 64) * scale * .80 : (sprite?.height || 64) * scale
            )

            ctx.drawImage(
                img,
                this.sprite.frames.val * (sprite?.width || 64),
                sY,
                (sprite?.width || 64),
                drawGrass ? (sprite?.height || 64) * .80 : (sprite?.height || 64),
                0,
                0,
                (sprite?.width || 64) * scale,
                drawGrass ? (sprite?.height || 64) * scale * .80 : (sprite?.height || 64) * scale
            );
            ctx.restore();
            return { sprite, img, sY };
        }
    }
}

//todo: make interactive
export class PokeWalkerSpriteDrawer {
    private images: Record<string, HTMLImageElement> = {};

    private frames = { max: 4, val: 0, elapsed: 0 };

    private orientationIndexes = {
        "down": 0,
        "left": 1,
        "right": 2,
        "up": 3,
    }


    draw(ctx: CanvasRenderingContext2D, playerPosition: Position, orientation: 'up' | 'down' | 'left' | 'right',
        scale: number, moving: boolean, walkerPosition: Position, pokemon: PokemonInstance, mapDim: {
            width: number,
            height: number
        }, drawGrass: boolean = true) {

        let id = ("00" + pokemon.id).slice(-3);
        id = pokemon.isShiny ? id + 's' : id;
        let source = `src/assets/monsters/walking/${id}.png`;
        let image = this.images[source];
        if (image && image.complete) {
            this.drawImage(ctx, image, playerPosition, orientation, scale, moving, walkerPosition, mapDim);
        } else {
            image = new Image();
            image.src = source;
            image.onload = () => {
                this.images[source] = image;
                this.drawImage(ctx, image, playerPosition, orientation, scale, moving, walkerPosition, mapDim);
            }
        }
    }

    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerPosition: Position, orientation: 'up' | 'down' | 'left' | 'right',
        scale: number, moving: boolean, walkerPosition: Position, mapDim: {
            width: number,
            height: number
        }) {

        if (moving) {

            if (this.frames.max > 1) {
                this.frames.elapsed += 1;
            }
            this.frames.val += 1
            if (this.frames.val > this.frames.max - 1) {
                this.frames.val = 0;
            }
        } else {
            this.frames.val = 0;
        }

        let sY = this.orientationIndexes[orientation] * 64;

        // Calculate the position of the NPC relative to the player
        const relativeX = walkerPosition.x - playerPosition.x;
        const relativeY = walkerPosition.y - playerPosition.y;

        let { centerX, centerY, offsetX, offsetY } = centerObject(ctx, scale, playerPosition, 16, mapDim);
        offsetY -= relativeY - 6;
        offsetX -= relativeX;

        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);

        ctx.drawImage(
            image,
            this.frames.val * (64),
            sY,
            64,
            64,
            0,
            0,
            64 * scale,
            64 * scale
        );
        ctx.restore();

    }
}