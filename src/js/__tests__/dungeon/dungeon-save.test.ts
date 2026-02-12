import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	saveDungeonRun,
	loadDungeonRun,
	clearDungeonRunSave,
	type DungeonRunSave
} from '../../dungeon/dungeon-save';
import { DungeonContext } from '../../dungeon/dungeon-context';

const STORAGE_KEY = 'openmon_dungeon_run';

describe('dungeon-save', () => {
	let storageMap: Record<string, string>;

	beforeEach(() => {
		storageMap = {};
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
			return storageMap[key] ?? null;
		});
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
			storageMap[key] = value;
		});
		vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
			delete storageMap[key];
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('saveDungeonRun', () => {
		it('should serialize DungeonContext to localStorage', () => {
			const ctx = new DungeonContext();
			ctx.runSeed = 'test-seed-42';
			ctx.currentFloor = 3;
			ctx.defeatedTrainers = new Set(['1-0', '2-1']);
			ctx.pickedItems = new Set(['1-2', '3-0']);
			ctx.runCurrency = 75;

			saveDungeonRun(ctx);

			const stored = JSON.parse(storageMap[STORAGE_KEY]) as DungeonRunSave;
			expect(stored.runSeed).toBe('test-seed-42');
			expect(stored.currentFloor).toBe(3);
			expect(stored.defeatedTrainers).toEqual(['1-0', '2-1']);
			expect(stored.pickedItems).toEqual(['1-2', '3-0']);
			expect(stored.runCurrency).toBe(75);
		});

		it('should convert Sets to Arrays', () => {
			const ctx = new DungeonContext();
			ctx.runSeed = 'seed';
			ctx.currentFloor = 1;
			ctx.defeatedTrainers = new Set(['a', 'b', 'c']);
			ctx.pickedItems = new Set(['x']);
			ctx.runCurrency = 0;

			saveDungeonRun(ctx);

			const stored = JSON.parse(storageMap[STORAGE_KEY]) as DungeonRunSave;
			expect(Array.isArray(stored.defeatedTrainers)).toBe(true);
			expect(Array.isArray(stored.pickedItems)).toBe(true);
			expect(stored.defeatedTrainers).toHaveLength(3);
			expect(stored.pickedItems).toHaveLength(1);
		});

		it('should handle empty Sets', () => {
			const ctx = new DungeonContext();
			ctx.runSeed = 'empty-run';
			ctx.currentFloor = 1;
			ctx.runCurrency = 0;

			saveDungeonRun(ctx);

			const stored = JSON.parse(storageMap[STORAGE_KEY]) as DungeonRunSave;
			expect(stored.defeatedTrainers).toEqual([]);
			expect(stored.pickedItems).toEqual([]);
		});

		it('should not throw when localStorage is unavailable', () => {
			vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('QuotaExceededError');
			});

			const ctx = new DungeonContext();
			ctx.runSeed = 'seed';
			ctx.currentFloor = 1;
			ctx.runCurrency = 0;

			expect(() => saveDungeonRun(ctx)).not.toThrow();
		});
	});

	describe('loadDungeonRun', () => {
		it('should return null when no data stored', () => {
			expect(loadDungeonRun()).toBeNull();
		});

		it('should load valid stored data', () => {
			const save: DungeonRunSave = {
				runSeed: 'my-seed',
				currentFloor: 5,
				defeatedTrainers: ['1-0', '2-1', '3-2'],
				pickedItems: ['2-0'],
				runCurrency: 120
			};
			storageMap[STORAGE_KEY] = JSON.stringify(save);

			const loaded = loadDungeonRun();
			expect(loaded).toEqual(save);
		});

		it('should return null for corrupt JSON', () => {
			storageMap[STORAGE_KEY] = 'not-valid-json{{{';
			expect(loadDungeonRun()).toBeNull();
		});

		it('should return null when runSeed is missing', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				currentFloor: 3,
				defeatedTrainers: [],
				pickedItems: [],
				runCurrency: 0
			});
			expect(loadDungeonRun()).toBeNull();
		});

		it('should return null when currentFloor is missing', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 'seed',
				defeatedTrainers: [],
				pickedItems: [],
				runCurrency: 0
			});
			expect(loadDungeonRun()).toBeNull();
		});

		it('should return null when runSeed has wrong type', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 123,
				currentFloor: 1,
				defeatedTrainers: [],
				pickedItems: [],
				runCurrency: 0
			});
			expect(loadDungeonRun()).toBeNull();
		});

		it('should return null when currentFloor has wrong type', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 'seed',
				currentFloor: 'three',
				defeatedTrainers: [],
				pickedItems: [],
				runCurrency: 0
			});
			expect(loadDungeonRun()).toBeNull();
		});

		it('should default defeatedTrainers to empty array when not an array', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 'seed',
				currentFloor: 2,
				defeatedTrainers: 'bad',
				pickedItems: [],
				runCurrency: 10
			});

			const loaded = loadDungeonRun();
			expect(loaded).not.toBeNull();
			expect(loaded!.defeatedTrainers).toEqual([]);
		});

		it('should default pickedItems to empty array when not an array', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 'seed',
				currentFloor: 2,
				defeatedTrainers: [],
				pickedItems: 42,
				runCurrency: 10
			});

			const loaded = loadDungeonRun();
			expect(loaded).not.toBeNull();
			expect(loaded!.pickedItems).toEqual([]);
		});

		it('should default runCurrency to 0 when not a number', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 'seed',
				currentFloor: 2,
				defeatedTrainers: [],
				pickedItems: [],
				runCurrency: 'lots'
			});

			const loaded = loadDungeonRun();
			expect(loaded).not.toBeNull();
			expect(loaded!.runCurrency).toBe(0);
		});
	});

	describe('clearDungeonRunSave', () => {
		it('should remove save from localStorage', () => {
			storageMap[STORAGE_KEY] = JSON.stringify({
				runSeed: 'seed',
				currentFloor: 1,
				defeatedTrainers: [],
				pickedItems: [],
				runCurrency: 0
			});

			clearDungeonRunSave();
			expect(storageMap[STORAGE_KEY]).toBeUndefined();
		});

		it('should not throw when nothing to remove', () => {
			expect(() => clearDungeonRunSave()).not.toThrow();
		});

		it('should not throw when localStorage is unavailable', () => {
			vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
				throw new Error('SecurityError');
			});
			expect(() => clearDungeonRunSave()).not.toThrow();
		});
	});

	describe('save/load roundtrip', () => {
		it('should roundtrip all fields correctly', () => {
			const ctx = new DungeonContext();
			ctx.runSeed = 'roundtrip-seed';
			ctx.currentFloor = 7;
			ctx.defeatedTrainers = new Set(['1-0', '3-1', '5-2']);
			ctx.pickedItems = new Set(['2-0', '4-1']);
			ctx.runCurrency = 250;

			saveDungeonRun(ctx);
			const loaded = loadDungeonRun();

			expect(loaded).not.toBeNull();
			expect(loaded!.runSeed).toBe('roundtrip-seed');
			expect(loaded!.currentFloor).toBe(7);
			expect(loaded!.runCurrency).toBe(250);
			expect(loaded!.defeatedTrainers).toHaveLength(3);
			expect(loaded!.pickedItems).toHaveLength(2);
		});

		it('should allow reconstructing Sets from saved arrays', () => {
			const ctx = new DungeonContext();
			ctx.runSeed = 'set-test';
			ctx.currentFloor = 2;
			ctx.defeatedTrainers = new Set(['1-0', '1-1']);
			ctx.pickedItems = new Set(['1-2']);
			ctx.runCurrency = 0;

			saveDungeonRun(ctx);
			const loaded = loadDungeonRun()!;

			const restoredTrainers = new Set(loaded.defeatedTrainers);
			const restoredItems = new Set(loaded.pickedItems);

			expect(restoredTrainers.has('1-0')).toBe(true);
			expect(restoredTrainers.has('1-1')).toBe(true);
			expect(restoredTrainers.size).toBe(2);
			expect(restoredItems.has('1-2')).toBe(true);
			expect(restoredItems.size).toBe(1);
		});

		it('should return null after clear', () => {
			const ctx = new DungeonContext();
			ctx.runSeed = 'to-clear';
			ctx.currentFloor = 1;
			ctx.runCurrency = 0;

			saveDungeonRun(ctx);
			expect(loadDungeonRun()).not.toBeNull();

			clearDungeonRunSave();
			expect(loadDungeonRun()).toBeNull();
		});
	});
});
