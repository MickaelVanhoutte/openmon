import type {Scriptable} from "./scripts";
import type {Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {WorldContext} from "./context";

export class Message {
    text: string;
    speaker: string;

    constructor(text: string, speaker: string) {
        this.text = text;
        this.speaker = speaker;
    }
}

export class Dialog implements Scriptable {
    messages: Message[] = [];
    current: Message;
    running: Writable<boolean>;

    constructor(messages: Message[]) {
        this.messages = messages;
        this.current = messages[0];
        this.running = writable(false);
    }

    next(): boolean {
        if (this.messages.indexOf(this.current) < this.messages.length - 1) {
            this.current = this.messages[this.messages.indexOf(this.current) + 1];
            return true;
        }
        this.running.set(false);
        return false;
    }

    play(context: WorldContext): any {
        this.running.set(true);
        context.dialog = this;
    }
}

