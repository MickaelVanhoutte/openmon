import { describe, it, expect, beforeEach } from 'vitest';
import { Menus } from '../context/overworldContext';

describe('Menus', () => {
	describe('Summary Index Behavior', () => {
		let menus: Menus;

		beforeEach(() => {
			menus = new Menus();
		});

		it('should have summaryIndex default to 0', () => {
			expect(menus.summaryIndex).toBe(0);
		});

		it('should allow setting summaryIndex to any valid pokemon index', () => {
			menus.summaryIndex = 0;
			expect(menus.summaryIndex).toBe(0);

			menus.summaryIndex = 1;
			expect(menus.summaryIndex).toBe(1);

			menus.summaryIndex = 5;
			expect(menus.summaryIndex).toBe(5);
		});

		it('should persist summaryIndex when openSummary is set', () => {
			menus.summaryIndex = 3;
			menus.openSummary = true;
			menus.openSummary$.set(true);

			expect(menus.summaryIndex).toBe(3);
			expect(menus.openSummary).toBe(true);
		});

		it('should retain summaryIndex after closing and reopening summary', () => {
			menus.summaryIndex = 2;
			menus.openSummary = true;
			expect(menus.summaryIndex).toBe(2);

			menus.openSummary = false;
			expect(menus.summaryIndex).toBe(2);

			menus.summaryIndex = 4;
			menus.openSummary = true;
			expect(menus.summaryIndex).toBe(4);
		});
	});
});
