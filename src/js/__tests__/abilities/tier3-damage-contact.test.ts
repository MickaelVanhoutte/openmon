import { describe, it, expect, vi } from 'vitest';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import type { Move } from '../../pokemons/pokedex';
import { createTestPokemon, createTestBattleContext } from './test-helpers';
import {
	roughSkin,
	ironBarbs,
	staticAbility,
	flameBody,
	poisonPoint,
	cuteCharm,
	levitate,
	waterAbsorb,
	voltAbsorb,
	flashFire,
	sapSipper,
	motorDrive,
	lightningRod,
	stormDrain,
	tier3DamageContactAbilities
} from '../../battle/abilities/tiers/tier3-damage-contact';

function createMockMove(overrides: Partial<Move> = {}): Move {
	return {
		id: 1,
		name: 'Test Move',
		type: 'normal',
		category: 'physical',
		power: 80,
		accuracy: 100,
		pp: 10,
		priority: 0,
		target: 'selected-pokemon',
		effect: {} as any,
		effectChance: 0,
		description: 'Test move',
		level: 1,
		method: 1,
		...overrides
	} as Move;
}

function createTestAbilityContext(
	options: {
		move?: Partial<Move>;
		targetHp?: number;
		targetMaxHp?: number;
		pokemonHp?: number;
		pokemonMaxHp?: number;
	} = {}
): AbilityContext {
	const pokemon = createTestPokemon({
		hp: options.pokemonHp ?? 100,
		maxHp: options.pokemonMaxHp ?? 100
	});
	const target = createTestPokemon({
		hp: options.targetHp ?? 100,
		maxHp: options.targetMaxHp ?? 100
	});
	const battleContext = createTestBattleContext();

	return {
		battleContext,
		pokemon,
		target,
		move: options.move ? createMockMove(options.move) : undefined
	};
}

describe('Tier 3 - Contact Abilities', () => {
	describe('Rough Skin', () => {
		it('should have correct metadata', () => {
			expect(roughSkin.id).toBe(24);
			expect(roughSkin.name).toBe('Rough Skin');
			expect(roughSkin.description).toContain('contact');
		});

		it('should damage attacker on physical contact', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' },
				targetHp: 100,
				targetMaxHp: 100
			});

			roughSkin.onDamagingHit!(ctx, 50);

			expect(ctx.target!.currentHp).toBeLessThan(100);
		});

		it('should not damage attacker on special moves', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'special' },
				targetHp: 100,
				targetMaxHp: 100
			});

			roughSkin.onDamagingHit!(ctx, 50);

			expect(ctx.target!.currentHp).toBe(100);
		});
	});

	describe('Iron Barbs', () => {
		it('should have correct metadata', () => {
			expect(ironBarbs.id).toBe(160);
			expect(ironBarbs.name).toBe('Iron Barbs');
		});

		it('should damage attacker on physical contact', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' },
				targetHp: 100,
				targetMaxHp: 100
			});

			ironBarbs.onDamagingHit!(ctx, 50);

			expect(ctx.target!.currentHp).toBeLessThan(100);
		});
	});

	describe('Static', () => {
		it('should have correct metadata', () => {
			expect(staticAbility.id).toBe(9);
			expect(staticAbility.name).toBe('Static');
			expect(staticAbility.description).toContain('paralyze');
		});

		it('should have 30% chance to paralyze on physical contact', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.1);

			staticAbility.onDamagingHit!(ctx, 50);

			expect(ctx.target!.status).toBeDefined();
			expect(ctx.target!.status?.abr).toBe('PAR');

			vi.restoreAllMocks();
		});

		it('should not paralyze on special moves', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'special' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.1);

			staticAbility.onDamagingHit!(ctx, 50);

			expect(ctx.target!.status).toBeUndefined();

			vi.restoreAllMocks();
		});

		it('should not always paralyze when random exceeds 30%', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.5);

			staticAbility.onDamagingHit!(ctx, 50);

			expect(ctx.target!.status).toBeUndefined();

			vi.restoreAllMocks();
		});
	});

	describe('Flame Body', () => {
		it('should have correct metadata', () => {
			expect(flameBody.id).toBe(49);
			expect(flameBody.name).toBe('Flame Body');
			expect(flameBody.description).toContain('burn');
		});

		it('should have 30% chance to burn on physical contact', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.1);

			flameBody.onDamagingHit!(ctx, 50);

			expect(ctx.target!.status).toBeDefined();
			expect(ctx.target!.status?.abr).toBe('BRN');

			vi.restoreAllMocks();
		});
	});

	describe('Poison Point', () => {
		it('should have correct metadata', () => {
			expect(poisonPoint.id).toBe(38);
			expect(poisonPoint.name).toBe('Poison Point');
			expect(poisonPoint.description).toContain('poison');
		});

		it('should have 30% chance to poison on physical contact', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.1);

			poisonPoint.onDamagingHit!(ctx, 50);

			expect(ctx.target!.status).toBeDefined();
			expect(ctx.target!.status?.abr).toBe('PSN');

			vi.restoreAllMocks();
		});
	});

	describe('Cute Charm', () => {
		it('should have correct metadata', () => {
			expect(cuteCharm.id).toBe(56);
			expect(cuteCharm.name).toBe('Cute Charm');
			expect(cuteCharm.description).toContain('infatuat');
		});

		it('should have 30% chance to infatuate on physical contact', () => {
			const ctx = createTestAbilityContext({
				move: { category: 'physical' }
			});

			vi.spyOn(Math, 'random').mockReturnValue(0.1);

			cuteCharm.onDamagingHit!(ctx, 50);

			expect(ctx.target!.volatiles.add).toHaveBeenCalled();

			vi.restoreAllMocks();
		});
	});
});

describe('Tier 3 - Type Immunities', () => {
	describe('Levitate', () => {
		it('should have correct metadata', () => {
			expect(levitate.id).toBe(26);
			expect(levitate.name).toBe('Levitate');
			expect(levitate.description).toContain('Ground');
		});

		it('should be immune to Ground-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'ground' }
			});

			const result = levitate.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should not be immune to other types', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'fire' }
			});

			const result = levitate.onTryHit!(ctx);

			expect(result).toBe(true);
		});
	});

	describe('Water Absorb', () => {
		it('should have correct metadata', () => {
			expect(waterAbsorb.id).toBe(11);
			expect(waterAbsorb.name).toBe('Water Absorb');
			expect(waterAbsorb.description).toContain('Water');
		});

		it('should be immune to Water-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'water' },
				pokemonHp: 50,
				pokemonMaxHp: 100
			});

			const result = waterAbsorb.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should heal 25% max HP when hit by Water', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'water' },
				pokemonHp: 50,
				pokemonMaxHp: 100
			});

			waterAbsorb.onTryHit!(ctx);

			expect(ctx.pokemon.currentHp).toBe(75);
		});

		it('should not overheal beyond max HP', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'water' },
				pokemonHp: 90,
				pokemonMaxHp: 100
			});

			waterAbsorb.onTryHit!(ctx);

			expect(ctx.pokemon.currentHp).toBe(100);
		});
	});

	describe('Volt Absorb', () => {
		it('should have correct metadata', () => {
			expect(voltAbsorb.id).toBe(10);
			expect(voltAbsorb.name).toBe('Volt Absorb');
			expect(voltAbsorb.description).toContain('Electric');
		});

		it('should be immune to Electric-type moves and heal', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'electric' },
				pokemonHp: 50,
				pokemonMaxHp: 100
			});

			const result = voltAbsorb.onTryHit!(ctx);

			expect(result).toBe(false);
			expect(ctx.pokemon.currentHp).toBe(75);
		});
	});

	describe('Flash Fire', () => {
		it('should have correct metadata', () => {
			expect(flashFire.id).toBe(18);
			expect(flashFire.name).toBe('Flash Fire');
			expect(flashFire.description).toContain('Fire');
		});

		it('should be immune to Fire-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'fire' }
			});

			const result = flashFire.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should boost Fire-type moves after activation', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'fire' }
			});

			flashFire.onTryHit!(ctx);

			if (flashFire.onModifyDamage) {
				const boostedDamage = flashFire.onModifyDamage(ctx, 100);
				expect(boostedDamage).toBe(150);
			}
		});
	});

	describe('Sap Sipper', () => {
		it('should have correct metadata', () => {
			expect(sapSipper.id).toBe(157);
			expect(sapSipper.name).toBe('Sap Sipper');
			expect(sapSipper.description).toContain('Grass');
		});

		it('should be immune to Grass-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'grass' }
			});

			const result = sapSipper.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should boost Attack when hit by Grass', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'grass' }
			});

			sapSipper.onTryHit!(ctx);

			expect(ctx.pokemon.changeBattleStats).toHaveBeenCalled();
		});
	});

	describe('Motor Drive', () => {
		it('should have correct metadata', () => {
			expect(motorDrive.id).toBe(78);
			expect(motorDrive.name).toBe('Motor Drive');
			expect(motorDrive.description).toContain('Electric');
		});

		it('should be immune to Electric-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'electric' }
			});

			const result = motorDrive.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should boost Speed when hit by Electric', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'electric' }
			});

			motorDrive.onTryHit!(ctx);

			expect(ctx.pokemon.changeBattleStats).toHaveBeenCalled();
		});
	});

	describe('Lightning Rod', () => {
		it('should have correct metadata', () => {
			expect(lightningRod.id).toBe(31);
			expect(lightningRod.name).toBe('Lightning Rod');
			expect(lightningRod.description).toContain('Electric');
		});

		it('should be immune to Electric-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'electric' }
			});

			const result = lightningRod.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should boost Special Attack when hit by Electric', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'electric' }
			});

			lightningRod.onTryHit!(ctx);

			expect(ctx.pokemon.changeBattleStats).toHaveBeenCalled();
		});
	});

	describe('Storm Drain', () => {
		it('should have correct metadata', () => {
			expect(stormDrain.id).toBe(114);
			expect(stormDrain.name).toBe('Storm Drain');
			expect(stormDrain.description).toContain('Water');
		});

		it('should be immune to Water-type moves', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'water' }
			});

			const result = stormDrain.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should boost Special Attack when hit by Water', () => {
			const ctx = createTestAbilityContext({
				move: { type: 'water' }
			});

			stormDrain.onTryHit!(ctx);

			expect(ctx.pokemon.changeBattleStats).toHaveBeenCalled();
		});
	});
});

describe('Tier 3 Ability Export', () => {
	it('should export all tier 3 abilities as an array', () => {
		expect(Array.isArray(tier3DamageContactAbilities)).toBe(true);
		expect(tier3DamageContactAbilities.length).toBeGreaterThanOrEqual(14);
	});

	it('all abilities should have required properties', () => {
		tier3DamageContactAbilities.forEach((ability) => {
			expect(ability.id).toBeDefined();
			expect(typeof ability.id).toBe('number');
			expect(ability.name).toBeDefined();
			expect(typeof ability.name).toBe('string');
			expect(ability.description).toBeDefined();
		});
	});
});
