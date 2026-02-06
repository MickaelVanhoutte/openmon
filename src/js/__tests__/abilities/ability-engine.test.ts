import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbilityEngine } from '../../battle/abilities/ability-engine';
import {
	AbilityTrigger,
	type Ability,
	type AbilityContext
} from '../../battle/abilities/ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import * as registry from '../../battle/abilities/ability-registry';

describe('AbilityEngine', () => {
	let engine: AbilityEngine;
	let mockBattleContext: BattleContext;
	let mockPokemon: PokemonInstance;
	let mockTarget: PokemonInstance;

	beforeEach(() => {
		engine = new AbilityEngine();

		mockBattleContext = {
			addToStack: vi.fn()
		} as unknown as BattleContext;

		mockPokemon = {
			currentAbility: 'Intimidate',
			name: 'Gyarados',
			battleStats: { speed: 100 }
		} as unknown as PokemonInstance;

		mockTarget = {
			currentAbility: 'Levitate',
			name: 'Gengar',
			battleStats: { speed: 80 }
		} as unknown as PokemonInstance;
	});

	describe('runEvent', () => {
		it('should return undefined if pokemon has no ability', () => {
			const pokemonNoAbility = {
				currentAbility: '',
				name: 'Magikarp',
				battleStats: { speed: 50 }
			} as unknown as PokemonInstance;

			const result = engine.runEvent(
				AbilityTrigger.ON_SWITCH_IN,
				pokemonNoAbility,
				mockBattleContext
			);

			expect(result).toBeUndefined();
		});

		it('should return undefined if ability is not found in registry', () => {
			const pokemonUnknown = {
				currentAbility: 'Unknown Ability',
				name: 'Test',
				battleStats: { speed: 50 }
			} as unknown as PokemonInstance;

			vi.spyOn(console, 'warn').mockImplementation(() => {});

			const result = engine.runEvent(
				AbilityTrigger.ON_SWITCH_IN,
				pokemonUnknown,
				mockBattleContext
			);

			expect(result).toBeUndefined();
		});

		it('should return undefined if ability has no hook for the trigger', () => {
			const mockAbility: Ability = {
				id: 1,
				name: 'Test Ability',
				description: 'No hooks'
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			const result = engine.runEvent(AbilityTrigger.ON_SWITCH_IN, mockPokemon, mockBattleContext);

			expect(result).toBeUndefined();
		});

		it('should call the hook and return its result', () => {
			const mockAbility: Ability = {
				id: 22,
				name: 'Intimidate',
				description: 'Lowers opponent Attack',
				onSwitchIn: vi.fn()
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			engine.runEvent(AbilityTrigger.ON_SWITCH_IN, mockPokemon, mockBattleContext, mockTarget);

			expect(mockAbility.onSwitchIn).toHaveBeenCalled();
		});

		it('should call onModifyAtk hook with value and return modified value', () => {
			const mockAbility: Ability = {
				id: 37,
				name: 'Huge Power',
				description: 'Doubles Attack',
				onModifyAtk: vi.fn((_ctx: AbilityContext, attack: number) => attack * 2)
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			const result = engine.runEvent<number>(
				AbilityTrigger.ON_DAMAGE_CALC,
				mockPokemon,
				mockBattleContext,
				mockTarget,
				100
			);

			expect(mockAbility.onModifyAtk).toHaveBeenCalled();
			expect(result).toBe(200);
		});

		it('should push ability message to action stack', () => {
			const mockAbility: Ability = {
				id: 22,
				name: 'Intimidate',
				description: 'Lowers opponent Attack',
				onSwitchIn: vi.fn()
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			engine.runEvent(AbilityTrigger.ON_SWITCH_IN, mockPokemon, mockBattleContext);

			expect(mockBattleContext.addToStack).toHaveBeenCalled();
		});
	});

	describe('suppression logic', () => {
		it('should suppress ability when attacker has Mold Breaker', () => {
			const attackerWithMoldBreaker = {
				currentAbility: 'Mold Breaker',
				name: 'Excadrill',
				battleStats: { speed: 110 }
			} as unknown as PokemonInstance;

			const defenderWithLevitate: Ability = {
				id: 26,
				name: 'Levitate',
				description: 'Immune to Ground',
				onTryHit: vi.fn(() => false)
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(defenderWithLevitate);

			const result = engine.runEvent(
				AbilityTrigger.ON_DAMAGE_CALC,
				mockTarget,
				mockBattleContext,
				attackerWithMoldBreaker
			);

			expect(defenderWithLevitate.onTryHit).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('should suppress ability when attacker has Teravolt', () => {
			const attackerWithTeravolt = {
				currentAbility: 'Teravolt',
				name: 'Zekrom',
				battleStats: { speed: 90 }
			} as unknown as PokemonInstance;

			const defenderAbility: Ability = {
				id: 5,
				name: 'Sturdy',
				description: 'Survives with 1 HP',
				onDamagingHit: vi.fn()
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(defenderAbility);

			const result = engine.runEvent(
				AbilityTrigger.ON_DAMAGE_CALC,
				mockTarget,
				mockBattleContext,
				attackerWithTeravolt
			);

			expect(defenderAbility.onDamagingHit).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('should suppress ability when attacker has Turboblaze', () => {
			const attackerWithTurboblaze = {
				currentAbility: 'Turboblaze',
				name: 'Reshiram',
				battleStats: { speed: 90 }
			} as unknown as PokemonInstance;

			const defenderAbility: Ability = {
				id: 18,
				name: 'Flash Fire',
				description: 'Immune to Fire',
				onTryHit: vi.fn(() => false)
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(defenderAbility);

			const result = engine.runEvent(
				AbilityTrigger.ON_DAMAGE_CALC,
				mockTarget,
				mockBattleContext,
				attackerWithTurboblaze
			);

			expect(defenderAbility.onTryHit).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('should not suppress abilities for non-suppressing attackers', () => {
			const normalAttacker = {
				currentAbility: 'Intimidate',
				name: 'Gyarados',
				battleStats: { speed: 100 }
			} as unknown as PokemonInstance;

			const defenderAbility: Ability = {
				id: 26,
				name: 'Levitate',
				description: 'Immune to Ground',
				onModifyAtk: vi.fn((_ctx: AbilityContext, atk: number) => atk)
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(defenderAbility);

			engine.runEvent(AbilityTrigger.ON_DAMAGE_CALC, mockTarget, mockBattleContext, normalAttacker);

			expect(defenderAbility.onModifyAtk).toHaveBeenCalled();
		});
	});

	describe('speed-based ordering', () => {
		it('should return pokemon sorted by speed (fastest first)', () => {
			const slowPokemon = {
				currentAbility: 'Intimidate',
				name: 'Slowbro',
				battleStats: { speed: 30 }
			} as unknown as PokemonInstance;

			const fastPokemon = {
				currentAbility: 'Intimidate',
				name: 'Jolteon',
				battleStats: { speed: 130 }
			} as unknown as PokemonInstance;

			const mediumPokemon = {
				currentAbility: 'Intimidate',
				name: 'Pikachu',
				battleStats: { speed: 90 }
			} as unknown as PokemonInstance;

			const pokemon = [slowPokemon, fastPokemon, mediumPokemon];
			const sorted = engine.sortBySpeed(pokemon);

			expect(sorted[0]).toBe(fastPokemon);
			expect(sorted[1]).toBe(mediumPokemon);
			expect(sorted[2]).toBe(slowPokemon);
		});

		it('should handle equal speeds (maintains order)', () => {
			const pokemon1 = {
				currentAbility: 'Intimidate',
				name: 'Pokemon1',
				battleStats: { speed: 100 }
			} as unknown as PokemonInstance;

			const pokemon2 = {
				currentAbility: 'Intimidate',
				name: 'Pokemon2',
				battleStats: { speed: 100 }
			} as unknown as PokemonInstance;

			const pokemon = [pokemon1, pokemon2];
			const sorted = engine.sortBySpeed(pokemon);

			expect(sorted).toHaveLength(2);
			expect(sorted[0]).toBe(pokemon1);
			expect(sorted[1]).toBe(pokemon2);
		});
	});

	describe('trigger to hook mapping', () => {
		it('should map ON_SWITCH_IN to onSwitchIn', () => {
			const mockAbility: Ability = {
				id: 1,
				name: 'Test',
				description: 'Test',
				onSwitchIn: vi.fn()
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			engine.runEvent(AbilityTrigger.ON_SWITCH_IN, mockPokemon, mockBattleContext);

			expect(mockAbility.onSwitchIn).toHaveBeenCalled();
		});

		it('should map ON_TURN_END to onTurnEnd', () => {
			const mockAbility: Ability = {
				id: 1,
				name: 'Test',
				description: 'Test',
				onTurnEnd: vi.fn()
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			engine.runEvent(AbilityTrigger.ON_TURN_END, mockPokemon, mockBattleContext);

			expect(mockAbility.onTurnEnd).toHaveBeenCalled();
		});

		it('should map ON_BEFORE_MOVE to onBeforeMove', () => {
			const mockAbility: Ability = {
				id: 1,
				name: 'Test',
				description: 'Test',
				onBeforeMove: vi.fn(() => true)
			};

			vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

			engine.runEvent(AbilityTrigger.ON_BEFORE_MOVE, mockPokemon, mockBattleContext);

			expect(mockAbility.onBeforeMove).toHaveBeenCalled();
		});
	});
});
