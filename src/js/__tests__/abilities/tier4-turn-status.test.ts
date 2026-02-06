import { describe, it, expect, vi } from 'vitest';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import { createTestPokemon, createTestBattleContext } from './test-helpers';
import { Weather } from '../../battle/battle-field';
import {
	speedBoost,
	moody,
	poisonHeal,
	rainDish,
	iceBody,
	drySkin,
	shedSkin,
	slowStart,
	truant,
	immunity,
	limber,
	insomnia,
	vitalSpirit,
	oblivious,
	ownTempo,
	magmaArmor,
	waterVeil,
	guts,
	quickFeet,
	marvelScale,
	toxicBoost,
	flareBoost,
	prankster,
	galeWings,
	tier4TurnStatusAbilities
} from '../../battle/abilities/tiers/tier4-turn-status';

function createTestAbilityContext(
	options: {
		weather?: Weather;
		pokemonHp?: number;
		pokemonMaxHp?: number;
		pokemonStatus?: { abr: string };
	} = {}
): AbilityContext {
	const pokemon = createTestPokemon({
		hp: options.pokemonHp ?? 100,
		maxHp: options.pokemonMaxHp ?? 100
	});
	if (options.pokemonStatus) {
		pokemon.status = options.pokemonStatus as any;
	}
	const battleContext = createTestBattleContext({
		weather: options.weather ?? Weather.NONE
	});

	return {
		battleContext,
		pokemon,
		target: undefined,
		move: undefined
	};
}

describe('Tier 4 - Turn End Abilities', () => {
	describe('Speed Boost', () => {
		it('should have correct metadata', () => {
			expect(speedBoost.id).toBe(3);
			expect(speedBoost.name).toBe('Speed Boost');
			expect(speedBoost.description).toContain('Speed');
		});

		it('should raise speed by 1 stage at turn end', () => {
			const ctx = createTestAbilityContext();

			speedBoost.onTurnEnd!(ctx);

			expect(ctx.pokemon.changeBattleStats).toHaveBeenCalledWith('speed', 1);
		});
	});

	describe('Moody', () => {
		it('should have correct metadata', () => {
			expect(moody.id).toBe(141);
			expect(moody.name).toBe('Moody');
			expect(moody.description).toContain('stat');
		});

		it('should change stats at turn end', () => {
			const ctx = createTestAbilityContext();

			moody.onTurnEnd!(ctx);

			expect(ctx.pokemon.changeBattleStats).toHaveBeenCalled();
		});
	});

	describe('Poison Heal', () => {
		it('should have correct metadata', () => {
			expect(poisonHeal.id).toBe(90);
			expect(poisonHeal.name).toBe('Poison Heal');
			expect(poisonHeal.description).toContain('poison');
		});

		it('should heal 1/8 HP when poisoned', () => {
			const ctx = createTestAbilityContext({
				pokemonHp: 50,
				pokemonMaxHp: 100,
				pokemonStatus: { abr: 'PSN' }
			});

			poisonHeal.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(62);
		});

		it('should heal 1/8 HP when badly poisoned', () => {
			const ctx = createTestAbilityContext({
				pokemonHp: 50,
				pokemonMaxHp: 100,
				pokemonStatus: { abr: 'TOX' }
			});

			poisonHeal.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(62);
		});

		it('should not heal when not poisoned', () => {
			const ctx = createTestAbilityContext({
				pokemonHp: 50,
				pokemonMaxHp: 100
			});

			poisonHeal.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(50);
		});

		it('should not overheal beyond max HP', () => {
			const ctx = createTestAbilityContext({
				pokemonHp: 95,
				pokemonMaxHp: 100,
				pokemonStatus: { abr: 'PSN' }
			});

			poisonHeal.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(100);
		});
	});

	describe('Rain Dish', () => {
		it('should have correct metadata', () => {
			expect(rainDish.id).toBe(44);
			expect(rainDish.name).toBe('Rain Dish');
			expect(rainDish.description).toContain('rain');
		});

		it('should heal 1/16 HP in rain', () => {
			const ctx = createTestAbilityContext({
				weather: Weather.RAIN,
				pokemonHp: 50,
				pokemonMaxHp: 160
			});

			rainDish.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(60);
		});

		it('should not heal in other weather', () => {
			const ctx = createTestAbilityContext({
				weather: Weather.SUN,
				pokemonHp: 50,
				pokemonMaxHp: 160
			});

			rainDish.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(50);
		});
	});

	describe('Ice Body', () => {
		it('should have correct metadata', () => {
			expect(iceBody.id).toBe(115);
			expect(iceBody.name).toBe('Ice Body');
			expect(iceBody.description).toContain('hail');
		});

		it('should heal 1/16 HP in hail', () => {
			const ctx = createTestAbilityContext({
				weather: Weather.HAIL,
				pokemonHp: 50,
				pokemonMaxHp: 160
			});

			iceBody.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(60);
		});
	});

	describe('Dry Skin (Turn End)', () => {
		it('should have correct metadata', () => {
			expect(drySkin.id).toBe(87);
			expect(drySkin.name).toBe('Dry Skin');
		});

		it('should heal 1/8 HP in rain', () => {
			const ctx = createTestAbilityContext({
				weather: Weather.RAIN,
				pokemonHp: 50,
				pokemonMaxHp: 80
			});

			drySkin.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(60);
		});

		it('should take 1/8 damage in sun', () => {
			const ctx = createTestAbilityContext({
				weather: Weather.SUN,
				pokemonHp: 50,
				pokemonMaxHp: 80
			});

			drySkin.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(40);
		});

		it('should not change HP in other weather', () => {
			const ctx = createTestAbilityContext({
				weather: Weather.NONE,
				pokemonHp: 50,
				pokemonMaxHp: 80
			});

			drySkin.onTurnEnd!(ctx);

			expect(ctx.pokemon.currentHp).toBe(50);
		});
	});

	describe('Shed Skin', () => {
		it('should have correct metadata', () => {
			expect(shedSkin.id).toBe(61);
			expect(shedSkin.name).toBe('Shed Skin');
			expect(shedSkin.description).toContain('status');
		});

		it('should have 30% chance to cure status', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'PSN' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.1);

			shedSkin.onTurnEnd!(ctx);

			expect(ctx.pokemon.status).toBeUndefined();

			vi.restoreAllMocks();
		});

		it('should not cure status 70% of the time', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'PSN' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.5);

			shedSkin.onTurnEnd!(ctx);

			expect(ctx.pokemon.status).toBeDefined();

			vi.restoreAllMocks();
		});
	});
});

describe('Tier 4 - Turn Start Abilities', () => {
	describe('Slow Start', () => {
		it('should have correct metadata', () => {
			expect(slowStart.id).toBe(112);
			expect(slowStart.name).toBe('Slow Start');
			expect(slowStart.description).toContain('5');
		});

		it('should halve Attack for first 5 turns', () => {
			const ctx = createTestAbilityContext();
			slowStart.onSwitchIn!(ctx);
			ctx.pokemon.volatiles.has = vi.fn().mockReturnValue(true);

			const result = slowStart.onModifyAtk!(ctx, 100);

			expect(result).toBe(50);
		});

		it('should halve Speed for first 5 turns', () => {
			const ctx = createTestAbilityContext();
			slowStart.onSwitchIn!(ctx);
			ctx.pokemon.volatiles.has = vi.fn().mockReturnValue(true);

			const result = slowStart.onModifySpe!(ctx, 100);

			expect(result).toBe(50);
		});
	});

	describe('Truant', () => {
		it('should have correct metadata', () => {
			expect(truant.id).toBe(54);
			expect(truant.name).toBe('Truant');
			expect(truant.description).toContain('loaf');
		});

		it('should prevent move every other turn', () => {
			const ctx = createTestAbilityContext();
			ctx.pokemon.volatiles.has = vi.fn().mockReturnValue(true);

			const result = truant.onBeforeMove!(ctx);

			expect(result).toBe(false);
		});

		it('should allow move on non-loafing turns', () => {
			const ctx = createTestAbilityContext();
			ctx.pokemon.volatiles.has = vi.fn().mockReturnValue(false);

			const result = truant.onBeforeMove!(ctx);

			expect(result).toBe(true);
		});
	});
});

describe('Tier 4 - Status Immunity Abilities', () => {
	describe('Immunity', () => {
		it('should have correct metadata', () => {
			expect(immunity.id).toBe(17);
			expect(immunity.name).toBe('Immunity');
			expect(immunity.description).toContain('poison');
		});

		it('should block poison status', () => {
			const ctx = createTestAbilityContext();

			const result = immunity.onStatus!(ctx, 'PSN');

			expect(result).toBe(false);
		});

		it('should block toxic status', () => {
			const ctx = createTestAbilityContext();

			const result = immunity.onStatus!(ctx, 'TOX');

			expect(result).toBe(false);
		});

		it('should not block other statuses', () => {
			const ctx = createTestAbilityContext();

			const result = immunity.onStatus!(ctx, 'PAR');

			expect(result).toBe(true);
		});
	});

	describe('Limber', () => {
		it('should have correct metadata', () => {
			expect(limber.id).toBe(7);
			expect(limber.name).toBe('Limber');
			expect(limber.description).toContain('paralyz');
		});

		it('should block paralysis status', () => {
			const ctx = createTestAbilityContext();

			const result = limber.onStatus!(ctx, 'PAR');

			expect(result).toBe(false);
		});
	});

	describe('Insomnia', () => {
		it('should have correct metadata', () => {
			expect(insomnia.id).toBe(15);
			expect(insomnia.name).toBe('Insomnia');
			expect(insomnia.description).toContain('sleep');
		});

		it('should block sleep status', () => {
			const ctx = createTestAbilityContext();

			const result = insomnia.onStatus!(ctx, 'SLP');

			expect(result).toBe(false);
		});
	});

	describe('Vital Spirit', () => {
		it('should have correct metadata', () => {
			expect(vitalSpirit.id).toBe(72);
			expect(vitalSpirit.name).toBe('Vital Spirit');
		});

		it('should block sleep status', () => {
			const ctx = createTestAbilityContext();

			const result = vitalSpirit.onStatus!(ctx, 'SLP');

			expect(result).toBe(false);
		});
	});

	describe('Oblivious', () => {
		it('should have correct metadata', () => {
			expect(oblivious.id).toBe(12);
			expect(oblivious.name).toBe('Oblivious');
			expect(oblivious.description).toContain('Infatuation');
		});

		it('should block infatuation', () => {
			const ctx = createTestAbilityContext();

			const result = oblivious.onStatus!(ctx, 'infatuation');

			expect(result).toBe(false);
		});

		it('should block taunt', () => {
			const ctx = createTestAbilityContext();

			const result = oblivious.onStatus!(ctx, 'taunt');

			expect(result).toBe(false);
		});
	});

	describe('Own Tempo', () => {
		it('should have correct metadata', () => {
			expect(ownTempo.id).toBe(20);
			expect(ownTempo.name).toBe('Own Tempo');
			expect(ownTempo.description).toContain('confus');
		});

		it('should block confusion', () => {
			const ctx = createTestAbilityContext();

			const result = ownTempo.onStatus!(ctx, 'confused');

			expect(result).toBe(false);
		});
	});

	describe('Magma Armor', () => {
		it('should have correct metadata', () => {
			expect(magmaArmor.id).toBe(40);
			expect(magmaArmor.name).toBe('Magma Armor');
			expect(magmaArmor.description).toContain('frozen');
		});

		it('should block freeze status', () => {
			const ctx = createTestAbilityContext();

			const result = magmaArmor.onStatus!(ctx, 'FRZ');

			expect(result).toBe(false);
		});
	});

	describe('Water Veil', () => {
		it('should have correct metadata', () => {
			expect(waterVeil.id).toBe(41);
			expect(waterVeil.name).toBe('Water Veil');
			expect(waterVeil.description).toContain('burn');
		});

		it('should block burn status', () => {
			const ctx = createTestAbilityContext();

			const result = waterVeil.onStatus!(ctx, 'BRN');

			expect(result).toBe(false);
		});
	});
});

describe('Tier 4 - Status Boost Abilities', () => {
	describe('Guts', () => {
		it('should have correct metadata', () => {
			expect(guts.id).toBe(62);
			expect(guts.name).toBe('Guts');
			expect(guts.description).toContain('status');
		});

		it('should boost Attack by 1.5x when statused', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'BRN' }
			});

			const result = guts.onModifyAtk!(ctx, 100);

			expect(result).toBe(150);
		});

		it('should not boost Attack when not statused', () => {
			const ctx = createTestAbilityContext();

			const result = guts.onModifyAtk!(ctx, 100);

			expect(result).toBe(100);
		});
	});

	describe('Quick Feet', () => {
		it('should have correct metadata', () => {
			expect(quickFeet.id).toBe(95);
			expect(quickFeet.name).toBe('Quick Feet');
			expect(quickFeet.description).toContain('Speed');
		});

		it('should boost Speed by 1.5x when statused', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'PAR' }
			});

			const result = quickFeet.onModifySpe!(ctx, 100);

			expect(result).toBe(150);
		});
	});

	describe('Marvel Scale', () => {
		it('should have correct metadata', () => {
			expect(marvelScale.id).toBe(63);
			expect(marvelScale.name).toBe('Marvel Scale');
			expect(marvelScale.description).toContain('Defense');
		});

		it('should boost Defense by 1.5x when statused', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'PSN' }
			});

			const result = marvelScale.onModifyDef!(ctx, 100);

			expect(result).toBe(150);
		});
	});

	describe('Toxic Boost', () => {
		it('should have correct metadata', () => {
			expect(toxicBoost.id).toBe(137);
			expect(toxicBoost.name).toBe('Toxic Boost');
			expect(toxicBoost.description).toContain('poison');
		});

		it('should boost Attack by 1.5x when poisoned', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'PSN' }
			});

			const result = toxicBoost.onModifyAtk!(ctx, 100);

			expect(result).toBe(150);
		});

		it('should boost Attack by 1.5x when badly poisoned', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'TOX' }
			});

			const result = toxicBoost.onModifyAtk!(ctx, 100);

			expect(result).toBe(150);
		});

		it('should not boost Attack when not poisoned', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'BRN' }
			});

			const result = toxicBoost.onModifyAtk!(ctx, 100);

			expect(result).toBe(100);
		});
	});

	describe('Flare Boost', () => {
		it('should have correct metadata', () => {
			expect(flareBoost.id).toBe(138);
			expect(flareBoost.name).toBe('Flare Boost');
			expect(flareBoost.description).toContain('burn');
		});

		it('should boost Special Attack by 1.5x when burned', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'BRN' }
			});

			const result = flareBoost.onModifySpA!(ctx, 100);

			expect(result).toBe(150);
		});

		it('should not boost Special Attack when not burned', () => {
			const ctx = createTestAbilityContext({
				pokemonStatus: { abr: 'PSN' }
			});

			const result = flareBoost.onModifySpA!(ctx, 100);

			expect(result).toBe(100);
		});
	});
});

describe('Tier 4 - Priority Modifiers', () => {
	describe('Prankster', () => {
		it('should have correct metadata', () => {
			expect(prankster.id).toBe(158);
			expect(prankster.name).toBe('Prankster');
			expect(prankster.description).toContain('status');
		});

		it('should have priority modifier for status moves', () => {
			expect(prankster.priority).toBeDefined();
		});
	});

	describe('Gale Wings', () => {
		it('should have correct metadata', () => {
			expect(galeWings.id).toBe(177);
			expect(galeWings.name).toBe('Gale Wings');
			expect(galeWings.description).toContain('Flying');
		});

		it('should have priority modifier', () => {
			expect(galeWings.priority).toBeDefined();
		});
	});
});

describe('Tier 4 Ability Export', () => {
	it('should export all tier 4 abilities as an array', () => {
		expect(Array.isArray(tier4TurnStatusAbilities)).toBe(true);
		expect(tier4TurnStatusAbilities.length).toBeGreaterThanOrEqual(20);
	});

	it('all abilities should have required properties', () => {
		tier4TurnStatusAbilities.forEach(
			(ability: { id: number; name: string; description: string }) => {
				expect(ability.id).toBeDefined();
				expect(typeof ability.id).toBe('number');
				expect(ability.name).toBeDefined();
				expect(typeof ability.name).toBe('string');
				expect(ability.description).toBeDefined();
			}
		);
	});
});
