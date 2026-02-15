import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DungeonContext } from '../../dungeon/dungeon-context';
import { generateFloor } from '../../dungeon/floor-generator';
import { generateRestFloor, generateBossFloor } from '../../dungeon/special-floors';
import { getBiomeForFloor } from '../../dungeon/biomes';
import { getDifficulty } from '../../dungeon/difficulty';
import { SeededRNG, deriveSeed } from '../../dungeon/prng';
import { createTrainer } from '../../dungeon/trainer-factory';
import { placeItems } from '../../dungeon/item-placer';
import { loadMetaProgress } from '../../dungeon/meta-progress';
import { Position } from '../../mapping/positions';

describe('Dungeon Integration Tests', () => {
	let ctx: DungeonContext;

	beforeEach(() => {
		vi.spyOn(Storage.prototype, 'getItem');
		vi.spyOn(Storage.prototype, 'setItem');
		localStorage.clear();
		ctx = new DungeonContext();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Full Dungeon Run Flow', () => {
		it('should handle a full run from start to boss', () => {
			const seed = 'test-seed-42';
			ctx.startRun(seed);
			ctx.advanceFloor();
			expect(ctx.currentFloor).toBe(1);

			const biome1 = getBiomeForFloor(1);
			const floor1 = generateFloor(deriveSeed(seed, 1), 1, biome1);
			expect(floor1.playerStart).toBeDefined();
			expect(floor1.stairsPosition).toBeDefined();
			expect(floor1.threlteMap.tiles.length).toBeGreaterThan(0);

			ctx.advanceFloor();
			expect(ctx.currentFloor).toBe(2);
			const biome2 = getBiomeForFloor(2);
			const floor2 = generateFloor(deriveSeed(seed, 2), 2, biome2);
			expect(floor2.playerStart).not.toEqual(floor1.playerStart);

			ctx.currentFloor = 4;
			expect(ctx.getCurrentFloorType()).toBe('rest');
			const restFloor = generateRestFloor(4, ctx.runSeed);
			expect(restFloor.threlteMap.tiles.length).toBe(10);

			ctx.currentFloor = 5;
			expect(ctx.getCurrentFloorType()).toBe('boss');
			const bossFloor = generateBossFloor(5, ctx.runSeed);
			expect(bossFloor.threlteMap.tiles.length).toBe(15);

			const meta = ctx.endRun(true);
			expect(meta.bestFloor).toBe(5);
		});
	});

	describe('Biome Transitions', () => {
		it('should transition biomes correctly', () => {
			const biome1 = getBiomeForFloor(1);
			const biome11 = getBiomeForFloor(11);
			expect(biome1.name).not.toBe(biome11.name);

			const floor1 = generateFloor(deriveSeed('seed', 1), 1, biome1);
			const floor11 = generateFloor(deriveSeed('seed', 11), 11, biome11);

			expect(floor1.threlteMap.tiles.length).toBeGreaterThan(0);
			expect(floor11.threlteMap.tiles.length).toBeGreaterThan(0);
			expect(floor1.threlteMap.tiles[0][0]).toBeDefined();
		});
	});

	describe('Difficulty Scaling', () => {
		it('should scale difficulty with floor number', () => {
			const diff1 = getDifficulty(1);
			const diff30 = getDifficulty(30);

			expect(diff30.pokemonLevel.min).toBeGreaterThan(diff1.pokemonLevel.min);
			expect(diff30.trainerCount.min).toBeGreaterThanOrEqual(diff1.trainerCount.min);

			const rng = new SeededRNG('seed');
			const biome = getBiomeForFloor(1);
			const trainer1 = createTrainer(new Position(0, 0), 'down', 1, biome, rng);
			const trainer30 = createTrainer(new Position(0, 0), 'down', 30, biome, rng);

			expect(trainer1).toBeDefined();
			expect(trainer30).toBeDefined();
		});
	});

	describe('Item Placement and Tracking', () => {
		it('should place and track items correctly', () => {
			const seed = 'item-test';
			const biome = getBiomeForFloor(1);
			const floorData = generateFloor(deriveSeed(seed, 1), 1, biome);
			const rng = new SeededRNG(deriveSeed(seed, 1));

			const items = placeItems(floorData.itemPositions, 1, rng);
			expect(Array.isArray(items)).toBe(true);

			ctx.pickedItems.add('1-0');
			expect(ctx.pickedItems.has('1-0')).toBe(true);
		});
	});

	describe('Meta-Progression Across Runs', () => {
		it('should track meta-progression across multiple runs', () => {
			ctx.startRun('run1');
			ctx.currentFloor = 5;
			ctx.endRun(false);

			let meta = loadMetaProgress();
			expect(meta.totalRuns).toBe(1);
			expect(meta.bestFloor).toBe(5);

			ctx = new DungeonContext();
			ctx.startRun('run2');
			ctx.currentFloor = 3;
			ctx.endRun(false);

			meta = loadMetaProgress();
			expect(meta.totalRuns).toBe(2);
			expect(meta.bestFloor).toBe(5);
		});
	});
});
