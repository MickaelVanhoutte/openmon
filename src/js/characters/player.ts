import { PokemonInstance } from "../pokemons/pokedex";
import { Bag } from "../items/bag";
import { Position } from "../mapping/positions";
import { centerObject, CHARACTER_SPRITES, PlayerSprite } from "../sprites/sprites";
import { type Character, CharacterPosition, RUNNING_SPEED, WALKING_SPEED } from "./characters-model";
import { Follower } from "./follower";
import type { OverworldContext } from "../context/overworldContext";

export class ComboJauge {
    public value: number = 0;
    public stored: number = 0;

    constructor(value: number = 0, stored: number = 0) {
        this.value = value;
        this.stored = stored;
    }

    public addValue(value: number) {
        console.log("before", this.value, value, this.stored);
        this.value = this.value + value;
        if (this.value >= 100) {

            if (this.stored < 3) {
                this.stored++;
                this.value = this.value - 100;
            } else {
                this.value = 100;
            }
        }
        console.log("after", this.value, this.stored);
    }

    public consume() {
        if (this.stored > 0) {
            this.stored--;
        }
    }
}

export class Masteries {
    catch: number = 0;
    xp: number = 0;
    ev: number = 0;
    shiny: number = 0;
    critical: number = 0;
    stab: number = 0;
    nonStab: number = 0;
    accuracy: number = 0;
    effectiveness: number = 0;
    resistance: number = 0;

    comboJauge: number = 0;
    comboDamage: number = 0;

    heal: number = 0;
    autoHeal: number = 0;

    dotChance: number = 0;
    dotDamage: number = 0;

    

    confuse: number = 0;
    attract: number = 0;
}

export class Player implements Character {
    public spriteId: number;
    public name: string;
    public gender: 'MALE' | 'FEMALE';
    public monsters: PokemonInstance[];
    public comboJauge: ComboJauge = new ComboJauge();
    public bag = new Bag();
    public lvl: number = 1;
    public moving: boolean = false;
    public running: boolean = false;
    public sprite: PlayerSprite;
    public position: CharacterPosition = new CharacterPosition();

    public level: number = 1;
    public masteryPoints: number = 12;
    //public masteries: Masteries = new Masteries();

    // followerIdx (chose a monster to follow you TODO)
    public follower?: Follower;

    constructor(spriteId: number, name: string, gender: 'MALE' | 'FEMALE', monsters: PokemonInstance[], bag: Bag, lvl: number, moving: boolean, comboJauge: ComboJauge, masteryPoints?: number, follower?: Follower) {
        this.spriteId = spriteId;
        this.name = name;
        this.gender = gender;
        this.monsters = monsters;
        this.bag = bag;
        this.lvl = lvl;
        this.moving = moving;
        this.position = new CharacterPosition();
        this.sprite = CHARACTER_SPRITES.getSprite(spriteId);
        this.comboJauge = comboJauge;
        this.masteryPoints = 12//masteryPoints || 0;
        this.follower = follower;
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
            new ComboJauge(),
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
            character.comboJauge ? new ComboJauge(character.comboJauge.value, character.comboJauge.stored) : new ComboJauge(),
            character.masteryPoints,
            character.follower,
        );
    }

    public setPrototypes(): Player {
        this.monsters.forEach((monster) => {
            Object.setPrototypeOf(monster, PokemonInstance.prototype);
        });
        this.bag = new Bag(this.bag);
        if (this.follower) {
            this.follower = Follower.fromInstance(this.follower);
        }
        return this;
    }

    public setFollower(monster: PokemonInstance): Follower {
        this.follower = new Follower(new CharacterPosition(this.behindPlayer(), this.position.direction), monster);
        return this.follower;
    }

    public followerCharge(context: OverworldContext, battle: boolean = true) {
        if (this.follower) {
            let unsubscribe = setInterval(() => {
                if (this.follower && !this.follower.moving) {
                    //const savedSpeed = this.running;
                    context.isPaused = true;
                    this.follower.moving = true;
                    this.follower.position.direction = this.position.direction;
                    let playerSide = this.aroundPlayer(this.playerSide());
                    // Set the follower to the side of the player
                    this.follower.position.setFuturePosition(playerSide.x, playerSide.y, () => {
                        if (this.follower) {
                            let playerFront = this.aroundPlayer(this.position.direction);
                            //this.running = true;
                            this.follower.moving = true;
                            // Set the follower to the front of the player
                            this.follower.position.setFuturePosition(playerFront.x, playerFront.y, () => {
                                setTimeout(() => {
                                    if (this.follower && !this.moving) {
                                        this.follower.position.direction = this.followerOpositeDirection();
                                        this.follower.moving = true;
                                        // Set the follower to the side of the player again
                                        this.follower.position.setFuturePosition(playerSide.x, playerSide.y, () => {
                                            if (this.follower && !this.moving) {
                                                let playerBack = this.behindPlayer();
                                                this.follower.moving = true;
                                                // Set the follower to the back of the player
                                                this.follower.position.setFuturePosition(playerBack.x, playerBack.y, () => {
                                                    if (this.follower) {
                                                        this.follower.position.direction = this.followerOpositeDirection();
                                                        //this.running = savedSpeed;
                                                        context.isPaused = false;
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }, battle ? 2000 : 800);
                            });
                        }
                    });
                    clearInterval(unsubscribe);
                }
            }, 100);
        }
    }

    public followerOpositeDirection(): 'up' | 'down' | 'left' | 'right' {
        switch (this.follower?.position.direction) {
            case "up":
                return "down";
            case "down":
                return "up";
            case "left":
                return "right";
            case "right":
                return "left";
        }
        return 'down';
    }

    public playerSide(): 'up' | 'down' | 'left' | 'right' {
        switch (this.position.direction) {
            case "up":
                return "right";
            case "down":
                return "left";
            case "left":
                return "up";
            case "right":
                return "down";
        }
    }

    public aroundPlayer(direction: 'up' | 'down' | 'left' | 'right'): Position {
        let x = this.position.positionOnMap.x;
        let y = this.position.positionOnMap.y;
        switch (direction) {
            case "up":
                y -= 1;
                break;
            case "down":
                y += 1;
                break;
            case "left":
                x -= 1;
                break;
            case "right":
                x += 1;
                break;
        }
        return { x, y };
    }

    public behindPlayer(): Position {
        let x = this.position.positionOnMap.x;
        let y = this.position.positionOnMap.y;
        switch (this.position.direction) {
            case "up":
                y += 1;
                break;
            case "down":
                y -= 1;
                break;
            case "left":
                x += 1;
                break;
            case "right":
                x -= 1;
                break;
        }
        return { x, y };
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