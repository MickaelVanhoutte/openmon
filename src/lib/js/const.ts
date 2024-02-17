import {Pokedex} from "./pokemons/pokedex";
import pokedexJson from "../../assets/data/final/pokedexBW-animated2.json";
import charactersJson from "../../assets/characts/characts.json";
import itemsJson from "../../assets/data/final/usable-items.json";
import {SpritesHolder, WoldSpriteDrawer} from "./sprites/drawers";
import {writable} from "svelte/store";
import {BattleContext} from "./battle/battle";
import "@abraham/reflection";
import {container} from "tsyringe";
import {MoveEffectApplier} from "./pokemons/move-effects";
import {start} from "./mapping/maps/start";
import {startVillage} from "./mapping/maps/start-village";
import type {AItem} from "./items/items";
import {HealingItem, Pokeball, ReviveItem} from "./items/items";

export let POKEDEX = new Pokedex(pokedexJson);

// Sprites

export const MAP_DRAWER = new WoldSpriteDrawer();
export const CHARACTER_SPRITES = new SpritesHolder(charactersJson);

export const BATTLE_STATE = writable(new BattleContext());

export const MOVE_EFFECT_APPLIER = container.resolve(MoveEffectApplier);

export const MAPS = {
    0: start,
    1: startVillage,
}

export let ITEMS = new Map<number, AItem>();
itemsJson.forEach((item: any) => {
    switch (item.category_id) {
        case 34:
            ITEMS.set(item.id, new Pokeball(item.id, item.category_id, item.name, item.description, item.power));
            break;
        case 27:
            ITEMS.set(item.id, new HealingItem(item.id, item.category_id, item.name, item.description, item.power));
            break;
        case 29:
            ITEMS.set(item.id, new ReviveItem(item.id, item.category_id, item.name
                , item.description, item.power));
            break;
        default:
            break;

    }
});
