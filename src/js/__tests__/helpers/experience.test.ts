import { describe, it, expect, vi } from 'vitest';
import { ExperienceCalculator, EXPERIENCE_CHART } from '../../pokemons/experience';

describe('ExperienceCalculator', () => {
	describe('constructor', () => {
		it('loads the xp chart data', () => {
			expect(EXPERIENCE_CHART.ready).toBe(true);
			expect(EXPERIENCE_CHART.chartById.size).toBeGreaterThan(0);
		});
	});

	describe('howMuchINeed', () => {
		it('returns xp needed for a valid level and growth rate', () => {
			const xp = EXPERIENCE_CHART.howMuchINeed(10, 1);
			expect(xp).toBeGreaterThan(0);
		});

		it('returns more xp at higher levels', () => {
			const xp10 = EXPERIENCE_CHART.howMuchINeed(10, 1);
			const xp50 = EXPERIENCE_CHART.howMuchINeed(50, 1);
			expect(xp50).toBeGreaterThan(xp10);
		});

		it('returns MAX_SAFE_INTEGER for level >= 100', () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const xp = EXPERIENCE_CHART.howMuchINeed(100, 1);
			expect(xp).toBe(Number.MAX_SAFE_INTEGER);
			spy.mockRestore();
		});

		it('returns MAX_SAFE_INTEGER for level < 1', () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const xp = EXPERIENCE_CHART.howMuchINeed(0, 1);
			expect(xp).toBe(Number.MAX_SAFE_INTEGER);
			spy.mockRestore();
		});

		it('returns MAX_SAFE_INTEGER for invalid growth rate', () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const xp = EXPERIENCE_CHART.howMuchINeed(10, 999);
			expect(xp).toBe(Number.MAX_SAFE_INTEGER);
			spy.mockRestore();
		});

		it('returns different values for different growth rates', () => {
			const xpRate1 = EXPERIENCE_CHART.howMuchINeed(50, 1);
			const xpRate4 = EXPERIENCE_CHART.howMuchINeed(50, 4);
			expect(xpRate1).not.toBe(xpRate4);
		});
	});

	describe('howMuchIGet', () => {
		it('returns xp gained from defeating an opponent', () => {
			const fakeOpponent = { baseXp: 64, level: 20 } as any;
			const xp = EXPERIENCE_CHART.howMuchIGet(fakeOpponent, 1, false, false);
			expect(xp).toBeGreaterThan(0);
		});

		it('gives 1.5x xp from trainer battles', () => {
			const fakeOpponent = { baseXp: 64, level: 20 } as any;
			const wildXp = EXPERIENCE_CHART.howMuchIGet(fakeOpponent, 1, false, false);
			const trainerXp = EXPERIENCE_CHART.howMuchIGet(fakeOpponent, 1, true, false);
			expect(trainerXp).toBeGreaterThan(wildXp);
		});

		it('halves xp with xpShare', () => {
			const fakeOpponent = { baseXp: 64, level: 20 } as any;
			const normalXp = EXPERIENCE_CHART.howMuchIGet(fakeOpponent, 1, false, false);
			const sharedXp = EXPERIENCE_CHART.howMuchIGet(fakeOpponent, 1, false, true);
			expect(sharedXp).toBe(Math.floor(normalXp / 2));
		});

		it('scales with opponent level', () => {
			const low = { baseXp: 64, level: 10 } as any;
			const high = { baseXp: 64, level: 50 } as any;
			const xpLow = EXPERIENCE_CHART.howMuchIGet(low, 1, false, false);
			const xpHigh = EXPERIENCE_CHART.howMuchIGet(high, 1, false, false);
			expect(xpHigh).toBeGreaterThan(xpLow);
		});
	});
});
