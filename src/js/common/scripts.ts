import {Position} from "../sprites/drawers";
import type {WorldContext} from "./context";
import type {Unsubscriber, Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {NPC} from "../npc";

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

export class Move extends Scriptable {
    npcId: number;
    direction: 'up' | 'down' | 'left' | 'right';

    constructor(npcId: number, direction: 'up' | 'down' | 'left' | 'right') {
        super();
        this.type = 'Move';
        this.npcId = npcId;
        this.direction = direction;
    }

    play(context: WorldContext): any {
        let npc = context.map?.npcs?.find(npc => npc.id === this.npcId);
        if (npc) {
            npc.moving = true;
            npc.direction = this.direction;

            switch (this.direction) {
                case 'up':
                    npc.position.y -= 1;
                    break;
                case 'down':
                    npc.position.y += 1;
                    break;
                case 'left':
                    npc.position.x -= 1;
                    break;
                case 'right':
                    npc.position.x += 1;
                    break;
            }

            setTimeout(() => {
                if (npc) {
                    npc.moving = false;
                }
            }, 300);
        }
    }
}

export class GiveItem extends Scriptable {
    itemId: number;
    qty: number;

    constructor(itemId: number, qty: number = 1) {
        super();
        this.type = 'GiveItem';
        this.itemId = itemId;
        this.qty = qty;
    }

    play(context: WorldContext): any {
        context.player.bag.addItems(this.itemId, this.qty);
    }
}

export class Script {
    triggerType: 'onEnter' | 'onStep' | 'onInteract';
    stepPosition?: Position;
    actions: Scriptable[];
    currentAction?: Scriptable;
    running: Writable<boolean>;

    replayable: boolean = false;
    played: boolean = false;

    actionSubscription: Unsubscriber | undefined;

    constructor(triggerType: 'onEnter' | 'onStep' | 'onInteract', actions: Scriptable[], stepPosition?: Position, replayable: boolean = false) {
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
                    case 'Move':
                    return new Move((action as Move).npcId, (action as Move).direction);
                case 'GiveItem':
                    return new GiveItem((action as GiveItem).itemId, (action as GiveItem).qty);
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
            context.playingScript = undefined;
        }
    }

    stopCurrentAction() {
        this.currentAction?.running.set(false);
    }
}


