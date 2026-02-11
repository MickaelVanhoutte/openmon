import { describe, it, expect, vi } from 'vitest';
import { CharacterPosition } from '../characters/characters-model';
import { Position } from '../mapping/positions';

describe('movement bridge', () => {
	describe('arriveAtTarget()', () => {
		it('snaps positionOnMap to targetPosition', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5);

			pos.arriveAtTarget();

			expect(pos.positionOnMap.x).toBe(6);
			expect(pos.positionOnMap.y).toBe(5);
		});

		it('snaps positionInPx to targetPositionInPx', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5);

			pos.arriveAtTarget();

			expect(pos.positionInPx.x).toBe(6 * 16 * 2.5);
			expect(pos.positionInPx.y).toBe(5 * 16 * 2.5);
		});

		it('fires onReachTarget callback', () => {
			const callback = vi.fn();
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5, callback);

			pos.arriveAtTarget();

			expect(callback).toHaveBeenCalledOnce();
		});

		it('clears onReachTarget after firing', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5, () => {});

			pos.arriveAtTarget();

			expect(pos.onReachTarget).toBeUndefined();
		});

		it('is safe when no onReachTarget is set', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5);

			expect(() => pos.arriveAtTarget()).not.toThrow();
			expect(pos.positionOnMap.x).toBe(6);
		});

		it('clears onReachTarget before calling (re-entrancy safe)', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			let wasUndefinedDuringCallback = false;

			pos.setFuturePosition(6, 5, () => {
				wasUndefinedDuringCallback = pos.onReachTarget === undefined;
			});

			pos.arriveAtTarget();

			expect(wasUndefinedDuringCallback).toBe(true);
		});

		it('makes positionOnMap reference-equal to targetPosition after arrival', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5);

			pos.arriveAtTarget();

			expect(pos.positionOnMap).toBe(pos.targetPosition);
		});
	});

	describe('isMovingToTarget', () => {
		it('returns true when positions differ', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5);

			expect(pos.isMovingToTarget).toBe(true);
		});

		it('returns false when positions match', () => {
			const pos = new CharacterPosition(new Position(5, 5));

			expect(pos.isMovingToTarget).toBe(false);
		});

		it('returns false after arriveAtTarget()', () => {
			const pos = new CharacterPosition(new Position(5, 5));
			pos.setFuturePosition(6, 5);

			pos.arriveAtTarget();

			expect(pos.isMovingToTarget).toBe(false);
		});
	});

	describe('getter properties', () => {
		it('targetGridPosition returns targetPosition', () => {
			const pos = new CharacterPosition(new Position(3, 7));
			pos.setFuturePosition(4, 7);

			expect(pos.targetGridPosition).toBe(pos.targetPosition);
			expect(pos.targetGridPosition.x).toBe(4);
			expect(pos.targetGridPosition.y).toBe(7);
		});

		it('currentGridPosition returns positionOnMap', () => {
			const pos = new CharacterPosition(new Position(3, 7));

			expect(pos.currentGridPosition).toBe(pos.positionOnMap);
			expect(pos.currentGridPosition.x).toBe(3);
			expect(pos.currentGridPosition.y).toBe(7);
		});

		it('movementDirection returns direction', () => {
			const pos = new CharacterPosition(new Position(0, 0), 'left');

			expect(pos.movementDirection).toBe('left');

			pos.direction = 'up';
			expect(pos.movementDirection).toBe('up');
		});
	});

	describe('full move cycle', () => {
		it('setFuturePosition then arriveAtTarget reproduces the full move cycle', () => {
			const pos = new CharacterPosition(new Position(10, 10));
			const callOrder: string[] = [];

			pos.setFuturePosition(11, 10, () => {
				callOrder.push('arrived');
			});

			expect(pos.isMovingToTarget).toBe(true);
			expect(pos.currentGridPosition.x).toBe(10);
			expect(pos.targetGridPosition.x).toBe(11);

			pos.arriveAtTarget();

			expect(pos.isMovingToTarget).toBe(false);
			expect(pos.currentGridPosition.x).toBe(11);
			expect(callOrder).toEqual(['arrived']);
		});

		it('chained callbacks work (onReachTarget sets another target via setFuturePosition)', () => {
			const pos = new CharacterPosition(new Position(0, 0));
			const callOrder: number[] = [];

			pos.setFuturePosition(1, 0, () => {
				callOrder.push(1);
				pos.setFuturePosition(2, 0, () => {
					callOrder.push(2);
				});
			});

			pos.arriveAtTarget();
			expect(callOrder).toEqual([1]);
			expect(pos.isMovingToTarget).toBe(true);
			expect(pos.targetGridPosition.x).toBe(2);

			pos.arriveAtTarget();
			expect(callOrder).toEqual([1, 2]);
			expect(pos.isMovingToTarget).toBe(false);
			expect(pos.currentGridPosition.x).toBe(2);
		});

		it('multiple sequential moves with direction changes', () => {
			const pos = new CharacterPosition(new Position(5, 5), 'right');

			pos.setFuturePosition(6, 5);
			pos.direction = 'right';
			pos.arriveAtTarget();
			expect(pos.currentGridPosition).toEqual({ x: 6, y: 5 });
			expect(pos.movementDirection).toBe('right');

			pos.setFuturePosition(6, 4);
			pos.direction = 'up';
			pos.arriveAtTarget();
			expect(pos.currentGridPosition).toEqual({ x: 6, y: 4 });
			expect(pos.movementDirection).toBe('up');
		});
	});
});
