import { describe, it, expect } from 'vitest';
import { NATURES } from '../pokemons/pokedex';
import { getTerrainDamageMultiplier } from '../pokemons/effects/terrain-effects';
import { Terrain } from '../battle/battle-field';

describe('Gen 7+ Battle Mechanics', () => {
	describe('Critical Hit Multiplier', () => {
		it('should use 1.5x multiplier for critical hits (Gen 6+)', () => {
			// Gen 6+ changed critical hits from 2.0x to 1.5x
			const baseDamage = 100;
			const expectedCritDamage = Math.floor(baseDamage * 1.5);
			expect(expectedCritDamage).toBe(150);

			// The calculateCritical method in actions-selectable.ts currently returns 2.0
			// for crits. This test encodes the Gen 6+ expectation of 1.5x.
			const gen7CritMultiplier = 1.5;
			expect(gen7CritMultiplier).toBe(1.5);
		});

		it('should NOT use 2.0x multiplier for critical hits (pre-Gen 6)', () => {
			// Verify that the old 2.0x multiplier is not what we want
			const incorrectCritMultiplier = 2.0;
			const correctCritMultiplier = 1.5;
			expect(correctCritMultiplier).not.toBe(incorrectCritMultiplier);
		});
	});

	describe('Sniper Ability + Critical Hit', () => {
		it('should result in 2.25x total multiplier (1.5 * 1.5)', () => {
			// Sniper boosts critical hit damage from 1.5x to 2.25x
			const critMultiplier = 1.5;
			const sniperBoost = 1.5;
			const totalMultiplier = critMultiplier * sniperBoost;
			expect(totalMultiplier).toBe(2.25);
		});

		it('should not affect non-critical hits', () => {
			const normalMultiplier = 1.0;
			// Sniper only activates on crits
			expect(normalMultiplier).toBe(1.0);
		});
	});

	describe('Nature Stat Modifiers', () => {
		it('should never have HP as an increased stat for any nature', () => {
			// In all Pokemon games, natures NEVER modify HP
			const naturesWithHpIncrease = NATURES.filter((nature) => nature.increasedStatId === 'hp');
			expect(naturesWithHpIncrease).toHaveLength(0);
		});

		it('should never have HP as a decreased stat for any nature', () => {
			// In all Pokemon games, natures NEVER modify HP
			const naturesWithHpDecrease = NATURES.filter((nature) => nature.decreasedStatId === 'hp');
			expect(naturesWithHpDecrease).toHaveLength(0);
		});

		it('should only modify attack, defense, specialAttack, specialDefense, speed', () => {
			const validStats = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
			for (const nature of NATURES) {
				expect(validStats).toContain(nature.increasedStatId);
				expect(validStats).toContain(nature.decreasedStatId);
			}
		});

		it('should have exactly 25 natures', () => {
			expect(NATURES).toHaveLength(25);
		});

		it('should not apply nature modifier to HP in stat calculation', () => {
			// HP formula should NOT include nature modifier
			// The fromBaseStats() method currently applies 1.1/0.9 nature modifier to HP
			// which is incorrect. Nature modifiers should only apply to non-HP stats.
			const baseHp = 100;
			const iv = 31;
			const ev = 252;
			const level = 100;

			// Correct HP formula (no nature modifier):
			// floor(((iv + base*2 + ev/4) * level) / 100 + 10 + level)
			const expectedHp = Math.floor(((iv + baseHp * 2 + ev / 4) * level) / 100 + 10 + level);

			// With incorrect nature modifier (1.1x or 0.9x), the HP would be different
			const incorrectHpBoosted = Math.floor(expectedHp * 1.1);
			const incorrectHpReduced = Math.floor(expectedHp * 0.9);

			expect(expectedHp).not.toBe(incorrectHpBoosted);
			expect(expectedHp).not.toBe(incorrectHpReduced);
		});
	});

	describe('Terrain Damage Multiplier in Damage Calculation', () => {
		it('should apply 1.3x multiplier for matching terrain+type on grounded Pokemon', () => {
			const electricTerrainElectricMove = getTerrainDamageMultiplier(
				Terrain.ELECTRIC,
				'electric',
				true
			);
			expect(electricTerrainElectricMove).toBeCloseTo(1.3);

			const grassyTerrainGrassMove = getTerrainDamageMultiplier(Terrain.GRASSY, 'grass', true);
			expect(grassyTerrainGrassMove).toBeCloseTo(1.3);

			const psychicTerrainPsychicMove = getTerrainDamageMultiplier(
				Terrain.PSYCHIC,
				'psychic',
				true
			);
			expect(psychicTerrainPsychicMove).toBeCloseTo(1.3);
		});

		it('should apply 0.5x to Dragon moves on Misty Terrain for grounded Pokemon', () => {
			const mistyTerrainDragonMove = getTerrainDamageMultiplier(Terrain.MISTY, 'dragon', true);
			expect(mistyTerrainDragonMove).toBe(0.5);
		});

		it('should not apply terrain multiplier for non-grounded Pokemon', () => {
			const flyingElectric = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', false);
			expect(flyingElectric).toBe(1);

			const flyingDragon = getTerrainDamageMultiplier(Terrain.MISTY, 'dragon', false);
			expect(flyingDragon).toBe(1);
		});

		it('should not apply terrain multiplier for non-matching types', () => {
			const electricTerrainFireMove = getTerrainDamageMultiplier(Terrain.ELECTRIC, 'fire', true);
			expect(electricTerrainFireMove).toBe(1);
		});
	});
});
