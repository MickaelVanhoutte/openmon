import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Bag } from '../../items/bag';
import { AItem, ItemUsageResult } from '../../items/items-model';
import type { ItemsReferences } from '../../items/items';
import type { PokemonInstance } from '../../pokemons/pokedex';

function createMockItem(id: number, categoryId: number, name: string = 'Test Item'): AItem {
	return {
		id,
		categoryId,
		name,
		description: 'Test description',
		power: 10,
		instanciate: vi.fn().mockReturnThis(),
		doesApply: vi.fn().mockReturnValue(true),
		apply: vi.fn().mockReturnValue(new ItemUsageResult(true))
	} as unknown as AItem;
}

function createMockItemsReferences(items: Record<number, AItem>): ItemsReferences {
	return {
		references: items,
		ids: Object.keys(items).map(Number),
		getItem: vi.fn((id: number) => items[id])
	} as unknown as ItemsReferences;
}

function createMockPokemon(): PokemonInstance {
	return {
		currentHp: 50,
		currentStats: { hp: 100 },
		fainted: false
	} as unknown as PokemonInstance;
}

const CATEGORY_POKEBALL = 34;
const CATEGORY_POTION = 27;
const CATEGORY_REVIVE = 29;

describe('Bag Module', () => {
	describe('Bag constructor', () => {
		it('should create empty bag by default', () => {
			const bag = new Bag();

			expect(bag.balls).toEqual({});
			expect(bag.potions).toEqual({});
			expect(bag.revives).toEqual({});
			expect(bag.money).toBe(3000);
		});

		it('should copy from existing bag', () => {
			const originalBag = new Bag();
			originalBag.balls[1] = 5;
			originalBag.potions[2] = 10;
			originalBag.revives[3] = 2;
			originalBag.money = 5000;

			const copiedBag = new Bag(originalBag);

			expect(copiedBag.balls[1]).toBe(5);
			expect(copiedBag.potions[2]).toBe(10);
			expect(copiedBag.revives[3]).toBe(2);
			expect(copiedBag.money).toBe(5000);
		});

		it('should handle bag copy with empty pockets', () => {
			const originalBag = new Bag();
			originalBag.money = 1000;

			const copiedBag = new Bag(originalBag);

			expect(copiedBag.balls).toEqual({});
			expect(copiedBag.potions).toEqual({});
			expect(copiedBag.revives).toEqual({});
			expect(copiedBag.money).toBe(1000);
		});
	});

	describe('addItems', () => {
		let bag: Bag;
		let mockItems: ItemsReferences;

		beforeEach(() => {
			bag = new Bag();
			const pokeball = createMockItem(1, CATEGORY_POKEBALL, 'Poke Ball');
			const potion = createMockItem(2, CATEGORY_POTION, 'Potion');
			const revive = createMockItem(3, CATEGORY_REVIVE, 'Revive');
			mockItems = createMockItemsReferences({
				1: pokeball,
				2: potion,
				3: revive
			});
		});

		it('should add pokeballs to balls pocket', () => {
			bag.addItems(1, 5, mockItems);

			expect(bag.balls[1]).toBe(5);
		});

		it('should add potions to potions pocket', () => {
			bag.addItems(2, 3, mockItems);

			expect(bag.potions[2]).toBe(3);
		});

		it('should add revives to revives pocket', () => {
			bag.addItems(3, 2, mockItems);

			expect(bag.revives[3]).toBe(2);
		});

		it('should accumulate items when adding to existing quantity', () => {
			bag.addItems(1, 5, mockItems);
			bag.addItems(1, 3, mockItems);

			expect(bag.balls[1]).toBe(8);
		});

		it('should handle adding zero items', () => {
			bag.addItems(1, 0, mockItems);

			expect(bag.balls[1]).toBe(0);
		});

		it('should handle negative quantity (removing items)', () => {
			bag.addItems(1, 10, mockItems);
			bag.addItems(1, -3, mockItems);

			expect(bag.balls[1]).toBe(7);
		});
	});

	describe('getItem', () => {
		let bag: Bag;
		let mockItem: AItem;
		let mockItems: ItemsReferences;

		beforeEach(() => {
			bag = new Bag();
			mockItem = createMockItem(1, CATEGORY_POKEBALL, 'Poke Ball');
			mockItems = createMockItemsReferences({ 1: mockItem });
		});

		it('should return item instance and decrement quantity', () => {
			bag.addItems(1, 5, mockItems);

			const item = bag.getItem(1, mockItems);

			expect(item).toBeDefined();
			expect(mockItem.instanciate).toHaveBeenCalled();
			expect(bag.balls[1]).toBe(4);
		});

		it('should throw error when item not in bag', () => {
			expect(() => bag.getItem(1, mockItems)).toThrow('No item for this ID in the bag');
		});

		it('should throw error when item quantity is zero', () => {
			bag.balls[1] = 0;

			expect(() => bag.getItem(1, mockItems)).toThrow('No item for this ID in the bag');
		});

		it('should allow getting last item', () => {
			bag.addItems(1, 1, mockItems);

			const item = bag.getItem(1, mockItems);

			expect(item).toBeDefined();
			expect(bag.balls[1]).toBe(0);
		});

		it('should throw when getting item after last one used', () => {
			bag.addItems(1, 1, mockItems);
			bag.getItem(1, mockItems);

			expect(() => bag.getItem(1, mockItems)).toThrow('No item for this ID in the bag');
		});
	});

	describe('getPocketByCategory', () => {
		let bag: Bag;

		beforeEach(() => {
			bag = new Bag();
		});

		it('should return balls pocket for pokeball category (34)', () => {
			const pocket = bag.getPocketByCategory(CATEGORY_POKEBALL);
			expect(pocket).toBe(bag.balls);
		});

		it('should return potions pocket for potion category (27)', () => {
			const pocket = bag.getPocketByCategory(CATEGORY_POTION);
			expect(pocket).toBe(bag.potions);
		});

		it('should return revives pocket for revive category (29)', () => {
			const pocket = bag.getPocketByCategory(CATEGORY_REVIVE);
			expect(pocket).toBe(bag.revives);
		});

		it('should throw error for unknown category', () => {
			expect(() => bag.getPocketByCategory(999)).toThrow('No pocket for this category');
		});

		it('should throw error for undefined category', () => {
			expect(() => bag.getPocketByCategory(undefined)).toThrow('No pocket for this category');
		});
	});

	describe('use', () => {
		let bag: Bag;
		let mockItem: AItem;
		let mockItems: ItemsReferences;
		let mockPokemon: PokemonInstance;

		beforeEach(() => {
			bag = new Bag();
			mockItem = createMockItem(1, CATEGORY_POKEBALL, 'Poke Ball');
			mockItems = createMockItemsReferences({ 1: mockItem });
			mockPokemon = createMockPokemon();
		});

		it('should apply item to pokemon and return result', () => {
			bag.addItems(1, 5, mockItems);

			const result = bag.use(1, mockItems, mockPokemon);

			expect(result).toBeInstanceOf(ItemUsageResult);
			expect(result?.success).toBe(true);
		});

		it('should decrement item quantity after use', () => {
			bag.addItems(1, 5, mockItems);

			bag.use(1, mockItems, mockPokemon);

			expect(bag.balls[1]).toBe(4);
		});

		it('should call item apply method with pokemon', () => {
			bag.addItems(1, 5, mockItems);

			bag.use(1, mockItems, mockPokemon);

			expect(mockItem.apply).toHaveBeenCalledWith(mockPokemon);
		});

		it('should return undefined when pokemon not provided', () => {
			bag.addItems(1, 5, mockItems);

			const result = bag.use(1, mockItems, undefined);

			expect(result).toBeUndefined();
		});
	});

	describe('integration scenarios', () => {
		let bag: Bag;
		let mockItems: ItemsReferences;

		beforeEach(() => {
			const pokeball = createMockItem(1, CATEGORY_POKEBALL, 'Poke Ball');
			const greatball = createMockItem(2, CATEGORY_POKEBALL, 'Great Ball');
			const potion = createMockItem(10, CATEGORY_POTION, 'Potion');
			const superPotion = createMockItem(11, CATEGORY_POTION, 'Super Potion');
			const revive = createMockItem(20, CATEGORY_REVIVE, 'Revive');

			mockItems = createMockItemsReferences({
				1: pokeball,
				2: greatball,
				10: potion,
				11: superPotion,
				20: revive
			});
			bag = new Bag();
		});

		it('should handle multiple item types in separate pockets', () => {
			bag.addItems(1, 10, mockItems);
			bag.addItems(2, 5, mockItems);
			bag.addItems(10, 3, mockItems);
			bag.addItems(20, 1, mockItems);

			expect(bag.balls[1]).toBe(10);
			expect(bag.balls[2]).toBe(5);
			expect(bag.potions[10]).toBe(3);
			expect(bag.revives[20]).toBe(1);
		});

		it('should track items independently within same pocket', () => {
			bag.addItems(1, 10, mockItems);
			bag.addItems(2, 5, mockItems);

			bag.getItem(1, mockItems);
			bag.getItem(1, mockItems);

			expect(bag.balls[1]).toBe(8);
			expect(bag.balls[2]).toBe(5);
		});

		it('should persist through copy', () => {
			bag.addItems(1, 10, mockItems);
			bag.addItems(10, 5, mockItems);
			bag.money = 10000;

			const copiedBag = new Bag(bag);

			expect(copiedBag.balls[1]).toBe(10);
			expect(copiedBag.potions[10]).toBe(5);
			expect(copiedBag.money).toBe(10000);
		});
	});
});
