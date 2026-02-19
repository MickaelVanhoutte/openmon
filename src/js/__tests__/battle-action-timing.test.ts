import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionType, type ActionV2Interface } from '../battle/actions/actions-model';

vi.mock('../sprites/pmd-sprite-data', () => ({
	loadSpriteAnchors: vi.fn(() => Promise.resolve({})),
	getSpriteAnchor: vi.fn(() => null),
	inferPMDSpriteInfo: vi.fn(),
	getPMDSpriteInfoFromAnimData: vi.fn(),
	getPMDSpritePath: vi.fn()
}));

import { BattleContext } from '../context/battleContext';
import {
	PlayAnimation,
	PlayStatChange,
	PlayWeatherChange,
	Message
} from '../battle/actions/actions-derived';
import { createTestPokemon } from './abilities/test-helpers';
import { Weather } from '../battle/battle-field';

function createBattleContext(): BattleContext {
	const pokemon = createTestPokemon({ name: 'Ally', speed: 100 });
	const opponent = createTestPokemon({ name: 'Foe', speed: 80 });
	const mockPlayer = { monsters: [pokemon] } as any;
	const mockOpponent = { monsters: [opponent] } as any;
	const mockSettings = {} as any;
	const ctx = new BattleContext(mockPlayer, mockOpponent, mockSettings);
	ctx.actionStack.clear();
	return ctx;
}

function createMockAction(
	type: ActionType,
	description: string,
	needsSignal = false
): ActionV2Interface {
	const action: any = {
		type,
		description,
		initiator: createTestPokemon({ name: 'Mock' }),
		execute: vi.fn()
	};
	if (needsSignal) {
		action.needsCompletionSignal = true;
	}
	return action as ActionV2Interface;
}

describe('Action Completion Signaling', () => {
	let ctx: BattleContext;

	beforeEach(() => {
		vi.useFakeTimers();
		ctx = createBattleContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('waitForActionCompletion resolves when signalActionComplete is called', async () => {
		const promise = ctx.waitForActionCompletion(5000);

		let resolved = false;
		promise.then(() => {
			resolved = true;
		});

		await Promise.resolve();
		expect(resolved).toBe(false);

		ctx.signalActionComplete();
		await Promise.resolve();
		await Promise.resolve();
		expect(resolved).toBe(true);
	});

	it('waitForActionCompletion resolves via timeout when signal not called', async () => {
		const promise = ctx.waitForActionCompletion(100);

		let resolved = false;
		promise.then(() => {
			resolved = true;
		});

		await Promise.resolve();
		expect(resolved).toBe(false);

		await vi.advanceTimersByTimeAsync(100);
		expect(resolved).toBe(true);
	});

	it('signalActionComplete clears the resolve function', async () => {
		const promise = ctx.waitForActionCompletion(5000);

		ctx.signalActionComplete();
		await promise;

		expect(() => ctx.signalActionComplete()).not.toThrow();
	});

	it('signal resolves faster than fallback timeout', async () => {
		const start = Date.now();
		const promise = ctx.waitForActionCompletion(5000);

		await vi.advanceTimersByTimeAsync(10);
		ctx.signalActionComplete();
		await promise;

		expect(Date.now() - start).toBeLessThan(5000);
	});
});

describe('getActionDuration (via private access)', () => {
	let ctx: BattleContext;

	beforeEach(() => {
		vi.useFakeTimers();
		ctx = createBattleContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const durationCases: [ActionType, number][] = [
		[ActionType.ATTACK, 1600],
		[ActionType.SWITCH, 2000],
		[ActionType.MESSAGE, 1000],
		[ActionType.XP_WIN, 500],
		[ActionType.LEVEL_UP, 1000],
		[ActionType.PLAY_ANIMATION, 2000],
		[ActionType.STAT_CHANGE, 1500],
		[ActionType.WEATHER_CHANGE, 1000]
	];

	it.each(durationCases)('returns %i ms for %s', (actionType, expected) => {
		const result = (ctx as any).getActionDuration(actionType);
		expect(result).toBe(expected);
	});

	it('returns 800 for unknown action types', () => {
		const result = (ctx as any).getActionDuration('UNKNOWN_TYPE');
		expect(result).toBe(800);
	});

	it('returns 800 for REMOVE_HP (not explicitly listed)', () => {
		const result = (ctx as any).getActionDuration(ActionType.REMOVE_HP);
		expect(result).toBe(800);
	});
});

describe('hasCompletionSignal', () => {
	let ctx: BattleContext;
	const pokemon = createTestPokemon({ name: 'Test' });
	const move = { name: 'Tackle', type: 'normal', power: 40, target: 'selected-pokemon' } as any;

	beforeEach(() => {
		vi.useFakeTimers();
		ctx = createBattleContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns true for PlayAnimation actions', () => {
		const action = new PlayAnimation(move, pokemon, pokemon);
		expect((ctx as any).hasCompletionSignal(action)).toBe(true);
	});

	it('returns true for PlayStatChange actions', () => {
		const action = new PlayStatChange(pokemon, 'attack', 1, pokemon);
		expect((ctx as any).hasCompletionSignal(action)).toBe(true);
	});

	it('returns true for PlayWeatherChange actions', () => {
		const action = new PlayWeatherChange(Weather.RAIN, pokemon);
		expect((ctx as any).hasCompletionSignal(action)).toBe(true);
	});

	it('returns false for Message (no needsCompletionSignal)', () => {
		const action = new Message('Hello', pokemon);
		expect((ctx as any).hasCompletionSignal(action)).toBe(false);
	});

	it('returns false for generic actions without needsCompletionSignal', () => {
		const action = createMockAction(ActionType.ATTACK, 'Attack');
		expect((ctx as any).hasCompletionSignal(action)).toBe(false);
	});

	it('returns false when needsCompletionSignal is false', () => {
		const action: any = createMockAction(ActionType.PLAY_ANIMATION, 'Anim');
		action.needsCompletionSignal = false;
		expect((ctx as any).hasCompletionSignal(action)).toBe(false);
	});
});

describe('executeAction dynamic timing', () => {
	let ctx: BattleContext;

	beforeEach(() => {
		vi.useFakeTimers();
		ctx = createBattleContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('uses waitForActionCompletion for actions with needsCompletionSignal', async () => {
		const waitSpy = vi.spyOn(ctx, 'waitForActionCompletion');
		const action = createMockAction(ActionType.PLAY_ANIMATION, 'Anim', true);

		ctx.executeAction(action);

		expect(waitSpy).toHaveBeenCalledWith(2000);

		ctx.signalActionComplete();
		await vi.advanceTimersByTimeAsync(0);
	});

	it('uses sleep for actions without needsCompletionSignal', async () => {
		const sleepSpy = vi.spyOn(ctx, 'sleep');
		const waitSpy = vi.spyOn(ctx, 'waitForActionCompletion');
		const action = createMockAction(ActionType.MESSAGE, 'Hello');

		ctx.executeAction(action);

		expect(waitSpy).not.toHaveBeenCalled();
		expect(sleepSpy).toHaveBeenCalledWith(1000);

		await vi.advanceTimersByTimeAsync(1000);
	});

	it('calls action.execute with the context', async () => {
		const action = createMockAction(ActionType.MESSAGE, 'Test');

		ctx.executeAction(action);
		expect(action.execute).toHaveBeenCalledWith(ctx);

		await vi.advanceTimersByTimeAsync(1000);
	});

	it('pops next action from stack after completion', async () => {
		const action1 = createMockAction(ActionType.MESSAGE, 'First');
		const action2 = createMockAction(ActionType.MESSAGE, 'Second');

		ctx.actionStack.push(action2);
		ctx.executeAction(action1);

		expect(action1.execute).toHaveBeenCalled();
		expect(action2.execute).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1000);
		expect(action2.execute).toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1000);
	});

	it('signal-based action completes before fallback timeout', async () => {
		const action = createMockAction(ActionType.PLAY_ANIMATION, 'Anim', true);
		const next = createMockAction(ActionType.MESSAGE, 'Next');

		ctx.actionStack.push(next);
		ctx.executeAction(action);

		ctx.signalActionComplete();
		await vi.advanceTimersByTimeAsync(0);
		await Promise.resolve();
		await Promise.resolve();

		expect(next.execute).toHaveBeenCalled();
	});

	it('handles undefined action gracefully (no more actions)', () => {
		const prepareSpy = vi.spyOn(ctx as any, 'prepareNewTurn');
		ctx.executeAction(undefined);
		expect(prepareSpy).toHaveBeenCalled();
	});
});

describe('executeActionSequential dynamic timing', () => {
	let ctx: BattleContext;

	beforeEach(() => {
		vi.useFakeTimers();
		ctx = createBattleContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('uses waitForActionCompletion for signal-based actions', async () => {
		const waitSpy = vi.spyOn(ctx, 'waitForActionCompletion');
		const action = createMockAction(ActionType.PLAY_ANIMATION, 'Anim', true);

		const promise = ctx.executeActionSequential(action);

		expect(waitSpy).toHaveBeenCalledWith(2000);
		expect(action.execute).toHaveBeenCalledWith(ctx);

		ctx.signalActionComplete();
		await promise;
	});

	it('uses sleep for non-signal actions', async () => {
		const sleepSpy = vi.spyOn(ctx, 'sleep');
		const waitSpy = vi.spyOn(ctx, 'waitForActionCompletion');
		const action = createMockAction(ActionType.MESSAGE, 'Hello');

		const promise = ctx.executeActionSequential(action);

		expect(waitSpy).not.toHaveBeenCalled();
		expect(sleepSpy).toHaveBeenCalledWith(1000);

		await vi.advanceTimersByTimeAsync(1000);
		await promise;
	});

	it('resolves immediately for undefined action', async () => {
		const result = ctx.executeActionSequential(undefined);
		await expect(result).resolves.toBeUndefined();
	});

	it('awaits completion before returning (sequential guarantee)', async () => {
		const action = createMockAction(ActionType.MESSAGE, 'Msg');
		let resolved = false;

		const promise = ctx.executeActionSequential(action);
		promise.then(() => {
			resolved = true;
		});

		await Promise.resolve();
		expect(resolved).toBe(false);

		await vi.advanceTimersByTimeAsync(1000);
		expect(resolved).toBe(true);
	});

	it('sets currentAction before executing', async () => {
		const action = createMockAction(ActionType.XP_WIN, 'XP');
		const spy = vi.fn();
		ctx.currentAction.subscribe(spy);
		spy.mockClear();

		const promise = ctx.executeActionSequential(action);

		expect(spy).toHaveBeenCalledWith(action);

		await vi.advanceTimersByTimeAsync(500);
		await promise;
	});
});
