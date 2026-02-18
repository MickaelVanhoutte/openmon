import { describe, it, expect } from 'vitest';
import { PokedexEntry, Stats, SHINY_RATE } from '../pokemons/pokedex';

function createTestEntry(
	overrides: { viewed?: boolean; caught?: boolean; percentageMale?: number } = {}
): PokedexEntry {
	return new PokedexEntry(
		1,
		1,
		'Bulbasaur',
		['grass', 'poison'],
		['overgrow'],
		[],
		new Stats(45, 49, 49, 65, 65, 45),
		0.7,
		6.9,
		'A strange seed was planted on its back at birth.',
		false,
		45,
		4,
		64,
		overrides.percentageMale ?? 87.5,
		[],
		undefined,
		overrides.viewed ?? false,
		overrides.caught ?? false
	);
}

describe('PokedexEntry.viewed flag', () => {
	it('should default viewed to false when not provided', () => {
		const entry = createTestEntry();
		expect(entry.viewed).toBe(false);
	});

	it('should respect viewed=true when explicitly set', () => {
		const entry = createTestEntry({ viewed: true });
		expect(entry.viewed).toBe(true);
	});

	it('should respect viewed=false when explicitly set', () => {
		const entry = createTestEntry({ viewed: false });
		expect(entry.viewed).toBe(false);
	});
});

describe('PokedexEntry.instanciate - shiny rate', () => {
	it('should export SHINY_RATE constant as 2048', () => {
		expect(SHINY_RATE).toBe(2048);
	});

	it('should produce very few shiny Pokemon at normal rate', () => {
		const entry = createTestEntry();
		let shinyCount = 0;
		const trials = 1000;

		for (let i = 0; i < trials; i++) {
			const instance = entry.instanciate(5);
			if (instance.isShiny) {
				shinyCount++;
			}
		}

		// With 1/2048 rate and 1000 trials, expected ~0.49 shinies
		// If rate were 50%, expected ~500 shinies
		// Threshold of 10 catches any broken high rate
		expect(shinyCount).toBeLessThan(10);
	});

	it('should respect forceShiny=true', () => {
		const entry = createTestEntry();
		const instance = entry.instanciate(5, 0, true);
		expect(instance.isShiny).toBe(true);
	});
});

describe('PokemonInstance gender calculation', () => {
	it('should produce both male and female when percentageMale is 50', () => {
		const entry = createTestEntry({ percentageMale: 50 });
		let maleCount = 0;
		let femaleCount = 0;
		const trials = 200;

		for (let i = 0; i < trials; i++) {
			const instance = entry.instanciate(5);
			if (instance.gender === 'male') {
				maleCount++;
			} else if (instance.gender === 'female') {
				femaleCount++;
			}
		}

		// Both genders should appear with 50% rate
		expect(maleCount).toBeGreaterThan(0);
		expect(femaleCount).toBeGreaterThan(0);
	});

	it('should produce mostly male when percentageMale is 87.5', () => {
		const entry = createTestEntry({ percentageMale: 87.5 });
		let maleCount = 0;
		let femaleCount = 0;
		const trials = 200;

		for (let i = 0; i < trials; i++) {
			const instance = entry.instanciate(5);
			if (instance.gender === 'male') {
				maleCount++;
			} else if (instance.gender === 'female') {
				femaleCount++;
			}
		}

		expect(maleCount).toBeGreaterThan(femaleCount);
		// Some females should still appear
		expect(femaleCount).toBeGreaterThan(0);
	});

	it('should return unknown gender when percentageMale is 0', () => {
		const entry = createTestEntry({ percentageMale: 0 });
		const instance = entry.instanciate(5);
		expect(instance.gender).toBe('unknown');
	});
});
