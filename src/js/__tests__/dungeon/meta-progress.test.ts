import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
	loadMetaProgress,
	saveMetaProgress,
	updateMetaProgress,
	type MetaProgress
} from '../../dungeon/meta-progress';
import { DungeonContext } from '../../dungeon/dungeon-context';

const STORAGE_KEY = 'openmon_dungeon_meta';

describe('meta-progress', () => {
	let storageMap: Record<string, string>;

	beforeEach(() => {
		storageMap = {};
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
			return storageMap[key] ?? null;
		});
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
			storageMap[key] = value;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('loadMetaProgress', () => {
		it('should return defaults when no data stored', () => {
			const meta = loadMetaProgress();
			expect(meta).toEqual({ bestFloor: 0, totalRuns: 0, totalCurrency: 0 });
		});

		it('should load valid stored data', () => {
			const stored: MetaProgress = { bestFloor: 7, totalRuns: 3, totalCurrency: 150 };
			storageMap[STORAGE_KEY] = JSON.stringify(stored);

			const meta = loadMetaProgress();
			expect(meta).toEqual(stored);
		});

		it('should handle corrupt JSON gracefully', () => {
			storageMap[STORAGE_KEY] = 'not-json{{{';

			const meta = loadMetaProgress();
			expect(meta).toEqual({ bestFloor: 0, totalRuns: 0, totalCurrency: 0 });
		});

		it('should handle partial data with defaults for missing fields', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({ bestFloor: 5 });

			const meta = loadMetaProgress();
			expect(meta.bestFloor).toBe(5);
			expect(meta.totalRuns).toBe(0);
			expect(meta.totalCurrency).toBe(0);
		});

		it('should handle wrong types with defaults', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({ bestFloor: 'bad', totalRuns: true });

			const meta = loadMetaProgress();
			expect(meta).toEqual({ bestFloor: 0, totalRuns: 0, totalCurrency: 0 });
		});
	});

	describe('saveMetaProgress', () => {
		it('should persist progress to localStorage', () => {
			const progress: MetaProgress = { bestFloor: 10, totalRuns: 5, totalCurrency: 300 };
			saveMetaProgress(progress);

			expect(storageMap[STORAGE_KEY]).toBe(JSON.stringify(progress));
		});

		it('should not throw when localStorage is unavailable', () => {
			vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('QuotaExceededError');
			});

			expect(() => {
				saveMetaProgress({ bestFloor: 1, totalRuns: 1, totalCurrency: 0 });
			}).not.toThrow();
		});
	});

	describe('updateMetaProgress', () => {
		it('should increment totalRuns and accumulate currency', () => {
			const ctx = new DungeonContext();
			ctx.currentFloor = 3;
			ctx.runCurrency = 50;

			const result = updateMetaProgress(ctx);
			expect(result.totalRuns).toBe(1);
			expect(result.totalCurrency).toBe(50);
			expect(result.bestFloor).toBe(3);
		});

		it('should update bestFloor when current is higher', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				bestFloor: 5,
				totalRuns: 2,
				totalCurrency: 100
			});

			const ctx = new DungeonContext();
			ctx.currentFloor = 8;
			ctx.runCurrency = 25;

			const result = updateMetaProgress(ctx);
			expect(result.bestFloor).toBe(8);
			expect(result.totalRuns).toBe(3);
			expect(result.totalCurrency).toBe(125);
		});

		it('should keep bestFloor when current is lower', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				bestFloor: 10,
				totalRuns: 4,
				totalCurrency: 200
			});

			const ctx = new DungeonContext();
			ctx.currentFloor = 3;
			ctx.runCurrency = 10;

			const result = updateMetaProgress(ctx);
			expect(result.bestFloor).toBe(10);
		});

		it('should save updated progress to localStorage', () => {
			const ctx = new DungeonContext();
			ctx.currentFloor = 5;
			ctx.runCurrency = 100;

			updateMetaProgress(ctx);

			const stored = JSON.parse(storageMap[STORAGE_KEY]) as MetaProgress;
			expect(stored.bestFloor).toBe(5);
			expect(stored.totalRuns).toBe(1);
			expect(stored.totalCurrency).toBe(100);
		});
	});
});
