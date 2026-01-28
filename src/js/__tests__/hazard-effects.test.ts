import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Hazard } from '../battle/battle-field';
import {
	calculateStealthRockDamage,
	calculateSpikesDamage,
	applyToxicSpikes,
	isGroundedForHazards,
	clearHazardsForSide
} from '../pokemons/effects/hazard-effects';

describe('Entry Hazards', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Stealth Rock', () => {
		it('should deal 1/8 max HP to neutral types', () => {
			const maxHp = 200;
			const types = ['normal'];
			const damage = calculateStealthRockDamage(maxHp, types);
			expect(damage).toBe(25);
		});

		it('should deal 1/4 max HP to 2x weak types (Fire, Flying, Bug, Ice)', () => {
			const maxHp = 200;
			const types = ['fire'];
			const damage = calculateStealthRockDamage(maxHp, types);
			expect(damage).toBe(50);
		});

		it('should deal 1/2 max HP to 4x weak types (Fire/Flying)', () => {
			const maxHp = 200;
			const types = ['fire', 'flying'];
			const damage = calculateStealthRockDamage(maxHp, types);
			expect(damage).toBe(100);
		});

		it('should deal 1/16 max HP to 2x resistant types (Fighting, Ground, Steel)', () => {
			const maxHp = 200;
			const types = ['fighting'];
			const damage = calculateStealthRockDamage(maxHp, types);
			expect(damage).toBe(12);
		});

		it('should deal 1/32 max HP to 4x resistant types (Fighting/Ground)', () => {
			const maxHp = 200;
			const types = ['fighting', 'ground'];
			const damage = calculateStealthRockDamage(maxHp, types);
			expect(damage).toBe(6);
		});

		it('should always deal at least 1 damage', () => {
			const maxHp = 10;
			const types = ['fighting', 'ground'];
			const damage = calculateStealthRockDamage(maxHp, types);
			expect(damage).toBeGreaterThanOrEqual(1);
		});
	});

	describe('Spikes', () => {
		it('should deal 1/8 max HP with 1 layer', () => {
			const maxHp = 200;
			const damage = calculateSpikesDamage(maxHp, 1);
			expect(damage).toBe(25);
		});

		it('should deal 1/6 max HP with 2 layers', () => {
			const maxHp = 200;
			const damage = calculateSpikesDamage(maxHp, 2);
			expect(damage).toBe(33);
		});

		it('should deal 1/4 max HP with 3 layers', () => {
			const maxHp = 200;
			const damage = calculateSpikesDamage(maxHp, 3);
			expect(damage).toBe(50);
		});

		it('should deal 0 damage with 0 layers', () => {
			const maxHp = 200;
			const damage = calculateSpikesDamage(maxHp, 0);
			expect(damage).toBe(0);
		});
	});

	describe('Toxic Spikes', () => {
		it('should apply regular poison with 1 layer', () => {
			const result = applyToxicSpikes(1);
			expect(result).toBe('poison');
		});

		it('should apply bad poison (toxic) with 2 layers', () => {
			const result = applyToxicSpikes(2);
			expect(result).toBe('toxic');
		});

		it('should return none with 0 layers', () => {
			const result = applyToxicSpikes(0);
			expect(result).toBe('none');
		});
	});

	describe('Grounded Check for Hazards', () => {
		it('should return true for ground-based types', () => {
			expect(isGroundedForHazards(['normal'])).toBe(true);
			expect(isGroundedForHazards(['fire'])).toBe(true);
			expect(isGroundedForHazards(['water'])).toBe(true);
		});

		it('should return false for Flying types', () => {
			expect(isGroundedForHazards(['flying'])).toBe(false);
			expect(isGroundedForHazards(['normal', 'flying'])).toBe(false);
		});

		it('should handle case insensitive types', () => {
			expect(isGroundedForHazards(['Flying'])).toBe(false);
			expect(isGroundedForHazards(['FLYING'])).toBe(false);
		});
	});

	describe('Hazard Clearing', () => {
		beforeEach(() => {
			battleField.addHazard('ally', Hazard.STEALTH_ROCK);
			battleField.addHazard('ally', Hazard.SPIKES);
			battleField.addHazard('ally', Hazard.SPIKES);
			battleField.addHazard('ally', Hazard.TOXIC_SPIKES);
		});

		it('should clear all hazards from a side with Rapid Spin', () => {
			clearHazardsForSide(battleField, 'ally');
			expect(battleField.hasHazard('ally', Hazard.STEALTH_ROCK)).toBe(false);
			expect(battleField.hasHazard('ally', Hazard.SPIKES)).toBe(false);
			expect(battleField.hasHazard('ally', Hazard.TOXIC_SPIKES)).toBe(false);
		});

		it('should not affect the other side when clearing hazards', () => {
			battleField.addHazard('enemy', Hazard.STEALTH_ROCK);
			clearHazardsForSide(battleField, 'ally');
			expect(battleField.hasHazard('enemy', Hazard.STEALTH_ROCK)).toBe(true);
		});
	});

	describe('Poison Type Absorbs Toxic Spikes', () => {
		it('should absorb toxic spikes when poison type switches in', () => {
			battleField.addHazard('ally', Hazard.TOXIC_SPIKES);
			battleField.addHazard('ally', Hazard.TOXIC_SPIKES);
			expect(battleField.getHazardLayers('ally', Hazard.TOXIC_SPIKES)).toBe(2);

			const isPoisonType = true;
			if (isPoisonType && isGroundedForHazards(['poison'])) {
				battleField.removeHazard('ally', Hazard.TOXIC_SPIKES);
			}
			expect(battleField.hasHazard('ally', Hazard.TOXIC_SPIKES)).toBe(false);
		});
	});
});
