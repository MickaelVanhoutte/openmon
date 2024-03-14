import type {NPC} from "../characters/npc";
import {Position} from "../mapping/positions";
import type {GameContext} from "../context/gameContext";

export abstract class Scriptable {
    type: string = 'scriptable';
    finished: boolean = false;
    canceled: boolean = false;

    abstract play(context: GameContext, onEnd: () => void): any;
}

export class StepBack extends Scriptable {
    constructor() {
        super();
        this.type = 'StepBack';
    }

    play(context: GameContext, onEnd: () => void): any {
        context.player.moving = false;
        context.player.position.direction = context.player.position.direction === 'up' ? 'down' : context.player.position.direction === 'down' ? 'up' : context.player.position.direction === 'left' ? 'right' : 'left';

        setTimeout(() => {
            this.finished = true;
            onEnd();
        }, 300);
    }
}

export class Message {
    text: string;
    speaker: string;

    constructor(text: string, speaker?: string) {
        this.text = text;
        this.speaker = speaker || 'System';
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
            this.finished = true;
            this.onEnd();
            return;
        }

    }

    play(context: GameContext, onEnd: () => void): any {
        this.onEnd = onEnd;
        this.current = this.messages[0];
    }
}


export class MoveTo extends Scriptable {
    npcId: number;
    position: Position;

    constructor(npcId: number, position: Position) {
        super();
        this.type = 'MoveTo';
        this.npcId = npcId;
        this.position = position;
    }

    play(context: GameContext, onEnd: () => void): any {
        let npc = context.map?.npcs?.find(npc => npc.id === this.npcId);
        if (npc) {
            npc.moving = true;
            npc.direction = npc.position.positionOnMap.x > this.position.x ? 'left' : npc.position.positionOnMap.x < this.position.x ? 'right' : npc.position.positionOnMap.y > this.position.y ? 'up' : 'down';

            if (this.moveAllowed(context, this.position)) {
                npc.position.targetPosition = this.position;

                this.waitMvtEnds(context, npc, onEnd);
            } else {
                this.waitUntilAllowed(context, npc, onEnd);
            }

        } else {
            this.finished = true;
            onEnd();
        }
    }

    private moveAllowed(context: GameContext, futurePosition: Position) {
        return !context.map?.hasBoundaryAt(futurePosition) &&
            !context.map?.npcAt(futurePosition) &&
            !(context.player.position.positionOnMap.x === futurePosition.x &&
                context.player.position.positionOnMap.y === futurePosition.y) &&
            !context?.followerAt(futurePosition);
    }

    private waitMvtEnds(context: GameContext, npc: NPC, onEnd: () => void) {
        let unsubscribe = setInterval(() => {
            if (npc && npc.position.positionOnMap.x === npc.position.targetPosition.x && npc.position.positionOnMap.y === npc.position.targetPosition.y) {
                clearInterval(unsubscribe);
                npc.moving = false;
                this.finished = true;
                onEnd();
            }
        }, 200);
    }

    private waitUntilAllowed(context: GameContext, npc: NPC, onEnd: () => void) {
        let retry = setInterval(() => {
            if (this.canceled) {
                clearInterval(retry);
                onEnd();
            }

            if (this.moveAllowed(context, this.position) && npc) {
                clearInterval(retry)
                npc.position.targetPosition = this.position;
                this.waitMvtEnds(context, npc, onEnd);
            }
        }, 200);
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

    play(context: GameContext, onEnd: () => void): any {
        context.player.bag.addItems(this.itemId, this.qty, context);
        setTimeout(() => {
            this.finished = true;
            onEnd();
        }, 300);
    }
}

export class MoveToPlayer extends Scriptable {
    npcId: number;


    constructor(npcId: number) {
        super();
        this.type = 'MoveToPlayer';
        this.npcId = npcId;
    }

    play(context: GameContext, onEnd: () => void): any {
        let npc = context.map?.npcs?.find(npc => npc.id === this.npcId);
        let playerPosition = context.player.position.positionOnMap;
        if (npc && playerPosition) {
            npc.moving = true;
            npc.direction = npc.position.positionOnMap.x > playerPosition.x ? 'left' : npc.position.positionOnMap.x < playerPosition.x ? 'right' : npc.position.positionOnMap.y > playerPosition.y ? 'up' : 'down';

            // should move to the case before the player, depending the direction
            let futurePosition: Position;
            switch (npc.direction) {
                case 'up':
                    futurePosition = new Position(playerPosition.x, playerPosition.y + 1);
                    break;
                case 'down':
                    futurePosition = new Position(playerPosition.x, playerPosition.y - 1);
                    break;
                case 'left':
                    futurePosition = new Position(playerPosition.x + 1, playerPosition.y);
                    break;
                case 'right':
                    futurePosition = new Position(playerPosition.x - 1, playerPosition.y);
                    break;
            }

            npc.position.targetPosition = futurePosition;
            this.waitMvtEnds(context, npc, onEnd);
        } else {
            this.finished = true;
            onEnd();
        }
    }

    private waitMvtEnds(context: GameContext, npc: NPC, onEnd: () => void) {
        let unsubscribe = setInterval(() => {
            if (npc && npc.position.positionOnMap.x === npc.position.targetPosition.x && npc.position.positionOnMap.y === npc.position.targetPosition.y) {
                clearInterval(unsubscribe);
                npc.moving = false;
                this.finished = true;
                onEnd();
            }
        }, 200);
    }
}

export class StartBattle extends Scriptable {

    npcId: number;

    constructor(npcId: number) {
        super();
        this.type = 'StartBattle';
        this.npcId = npcId;
    }

    play(context: GameContext, onEnd: () => void): any {
        let npc = context.map?.npcs?.find(npc => npc.id === this.npcId);
        if (npc) {

            context.startBattle(npc);
        }
        this.finished = true;
        onEnd();
    }
}

export class Script {
    triggerType: 'onEnter' | 'onStep' | 'onInteract' | 'onSight' | 'onGameStart';
    stepPosition?: Position;
    actions: Scriptable[];
    onEnd: () => void = () => {
    };
    currentAction?: Scriptable;

    replayable: boolean = false;
    played: boolean = false;

    playing: boolean = false;


    constructor(triggerType: 'onEnter' | 'onStep' | 'onInteract' | 'onSight' | 'onGameStart', actions: Scriptable[], stepPosition?: Position, replayable: boolean = false) {
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
                case 'MoveTo':
                    return new MoveTo((action as MoveTo).npcId, (action as MoveTo).position);
                case 'GiveItem':
                    return new GiveItem((action as GiveItem).itemId, (action as GiveItem).qty);
                case 'StartBattle':
                    return new StartBattle((action as StartBattle).npcId);
                case 'MoveToPlayer':
                    return new MoveToPlayer((action as MoveToPlayer).npcId);
                default:
                    return action;
            }
        });
    }

    start(context: GameContext) {
        this.playing = true;
        this.play(context);
    }

    play(context: GameContext, index: number = 0) {
        if (this.playing) {
            this.currentAction = this.actions[index];

            if (this.currentAction) {
                this.currentAction.finished = false;
                this.currentAction.canceled = false;
                this.currentAction.play(context, () => {
                    this.play(context, index + 1);
                });
            } else {
                if (this.replayable && this.triggerType === 'onEnter') {
                    this.play(context, 0);
                } else {
                    this.played = true;
                    this.onEnd();
                }
            }
        }
    }

    interrupt(): Script {
        if (this.currentAction) this.currentAction.canceled = true;
        this.playing = false;
        return this;
    }

    resume(context: GameContext) {
        if (!this.currentAction?.finished) {
            this.playing = true;
            this.play(context, this.actions.indexOf(this.currentAction as Scriptable));
        } else {
            this.playing = true;
            this.play(context, this.actions.indexOf(this.currentAction as Scriptable) + 1);
        }
    }
}


