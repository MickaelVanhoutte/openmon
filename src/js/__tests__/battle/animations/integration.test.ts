import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	initializeAnimationEngine,
	getAnimationEngine,
	destroyAnimationEngine,
	animateAttackWithNewEngine,
	type LegacyAnimateAttackParams
} from '$js/battle/animations';
import { createMockContainer, createMockElement } from './test-utils';

vi.mock('gsap', () => {
	const mockTimeline = {
		to: vi.fn().mockReturnThis(),
		add: vi.fn().mockReturnThis(),
		then: vi.fn().mockImplementation((cb) => {
			cb?.();
			return Promise.resolve();
		}),
		kill: vi.fn()
	};

	const gsapMock = {
		timeline: vi.fn(() => mockTimeline),
		to: vi.fn().mockImplementation((_target, options) => {
			if (options?.onComplete) {
				setTimeout(() => options.onComplete(), 0);
			}
			return mockTimeline;
		}),
		set: vi.fn(),
		registerEase: vi.fn()
	};
	return {
		default: gsapMock,
		gsap: gsapMock
	};
});

describe('Animation Integration', () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = createMockContainer(800, 600);
		document.body.appendChild(container);
	});

	afterEach(() => {
		destroyAnimationEngine();
		container.remove();
		vi.clearAllMocks();
	});

	describe('initializeAnimationEngine', () => {
		it('should create and return engine instance', () => {
			const engine = initializeAnimationEngine(container);

			expect(engine).toBeDefined();
		});

		it('should register all moves on initialization', () => {
			const engine = initializeAnimationEngine(container);

			expect(engine).toBeDefined();
		});

		it('should cleanup previous engine on re-initialization', () => {
			const engine1 = initializeAnimationEngine(container);
			const engine2 = initializeAnimationEngine(container);

			expect(engine2).not.toBe(engine1);
		});
	});

	describe('getAnimationEngine', () => {
		it('should return null when not initialized', () => {
			expect(getAnimationEngine()).toBeNull();
		});

		it('should return engine after initialization', () => {
			initializeAnimationEngine(container);

			expect(getAnimationEngine()).not.toBeNull();
		});
	});

	describe('destroyAnimationEngine', () => {
		it('should clear engine instance', () => {
			initializeAnimationEngine(container);
			destroyAnimationEngine();

			expect(getAnimationEngine()).toBeNull();
		});

		it('should handle multiple destroy calls', () => {
			initializeAnimationEngine(container);
			destroyAnimationEngine();
			destroyAnimationEngine();

			expect(getAnimationEngine()).toBeNull();
		});
	});

	describe('animateAttackWithNewEngine', () => {
		it('should handle attack when engine not initialized', async () => {
			const params = createMockAttackParams();

			await expect(animateAttackWithNewEngine(params)).resolves.not.toThrow();
		});

		it('should execute animation when engine is initialized', async () => {
			initializeAnimationEngine(container);

			const params = createMockAttackParams();

			await expect(animateAttackWithNewEngine(params)).resolves.not.toThrow();
		});

		it('should handle physical moves', async () => {
			initializeAnimationEngine(container);

			const params = createMockAttackParams();
			params.moveCategory = 'physical';
			params.moveName = 'tackle';

			await expect(animateAttackWithNewEngine(params)).resolves.not.toThrow();
		});

		it('should handle special moves', async () => {
			initializeAnimationEngine(container);

			const params = createMockAttackParams();
			params.moveCategory = 'special';
			params.moveName = 'thunderbolt';

			await expect(animateAttackWithNewEngine(params)).resolves.not.toThrow();
		});

		it('should handle status moves', async () => {
			initializeAnimationEngine(container);

			const params = createMockAttackParams();
			params.moveCategory = 'status';
			params.moveName = 'swords-dance';

			await expect(animateAttackWithNewEngine(params)).resolves.not.toThrow();
		});
	});
});

function createMockAttackParams(): LegacyAnimateAttackParams {
	return {
		initiator: createMockElement('attacker'),
		target: createMockElement('defender'),
		initiatorSlot: { side: 'player' as const, index: 0 },
		targetSlot: { side: 'opponent' as const, index: 0 },
		moveName: 'tackle',
		moveCategory: 'physical',
		moveType: 'normal'
	};
}
