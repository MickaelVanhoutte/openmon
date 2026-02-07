import { describe, it, expect } from 'vitest';
import {
	indexToPosition,
	positionToIndex,
	buildCollisionSet,
	sparseToBoundaries,
	extractSparseIndices,
	hasCollisionAt
} from '../../mapping/sparse-collision';

describe('Sparse Collision', () => {
	describe('indexToPosition', () => {
		it('should convert index 0 to position (0, 0)', () => {
			const pos = indexToPosition(0, 10);
			expect(pos.x).toBe(0);
			expect(pos.y).toBe(0);
		});

		it('should convert first index of second row', () => {
			const pos = indexToPosition(10, 10);
			expect(pos.x).toBe(0);
			expect(pos.y).toBe(1);
		});

		it('should convert last index of first row', () => {
			const pos = indexToPosition(9, 10);
			expect(pos.x).toBe(9);
			expect(pos.y).toBe(0);
		});

		it('should convert a middle index correctly', () => {
			const pos = indexToPosition(23, 10);
			expect(pos.x).toBe(3);
			expect(pos.y).toBe(2);
		});

		it('should handle width of 1', () => {
			const pos = indexToPosition(5, 1);
			expect(pos.x).toBe(0);
			expect(pos.y).toBe(5);
		});

		it('should handle large indices', () => {
			const pos = indexToPosition(24567, 200);
			expect(pos.x).toBe(24567 % 200);
			expect(pos.y).toBe(Math.floor(24567 / 200));
		});

		it('should handle various widths', () => {
			const pos = indexToPosition(7, 4);
			expect(pos.x).toBe(3);
			expect(pos.y).toBe(1);
		});
	});

	describe('positionToIndex', () => {
		it('should convert (0, 0) to index 0', () => {
			expect(positionToIndex(0, 0, 10)).toBe(0);
		});

		it('should convert position at end of first row', () => {
			expect(positionToIndex(9, 0, 10)).toBe(9);
		});

		it('should convert position at start of second row', () => {
			expect(positionToIndex(0, 1, 10)).toBe(10);
		});

		it('should convert arbitrary position', () => {
			expect(positionToIndex(3, 2, 10)).toBe(23);
		});

		it('should handle width of 1', () => {
			expect(positionToIndex(0, 5, 1)).toBe(5);
		});

		it('should roundtrip with indexToPosition', () => {
			const width = 15;
			for (const idx of [0, 1, 14, 15, 44, 100, 224]) {
				const pos = indexToPosition(idx, width);
				const result = positionToIndex(pos.x, pos.y, width);
				expect(result).toBe(idx);
			}
		});

		it('should roundtrip with various widths', () => {
			for (const width of [1, 5, 10, 50, 200]) {
				for (const idx of [0, 1, width - 1, width, width * 3 + 2]) {
					const pos = indexToPosition(idx, width);
					expect(positionToIndex(pos.x, pos.y, width)).toBe(idx);
				}
			}
		});
	});

	describe('buildCollisionSet', () => {
		it('should create an empty set from empty array', () => {
			const set = buildCollisionSet([]);
			expect(set.size).toBe(0);
		});

		it('should create a set from indices', () => {
			const set = buildCollisionSet([1, 5, 10]);
			expect(set.size).toBe(3);
			expect(set.has(1)).toBe(true);
			expect(set.has(5)).toBe(true);
			expect(set.has(10)).toBe(true);
		});

		it('should deduplicate indices', () => {
			const set = buildCollisionSet([1, 1, 2, 2, 3]);
			expect(set.size).toBe(3);
		});

		it('should handle large arrays', () => {
			const indices = Array.from({ length: 10000 }, (_, i) => i);
			const set = buildCollisionSet(indices);
			expect(set.size).toBe(10000);
			expect(set.has(0)).toBe(true);
			expect(set.has(9999)).toBe(true);
		});

		it('should handle single element', () => {
			const set = buildCollisionSet([42]);
			expect(set.size).toBe(1);
			expect(set.has(42)).toBe(true);
		});
	});

	describe('sparseToBoundaries', () => {
		it('should return empty array for empty indices', () => {
			const boundaries = sparseToBoundaries([], 10);
			expect(boundaries).toHaveLength(0);
		});

		it('should create one Boundary per index', () => {
			const boundaries = sparseToBoundaries([0, 5, 12], 10);
			expect(boundaries).toHaveLength(3);
		});

		it('should set correct positions on boundaries', () => {
			const boundaries = sparseToBoundaries([23], 10);
			expect(boundaries[0].position.x).toBe(3);
			expect(boundaries[0].position.y).toBe(2);
		});

		it('should set default width and height of 16', () => {
			const boundaries = sparseToBoundaries([0], 10);
			expect(boundaries[0].width).toBe(16);
			expect(boundaries[0].height).toBe(16);
		});

		it('should convert multiple indices with correct positions', () => {
			const width = 5;
			const indices = [0, 4, 5, 9];
			const boundaries = sparseToBoundaries(indices, width);

			expect(boundaries[0].position.x).toBe(0);
			expect(boundaries[0].position.y).toBe(0);

			expect(boundaries[1].position.x).toBe(4);
			expect(boundaries[1].position.y).toBe(0);

			expect(boundaries[2].position.x).toBe(0);
			expect(boundaries[2].position.y).toBe(1);

			expect(boundaries[3].position.x).toBe(4);
			expect(boundaries[3].position.y).toBe(1);
		});
	});

	describe('extractSparseIndices', () => {
		it('should return empty array when no matches', () => {
			const result = extractSparseIndices([1, 2, 3, 4], 99);
			expect(result).toEqual([]);
		});

		it('should return all indices when all match', () => {
			const result = extractSparseIndices([5, 5, 5], 5);
			expect(result).toEqual([0, 1, 2]);
		});

		it('should return correct indices for mixed array', () => {
			const result = extractSparseIndices([0, 40104, 0, 0, 40104, 0], 40104);
			expect(result).toEqual([1, 4]);
		});

		it('should handle empty array', () => {
			const result = extractSparseIndices([], 40104);
			expect(result).toEqual([]);
		});

		it('should handle single matching element', () => {
			const result = extractSparseIndices([40104], 40104);
			expect(result).toEqual([0]);
		});

		it('should handle single non-matching element', () => {
			const result = extractSparseIndices([0], 40104);
			expect(result).toEqual([]);
		});

		it('should handle large arrays efficiently', () => {
			const fullArray = new Array(25000).fill(0);
			fullArray[100] = 40104;
			fullArray[5000] = 40104;
			fullArray[24999] = 40104;
			const result = extractSparseIndices(fullArray, 40104);
			expect(result).toEqual([100, 5000, 24999]);
		});

		it('should match tileId 0 correctly', () => {
			const result = extractSparseIndices([0, 1, 0, 2], 0);
			expect(result).toEqual([0, 2]);
		});
	});

	describe('hasCollisionAt', () => {
		it('should return true when collision exists', () => {
			const set = new Set([positionToIndex(3, 2, 10)]);
			expect(hasCollisionAt(set, 3, 2, 10)).toBe(true);
		});

		it('should return false when no collision', () => {
			const set = new Set([positionToIndex(3, 2, 10)]);
			expect(hasCollisionAt(set, 4, 2, 10)).toBe(false);
		});

		it('should return false for empty set', () => {
			const set = new Set<number>();
			expect(hasCollisionAt(set, 0, 0, 10)).toBe(false);
		});

		it('should handle position (0, 0)', () => {
			const set = new Set([0]);
			expect(hasCollisionAt(set, 0, 0, 10)).toBe(true);
		});

		it('should handle edge of row', () => {
			const width = 10;
			const set = new Set([positionToIndex(9, 0, width)]);
			expect(hasCollisionAt(set, 9, 0, width)).toBe(true);
			expect(hasCollisionAt(set, 0, 1, width)).toBe(false);
		});

		it('should handle large coordinates', () => {
			const width = 200;
			const x = 150;
			const y = 100;
			const set = new Set([positionToIndex(x, y, width)]);
			expect(hasCollisionAt(set, x, y, width)).toBe(true);
			expect(hasCollisionAt(set, x + 1, y, width)).toBe(false);
		});

		it('should work with buildCollisionSet integration', () => {
			const width = 10;
			const sparseIndices = [5, 15, 25];
			const set = buildCollisionSet(sparseIndices);

			expect(hasCollisionAt(set, 5, 0, width)).toBe(true);
			expect(hasCollisionAt(set, 5, 1, width)).toBe(true);
			expect(hasCollisionAt(set, 5, 2, width)).toBe(true);
			expect(hasCollisionAt(set, 6, 0, width)).toBe(false);
		});
	});
});
