import { PokemonInstance } from "../pokemons/pokedex";
import { Bag } from "../items/bag";
import { Position } from "../mapping/positions";
import { centerObject, CHARACTER_SPRITES, PlayerSprite } from "../sprites/sprites";
import { type Writable, writable } from "svelte/store";
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
    public moving$: Writable<boolean> = writable(false);
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


    public draw(ctx: CanvasRenderingContext2D, type: 'front' | 'overworld', scale: number, mapDim: {
        width: number,
        height: number
    }, drawGrass: boolean) {

        if (this.monsters.length > 0) {
            if (this.position.direction === "up") {
                this.drawPlayer(type, ctx, scale, mapDim, drawGrass);
                //this.walkerDrawer.draw(ctx, playerPosition, this.direction, scale, this.moving, playerPosition, this.monsters[0], mapDim, drawGrass);
            } else {
                //this.walkerDrawer.draw(ctx, playerPosition, this.direction, scale, this.moving, playerPosition, this.monsters[0], mapDim, drawGrass);
                this.drawPlayer(type, ctx, scale, mapDim, drawGrass);
            }

        } else {
            this.drawPlayer(type, ctx, scale, mapDim, drawGrass);
        }

    }

    private drawPlayer(type: "front" | "overworld", ctx: CanvasRenderingContext2D, scale: number, mapDim: {
        width: number;
        height: number
    }, drawGrass: boolean) {

        function easeInOutQuad(t: number) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
    

        let sprite = this.sprite[type];
        let img = type === 'front' ? this.sprite.frontImg : this.sprite.worldImg;
        if (img.complete)

            if (this.moving) {

                if (this.sprite.frames.max > 1) {
                    this.sprite.frames.elapsed += 1;
                }
                this.sprite.frames.val += 1
                if (this.sprite.frames.val > this.sprite.frames.max - 1) {
                    this.sprite.frames.val = 0;
                }
            } else {
                this.sprite.frames.val = 0;
            }

            

        let sY = this.sprite.orientationIndexes[this.position.direction] * sprite.height;
        let playerPosition = { x: this.position.positionOnMap.x * 16 * scale, y: this.position.positionOnMap.y * 16 * scale };
        let targetPosition = { x: this.position.targetPosition.x * 16 * scale, y: this.position.targetPosition.y * 16 * scale };

        let deltaX = targetPosition.x - playerPosition.x;
        let deltaY = targetPosition.y - playerPosition.y;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = this.running ? RUNNING_SPEED : WALKING_SPEED;

        if (distance > 6) {
            const easedDistance = easeInOutQuad(Math.min(1, distance / 5));
            // Interpolate between current and target positions with eased distance
            playerPosition.x += deltaX * easedDistance * speed;
            playerPosition.y += deltaY * easedDistance * speed;
        } else {
            // Snap to the target position if movement is small
            this.moving = false;
            playerPosition.x = targetPosition.x;
            playerPosition.y = targetPosition.y;
        }


        let { centerX, centerY, offsetX, offsetY } = centerObject(ctx, scale, playerPosition, 16, mapDim);
        offsetY += 6;

        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);

        ctx.drawImage(
            img,
            this.sprite.frames.val * (sprite.width),
            sY,
            sprite.width,
            drawGrass ? sprite.height - sprite.height * .20 : sprite.height,
            0,
            0,
            sprite.width * scale,
            drawGrass ? sprite.height * scale * .80 : sprite.height * scale
        );
        ctx.restore();
        return { sprite, img, sY };
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