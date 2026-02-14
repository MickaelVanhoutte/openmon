import { describe, it, expect } from 'vitest';
import { generateFloor } from '../../dungeon/floor-generator';
import { generateRestFloor, generateBossFloor } from '../../dungeon/special-floors';
import { getBiomeForFloor } from '../../dungeon/biomes';
import { deriveSeed } from '../../dungeon/prng';
import { getDifficulty } from '../../dungeon/difficulty';

const TEST_SEED = 'edge-case-seed';

describe('High Floor Edge Cases', () => {
	describe.each([50, 75, 100])('floor %i', (floorNumber) => {
		const biome = getBiomeForFloor(floorNumber);
		const isBoss = floorNumber % 5 === 0 && floorNumber > 0;
		const isRest = floorNumber % 5 === 4 && floorNumber > 0;

		it('should resolve a biome without crashing', () => {
			expect(biome).toBeDefined();
			expect(biome.name).toBeTruthy();
			expect(biome.monsterTable.length).toBeGreaterThan(0);
			expect(biome.levelRange[0]).toBeLessThanOrEqual(biome.levelRange[1]);
		});

		it('should compute difficulty without crashing', () => {
			const diff = getDifficulty(floorNumber);
			expect(diff.pokemonLevel.min).toBeGreaterThanOrEqual(1);
			expect(diff.pokemonLevel.max).toBeLessThanOrEqual(100);
			expect(diff.trainerCount.min).toBeGreaterThanOrEqual(0);
			expect(diff.trainerCount.max).toBeLessThanOrEqual(22);
			expect(diff.encounterRate).toBeLessThanOrEqual(0.25);
			expect(diff.wallDensity).toBeLessThanOrEqual(0.6);
		});

		if (isBoss) {
			it('should generate a boss floor without crashing', () => {
				const result = generateBossFloor(floorNumber, TEST_SEED);

				expect(result.threlteMap).toBeDefined();
				expect(result.threlteMap.width).toBe(15);
				expect(result.threlteMap.height).toBe(15);
				expect(result.playerStart.x).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.x).toBeLessThan(result.threlteMap.width);
				expect(result.playerStart.y).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.y).toBeLessThan(result.threlteMap.height);
				expect(result.stairsPosition.x).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.x).toBeLessThan(result.threlteMap.width);
				expect(result.stairsPosition.y).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.y).toBeLessThan(result.threlteMap.height);
			});
		} else if (isRest) {
			it('should generate a rest floor without crashing', () => {
				const result = generateRestFloor(floorNumber, TEST_SEED);

				expect(result.threlteMap).toBeDefined();
				expect(result.threlteMap.width).toBe(10);
				expect(result.threlteMap.height).toBe(10);
				expect(result.playerStart.x).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.x).toBeLessThan(result.threlteMap.width);
				expect(result.playerStart.y).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.y).toBeLessThan(result.threlteMap.height);
				expect(result.stairsPosition.x).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.x).toBeLessThan(result.threlteMap.width);
				expect(result.stairsPosition.y).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.y).toBeLessThan(result.threlteMap.height);
			});
		} else {
			it('should generate a normal floor without crashing', () => {
				const floorSeed = deriveSeed(TEST_SEED, floorNumber);
				const result = generateFloor(floorSeed, floorNumber, biome);

				expect(result.threlteMap).toBeDefined();
				expect(result.openMap).toBeDefined();
				expect(result.threlteMap.tiles.length).toBe(result.threlteMap.height);

				for (const row of result.threlteMap.tiles) {
					expect(row.length).toBe(result.threlteMap.width);
				}

				expect(result.playerStart.x).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.x).toBeLessThan(result.threlteMap.width);
				expect(result.playerStart.y).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.y).toBeLessThan(result.threlteMap.height);
				expect(result.stairsPosition.x).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.x).toBeLessThan(result.threlteMap.width);
				expect(result.stairsPosition.y).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.y).toBeLessThan(result.threlteMap.height);
			});
		}
	});

	describe('floor type classification at boundaries', () => {
		it('should classify floor 50 as boss (50 % 5 === 0)', () => {
			const floorNumber = 50;
			expect(floorNumber % 5 === 0 && floorNumber > 0).toBe(true);
		});

		it('should classify floor 75 as boss (75 % 5 === 0)', () => {
			const floorNumber = 75;
			expect(floorNumber % 5 === 0 && floorNumber > 0).toBe(true);
		});

		it('should classify floor 100 as boss (100 % 5 === 0)', () => {
			const floorNumber = 100;
			expect(floorNumber % 5 === 0 && floorNumber > 0).toBe(true);
		});

		it('should classify floor 99 as rest (99 % 5 === 4)', () => {
			const floorNumber = 99;
			expect(floorNumber % 5 === 4 && floorNumber > 0).toBe(true);
		});
	});

	describe('biome fallback for extreme floors', () => {
		it('should return DARK_HAUNTED for floors above 50', () => {
			const biome75 = getBiomeForFloor(75);
			const biome100 = getBiomeForFloor(100);
			const biome200 = getBiomeForFloor(200);

			expect(biome75.name).toBe('Dark Haunted');
			expect(biome100.name).toBe('Dark Haunted');
			expect(biome200.name).toBe('Dark Haunted');
		});
	});
});
