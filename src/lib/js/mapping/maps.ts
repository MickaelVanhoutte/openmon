import {Boundary, Jonction} from "./collisions";
import {Position} from "../sprites/drawers";
import type {Script} from "../common/scripts";


export class OpenMap {
    public background: string;
    public foreground?: string;

    public width: number;
    public height: number;

    public collisions: number[];
    public battles: number[];
    public collisionsZones: Boundary[];
    public battleZones: Boundary[];

    public monsters: number[];
    public levelRange: number[] = [1, 100];

    public playerInitialPosition: Position = new Position(11, 11);
    public playerMovedOffset: Position = new Position(0, 0);

    public battleTile: number;
    public collisionTile: number;

    public jonctions: Jonction[] = [];

    public scripts?: Script[];


    constructor(background: string, width: number, height: number,
                collisions: number[], battles: number[], monsters: number[],
                playerInitialPosition: Position,
                playerMovedOffset: Position = new Position(),
                levelRange: number[] = [1, 100],
                jonctions: Jonction[] = [],
                foreground?: string, battleTile?: number, collisionTile?: number, scripts?: Script[]) {
        this.background = background;
        this.foreground = foreground;
        this.playerInitialPosition = playerInitialPosition;
        this.playerMovedOffset = playerMovedOffset;
        this.width = width;
        this.height = height;
        this.battleTile = battleTile || 2239;
        this.collisionTile = collisionTile || 4295;
        this.collisions = collisions;
        this.battles = battles;
        this.collisionsZones = this.initBoundaries(collisions, width);
        this.battleZones = this.initBattlesZones(battles, width);
        this.monsters = monsters;
        this.levelRange = levelRange;
        this.jonctions = jonctions;
        this.scripts = scripts;
    }

    public static fromScratch(background: string, width: number, height: number,
                              collisions: number[], battles: number[], monsters: number[],
                              playerInitialPosition: Position = new Position(), playerMovedOffset: Position = new Position(),
                              levelRange: number[] = [1, 100],
                              jonctions: Jonction[] = [],
                              foreground?: string, battleTile?: number, collisionTile?: number): OpenMap {


        return new OpenMap(
            background,
            width,
            height,
            collisions,
            battles,
            monsters,
            playerInitialPosition,
            playerMovedOffset,
            levelRange,
            jonctions,
            foreground,
            battleTile,
            collisionTile
        )
    }

    public static fromInstance(map: OpenMap): OpenMap {
        return new OpenMap(
            map.background,
            map.width,
            map.height,
            map.collisions,
            map.battles,
            map.monsters,
            map.playerInitialPosition,
            map.playerMovedOffset,
            map.levelRange,
            map.jonctions,
            map?.foreground,
        )
    }

    public setPrototypes(): OpenMap {
        Object.setPrototypeOf(this.playerInitialPosition, Position.prototype);
        this.collisionsZones.forEach((boundary) => {
            Object.setPrototypeOf(boundary, Boundary.prototype);
            Object.setPrototypeOf(boundary.position, Position.prototype);
        });
        this.battleZones.forEach((boundary) => {
            Object.setPrototypeOf(boundary, Boundary.prototype);
            Object.setPrototypeOf(boundary.position, Position.prototype);
        });
        this.jonctions.forEach((jonction) => {
            Object.setPrototypeOf(jonction, Jonction.prototype);
            jonction.positions.forEach((position) => {
                Object.setPrototypeOf(position, Position.prototype);
            });
        });

        return this;
    }

    randomMonster(): { id: number, level: number } {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const level = Math.floor(Math.random() * (this.levelRange[1] - this.levelRange[0] + 1)) + this.levelRange[0];
        return {id: monsterId, level: level};
    }

    public initBattlesZones(battles: number [], width: number) {
        const battle_map = [];
        for (let i = 0; i < battles.length; i += width) {
            battle_map.push(battles.slice(i, width + i));
        }

        const boundariesTmp: Boundary[] = [];
        battle_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === this.battleTile) {
                    const boundary = new Boundary(
                        new Position(x, y)
                    );
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }

    public initBoundaries(collisions: number[], width: number) {
        const collision_map = [];
        for (let i = 0; i < collisions.length; i += width) {
            collision_map.push(collisions.slice(i, width + i));
        }

        const boundariesTmp: Boundary[] = [];
        collision_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === this.collisionTile) {
                    const boundary = new Boundary(new Position(x, y));
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }

    hasBattleZoneAt(position: Position) {
        return this.battleZones.some((boundary) => {
            return boundary.position.x === position.x && boundary.position.y === position.y;
        })
    }

    hasBoundaryAt(position: Position) {
        return this.collisionsZones.some((boundary) => {
            return boundary.position.x === position.x && boundary.position.y === position.y;
        }) || position.x < 0 || position.y < 0 || position.x > this.width - 1 || position.y > this.height - 1
    }

    jonctionAt(position: Position): Jonction | undefined {
        for (let i = 0; i < this.jonctions.length; i++) {
            for (let j = 0; j < this.jonctions[i].positions.length; j++) {
                if (this.jonctions[i].positions[j].x === position.x && this.jonctions[i].positions[j].y === position.y) {
                    return this.jonctions[i];
                }
            }
        }
    }
}
