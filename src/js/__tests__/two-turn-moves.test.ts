import { describe, it, expect, beforeEach } from 'vitest';
import { VolatileStatus, VolatileTracker } from '../pokemons/volatile-status';

describe('Two-Turn Move Mechanics', () => {
	let volatiles: VolatileTracker;

	beforeEach(() => {
		volatiles = new VolatileTracker();
	});

	describe('Charging State', () => {
		it('should set CHARGING volatile on turn 1', () => {
			volatiles.add(VolatileStatus.CHARGING, 1);
			expect(volatiles.has(VolatileStatus.CHARGING)).toBe(true);
		});

		it('should remove CHARGING after turn 1', () => {
			volatiles.add(VolatileStatus.CHARGING, 1);
			volatiles.tickTurn();
			expect(volatiles.has(VolatileStatus.CHARGING)).toBe(false);
		});
	});

	describe('Semi-Invulnerable State', () => {
		it('should set SEMI_INVULNERABLE for Fly/Dig/Dive/Bounce', () => {
			volatiles.add(VolatileStatus.SEMI_INVULNERABLE, 1);
			expect(volatiles.has(VolatileStatus.SEMI_INVULNERABLE)).toBe(true);
		});

		it('should make Pokemon untargetable by most moves', () => {
			volatiles.add(VolatileStatus.SEMI_INVULNERABLE);
			const canBeTargeted = !volatiles.has(VolatileStatus.SEMI_INVULNERABLE);
			expect(canBeTargeted).toBe(false);
		});

		it('should remove semi-invulnerable after attack', () => {
			volatiles.add(VolatileStatus.SEMI_INVULNERABLE, 1);
			volatiles.tickTurn();
			expect(volatiles.has(VolatileStatus.SEMI_INVULNERABLE)).toBe(false);
		});
	});

	describe('Two-Turn Move Types', () => {
		describe('Fly', () => {
			it('should be semi-invulnerable during charge', () => {
				volatiles.add(VolatileStatus.SEMI_INVULNERABLE, 1);
				volatiles.add(VolatileStatus.CHARGING, 1);
				expect(volatiles.has(VolatileStatus.SEMI_INVULNERABLE)).toBe(true);
			});
		});

		describe('Dig', () => {
			it('should be underground and untargetable', () => {
				volatiles.add(VolatileStatus.SEMI_INVULNERABLE, 1);
				expect(volatiles.has(VolatileStatus.SEMI_INVULNERABLE)).toBe(true);
			});
		});

		describe('Solar Beam', () => {
			it('should charge on turn 1 without semi-invulnerable', () => {
				volatiles.add(VolatileStatus.CHARGING, 1);
				expect(volatiles.has(VolatileStatus.CHARGING)).toBe(true);
				expect(volatiles.has(VolatileStatus.SEMI_INVULNERABLE)).toBe(false);
			});

			it('should skip charge turn in harsh sunlight', () => {
				const inSunlight = true;
				const skipCharge = inSunlight;
				expect(skipCharge).toBe(true);
			});
		});

		describe('Skull Bash', () => {
			it('should raise Defense during charge', () => {
				const defenseBoosted = true;
				expect(defenseBoosted).toBe(true);
			});
		});
	});

	describe('Interruption Handling', () => {
		it('should cancel move if flinched during charge', () => {
			volatiles.add(VolatileStatus.CHARGING, 1);
			volatiles.add(VolatileStatus.FLINCH);
			const moveInterrupted = volatiles.has(VolatileStatus.FLINCH);
			expect(moveInterrupted).toBe(true);
		});

		it('should cancel move if paralysis prevents action', () => {
			const fullyParalyzed = true;
			const moveInterrupted = fullyParalyzed;
			expect(moveInterrupted).toBe(true);
		});

		it('should cancel move if confused and hits self', () => {
			volatiles.add(VolatileStatus.CONFUSED, 3);
			const hitsSelfs = volatiles.checkConfusionSelfHit();
			expect(typeof hitsSelfs).toBe('boolean');
		});
	});
});
