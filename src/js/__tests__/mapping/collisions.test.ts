import { describe, it, expect } from 'vitest';
import { Boundary, Jonction, rectangularCollision } from '../../mapping/collisions';
import type { Rectangular } from '../../mapping/collisions';
import { Position } from '../../mapping/positions';

function makeRect(x: number, y: number, w: number, h: number): Rectangular {
	return { position: new Position(x, y), width: w, height: h };
}

describe('Collisions', () => {
	describe('Boundary', () => {
		it('should create with default width and height of 16', () => {
			const b = new Boundary(new Position(5, 10));
			expect(b.position.x).toBe(5);
			expect(b.position.y).toBe(10);
			expect(b.width).toBe(16);
			expect(b.height).toBe(16);
		});

		it('should accept custom width and height', () => {
			const b = new Boundary(new Position(0, 0), 32, 64);
			expect(b.width).toBe(32);
			expect(b.height).toBe(64);
		});

		it('should accept zero position', () => {
			const b = new Boundary(new Position(0, 0));
			expect(b.position.x).toBe(0);
			expect(b.position.y).toBe(0);
		});

		it('should implement Rectangular interface', () => {
			const b: Rectangular = new Boundary(new Position(1, 2));
			expect(b.position).toBeDefined();
			expect(b.width).toBe(16);
			expect(b.height).toBe(16);
		});
	});

	describe('Jonction', () => {
		it('should store all constructor parameters', () => {
			const positions = [new Position(1, 2), new Position(3, 4)];
			const start = new Position(10, 20);
			const j = new Jonction(1, 5, positions, start);

			expect(j.id).toBe(1);
			expect(j.mapIdx).toBe(5);
			expect(j.positions).toBe(positions);
			expect(j.start).toBe(start);
		});

		it('should store empty positions array', () => {
			const j = new Jonction(0, 0, [], new Position(0, 0));
			expect(j.positions).toHaveLength(0);
		});

		it('should preserve position references', () => {
			const positions = [new Position(100, 200)];
			const start = new Position(50, 60);
			const j = new Jonction(42, 7, positions, start);

			expect(j.positions[0].x).toBe(100);
			expect(j.positions[0].y).toBe(200);
			expect(j.start.x).toBe(50);
			expect(j.start.y).toBe(60);
		});

		it('should handle large mapIdx and id values', () => {
			const j = new Jonction(999, 12345, [], new Position(0, 0));
			expect(j.id).toBe(999);
			expect(j.mapIdx).toBe(12345);
		});
	});

	describe('rectangularCollision', () => {
		it('should detect overlapping rectangles', () => {
			const r1 = makeRect(0, 0, 10, 10);
			const r2 = makeRect(5, 5, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should detect touching edges as collision', () => {
			const r1 = makeRect(0, 0, 10, 10);
			const r2 = makeRect(10, 0, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should detect touching corners as collision', () => {
			const r1 = makeRect(0, 0, 10, 10);
			const r2 = makeRect(10, 10, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should return false for non-overlapping rectangles', () => {
			const r1 = makeRect(0, 0, 10, 10);
			const r2 = makeRect(20, 20, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(false);
		});

		it('should return false when separated horizontally', () => {
			const r1 = makeRect(0, 0, 5, 5);
			const r2 = makeRect(10, 0, 5, 5);
			expect(rectangularCollision(r1, r2)).toBe(false);
		});

		it('should return false when separated vertically', () => {
			const r1 = makeRect(0, 0, 5, 5);
			const r2 = makeRect(0, 10, 5, 5);
			expect(rectangularCollision(r1, r2)).toBe(false);
		});

		it('should detect one rectangle inside another', () => {
			const outer = makeRect(0, 0, 100, 100);
			const inner = makeRect(25, 25, 10, 10);
			expect(rectangularCollision(outer, inner)).toBe(true);
			expect(rectangularCollision(inner, outer)).toBe(true);
		});

		it('should detect same position and size', () => {
			const r1 = makeRect(5, 5, 10, 10);
			const r2 = makeRect(5, 5, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should handle zero-size rectangles at same point', () => {
			const r1 = makeRect(5, 5, 0, 0);
			const r2 = makeRect(5, 5, 0, 0);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should handle zero-size rectangle touching another', () => {
			const r1 = makeRect(10, 10, 0, 0);
			const r2 = makeRect(0, 0, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should handle negative coordinates', () => {
			const r1 = makeRect(-10, -10, 5, 5);
			const r2 = makeRect(-7, -7, 5, 5);
			expect(rectangularCollision(r1, r2)).toBe(true);
		});

		it('should handle negative coordinates with no overlap', () => {
			const r1 = makeRect(-20, -20, 5, 5);
			const r2 = makeRect(10, 10, 5, 5);
			expect(rectangularCollision(r1, r2)).toBe(false);
		});

		it('should be commutative', () => {
			const r1 = makeRect(0, 0, 10, 10);
			const r2 = makeRect(5, 5, 10, 10);
			expect(rectangularCollision(r1, r2)).toBe(rectangularCollision(r2, r1));
		});

		it('should be commutative for non-overlapping', () => {
			const r1 = makeRect(0, 0, 5, 5);
			const r2 = makeRect(20, 20, 5, 5);
			expect(rectangularCollision(r1, r2)).toBe(rectangularCollision(r2, r1));
		});

		it('should work with Boundary instances', () => {
			const b1 = new Boundary(new Position(0, 0));
			const b2 = new Boundary(new Position(1, 1));
			expect(rectangularCollision(b1, b2)).toBe(true);
		});

		it('should detect non-overlapping Boundary instances', () => {
			const b1 = new Boundary(new Position(0, 0));
			const b2 = new Boundary(new Position(100, 100));
			expect(rectangularCollision(b1, b2)).toBe(false);
		});
	});
});
