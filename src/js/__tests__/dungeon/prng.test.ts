import { describe, it, expect } from 'vitest';
import { SeededRNG, deriveSeed } from '../../dungeon/prng';

describe('SeededRNG', () => {
	const SEED = 'test-seed';

	it('should produce the same sequence for the same seed', () => {
		const rng1 = new SeededRNG(SEED);
		const rng2 = new SeededRNG(SEED);

		for (let i = 0; i < 10; i++) {
			expect(rng1.next()).toBe(rng2.next());
		}
	});

	it('should produce different sequences for different seeds', () => {
		const rng1 = new SeededRNG('seed-1');
		const rng2 = new SeededRNG('seed-2');

		let different = false;
		for (let i = 0; i < 10; i++) {
			if (rng1.next() !== rng2.next()) {
				different = true;
				break;
			}
		}
		expect(different).toBe(true);
	});

	it('nextInt should respect bounds inclusive', () => {
		const rng = new SeededRNG(SEED);
		const min = 5;
		const max = 10;
		const results = new Set<number>();

		for (let i = 0; i < 100; i++) {
			const val = rng.nextInt(min, max);
			expect(val).toBeGreaterThanOrEqual(min);
			expect(val).toBeLessThanOrEqual(max);
			results.add(val);
		}

		expect(results.has(min)).toBe(true);
		expect(results.has(max)).toBe(true);
	});

	it('nextBool should return boolean', () => {
		const rng = new SeededRNG(SEED);
		expect(typeof rng.nextBool()).toBe('boolean');
	});

	it('nextBool should respect probability', () => {
		const rng = new SeededRNG(SEED);
		let trueCount = 0;
		const iterations = 1000;
		for (let i = 0; i < iterations; i++) {
			if (rng.nextBool(0.2)) {
				trueCount++;
			}
		}
		expect(trueCount).toBeGreaterThan(150);
		expect(trueCount).toBeLessThan(250);
	});

	it('shuffle should return a new array and not mutate input', () => {
		const rng = new SeededRNG(SEED);
		const input = [1, 2, 3, 4, 5];
		const inputCopy = [...input];
		const shuffled = rng.shuffle(input);

		expect(shuffled).not.toBe(input);
		expect(input).toEqual(inputCopy);
		expect([...shuffled].sort()).toEqual([...input].sort());
	});

	it('pick should return an element from the array', () => {
		const rng = new SeededRNG(SEED);
		const input = ['a', 'b', 'c'];
		for (let i = 0; i < 10; i++) {
			const picked = rng.pick(input);
			expect(input).toContain(picked);
		}
	});

	it('pick should throw on empty array', () => {
		const rng = new SeededRNG(SEED);
		expect(() => rng.pick([])).toThrow('Cannot pick from an empty array');
	});
});

describe('deriveSeed', () => {
	it('should produce consistent results', () => {
		expect(deriveSeed('run-1', 1)).toBe('run-1-floor-1');
		expect(deriveSeed('run-1', 2)).toBe('run-1-floor-2');
	});
});
