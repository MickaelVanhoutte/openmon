import { describe, it, expect } from 'vitest';
import { Weather } from '../../battle/battle-field';
import type { AbilityContext } from '../../battle/abilities/ability-types';

import type { BattleContext } from '../../context/battleContext';
import type { PokemonInstance } from '../../pokemons/pokedex';
import {
	hugePower,
	purePower,
	hustle,
	guts,
	defeatist,
	furCoat,
	marvelScale,
	chlorophyll,
	swiftSwim,
	sandRush,
	slushRush,
	quickFeet,
	solarPower,
	sniper,
	adaptability,
	thickFat,
	waterBubble,
	steelworker,
	gorillaTactics,
	transistor,
	dragonsMaw,
	tier1PassiveStatAbilities
} from '../../battle/abilities/tiers/tier1-passive-stats';

function createMockContext(
	overrides: {
		weather?: Weather;
		status?: string;
		hpPercent?: number;
		types?: string[];
		moveType?: string;
		moveCategory?: string;
		isCrit?: boolean;
	} = {}
): AbilityContext {
	const mockPokemon = {
		currentHp: overrides.hpPercent !== undefined ? overrides.hpPercent : 100,
		currentStats: { hp: 100 },
		status: overrides.status || undefined,
		types: overrides.types || ['normal']
	} as unknown as PokemonInstance;

	const mockBattleContext = {
		battleField: {
			weather: overrides.weather || Weather.NONE
		}
	} as unknown as BattleContext;

	return {
		battleContext: mockBattleContext,
		pokemon: mockPokemon,
		move: overrides.moveType
			? ({
					type: overrides.moveType,
					category: overrides.moveCategory || 'physical'
				} as any)
			: undefined
	};
}

describe('Tier 1 Passive Stat Modifier Abilities', () => {
	describe('Attack Modifiers', () => {
		it('Huge Power should double Attack', () => {
			const ctx = createMockContext();
			expect(hugePower.onModifyAtk!(ctx, 100)).toBe(200);
		});

		it('Pure Power should double Attack', () => {
			const ctx = createMockContext();
			expect(purePower.onModifyAtk!(ctx, 100)).toBe(200);
		});

		it('Hustle should boost Attack by 1.5x', () => {
			const ctx = createMockContext();
			expect(hustle.onModifyAtk!(ctx, 100)).toBe(150);
		});

		it('Guts should boost Attack by 1.5x when statused', () => {
			const ctxNoStatus = createMockContext();
			const ctxWithStatus = createMockContext({ status: 'burn' });

			expect(guts.onModifyAtk!(ctxNoStatus, 100)).toBe(100);
			expect(guts.onModifyAtk!(ctxWithStatus, 100)).toBe(150);
		});

		it('Gorilla Tactics should boost Attack by 1.5x', () => {
			const ctx = createMockContext();
			expect(gorillaTactics.onModifyAtk!(ctx, 100)).toBe(150);
		});
	});

	describe('Defeatist', () => {
		it('should halve Attack when HP is below 50%', () => {
			const ctxHighHp = createMockContext({ hpPercent: 60 });
			const ctxLowHp = createMockContext({ hpPercent: 40 });

			expect(defeatist.onModifyAtk!(ctxHighHp, 100)).toBe(100);
			expect(defeatist.onModifyAtk!(ctxLowHp, 100)).toBe(50);
		});

		it('should halve Special Attack when HP is below 50%', () => {
			const ctxHighHp = createMockContext({ hpPercent: 60 });
			const ctxLowHp = createMockContext({ hpPercent: 40 });

			expect(defeatist.onModifySpA!(ctxHighHp, 100)).toBe(100);
			expect(defeatist.onModifySpA!(ctxLowHp, 100)).toBe(50);
		});
	});

	describe('Defense Modifiers', () => {
		it('Fur Coat should double Defense', () => {
			const ctx = createMockContext();
			expect(furCoat.onModifyDef!(ctx, 100)).toBe(200);
		});

		it('Marvel Scale should boost Defense by 1.5x when statused', () => {
			const ctxNoStatus = createMockContext();
			const ctxWithStatus = createMockContext({ status: 'poison' });

			expect(marvelScale.onModifyDef!(ctxNoStatus, 100)).toBe(100);
			expect(marvelScale.onModifyDef!(ctxWithStatus, 100)).toBe(150);
		});
	});

	describe('Speed Modifiers - Weather Based', () => {
		it('Chlorophyll should double Speed in sun', () => {
			const ctxNoWeather = createMockContext({ weather: Weather.NONE });
			const ctxSun = createMockContext({ weather: Weather.SUN });

			expect(chlorophyll.onModifySpe!(ctxNoWeather, 100)).toBe(100);
			expect(chlorophyll.onModifySpe!(ctxSun, 100)).toBe(200);
		});

		it('Swift Swim should double Speed in rain', () => {
			const ctxNoWeather = createMockContext({ weather: Weather.NONE });
			const ctxRain = createMockContext({ weather: Weather.RAIN });

			expect(swiftSwim.onModifySpe!(ctxNoWeather, 100)).toBe(100);
			expect(swiftSwim.onModifySpe!(ctxRain, 100)).toBe(200);
		});

		it('Sand Rush should double Speed in sandstorm', () => {
			const ctxNoWeather = createMockContext({ weather: Weather.NONE });
			const ctxSand = createMockContext({ weather: Weather.SAND });

			expect(sandRush.onModifySpe!(ctxNoWeather, 100)).toBe(100);
			expect(sandRush.onModifySpe!(ctxSand, 100)).toBe(200);
		});

		it('Slush Rush should double Speed in hail', () => {
			const ctxNoWeather = createMockContext({ weather: Weather.NONE });
			const ctxHail = createMockContext({ weather: Weather.HAIL });

			expect(slushRush.onModifySpe!(ctxNoWeather, 100)).toBe(100);
			expect(slushRush.onModifySpe!(ctxHail, 100)).toBe(200);
		});
	});

	describe('Speed Modifiers - Status Based', () => {
		it('Quick Feet should boost Speed by 1.5x when statused', () => {
			const ctxNoStatus = createMockContext();
			const ctxWithStatus = createMockContext({ status: 'paralysis' });

			expect(quickFeet.onModifySpe!(ctxNoStatus, 100)).toBe(100);
			expect(quickFeet.onModifySpe!(ctxWithStatus, 100)).toBe(150);
		});
	});

	describe('Special Attack Modifiers', () => {
		it('Solar Power should boost SpA by 1.5x in sun', () => {
			const ctxNoWeather = createMockContext({ weather: Weather.NONE });
			const ctxSun = createMockContext({ weather: Weather.SUN });

			expect(solarPower.onModifySpA!(ctxNoWeather, 100)).toBe(100);
			expect(solarPower.onModifySpA!(ctxSun, 100)).toBe(150);
		});

		it('Transistor should boost Electric moves by 1.5x', () => {
			const ctxElectric = createMockContext({ moveType: 'electric' });
			const ctxNormal = createMockContext({ moveType: 'normal' });

			expect(transistor.onModifySpA!(ctxElectric, 100)).toBe(150);
			expect(transistor.onModifySpA!(ctxNormal, 100)).toBe(100);
		});

		it("Dragon's Maw should boost Dragon moves by 1.5x", () => {
			const ctxDragon = createMockContext({ moveType: 'dragon' });
			const ctxNormal = createMockContext({ moveType: 'normal' });

			expect(dragonsMaw.onModifySpA!(ctxDragon, 100)).toBe(150);
			expect(dragonsMaw.onModifySpA!(ctxNormal, 100)).toBe(100);
		});
	});

	describe('Damage Modifiers (noted for future)', () => {
		it('Sniper should have proper metadata', () => {
			expect(sniper.id).toBe(97);
			expect(sniper.name).toBe('Sniper');
			expect(sniper.description).toContain('critical');
		});

		it('Adaptability should have proper metadata', () => {
			expect(adaptability.id).toBe(91);
			expect(adaptability.name).toBe('Adaptability');
			expect(adaptability.description).toContain('STAB');
		});
	});

	describe('Type-Specific Defensive Abilities', () => {
		it('Thick Fat should halve Fire damage', () => {
			const ctxFire = createMockContext({ moveType: 'fire' });
			const ctxIce = createMockContext({ moveType: 'ice' });
			const ctxNormal = createMockContext({ moveType: 'normal' });

			expect(thickFat.onSourceModifyDamage!(ctxFire, 100)).toBe(50);
			expect(thickFat.onSourceModifyDamage!(ctxIce, 100)).toBe(50);
			expect(thickFat.onSourceModifyDamage!(ctxNormal, 100)).toBe(100);
		});

		it('Water Bubble should halve Fire damage', () => {
			const ctxFire = createMockContext({ moveType: 'fire' });
			const ctxNormal = createMockContext({ moveType: 'normal' });

			expect(waterBubble.onSourceModifyDamage!(ctxFire, 100)).toBe(50);
			expect(waterBubble.onSourceModifyDamage!(ctxNormal, 100)).toBe(100);
		});
	});

	describe('Type-Specific Offensive Abilities', () => {
		it('Water Bubble should double Water move damage', () => {
			const ctxWater = createMockContext({ moveType: 'water' });
			const ctxNormal = createMockContext({ moveType: 'normal' });

			expect(waterBubble.onModifyDamage!(ctxWater, 100)).toBe(200);
			expect(waterBubble.onModifyDamage!(ctxNormal, 100)).toBe(100);
		});

		it('Steelworker should boost Steel moves by 1.5x', () => {
			const ctxSteel = createMockContext({ moveType: 'steel' });
			const ctxNormal = createMockContext({ moveType: 'normal' });

			expect(steelworker.onModifyDamage!(ctxSteel, 100)).toBe(150);
			expect(steelworker.onModifyDamage!(ctxNormal, 100)).toBe(100);
		});
	});

	describe('Ability Export', () => {
		it('should export all tier 1 abilities as an array', () => {
			expect(Array.isArray(tier1PassiveStatAbilities)).toBe(true);
			expect(tier1PassiveStatAbilities.length).toBeGreaterThanOrEqual(15);
		});

		it('all abilities should have required properties', () => {
			tier1PassiveStatAbilities.forEach((ability) => {
				expect(ability.id).toBeDefined();
				expect(typeof ability.id).toBe('number');
				expect(ability.name).toBeDefined();
				expect(typeof ability.name).toBe('string');
				expect(ability.description).toBeDefined();
			});
		});
	});
});
