import {MonsterSprite, Position, Sprite} from "./sprites";
import {Boundary} from "./collisions";
import {battle_tile, collision_tile, map1_width} from "../maps/map1";


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
