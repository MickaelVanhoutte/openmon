import type { PokemonInstance } from '../pokemons/pokedex';
import { AItem } from './items-model';
import type { ItemsReferences } from './items';

export class Bag {
	// Map<id, quantity>
	public balls: Record<number, number> = {};
	public potions: Record<number, number> = {};
	public revives: Record<number, number> = {};
	public money: number = 3000;

	constructor(bag?: Bag) {
		if (bag) {
			Object.keys(bag.balls).forEach((key) => {
				const numKey = parseInt(key);
				this.balls[numKey] = bag.balls[numKey] ?? 0;
			});
			Object.keys(bag.potions).forEach((key) => {
				const numKey = parseInt(key);
				this.potions[numKey] = bag.potions[numKey] ?? 0;
			});
			Object.keys(bag.revives).forEach((key) => {
				const numKey = parseInt(key);
				this.revives[numKey] = bag.revives[numKey] ?? 0;
			});
			this.money = bag.money;
		}
	}

	addItems(id: number, quantity: number, items: ItemsReferences) {
		const pocket = this.getPocketByItemId(id, items);
		if (pocket !== undefined) {
			pocket[id] = (pocket[id] || 0) + quantity;
		}
	}

	getItem(itemId: number, items: ItemsReferences): AItem | undefined {
		if (
			this.getPocketByItemId(itemId, items)?.[itemId] !== undefined &&
			this.getPocketByItemId(itemId, items)?.[itemId] > 0
		) {
			this.addItems(itemId, -1, items);
			return items.getItem(itemId)?.instanciate();
		}

		throw new Error('No item for this ID in the bag');
	}

	private getPocketByItemId(itemId: number, items: ItemsReferences) {
		let categoryId = items.getItem(itemId)?.categoryId;
		if (categoryId !== undefined) {
			return this.getPocketByCategory(categoryId);
		}
		throw new Error('No category for this item');
	}

	getPocketByCategory(categoryId?: number) {
		switch (categoryId) {
			case 34:
				return this.balls;
			case 27:
				return this.potions;
			case 29:
				return this.revives;
			default:
				throw new Error('No pocket for this category');
		}
	}

	use(itemId: number, items: ItemsReferences, pokemonInstance?: PokemonInstance) {
		let item = this.getItem(itemId, items);
		if (item !== undefined && pokemonInstance !== undefined) {
			return item.apply(pokemonInstance);
		}
	}
}
