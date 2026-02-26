import { describe, it, expect } from 'vitest';
import {
	getPositionInDirection,
	getPositionBehind,
	isPositionEqual,
	getPositionsInFront,
	isOutsideArea,
	calculateFuturePosition,
	isValidMovement
} from '../../context/helpers/movement-helpers';
import { Position } from '../../mapping/positions';

describe('getPositionInDirection', () => {
	it('moves up', () => {
		const result = getPositionInDirection(new Position(5, 5), 'up');
		expect(result.x).toBe(5);
		expect(result.y).toBe(4);
	});

	it('moves down', () => {
		const result = getPositionInDirection(new Position(5, 5), 'down');
		expect(result.x).toBe(5);
		expect(result.y).toBe(6);
	});

	it('moves left', () => {
		const result = getPositionInDirection(new Position(5, 5), 'left');
		expect(result.x).toBe(4);
		expect(result.y).toBe(5);
	});

	it('moves right', () => {
		const result = getPositionInDirection(new Position(5, 5), 'right');
		expect(result.x).toBe(6);
		expect(result.y).toBe(5);
	});

	it('does not mutate original position', () => {
		const original = new Position(3, 3);
		getPositionInDirection(original, 'up');
		expect(original.y).toBe(3);
	});
});

describe('getPositionBehind', () => {
	it('returns behind for up (goes down)', () => {
		const result = getPositionBehind(new Position(5, 5), 'up');
		expect(result.x).toBe(5);
		expect(result.y).toBe(6);
	});

	it('returns behind for down (goes up)', () => {
		const result = getPositionBehind(new Position(5, 5), 'down');
		expect(result.x).toBe(5);
		expect(result.y).toBe(4);
	});

	it('returns behind for left (goes right)', () => {
		const result = getPositionBehind(new Position(5, 5), 'left');
		expect(result.x).toBe(6);
		expect(result.y).toBe(5);
	});

	it('returns behind for right (goes left)', () => {
		const result = getPositionBehind(new Position(5, 5), 'right');
		expect(result.x).toBe(4);
		expect(result.y).toBe(5);
	});
});

describe('isPositionEqual', () => {
	it('returns true for same coordinates', () => {
		expect(isPositionEqual(new Position(1, 2), new Position(1, 2))).toBe(true);
	});

	it('returns false for different x', () => {
		expect(isPositionEqual(new Position(1, 2), new Position(3, 2))).toBe(false);
	});

	it('returns false for different y', () => {
		expect(isPositionEqual(new Position(1, 2), new Position(1, 3))).toBe(false);
	});

	it('returns true for origin', () => {
		expect(isPositionEqual(new Position(0, 0), new Position(0, 0))).toBe(true);
	});
});

describe('getPositionsInFront', () => {
	it('returns positions ahead with default range 3', () => {
		const positions = getPositionsInFront(new Position(5, 5), 'up');
		expect(positions).toHaveLength(3);
		expect(positions[0].y).toBe(4);
		expect(positions[1].y).toBe(3);
		expect(positions[2].y).toBe(2);
	});

	it('returns custom range', () => {
		const positions = getPositionsInFront(new Position(5, 5), 'right', 5);
		expect(positions).toHaveLength(5);
		expect(positions[0].x).toBe(6);
		expect(positions[4].x).toBe(10);
	});

	it('returns single position for range 1', () => {
		const positions = getPositionsInFront(new Position(5, 5), 'down', 1);
		expect(positions).toHaveLength(1);
		expect(positions[0].y).toBe(6);
	});

	it('works for left direction', () => {
		const positions = getPositionsInFront(new Position(5, 5), 'left', 2);
		expect(positions[0].x).toBe(4);
		expect(positions[1].x).toBe(3);
	});
});

describe('isOutsideArea', () => {
	const area = { start: new Position(0, 0), end: new Position(10, 10) };

	it('returns false for position inside area', () => {
		expect(isOutsideArea(new Position(5, 5), area)).toBe(false);
	});

	it('returns false for position at boundary', () => {
		expect(isOutsideArea(new Position(0, 0), area)).toBe(false);
		expect(isOutsideArea(new Position(10, 10), area)).toBe(false);
	});

	it('returns true for position left of area', () => {
		expect(isOutsideArea(new Position(-1, 5), area)).toBe(true);
	});

	it('returns true for position right of area', () => {
		expect(isOutsideArea(new Position(11, 5), area)).toBe(true);
	});

	it('returns true for position above area', () => {
		expect(isOutsideArea(new Position(5, -1), area)).toBe(true);
	});

	it('returns true for position below area', () => {
		expect(isOutsideArea(new Position(5, 11), area)).toBe(true);
	});
});

describe('calculateFuturePosition', () => {
	it('calculates up', () => {
		expect(calculateFuturePosition(5, 5, 'up')).toEqual({ x: 5, y: 4 });
	});

	it('calculates down', () => {
		expect(calculateFuturePosition(5, 5, 'down')).toEqual({ x: 5, y: 6 });
	});

	it('calculates left', () => {
		expect(calculateFuturePosition(5, 5, 'left')).toEqual({ x: 4, y: 5 });
	});

	it('calculates right', () => {
		expect(calculateFuturePosition(5, 5, 'right')).toEqual({ x: 6, y: 5 });
	});
});

describe('isValidMovement', () => {
	it('returns true for adjacent move', () => {
		expect(isValidMovement(5, 5, 6, 5)).toBe(true);
		expect(isValidMovement(5, 5, 5, 6)).toBe(true);
	});

	it('returns true for staying in place', () => {
		expect(isValidMovement(5, 5, 5, 5)).toBe(true);
	});

	it('returns true for diagonal move (distance 1)', () => {
		expect(isValidMovement(5, 5, 6, 6)).toBe(true);
	});

	it('returns false for move of distance 2', () => {
		expect(isValidMovement(5, 5, 7, 5)).toBe(false);
	});

	it('returns false for large jump', () => {
		expect(isValidMovement(0, 0, 10, 10)).toBe(false);
	});
});
