import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VolatileTracker, VolatileStatus } from '../../pokemons/volatile-status';

describe('VolatileTracker', () => {
	let tracker: VolatileTracker;

	beforeEach(() => {
		tracker = new VolatileTracker();
	});

	describe('add/has/remove', () => {
		it('starts with no volatiles', () => {
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(false);
			expect(tracker.getAll()).toEqual([]);
		});

		it('adds a volatile status', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(true);
		});

		it('removes a volatile status', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			tracker.remove(VolatileStatus.CONFUSED);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(false);
		});

		it('tracks multiple volatiles', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			tracker.add(VolatileStatus.TAUNT, 2);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(true);
			expect(tracker.has(VolatileStatus.TAUNT)).toBe(true);
			expect(tracker.getAll()).toHaveLength(2);
		});
	});

	describe('getTurns/setTurns', () => {
		it('returns 0 for missing volatile', () => {
			expect(tracker.getTurns(VolatileStatus.CONFUSED)).toBe(0);
		});

		it('returns the set turns', () => {
			tracker.add(VolatileStatus.TAUNT, 5);
			expect(tracker.getTurns(VolatileStatus.TAUNT)).toBe(5);
		});

		it('updates turns', () => {
			tracker.add(VolatileStatus.TAUNT, 5);
			tracker.setTurns(VolatileStatus.TAUNT, 2);
			expect(tracker.getTurns(VolatileStatus.TAUNT)).toBe(2);
		});

		it('setTurns does nothing for missing volatile', () => {
			tracker.setTurns(VolatileStatus.CONFUSED, 5);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(false);
		});
	});

	describe('clear', () => {
		it('removes all volatiles', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			tracker.add(VolatileStatus.TAUNT, 2);
			tracker.clear();
			expect(tracker.getAll()).toEqual([]);
		});
	});

	describe('tickTurn', () => {
		it('decrements turns', () => {
			tracker.add(VolatileStatus.TAUNT, 3);
			tracker.tickTurn();
			expect(tracker.getTurns(VolatileStatus.TAUNT)).toBe(2);
		});

		it('removes volatile when turns reach 0', () => {
			tracker.add(VolatileStatus.TAUNT, 1);
			tracker.tickTurn();
			expect(tracker.has(VolatileStatus.TAUNT)).toBe(false);
		});

		it('does not decrement permanent (0 turn) volatiles', () => {
			tracker.add(VolatileStatus.SEEDED, 0);
			tracker.tickTurn();
			expect(tracker.has(VolatileStatus.SEEDED)).toBe(true);
		});
	});

	describe('endTurn', () => {
		it('removes flinch', () => {
			tracker.add(VolatileStatus.FLINCH, 0);
			tracker.endTurn();
			expect(tracker.has(VolatileStatus.FLINCH)).toBe(false);
		});

		it('removes protected', () => {
			tracker.add(VolatileStatus.PROTECTED, 0);
			tracker.endTurn();
			expect(tracker.has(VolatileStatus.PROTECTED)).toBe(false);
		});

		it('does not remove other volatiles', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			tracker.endTurn();
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(true);
		});
	});

	describe('bound data', () => {
		it('sets and gets bound data', () => {
			tracker.add(VolatileStatus.BOUND, 3);
			tracker.setBoundData('source-1', 10);
			const data = tracker.getBoundData();
			expect(data).toEqual({ sourceId: 'source-1', damagePerTurn: 10 });
		});

		it('returns undefined when not bound', () => {
			expect(tracker.getBoundData()).toBeUndefined();
		});

		it('clears bound data on remove', () => {
			tracker.add(VolatileStatus.BOUND, 3);
			tracker.setBoundData('source-1', 10);
			tracker.remove(VolatileStatus.BOUND);
			expect(tracker.getBoundData()).toBeUndefined();
		});
	});

	describe('seeded by', () => {
		it('sets and gets seeder', () => {
			tracker.setSeededBy('mon-1');
			expect(tracker.getSeededBy()).toBe('mon-1');
		});

		it('clears seeded data on remove', () => {
			tracker.add(VolatileStatus.SEEDED, 0);
			tracker.setSeededBy('mon-1');
			tracker.remove(VolatileStatus.SEEDED);
			expect(tracker.getSeededBy()).toBeUndefined();
		});
	});

	describe('isFlinched', () => {
		it('returns false when not flinched', () => {
			expect(tracker.isFlinched()).toBe(false);
		});

		it('returns true when flinched', () => {
			tracker.add(VolatileStatus.FLINCH, 0);
			expect(tracker.isFlinched()).toBe(true);
		});
	});

	describe('protect stale counter', () => {
		it('starts at 0', () => {
			expect(tracker.getProtectStaleCounter()).toBe(0);
		});

		it('increments', () => {
			tracker.incrementProtectStale();
			expect(tracker.getProtectStaleCounter()).toBe(1);
			tracker.incrementProtectStale();
			expect(tracker.getProtectStaleCounter()).toBe(2);
		});

		it('resets', () => {
			tracker.incrementProtectStale();
			tracker.incrementProtectStale();
			tracker.resetProtectStale();
			expect(tracker.getProtectStaleCounter()).toBe(0);
		});

		it('clears on full clear', () => {
			tracker.incrementProtectStale();
			tracker.clear();
			expect(tracker.getProtectStaleCounter()).toBe(0);
		});
	});

	describe('checkConfusionSelfHit', () => {
		it('returns false when not confused', () => {
			expect(tracker.checkConfusionSelfHit()).toBe(false);
		});

		it('returns boolean when confused', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			const result = tracker.checkConfusionSelfHit();
			expect(typeof result).toBe('boolean');
		});
	});

	describe('checkInfatuationImmobilize', () => {
		it('returns false when not infatuated', () => {
			expect(tracker.checkInfatuationImmobilize()).toBe(false);
		});

		it('returns boolean when infatuated', () => {
			tracker.add(VolatileStatus.INFATUATION, 0);
			const result = tracker.checkInfatuationImmobilize();
			expect(typeof result).toBe('boolean');
		});
	});
});
