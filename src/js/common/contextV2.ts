import type {MapSave} from "../mapping/maps";
import type {Player} from "../characters/player";
import {OpenMap} from "../mapping/maps";
import type {Settings} from "../characters/settings";
import {MAPS} from "../const";

/**
 * Handles the save storage
 */
export class SavesHolder {

        saves: SaveContext[] = [];

        constructor() {
            this.saves = localStorage.getItem('saves-v2')?.length &&
                // @ts-ignore
                JSON.parse(localStorage.getItem('saves-v2'))
                    .map((save: string) => SaveContext.fromJSon(save))
                || [];
        }

        addSave(save: SaveContext) {
            this.saves.push(save);
        }

        removeSave(index: number) {
            this.saves.splice(index, 1);
        }

        getSave(index: number) {
            return this.saves[index];
        }

        persist() {
            localStorage.setItem('saves-v2', JSON.stringify(this.saves.map((save) => save.toJSon())));
        }

}

/**
 * One save in storage
 */
export class SaveContext {

    //id
    //date
    //player
    //currentMap // position
    //settings
    //
    currentMap: MapSave;
    player: Player;
    settings: Settings;

    constructor(currentMap: MapSave,  player: Player, settings: Settings) {
        this.currentMap = currentMap;
        this.player = player;
        this.settings = settings;
    }

    toJSon() {
        return JSON.stringify(this);
    }

    static fromJSon(json: string) {
        let fromJson = JSON.parse(json);
        return new SaveContext(fromJson.currentMap, fromJson.player, fromJson.settings);
    }

    toGameContext(): GameContext {
        return new GameContext(
            this.player,
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
    map: OpenMap;
    settings: Settings;

    isPaused: boolean = false;
    isBattle: boolean = false;

    constructor(player: Player, map: OpenMap, settings: Settings) {
        this.player = player;
        this.map = map;
        this.settings = settings;
    }

    toOverworldContext() {
        return new OverworldContext();
    }

    toBattleContext() {
        return new BattleContext();
    }
}

/**
 *
 */
export class OverworldContext {


}

export class BattleContext {

}
