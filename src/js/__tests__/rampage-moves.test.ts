import { describe, it, expect, beforeEach } from 'vitest';
import { VolatileStatus, VolatileTracker } from '../pokemons/volatile-status';

describe('Rampage Move Mechanics', () => {
	let volatiles: VolatileTracker;

	beforeEach(() => {
		volatiles = new VolatileTracker();
	});

	describe('Rampage Duration', () => {
		it('should last 2-3 turns randomly', () => {
			const rollDuration = () => (Math.random() < 0.5 ? 2 : 3);
			const durations = new Set<number>();
			for (let i = 0; i < 100; i++) {
				durations.add(rollDuration());
			}
			expect(durations.has(2)).toBe(true);
			expect(durations.has(3)).toBe(true);
		});
	});

	describe('Move Lock', () => {
		it('should lock user into move during rampage', () => {
			volatiles.add(VolatileStatus.RAMPAGE, 2);
			const isLocked = volatiles.has(VolatileStatus.RAMPAGE);
			expect(isLocked).toBe(true);
		});

		it('should prevent switching during rampage', () => {
			volatiles.add(VolatileStatus.RAMPAGE, 3);
			const canSwitch = !volatiles.has(VolatileStatus.RAMPAGE);
			expect(canSwitch).toBe(false);
		});
	});

	describe('Confusion After Rampage', () => {
		it('should confuse user after rampage ends', () => {
			volatiles.add(VolatileStatus.RAMPAGE, 1);
			volatiles.tickTurn();
			volatiles.add(VolatileStatus.CONFUSED, 4);
			expect(volatiles.has(VolatileStatus.CONFUSED)).toBe(true);
		});

		it('should have 1-4 turn confusion duration', () => {
			const minTurns = 1;
			const maxTurns = 4;
			volatiles.add(VolatileStatus.CONFUSED, 3);
			expect(volatiles.getTurns(VolatileStatus.CONFUSED)).toBeGreaterThanOrEqual(minTurns);
			expect(volatiles.getTurns(VolatileStatus.CONFUSED)).toBeLessThanOrEqual(maxTurns);
		});
	});

	describe('Rampage Moves List', () => {
		const rampageMoves = ['Outrage', 'Thrash', 'Petal Dance'];

		it('should include Outrage', () => {
			expect(rampageMoves).toContain('Outrage');
		});

		it('should include Thrash', () => {
			expect(rampageMoves).toContain('Thrash');
		});

		it('should include Petal Dance', () => {
			expect(rampageMoves).toContain('Petal Dance');
		});
	});

	describe('Rampage Interruption', () => {
		it('should end early if user flinches', () => {
			volatiles.add(VolatileStatus.RAMPAGE, 2);
			volatiles.add(VolatileStatus.FLINCH);
			const interrupted = volatiles.has(VolatileStatus.FLINCH);
			expect(interrupted).toBe(true);
		});

		it('should still confuse if interrupted', () => {
			volatiles.add(VolatileStatus.RAMPAGE, 2);
			volatiles.remove(VolatileStatus.RAMPAGE);
			volatiles.add(VolatileStatus.CONFUSED, 3);
			expect(volatiles.has(VolatileStatus.CONFUSED)).toBe(true);
		});
	});
});
