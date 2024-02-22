
import {Dialog} from "./dialog";
import {Message} from "./dialog";
import type {Character} from "../player/player";
import type {Script} from "./scripts";

export class WorldContext {
    id: number = 0;
    then: number = Date.now();
    fpsInterval: number = 1000 / 16;
    imageScale: number = 2;
    playerScale: number = .66;
    debug: boolean = false;
    displayChangingMap: boolean = false;
    changingMap: boolean = false;

    player: Character;
    playingScript?: Script;
    dialog?: Dialog;

    // change background color
    constructor(player: Character) {
        this.player = player;
        this.dialog = new Dialog(messages);
    }
}


export const messages: Message[] = [
    new Message('...', 'Ethan'),
    new Message('Ah...', 'Ethan'),
    new Message('My head... Where am I ?', 'Ethan'),
]
