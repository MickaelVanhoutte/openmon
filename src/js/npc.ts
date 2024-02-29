import type {Position} from "./sprites/drawers";
import type {Script} from "./common/scripts";

export class NPC {
    id: number;
    name: string;
    spriteId: number;
    position: Position;
    direction: string;
    scripts: Script[];

    constructor(id: number, name: string, spriteId: number, position: Position, direction: string, scripts: Script[]) {
        this.id = id;
        this.name = name;
        this.spriteId = spriteId;
        this.position = position;
        this.direction = direction;
        this.scripts = scripts;
    }
}
