import {Position} from "../sprites/drawers";
import type {WorldContext} from "./context";
import type {Unsubscriber, Writable} from "svelte/store";
import {writable} from "svelte/store";

export abstract class Scriptable {
    running: Writable<boolean> = writable(false);
    type: string = 'scriptable';

    abstract play(context: WorldContext): any;
}

export class StepBack extends Scriptable {
    constructor() {
        super();
        this.type = 'StepBack';
    }

    play(context: WorldContext): any {
        context.player.moving = false;
        context.player.direction = context.player.direction === 'up' ? 'down' : context.player.direction === 'down' ? 'up' : context.player.direction === 'left' ? 'right' : 'left';

        this.running.set(false);
    }
}

export class Message {
    text: string;
    speaker: string;

    constructor(text: string, speaker: string) {
        this.text = text;
        this.speaker = speaker;
    }
}

export class Dialog extends Scriptable {
    messages: Message[] = [];
    current: Message;

    constructor(messages: Message[]) {
        super();
        this.type = 'Dialog';
        this.messages = messages;
        this.current = messages[0];
    }

    next(): boolean {
        if (this.messages.indexOf(this.current) < this.messages.length - 1) {
            this.current = this.messages[this.messages.indexOf(this.current) + 1];
            return true;
        } else {
            this.running.set(false);
            return false;
        }

    }

    play(context: WorldContext): any {
        this.current = this.messages[0];
        this.running.set(true);
    }
}


export class Script {
    triggerType: 'onEnter' | 'onStep';
    stepPosition?: Position;
    actions: Scriptable[];
    currentAction?: Scriptable;
    running: Writable<boolean>;

    replayable: boolean = false;
    played: boolean = false;

    actionSubscription: Unsubscriber | undefined;

    constructor(triggerType: 'onEnter' | 'onStep', actions: Scriptable[], stepPosition?: Position, replayable: boolean = false) {
        this.triggerType = triggerType;
        this.actions = actions;
        this.stepPosition = stepPosition;
        this.replayable = replayable;
        this.running = writable(false);
        this.setActionsPrototype();
    }

    setActionsPrototype() {
        this.actions = this.actions.map((action) => {
            switch (action.type) {
                case 'Dialog':
                    return new Dialog((action as Dialog).messages);
                case 'StepBack':
                    return new StepBack();
                default:
                    return action;
            }
        });
    }

    play(context: WorldContext, index: number = 0) {
        context.playingScript = this;
        this.running.set(true);
        this.currentAction = this.actions[index];
        
        if (this.currentAction) {
            this.currentAction.play(context);
            this.actionSubscription = this.currentAction.running.subscribe((running) => {
                if (!running && this.actionSubscription) {
                    this.actionSubscription();
                    this.play(context, index + 1);
                }
            });
        } else {
            this.played = true;
            this.running.set(false);
        }
    }

    stopCurrentAction() {
        this.currentAction?.running.set(false);
    }
}


