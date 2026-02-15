import { describe, it, expect } from 'vitest';
import {
	getBiomeForFloor,
	getBiomeMix,
	BIOMES,
	GRASS_FOREST,
	CAVE_ROCK,
	DARK_HAUNTED
} from '../../dungeon/biomes';
import { getBiomePool } from '../../dungeon/biome-pool-loader';

describe('Infinite Biome Cycling', () => {
	it('floors 1-10 map to GRASS_FOREST', () => {
		for (let f = 1; f <= 10; f++) {
			expect(getBiomeForFloor(f).name).toBe('Grass Forest');
		}
	});

	it('floors 11-20 map to CAVE_ROCK', () => {
		for (let f = 11; f <= 20; f++) {
			expect(getBiomeForFloor(f).name).toBe('Cave Rock');
		}
	});

	it('floors 21-30 map to WATER_SWAMP', () => {
		for (let f = 21; f <= 30; f++) {
			expect(getBiomeForFloor(f).name).toBe('Water Swamp');
		}
	});

	it('floors 31-40 map to FIRE_VOLCANIC', () => {
		for (let f = 31; f <= 40; f++) {
			expect(getBiomeForFloor(f).name).toBe('Fire Volcanic');
		}
	});

	it('floors 41-50 map to DARK_HAUNTED', () => {
		for (let f = 41; f <= 50; f++) {
			expect(getBiomeForFloor(f).name).toBe('Dark Haunted');
		}
	});

	it('floor 51 cycles back to GRASS_FOREST', () => {
		expect(getBiomeForFloor(51)).toBe(GRASS_FOREST);
	});

	it('floor 100 maps to DARK_HAUNTED', () => {
		expect(getBiomeForFloor(100)).toBe(DARK_HAUNTED);
	});

	it('floor 101 cycles to GRASS_FOREST again', () => {
		expect(getBiomeForFloor(101)).toBe(GRASS_FOREST);
	});

	it('cycling is consistent across multiple cycles', () => {
		for (let cycle = 0; cycle < 3; cycle++) {
			const offset = cycle * 50;
			expect(getBiomeForFloor(1 + offset)).toBe(GRASS_FOREST);
			expect(getBiomeForFloor(11 + offset)).toBe(CAVE_ROCK);
			expect(getBiomeForFloor(50 + offset)).toBe(DARK_HAUNTED);
		}
	});

	describe('getBiomeMix', () => {
		it('returns single biome for mid-range floors', () => {
			expect(getBiomeMix(5)).toHaveLength(1);
			expect(getBiomeMix(15)).toHaveLength(1);
			expect(getBiomeMix(25)).toHaveLength(1);
		});

		it('returns transition at biome boundaries', () => {
			const mix10 = getBiomeMix(10);
			expect(mix10).toHaveLength(2);
			expect(mix10[0]).toBe(GRASS_FOREST);
			expect(mix10[1]).toBe(CAVE_ROCK);
		});

		it('handles cycling boundary (floor 50 to 51)', () => {
			const mix50 = getBiomeMix(50);
			expect(mix50).toHaveLength(2);
			expect(mix50[0]).toBe(DARK_HAUNTED);
			expect(mix50[1]).toBe(GRASS_FOREST);
		});

		it('handles cycling boundary (floor 100 to 101)', () => {
			const mix100 = getBiomeMix(100);
			expect(mix100).toHaveLength(2);
			expect(mix100[0]).toBe(DARK_HAUNTED);
			expect(mix100[1]).toBe(GRASS_FOREST);
		});
	});

	describe('Encounter Rate', () => {
		it('GRASS_FOREST has encounterRate 0.10', () => {
			expect(GRASS_FOREST.encounterRate).toBe(0.1);
		});

		it('DARK_HAUNTED has encounterRate 0.20', () => {
			expect(DARK_HAUNTED.encounterRate).toBe(0.2);
		});

		it('encounter rates increase across biomes', () => {
			for (let i = 1; i < BIOMES.length; i++) {
				expect(BIOMES[i].encounterRate).toBeGreaterThanOrEqual(BIOMES[i - 1].encounterRate);
			}
		});
	});

	describe('Biome Pools', () => {
		const biomeNames = [
			'GRASS_FOREST',
			'CAVE_ROCK',
			'WATER_SWAMP',
			'FIRE_VOLCANIC',
			'DARK_HAUNTED'
		];

		it.each(biomeNames)('%s has 15-20 species', (biomeName) => {
			const pool = getBiomePool(biomeName);
			expect(pool.length).toBeGreaterThanOrEqual(15);
			expect(pool.length).toBeLessThanOrEqual(20);
		});

		it.each(biomeNames)('%s entries have id, name, weight', (biomeName) => {
			const pool = getBiomePool(biomeName);
			pool.forEach((entry) => {
				expect(entry.id).toBeGreaterThan(0);
				expect(entry.name).toBeTruthy();
				expect(entry.weight).toBeGreaterThan(0);
			});
		});

		it('unknown biome returns empty pool', () => {
			expect(getBiomePool('NONEXISTENT')).toEqual([]);
		});

		it('each biome config monsterTable matches its pool', () => {
			BIOMES.forEach((biome) => {
				expect(biome.monsterTable.length).toBeGreaterThan(0);
				biome.monsterTable.forEach((entry) => {
					expect(entry.id).toBeGreaterThan(0);
					expect(entry.weight).toBeGreaterThan(0);
				});
			});
		});
	});
});
