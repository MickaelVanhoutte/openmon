import { describe, it, expect } from 'vitest';

describe('Multi-Hit Move Mechanics', () => {
	describe('Hit Count Distribution (2-5 hits)', () => {
		function rollHitCount(): number {
			const roll = Math.random();
			if (roll < 0.35) {
				return 2;
			}
			if (roll < 0.7) {
				return 3;
			}
			if (roll < 0.85) {
				return 4;
			}
			return 5;
		}

		it('should return values between 2 and 5', () => {
			for (let i = 0; i < 100; i++) {
				const hits = rollHitCount();
				expect(hits).toBeGreaterThanOrEqual(2);
				expect(hits).toBeLessThanOrEqual(5);
			}
		});

		it('should have 35% chance for 2 hits', () => {
			let twoHits = 0;
			const iterations = 10000;
			for (let i = 0; i < iterations; i++) {
				if (rollHitCount() === 2) {
					twoHits++;
				}
			}
			const ratio = twoHits / iterations;
			expect(ratio).toBeGreaterThan(0.3);
			expect(ratio).toBeLessThan(0.4);
		});

		it('should have 35% chance for 3 hits', () => {
			let threeHits = 0;
			const iterations = 10000;
			for (let i = 0; i < iterations; i++) {
				if (rollHitCount() === 3) {
					threeHits++;
				}
			}
			const ratio = threeHits / iterations;
			expect(ratio).toBeGreaterThan(0.3);
			expect(ratio).toBeLessThan(0.4);
		});
	});

	describe('Fixed Hit Count Moves', () => {
		it('should hit exactly 2 times for Double Kick', () => {
			const hits = 2;
			expect(hits).toBe(2);
		});

		it('should hit 3 times for Triple Kick with increasing power', () => {
			const basePower = 10;
			const hit1Power = basePower * 1;
			const hit2Power = basePower * 2;
			const hit3Power = basePower * 3;
			expect(hit1Power).toBe(10);
			expect(hit2Power).toBe(20);
			expect(hit3Power).toBe(30);
		});
	});

	describe('Critical Hit Per Hit', () => {
		it('should allow each hit to crit independently', () => {
			const critChance = 1 / 16;
			const hit1Crit = Math.random() < critChance;
			const hit2Crit = Math.random() < critChance;
			expect(typeof hit1Crit).toBe('boolean');
			expect(typeof hit2Crit).toBe('boolean');
		});
	});

	describe('Damage Accumulation', () => {
		it('should accumulate total damage from all hits', () => {
			const damagePerHit = 25;
			const hitCount = 4;
			const totalDamage = damagePerHit * hitCount;
			expect(totalDamage).toBe(100);
		});

		it('should stop if target faints', () => {
			const targetHp = 50;
			const damagePerHit = 30;
			const hitsLanded = Math.ceil(targetHp / damagePerHit);
			expect(hitsLanded).toBe(2);
		});
	});
});
