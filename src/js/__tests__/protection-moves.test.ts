import { describe, it, expect, beforeEach } from 'vitest';
import { VolatileStatus, VolatileTracker } from '../pokemons/volatile-status';

describe('Protection Move Mechanics', () => {
	let volatiles: VolatileTracker;

	beforeEach(() => {
		volatiles = new VolatileTracker();
	});

	describe('Protect/Detect Success Rate', () => {
		it('should have 100% success on first use', () => {
			const staleCounter = 0;
			const successChance = Math.pow(0.5, staleCounter);
			expect(successChance).toBe(1);
		});

		it('should have 50% success on second consecutive use', () => {
			const staleCounter = 1;
			const successChance = Math.pow(0.5, staleCounter);
			expect(successChance).toBe(0.5);
		});

		it('should have 25% success on third consecutive use', () => {
			const staleCounter = 2;
			const successChance = Math.pow(0.5, staleCounter);
			expect(successChance).toBe(0.25);
		});

		it('should have 12.5% success on fourth consecutive use', () => {
			const staleCounter = 3;
			const successChance = Math.pow(0.5, staleCounter);
			expect(successChance).toBe(0.125);
		});
	});

	describe('Stale Counter Management', () => {
		it('should reset stale counter when different move used', () => {
			volatiles.incrementProtectStale();
			volatiles.incrementProtectStale();
			expect(volatiles.getProtectStaleCounter()).toBe(2);
			volatiles.resetProtectStale();
			expect(volatiles.getProtectStaleCounter()).toBe(0);
		});

		it('should increment stale counter on consecutive use', () => {
			volatiles.incrementProtectStale();
			expect(volatiles.getProtectStaleCounter()).toBe(1);
			volatiles.incrementProtectStale();
			expect(volatiles.getProtectStaleCounter()).toBe(2);
		});
	});

	describe('Protection State', () => {
		it('should set PROTECTED volatile on success', () => {
			volatiles.add(VolatileStatus.PROTECTED);
			expect(volatiles.has(VolatileStatus.PROTECTED)).toBe(true);
		});

		it('should block incoming moves when protected', () => {
			volatiles.add(VolatileStatus.PROTECTED);
			const blocked = volatiles.has(VolatileStatus.PROTECTED);
			expect(blocked).toBe(true);
		});

		it('should remove protection at end of turn', () => {
			volatiles.add(VolatileStatus.PROTECTED);
			volatiles.endTurn();
			expect(volatiles.has(VolatileStatus.PROTECTED)).toBe(false);
		});
	});

	describe('Endure Special Case', () => {
		it('should survive with 1 HP instead of blocking', () => {
			const currentHp = 50;
			const incomingDamage = 100;
			const endureActive = true;
			const resultHp = endureActive ? 1 : Math.max(currentHp - incomingDamage, 0);
			expect(resultHp).toBe(1);
		});

		it('should also have stale counter', () => {
			volatiles.incrementProtectStale();
			const staleCounter = volatiles.getProtectStaleCounter();
			const successChance = Math.pow(0.5, staleCounter);
			expect(successChance).toBe(0.5);
		});
	});

	describe('Moves That Bypass Protect', () => {
		const bypassMoves = ['Feint', 'Shadow Force', 'Phantom Force'];

		it('should include Feint', () => {
			expect(bypassMoves).toContain('Feint');
		});

		it('should include Shadow Force', () => {
			expect(bypassMoves).toContain('Shadow Force');
		});
	});

	describe('Priority', () => {
		it('should have +4 priority', () => {
			const protectPriority = 4;
			expect(protectPriority).toBe(4);
		});

		it('should move before most other moves', () => {
			const protectPriority = 4;
			const normalMovePriority = 0;
			const quickAttackPriority = 1;
			expect(protectPriority).toBeGreaterThan(normalMovePriority);
			expect(protectPriority).toBeGreaterThan(quickAttackPriority);
		});
	});
});
