import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Terrain } from '../battle/battle-field';
import {
	getTerrainDamageMultiplier,
	canApplyStatusOnTerrain,
	isGroundedForTerrain,
	getGrassyTerrainHealing,
	blocksPriorityOnTerrain
} from '../pokemons/effects/terrain-effects';

describe('Terrain Effects', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Electric Terrain', () => {
		beforeEach(() => {
			battleField.setTerrain(Terrain.ELECTRIC, 5);
		});

		it('should boost Electric moves by 1.3x for grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', true);
			expect(multiplier).toBeCloseTo(1.3);
		});

		it('should not boost Electric moves for non-grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', false);
			expect(multiplier).toBe(1);
		});

		it('should not boost non-Electric moves', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'fire', true);
			expect(multiplier).toBe(1);
		});
	});

	describe('Grassy Terrain', () => {
		beforeEach(() => {
			battleField.setTerrain(Terrain.GRASSY, 5);
		});

		it('should boost Grass moves by 1.3x for grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.GRASSY, 'grass', true);
			expect(multiplier).toBeCloseTo(1.3);
		});

		it('should halve Earthquake damage', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.GRASSY, 'ground', true, 'earthquake');
			expect(multiplier).toBe(0.5);
		});

		it('should halve Bulldoze damage', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.GRASSY, 'ground', true, 'bulldoze');
			expect(multiplier).toBe(0.5);
		});

		it('should halve Magnitude damage', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.GRASSY, 'ground', true, 'magnitude');
			expect(multiplier).toBe(0.5);
		});

		it('should heal 1/16 max HP for grounded Pokemon', () => {
			const maxHp = 200;
			const healing = getGrassyTerrainHealing(maxHp, true);
			expect(healing).toBe(12);
		});

		it('should not heal non-grounded Pokemon', () => {
			const maxHp = 200;
			const healing = getGrassyTerrainHealing(maxHp, false);
			expect(healing).toBe(0);
		});
	});

	describe('Psychic Terrain', () => {
		beforeEach(() => {
			battleField.setTerrain(Terrain.PSYCHIC, 5);
		});

		it('should boost Psychic moves by 1.3x for grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.PSYCHIC, 'psychic', true);
			expect(multiplier).toBeCloseTo(1.3);
		});

		it('should block priority moves against grounded Pokemon', () => {
			expect(blocksPriorityOnTerrain(Terrain.PSYCHIC, true)).toBe(true);
		});

		it('should not block priority moves against non-grounded Pokemon', () => {
			expect(blocksPriorityOnTerrain(Terrain.PSYCHIC, false)).toBe(false);
		});

		it('should not block priority on other terrains', () => {
			expect(blocksPriorityOnTerrain(Terrain.ELECTRIC, true)).toBe(false);
		});
	});

	describe('Misty Terrain', () => {
		beforeEach(() => {
			battleField.setTerrain(Terrain.MISTY, 5);
		});

		it('should halve Dragon moves for grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.MISTY, 'dragon', true);
			expect(multiplier).toBe(0.5);
		});

		it('should not affect Dragon moves against non-grounded Pokemon', () => {
			const multiplier = getTerrainDamageMultiplier(Terrain.MISTY, 'dragon', false);
			expect(multiplier).toBe(1);
		});

		it('should block status conditions for grounded Pokemon', () => {
			expect(canApplyStatusOnTerrain(Terrain.MISTY, true)).toBe(false);
		});

		it('should not block status for non-grounded Pokemon', () => {
			expect(canApplyStatusOnTerrain(Terrain.MISTY, false)).toBe(true);
		});

		it('should not block status on other terrains', () => {
			expect(canApplyStatusOnTerrain(Terrain.ELECTRIC, true)).toBe(true);
		});
	});

	describe('Terrain Duration', () => {
		it('should last 5 turns by default', () => {
			battleField.setTerrain(Terrain.ELECTRIC, 5);
			expect(battleField.terrain).toBe(Terrain.ELECTRIC);
			expect(battleField.terrainTurns).toBe(5);
		});

		it('should expire after turns run out', () => {
			battleField.setTerrain(Terrain.ELECTRIC, 2);
			battleField.tickTurn();
			expect(battleField.terrain).toBe(Terrain.ELECTRIC);
			battleField.tickTurn();
			expect(battleField.terrain).toBe(Terrain.NONE);
		});

		it('should replace previous terrain', () => {
			battleField.setTerrain(Terrain.ELECTRIC, 5);
			battleField.setTerrain(Terrain.GRASSY, 5);
			expect(battleField.terrain).toBe(Terrain.GRASSY);
		});
	});

	describe('Grounded Check', () => {
		it('should return true for ground-based types', () => {
			expect(isGroundedForTerrain(['normal'])).toBe(true);
			expect(isGroundedForTerrain(['fire'])).toBe(true);
		});

		it('should return false for Flying types', () => {
			expect(isGroundedForTerrain(['flying'])).toBe(false);
			expect(isGroundedForTerrain(['normal', 'flying'])).toBe(false);
		});
	});
});
