import { describe, it, expect, beforeEach } from 'vitest';
import { VolatileStatus, VolatileTracker } from '../pokemons/volatile-status';

describe('VolatileStatus enum', () => {
	it('should have all expected volatile statuses', () => {
		expect(VolatileStatus.CONFUSED).toBe('confused');
		expect(VolatileStatus.FLINCH).toBe('flinch');
		expect(VolatileStatus.INFATUATION).toBe('infatuation');
		expect(VolatileStatus.BOUND).toBe('bound');
		expect(VolatileStatus.SEEDED).toBe('seeded');
		expect(VolatileStatus.CURSED).toBe('cursed');
		expect(VolatileStatus.DROWSY).toBe('drowsy');
		expect(VolatileStatus.NIGHTMARE).toBe('nightmare');
		expect(VolatileStatus.PERISH_SONG).toBe('perish_song');
		expect(VolatileStatus.TAUNT).toBe('taunt');
		expect(VolatileStatus.ENCORE).toBe('encore');
		expect(VolatileStatus.TORMENT).toBe('torment');
		expect(VolatileStatus.DISABLE).toBe('disable');
	});
});

describe('VolatileTracker', () => {
	let tracker: VolatileTracker;

	beforeEach(() => {
		tracker = new VolatileTracker();
	});

	describe('add/has/remove', () => {
		it('should start with no volatiles', () => {
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(false);
			expect(tracker.getAll().length).toBe(0);
		});

		it('should add a volatile status', () => {
			tracker.add(VolatileStatus.CONFUSED);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(true);
		});

		it('should add a volatile with turn counter', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(true);
			expect(tracker.getTurns(VolatileStatus.CONFUSED)).toBe(3);
		});

		it('should remove a volatile status', () => {
			tracker.add(VolatileStatus.FLINCH);
			tracker.remove(VolatileStatus.FLINCH);
			expect(tracker.has(VolatileStatus.FLINCH)).toBe(false);
		});

		it('should clear all volatiles', () => {
			tracker.add(VolatileStatus.CONFUSED);
			tracker.add(VolatileStatus.BOUND);
			tracker.add(VolatileStatus.SEEDED);
			tracker.clear();
			expect(tracker.getAll().length).toBe(0);
		});

		it('should get all active volatiles', () => {
			tracker.add(VolatileStatus.CONFUSED);
			tracker.add(VolatileStatus.TAUNT);
			const all = tracker.getAll();
			expect(all).toContain(VolatileStatus.CONFUSED);
			expect(all).toContain(VolatileStatus.TAUNT);
			expect(all.length).toBe(2);
		});
	});

	describe('turn counter tracking', () => {
		it('should track turns for confusion (1-4 turns)', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			expect(tracker.getTurns(VolatileStatus.CONFUSED)).toBe(3);
		});

		it('should track bound turns', () => {
			tracker.add(VolatileStatus.BOUND, 4);
			expect(tracker.getTurns(VolatileStatus.BOUND)).toBe(4);
		});

		it('should return 0 turns for non-existent volatile', () => {
			expect(tracker.getTurns(VolatileStatus.CONFUSED)).toBe(0);
		});

		it('should set turns to 0 for volatiles added without duration', () => {
			tracker.add(VolatileStatus.FLINCH);
			expect(tracker.getTurns(VolatileStatus.FLINCH)).toBe(0);
		});
	});

	describe('tickTurn', () => {
		it('should decrement turn counters', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			tracker.add(VolatileStatus.TAUNT, 2);
			tracker.tickTurn();
			expect(tracker.getTurns(VolatileStatus.CONFUSED)).toBe(2);
			expect(tracker.getTurns(VolatileStatus.TAUNT)).toBe(1);
		});

		it('should remove volatile when turns reach 0', () => {
			tracker.add(VolatileStatus.TAUNT, 1);
			tracker.tickTurn();
			expect(tracker.has(VolatileStatus.TAUNT)).toBe(false);
		});

		it('should not remove volatiles with 0 initial turns (indefinite)', () => {
			tracker.add(VolatileStatus.SEEDED);
			tracker.tickTurn();
			expect(tracker.has(VolatileStatus.SEEDED)).toBe(true);
		});

		it('should remove flinch at end of turn', () => {
			tracker.add(VolatileStatus.FLINCH);
			tracker.endTurn();
			expect(tracker.has(VolatileStatus.FLINCH)).toBe(false);
		});
	});

	describe('bound data', () => {
		it('should store bound source reference', () => {
			const sourceId = 'pokemon-123';
			tracker.add(VolatileStatus.BOUND, 4);
			tracker.setBoundData(sourceId, 10);
			expect(tracker.getBoundData()).toEqual({ sourceId, damagePerTurn: 10 });
		});

		it('should return undefined bound data when not bound', () => {
			expect(tracker.getBoundData()).toBeUndefined();
		});
	});

	describe('seeded data', () => {
		it('should store seeder reference', () => {
			const seederId = 'pokemon-456';
			tracker.add(VolatileStatus.SEEDED);
			tracker.setSeededBy(seederId);
			expect(tracker.getSeededBy()).toBe(seederId);
		});
	});

	describe('confusion self-hit check', () => {
		it('should have 33% chance of self-hit in Gen 7+', () => {
			tracker.add(VolatileStatus.CONFUSED, 3);
			let selfHitCount = 0;
			const iterations = 1000;
			for (let i = 0; i < iterations; i++) {
				if (tracker.checkConfusionSelfHit()) {
					selfHitCount++;
				}
			}
			const ratio = selfHitCount / iterations;
			expect(ratio).toBeGreaterThan(0.25);
			expect(ratio).toBeLessThan(0.42);
		});

		it('should return false when not confused', () => {
			expect(tracker.checkConfusionSelfHit()).toBe(false);
		});
	});

	describe('flinch check', () => {
		it('should prevent action when flinched', () => {
			tracker.add(VolatileStatus.FLINCH);
			expect(tracker.isFlinched()).toBe(true);
		});

		it('should allow action when not flinched', () => {
			expect(tracker.isFlinched()).toBe(false);
		});
	});

	describe('infatuation check', () => {
		it('should have 50% chance of immobilization', () => {
			tracker.add(VolatileStatus.INFATUATION);
			let immobilizedCount = 0;
			const iterations = 1000;
			for (let i = 0; i < iterations; i++) {
				if (tracker.checkInfatuationImmobilize()) {
					immobilizedCount++;
				}
			}
			const ratio = immobilizedCount / iterations;
			expect(ratio).toBeGreaterThan(0.4);
			expect(ratio).toBeLessThan(0.6);
		});

		it('should return false when not infatuated', () => {
			expect(tracker.checkInfatuationImmobilize()).toBe(false);
		});
	});
});
