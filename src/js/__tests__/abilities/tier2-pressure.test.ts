import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pressure } from '../../battle/abilities/tiers/tier2-on-switch';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';

describe('Pressure Ability', () => {
	let mockBattleContext: BattleContext;
	let pressurePokemon: PokemonInstance;
	let mockOpponent: PokemonInstance;

	beforeEach(() => {
		pressurePokemon = {
			name: 'Articuno',
			types: ['ice', 'flying'],
			fainted: false
		} as unknown as PokemonInstance;

		mockOpponent = {
			name: 'Pikachu',
			types: ['electric'],
			fainted: false
		} as unknown as PokemonInstance;

		mockBattleContext = {
			addToStack: vi.fn(),
			oppSide: [mockOpponent]
		} as unknown as BattleContext;
	});

	it('should have correct metadata', () => {
		expect(pressure.id).toBe(46);
		expect(pressure.name).toBe('Pressure');
		expect(pressure.description).toBe("Raises the opponent's PP usage.");
	});

	it('should display Pressure message on switch-in', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: pressurePokemon
		};

		const result = pressure.onSwitchIn?.(ctx);

		expect(result).toBe(true);
		expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
			expect.objectContaining({
				description: 'Articuno is exerting its Pressure!'
			})
		);
	});

	it('should return true to show popup', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: pressurePokemon
		};

		const result = pressure.onSwitchIn?.(ctx);

		expect(result).toBe(true);
	});

	it('should include pokemon name in message text', () => {
		const mewtwo = {
			name: 'Mewtwo',
			types: ['psychic'],
			fainted: false
		} as unknown as PokemonInstance;

		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: mewtwo
		};

		pressure.onSwitchIn?.(ctx);

		expect(mockBattleContext.addToStack).toHaveBeenCalledWith(
			expect.objectContaining({
				description: 'Mewtwo is exerting its Pressure!'
			})
		);
	});

	it('should call addToStack exactly once per switch-in', () => {
		const ctx: AbilityContext = {
			battleContext: mockBattleContext,
			pokemon: pressurePokemon
		};

		pressure.onSwitchIn?.(ctx);

		expect(mockBattleContext.addToStack).toHaveBeenCalledTimes(1);
	});
});
