import { describe, it, expect } from 'vitest';
import { Position } from '../../mapping/positions';

describe('Position', () => {
	it('should create with x and y coordinates', () => {
		const pos = new Position(10, 20);
		expect(pos.x).toBe(10);
		expect(pos.y).toBe(20);
	});

	it('should default to (0, 0) with no arguments', () => {
		const pos = new Position();
		expect(pos.x).toBe(0);
		expect(pos.y).toBe(0);
	});

	it('should default y to 0 when only x is provided', () => {
		const pos = new Position(5);
		expect(pos.x).toBe(5);
		expect(pos.y).toBe(0);
	});

	it('should handle negative coordinates', () => {
		const pos = new Position(-5, -10);
		expect(pos.x).toBe(-5);
		expect(pos.y).toBe(-10);
	});

	it('should handle large coordinates', () => {
		const pos = new Position(99999, 88888);
		expect(pos.x).toBe(99999);
		expect(pos.y).toBe(88888);
	});

	it('should handle decimal coordinates', () => {
		const pos = new Position(1.5, 2.7);
		expect(pos.x).toBeCloseTo(1.5);
		expect(pos.y).toBeCloseTo(2.7);
	});

	it('should allow mutation of x and y', () => {
		const pos = new Position(0, 0);
		pos.x = 42;
		pos.y = 84;
		expect(pos.x).toBe(42);
		expect(pos.y).toBe(84);
	});

	it('should handle zero values explicitly', () => {
		const pos = new Position(0, 0);
		expect(pos.x).toBe(0);
		expect(pos.y).toBe(0);
	});

	it('should create independent instances', () => {
		const pos1 = new Position(1, 2);
		const pos2 = new Position(1, 2);
		pos1.x = 99;
		expect(pos2.x).toBe(1);
	});
});
