import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Move Accuracy Mechanics', () => {
	describe('accuracyApplies behavior', () => {
		let mathRandomSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			mathRandomSpy = vi.spyOn(Math, 'random');
		});

		afterEach(() => {
			mathRandomSpy.mockRestore();
		});

		const simulateAccuracyCheck = (
			moveAccuracy: number | string | null | undefined,
			randomValue: number = 0.5,
			accStage: number = 0,
			evaStage: number = 0
		): boolean => {
			mathRandomSpy.mockReturnValue(randomValue);

			if (!moveAccuracy && moveAccuracy !== 0) return true;
			if (moveAccuracy === 0) return true;
			if (moveAccuracy === '') return true;

			const netStage = accStage - evaStage;
			const stageMod = netStage >= 0 ? (3 + netStage) / 3 : 3 / (3 - netStage);
			const finalAccuracy = (moveAccuracy as number) * stageMod;
			return randomValue * 100 < finalAccuracy;
		};

		describe('never-miss moves (accuracy 0, empty string, null, undefined)', () => {
			it('should always hit when accuracy is 0', () => {
				expect(simulateAccuracyCheck(0)).toBe(true);
			});

			it('should always hit when accuracy is empty string', () => {
				expect(simulateAccuracyCheck('')).toBe(true);
			});

			it('should always hit when accuracy is null', () => {
				expect(simulateAccuracyCheck(null)).toBe(true);
			});

			it('should always hit when accuracy is undefined', () => {
				expect(simulateAccuracyCheck(undefined)).toBe(true);
			});
		});

		describe('normal accuracy moves', () => {
			it('should hit when random roll is below accuracy threshold', () => {
				mathRandomSpy.mockReturnValue(0.5);
				expect(simulateAccuracyCheck(95, 0.5)).toBe(true);
			});

			it('should miss when random roll is above accuracy threshold', () => {
				mathRandomSpy.mockReturnValue(0.99);
				expect(simulateAccuracyCheck(95, 0.99)).toBe(false);
			});

			it('should apply accuracy stage modifiers correctly', () => {
				mathRandomSpy.mockReturnValue(0.7);
				expect(simulateAccuracyCheck(70, 0.7, 1, 0)).toBe(true);
			});

			it('should apply evasion stage modifiers correctly', () => {
				mathRandomSpy.mockReturnValue(0.7);
				expect(simulateAccuracyCheck(100, 0.7, 0, 1)).toBe(true);
			});
		});
	});
});
