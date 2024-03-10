import type {ActionV2Interface} from "./actions-model";

export class ActionStack {
    stack: ActionV2Interface[] = [];
    current: ActionV2Interface | undefined;

    push(action: ActionV2Interface) {
        this.stack.push(action);
    }

    pop(): ActionV2Interface | undefined {
        this.current = this.stack.pop();
        return this.current;
    }

    clear() {
        this.stack = [];
    }

    isEmpty() {
        return this.stack.length === 0;
    }
}