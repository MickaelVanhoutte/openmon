import {Position} from "../sprites/drawers";
import type {WorldContext} from "./context";
import type {Unsubscriber, Writable} from "svelte/store";
import {writable} from "svelte/store";
import type {NPC} from "../npc";

export abstract class Scriptable {
    type: string = 'scriptable';

    abstract play(context: WorldContext, onEnd: () => void): any;
}

export class StepBack extends Scriptable {
    constructor() {
        super();
        this.type = 'StepBack';
    }

    play(context: WorldContext, onEnd: () => void): any {
        context.player.moving = false;
        context.player.direction = context.player.direction === 'up' ? 'down' : context.player.direction === 'down' ? 'up' : context.player.direction === 'left' ? 'right' : 'left';

        setTimeout(() => {
            onEnd();
        }, 300);
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
    onEnd: () => void = () => {
    }

    constructor(messages: Message[]) {
        super();
        this.type = 'Dialog';
        this.messages = messages;
        this.current = messages[0];
    }

    next(): string | undefined {
        if (this.messages.indexOf(this.current) < this.messages.length - 1) {
            this.current = this.messages[this.messages.indexOf(this.current) + 1];
            return this.current.text;
        } else {
            console.log('end of dialog', this);
            this.onEnd();
            return;
        }

    }

    play(context: WorldContext, onEnd: () => void): any {
        this.onEnd = onEnd;
        this.current = this.messages[0];
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

    play(context: WorldContext, onEnd: () => void): any {
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
                onEnd();
            }, 300);
        } else {
            onEnd();
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

    play(context: WorldContext, onEnd: () => void): any {
        context.player.bag.addItems(this.itemId, this.qty);
        setTimeout(() => {
            console.log('end of give item', this);
            onEnd();
        }, 300);
    }
}

export class Script {
    triggerType: 'onEnter' | 'onStep' | 'onInteract';
    stepPosition?: Position;
    actions: Scriptable[];
    onEnd: () => void = () => {
    };
    currentAction?: Scriptable;

    replayable: boolean = false;
    played: boolean = false;

    actionSubscription: Unsubscriber | undefined;

    constructor(triggerType: 'onEnter' | 'onStep' | 'onInteract', actions: Scriptable[], stepPosition?: Position, replayable: boolean = false) {
        this.triggerType = triggerType;
        this.actions = actions;
        this.stepPosition = stepPosition;
        this.replayable = replayable;
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
        this.currentAction = this.actions[index];
        console.log(this.currentAction);
        if (this.currentAction) {
            this.currentAction.play(context, () => {
                console.log('playing next action');
                this.play(context, index + 1);
            });
        } else {
            console.log('end of script');
            this.played = true;
            this.onEnd();
        }
    }
}


