import { MapSave } from "../mapping/maps";
import { Player } from "../characters/player";
import { PokemonBox } from "../pokemons/boxes";
import { PokemonInstance } from "../pokemons/pokedex";
import { Settings } from "../characters/settings";
import { GameContext } from "./gameContext";
import { writable, type Writable } from "svelte/store";

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

    toGameContext(): GameContext {
        return new GameContext(
            this.id,
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

    _selectedSave: SaveContext | undefined = undefined;
    selectedSave$: Writable<SaveContext | undefined> = writable(undefined);

    constructor() {
        this.saves = localStorage.getItem('saves-v2')?.length &&
            // @ts-ignore
            JSON.parse(localStorage.getItem('saves-v2')) || [];
        this.saves.forEach((save) => {
            Object.setPrototypeOf(save, SaveContext.prototype);
        });
        this.saves = this.saves.sort((a, b) => b.updated - a.updated);
    }

    removeSave(index: number) {
        this.saves.splice(index, 1);
    }

    selectSave(index: number) {
        this._selectedSave = this.saves[index];
        this.selectedSave$.set(this.saves[index]);
    }

    newGame(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): SaveContext {
        let newSave = new SaveContext(
            this.saves?.length || 0, Date.now(),
            new MapSave(0),
            Player.fromScratch(spriteId, name, gender),
            new Array<PokemonBox>(10).fill(new PokemonBox('Box', new Array<PokemonInstance | undefined>(36).fill(undefined))),
            new Settings(),
            true
        );
        this.saves.push(newSave);
        this.persist();
        this._selectedSave = newSave;
        this.selectedSave$.set(newSave)
        return newSave;
    }

    persist(save?: SaveContext) {
        if (save && this.saves.find(sv => sv.id === save.id)) {
            // @ts-ignore
            this.saves[this.saves.indexOf(this.saves.find(sv => sv.id === save.id))] = save;
        }
        let encoded = JSON.stringify(this.saves); // todo encode
        localStorage.setItem('saves-v2', encoded);
    }

}