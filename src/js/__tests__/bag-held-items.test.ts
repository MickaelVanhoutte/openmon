import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Bag } from '../items/bag';
import type { ItemsReferences } from '../items/items';
import type { PokemonInstance } from '../pokemons/pokedex';
import type { HeldItemData } from '../items/held-items-model';

const CATEGORY_HELD = 40;

function createHeldItemData(id: number, name: string): HeldItemData {
	return { id, name, description: `${name} desc`, power: 10, consumable: false };
}

function createMockItemsRefs(heldItems: HeldItemData[]): ItemsReferences {
	const heldMap = new Map<number, HeldItemData>();
	const refs: Record<number, { categoryId: number }> = {};
	for (const item of heldItems) {
		heldMap.set(item.id, item);
		refs[item.id] = { categoryId: CATEGORY_HELD };
	}
	return {
		references: refs,
		ids: heldItems.map((i) => i.id),
		getItem: vi.fn((id: number) => refs[id]),
		getHeldItemById: vi.fn((id: number) => heldMap.get(id))
	} as unknown as ItemsReferences;
}

function createMockPokemon(heldItem?: HeldItemData): PokemonInstance {
	return { heldItem } as unknown as PokemonInstance;
}

describe('Bag held items', () => {
	let bag: Bag;
	const leftovers = createHeldItemData(100, 'Leftovers');
	const choiceBand = createHeldItemData(101, 'Choice Band');

	beforeEach(() => {
		bag = new Bag();
	});

	it('heldItems pocket starts empty', () => {
		expect(bag.heldItems).toEqual({});
	});

	it('getPocketByCategory(40) returns heldItems', () => {
		expect(bag.getPocketByCategory(CATEGORY_HELD)).toBe(bag.heldItems);
	});

	it('addItems adds held items to heldItems pocket', () => {
		const items = createMockItemsRefs([leftovers]);

		bag.addItems(100, 3, items);

		expect(bag.heldItems[100]).toBe(3);
	});

	it('giveHeldItem gives item from bag to pokemon', () => {
		const items = createMockItemsRefs([leftovers]);
		const pokemon = createMockPokemon();
		bag.heldItems[100] = 2;

		bag.giveHeldItem(100, pokemon, items);

		expect(pokemon.heldItem).toBe(leftovers);
		expect(bag.heldItems[100]).toBe(1);
	});

	it('giveHeldItem swaps if pokemon already has item', () => {
		const items = createMockItemsRefs([leftovers, choiceBand]);
		const pokemon = createMockPokemon(leftovers);
		bag.heldItems[101] = 1;

		bag.giveHeldItem(101, pokemon, items);

		expect(pokemon.heldItem).toBe(choiceBand);
		expect(bag.heldItems[100]).toBe(1);
		expect(bag.heldItems[101]).toBeUndefined();
	});

	it('giveHeldItem throws when item not in bag', () => {
		const items = createMockItemsRefs([leftovers]);
		const pokemon = createMockPokemon();

		expect(() => bag.giveHeldItem(100, pokemon, items)).toThrow('No Leftovers in bag');
	});

	it('giveHeldItem throws when item ID invalid', () => {
		const items = createMockItemsRefs([]);
		const pokemon = createMockPokemon();

		expect(() => bag.giveHeldItem(999, pokemon, items)).toThrow('Held item with ID 999 not found');
	});

	it('takeHeldItem returns item to bag', () => {
		const pokemon = createMockPokemon(leftovers);

		bag.takeHeldItem(pokemon);

		expect(pokemon.heldItem).toBeUndefined();
		expect(bag.heldItems[100]).toBe(1);
	});

	it('takeHeldItem does nothing when pokemon has no item', () => {
		const pokemon = createMockPokemon();

		bag.takeHeldItem(pokemon);

		expect(bag.heldItems).toEqual({});
		expect(pokemon.heldItem).toBeUndefined();
	});

	it('constructor copies heldItems from source bag', () => {
		bag.heldItems[100] = 3;
		bag.heldItems[101] = 1;

		const copied = new Bag(bag);

		expect(copied.heldItems[100]).toBe(3);
		expect(copied.heldItems[101]).toBe(1);
		copied.heldItems[100] = 0;
		expect(bag.heldItems[100]).toBe(3);
	});
});
