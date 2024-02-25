import {AItem} from "./items";
import {ITEMS} from "../const";
import type {PokemonInstance} from "../pokemons/pokedex";

export class Bag {
    // Map<id, quantity>
    public balls: Record<number, number> = {};
    public potions: Record<number, number> = {};
    public revives: Record<number, number> = {};

    constructor(bag?: Bag) {
        if (bag) {
            Object.keys(bag['balls']).forEach((key) => {
                // @ts-ignore
                this.balls[parseInt(key)] = parseInt(bag['balls'][key]);
            });
            Object.keys(bag['potions']).forEach((key) => {
                // @ts-ignore
                this.potions[parseInt(key)] = parseInt(bag['potions'][key]);
            });
            Object.keys(bag['revives']).forEach((key) => {
                // @ts-ignore
                this.revives[parseInt(key)] = parseInt(bag['revives'][key]);
            });
        }
    }

    addItems(id: number, quantity: number) {
        if (this.getPocketByItemId(id) !== undefined) {
            // @ts-ignore
            this.getPocketByItemId(id)[id] = (this.getPocketByItemId(id)[id] || 0) + quantity;
        }
    }

    getItem(itemId: number): AItem | undefined {

        if (this.getPocketByItemId(itemId)?.[itemId] !== undefined && this.getPocketByItemId(itemId)?.[itemId] > 0) {
            this.addItems(itemId, -1);
            return ITEMS.getItem(itemId)?.instanciate();
        }

        throw new Error("No item for this ID in the bag");
    }

    private getPocketByItemId(itemId: number) {
        let categoryId = ITEMS.getItem(itemId)?.categoryId;
        if (categoryId !== undefined) {
            return this.getPocketByCategory(categoryId);
        }
        throw new Error("No category for this item");
    }

    private getPocketByCategory(categoryId?: number) {
        switch (categoryId) {
            case 34:
                return this.balls;
            case 27:
                return this.potions;
            case 29:
                return this.revives;
            default:
                throw new Error("No pocket for this category");
        }
    }

    use(itemId: number, pokemonInstance?: PokemonInstance) {
        let item = this.getItem(itemId);
        if (item !== undefined && pokemonInstance !== undefined) {
            return item.apply(pokemonInstance);
        }
    }
}
