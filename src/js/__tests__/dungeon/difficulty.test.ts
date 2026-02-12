import { describe, it, expect } from 'vitest';
import { getDifficulty } from '../../dungeon/difficulty';

describe('Difficulty Scaling', () => {
	it('should return base values for floor 1', () => {
		const config = getDifficulty(1);

		expect(config.pokemonLevel.min).toBe(3);
		expect(config.pokemonLevel.max).toBe(7);

		expect(config.trainerCount.min).toBe(1);
		expect(config.trainerCount.max).toBe(3);

		expect(config.encounterRate).toBeCloseTo(0.05, 4);

		expect(config.wallDensity).toBeCloseTo(0.4, 4);
	});

	it('should scale correctly for floor 25', () => {
		const config = getDifficulty(25);

		expect(config.pokemonLevel.min).toBe(47);
		expect(config.pokemonLevel.max).toBe(51);

		expect(config.trainerCount.min).toBe(4);
		expect(config.trainerCount.max).toBe(6);

		expect(config.encounterRate).toBeCloseTo(0.086, 3);

		expect(config.wallDensity).toBeCloseTo(0.447, 3);
	});

	it('should scale correctly for floor 50', () => {
		const config = getDifficulty(50);

		expect(config.pokemonLevel.min).toBe(98);
		expect(config.pokemonLevel.max).toBe(100);

		expect(config.trainerCount.min).toBe(16);
		expect(config.trainerCount.max).toBe(18);

		expect(config.encounterRate).toBeCloseTo(0.152, 3);

		expect(config.wallDensity).toBeCloseTo(0.501, 3);
	});

	it('should clamp values at floor 100', () => {
		const config = getDifficulty(100);

		expect(config.pokemonLevel.min).toBe(98);
		expect(config.pokemonLevel.max).toBe(100);

		expect(config.trainerCount.min).toBeLessThanOrEqual(20);
		expect(config.trainerCount.max).toBeLessThanOrEqual(22);

		expect(config.encounterRate).toBeLessThanOrEqual(0.25);
		expect(config.wallDensity).toBeLessThanOrEqual(0.6);
	});

	it('should handle floor numbers less than 1', () => {
		const config = getDifficulty(0);
		const config1 = getDifficulty(1);
		expect(config).toEqual(config1);
	});
});
