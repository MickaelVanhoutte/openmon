import { Boundary, Jonction } from "./collisions";
import { Script } from "../scripting/scripts";
import type { NPC } from "../characters/npc";
import { Position } from "./positions";
import type { Interactive } from "../characters/characters-model";
import type { OverworldItem } from "../items/overworldItem";

export class MapSave {
    mapId: number;
    pickedItems: number[] = [];
    //scriptsStates

    constructor(mapId: number, pickedItems: number[] = []) {
        this.mapId = mapId;
        this.pickedItems = pickedItems;
    }
}

export class OpenMap {
    public mapId: number;
    public tileSize: number = 16;
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

    public battleTile: number;
    public collisionTile: number;
    public waterTile: number;

    public jonctions: Jonction[] = [];

    public npcs: NPC[] = [];
    public scripts: Script[];
    public sound?: string;

    public items: OverworldItem[] = [];

    constructor(mapId: number,
        background: string, width: number, height: number,
        collisions: number[], waterCollisions: number[], battles: number[], monsters: number[],
        playerInitialPosition: Position,
        levelRange: number[] = [1, 100],
        jonctions: Jonction[] = [],
        foreground?: string, battleTile?: number, collisionTile?: number, waterTile?: number, npcs?: NPC[], scripts?: Script[], sound?: string, items?: OverworldItem[]) {
        this.mapId = mapId;
        this.background = background;
        this.foreground = foreground;
        this.playerInitialPosition = playerInitialPosition;
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
        this.sound = sound;
        this.items = items?.map((item, index) => {
            item.id = index;
            return item;
        }) || [];
    }

    public static fromScratch(mapId: number, background: string, width: number, height: number,
        collisions: number[], waterCollisions: number[], battles: number[], monsters: number[],
        playerInitialPosition: Position = new Position(),
        levelRange: number[] = [1, 100],
        jonctions: Jonction[] = [],
        foreground?: string, battleTile?: number, collisionTile?: number, waterTile?: number, npcs?: NPC[], scripts?: Script[], sound?: string, items?: OverworldItem[]): OpenMap {


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
            levelRange,
            jonctions,
            foreground,
            battleTile,
            collisionTile,
            waterTile,
            npcs,
            scripts,
            sound,
            items
        )
    }

    // TODO : scripts/npc states
    public static fromInstance(map: OpenMap, playerPosition?: Position): OpenMap {
        return new OpenMap(
            map.mapId,
            map.background,
            map.width,
            map.height,
            map.collisions,
            map.water,
            map.battles,
            map.monsters,
            playerPosition ? playerPosition : map.playerInitialPosition,
            map.levelRange,
            map.jonctions,
            map?.foreground,
            map?.battleTile,
            map?.collisionTile,
            map?.waterTile,
            map?.npcs,
            map?.scripts,
            map?.sound,
            map.items
        )
    }

    randomMonster(): { id: number, level: number } {
        const monsterId = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        const level = Math.floor(Math.random() * (this.levelRange[1] - this.levelRange[0] + 1)) + this.levelRange[0];
        return { id: monsterId, level: level };
    }

    public initBattlesZones(battles: number[], width: number, tileId: number) {
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

    public initBoundaries(collisions: number[], width: number, tileId: number) {
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
            })
            || (this.itemAt(position) !== undefined && this.itemAt(position)?.isBlocking());
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
            return npc.position.positionOnMap.x === position.x && npc.position.positionOnMap.y === position.y;
        });
    }

    public itemAt(position: Position): OverworldItem | undefined {
        return this.items?.find((item) => {
            return item.position.x === position.x && item.position.y === position.y;
        });
    }

    public elementInFront(position: Position, direction: 'up' | 'down' | 'left' | 'right'): Interactive | undefined {
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

    public elementBehindCounter(position: Position, direction: 'up' | 'down' | 'left' | 'right'): Interactive | undefined {
        let elementPosition = new Position(position.x, position.y);
        switch (direction) {
            case 'up':
                elementPosition.y -= 2;
                break;
            case 'down':
                elementPosition.y += 2;
                break;
            case 'left':
                elementPosition.x -= 2;
                break;
            case 'right':
                elementPosition.x += 2;
                break;
        }
        let elem = this.elementAt(elementPosition);
        if (elem && elem.isBehindCounter()) {
            return elem;
        }
        return undefined;
    }

    private elementAt(elementPosition: Position): Interactive | undefined {
        return this.npcs?.find((npc) => {
            return npc.position.positionOnMap.x === elementPosition.x && npc.position.positionOnMap.y === elementPosition.y;
        }) || this.itemAt(elementPosition);
    }


    private images: Record<string, HTMLImageElement> = {};

    draw(ctx: CanvasRenderingContext2D, map: OpenMap, scale: number, playerPosition: Position, debug: boolean = false): {
        width: number,
        height: number,
        centerX: number,
        offsetX: number,
        centerY: number,
        offsetY: number
    } {
        let image = this.images[map.background];
        if (image && image.complete) {
            return this.drawImage(ctx, image, map, scale, playerPosition, debug);
        } else {
            image = new Image();
            image.src = map.background;
            image.onload = () => {
                this.images[map.background] = image;
                return this.drawImage(ctx, image, map, scale, playerPosition, debug);
            }
        }
        return { width: 0, height: 0, centerX: 0, offsetX: 0, centerY: 0, offsetY: 0 };
    }

    drawFG(ctx: CanvasRenderingContext2D, map: OpenMap, scale: number, playerPosition: Position, mapDim: {
        width: number,
        height: number,
        centerX: number,
        offsetX: number,
        centerY: number,
        offsetY: number
    }) {
        if (map.foreground !== undefined) {
            let image = this.images[map.foreground];
            if (image && image.complete) {
                this.drawImage(ctx, image, map, scale, playerPosition, false, mapDim);
            } else {
                image = new Image();
                image.src = map.foreground;
                image.onload = () => {
                    if (map.foreground) {
                        this.images[map.foreground] = image;
                        this.drawImage(ctx, image, map, scale, playerPosition, false, mapDim);
                    }
                }
            }
        }
    }

    drawMini(ctx: CanvasRenderingContext2D, map: OpenMap, scale: number, playerPosition: Position, enlargedMap: boolean = false) {
        if (map.background !== undefined) {
            let image = this.images[map.background];
            if (image && image.complete) {
                this.drawMiniImage(ctx, image, map, scale, playerPosition, false, enlargedMap);
            } else {
                image = new Image();
                image.src = map.background;
                image.onload = () => {
                    if (map.background) {
                        this.images[map.background] = image;
                        this.drawMiniImage(ctx, image, map, scale, playerPosition, false, enlargedMap);
                    }
                }
            }
        }
    }


    private drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, map: OpenMap, scale: number, playerPosition: Position, debug: boolean = false, mapDim?: {
        width: number,
        height: number,
        centerX: number,
        offsetX: number,
        centerY: number,
        offsetY: number
    }): {
        width: number,
        height: number,
        centerX: number,
        offsetX: number,
        centerY: number,
        offsetY: number
    } {

        let centerX, centerY, offsetX = 0, offsetY = 0;

        if (mapDim) {
            // Do not recalculates the center of the screen (for foreground)
            centerX = mapDim.centerX;
            centerY = mapDim.centerY;
            offsetX = mapDim.offsetX;
            offsetY = mapDim.offsetY;
        } else {
            let screenDimensions = {
                width: ctx.canvas.width,
                height: ctx.canvas.height,
            }

            centerX = screenDimensions.width / 2;
            centerY = screenDimensions.height / 2;

            offsetX = playerPosition.x;
            offsetY = playerPosition.y;

            let minLeftSide = Math.min(centerX / 2, window.innerWidth / 4 - (16 * 1 / 2));
            let minRightSide = (image.width * scale) - minLeftSide;
            let minTopSide = Math.min(centerY, window.innerHeight / 4 - (16 * 1 / 2));
            let minBottomSide = (image.height * scale) - minTopSide;

            let leftThreshold = playerPosition.x <= minLeftSide;
            let rightThreshold = playerPosition.x > minRightSide;
            let topThreshold = playerPosition.y <= minTopSide;
            let bottomThreshold = playerPosition.y > minBottomSide;

            if (leftThreshold) {
                offsetX = minLeftSide;
            }
            if (topThreshold) {
                offsetY = minTopSide;
            }
            if (rightThreshold) {
                offsetX = minRightSide;
            }
            if (bottomThreshold) {
                offsetY = minBottomSide;
            }
        }

        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);


        ctx.drawImage(image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            image.width * scale,
            image.height * scale,
        );

        if (debug) {
            ctx.font = "8px Arial";
            for (let i = 0; i < map.width; i++) {
                for (let j = 0; j < map.height; j++) {
                    if (map.hasBoundaryAt(new Position(i, j))) {
                        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                        ctx.fillRect(
                            i * 16 * scale,
                            j * 16 * scale,
                            16 * scale,
                            16 * scale);
                    } else if (map.hasBattleZoneAt(new Position(i, j))) {
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                        ctx.fillRect(
                            i * 16 * scale,
                            j * 16 * scale,
                            16 * scale,
                            16 * scale);
                    }
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.strokeRect(
                        i * 16 * scale,
                        j * 16 * scale,
                        16 * scale,
                        16 * scale);
                    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ctx.fillText(`[${i}, ${j}]`, i * 16 * scale + 4, j * 16 * scale + 12)
                }
            }

        }

        ctx.restore();

        return { width: image.width * scale, height: image.height * scale, centerX, offsetX, centerY, offsetY };
    }

    private drawMiniImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, map: OpenMap, scaleInit: number, playerPosition: Position, debug: boolean = false, enlargedMap: boolean = false) {
        const scale = 1 * (enlargedMap ? .8 : 1);
        let centerX, centerY, offsetX = 0, offsetY = 0;
        let playerPos = new Position(playerPosition.x * 16 * scale, playerPosition.y * 16 * scale);


        let screenDimensions = {
            width: ctx.canvas.width,
            height: ctx.canvas.height,
        }

        centerX = screenDimensions.width / 2;
        centerY = screenDimensions.height / 2;

        offsetX = playerPos.x;
        offsetY = playerPos.y;

        let minLeftSide = Math.min(centerX / 2, window.innerWidth / 4 - (16 * 1 / 2));
        let minRightSide = (image.width * scale) - minLeftSide;
        let minTopSide = Math.min(centerY, window.innerHeight / 4 - (16 * 1 / 2));
        let minBottomSide = (image.height * scale) - minTopSide;

        let leftThreshold = playerPos.x <= minLeftSide;
        let rightThreshold = playerPos.x > minRightSide;
        let topThreshold = playerPos.y <= minTopSide;
        let bottomThreshold = playerPos.y > minBottomSide;

        if (leftThreshold) {
            offsetX = minLeftSide;
        }
        if (topThreshold) {
            offsetY = minTopSide;
        }
        if (rightThreshold) {
            offsetX = minRightSide;
        }
        if (bottomThreshold) {
            offsetY = minBottomSide;
        }


        ctx.save();
        ctx.translate(centerX - offsetX, centerY - offsetY);


        ctx.drawImage(image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            image.width * scale,
            image.height * scale,
        );

        ctx.fillStyle = 'blue';
        ctx.fillRect(playerPos.x - (12 * scale), playerPos.y - (12 * scale), 24 * scale, 24 * scale);
        ctx.fillStyle = 'black';

        ctx.restore();
    }
}
