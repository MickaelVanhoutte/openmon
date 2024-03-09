import {MapSave} from "../mapping/maps";
import {type Character, Player} from "../characters/player";
import {OpenMap} from "../mapping/maps";
import {Settings} from "../characters/settings";
import {MAPS} from "../const";
import {PokemonInstance} from "../pokemons/pokedex";
import {BattleResult} from "../battle/battle";
import {Position} from "../sprites/drawers";
import {PokemonBox} from "../pokemons/boxes";
import type {Script} from "./scripts";

/**
 * Handles the save storage
 */
export class SavesHolder {

        saves: SaveContext[] = [];
        selectedSave?: SaveContext;

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

        getSave(index: number) {
            this.selectedSave = this.saves[index];
            return this.saves[index];
        }

        newGame(spriteId: number, name: string, gender: 'MALE' | 'FEMALE'): SaveContext {
            let newSave = new SaveContext(
                this.saves?.length || 0, Date.now(),
                new MapSave( 0, {x: 0, y: 0}),
                Player.fromScratch(spriteId, name, gender),
                new Array<PokemonBox>(10).fill(new PokemonBox('Box', new Array<PokemonInstance | undefined>(36).fill(undefined))),
                new Settings(),
                true
            );
            this.saves.push(newSave);
            this.persist();
            return newSave;
        }

        persist() {
            if(this.selectedSave !== undefined &&
                this.saves?.length > 0  &&
                // @ts-ignore
                this.saves.find((save) => save.id === this.selectedSave.id)) {
                // @ts-ignore
                this.saves.find((save) => save.id === this.selectedSave.id).updated = Date.now();
            }
            let encoded =  btoa(JSON.stringify(this.saves.map((save) => save.toJSon())));
            localStorage.setItem('saves-v2', encoded);
        }

}

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
    newGame: boolean;

    constructor(id: number, updated: number, currentMap: MapSave,  player: Player, boxes: Array<PokemonBox>, settings: Settings, newGame: boolean = false) {
        this.id = id;
        this.updated = updated;
        this.currentMap = currentMap;
        this.player = player;
        this.boxes = boxes;
        this.settings = settings;
        this.newGame = newGame;
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
            OpenMap.fromInstance(MAPS[this.currentMap.mapId], this.currentMap.playerPosition),
            this.settings
        );
    }
}

/**
 * The current game context
 */
export class GameContext {

    player: Player;
    boxes: Array<PokemonBox>;
    map: OpenMap;
    settings: Settings;

    isPaused: boolean = false;
    isBattle: boolean = false;

    battleContext?: BattleContext;

    constructor(player: Player, boxes: Array<PokemonBox>, map: OpenMap, settings: Settings) {
        this.player = player;
        this.boxes = boxes;
        this.map = map;
        this.settings = settings;
    }

    toOverworldContext() {
        return new OverworldContext(this.player, this.map, this.settings);
    }

    startBattle(opponent: PokemonInstance | Character): BattleContext {
        let battleContext = new BattleContext((result) => {
            this.isBattle = false;
            this.battleContext = undefined;

            if (!result.win) {
                // tp back to the start // TODO pokecenter position
                this.map.playerMovedOffset = new Position(0, 0);
            } else if (result.caught) {
                // add caught pokemon to team if space or in the box
                if (this.player.monsters.length < 6) {
                    this.player.monsters.push(result.caught);
                } else {
                    // first available space in boxes
                    if(!this.boxes.every(box => box.isFull())){
                        // @ts-ignore
                        this.boxes[this.boxes.indexOf(this.boxes.find(box => !box.isFull()))].add(result.caught);
                    }
                }
            }
        });
        this.isBattle = true;
        this.battleContext = battleContext;
        return battleContext;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    toSaveContext(): SaveContext {
        return new SaveContext(0, Date.now(), new MapSave(this.map.mapId, this.map.playerMovedOffset), this.player, this.boxes, this.settings);
    }
}

export class OverworldContext {

    player: Player;
    map: OpenMap;
    settings: Settings;

    frames = {
        frameId: 0,
        then: Date.now(),
        fpsInterval: 1000 / 18
    }

    changingMap: boolean = false;
    playingScript?: Script;

    constructor(player: Player, map: OpenMap, settings: Settings) {
        this.player = player;
        this.map = map;
        this.settings = settings;
    }
}

export class BattleContext {

    onEnd: (result : BattleResult) => void = () => {};

    constructor(onEnd: (result : BattleResult) => void) {
        this.onEnd = onEnd;
    }

}
