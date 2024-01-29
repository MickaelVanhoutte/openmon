import {Position} from "./sprites";
import {Boundary} from "./collisions";
import {Monster} from "./monster";


export const tileSize = 16;
export const battleTile = 8;
export const collisionTile = 806;

export class OpenMap {
    public background: HTMLImageElement;
    public foreground: HTMLImageElement;
    public width: number;
    public height: number;
    public collisions: Boundary[];
    public battleZones: Boundary[];

    public monsters: number[];

    public playerInitialPosition: Position = new Position(11, 11);
    public playerPosition: Position = new Position(11, 11);

    constructor(background: HTMLImageElement, foreground: HTMLImageElement, width: number, height: number, collisions: number[], battles: number[], monsters: number[]) {
        this.background = background;
        this.foreground = foreground;
        this.width = width;
        this.height = height;
        this.collisions = this.initBoundaries(collisions);
        console.log(this.collisions);
        this.battleZones = this.initBattlesZones(battles);
        this.monsters = monsters;
    }

    randomMonster(): Monster {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const pokedex: Monster[] = localStorage.getItem('pokedex') && JSON.parse(localStorage.getItem('pokedex') || '[]') || [];
        const monster = pokedex.find((monster: Monster) => monster.id === monsterId);
        Object.setPrototypeOf(monster, Monster.prototype)
        return monster as Monster;
    }

    initBattlesZones(battles: number []) {
        const battle_map = [];
        for (let i = 0; i < battles.length; i += this.width) {
            battle_map.push(battles.slice(i, this.width + i));
        }

        const boundariesTmp: Boundary[] = [];
        battle_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === battleTile) {
                    const boundary = new Boundary(
                        new Position(x, y)
                    );
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }

    initBoundaries(collisions: number[]) {
        const collision_map = [];
        for (let i = 0; i < collisions.length; i += this.width) {
            collision_map.push(collisions.slice(i, this.width + i));
        }

        const boundariesTmp: Boundary[] = [];
        collision_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === collisionTile) {
                    const boundary = new Boundary(new Position(x, y));
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }

    drawBackground(ctx: CanvasRenderingContext2D, movedOffset: Position) {
        ctx.drawImage(this.background,
            movedOffset.x * 16,
            movedOffset.y * 16,
            this.background.width,
            this.background.height,
            0,
            0,
            this.background.width * 3,
            this.background.height * 3,
        )
    }

    drawForeground(ctx: CanvasRenderingContext2D, movedOffset: Position) {
        if (this.foreground === null) {
            return;
        }
        ctx.drawImage(this.foreground,
            movedOffset.x * 16,
            movedOffset.y * 16,
            this.foreground.width,
            this.foreground.height,
            0,
            0,
            this.foreground.width * 3,
            this.foreground.height * 3,
        )
    }


    drawBoundaries(ctx: CanvasRenderingContext2D, movedOffset: Position) {
        this.collisions.forEach((boundary) => {
            boundary.debug(ctx, movedOffset);
        })
    }

    drawBattleZones(ctx: CanvasRenderingContext2D, movedOffset: Position) {
        this.battleZones.forEach((boundary) => {
            boundary.debug(ctx, movedOffset, 'blue');
        })
    }

    hasBattleZoneAt(position: Position) {
        return this.battleZones.some((boundary) => {
            return boundary.position.x === position.x && boundary.position.y === position.y;
        })
    }

    hasBoundaryAt(position: Position) {
        return this.collisions.some((boundary) => {
            return boundary.position.x === position.x && boundary.position.y === position.y;
        }) || position.x < 0 || position.y < 0 || position.x > this.width - 1 || position.y > this.height - 1
    }

    updatePlayerPosition(movedOffset: Position) {
        this.playerPosition.x = this.playerInitialPosition.x + movedOffset.x;
        this.playerPosition.y = this.playerInitialPosition.y + movedOffset.y;
    }
}

/*
export const tile_size = 56;

export class MapObject {
    public background: Sprite;
    public foreground: Sprite;
    public width: number;
    public height: number;
    public boundaries: Boundary[];
    public battleZones: Boundary[];
    public monsters: string[];
    public currentMonster?: MonsterSprite;

    constructor(background: Sprite, foreground: Sprite, width: number, height: number, collisions: number[], battles: number[], monsters: string[]) {
        this.background = background;
        this.foreground = foreground;
        this.width = width;
        this.height = height;
        this.boundaries = this.initBoundaries(collisions);
        this.battleZones = this.initBattlesZones(battles);
        this.monsters = monsters;
    }

    randomMonster(canvas: HTMLCanvasElement) {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const monsterImage = new Image();
        monsterImage.src = `src/assets/monsters/heartgold-soulsilver/${monsterId}.png`;
        this.currentMonster = new MonsterSprite(monsterImage, canvas);
        return this.currentMonster;
    }

    initBattlesZones(battles: number []) {
        const battle_map = [];
        for (let i = 0; i < battles.length; i += map1_width) {
            battle_map.push(battles.slice(i, map1_width + i));
        }

        const boundariesTmp: Boundary[] = [];
        battle_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === battle_tile) {
                    const boundary = new Boundary(
                        new Position(x * tile_size, y * tile_size - 220)
                    );
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }

    initBoundaries(collisions: number[]) {
        const collision_map = [];
        for (let i = 0; i < collisions.length; i += map1_width) {
            collision_map.push(collisions.slice(i, map1_width + i));
        }

        const boundariesTmp: Boundary[] = [];
        collision_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === collision_tile) {
                    const boundary = new Boundary(new Position(x * tile_size, y * tile_size - 220));
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }
}
*/
