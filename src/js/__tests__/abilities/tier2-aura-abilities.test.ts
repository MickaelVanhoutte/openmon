import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fairyAura, darkAura, auraBreak } from '../../battle/abilities/tiers/tier2-on-switch';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import type { PokemonInstance, Move } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';

describe('Aura Abilities', () => {
	let mockBattleContext: BattleContext;
	let mockPokemon: PokemonInstance;
	let mockOpponent: PokemonInstance;
	let mockMove: Move;

	beforeEach(() => {
		mockPokemon = {
			name: 'Xerneas',
			types: ['fairy'],
			fainted: false,
			currentAbility: 'Fairy Aura'
		} as unknown as PokemonInstance;

		mockOpponent = {
			name: 'Yveltal',
			types: ['dark', 'flying'],
			fainted: false,
			currentAbility: 'Dark Aura'
		} as unknown as PokemonInstance;

		mockMove = {
			name: 'Moonblast',
			type: 'fairy',
			power: 95
		} as unknown as Move;

		mockBattleContext = {
			addToStack: vi.fn(),
			playerSide: [mockPokemon],
			oppSide: [mockOpponent]
		} as unknown as BattleContext;
	});

	describe('Fairy Aura', () => {
		it('should display message on switch-in', () => {
			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon
			};

			const result = fairyAura.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "Xerneas's Fairy Aura is radiating!"
				})
			);
		});

		it('should boost Fairy-type moves by 1.33x without Aura Break', () => {
			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon,
				move: mockMove
			};

			const result = fairyAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(133);
		});

		it('should reduce Fairy-type moves to 0.75x with Aura Break present', () => {
			const auraBreaker = {
				name: 'Zygarde',
				fainted: false,
				currentAbility: 'Aura Break'
			} as unknown as PokemonInstance;

			mockBattleContext.oppSide = [mockOpponent, auraBreaker];

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon,
				move: mockMove
			};

			const result = fairyAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(75);
		});

		it('should not modify damage for non-Fairy moves', () => {
			const darkMove = {
				name: 'Dark Pulse',
				type: 'dark',
				power: 80
			} as unknown as Move;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon,
				move: darkMove
			};

			const result = fairyAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(100);
		});
	});

	describe('Dark Aura', () => {
		it('should display message on switch-in', () => {
			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockOpponent
			};

			const result = darkAura.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "Yveltal's Dark Aura is radiating!"
				})
			);
		});

		it('should boost Dark-type moves by 1.33x without Aura Break', () => {
			const darkMove = {
				name: 'Dark Pulse',
				type: 'dark',
				power: 80
			} as unknown as Move;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockOpponent,
				move: darkMove
			};

			const result = darkAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(133);
		});

		it('should reduce Dark-type moves to 0.75x with Aura Break present', () => {
			const auraBreaker = {
				name: 'Zygarde',
				fainted: false,
				currentAbility: 'Aura Break'
			} as unknown as PokemonInstance;

			mockBattleContext.playerSide = [mockPokemon, auraBreaker];

			const darkMove = {
				name: 'Dark Pulse',
				type: 'dark',
				power: 80
			} as unknown as Move;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockOpponent,
				move: darkMove
			};

			const result = darkAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(75);
		});

		it('should not modify damage for non-Dark moves', () => {
			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockOpponent,
				move: mockMove
			};

			const result = darkAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(100);
		});
	});

	describe('Aura Break', () => {
		it('should display message on switch-in', () => {
			const auraBreaker = {
				name: 'Zygarde',
				fainted: false,
				currentAbility: 'Aura Break'
			} as unknown as PokemonInstance;

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: auraBreaker
			};

			const result = auraBreak.onSwitchIn?.(ctx);

			expect(result).toBe(true);
			expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
				expect.objectContaining({
					description: 'Zygarde broke the mold with Aura Break!'
				})
			);
		});

		it('should have correct metadata', () => {
			expect(auraBreak.id).toBe(188);
			expect(auraBreak.name).toBe('Aura Break');
			expect(auraBreak.description).toBe('Reverses the effects of Fairy Aura and Dark Aura.');
		});

		it('should not have onModifyDamage hook (reversal is handled by aura abilities)', () => {
			expect(auraBreak.onModifyDamage).toBeUndefined();
		});
	});

	describe('Aura interaction edge cases', () => {
		it('Fairy Aura should still boost 1.33x when Aura Break user is fainted', () => {
			const faintedBreaker = {
				name: 'Zygarde',
				fainted: true,
				currentAbility: 'Aura Break'
			} as unknown as PokemonInstance;

			mockBattleContext.oppSide = [mockOpponent, faintedBreaker];

			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon,
				move: mockMove
			};

			const result = fairyAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(133);
		});

		it('Dark Aura should return damage unchanged when move is undefined', () => {
			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockOpponent,
				move: undefined
			};

			const result = darkAura.onModifyDamage?.(ctx, 100);

			expect(result).toBe(100);
		});

		it('Fairy Aura should floor large damage values correctly', () => {
			const ctx: AbilityContext = {
				battleContext: mockBattleContext,
				pokemon: mockPokemon,
				move: mockMove
			};

			const result = fairyAura.onModifyDamage?.(ctx, 77);

			expect(result).toBe(Math.floor(77 * 1.33));
			expect(result).toBe(102);
		});
	});
});
