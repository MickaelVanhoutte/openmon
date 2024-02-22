import {Pokedex} from "./pokemons/pokedex";
import pokedexJson from "../../assets/data/final/pokedexBW-animated2.json";
import charactersJson from "../../assets/characts/characts.json";
import {SpritesHolder, WoldSpriteDrawer} from "./sprites/drawers";
import {writable} from "svelte/store";
import {BattleContext} from "./battle/battle";
import "@abraham/reflection";
import {container} from "tsyringe";
import {MoveEffectApplier} from "./pokemons/move-effects";
import {start} from "./mapping/maps/start";
import {startVillage} from "./mapping/maps/start-village";
import {ItemsReferences} from "./items/items";

export const ITEMS = new ItemsReferences();
export let POKEDEX = new Pokedex(pokedexJson);

// Sprites

export const MAP_DRAWER = new WoldSpriteDrawer();
export const CHARACTER_SPRITES = new SpritesHolder(charactersJson);

export const BATTLE_STATE = writable(new BattleContext());
export const BATTLE_ACTX = writable(null);

export const MOVE_EFFECT_APPLIER = container.resolve(MoveEffectApplier);

export const MAPS = {
    0: start,
    1: startVillage,
}
