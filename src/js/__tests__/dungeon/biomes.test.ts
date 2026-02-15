import { describe, it, expect } from 'vitest';
import {
	getBiomeForFloor,
	getBiomeMix,
	getFloorSize,
	BIOMES,
	GRASS_FOREST,
	CAVE_ROCK,
	DARK_HAUNTED
} from '../../dungeon/biomes';

describe('Dungeon Biomes', () => {
	describe('getBiomeForFloor', () => {
		it('should return GRASS_FOREST for floor 1', () => {
			expect(getBiomeForFloor(1)).toBe(GRASS_FOREST);
		});

		it('should return GRASS_FOREST for floor 10', () => {
			expect(getBiomeForFloor(10)).toBe(GRASS_FOREST);
		});

		it('should return CAVE_ROCK for floor 11', () => {
			expect(getBiomeForFloor(11)).toBe(CAVE_ROCK);
		});

		it('should return WATER_SWAMP for floor 25', () => {
			expect(getBiomeForFloor(25).name).toBe('Water Swamp');
		});

		it('should return DARK_HAUNTED for floor 41', () => {
			expect(getBiomeForFloor(41)).toBe(DARK_HAUNTED);
		});

		it('should return DARK_HAUNTED for floor 50', () => {
			expect(getBiomeForFloor(50)).toBe(DARK_HAUNTED);
		});

		it('should return DARK_HAUNTED for floor 100', () => {
			expect(getBiomeForFloor(100)).toBe(DARK_HAUNTED);
		});
	});

	describe('getBiomeMix', () => {
		it('should return only current biome for mid-range floor', () => {
			const mix = getBiomeMix(5);
			expect(mix).toHaveLength(1);
			expect(mix[0]).toBe(GRASS_FOREST);
		});

		it('should return only current biome for floor 9 (mid-biome, no transition)', () => {
			// With cycling, floor 9 and floor 10 are both GRASS_FOREST, so no mix
			const mix = getBiomeMix(9);
			expect(mix).toHaveLength(1);
			expect(mix[0]).toBe(GRASS_FOREST);
		});

		it('should return current and next biome for floor 10 (boundary)', () => {
			const mix = getBiomeMix(10);
			expect(mix).toHaveLength(2);
			expect(mix[0]).toBe(GRASS_FOREST);
			expect(mix[1]).toBe(CAVE_ROCK);
		});

		it('should return transition mix for floor 50 (cycles to GRASS_FOREST at 51)', () => {
			// With infinite cycling, floor 50 is the last DARK_HAUNTED floor
			// and floor 51 cycles back to GRASS_FOREST
			const mix = getBiomeMix(50);
			expect(mix).toHaveLength(2);
			expect(mix[0]).toBe(DARK_HAUNTED);
			expect(mix[1]).toBe(GRASS_FOREST);
		});
	});

	describe('getFloorSize', () => {
		it('should return min size for first floor of biome', () => {
			const size = getFloorSize(1, GRASS_FOREST);
			expect(size.width).toBe(15);
			expect(size.height).toBe(15);
		});

		it('should return max size for last floor of biome', () => {
			const size = getFloorSize(10, GRASS_FOREST);
			expect(size.width).toBe(25);
			expect(size.height).toBe(25);
		});

		it('should return intermediate size for mid floor', () => {
			const size = getFloorSize(5, GRASS_FOREST);
			expect(size.width).toBeGreaterThan(15);
			expect(size.width).toBeLessThan(25);
		});

		it('should be deterministic', () => {
			const size1 = getFloorSize(5, GRASS_FOREST);
			const size2 = getFloorSize(5, GRASS_FOREST);
			expect(size1).toEqual(size2);
		});
	});

	describe('Biome Configurations', () => {
		it('should have valid monster tables', () => {
			BIOMES.forEach((biome) => {
				biome.monsterTable.forEach((entry) => {
					expect(entry.id).toBeGreaterThan(0);
					expect(Number.isInteger(entry.id)).toBe(true);
					expect(entry.weight).toBeGreaterThan(0);
				});
			});
		});

		it('should have valid level ranges', () => {
			BIOMES.forEach((biome) => {
				expect(biome.levelRange[0]).toBeLessThan(biome.levelRange[1]);
			});
		});

		it('should have valid encounter rates', () => {
			BIOMES.forEach((biome) => {
				expect(biome.encounterRate).toBeGreaterThan(0);
				expect(biome.encounterRate).toBeLessThanOrEqual(1);
			});
		});
	});
});
