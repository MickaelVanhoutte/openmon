import {Position} from "./sprites";
import {Boundary} from "./collisions";
import type {PokemonInstance} from "./pokemons/pokemon";
import type {Pokedex} from "./pokemons/pokedex";


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
    public levelRange: number[] = [1, 100];

    public playerInitialPosition: Position = new Position(11, 11);

    public startingX: number = 0;
    public startingY: number = 0;

    constructor(background: HTMLImageElement, foreground: HTMLImageElement, width: number, height: number, collisions: number[], battles: number[], monsters: number[], levelRange: number[] = [1, 100]) {
        this.background = background;
        this.foreground = foreground;
        this.width = width;
        this.height = height;
        this.collisions = this.initBoundaries(collisions);
        this.battleZones = this.initBattlesZones(battles);
        this.monsters = monsters;
        this.levelRange = levelRange;
    }

    randomMonster(dex: Pokedex): PokemonInstance {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const level = Math.floor(Math.random() * (this.levelRange[1] - this.levelRange[0] + 1)) + this.levelRange[0];
        //const pokedex: PokemonInstance[] = localStorage.getItem('pokedex') && JSON.parse(localStorage.getItem('pokedex') || '[]') || [];
        //const monster = pokedex.find((monster: PokemonInstance) => monster.id === monsterId);
        return dex.findById(monsterId).result.instanciate(level);
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

    drawBackground(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number) {
        let bgWidth = this.background.width * scale;
        let bgHeight = this.background.height * scale;
        // center
        let x = ctx.canvas.width / 2 - bgWidth / 2;
        let y = ctx.canvas.height / 2 - bgHeight / 2;

        this.startingX = x + (0 - movedOffset.x) * (16 * scale);
        this.startingY = y + (0 - movedOffset.y) * (16 * scale);

        ctx.drawImage(this.background,
            0,
            0,
            this.background.width,
            this.background.height,
            this.startingX,
            this.startingY,
            this.background.width * scale,
            this.background.height * scale,
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


    drawBoundaries(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number) {
        this.collisions.forEach((boundary) => {
            boundary.debug(ctx, movedOffset, scale, this.startingX, this.startingY, 'rgba(255, 0, 0, 0.5)',);
        })
    }

    drawBattleZones(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number) {
        this.battleZones.forEach((boundary) => {
            boundary.debug(ctx, movedOffset, scale, this.startingX, this.startingY, 'rgba(0, 0, 255, 0.5)');
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
}
