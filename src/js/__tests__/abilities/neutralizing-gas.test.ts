import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbilityEngine } from '../../battle/abilities/ability-engine';
import {
	AbilityTrigger,
	type Ability,
	type AbilityContext
} from '../../battle/abilities/ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import { BattleField } from '../../battle/battle-field';
import * as registry from '../../battle/abilities/ability-registry';

describe('Neutralizing Gas', () => {
	let engine: AbilityEngine;
	let battleField: BattleField;
	let mockBattleContext: BattleContext;
	let mockPokemon: PokemonInstance;
	let mockTarget: PokemonInstance;

	beforeEach(() => {
		engine = new AbilityEngine();
		battleField = new BattleField();

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

		mockBattleContext = {
			battleField,
			addToStack: vi.fn(),
			getPokemonSide: vi.fn().mockReturnValue('ally'),
			playerSide: [mockPokemon],
			oppSide: [mockTarget]
		} as unknown as BattleContext;
	});

	it('should have neutralizingGasActive default to false on BattleField', () => {
		const field = new BattleField();
		expect(field.neutralizingGasActive).toBe(false);
	});

	it('should suppress other abilities when neutralizingGasActive is true', () => {
		battleField.neutralizingGasActive = true;

		const mockAbility: Ability = {
			id: 22,
			name: 'Intimidate',
			description: 'Lowers opponent Attack',
			onSwitchIn: vi.fn(() => true)
		};

		vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

		const result = engine.runEvent(AbilityTrigger.ON_SWITCH_IN, mockPokemon, mockBattleContext);

		expect(mockAbility.onSwitchIn).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
	});

	it('should NOT suppress itself (Neutralizing Gas still fires its own hooks)', () => {
		battleField.neutralizingGasActive = true;

		const ngPokemon = {
			currentAbility: 'Neutralizing Gas',
			name: 'Weezing',
			battleStats: { speed: 60 }
		} as unknown as PokemonInstance;

		const ngAbility: Ability = {
			id: 256,
			name: 'Neutralizing Gas',
			description: 'All other Abilities are suppressed.',
			onSwitchIn: vi.fn(() => true)
		};

		vi.spyOn(registry, 'getAbility').mockReturnValue(ngAbility);

		const result = engine.runEvent(AbilityTrigger.ON_SWITCH_IN, ngPokemon, mockBattleContext);

		expect(ngAbility.onSwitchIn).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should re-enable abilities after neutralizingGasActive is cleared (switch-out)', () => {
		battleField.neutralizingGasActive = true;

		const mockAbility: Ability = {
			id: 22,
			name: 'Intimidate',
			description: 'Lowers opponent Attack',
			onSwitchIn: vi.fn(() => true)
		};

		vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

		const suppressedResult = engine.runEvent(
			AbilityTrigger.ON_SWITCH_IN,
			mockPokemon,
			mockBattleContext
		);
		expect(suppressedResult).toBeUndefined();
		expect(mockAbility.onSwitchIn).not.toHaveBeenCalled();

		battleField.neutralizingGasActive = false;

		const enabledResult = engine.runEvent(
			AbilityTrigger.ON_SWITCH_IN,
			mockPokemon,
			mockBattleContext
		);
		expect(enabledResult).toBe(true);
		expect(mockAbility.onSwitchIn).toHaveBeenCalledTimes(1);
	});

	it('should suppress modifier hooks too when neutralizingGasActive is true', () => {
		battleField.neutralizingGasActive = true;

		const mockAbility: Ability = {
			id: 37,
			name: 'Huge Power',
			description: 'Doubles Attack',
			onModifyAtk: vi.fn((_ctx: AbilityContext, attack: number) => attack * 2)
		};

		vi.spyOn(registry, 'getAbility').mockReturnValue(mockAbility);

		const result = engine.runEvent<number>(
			AbilityTrigger.ON_MODIFY_ATK,
			mockPokemon,
			mockBattleContext,
			mockTarget,
			100
		);

		expect(mockAbility.onModifyAtk).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
	});
});
