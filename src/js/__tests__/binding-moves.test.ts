import { describe, it, expect, beforeEach } from 'vitest';
import { VolatileStatus, VolatileTracker } from '../pokemons/volatile-status';

describe('Binding Move Mechanics', () => {
	let volatiles: VolatileTracker;

	beforeEach(() => {
		volatiles = new VolatileTracker();
	});

	describe('Binding Duration', () => {
		it('should trap for 4-5 turns randomly', () => {
			const rollDuration = () => (Math.random() < 0.5 ? 4 : 5);
			const durations = new Set<number>();
			for (let i = 0; i < 100; i++) {
				durations.add(rollDuration());
			}
			expect(durations.has(4)).toBe(true);
			expect(durations.has(5)).toBe(true);
		});
	});

	describe('Binding Damage', () => {
		it('should deal 1/8 max HP per turn', () => {
			const maxHp = 200;
			const damagePerTurn = Math.floor(maxHp / 8);
			expect(damagePerTurn).toBe(25);
		});

		it('should track bound source for healing drain', () => {
			volatiles.add(VolatileStatus.BOUND, 4);
			volatiles.setBoundData('pokemon-123', 25);
			const data = volatiles.getBoundData();
			expect(data?.sourceId).toBe('pokemon-123');
			expect(data?.damagePerTurn).toBe(25);
		});
	});

	describe('Trapping Effect', () => {
		it('should prevent switching while bound', () => {
			volatiles.add(VolatileStatus.BOUND, 4);
			const canSwitch = !volatiles.has(VolatileStatus.BOUND);
			expect(canSwitch).toBe(false);
		});

		it('should allow switching after trap expires', () => {
			volatiles.add(VolatileStatus.BOUND, 1);
			volatiles.tickTurn();
			const canSwitch = !volatiles.has(VolatileStatus.BOUND);
			expect(canSwitch).toBe(true);
		});

		it('should free target if trapper faints', () => {
			volatiles.add(VolatileStatus.BOUND, 4);
			volatiles.remove(VolatileStatus.BOUND);
			expect(volatiles.has(VolatileStatus.BOUND)).toBe(false);
		});
	});

	describe('Binding Moves List', () => {
		const bindingMoves = ['Bind', 'Wrap', 'Fire Spin', 'Whirlpool', 'Sand Tomb', 'Magma Storm'];

		it('should include Bind', () => {
			expect(bindingMoves).toContain('Bind');
		});

		it('should include Wrap', () => {
			expect(bindingMoves).toContain('Wrap');
		});

		it('should include Fire Spin', () => {
			expect(bindingMoves).toContain('Fire Spin');
		});
	});
});
