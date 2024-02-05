import {Pokedex} from "./pokemons/pokedex";
import pokedexJson from "../../assets/data/final/pokedexBW-animated.json";
import charactersJson from "../../assets/characts/characts.json";
import {SpritesHolder, WoldSpriteDrawer} from "./sprites/drawers";

export let POKEDEX = new Pokedex(pokedexJson);

// Sprites

export const MAP_DRAWER = new WoldSpriteDrawer();
export const CHARACTER_SPRITES = new SpritesHolder(charactersJson);

