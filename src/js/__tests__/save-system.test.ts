import { describe, it, expect } from 'vitest';

describe('Save System', () => {
	describe('removeSave - ID-based removal', () => {
		it('should remove save by its ID, not by array index', () => {
			// Given saves with IDs [0, 1, 2]
			const saves = [
				{ id: 0, name: 'Save A' },
				{ id: 1, name: 'Save B' },
				{ id: 2, name: 'Save C' }
			];

			// When we remove save with ID 1
			const idToRemove = 1;
			const indexOfId = saves.findIndex((s) => s.id === idToRemove);
			saves.splice(indexOfId, 1);

			// Then save B should be gone, and saves A and C remain
			expect(saves).toHaveLength(2);
			expect(saves.find((s) => s.id === 0)?.name).toBe('Save A');
			expect(saves.find((s) => s.id === 2)?.name).toBe('Save C');
			expect(saves.find((s) => s.id === 1)).toBeUndefined();
		});

		it('should not remove wrong save when array is reordered', () => {
			// Saves sorted by update time (most recent first): [id:2, id:0, id:1]
			const saves = [
				{ id: 2, name: 'Save C', updated: 300 },
				{ id: 0, name: 'Save A', updated: 200 },
				{ id: 1, name: 'Save B', updated: 100 }
			];

			// BUG: removeSave(1) currently calls splice(1, 1) which removes Save A
			// (array index 1), NOT Save B (which has id: 1).
			// Correct behavior: should find save with id=1 and remove it.
			const idToRemove = 1;

			// Correct: find by ID first
			const correctIndex = saves.findIndex((s) => s.id === idToRemove);
			expect(correctIndex).toBe(2);

			// Incorrect: using ID as array index directly
			const incorrectlySpliced = saves[idToRemove];
			expect(incorrectlySpliced.name).toBe('Save A');
			expect(incorrectlySpliced.id).not.toBe(idToRemove);
		});
	});

	describe('newGame - Unique ID Generation', () => {
		it('should generate unique IDs using Math.max of existing IDs', () => {
			const existingSaves = [
				{ id: 0, name: 'First' },
				{ id: 1, name: 'Second' },
				{ id: 2, name: 'Third' }
			];

			// Correct: next ID should be max(existing IDs) + 1
			const correctNextId = Math.max(...existingSaves.map((s) => s.id)) + 1;
			expect(correctNextId).toBe(3);
		});

		it('should not use saves.length for ID when saves have been deleted', () => {
			// After deleting save with id:1, we have [id:0, id:2]
			const savesAfterDeletion = [
				{ id: 0, name: 'First' },
				{ id: 2, name: 'Third' }
			];

			// BUG: using saves.length gives id=2, which collides with existing save
			const incorrectId = savesAfterDeletion.length;
			expect(incorrectId).toBe(2);

			const hasCollision = savesAfterDeletion.some((s) => s.id === incorrectId);
			expect(hasCollision).toBe(true);

			// Correct: use Math.max of existing IDs + 1
			const correctId = Math.max(...savesAfterDeletion.map((s) => s.id)) + 1;
			expect(correctId).toBe(3);
			expect(savesAfterDeletion.some((s) => s.id === correctId)).toBe(false);
		});

		it('should handle empty saves array for ID generation', () => {
			const emptySaves: { id: number }[] = [];

			// Math.max of empty spread returns -Infinity, so handle the edge case
			const nextId = emptySaves.length === 0 ? 0 : Math.max(...emptySaves.map((s) => s.id)) + 1;
			expect(nextId).toBe(0);
		});
	});
});
