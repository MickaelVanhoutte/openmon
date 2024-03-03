import type {Character} from "../player/player";
import type {Script} from "./scripts";
import type {OpenMap} from "../mapping/maps";
import type {NPC} from "../npc";
import {Position} from "../sprites/drawers";

export class WorldContext {
    id: number = 0;

    map?: OpenMap;

    then: number = Date.now();
    fpsInterval: number = 1000 / 18;
    imageScale: number = 2.5;
    playerScale: number = .83;
    running: boolean = false;
    walk: number = .3;
    run: number = .6;
    debug: boolean = false;
    displayChangingMap: boolean = false;
    changingMap: boolean = false;

    player: Character;
    playingScript?: Script;

    // change background color
    constructor(player: Character) {
        this.player = player;
    }

    playScript(script?: Script, previous?: Script) {
        if (script && !this.playingScript) {
            script.onEnd = () => {
                this.playingScript = undefined;
                previous?.resume(this);
            };
            this.playingScript = script;
            script.start(this);
        }
    }

    playMvts(npcs: (NPC | undefined)[]) {
        npcs.forEach((npc) => {
            npc?.movingScript?.start(this);
        });
    }

    followerAt(position: Position): boolean {
       return this.behindPlayerPosition()?.x === position.x && this.behindPlayerPosition()?.y === position.y;
    }

    behindPlayerPosition() {
        let playerPosition = this.map?.playerPosition;
        if(playerPosition) {
            let direction = this.player.direction;
            switch (direction) {
                case 'up':
                    return new Position(playerPosition.x, playerPosition.y + 1);
                case 'down':
                    return new Position(playerPosition.x, playerPosition.y - 1);
                case 'left':
                    return new Position(playerPosition.x + 1, playerPosition.y);
                case 'right':
                    return new Position(playerPosition.x - 1, playerPosition.y);
            }
        }
    }
}
