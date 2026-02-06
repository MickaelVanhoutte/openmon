import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../sprites/pmd-sprite-data', () => ({
	loadSpriteAnchors: vi.fn(() => Promise.resolve({})),
	getSpriteAnchor: vi.fn(() => null),
	inferPMDSpriteInfo: vi.fn(),
	getPMDSpriteInfoFromAnimData: vi.fn(),
	getPMDSpritePath: vi.fn()
}));

import { BattleContext } from '../../context/battleContext';
import { Message } from '../../battle/actions/actions-derived';
import { createTestPokemon } from '../abilities/test-helpers';

describe('BattleContext - Initial Ability Actions Race Condition', () => {
	let context: BattleContext;
	let pokemon: any;
	let opponent: any;

	beforeEach(() => {
		vi.useFakeTimers();
		pokemon = createTestPokemon({ name: 'Ally', speed: 100 });
		opponent = createTestPokemon({ name: 'Opponent', speed: 80 });

		const mockPlayer = { monsters: [pokemon] } as any;
		const mockOpponent = { monsters: [opponent] } as any;
		const mockSettings = {} as any;

		context = new BattleContext(mockPlayer, mockOpponent, mockSettings);
		context.actionStack.clear();
	});

	it('processInitialAbilityActions should wait for actions to complete', async () => {
		// Add a message action (takes 1000ms by default in executeAction)
		context.actionStack.push(new Message('Drizzle activated!', pokemon));

		const processPromise = context.processInitialAbilityActions();

		let resolved = false;
		processPromise.then(() => {
			resolved = true;
		});

		// Flush microtasks
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		// BUG: Because executeAction returns void, the await in processInitialAbilityActions
		// doesn't actually wait for the action chain to finish.
		expect(resolved).toBe(false);

		await vi.advanceTimersByTimeAsync(1000);
		expect(resolved).toBe(true);
	});

	it('should not overwrite multiple initial ability actions', async () => {
		// Scenario: Both Pokemon have weather abilities (e.g. Drizzle vs Sand Stream)
		const msg1 = new Message('Drizzle activated!', pokemon);
		const msg2 = new Message('Sand Stream activated!', opponent);

		context.actionStack.push(msg1);
		context.actionStack.push(msg2);

		const currentActionSpy = vi.fn();
		context.currentAction.subscribe(currentActionSpy);
		currentActionSpy.mockClear();

		const processPromise = context.processInitialAbilityActions();

		// BUG: processInitialAbilityActions loop pops all actions and calls executeAction for each
		// without waiting. This causes currentAction to be overwritten immediately.
		expect(currentActionSpy).toHaveBeenCalledTimes(1);
		expect(currentActionSpy).toHaveBeenLastCalledWith(msg2);

		await vi.advanceTimersByTimeAsync(1000);
		expect(currentActionSpy).toHaveBeenCalledTimes(2);
		expect(currentActionSpy).toHaveBeenLastCalledWith(msg1);

		await vi.advanceTimersByTimeAsync(1000);
		await processPromise;
	});

	it('should not call prepareNewTurn until all initial actions are finished', async () => {
		const prepareSpy = vi.spyOn(context as any, 'prepareNewTurn');
		context.actionStack.push(new Message('Weather message 1', pokemon));
		context.actionStack.push(new Message('Weather message 2', opponent));

		const processPromise = context.processInitialAbilityActions();

		// BUG: If multiple actions were present, or due to the lack of await,
		// prepareNewTurn might be triggered prematurely by the first action chain finishing
		// while others are still "running" or being overwritten.
		expect(prepareSpy).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1000);
		expect(prepareSpy).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1000);
		expect(prepareSpy).toHaveBeenCalled();
		await processPromise;
	});
});
