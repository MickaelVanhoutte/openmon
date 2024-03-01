import type {Position} from "./sprites/drawers";
import {Script} from "./common/scripts";
import type {WorldContext} from "./common/context";

export interface Interactive {
    interact(context: WorldContext, playerPosition: Position): Script | undefined;
}

export class NPC implements Interactive {
    id: number;
    name: string;
    spriteId: number;
    position: Position;
    direction: 'up' | 'down' | 'left' | 'right' = 'down';
    moving: boolean = false;

    mainScript?: Script;
    dialogScripts?: Script[];
    movingScripts?: Script[];

    constructor(id: number, name: string, spriteId: number, position: Position, direction: 'up' | 'down' | 'left' | 'right', mainScript?: Script, dialogScripts?: Script[], movingScripts?: Script[]) {
        this.id = id;
        this.name = name;
        this.spriteId = spriteId;
        this.position = position;
        this.direction = direction;
        this.mainScript = mainScript ? new Script(mainScript?.triggerType, mainScript?.actions, mainScript?.stepPosition, mainScript?.replayable) : undefined;
        this.dialogScripts = dialogScripts?.map((script) => new Script(script.triggerType, script.actions, script.stepPosition, script.replayable));
        this.movingScripts = movingScripts?.map((script) => new Script(script.triggerType, script.actions, script.stepPosition, script.replayable));
    }

    interact(context: WorldContext, playerPosition: Position): Script | undefined {
        // change direction toward player
        if (this.position.x > playerPosition.x) {
            this.direction = 'left';
        } else if (this.position.x < playerPosition.x) {
            this.direction = 'right';
        } else if (this.position.y > playerPosition.y) {
            this.direction = 'up';
        } else if (this.position.y < playerPosition.y) {
            this.direction = 'down';
        }

        if (this.mainScript && (!this.mainScript?.played || this.mainScript?.replayable)) {
            return this.mainScript;
        } else if (this.dialogScripts) {
            const randomIndex = Math.floor(Math.random() * this.dialogScripts.length);
            return this.dialogScripts[randomIndex];
        }
        return;
    }
}
