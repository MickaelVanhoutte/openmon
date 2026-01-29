import { describe, it, expect } from 'vitest';
import { getStatStageMultiplier, getAccuracyEvasionMultiplier } from '../pokemons/stat-utils';

describe('Stat Stage Multiplier Utilities', () => {
	describe('getStatStageMultiplier', () => {
		// Positive stages: (2 + stage) / 2
		it('should return 1.0 for stage 0', () => {
			expect(getStatStageMultiplier(0)).toBe(1);
		});

		it('should return 1.5 for stage +1', () => {
			expect(getStatStageMultiplier(1)).toBe(1.5);
		});

		it('should return 2.0 for stage +2 (Agility, Swords Dance)', () => {
			expect(getStatStageMultiplier(2)).toBe(2);
		});

		it('should return 2.5 for stage +3', () => {
			expect(getStatStageMultiplier(3)).toBe(2.5);
		});

		it('should return 3.0 for stage +4', () => {
			expect(getStatStageMultiplier(4)).toBe(3);
		});

		it('should return 3.5 for stage +5', () => {
			expect(getStatStageMultiplier(5)).toBe(3.5);
		});

		it('should return 4.0 for stage +6 (max boost)', () => {
			expect(getStatStageMultiplier(6)).toBe(4);
		});

		// Negative stages: 2 / (2 - stage)
		it('should return 0.67 for stage -1', () => {
			expect(getStatStageMultiplier(-1)).toBeCloseTo(2 / 3, 2);
		});

		it('should return 0.5 for stage -2', () => {
			expect(getStatStageMultiplier(-2)).toBe(0.5);
		});

		it('should return 0.4 for stage -3', () => {
			expect(getStatStageMultiplier(-3)).toBeCloseTo(0.4, 2);
		});

		it('should return 0.33 for stage -4', () => {
			expect(getStatStageMultiplier(-4)).toBeCloseTo(2 / 6, 2);
		});

		it('should return 0.286 for stage -5', () => {
			expect(getStatStageMultiplier(-5)).toBeCloseTo(2 / 7, 2);
		});

		it('should return 0.25 for stage -6 (max drop)', () => {
			expect(getStatStageMultiplier(-6)).toBe(0.25);
		});
	});

	describe('getAccuracyEvasionMultiplier', () => {
		// Positive stages: (3 + stage) / 3
		it('should return 1.0 for stage 0', () => {
			expect(getAccuracyEvasionMultiplier(0)).toBe(1);
		});

		it('should return 1.33 for stage +1', () => {
			expect(getAccuracyEvasionMultiplier(1)).toBeCloseTo(4 / 3, 2);
		});

		it('should return 1.67 for stage +2', () => {
			expect(getAccuracyEvasionMultiplier(2)).toBeCloseTo(5 / 3, 2);
		});

		it('should return 2.0 for stage +3', () => {
			expect(getAccuracyEvasionMultiplier(3)).toBe(2);
		});

		it('should return 3.0 for stage +6 (max boost)', () => {
			expect(getAccuracyEvasionMultiplier(6)).toBe(3);
		});

		// Negative stages: 3 / (3 - stage)
		it('should return 0.75 for stage -1', () => {
			expect(getAccuracyEvasionMultiplier(-1)).toBe(0.75);
		});

		it('should return 0.6 for stage -2', () => {
			expect(getAccuracyEvasionMultiplier(-2)).toBeCloseTo(0.6, 2);
		});

		it('should return 0.5 for stage -3', () => {
			expect(getAccuracyEvasionMultiplier(-3)).toBe(0.5);
		});

		it('should return 0.33 for stage -6 (max drop)', () => {
			expect(getAccuracyEvasionMultiplier(-6)).toBeCloseTo(3 / 9, 2);
		});
	});
});
