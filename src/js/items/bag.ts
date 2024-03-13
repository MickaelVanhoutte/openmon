import type {PokemonInstance} from "../pokemons/pokedex";
import type {GameContext} from "../context/gameContext";
import {AItem} from "./items-model";

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

    addItems(id: number, quantity: number, gameCtx: GameContext) {
        if (this.getPocketByItemId(id, gameCtx) !== undefined) {
            // @ts-ignore
            this.getPocketByItemId(id, gameCtx)[id] = (this.getPocketByItemId(id, gameCtx)[id] || 0) + quantity;
        }
    }

    getItem(itemId: number, gameCtx: GameContext): AItem | undefined {

        if (this.getPocketByItemId(itemId,gameCtx)?.[itemId] !== undefined && this.getPocketByItemId(itemId, gameCtx)?.[itemId] > 0) {
            this.addItems(itemId, -1, gameCtx);
            return gameCtx.ITEMS.getItem(itemId)?.instanciate();
        }

        throw new Error("No item for this ID in the bag");
    }

    private getPocketByItemId(itemId: number, gameCtx: GameContext) {
        let categoryId = gameCtx.ITEMS.getItem(itemId)?.categoryId;
        if (categoryId !== undefined) {
            return this.getPocketByCategory(categoryId);
        }
        throw new Error("No category for this item");
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
                throw new Error("No pocket for this category");
        }
    }

    use(itemId: number, gameCtx: GameContext, pokemonInstance?: PokemonInstance) {
        let item = this.getItem(itemId, gameCtx);
        if (item !== undefined && pokemonInstance !== undefined) {
            return item.apply(pokemonInstance);
        }
    }
}
