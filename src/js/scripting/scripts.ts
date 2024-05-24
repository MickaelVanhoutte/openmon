import type { NPC } from "../characters/npc";
import { Position } from "../mapping/positions";
import type { GameContext } from "../context/gameContext";
import { on } from "@svgdotjs/svg.js";

export abstract class Scriptable {
    type: string = 'scriptable';
    finished: boolean = false;
    canceled: boolean = false;
    conditionIndex: number = -1;
    selectedOption: number = -1;

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

    options: string[];

    constructor(text: string, speaker?: string, options?: string[]) {
        this.text = text;
        this.speaker = speaker || 'System';
        this.options = options || [];
    }
}


export class OpenShop extends Scriptable {
    // ID, price
    items: Record<string, number> = {};
    context?: GameContext;
    onEnd: () => void = () => {
    }

    constructor(items: Record<string, number>, conditionIndex: number = -1) {
        super();
        this.type = 'OpenShop';
        this.items = items;
        this.conditionIndex = conditionIndex;
    }

    close() {
        this.finished = true;
        this.onEnd();
    }

    buyItem(itemId: string, qty: number) {
        let price = this.items[itemId] * qty;
        if (this.context && this.context.player.bag.money >= price) {
            this.context.player.bag.addItems(parseInt(itemId), qty, this.context.ITEMS);
            this.context.player.bag.money -= price;
        }
    }

    play(context: GameContext, onEnd: () => void) {
        this.onEnd = onEnd;
        this.context = context;
    }
}

export class Dialog extends Scriptable {
    messages: Message[] = [];
    current: Message;
    onEnd: () => void = () => {
    }

    constructor(messages: Message[], conditionIndex: number = -1) {
        super();
        this.type = 'Dialog';
        this.messages = messages;
        this.current = messages[0];
        this.conditionIndex = conditionIndex;
    }

    next(): Message | undefined {
        if (this.messages.indexOf(this.current) < this.messages.length - 1) {
            this.current = this.messages[this.messages.indexOf(this.current) + 1];
            return this.current;
        } else {
            this.finished = true;
            this.onEnd();
            return;
        }
    }

    selectOption(index: number): void {
        if (this.current.options?.length === 0 || index > this.current.options?.length) return;
        this.selectedOption = index;
    }

    play(context: GameContext, onEnd: () => void): any {
        this.onEnd = onEnd;
        this.current = this.messages[0];
    }
}

export class HealAll extends Scriptable {
    constructor(conditionIndex: number = -1) {
        super();
        this.type = 'HealAll';
        this.conditionIndex = conditionIndex;
    }

    play(context: GameContext, onEnd: () => void): any {
        context.player.monsters.forEach(monster => {
            monster.fullHeal();
        });
        // TODO animate
        setTimeout(() => {
            this.finished = true;
            onEnd();
        }, 2000);
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
                npc.position.setFuturePosition(this.position.x, this.position.y, () => {
                    npc.moving = false;
                    this.finished = true;
                    onEnd();
                });
            } else {
                if (context.checkForInSightNpc(npc.id)) {
                    this.finished = true;
                    onEnd();
                    context.playScript(npc.mainScript);
                } else {
                    this.waitUntilAllowed(context, npc, onEnd);
                }
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
            } else {
                this.waitUntilAllowed(context, npc, onEnd);
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
        context.player.bag.addItems(this.itemId, this.qty, context.ITEMS);
        setTimeout(() => {
            this.finished = true;
            onEnd();
        }, 300);
    }
}

export class GiveMoney extends Scriptable {
    qty: number;

    constructor(qty: number) {
        super();
        this.type = 'GiveMoney';
        this.qty = qty;
    }

    play(context: GameContext, onEnd: () => void): any {
        context.player.bag.money += this.qty;
        this.finished = true;
        onEnd();
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

            npc.position.setFuturePosition(futurePosition.x, futurePosition.y, () => {
                npc.moving = false;
                this.finished = true;
                onEnd();
            });

        } else {
            this.finished = true;
            onEnd();
        }
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
            context.startBattle(npc, () => {
                this.finished = true;
                onEnd();

            });
        } else {
            this.finished = true;
            onEnd();
        }
    }
}

export class Script {
    triggerType: 'onEnter' | 'onStep' | 'onInteract' | 'onInteract2' | 'onSight' | 'onGameStart';
    stepPosition?: Position;
    actions: Scriptable[];
    onEnd: () => void = () => {
    };
    currentAction?: Scriptable;

    replayable: boolean = false;
    played: boolean = false;

    playing: boolean = false;


    constructor(triggerType: 'onEnter' | 'onStep' | 'onInteract' | 'onInteract2' | 'onSight' | 'onGameStart', actions: Scriptable[], stepPosition?: Position, replayable: boolean = false) {
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
                    return new Dialog((action as Dialog).messages, (action as Dialog).conditionIndex);
                case 'OpenShop':
                    return new OpenShop((action as OpenShop).items);
                case 'HealAll':
                    return new HealAll((action as HealAll).conditionIndex);
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

    start(context: GameContext, pause: boolean = true) {
        console.log('start script', this.actions)
        this.playing = true;
        this.play(context, 0, pause);
    }

    play(context: GameContext, index: number = 0, pause: boolean = true) {
        if (this.playing) {
            context.overWorldContext.setPaused(pause, 'script', this);
            if (this.currentAction && this.currentAction.selectedOption > 0) {
                this.currentAction.selectedOption = -1;
                // find next action with matching conditionIndex
                const nextActionIndex = this.actions.findIndex((action, i) => i > index && action.conditionIndex === this.currentAction?.selectedOption);
                if (nextActionIndex !== -1) {
                    this.currentAction = this.actions[nextActionIndex];
                } else {
                    // Handle case when no action with matching conditionIndex is found
                    this.played = true;
                    context.overWorldContext.setPaused(false, 'script', this);
                    this.onEnd();
                }
            } else {
                this.currentAction = this.actions[index];
            }

            if (this.currentAction) {
                this.currentAction.finished = false;
                this.currentAction.canceled = false;
                this.currentAction.play(context, () => {
                    this.play(context, index + 1, pause);
                });
            } else {
                if (this.replayable && this.triggerType === 'onEnter') {
                    this.play(context, 0, pause);
                } else {
                    this.played = true;
                    context.overWorldContext.setPaused(false, 'script', this);
                    this.onEnd();
                }
            }
        }
    }

    nextAction(context: GameContext) {
        if (this.currentAction) {
            this.currentAction.finished = false;
            this.currentAction.canceled = false;
            this.play(context, this.actions.indexOf(this.currentAction as Scriptable) + 1);
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


