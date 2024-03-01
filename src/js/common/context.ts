import type {Character} from "../player/player";
import type {Script} from "./scripts";
import type {OpenMap} from "../mapping/maps";

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

    playScript(script?: Script) {
        if (script && !this.playingScript) {
            this.playingScript = script;
            script.onEnd = () => {
                this.playingScript = undefined;
            };
            script.play(this);
        }
    }
}
