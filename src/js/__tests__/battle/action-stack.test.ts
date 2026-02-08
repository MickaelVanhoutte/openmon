import { describe, it, expect, vi } from 'vitest';
import { ActionStack } from '../../battle/actions/action-stack';
import { ActionType, type ActionV2Interface } from '../../battle/actions/actions-model';

describe('ActionStack', () => {
	const createMockAction = (description: string): ActionV2Interface => ({
		type: ActionType.MESSAGE,
		description,
		initiator: {} as any,
		execute: vi.fn()
	});

	it('should initialize with an empty stack', () => {
		const actionStack = new ActionStack();
		expect(actionStack.isEmpty()).toBe(true);
		expect(actionStack.stack).toEqual([]);
		expect(actionStack.current).toBeUndefined();
	});

	it('should push actions onto the stack', () => {
		const actionStack = new ActionStack();
		const action = createMockAction('Test Action');

		actionStack.push(action);

		expect(actionStack.isEmpty()).toBe(false);
		expect(actionStack.stack.length).toBe(1);
		expect(actionStack.stack[0]).toBe(action);
	});

	it('should pop actions from the stack and set current', () => {
		const actionStack = new ActionStack();
		const action = createMockAction('Test Action');
		actionStack.push(action);

		const poppedAction = actionStack.pop();

		expect(poppedAction).toBe(action);
		expect(actionStack.current).toBe(action);
		expect(actionStack.isEmpty()).toBe(true);
	});

	it('should handle pop on an empty stack', () => {
		const actionStack = new ActionStack();

		const poppedAction = actionStack.pop();

		expect(poppedAction).toBeUndefined();
		expect(actionStack.current).toBeUndefined();
		expect(actionStack.isEmpty()).toBe(true);
	});

	it('should follow LIFO (Last-In, First-Out) order', () => {
		const actionStack = new ActionStack();
		const action1 = createMockAction('Action 1');
		const action2 = createMockAction('Action 2');

		actionStack.push(action1);
		actionStack.push(action2);

		expect(actionStack.pop()).toBe(action2);
		expect(actionStack.current).toBe(action2);

		expect(actionStack.pop()).toBe(action1);
		expect(actionStack.current).toBe(action1);

		expect(actionStack.isEmpty()).toBe(true);
	});

	it('should clear the stack', () => {
		const actionStack = new ActionStack();
		actionStack.push(createMockAction('Action 1'));
		actionStack.push(createMockAction('Action 2'));

		actionStack.clear();

		expect(actionStack.isEmpty()).toBe(true);
		expect(actionStack.stack.length).toBe(0);
	});

	it('should return correct value for isEmpty', () => {
		const actionStack = new ActionStack();
		expect(actionStack.isEmpty()).toBe(true);

		actionStack.push(createMockAction('Action 1'));
		expect(actionStack.isEmpty()).toBe(false);

		actionStack.pop();
		expect(actionStack.isEmpty()).toBe(true);
	});
});
