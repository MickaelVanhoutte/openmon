import { MapSave } from "../mapping/maps";
import { Player } from "../characters/player";
import { PokemonBox } from "../pokemons/boxes";
import { Pokedex, PokemonInstance, SavedEntry, UnknownMonster } from "../pokemons/pokedex";
import { Settings } from "../characters/settings";
import { GameContext } from "./gameContext";
import { writable, type Writable } from "svelte/store";
import { FlagEntry, Flags, ObjectiveState, QuestState } from "../scripting/quests";
import { QUESTS } from "../scripting/quests";

/**
 * One save in storage
 */
export class SaveContext {

    id: number = 0;
    created: number = Date.now();
    updated: number = Date.now();
    currentMap: MapSave;
    player: Player;
    boxes: Array<PokemonBox>;
    settings: Settings;
    isNewGame: boolean;
    viewedGuides: number[];
    savedEntry: SavedEntry[];
    questStates: QuestState[] = [];
    flags: Flags;
    // TODO store script played


    constructor(id: number, updated: number, currentMap: MapSave, player: Player, boxes: Array<PokemonBox>, settings: Settings, isNewGame: boolean = false, viewedGuides: number[] = [], savedEntry: SavedEntry[] = [], questStates: QuestState[] = [], flags: Flags) {
        this.id = id;
        this.updated = updated;
        this.currentMap = currentMap;
        this.player = player;
        this.boxes = boxes;
        this.settings = settings;
        this.isNewGame = isNewGame;
        this.viewedGuides = viewedGuides;
        this.savedEntry = savedEntry;
        this.questStates = questStates;
        this.flags = flags;
    }

    toGameContext(): GameContext {
        return new GameContext(this);
    }
}

/**
 * Handles the save storage
 */
export class SavesHolder {

    POKEDEX = new Pokedex();

    saves: SaveContext[] = [];

    _selectedSave: SaveContext | undefined = undefined;
    selectedSave$: Writable<SaveContext | undefined> = writable(undefined);

    requestNexGame$: Writable<boolean> = writable(false);

    constructor() {
        this.saves = localStorage.getItem('saves-v2')?.length &&
            // @ts-ignore
            JSON.parse(localStorage.getItem('saves-v2'), this.reviver) || [];
        this.saves.forEach((save) => {
            Object.setPrototypeOf(save, SaveContext.prototype);
            Object.setPrototypeOf(save.player, Player.prototype);
            save.player.setPrototypes();
            save.boxes = save.boxes.map((box) => {
                Object.setPrototypeOf(box, PokemonBox.prototype);
                box.values = box.values.map((pkmn) => {
                    if (pkmn) {
                        Object.setPrototypeOf(pkmn, PokemonInstance.prototype);
                    }
                    return pkmn;
                });
                return box;
            });
            save.questStates = save.questStates?.map((questState) => {
                Object.setPrototypeOf(questState, QuestState.prototype);
                questState.objectives = questState.objectives.map((objectiveState) => {
                    Object.setPrototypeOf(objectiveState, ObjectiveState.prototype);
                    return objectiveState;
                });
                return questState;
            }) || [];

            save.flags = save?.flags ? new Flags(save?.flags?.flags) : new Flags();

        });
        this.saves = this.saves.sort((a, b) => b.updated - a.updated);
    }

    // TODO: fix, seems to remove the bad one
    removeSave(index: number) {
        this.saves.splice(index, 1);
        this.persist();
    }

    selectSave(index: number) {
        this._selectedSave = this.saves[index];
        this.selectedSave$.set(this.saves[index]);
    }


    newGame(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): SaveContext {
        let boxes: Array<PokemonBox> = new Array<PokemonBox>(32);
        let index = 1;
        for (let i = 0; i < 32; i++) {
            let pokeArray = new Array<PokemonInstance | undefined>(36);
            for (let j = 0; j < 36; j++) {
                let result = this.POKEDEX.findById(index).result;
                if (!(result instanceof UnknownMonster)) {
                    pokeArray[j] = result.instanciate(5, 30, false);
                } else {
                    pokeArray[j] = undefined;
                }
                index++;
            }
            boxes[i] = new PokemonBox('Box ' + (i + 1), pokeArray);
        }

        let newSave = new SaveContext(
            this.saves?.length || 0, Date.now(),
            new MapSave(0),
            Player.fromScratch(spriteId, name, gender),
            boxes,
            new Settings(),
            true,
            [],
            [],
            QUESTS.map(q => q.toState()),
            new Flags()
        );
        this.saves.push(newSave);
        this.persist();
        this._selectedSave = newSave;
        this.selectedSave$.set(newSave)
        return newSave;
    }

    persist(save?: SaveContext) {
        console.log(save);
        if (save && this.saves.find(sv => sv.id === save.id)) {
            // @ts-ignore
            this.saves[this.saves.indexOf(this.saves.find(sv => sv.id === save.id))] = save;
        }
        let encoded = JSON.stringify(this.saves, this.replacer); // todo encode
        console.log(encoded);
        localStorage.setItem('saves-v2', encoded);
    }

    replacer(key: any, value: any) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else {
            return value;
        }
    }

    reviver(key: any, value: any) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }
}