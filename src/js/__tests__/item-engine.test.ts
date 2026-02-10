import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ItemEngine, type ItemContext } from '../battle/items/item-engine';
import { registerItem, clearItemRegistry } from '../battle/items/item-registry';
import { HeldItemTrigger, type HeldItemEffect } from '../items/held-items-model';
import type { PokemonInstance } from '../pokemons/pokedex';

function createMockPokemon(itemName?: string, consumable = false): PokemonInstance {
	const pokemon = {
		heldItem: itemName
			? { id: 1, name: itemName, description: '', power: 0, consumable }
			: undefined,
		consumeHeldItem() {
			this.heldItem = undefined;
		}
	};
	return pokemon as unknown as PokemonInstance;
}

describe('ItemEngine', () => {
	let engine: ItemEngine;

	beforeEach(() => {
		clearItemRegistry();
		engine = new ItemEngine();
	});

	describe('runItemEvent', () => {
		it('should return undefined when pokemon has no held item', () => {
			const pokemon = createMockPokemon();
			const ctx: ItemContext = { pokemon };

			const result = engine.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, ctx);

			expect(result).toBeUndefined();
		});

		it('should return undefined when no effect registered for item', () => {
			const pokemon = createMockPokemon('Choice Band');
			const ctx: ItemContext = { pokemon };

			const result = engine.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, ctx);

			expect(result).toBeUndefined();
		});

		it('should return undefined when effect has no handler for trigger', () => {
			const effect: HeldItemEffect = { name: 'Choice Band' };
			registerItem('Choice Band', effect);

			const pokemon = createMockPokemon('Choice Band');
			const ctx: ItemContext = { pokemon };

			const result = engine.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, ctx);

			expect(result).toBeUndefined();
		});

		it('should dispatch to correct handler for trigger', () => {
			const onSwitchIn = vi.fn();
			const effect: HeldItemEffect = {
				name: 'Leftovers',
				onSwitchIn
			};
			registerItem('Leftovers', effect);

			const pokemon = createMockPokemon('Leftovers');
			const ctx: ItemContext = { pokemon };

			engine.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, ctx);

			expect(onSwitchIn).toHaveBeenCalledOnce();
			expect(onSwitchIn).toHaveBeenCalledWith(ctx);
		});

		it('should return stat modifier value from handler', () => {
			const effect: HeldItemEffect = {
				name: 'Choice Band',
				onModifyAtk: (_ctx: ItemContext) => 150
			};
			registerItem('Choice Band', effect);

			const pokemon = createMockPokemon('Choice Band');
			const ctx: ItemContext = { pokemon };

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_ATK, ctx);

			expect(result).toBe(150);
		});

		it('should handle all stat modifier triggers', () => {
			const statTriggers: Array<{ trigger: HeldItemTrigger; hookName: keyof HeldItemEffect }> = [
				{ trigger: HeldItemTrigger.ON_MODIFY_ATK, hookName: 'onModifyAtk' },
				{ trigger: HeldItemTrigger.ON_MODIFY_DEF, hookName: 'onModifyDef' },
				{ trigger: HeldItemTrigger.ON_MODIFY_SPA, hookName: 'onModifySpa' },
				{ trigger: HeldItemTrigger.ON_MODIFY_SPD, hookName: 'onModifySpd' },
				{ trigger: HeldItemTrigger.ON_MODIFY_SPEED, hookName: 'onModifySpeed' },
				{ trigger: HeldItemTrigger.ON_MODIFY_DAMAGE, hookName: 'onModifyDamage' },
				{ trigger: HeldItemTrigger.ON_MODIFY_MOVE_POWER, hookName: 'onModifyMovePower' }
			];

			for (const { trigger, hookName } of statTriggers) {
				clearItemRegistry();
				const handler = vi.fn().mockReturnValue(200);
				const effect: HeldItemEffect = {
					name: 'TestItem',
					[hookName]: handler
				};
				registerItem('TestItem', effect);

				const pokemon = createMockPokemon('TestItem');
				const ctx: ItemContext = { pokemon };

				const result = engine.runItemEvent<number>(trigger, ctx);

				expect(result).toBe(200);
				expect(handler).toHaveBeenCalledOnce();
			}
		});

		it('should auto-consume consumable items after effect fires', () => {
			const onTurnEnd = vi.fn();
			const effect: HeldItemEffect = {
				name: 'Sitrus Berry',
				onTurnEnd
			};
			registerItem('Sitrus Berry', effect);

			const pokemon = createMockPokemon('Sitrus Berry', true);
			const ctx: ItemContext = { pokemon };

			engine.runItemEvent(HeldItemTrigger.ON_TURN_END, ctx);

			expect(onTurnEnd).toHaveBeenCalledOnce();
			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should not consume non-consumable items', () => {
			const onModifyAtk = vi.fn().mockReturnValue(150);
			const effect: HeldItemEffect = {
				name: 'Choice Band',
				onModifyAtk
			};
			registerItem('Choice Band', effect);

			const pokemon = createMockPokemon('Choice Band', false);
			const ctx: ItemContext = { pokemon };

			engine.runItemEvent(HeldItemTrigger.ON_MODIFY_ATK, ctx);

			expect(onModifyAtk).toHaveBeenCalledOnce();
			expect(pokemon.heldItem).toBeDefined();
			expect(pokemon.heldItem!.name).toBe('Choice Band');
		});

		it('should normalize item names for lookup (case-insensitive)', () => {
			const onSwitchIn = vi.fn();
			const effect: HeldItemEffect = {
				name: 'Life Orb',
				onSwitchIn
			};
			registerItem('life orb', effect);

			const pokemon = createMockPokemon('Life Orb');
			const ctx: ItemContext = { pokemon };

			engine.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, ctx);

			expect(onSwitchIn).toHaveBeenCalledOnce();
		});

		it('should pass context to handler including optional fields', () => {
			const onAfterHit = vi.fn();
			const effect: HeldItemEffect = {
				name: 'Life Orb',
				onAfterHit
			};
			registerItem('Life Orb', effect);

			const pokemon = createMockPokemon('Life Orb');
			const opponent = createMockPokemon();
			const ctx: ItemContext = {
				pokemon,
				opponent,
				damage: 50
			};

			engine.runItemEvent(HeldItemTrigger.ON_AFTER_HIT, ctx);

			expect(onAfterHit).toHaveBeenCalledWith(ctx);
			expect(onAfterHit.mock.calls[0][0].damage).toBe(50);
			expect(onAfterHit.mock.calls[0][0].opponent).toBe(opponent);
		});

		it('should not consume consumable items when hook returns false', () => {
			const effect: HeldItemEffect = {
				name: 'Lum Berry',
				onStatusInflicted: (_ctx: ItemContext) => false
			};
			registerItem('Lum Berry', effect);

			const pokemon = createMockPokemon('Lum Berry', true);
			const ctx: ItemContext = { pokemon };

			const result = engine.runItemEvent<boolean>(HeldItemTrigger.ON_STATUS_INFLICTED, ctx);

			expect(result).toBe(false);
			expect(pokemon.heldItem).toBeDefined();
		});
	});
});
