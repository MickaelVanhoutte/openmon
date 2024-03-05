import {NPCSpriteDrawer, Position} from "../sprites/drawers";
import {Script} from "../common/scripts";
import type {WorldContext} from "../common/context";
import type {Character} from "./player";
import {Bag} from "../items/bag";
import type {PokemonInstance} from "../pokemons/pokedex";

export interface Interactive {
    interact(context: WorldContext, playerPosition: Position): (Script | undefined) [];
}

export class NPC implements Character, Interactive {
    id: number;
    spriteId: number;
    name: string;
    gender: 'MALE' | 'FEMALE';
    monsterIds: number[];
    monsters: PokemonInstance[];
    bag: Bag;
    moving: boolean = false;
    direction: 'up' | 'down' | 'left' | 'right' = 'down';

    mainScript?: Script;
    dialogScripts?: Script[];
    movingScript?: Script;

    position: Position;
    positionInPx?: Position;

    targetPosition: Position;
    targetPositionInPx?: Position;

    drawer: NPCSpriteDrawer;

    constructor(id: number, name: string, spriteId: number, position: Position,
                direction: 'up' | 'down' | 'left' | 'right',
                gender: 'MALE' | 'FEMALE', monstersIds?: number[], bag?: Bag,
                mainScript?: Script, dialogScripts?: Script[], movingScript?: Script) {
        this.id = id;
        this.name = name;
        this.spriteId = spriteId;
        this.position = position;
        this.targetPosition = new Position(position.x, position.y);
        this.direction = direction;
        this.gender = gender;
        this.monsterIds = monstersIds || [];
        this.monsters = [];
        this.bag = bag || new Bag();
        this.mainScript = mainScript ? new Script(mainScript?.triggerType, mainScript?.actions, mainScript?.stepPosition, mainScript?.replayable) : undefined;
        this.dialogScripts = dialogScripts?.map((script) => new Script(script.triggerType, script.actions, script.stepPosition, script.replayable));
        this.movingScript = movingScript ? new Script(movingScript?.triggerType, movingScript?.actions, movingScript?.stepPosition, movingScript?.replayable) : undefined;
        this.drawer = new NPCSpriteDrawer();
    }

    interact(context: WorldContext, playerPosition: Position): (Script | undefined) [] {
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
            newScript = this.mainScript;
        } else if (this.dialogScripts) {
            const randomIndex = Math.floor(Math.random() * this.dialogScripts.length);
            newScript = this.dialogScripts[randomIndex];
        }
        return [newScript, previous];
    }
}
