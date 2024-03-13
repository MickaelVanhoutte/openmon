import { writable, type Writable } from "svelte/store";
import { Keys } from "../commands/controls";
import type { OpenMap } from "../mapping/maps";

export class FrameOptions {
    frameId: number = 0;
    then: number = Date.now();
    fpsInterval: number = 1000 / 24;
    debug: boolean = false;
    imageScale: number = 2.5;
    playerScale: number = .83;
}

export class Menus {
    menuOpened: boolean = false;
    pokemonListOpened: boolean = false;
    switchOpened: boolean = false;
    bagOpened: boolean = false;
    openSummary: boolean = false;
    boxOpened: boolean = false;
}

export enum MenuType {
    MAIN = 0,
    POKEMON_LIST = 1,
    SWITCH = 2,
    BAG = 3,
    SUMMARY = 4,
    BOX = 5
}

export enum SceneType {
    WAKE_UP = 0,
    STARTER_SELECTION = 1
}

export class Scenes {
    wakeUp: boolean = false;
    starterSelection: boolean = false;
}

export class OverworldContext {

    frames: FrameOptions;
    menus: Menus;
    scenes: Scenes;
    keys: Keys = new Keys();

    changingMap: boolean = false;
    changingMap$: Writable<boolean> = writable(false);
    isPaused: boolean = false;

    map: OpenMap;

    startScene(sceneType: SceneType) {
        this.isPaused = true;
        this.scenes.wakeUp = sceneType === SceneType.WAKE_UP;
        this.scenes.starterSelection = sceneType === SceneType.STARTER_SELECTION;
    }

    endScene(sceneType: SceneType) {
        this.isPaused = false;
        switch (sceneType) {
            case SceneType.WAKE_UP:
                this.scenes.wakeUp = false;
                break;
            case SceneType.STARTER_SELECTION:
                this.scenes.starterSelection = false;
                break;
        }
    }

    openMenu(menuType: MenuType) {
        switch (menuType) {
            case MenuType.MAIN:
                this.isPaused = true;
                this.menus.menuOpened = true;
                break;
            case MenuType.POKEMON_LIST:
                this.menus.pokemonListOpened = true;
                break;
            case MenuType.SWITCH:
                this.menus.switchOpened = true;
                break;
            case MenuType.BAG:
                this.menus.bagOpened = true;
                break;
            case MenuType.SUMMARY:
                this.menus.openSummary = true;
                break;
            case MenuType.BOX:
                this.menus.boxOpened = true;
                break;
        }
    }

    closeMenu(menuType: MenuType) {
        switch (menuType) {
            case MenuType.MAIN:
                this.isPaused = false;
                this.menus.menuOpened = false;
                break;
            case MenuType.POKEMON_LIST:
                this.menus.pokemonListOpened = false;
                break;
            case MenuType.SWITCH:
                this.menus.switchOpened = false;
                break;
            case MenuType.BAG:
                this.menus.bagOpened = false;
                break;
            case MenuType.SUMMARY:
                this.menus.openSummary = false;
                break;
            case MenuType.BOX:
                this.menus.boxOpened = false;
                break;
        }
    }

    constructor(map: OpenMap) {
        this.frames = new FrameOptions();
        this.menus = new Menus();
        this.scenes = new Scenes();
        this.map = map;
    }
}
