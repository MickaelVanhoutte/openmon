import { describe, it, expect, vi } from 'vitest';
import type { AbilityContext, Ability } from '../../battle/abilities/ability-types';
import type { BattleContext } from '../../context/battleContext';
import type { PokemonInstance, Move } from '../../pokemons/pokedex';
import { BattleField } from '../../battle/battle-field';
import { createTestPokemon } from './test-helpers';
import {
	moldBreaker,
	teravolt,
	turboblaze,
	neutralizingGas,
	mummy,
	trace,
	receiver,
	powerOfAlchemy,
	damp,
	tier5SuppressionAbilities
} from '../../battle/abilities/tiers/tier5-suppression';

function createMockContextWithSides(
	overrides: {
		pokemon?: Partial<PokemonInstance>;
		target?: PokemonInstance;
		move?: Partial<Move>;
		oppSide?: PokemonInstance[];
		playerSide?: PokemonInstance[];
		faintedAlly?: PokemonInstance;
	} = {}
): AbilityContext {
	const mockPokemon = {
		name: 'Test Pokemon',
		currentAbility: 'Test Ability',
		currentHp: 100,
		currentStats: {
			hp: 100,
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		battleStats: {
			hp: 100,
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		fainted: false,
		changeBattleStats: vi.fn(),
		...overrides.pokemon
	} as unknown as PokemonInstance;

	const battleField = new BattleField();

	const mockBattleContext = {
		battleField,
		playerSide: overrides.playerSide || [mockPokemon],
		oppSide: overrides.oppSide || [],
		addToStack: vi.fn(),
		faintedAlly: overrides.faintedAlly
	} as unknown as BattleContext;

	return {
		battleContext: mockBattleContext,
		pokemon: mockPokemon,
		target: overrides.target,
		move: overrides.move as Move
	};
}

describe('Tier 5 Suppression Mechanics Abilities', () => {
	// =============================================================================
	// ABILITY IGNORERS (Mold Breaker, Teravolt, Turboblaze)
	// =============================================================================

	describe('Mold Breaker', () => {
		it('should have correct metadata', () => {
			expect(moldBreaker.id).toBe(104);
			expect(moldBreaker.name).toBe('Mold Breaker');
		});

		it('should have onSwitchIn hook for display message', () => {
			expect(moldBreaker.onSwitchIn).toBeDefined();
		});

		it('should not have suppressedBy (it ignores others, not the other way around)', () => {
			expect(moldBreaker.suppressedBy).toBeUndefined();
		});
	});

	describe('Teravolt', () => {
		it('should have correct metadata', () => {
			expect(teravolt.id).toBe(164);
			expect(teravolt.name).toBe('Teravolt');
		});

		it('should have onSwitchIn hook for display message', () => {
			expect(teravolt.onSwitchIn).toBeDefined();
		});
	});

	describe('Turboblaze', () => {
		it('should have correct metadata', () => {
			expect(turboblaze.id).toBe(163);
			expect(turboblaze.name).toBe('Turboblaze');
		});

		it('should have onSwitchIn hook for display message', () => {
			expect(turboblaze.onSwitchIn).toBeDefined();
		});
	});

	// =============================================================================
	// GLOBAL SUPPRESSION (Neutralizing Gas)
	// =============================================================================

	describe('Neutralizing Gas', () => {
		it('should have correct metadata', () => {
			expect(neutralizingGas.id).toBe(256);
			expect(neutralizingGas.name).toBe('Neutralizing Gas');
		});

		it('should have onSwitchIn hook', () => {
			expect(neutralizingGas.onSwitchIn).toBeDefined();
		});

		it('should set neutralizingGasActive flag on switch-in', () => {
			const ctx = createMockContextWithSides();
			(ctx.battleContext.battleField as any).neutralizingGasActive = false;

			neutralizingGas.onSwitchIn!(ctx);

			expect((ctx.battleContext.battleField as any).neutralizingGasActive).toBe(true);
		});

		it('should not be suppressed by other abilities', () => {
			expect(neutralizingGas.suppressedBy).toBeUndefined();
		});
	});

	// =============================================================================
	// ABILITY CHANGERS (Mummy)
	// =============================================================================

	describe('Mummy', () => {
		it('should have correct metadata', () => {
			expect(mummy.id).toBe(152);
			expect(mummy.name).toBe('Mummy');
		});

		it('should change attacker ability to Mummy on physical contact', () => {
			const attacker = createTestPokemon({ ability: 'Intimidate' });
			const ctx = createMockContextWithSides({
				target: attacker,
				move: { category: 'physical' } as Partial<Move>
			});

			mummy.onDamagingHit!(ctx, 50);

			expect(attacker.currentAbility).toBe('Mummy');
		});

		it('should NOT change ability on special move contact', () => {
			const attacker = createTestPokemon({ ability: 'Intimidate' });
			const ctx = createMockContextWithSides({
				target: attacker,
				move: { category: 'special' } as Partial<Move>
			});

			mummy.onDamagingHit!(ctx, 50);

			expect(attacker.currentAbility).toBe('Intimidate');
		});

		it('should NOT affect attacker without a target', () => {
			const ctx = createMockContextWithSides({
				move: { category: 'physical' } as Partial<Move>
			});

			// Should not throw
			expect(() => mummy.onDamagingHit!(ctx, 50)).not.toThrow();
		});

		it('should be suppressable by Mold Breaker family', () => {
			expect(mummy.suppressedBy).toContain('mold-breaker');
			expect(mummy.suppressedBy).toContain('teravolt');
			expect(mummy.suppressedBy).toContain('turboblaze');
		});
	});

	// =============================================================================
	// ABILITY COPIERS (Trace, Receiver, Power of Alchemy)
	// =============================================================================

	describe('Trace', () => {
		it('should have correct metadata', () => {
			expect(trace.id).toBe(36);
			expect(trace.name).toBe('Trace');
		});

		it('should copy opponent ability on switch-in', () => {
			const opponent = createTestPokemon({ ability: 'Levitate' });
			const pokemon = createTestPokemon({ ability: 'Trace' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				oppSide: [opponent]
			});

			trace.onSwitchIn!(ctx);

			expect(ctx.pokemon.currentAbility).toBe('Levitate');
		});

		it('should not copy if no opponents exist', () => {
			const pokemon = createTestPokemon({ ability: 'Trace' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				oppSide: []
			});

			trace.onSwitchIn!(ctx);

			// Ability should remain as Trace
			expect(ctx.pokemon.currentAbility).toBe('Trace');
		});

		it('should not copy uncopyable abilities', () => {
			const opponent = createTestPokemon({ ability: 'Trace' }); // Trace is uncopyable
			const pokemon = createTestPokemon({ ability: 'Trace' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				oppSide: [opponent]
			});

			trace.onSwitchIn!(ctx);

			// Should remain as Trace since opponent's Trace is uncopyable
			expect(ctx.pokemon.currentAbility).toBe('Trace');
		});
	});

	describe('Receiver', () => {
		it('should have correct metadata', () => {
			expect(receiver.id).toBe(222);
			expect(receiver.name).toBe('Receiver');
		});

		it('should have onFaint hook to copy fainted ally ability', () => {
			expect(receiver.onFaint).toBeDefined();
		});

		it('should copy fainted ally ability', () => {
			const faintedAlly = createTestPokemon({ ability: 'Intimidate', name: 'Fainted Ally' });
			faintedAlly.fainted = true;
			const pokemon = createTestPokemon({ ability: 'Receiver', name: 'Receiver Pokemon' });

			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				faintedAlly: faintedAlly
			});

			receiver.onFaint!(ctx);

			expect(ctx.pokemon.currentAbility).toBe('Intimidate');
		});
	});

	describe('Power of Alchemy', () => {
		it('should have correct metadata', () => {
			expect(powerOfAlchemy.id).toBe(223);
			expect(powerOfAlchemy.name).toBe('Power of Alchemy');
		});

		it('should have onFaint hook to copy fainted ally ability', () => {
			expect(powerOfAlchemy.onFaint).toBeDefined();
		});

		it('should copy fainted ally ability', () => {
			const faintedAlly = createTestPokemon({ ability: 'Sand Stream', name: 'Fainted Ally' });
			faintedAlly.fainted = true;
			const pokemon = createTestPokemon({
				ability: 'Power of Alchemy',
				name: 'Alchemy Pokemon'
			});

			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				faintedAlly: faintedAlly
			});

			powerOfAlchemy.onFaint!(ctx);

			expect(ctx.pokemon.currentAbility).toBe('Sand Stream');
		});
	});

	// =============================================================================
	// ABILITY BLOCKERS (Damp)
	// =============================================================================

	describe('Damp', () => {
		it('should have correct metadata', () => {
			expect(damp.id).toBe(6);
			expect(damp.name).toBe('Damp');
		});

		it('should have onTryHit hook', () => {
			expect(damp.onTryHit).toBeDefined();
		});

		it('should block Explosion move', () => {
			const ctx = createMockContextWithSides({
				move: { name: 'Explosion' } as Partial<Move>
			});

			const result = damp.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should block Self-Destruct move', () => {
			const ctx = createMockContextWithSides({
				move: { name: 'Self-Destruct' } as Partial<Move>
			});

			const result = damp.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should block Misty Explosion move', () => {
			const ctx = createMockContextWithSides({
				move: { name: 'Misty Explosion' } as Partial<Move>
			});

			const result = damp.onTryHit!(ctx);

			expect(result).toBe(false);
		});

		it('should NOT block normal moves', () => {
			const ctx = createMockContextWithSides({
				move: { name: 'Tackle' } as Partial<Move>
			});

			const result = damp.onTryHit!(ctx);

			expect(result).toBe(true);
		});

		it('should be suppressable by Mold Breaker family', () => {
			expect(damp.suppressedBy).toContain('mold-breaker');
			expect(damp.suppressedBy).toContain('teravolt');
			expect(damp.suppressedBy).toContain('turboblaze');
		});
	});

	// =============================================================================
	// ABILITY EXPORT
	// =============================================================================

	describe('Ability Export', () => {
		it('should export all tier 5 abilities as an array', () => {
			expect(Array.isArray(tier5SuppressionAbilities)).toBe(true);
			expect(tier5SuppressionAbilities.length).toBeGreaterThanOrEqual(9);
		});

		it('all abilities should have required properties', () => {
			tier5SuppressionAbilities.forEach((ability: Ability) => {
				expect(ability.id).toBeDefined();
				expect(typeof ability.id).toBe('number');
				expect(ability.name).toBeDefined();
				expect(typeof ability.name).toBe('string');
				expect(ability.description).toBeDefined();
			});
		});
	});
});
