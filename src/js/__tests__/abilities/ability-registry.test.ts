import { describe, it, expect, vi } from 'vitest';
import { getAbility, hasAbility } from '../../battle/abilities/ability-registry';
import type { PokemonInstance } from '../../pokemons/pokedex';

describe('Ability Registry', () => {
	it('should retrieve an ability by name (case-insensitive)', () => {
		const intimidate = getAbility('Intimidate');
		expect(intimidate).toBeDefined();
		expect(intimidate?.name).toBe('Intimidate');
		expect(intimidate?.id).toBe(22);

		const intimidateLower = getAbility('intimidate');
		expect(intimidateLower).toEqual(intimidate);
	});

	it('should retrieve an ability with spaces using kebab-case normalization', () => {
		const hugePower = getAbility('Huge Power');
		expect(hugePower).toBeDefined();
		expect(hugePower?.name).toBe('Huge Power');
		expect(hugePower?.id).toBe(37);

		const hugePowerKebab = getAbility('huge-power');
		expect(hugePowerKebab).toEqual(hugePower);
	});

	it('should return undefined and log warning for unknown abilities', () => {
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const unknown = getAbility('Non-Existent Ability');

		expect(unknown).toBeUndefined();
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('Unknown ability: Non-Existent Ability')
		);

		consoleSpy.mockRestore();
	});

	it('should handle empty or null inputs gracefully', () => {
		expect(getAbility('')).toBeUndefined();
		// @ts-expect-error - testing runtime safety
		expect(getAbility(null)).toBeUndefined();
		// @ts-expect-error - testing runtime safety
		expect(getAbility(undefined)).toBeUndefined();
	});

	describe('hasAbility', () => {
		it('should return true if pokemon has the specified ability', () => {
			const mockPokemon = {
				currentAbility: 'Intimidate'
			} as unknown as PokemonInstance;

			expect(hasAbility(mockPokemon, 'Intimidate')).toBe(true);
			expect(hasAbility(mockPokemon, 'intimidate')).toBe(true);
			expect(hasAbility(mockPokemon, 'INTIMIDATE')).toBe(true);
		});

		it('should return false if pokemon does not have the specified ability', () => {
			const mockPokemon = {
				currentAbility: 'Levitate'
			} as unknown as PokemonInstance;

			expect(hasAbility(mockPokemon, 'Intimidate')).toBe(false);
		});

		it('should handle kebab-case normalization in hasAbility', () => {
			const mockPokemon = {
				currentAbility: 'Huge Power'
			} as unknown as PokemonInstance;

			expect(hasAbility(mockPokemon, 'huge-power')).toBe(true);
			expect(hasAbility(mockPokemon, 'Huge Power')).toBe(true);
		});

		it('should return false if pokemon has no ability', () => {
			const mockPokemon = {
				currentAbility: ''
			} as unknown as PokemonInstance;

			expect(hasAbility(mockPokemon, 'Intimidate')).toBe(false);
		});
	});
});
