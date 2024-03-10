import {MapSave} from "../mapping/maps";
import {Player} from "../characters/player";
import {PokemonBox} from "../pokemons/boxes";
import {PokemonInstance} from "../pokemons/pokedex";
import {Settings} from "../characters/settings";
import {GameContext} from "./gameContext";
import {writable, type Writable} from "svelte/store";

/**
 * One save in storage
 */
export class SaveContext {

    id: number = 0;
    updated: number = Date.now();
    currentMap: MapSave;
    player: Player;
    boxes: Array<PokemonBox>;
    settings: Settings;
    isNewGame: boolean;

    constructor(id: number, updated: number, currentMap: MapSave, player: Player, boxes: Array<PokemonBox>, settings: Settings, isNewGame: boolean = false) {
        this.id = id;
        this.updated = updated;
        this.currentMap = currentMap;
        this.player = player;
        this.boxes = boxes;
        this.settings = settings;
        this.isNewGame = isNewGame;
    }

    toJSon() {
        return JSON.stringify(this);
    }

    static fromJSon(json: string) {
        let fromJson = JSON.parse(json);
        return new SaveContext(fromJson.id, fromJson.updated, fromJson.currentMap, fromJson.player, fromJson.boxes, fromJson.settings);
    }

    toGameContext(): GameContext {
        return new GameContext(
            this.player,
            this.boxes,
            this.currentMap,
            this.settings,
            this.isNewGame
        );
    }
}

/**
 * Handles the save storage
 */
export class SavesHolder {

    saves: SaveContext[] = [];
    selectedSave: Writable<SaveContext | undefined> = writable(undefined);

    constructor() {
        this.saves = localStorage.getItem('saves-v2')?.length &&
            // @ts-ignore
            JSON.parse(atob(localStorage.getItem('saves-v2')))
                .map((save: string) => SaveContext.fromJSon(save))
            || [];

        this.saves = this.saves.sort((a, b) => b.updated - a.updated);
    }

    removeSave(index: number) {
        this.saves.splice(index, 1);
    }

    selectSave(index: number) {
        this.selectedSave.set(this.saves[index]);
    }

    newGame(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): SaveContext {
        let newSave = new SaveContext(
            this.saves?.length || 0, Date.now(),
            new MapSave(0, {x: 0, y: 0}),
            Player.fromScratch(spriteId, name, gender),
            new Array<PokemonBox>(10).fill(new PokemonBox('Box', new Array<PokemonInstance | undefined>(36).fill(undefined))),
            new Settings(),
            true
        );
        this.saves.push(newSave);
        this.persist();
        this.selectedSave.set(newSave)
        return newSave;
    }

    persist() {
        if (this.selectedSave !== undefined &&
            this.saves?.length > 0 &&
            // @ts-ignore
            this.saves.find((save) => save.id === this.selectedSave.id)) {
            // @ts-ignore
            this.saves.find((save) => save.id === this.selectedSave.id).updated = Date.now();
        }
        let encoded = btoa(JSON.stringify(this.saves.map((save) => save.toJSon())));
        localStorage.setItem('saves-v2', encoded);
    }

}