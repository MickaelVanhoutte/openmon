import { describe, it, expect, vi } from 'vitest';
import type { AbilityContext, Ability } from '../../battle/abilities/ability-types';
import type { BattleContext } from '../../context/battleContext';
import type { PokemonInstance, Move } from '../../pokemons/pokedex';
import { BattleField } from '../../battle/battle-field';
import { createTestPokemon } from './test-helpers';
import {
	contrary,
	simple,
	unaware,
	regenerator,
	naturalCure,
	parentalBond,
	skillLink,
	disguise,
	stanceChange,
	zenMode,
	battleBond,
	tier6ComplexAbilities
} from '../../battle/abilities/tiers/tier6-complex';

function createMockContext(
	overrides: {
		pokemon?: Partial<PokemonInstance>;
		target?: PokemonInstance;
		move?: Partial<Move>;
		oppSide?: PokemonInstance[];
		playerSide?: PokemonInstance[];
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
		status: undefined,
		changeBattleStats: vi.fn(),
		...overrides.pokemon
	} as unknown as PokemonInstance;

	const battleField = new BattleField();

	const mockBattleContext = {
		battleField,
		playerSide: overrides.playerSide || [mockPokemon],
		oppSide: overrides.oppSide || [],
		addToStack: vi.fn()
	} as unknown as BattleContext;

	return {
		battleContext: mockBattleContext,
		pokemon: mockPokemon,
		target: overrides.target,
		move: overrides.move as Move
	};
}

describe('Tier 6 Complex Abilities', () => {
	// =============================================================================
	// STAT CHANGE MODIFIERS (Contrary, Simple, Unaware)
	// =============================================================================

	describe('Contrary', () => {
		it('should have correct metadata', () => {
			expect(contrary.id).toBe(126);
			expect(contrary.name).toBe('Contrary');
		});

		it('should have onStatChange hook', () => {
			expect(contrary.onStatChange).toBeDefined();
		});

		it('should invert positive stat changes to negative', () => {
			const ctx = createMockContext();

			const result = contrary.onStatChange!(ctx, 'attack', 2);

			expect(result).toBe(-2);
		});

		it('should invert negative stat changes to positive', () => {
			const ctx = createMockContext();

			const result = contrary.onStatChange!(ctx, 'defense', -1);

			expect(result).toBe(1);
		});

		it('should not change zero', () => {
			const ctx = createMockContext();

			const result = contrary.onStatChange!(ctx, 'speed', 0);

			expect(result).toEqual(0);
		});
	});

	describe('Simple', () => {
		it('should have correct metadata', () => {
			expect(simple.id).toBe(86);
			expect(simple.name).toBe('Simple');
		});

		it('should have onStatChange hook', () => {
			expect(simple.onStatChange).toBeDefined();
		});

		it('should double positive stat changes', () => {
			const ctx = createMockContext();

			const result = simple.onStatChange!(ctx, 'attack', 1);

			expect(result).toBe(2);
		});

		it('should double negative stat changes', () => {
			const ctx = createMockContext();

			const result = simple.onStatChange!(ctx, 'defense', -1);

			expect(result).toBe(-2);
		});

		it('should cap at +6 stages', () => {
			const ctx = createMockContext();

			const result = simple.onStatChange!(ctx, 'attack', 4);

			expect(result).toBe(6); // 4 * 2 = 8, but capped at 6
		});

		it('should cap at -6 stages', () => {
			const ctx = createMockContext();

			const result = simple.onStatChange!(ctx, 'defense', -4);

			expect(result).toBe(-6); // -4 * 2 = -8, but capped at -6
		});
	});

	describe('Unaware', () => {
		it('should have correct metadata', () => {
			expect(unaware.id).toBe(109);
			expect(unaware.name).toBe('Unaware');
		});

		it('should have description about ignoring stat changes', () => {
			expect(unaware.description.toLowerCase()).toContain('ignore');
		});
	});

	// =============================================================================
	// EXIT ABILITIES (Regenerator, Natural Cure)
	// =============================================================================

	describe('Regenerator', () => {
		it('should have correct metadata', () => {
			expect(regenerator.id).toBe(144);
			expect(regenerator.name).toBe('Regenerator');
		});

		it('should have onSwitchOut hook', () => {
			expect(regenerator.onSwitchOut).toBeDefined();
		});

		it('should heal 1/3 HP on switch-out', () => {
			const pokemon = createTestPokemon({ hp: 50, maxHp: 300 });
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			regenerator.onSwitchOut!(ctx);

			// 300 / 3 = 100, so 50 + 100 = 150
			expect(ctx.pokemon.currentHp).toBe(150);
		});

		it('should not overheal beyond max HP', () => {
			const pokemon = createTestPokemon({ hp: 250, maxHp: 300 });
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			regenerator.onSwitchOut!(ctx);

			// 300 / 3 = 100, 250 + 100 = 350, capped at 300
			expect(ctx.pokemon.currentHp).toBe(300);
		});

		it('should heal correctly when already at full HP', () => {
			const pokemon = createTestPokemon({ hp: 300, maxHp: 300 });
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			regenerator.onSwitchOut!(ctx);

			expect(ctx.pokemon.currentHp).toBe(300);
		});
	});

	describe('Natural Cure', () => {
		it('should have correct metadata', () => {
			expect(naturalCure.id).toBe(30);
			expect(naturalCure.name).toBe('Natural Cure');
		});

		it('should have onSwitchOut hook', () => {
			expect(naturalCure.onSwitchOut).toBeDefined();
		});

		it('should cure status on switch-out', () => {
			const pokemon = createTestPokemon();
			(pokemon as any).status = { abr: 'PSN' };
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			naturalCure.onSwitchOut!(ctx);

			expect(ctx.pokemon.status).toBeUndefined();
		});

		it('should do nothing if no status', () => {
			const pokemon = createTestPokemon();
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			// Should not throw
			expect(() => naturalCure.onSwitchOut!(ctx)).not.toThrow();
			expect(ctx.pokemon.status).toBeUndefined();
		});
	});

	// =============================================================================
	// MULTI-HIT ABILITIES (Parental Bond, Skill Link)
	// =============================================================================

	describe('Parental Bond', () => {
		it('should have correct metadata', () => {
			expect(parentalBond.id).toBe(185);
			expect(parentalBond.name).toBe('Parental Bond');
		});

		it('should have description about hitting twice', () => {
			expect(parentalBond.description).toContain('twice');
		});
	});

	describe('Skill Link', () => {
		it('should have correct metadata', () => {
			expect(skillLink.id).toBe(92);
			expect(skillLink.name).toBe('Skill Link');
		});

		it('should have description about max hits', () => {
			expect(skillLink.description).toContain('5');
		});
	});

	// =============================================================================
	// FORM CHANGE ABILITIES (Disguise, Stance Change, Zen Mode, Battle Bond)
	// =============================================================================

	describe('Disguise', () => {
		it('should have correct metadata', () => {
			expect(disguise.id).toBe(209);
			expect(disguise.name).toBe('Disguise');
		});

		it('should have onDamagingHit hook', () => {
			expect(disguise.onDamagingHit).toBeDefined();
		});

		it('should block damage when disguise is intact', () => {
			const pokemon = createTestPokemon({ hp: 100, maxHp: 100 });
			(pokemon as any).disguiseBroken = false;
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			disguise.onDamagingHit!(ctx, 50);

			expect((ctx.pokemon as any).disguiseBroken).toBe(true);
		});

		it('should NOT block damage when disguise is already broken', () => {
			const pokemon = createTestPokemon({ hp: 100, maxHp: 100 });
			(pokemon as any).disguiseBroken = true;
			const ctx = createMockContext({ pokemon: pokemon as Partial<PokemonInstance> });

			disguise.onDamagingHit!(ctx, 50);

			expect((ctx.pokemon as any).disguiseBroken).toBe(true);
		});
	});

	describe('Stance Change (stub)', () => {
		it('should have correct metadata', () => {
			expect(stanceChange.id).toBe(176);
			expect(stanceChange.name).toBe('Stance Change');
		});

		it('should have description', () => {
			expect(stanceChange.description).toBeDefined();
		});
	});

	describe('Zen Mode (stub)', () => {
		it('should have correct metadata', () => {
			expect(zenMode.id).toBe(161);
			expect(zenMode.name).toBe('Zen Mode');
		});

		it('should have description', () => {
			expect(zenMode.description).toBeDefined();
		});
	});

	describe('Battle Bond (stub)', () => {
		it('should have correct metadata', () => {
			expect(battleBond.id).toBe(210);
			expect(battleBond.name).toBe('Battle Bond');
		});

		it('should have description', () => {
			expect(battleBond.description).toBeDefined();
		});
	});

	// =============================================================================
	// ABILITY EXPORT
	// =============================================================================

	describe('Ability Export', () => {
		it('should export all tier 6 abilities as an array', () => {
			expect(Array.isArray(tier6ComplexAbilities)).toBe(true);
			expect(tier6ComplexAbilities.length).toBeGreaterThanOrEqual(10);
		});

		it('all abilities should have required properties', () => {
			tier6ComplexAbilities.forEach((ability: Ability) => {
				expect(ability.id).toBeDefined();
				expect(typeof ability.id).toBe('number');
				expect(ability.name).toBeDefined();
				expect(typeof ability.name).toBe('string');
				expect(ability.description).toBeDefined();
			});
		});
	});
});
