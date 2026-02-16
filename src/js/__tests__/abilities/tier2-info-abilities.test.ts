import { describe, it, expect, vi, beforeEach } from 'vitest';
import { frisk, anticipation, forewarn } from '../../battle/abilities/tiers/tier2-on-switch';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import type { HeldItemData } from '$js/items/held-items-model';

describe('Information-Reveal Abilities', () => {
	let mockBattleContext: BattleContext;
	let mockPokemon: PokemonInstance;
	let mockOpponent: PokemonInstance;

	beforeEach(() => {
		mockPokemon = {
			name: 'Banette',
			types: ['ghost'],
			fainted: false
		} as unknown as PokemonInstance;

		mockOpponent = {
			name: 'Pikachu',
			types: ['electric'],
			fainted: false,
			moves: []
		} as unknown as PokemonInstance;

		mockBattleContext = {
			addToStack: vi.fn(),
			oppSide: [mockOpponent],
			calculateTypeEffectiveness: vi.fn()
		} as unknown as BattleContext;
	});

	describe('Frisk', () => {
		it('should reveal opponent held item when present', () => {
			const lightBall: HeldItemData = {
				id: 1,
				name: 'Light Ball',
				description: 'Doubles Attack and Sp. Atk for Pikachu',
				power: 0,
				consumable: false
			};
			mockOpponent.heldItem = lightBall;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = frisk.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: 'Banette frisked Pikachu and found its Light Ball!'
				})
			);
		});

		it('should return undefined when opponent has no held item', () => {
			mockOpponent.heldItem = undefined;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = frisk.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});

		it('should skip fainted opponents', () => {
			const faintedOpponent = {
				name: 'Raichu',
				fainted: true,
				heldItem: { id: 1, name: 'Leftovers', description: 'Heals HP', power: 0, consumable: false }
			} as unknown as PokemonInstance;

			mockBattleContext.oppSide = [faintedOpponent];

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = frisk.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});
	});

	describe('Anticipation', () => {
		it('should shudder when opponent has super-effective move', () => {
			mockOpponent.moves = [
				{
					name: 'Thunderbolt',
					type: 'electric',
					power: 90
				}
			] as any;

			(mockBattleContext.calculateTypeEffectiveness as any).mockReturnValue(2);

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = anticipation.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: 'Banette shuddered!'
				})
			);
		});

		it('should shudder when opponent has OHKO move', () => {
			mockOpponent.moves = [
				{
					name: 'Guillotine',
					type: 'normal',
					power: 0
				}
			] as any;

			(mockBattleContext.calculateTypeEffectiveness as any).mockReturnValue(1);

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = anticipation.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: 'Banette shuddered!'
				})
			);
		});

		it('should return undefined when no dangerous moves present', () => {
			mockOpponent.moves = [
				{
					name: 'Tackle',
					type: 'normal',
					power: 40
				}
			] as any;

			(mockBattleContext.calculateTypeEffectiveness as any).mockReturnValue(1);

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = anticipation.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});

		it('should detect all OHKO moves', () => {
			const ohkoMoves = ['Guillotine', 'Horn-Drill', 'Fissure', 'Sheer-Cold'];

			for (const moveName of ohkoMoves) {
				vi.clearAllMocks();

				mockOpponent.moves = [
					{
						name: moveName,
						type: 'normal',
						power: 0
					}
				] as any;

				(mockBattleContext.calculateTypeEffectiveness as any).mockReturnValue(1);

				const ctx: AbilityContext = {
					battleContext: mockBattleContext,
					pokemon: mockPokemon
				};

				const result = anticipation.onSwitchIn?.(ctx);

				expect(result).toBe(true);
			}
		});
	});

	describe('Frisk - edge cases', () => {
		it('should return undefined when oppSide is empty', () => {
			mockBattleContext.oppSide = [];

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = frisk.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});
	});

	describe('Anticipation - edge cases', () => {
		it('should return undefined when oppSide is empty', () => {
			mockBattleContext.oppSide = [];

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = anticipation.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});
	});

	describe('Forewarn', () => {
		it('should reveal opponent strongest move', () => {
			mockOpponent.moves = [
				{
					name: 'Tackle',
					type: 'normal',
					power: 40
				},
				{
					name: 'Hyper Beam',
					type: 'normal',
					power: 150
				},
				{
					name: 'Quick Attack',
					type: 'normal',
					power: 40
				}
			] as any;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = forewarn.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "Banette's Forewarn alerted it to Hyper Beam!"
				})
			);
		});

		it('should return undefined when opponent has no damaging moves', () => {
			mockOpponent.moves = [
				{
					name: 'Growl',
					type: 'normal',
					power: 0
				},
				{
					name: 'Tail Whip',
					type: 'normal',
					power: 0
				}
			] as any;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = forewarn.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});

		it('should check all opponents for strongest move', () => {
			const opponent2 = {
				name: 'Charizard',
				fainted: false,
				moves: [
					{
						name: 'Fire Blast',
						type: 'fire',
						power: 110
					}
				]
			} as unknown as PokemonInstance;

			mockOpponent.moves = [
				{
					name: 'Tackle',
					type: 'normal',
					power: 40
				}
			] as any;

			mockBattleContext.oppSide = [mockOpponent, opponent2];

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = forewarn.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "Banette's Forewarn alerted it to Fire Blast!"
				})
			);
		});

		it('should return undefined when opponent has empty moves array', () => {
			mockOpponent.moves = [] as any;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = forewarn.onSwitchIn?.(ctx);

			expect(result).toBeUndefined();
			expect(mockBattleContext.addToStack).not.toHaveBeenCalled();
		});
	});
});
