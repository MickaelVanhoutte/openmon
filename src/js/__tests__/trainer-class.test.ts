import { describe, it, expect } from 'vitest';
import {
	TRAINER_CLASSES,
	getTrainerClass,
	applyClassBonuses
} from '../characters/trainer-class';
import { MasteriesBonuses, MasteryType } from '../characters/mastery-model';

describe('Trainer Class System', () => {
	describe('TRAINER_CLASSES', () => {
		it('should have 8 trainer classes', () => {
			expect(TRAINER_CLASSES.length).toBe(8);
		});

		it('should have unique IDs', () => {
			const ids = TRAINER_CLASSES.map((c) => c.id);
			const unique = new Set(ids);
			expect(unique.size).toBe(ids.length);
		});

		it('should have unique names', () => {
			const names = TRAINER_CLASSES.map((c) => c.name);
			const unique = new Set(names);
			expect(unique.size).toBe(names.length);
		});

		it('each class should have at least one bonus', () => {
			for (const tc of TRAINER_CLASSES) {
				expect(Object.keys(tc.bonuses).length).toBeGreaterThan(0);
			}
		});
	});

	describe('getTrainerClass', () => {
		it('should return Ace Trainer for ace-trainer', () => {
			const tc = getTrainerClass('ace-trainer');
			expect(tc).toBeDefined();
			expect(tc!.name).toBe('Ace Trainer');
		});

		it('should return Berserker for berserker', () => {
			const tc = getTrainerClass('berserker');
			expect(tc).toBeDefined();
			expect(tc!.name).toBe('Berserker');
		});

		it('should return undefined for unknown class', () => {
			const tc = getTrainerClass('nonexistent');
			expect(tc).toBeUndefined();
		});
	});

	describe('applyClassBonuses', () => {
		it('should apply Ace Trainer bonuses (XP + STAB)', () => {
			const bonuses = new MasteriesBonuses();
			applyClassBonuses(bonuses, 'ace-trainer');

			expect(bonuses.getMastery(MasteryType.XP)).toBe(5);
			expect(bonuses.getMastery(MasteryType.STAB)).toBe(5);
		});

		it('should apply Breeder bonuses (EV + Catch)', () => {
			const bonuses = new MasteriesBonuses();
			applyClassBonuses(bonuses, 'breeder');

			expect(bonuses.getMastery(MasteryType.EV)).toBe(10);
			expect(bonuses.getMastery(MasteryType.CATCH)).toBe(10);
		});

		it('should apply Berserker bonuses (Critical + Effectiveness)', () => {
			const bonuses = new MasteriesBonuses();
			applyClassBonuses(bonuses, 'berserker');

			expect(bonuses.getMastery(MasteryType.CRITICAL)).toBe(10);
			expect(bonuses.getMastery(MasteryType.EFFECTIVENESS)).toBe(5);
		});

		it('should apply Explorer bonuses (XP + Catch + Shiny)', () => {
			const bonuses = new MasteriesBonuses();
			applyClassBonuses(bonuses, 'explorer');

			expect(bonuses.getMastery(MasteryType.XP)).toBe(8);
			expect(bonuses.getMastery(MasteryType.CATCH)).toBe(5);
			expect(bonuses.getMastery(MasteryType.SHINY)).toBe(5);
		});

		it('should not modify bonuses for unknown class', () => {
			const bonuses = new MasteriesBonuses();
			applyClassBonuses(bonuses, 'nonexistent');

			expect(bonuses.getMastery(MasteryType.XP)).toBe(0);
			expect(bonuses.getMastery(MasteryType.CATCH)).toBe(0);
		});

		it('should stack with existing bonuses', () => {
			const bonuses = new MasteriesBonuses();
			bonuses.enableMastery(MasteryType.XP, 3);
			applyClassBonuses(bonuses, 'ace-trainer');

			expect(bonuses.getMastery(MasteryType.XP)).toBe(8); // 3 + 5
		});
	});
});
