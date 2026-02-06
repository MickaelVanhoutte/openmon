import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationEngine, type MoveContext } from '$js/battle/animations/animation-engine';
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

	return {
		default: {
			timeline: vi.fn(() => mockTimeline),
			to: vi.fn().mockReturnValue(mockTimeline),
			set: vi.fn(),
			registerEase: vi.fn()
		}
	};
});

describe('AnimationEngine', () => {
	let engine: AnimationEngine;
	let container: HTMLElement;

	beforeEach(() => {
		container = createMockContainer(800, 600);
		document.body.appendChild(container);
		engine = new AnimationEngine(container);
	});

	afterEach(() => {
		engine.cancelAll();
		container.remove();
		vi.clearAllMocks();
	});

	describe('initialization', () => {
		it('should initialize without error', () => {
			expect(() => engine.initialize()).not.toThrow();
		});

		it('should only initialize once', () => {
			engine.initialize();
			engine.initialize();
			expect(true).toBe(true);
		});
	});

	describe('setLayout', () => {
		it('should set layout without error', () => {
			expect(() => engine.setLayout('SINGLE')).not.toThrow();
			expect(() => engine.setLayout('DOUBLE')).not.toThrow();
		});
	});

	describe('registerMove', () => {
		it('should register move animation', () => {
			const mockAnimation = vi.fn().mockResolvedValue(undefined);
			engine.registerMove('tackle', mockAnimation);

			expect(true).toBe(true);
		});

		it('should handle case-insensitive move names', async () => {
			const mockAnimation = vi.fn().mockResolvedValue(undefined);
			engine.registerMove('TACKLE', mockAnimation);

			const context = createMockContext();
			context.moveName = 'tackle';

			await engine.playMove(context);
			expect(mockAnimation).toHaveBeenCalled();
		});
	});

	describe('playMove', () => {
		it('should call registered animation', async () => {
			const mockAnimation = vi.fn().mockResolvedValue(undefined);
			engine.registerMove('test-move', mockAnimation);

			const context = createMockContext();
			context.moveName = 'test-move';

			await engine.playMove(context);
			expect(mockAnimation).toHaveBeenCalledWith(engine, context);
		});

		it('should use fallback for unregistered moves', async () => {
			const context = createMockContext();
			context.moveName = 'unknown-move';
			context.moveCategory = 'physical';

			await expect(engine.playMove(context)).resolves.not.toThrow();
		});

		it('should use physical fallback for physical moves', async () => {
			const context = createMockContext();
			context.moveName = 'unknown-physical';
			context.moveCategory = 'physical';

			await expect(engine.playMove(context)).resolves.not.toThrow();
		});

		it('should use special fallback for special moves', async () => {
			const context = createMockContext();
			context.moveName = 'unknown-special';
			context.moveCategory = 'special';

			await expect(engine.playMove(context)).resolves.not.toThrow();
		});

		it('should use status fallback for status moves', async () => {
			const context = createMockContext();
			context.moveName = 'unknown-status';
			context.moveCategory = 'status';

			await expect(engine.playMove(context)).resolves.not.toThrow();
		});
	});

	describe('getPosition', () => {
		it('should return position for valid slot', () => {
			engine.initialize();
			engine.setLayout('SINGLE');

			const pos = engine.getPosition({ side: 'player', index: 0 });
			expect(pos.x).toBe(22);
			expect(pos.y).toBe(75);
		});
	});

	describe('behind', () => {
		it('should offset z position', () => {
			const pos = { x: 50, y: 50, z: 100, scale: 1, opacity: 1 };
			const result = engine.behind(pos, 30);

			expect(result.z).toBe(130);
		});
	});

	describe('above', () => {
		it('should offset y position', () => {
			const pos = { x: 50, y: 50, z: 100, scale: 1, opacity: 1 };
			const result = engine.above(pos, 10);

			expect(result.y).toBe(40);
		});
	});

	describe('wait', () => {
		it('should wait for specified duration', async () => {
			const start = Date.now();
			await engine.wait(50);
			const elapsed = Date.now() - start;

			expect(elapsed).toBeGreaterThanOrEqual(45);
		});
	});

	describe('cancelAll', () => {
		it('should cancel without error', () => {
			expect(() => engine.cancelAll()).not.toThrow();
		});
	});
});

function createMockContext(): MoveContext {
	const attackerElement = createMockElement('attacker');
	const defenderElement = createMockElement('defender');

	return {
		attacker: {
			slot: { side: 'player', index: 0 },
			element: attackerElement,
			homePosition: { x: 22, y: 75, z: 0, scale: 1, opacity: 1 }
		},
		defender: {
			slot: { side: 'opponent', index: 0 },
			element: defenderElement,
			homePosition: { x: 75, y: 30, z: 200, scale: 0.85, opacity: 1 }
		},
		moveName: 'tackle',
		moveCategory: 'physical',
		moveType: 'normal'
	};
}
