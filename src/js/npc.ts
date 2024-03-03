import {NPCSpriteDrawer, Position} from "./sprites/drawers";
import {Script} from "./common/scripts";
import type {WorldContext} from "./common/context";

export interface Interactive {
    interact(context: WorldContext, playerPosition: Position): (Script | undefined) [] ;
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
    movingScript?: Script;

    positionInPx?: Position;

    targetPosition: Position;
    targetPositionInPx?: Position;

    drawer: NPCSpriteDrawer;

    setMoving(moving: boolean) {
        this.moving = moving;
        console.log(this.moving);
    }

    constructor(id: number, name: string, spriteId: number, position: Position, direction: 'up' | 'down' | 'left' | 'right', mainScript?: Script, dialogScripts?: Script[], movingScript?: Script) {
        this.id = id;
        this.name = name;
        this.spriteId = spriteId;
        this.position = position;
        this.targetPosition = new Position(position.x, position.y);
        this.direction = direction;
        this.mainScript = mainScript ? new Script(mainScript?.triggerType, mainScript?.actions, mainScript?.stepPosition, mainScript?.replayable) : undefined;
        this.dialogScripts = dialogScripts?.map((script) => new Script(script.triggerType, script.actions, script.stepPosition, script.replayable));
        this.movingScript = movingScript ? new Script(movingScript?.triggerType, movingScript?.actions, movingScript?.stepPosition, movingScript?.replayable) : undefined;
        this.drawer = new NPCSpriteDrawer();
    }

    interact(context: WorldContext, playerPosition: Position): (Script | undefined) []  {
        let previous = this.movingScript?.interrupt();
        let newScript: Script | undefined;

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
            //this.mainScript.onEnd = () => {previous?.resume(context)};
            //return this.mainScript;
            newScript = this.mainScript;
        } else if (this.dialogScripts) {
            const randomIndex = Math.floor(Math.random() * this.dialogScripts.length);
            //dialog.onEnd = () => {previous?.resume(context)};
            //return dialog;
            newScript = this.dialogScripts[randomIndex];
        }else{
            //previous?.resume(context);
        }
        return [newScript, previous];
    }
}
