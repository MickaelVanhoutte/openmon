import { Boundary } from './collisions';
import { Position } from './positions';

/**
 * Sparse collision storage: stores only indices of collision tiles instead of full 24,000+ value arrays.
 * Example: [0, 0, 40104, 0, 40104, ...] becomes [2, 4, ...] (90%+ size reduction)
 */

export function indexToPosition(index: number, width: number): Position {
	const x = index % width;
	const y = Math.floor(index / width);
	return new Position(x, y);
}

export function positionToIndex(x: number, y: number, width: number): number {
	return y * width + x;
}

export function buildCollisionSet(sparseIndices: number[]): Set<number> {
	return new Set(sparseIndices);
}

export function sparseToBoundaries(sparseIndices: number[], width: number): Boundary[] {
	return sparseIndices.map((index) => {
		const position = indexToPosition(index, width);
		return new Boundary(position);
	});
}

export function extractSparseIndices(fullArray: number[], tileId: number): number[] {
	const indices: number[] = [];
	for (let i = 0; i < fullArray.length; i++) {
		if (fullArray[i] === tileId) {
			indices.push(i);
		}
	}
	return indices;
}

export function hasCollisionAt(
	collisionSet: Set<number>,
	x: number,
	y: number,
	width: number
): boolean {
	const index = positionToIndex(x, y, width);
	return collisionSet.has(index);
}

export interface SparseMapData {
	collisionIndices: number[];
	waterIndices: number[];
	battleIndices: number[];
}
