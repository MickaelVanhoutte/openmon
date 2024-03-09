import {Boundary, Jonction} from "./collisions";
import {Position} from "../sprites/drawers";
import {Script} from "../common/scripts";
import type {Interactive} from "../characters/npc";
import {NPC} from "../characters/npc";

export class MapSave {
    mapId: number;
    playerPosition: Position;
    //scriptsStates

    constructor(mapId: number, playerPosition: Position) {
        this.mapId = mapId;
        this.playerPosition = playerPosition;
    }
}

export class OpenMap {
    public mapId: number;
    public background: string;
    public foreground?: string;

    public width: number;
    public height: number;

    public collisions: number[];
    public water: number[];
    public battles: number[];
    public collisionsZones: Boundary[];
    public waterZones: Boundary[];
    public battleZones: Boundary[];

    public monsters: number[];
    public levelRange: number[] = [1, 100];

    public playerInitialPosition: Position = new Position(11, 11);
    public playerMovedOffset: Position = new Position(0, 0); // keep in save

    public battleTile: number;
    public collisionTile: number;
    public waterTile: number;

    public jonctions: Jonction[] = [];

    public npcs: NPC[] = [];
    public scripts: Script[];


    constructor(mapId: number,
                background: string, width: number, height: number,
                collisions: number[], waterCollisions: number[], battles: number[], monsters: number[],
                playerInitialPosition: Position,
                playerMovedOffset: Position = new Position(),
                levelRange: number[] = [1, 100],
                jonctions: Jonction[] = [],
                foreground?: string, battleTile?: number, collisionTile?: number, waterTile?: number, npcs?: NPC[], scripts?: Script[]) {
        this.mapId = mapId;
        this.background = background;
        this.foreground = foreground;
        this.playerInitialPosition = playerInitialPosition;
        this.playerMovedOffset = playerMovedOffset;
        this.width = width;
        this.height = height;
        this.battleTile = battleTile || 2239;
        this.collisionTile = collisionTile || 4295;
        this.waterTile = waterTile || 40111;
        this.collisions = collisions;
        this.water = waterCollisions;
        this.battles = battles;
        this.collisionsZones = this.initBoundaries(this.collisions, width, this.collisionTile);
        this.waterZones = this.initBoundaries(this.water, width, this.waterTile);
        this.battleZones = this.initBattlesZones(this.battles, width, this.battleTile);
        this.monsters = monsters;
        this.levelRange = levelRange;
        this.jonctions = jonctions;
        this.npcs = npcs || []
        this.scripts = scripts || [];
    }

    public static fromScratch(mapId: number, background: string, width: number, height: number,
                              collisions: number[], waterCollisions: number[], battles: number[], monsters: number[],
                              playerInitialPosition: Position = new Position(), playerMovedOffset: Position = new Position(),
                              levelRange: number[] = [1, 100],
                              jonctions: Jonction[] = [],
                              foreground?: string, battleTile?: number, collisionTile?: number, waterTile?: number, npcs?: NPC[], scripts?: Script[]): OpenMap {


        return new OpenMap(
            mapId,
            background,
            width,
            height,
            collisions,
            waterCollisions,
            battles,
            monsters,
            playerInitialPosition,
            playerMovedOffset,
            levelRange,
            jonctions,
            foreground,
            battleTile,
            collisionTile,
            waterTile,
            npcs,
            scripts
        )
    }

    get playerPosition() {
        return new Position(this.playerInitialPosition.x + this.playerMovedOffset.x, this.playerInitialPosition.y + this.playerMovedOffset.y);
    }

    // TODO : scripts/npc states
    public static fromInstance(map: OpenMap, playerPosition: Position): OpenMap {
        return new OpenMap(
            map.mapId,
            map.background,
            map.width,
            map.height,
            map.collisions,
            map.water,
            map.battles,
            map.monsters,
            map.playerInitialPosition,
            playerPosition,
            map.levelRange,
            map.jonctions,
            map?.foreground,
            map?.battleTile,
            map?.collisionTile,
            map?.waterTile,
            map?.npcs,
            map?.scripts
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
        this.npcs = this.npcs?.map((npc) => new NPC(npc.id, npc.name, npc.spriteId, npc.position, npc.direction, npc.gender, npc.monsterIds, npc.bag, npc.mainScript, npc.dialogScripts, npc.movingScript));
        this.scripts = this.scripts?.map((script) => new Script(script.triggerType, script.actions, script.stepPosition, script.replayable));

        return this;
    }

    randomMonster(): { id: number, level: number } {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const level = Math.floor(Math.random() * (this.levelRange[1] - this.levelRange[0] + 1)) + this.levelRange[0];
        return {id: monsterId, level: level};
    }

    public initBattlesZones(battles: number [], width: number, tileId: number) {
        const battle_map = [];
        for (let i = 0; i < battles.length; i += width) {
            battle_map.push(battles.slice(i, width + i));
        }

        const boundariesTmp: Boundary[] = [];
        battle_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === tileId) {
                    const boundary = new Boundary(
                        new Position(x, y)
                    );
                    boundariesTmp.push(boundary);
                }
            })
        });
        return boundariesTmp;
    }

    public initBoundaries(collisions: number[], width: number, tileId: number) {console.log(tileId);
        const collision_map = [];
        for (let i = 0; i < collisions.length; i += width) {
            collision_map.push(collisions.slice(i, width + i));
        }

        const boundariesTmp: Boundary[] = [];
        collision_map.forEach((row, y) => {
            row.forEach((col, x) => {
                if (col === tileId) {
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
            }) ||
            position.x < 0 || position.y < 0 || position.x > this.width - 1 || position.y > this.height - 1 ||
            this.npcAt(position) ||
            this.waterZones.some((boundary) => {
                return boundary.position.x === position.x && boundary.position.y === position.y; // && TODO : trigger surf ?
            });
    }

    jonctionAt(position: Position): Jonction | undefined {
        for (let i = 0; i < this.jonctions.length; i++) {
            for (let j = 0; j < this.jonctions[i].positions.length; j++) {
                if (this.jonctions[i].positions[j].x === position.x && this.jonctions[i].positions[j].y === position.y) {
                    return this.jonctions[i];
                }
            }
        }
        return undefined;
    }

    public npcAt(position: Position) {
        return this.npcs?.some((npc) => {
            return npc.position.x === position.x && npc.position.y === position.y;
        });
    }

    public elementInFront(position: Position, direction: 'up' | 'down' | 'left' | 'right') {
        let elementPosition = new Position(position.x, position.y);
        switch (direction) {
            case 'up':
                elementPosition.y -= 1;
                break;
            case 'down':
                elementPosition.y += 1;
                break;
            case 'left':
                elementPosition.x -= 1;
                break;
            case 'right':
                elementPosition.x += 1;
                break;
        }
        return this.elementAt(elementPosition);
    }

    private elementAt(elementPosition: Position): Interactive | undefined {
        return this.npcs?.find((npc) => {
            return npc.position.x === elementPosition.x && npc.position.y === elementPosition.y;
        });
    }
}
