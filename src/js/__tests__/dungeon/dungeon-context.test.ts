import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DungeonContext, dungeonContext } from '../../dungeon/dungeon-context';
import { get } from 'svelte/store';

describe('DungeonContext', () => {
	let context: DungeonContext;

	beforeEach(() => {
		context = new DungeonContext();
	});

	it('should initialize with default values', () => {
		expect(context.runSeed).toBe('');
		expect(context.currentFloor).toBe(0);
		expect(context.isDungeonMode).toBe(false);
		expect(context.isRunActive).toBe(false);
		expect(context.currentBiome).toBeUndefined();
		expect(context.defeatedTrainers.size).toBe(0);
		expect(context.pickedItems.size).toBe(0);
		expect(context.bestFloor).toBe(0);
		expect(context.runCurrency).toBe(0);
	});

	it('should start a run correctly', () => {
		const seed = 'test-seed';
		context.startRun(seed);

		expect(context.isDungeonMode).toBe(true);
		expect(context.isRunActive).toBe(true);
		expect(context.currentFloor).toBe(0);
		expect(context.runSeed).toBe(seed);
		expect(context.currentBiome).toBeDefined();
		expect(context.runCurrency).toBe(0);
	});

	it('should generate a seed if not provided', () => {
		const now = 123456789;
		vi.spyOn(Date, 'now').mockReturnValue(now);

		context.startRun();
		expect(context.runSeed).toBe(now.toString());

		vi.restoreAllMocks();
	});

	it('should advance floor correctly', () => {
		context.startRun('seed');

		context.advanceFloor();
		expect(context.currentFloor).toBe(1);
		expect(context.currentBiome).toBeDefined();
	});

	it('should end run correctly when won', () => {
		context.startRun('seed');
		context.advanceFloor();
		context.endRun(true);

		expect(context.isRunActive).toBe(false);
		expect(context.isDungeonMode).toBe(true);
		expect(context.bestFloor).toBe(1);
	});

	it('should end run correctly when lost', () => {
		context.startRun('seed');
		context.advanceFloor();
		context.endRun(false);

		expect(context.isRunActive).toBe(false);
		expect(context.isDungeonMode).toBe(false);
		expect(context.bestFloor).toBe(1);
	});

	it('should only update bestFloor if currentFloor is higher', () => {
		context.bestFloor = 5;
		context.currentFloor = 3;
		context.endRun(true);
		expect(context.bestFloor).toBe(5);

		context.currentFloor = 10;
		context.endRun(true);
		expect(context.bestFloor).toBe(10);
	});

	it('should identify boss floors correctly', () => {
		expect(context.isFloorBoss(5)).toBe(true);
		expect(context.isFloorBoss(10)).toBe(true);
		expect(context.isFloorBoss(1)).toBe(false);
		expect(context.isFloorBoss(0)).toBe(false);
	});

	it('should identify rest floors correctly', () => {
		expect(context.isFloorRest(4)).toBe(true);
		expect(context.isFloorRest(9)).toBe(true);
		expect(context.isFloorRest(5)).toBe(false);
		expect(context.isFloorRest(1)).toBe(false);
	});

	it('should return correct floor type', () => {
		context.currentFloor = 5;
		expect(context.getCurrentFloorType()).toBe('boss');

		context.currentFloor = 4;
		expect(context.getCurrentFloorType()).toBe('rest');

		context.currentFloor = 1;
		expect(context.getCurrentFloorType()).toBe('normal');
	});

	it('should derive floor seed deterministically', () => {
		context.runSeed = 'my-seed';
		context.currentFloor = 1;
		const seed1 = context.getFloorSeed();

		const seed2 = context.getFloorSeed();
		expect(seed1).toBe(seed2);
		expect(seed1).toContain('my-seed');
		expect(seed1).toContain('1');
	});

	it('should track defeated trainers and picked items', () => {
		context.defeatedTrainers.add('1-0');
		context.pickedItems.add('1-2');

		expect(context.defeatedTrainers.has('1-0')).toBe(true);
		expect(context.pickedItems.has('1-2')).toBe(true);

		context.startRun();
		expect(context.defeatedTrainers.size).toBe(0);
		expect(context.pickedItems.size).toBe(0);
	});

	it('should export a functional writable store', () => {
		expect(get(dungeonContext)).toBeUndefined();

		const newContext = new DungeonContext();
		dungeonContext.set(newContext);
		expect(get(dungeonContext)).toBe(newContext);
	});
});
