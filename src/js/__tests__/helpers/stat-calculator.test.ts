import { describe, it, expect } from 'vitest';
import { StatCalculator, type StatOwner } from '../../pokemons/helpers/stat-calculator';
import { Stats, Nature } from '../../pokemons/pokedex';

function createOwner(overrides: Partial<StatOwner> = {}): StatOwner {
	return {
		stats: new Stats(45, 49, 49, 65, 65, 45),
		ivs: new Stats(31, 31, 31, 31, 31, 31),
		evs: new Stats(0, 0, 0, 0, 0, 0),
		nature: new Nature(1, 'hardy', '', ''), // neutral nature
		level: 50,
		currentStats: new Stats(120, 70, 70, 85, 85, 65),
		statsChanges: new Stats(),
		...overrides
	};
}

describe('StatCalculator', () => {
	describe('computeFromBaseStats', () => {
		it('computes stats with neutral nature', () => {
			const owner = createOwner();
			const calc = new StatCalculator(owner);
			const result = calc.computeFromBaseStats();
			expect(result.hp).toBeGreaterThan(0);
			expect(result.attack).toBeGreaterThan(0);
			expect(result.speed).toBeGreaterThan(0);
		});

		it('applies nature boost (+10%)', () => {
			const neutral = createOwner();
			const boosted = createOwner({
				nature: new Nature(2, 'adamant', 'specialAttack', 'attack')
			});
			const calcNeutral = new StatCalculator(neutral);
			const calcBoosted = new StatCalculator(boosted);
			const neutralStats = calcNeutral.computeFromBaseStats();
			const boostedStats = calcBoosted.computeFromBaseStats();
			expect(boostedStats.attack).toBeGreaterThan(neutralStats.attack);
		});

		it('applies nature penalty (-10%)', () => {
			const neutral = createOwner();
			const penalized = createOwner({
				nature: new Nature(2, 'adamant', 'specialAttack', 'attack')
			});
			const calcNeutral = new StatCalculator(neutral);
			const calcPenalized = new StatCalculator(penalized);
			const neutralStats = calcNeutral.computeFromBaseStats();
			const penalizedStats = calcPenalized.computeFromBaseStats();
			expect(penalizedStats.specialAttack).toBeLessThan(neutralStats.specialAttack);
		});

		it('scales with level', () => {
			const low = createOwner({ level: 10 });
			const high = createOwner({ level: 90 });
			const calcLow = new StatCalculator(low);
			const calcHigh = new StatCalculator(high);
			expect(calcHigh.computeFromBaseStats().hp).toBeGreaterThan(calcLow.computeFromBaseStats().hp);
		});

		it('factors in EVs', () => {
			const noEvs = createOwner();
			const withEvs = createOwner({ evs: new Stats(252, 0, 0, 0, 0, 0) });
			const calcNo = new StatCalculator(noEvs);
			const calcWith = new StatCalculator(withEvs);
			expect(calcWith.computeFromBaseStats().hp).toBeGreaterThan(calcNo.computeFromBaseStats().hp);
		});
	});

	describe('computeBattleStats', () => {
		it('returns unmodified stats at stage 0', () => {
			const owner = createOwner();
			const calc = new StatCalculator(owner);
			const result = calc.computeBattleStats();
			expect(result.attack).toBe(owner.currentStats.attack);
			expect(result.defense).toBe(owner.currentStats.defense);
		});

		it('increases stat at positive stage', () => {
			const owner = createOwner();
			owner.statsChanges.attack = 2;
			const calc = new StatCalculator(owner);
			const result = calc.computeBattleStats();
			// +2 stage = (2+2)/2 = 2x
			expect(result.attack).toBe(Math.floor(owner.currentStats.attack * 2));
		});

		it('decreases stat at negative stage', () => {
			const owner = createOwner();
			owner.statsChanges.defense = -2;
			const calc = new StatCalculator(owner);
			const result = calc.computeBattleStats();
			// -2 stage = 2/(2+2) = 0.5x
			expect(result.defense).toBe(Math.floor(owner.currentStats.defense * 0.5));
		});

		it('applies paralysis speed reduction', () => {
			const owner = createOwner({ status: 'paralysis' as any });
			const calc = new StatCalculator(owner);
			const result = calc.computeBattleStats();
			expect(result.speed).toBe(Math.floor(owner.currentStats.speed * 0.5));
		});

		it('does not reduce speed without paralysis', () => {
			const owner = createOwner();
			const calc = new StatCalculator(owner);
			const result = calc.computeBattleStats();
			expect(result.speed).toBe(owner.currentStats.speed);
		});

		it('uses accuracy/evasion formula for those stats', () => {
			const owner = createOwner();
			owner.currentStats.accuracy = 100;
			owner.statsChanges.accuracy = 1;
			const calc = new StatCalculator(owner);
			const result = calc.computeBattleStats();
			// +1 acc = (3+1)/3 = 1.33x
			expect(result.accuracy).toBe(Math.floor(100 * (4 / 3)));
		});
	});

	describe('changeBattleStats', () => {
		it('increases stat stage', () => {
			const owner = createOwner();
			const calc = new StatCalculator(owner);
			calc.changeBattleStats('attack', 2);
			expect(owner.statsChanges.attack).toBe(2);
		});

		it('clamps at +6', () => {
			const owner = createOwner();
			owner.statsChanges.attack = 5;
			const calc = new StatCalculator(owner);
			calc.changeBattleStats('attack', 3);
			expect(owner.statsChanges.attack).toBe(6);
		});

		it('clamps at -6', () => {
			const owner = createOwner();
			owner.statsChanges.defense = -5;
			const calc = new StatCalculator(owner);
			calc.changeBattleStats('defense', -3);
			expect(owner.statsChanges.defense).toBe(-6);
		});

		it('does not change when already at max', () => {
			const owner = createOwner();
			owner.statsChanges.speed = 6;
			const calc = new StatCalculator(owner);
			calc.changeBattleStats('speed', 1);
			expect(owner.statsChanges.speed).toBe(6);
		});
	});

	describe('resetBattleStats', () => {
		it('sets all stat changes to 0', () => {
			const owner = createOwner();
			owner.statsChanges.attack = 3;
			owner.statsChanges.defense = -2;
			const calc = new StatCalculator(owner);
			calc.resetBattleStats();
			expect(owner.statsChanges.attack).toBe(0);
			expect(owner.statsChanges.defense).toBe(0);
			expect(owner.statsChanges.speed).toBe(0);
		});
	});

	describe('computeTotalEvs', () => {
		it('sums all EV values', () => {
			const owner = createOwner({ evs: new Stats(100, 50, 30, 80, 40, 60) });
			const calc = new StatCalculator(owner);
			expect(calc.computeTotalEvs()).toBe(360);
		});

		it('returns 0 for no EVs', () => {
			const owner = createOwner();
			const calc = new StatCalculator(owner);
			expect(calc.computeTotalEvs()).toBe(0);
		});
	});
});
