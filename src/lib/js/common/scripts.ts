import {Position} from "../sprites/drawers";
import type {WorldContext} from "./context";
import type {Writable} from "svelte/store";

export interface Scriptable {
    running: Writable<boolean>;

    play(context: WorldContext): any;
}

export class Script {
    triggerType: 'onEnter' | 'onLeave' | 'onStep';
    stepPosition?: Position;

    actions: Scriptable[];
    currentAction: Scriptable;

    context: WorldContext;

    constructor(context: WorldContext, triggerType: 'onEnter' | 'onLeave' | 'onStep', actions: Scriptable[], stepPosition?: Position) {
        this.context = context;
        this.triggerType = triggerType;
        this.actions = actions;
        this.stepPosition = stepPosition;
        this.currentAction = actions[0];
    }

    play() {
        this.currentAction.play(this.context);
       /* setInterval(() => {
            if(!this.currentAction.running) {
                if(this.actions.indexOf(this.currentAction) < this.actions.length - 1) {
                    this.currentAction = this.actions[this.actions.indexOf(this.currentAction) + 1];
                }
            }
        }, 100);*/
    };
}
