import { describe, it, expect } from 'vitest';
import { ExplorationTracker } from '../../dungeon/exploration-tracker';

describe('ExplorationTracker', () => {
	describe('constructor', () => {
		it('should create instance with width and height', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker).toBeDefined();
		});

		it('should use default fogRadius of 5', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(10, 10);
			const visibleAtRadius5 = tracker.isVisible(10, 15, 10, 10);
			const visibleAtRadius6 = tracker.isVisible(10, 16, 10, 10);
			expect(visibleAtRadius5).toBe(true);
			expect(visibleAtRadius6).toBe(false);
		});

		it('should accept custom fogRadius', () => {
			const tracker = new ExplorationTracker(20, 20, 3);
			tracker.updatePlayerPosition(10, 10);
			const visibleAtRadius3 = tracker.isVisible(10, 13, 10, 10);
			const visibleAtRadius4 = tracker.isVisible(10, 14, 10, 10);
			expect(visibleAtRadius3).toBe(true);
			expect(visibleAtRadius4).toBe(false);
		});

		it('should start with all tiles unvisited', () => {
			const tracker = new ExplorationTracker(10, 10);
			for (let x = 0; x < 10; x++) {
				for (let y = 0; y < 10; y++) {
					expect(tracker.isVisited(x, y)).toBe(false);
				}
			}
		});
	});

	describe('markVisited / isVisited', () => {
		it('should mark tile as visited', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.markVisited(5, 5);
			expect(tracker.isVisited(5, 5)).toBe(true);
		});

		it('should return false for unvisited tile', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisited(5, 5)).toBe(false);
		});

		it('should mark multiple tiles independently', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.markVisited(3, 3);
			tracker.markVisited(7, 7);
			tracker.markVisited(10, 5);

			expect(tracker.isVisited(3, 3)).toBe(true);
			expect(tracker.isVisited(7, 7)).toBe(true);
			expect(tracker.isVisited(10, 5)).toBe(true);
			expect(tracker.isVisited(5, 5)).toBe(false);
		});

		it('should handle out-of-bounds coordinates gracefully', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.markVisited(-1, 5);
			tracker.markVisited(5, -1);
			tracker.markVisited(20, 5);
			tracker.markVisited(5, 20);
			tracker.markVisited(100, 100);

			expect(tracker.isVisited(-1, 5)).toBe(false);
			expect(tracker.isVisited(5, -1)).toBe(false);
			expect(tracker.isVisited(20, 5)).toBe(false);
			expect(tracker.isVisited(5, 20)).toBe(false);
		});

		it('should be idempotent - marking same tile twice', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.markVisited(5, 5);
			tracker.markVisited(5, 5);
			expect(tracker.isVisited(5, 5)).toBe(true);
		});
	});

	describe('isVisible', () => {
		it('should make tile at player position visible', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisible(10, 10, 10, 10)).toBe(true);
		});

		it('should make tile within fogRadius visible', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisible(13, 10, 10, 10)).toBe(true);
			expect(tracker.isVisible(10, 13, 10, 10)).toBe(true);
			expect(tracker.isVisible(13, 13, 10, 10)).toBe(true);
		});

		it('should make tile outside fogRadius NOT visible', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisible(17, 10, 10, 10)).toBe(false);
			expect(tracker.isVisible(10, 17, 10, 10)).toBe(false);
		});

		it('should use Euclidean distance (circular radius)', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisible(13, 14, 10, 10)).toBe(true);
			expect(tracker.isVisible(14, 14, 10, 10)).toBe(false);
		});

		it('should make tile at exactly fogRadius distance visible', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisible(15, 10, 10, 10)).toBe(true);
			expect(tracker.isVisible(10, 15, 10, 10)).toBe(true);
		});

		it('should make tile at fogRadius+1 distance NOT visible', () => {
			const tracker = new ExplorationTracker(20, 20);
			expect(tracker.isVisible(16, 10, 10, 10)).toBe(false);
			expect(tracker.isVisible(10, 16, 10, 10)).toBe(false);
		});

		it('should work with custom fogRadius values', () => {
			const tracker3 = new ExplorationTracker(20, 20, 3);
			expect(tracker3.isVisible(13, 10, 10, 10)).toBe(true);
			expect(tracker3.isVisible(14, 10, 10, 10)).toBe(false);

			const tracker7 = new ExplorationTracker(20, 20, 7);
			expect(tracker7.isVisible(17, 10, 10, 10)).toBe(true);
			expect(tracker7.isVisible(18, 10, 10, 10)).toBe(false);

			const tracker10 = new ExplorationTracker(20, 20, 10);
			expect(tracker10.isVisible(20, 10, 10, 10)).toBe(true);
			expect(tracker10.isVisible(21, 10, 10, 10)).toBe(false);
		});
	});

	describe('getVisibleTiles', () => {
		it('should return Set of flat indices for visible tiles', () => {
			const tracker = new ExplorationTracker(20, 20);
			const visible = tracker.getVisibleTiles(10, 10);
			expect(visible).toBeInstanceOf(Set);
			expect(visible.size).toBeGreaterThan(0);
		});

		it('should use flat index format (y * width + x)', () => {
			const tracker = new ExplorationTracker(20, 20);
			const visible = tracker.getVisibleTiles(10, 10);
			expect(visible.has(210)).toBe(true);
		});

		it('should have approximately pi * r^2 tiles (±10% tolerance)', () => {
			const tracker = new ExplorationTracker(50, 50);
			const visible = tracker.getVisibleTiles(25, 25);
			const radius = 5;
			const expectedSize = Math.PI * radius * radius;
			const tolerance = expectedSize * 0.1;
			expect(visible.size).toBeGreaterThan(expectedSize - tolerance);
			expect(visible.size).toBeLessThan(expectedSize + tolerance);
		});

		it('should change when player moves', () => {
			const tracker = new ExplorationTracker(20, 20);
			const visible1 = tracker.getVisibleTiles(5, 5);
			const visible2 = tracker.getVisibleTiles(15, 15);
			expect(visible1).not.toEqual(visible2);
		});

		it('should not include out-of-bounds tiles', () => {
			const tracker = new ExplorationTracker(20, 20);
			const visible = tracker.getVisibleTiles(2, 2);
			for (const index of visible) {
				const x = index % 20;
				const y = Math.floor(index / 20);
				expect(x).toBeGreaterThanOrEqual(0);
				expect(x).toBeLessThan(20);
				expect(y).toBeGreaterThanOrEqual(0);
				expect(y).toBeLessThan(20);
			}
		});

		it('should clamp visible tiles to grid bounds at edges', () => {
			const tracker = new ExplorationTracker(20, 20);
			const visible = tracker.getVisibleTiles(0, 0);
			expect(visible.size).toBeGreaterThan(0);
			for (const index of visible) {
				expect(index).toBeGreaterThanOrEqual(0);
				expect(index).toBeLessThan(400);
			}
		});
	});

	describe('updatePlayerPosition', () => {
		it('should mark all tiles within fogRadius as visited', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(10, 10);

			expect(tracker.isVisited(10, 10)).toBe(true);
			expect(tracker.isVisited(13, 10)).toBe(true);
			expect(tracker.isVisited(10, 13)).toBe(true);
			expect(tracker.isVisited(16, 10)).toBe(false);
		});

		it('should preserve previously visited tiles', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(5, 5);
			expect(tracker.isVisited(5, 5)).toBe(true);

			tracker.updatePlayerPosition(15, 15);
			expect(tracker.isVisited(5, 5)).toBe(true);
			expect(tracker.isVisited(15, 15)).toBe(true);
		});

		it('should accumulate visited tiles (union, not replace)', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(5, 5);
			const visited1 = tracker.isVisited(5, 5);

			tracker.updatePlayerPosition(10, 10);
			const visited2 = tracker.isVisited(5, 5);
			const visited3 = tracker.isVisited(10, 10);

			expect(visited1).toBe(true);
			expect(visited2).toBe(true);
			expect(visited3).toBe(true);
		});

		it('should leave trail of visited tiles when walking corridor', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(5, 10);
			tracker.updatePlayerPosition(6, 10);
			tracker.updatePlayerPosition(7, 10);
			tracker.updatePlayerPosition(8, 10);

			expect(tracker.isVisited(5, 10)).toBe(true);
			expect(tracker.isVisited(6, 10)).toBe(true);
			expect(tracker.isVisited(7, 10)).toBe(true);
			expect(tracker.isVisited(8, 10)).toBe(true);
		});
	});

	describe('reset', () => {
		it('should clear all visited state', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.markVisited(5, 5);
			tracker.markVisited(10, 10);
			tracker.markVisited(15, 15);

			tracker.reset();

			expect(tracker.isVisited(5, 5)).toBe(false);
			expect(tracker.isVisited(10, 10)).toBe(false);
			expect(tracker.isVisited(15, 15)).toBe(false);
		});

		it('should clear visited state after updatePlayerPosition', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(10, 10);
			expect(tracker.isVisited(10, 10)).toBe(true);

			tracker.reset();
			expect(tracker.isVisited(10, 10)).toBe(false);
		});

		it('should allow marking tiles visited again after reset', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.markVisited(5, 5);
			tracker.reset();
			tracker.markVisited(5, 5);

			expect(tracker.isVisited(5, 5)).toBe(true);
		});

		it('should preserve fogRadius after reset', () => {
			const tracker = new ExplorationTracker(20, 20, 3);
			tracker.updatePlayerPosition(10, 10);
			tracker.reset();

			tracker.updatePlayerPosition(10, 10);
			expect(tracker.isVisible(13, 10, 10, 10)).toBe(true);
			expect(tracker.isVisible(14, 10, 10, 10)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle 1x1 grid', () => {
			const tracker = new ExplorationTracker(1, 1);
			tracker.updatePlayerPosition(0, 0);
			expect(tracker.isVisited(0, 0)).toBe(true);
		});

		it('should handle large grid (100x100)', () => {
			const tracker = new ExplorationTracker(100, 100);
			tracker.updatePlayerPosition(50, 50);
			expect(tracker.isVisited(50, 50)).toBe(true);
			const visible = tracker.getVisibleTiles(50, 50);
			expect(visible.size).toBeGreaterThan(0);
		});

		it('should handle fogRadius of 0 (only player tile visible)', () => {
			const tracker = new ExplorationTracker(20, 20, 0);
			tracker.updatePlayerPosition(10, 10);
			expect(tracker.isVisited(10, 10)).toBe(true);
			expect(tracker.isVisited(11, 10)).toBe(false);
			expect(tracker.isVisited(10, 11)).toBe(false);
		});

		it('should handle fogRadius of 1 (immediate neighbors)', () => {
			const tracker = new ExplorationTracker(20, 20, 1);
			tracker.updatePlayerPosition(10, 10);
			expect(tracker.isVisited(10, 10)).toBe(true);
			expect(tracker.isVisited(11, 10)).toBe(true);
			expect(tracker.isVisited(10, 11)).toBe(true);
			expect(tracker.isVisited(12, 10)).toBe(false);
		});

		it('should handle player at corner (0, 0)', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(0, 0);
			expect(tracker.isVisited(0, 0)).toBe(true);
			const visible = tracker.getVisibleTiles(0, 0);
			expect(visible.size).toBeGreaterThan(0);
		});

		it('should handle player at opposite corner (width-1, height-1)', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(19, 19);
			expect(tracker.isVisited(19, 19)).toBe(true);
			const visible = tracker.getVisibleTiles(19, 19);
			expect(visible.size).toBeGreaterThan(0);
		});

		it('should not wrap around grid edges', () => {
			const tracker = new ExplorationTracker(20, 20);
			tracker.updatePlayerPosition(0, 0);
			expect(tracker.isVisited(19, 0)).toBe(false);
		});
	});
});
