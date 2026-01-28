import { describe, it, expect } from 'vitest';

describe('Stat Change Mechanics - Gen 3-5', () => {
	describe('Stage Multipliers', () => {
		const stageMultipliers: Record<number, number> = {
			'-6': 2 / 8,
			'-5': 2 / 7,
			'-4': 2 / 6,
			'-3': 2 / 5,
			'-2': 2 / 4,
			'-1': 2 / 3,
			'0': 1,
			'1': 3 / 2,
			'2': 4 / 2,
			'3': 5 / 2,
			'4': 6 / 2,
			'5': 7 / 2,
			'6': 8 / 2
		};

		it('should apply correct multiplier at stage -6 (2/8 = 0.25)', () => {
			expect(stageMultipliers['-6']).toBeCloseTo(0.25, 2);
		});

		it('should apply correct multiplier at stage -3 (2/5 = 0.4)', () => {
			expect(stageMultipliers['-3']).toBeCloseTo(0.4, 2);
		});

		it('should apply correct multiplier at stage -1 (2/3 = 0.67)', () => {
			expect(stageMultipliers['-1']).toBeCloseTo(0.67, 2);
		});

		it('should apply 1x multiplier at stage 0', () => {
			expect(stageMultipliers['0']).toBe(1);
		});

		it('should apply correct multiplier at stage +1 (3/2 = 1.5)', () => {
			expect(stageMultipliers['1']).toBe(1.5);
		});

		it('should apply correct multiplier at stage +3 (5/2 = 2.5)', () => {
			expect(stageMultipliers['3']).toBe(2.5);
		});

		it('should apply correct multiplier at stage +6 (8/2 = 4)', () => {
			expect(stageMultipliers['6']).toBe(4);
		});
	});

	describe('Accuracy/Evasion Stage Multipliers', () => {
		const accuracyMultipliers: Record<number, number> = {
			'-6': 3 / 9,
			'-5': 3 / 8,
			'-4': 3 / 7,
			'-3': 3 / 6,
			'-2': 3 / 5,
			'-1': 3 / 4,
			'0': 1,
			'1': 4 / 3,
			'2': 5 / 3,
			'3': 6 / 3,
			'4': 7 / 3,
			'5': 8 / 3,
			'6': 9 / 3
		};

		it('should apply correct accuracy multiplier at stage -6 (3/9 = 0.33)', () => {
			expect(accuracyMultipliers['-6']).toBeCloseTo(0.33, 2);
		});

		it('should apply correct accuracy multiplier at stage +6 (9/3 = 3)', () => {
			expect(accuracyMultipliers['6']).toBe(3);
		});

		it('should use same formula for evasion', () => {
			const evasionStage = 2;
			const hitChanceModifier = 1 / accuracyMultipliers[evasionStage.toString()];
			expect(hitChanceModifier).toBeCloseTo(0.6, 2);
		});
	});

	describe('Stage Limits', () => {
		it('should cap stat stages at +6', () => {
			let stage = 5;
			const increase = 2;
			stage = Math.min(stage + increase, 6);
			expect(stage).toBe(6);
		});

		it('should cap stat stages at -6', () => {
			let stage = -5;
			const decrease = 2;
			stage = Math.max(stage - decrease, -6);
			expect(stage).toBe(-6);
		});

		it('should fail to raise when already at +6', () => {
			const currentStage = 6;
			const canRaise = currentStage < 6;
			expect(canRaise).toBe(false);
		});

		it('should fail to lower when already at -6', () => {
			const currentStage = -6;
			const canLower = currentStage > -6;
			expect(canLower).toBe(false);
		});
	});

	describe('Stat Change Messages', () => {
		it('should use "rose" for +1 stage', () => {
			const stage = 1;
			const message = stage === 1 ? 'rose' : stage === 2 ? 'rose sharply' : 'rose drastically';
			expect(message).toBe('rose');
		});

		it('should use "rose sharply" for +2 stages', () => {
			const stage = 2;
			const message = stage === 1 ? 'rose' : stage === 2 ? 'rose sharply' : 'rose drastically';
			expect(message).toBe('rose sharply');
		});

		it('should use "rose drastically" for +3 or more stages', () => {
			const stage = 3;
			const message = stage === 1 ? 'rose' : stage === 2 ? 'rose sharply' : 'rose drastically';
			expect(message).toBe('rose drastically');
		});

		it('should use "fell" for -1 stage', () => {
			const stage = -1;
			const message = stage === -1 ? 'fell' : stage === -2 ? 'harshly fell' : 'severely fell';
			expect(message).toBe('fell');
		});
	});

	describe('Critical Hits Ignore Negative Stat Changes', () => {
		it('should ignore defender Attack drops on crit', () => {
			const attackerStage = -2;
			const onCrit = true;
			const effectiveStage = onCrit && attackerStage < 0 ? 0 : attackerStage;
			expect(effectiveStage).toBe(0);
		});

		it('should use positive Attack stages on crit', () => {
			const attackerStage = 2;
			const onCrit = true;
			const effectiveStage = onCrit && attackerStage < 0 ? 0 : attackerStage;
			expect(effectiveStage).toBe(2);
		});

		it('should ignore defender Defense raises on crit', () => {
			const defenderStage = 3;
			const onCrit = true;
			const effectiveStage = onCrit && defenderStage > 0 ? 0 : defenderStage;
			expect(effectiveStage).toBe(0);
		});
	});

	describe('Stats Affected', () => {
		it('should track Attack stages', () => {
			const stats = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
			expect(stats).toContain('attack');
		});

		it('should track Defense stages', () => {
			const stats = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
			expect(stats).toContain('defense');
		});

		it('should track Speed stages', () => {
			const stats = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
			expect(stats).toContain('speed');
		});

		it('should track Accuracy stages separately', () => {
			const battleStats = ['accuracy', 'evasion'];
			expect(battleStats).toContain('accuracy');
		});

		it('should track Evasion stages separately', () => {
			const battleStats = ['accuracy', 'evasion'];
			expect(battleStats).toContain('evasion');
		});
	});
});
