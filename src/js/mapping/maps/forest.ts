import type { NPC } from "../../characters/npc";
import { Script, Dialog, Message } from "../../scripting/scripts";
import { Jonction } from "../collisions";
import { OpenMap } from "../maps";
import { Position } from "../positions";

const monsters = Array.from({ length: 233 }, (v, k) => k + 1);
const collisions: number[] = [];
const waterCollision: number[] = [];
const battle: number[] = [];
const npcs: NPC[] = [];
const scripts: Script[] = [];

export const forest = OpenMap.fromScratch(1, 'src/assets/maps/forest.png', 150, 160,
    collisions, waterCollision, battle, monsters,
    new Position(5, 159),
    [3, 6], [
    new Jonction(2,
        0, [new Position(2, 159), new Position(3, 159), new Position(4, 159), new Position(5, 159), new Position(6, 159), new Position(7, 159), new Position(8, 159), new Position(9, 159), new Position(10, 159)], new Position(144, 0)
    )
], undefined, 39951, 40104, 40111, npcs, scripts);
