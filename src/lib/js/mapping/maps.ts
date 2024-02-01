import {Boundary} from "./collisions";
import {Position, WoldSpriteDrawer} from "../sprites/drawers";


export const tileSize = 16;
export const battleTile = 8;
export const collisionTile = 806;

export class OpenMap {
    public background: string;
    public foreground: string;

    public width: number;
    public height: number;

    public collisions: Boundary[];
    public battleZones: Boundary[];

    public monsters: number[];
    public levelRange: number[] = [1, 100];

    public playerInitialPosition: Position = new Position(11, 11);

    /*public startingX: number = 0;
    public startingY: number = 0;*/

    constructor(background: string, foreground: string, width: number, height: number, collisions: Boundary[], battles: Boundary[], monsters: number[], playerInitialPosition: Position, levelRange: number[] = [1, 100]) {
        this.background = background;
        this.foreground = foreground;
        this.width = width;
        this.height = height;
        this.collisions = collisions;
        this.battleZones = battles;
        this.monsters = monsters;
        this.playerInitialPosition = playerInitialPosition;
        this.levelRange = levelRange;
    }

    public static fromScratch(background: string, foreground: string, width: number, height: number, collisions: number[], battles: number[], monsters: number[], playerInitialPosition: Position = new Position(), levelRange: number[] = [1, 100]): OpenMap {
        let collisionsCalc = OpenMap.initBoundaries(collisions, width);
        let battleZonesCalc = OpenMap.initBattlesZones(battles, width);

        return new OpenMap(
            background,
            foreground,
            width,
            height,
            collisionsCalc,
            battleZonesCalc,
            monsters,
            playerInitialPosition,
            levelRange,
        )
    }

    public static fromInstance(map: OpenMap): OpenMap {
        return new OpenMap(
            map.background,
            map.foreground,
            map.width,
            map.height,
            map.collisions,
            map.battleZones,
            map.monsters,
            map.playerInitialPosition,
            map.levelRange,
        )
    }

    public setPrototypes(): OpenMap {
        Object.setPrototypeOf(this.playerInitialPosition, Position.prototype);
        this.collisions.forEach((boundary) => {
            Object.setPrototypeOf(boundary, Boundary.prototype);
            Object.setPrototypeOf(boundary.position, Position.prototype);
        });
        this.battleZones.forEach((boundary) => {
            Object.setPrototypeOf(boundary, Boundary.prototype);
            Object.setPrototypeOf(boundary.position, Position.prototype);
        });

        return this;
    }

    randomMonster(): { id: number, level: number } {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const level = Math.floor(Math.random() * (this.levelRange[1] - this.levelRange[0] + 1)) + this.levelRange[0];
        return {id: monsterId, level: level};
    }

    public static initBattlesZones(battles: number [], width: number) {
        const battle_map = [];
        for (let i = 0; i < battles.length; i += width) {
            battle_map.push(battles.slice(i, width + i));
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

    public static initBoundaries(collisions: number[], width: number) {
        const collision_map = [];
        for (let i = 0; i < collisions.length; i += width) {
            collision_map.push(collisions.slice(i, width + i));
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

    /*    drawBoundaries(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number) {
            this.collisions.forEach((boundary) => {
                boundary.debug(ctx, movedOffset, scale, this.startingX, this.startingY, 'rgba(255, 0, 0, 0.5)',);
            })
        }

        drawBattleZones(ctx: CanvasRenderingContext2D, movedOffset: Position, scale: number) {
            this.battleZones.forEach((boundary) => {
                boundary.debug(ctx, movedOffset, scale, this.startingX, this.startingY, 'rgba(0, 0, 255, 0.5)');
            })
        }*/

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
