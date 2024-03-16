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
    menuOpened$: Writable<boolean> = writable(false);

    pokemonListOpened: boolean = false;
    pokemonListOpened$: Writable<boolean> = writable(false);

    switchOpened: boolean = false;
    switchOpened$: Writable<boolean> = writable(false);

    bagOpened: boolean = false;
    bagOpened$: Writable<boolean> = writable(false);
    
    openSummary: boolean = false;
    openSummary$: Writable<boolean> = writable(false);

    boxOpened: boolean = false;
    boxOpened$: Writable<boolean> = writable(false);

    pokedexOpened: boolean = false;
    pokedexOpened$: Writable<boolean> = writable(false);

    trainerOpened: boolean = false;
    trainerOpened$: Writable<boolean> = writable(false);
}

export enum MenuType {
    MAIN = 0,
    POKEMON_LIST = 1,
    SWITCH = 2,
    BAG = 3,
    SUMMARY = 4,
    BOX = 5,
    POKEDEX = 6,
    TRAINER = 7
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
                this.menus.menuOpened$.set(true);
                break;
            case MenuType.POKEMON_LIST:
                this.menus.pokemonListOpened = true;
                this.menus.pokemonListOpened$.set(true);
                break;
            case MenuType.SWITCH:
                this.menus.switchOpened = true;
                this.menus.switchOpened$.set(true);
                break;
            case MenuType.BAG:
                this.menus.bagOpened = true;
                this.menus.bagOpened$.set(true);
                break;
            case MenuType.SUMMARY:
                this.menus.openSummary = true;
                this.menus.openSummary$.set(true);
                break;
            case MenuType.BOX:
                this.menus.boxOpened = true;
                this.menus.boxOpened$.set(true);
                break;
            case MenuType.POKEDEX:
                this.menus.pokedexOpened = true;
                this.menus.pokedexOpened$.set(true);
                break;
            case MenuType.TRAINER:
                this.menus.trainerOpened = true;
                this.menus.trainerOpened$.set(true);
                break;
        }
    }

    closeMenu(menuType: MenuType) {
        switch (menuType) {
            case MenuType.MAIN:
                this.isPaused = false;
                this.menus.menuOpened = false;
                this.menus.menuOpened$.set(false);
                break;
            case MenuType.POKEMON_LIST:
                this.menus.pokemonListOpened = false;
                this.menus.pokemonListOpened$.set(false);
                break;
            case MenuType.SWITCH:
                this.menus.switchOpened = false;
                this.menus.switchOpened$.set(false);
                break;
            case MenuType.BAG:
                this.menus.bagOpened = false;
                this.menus.bagOpened$.set(false);
                break;
            case MenuType.SUMMARY:
                this.menus.openSummary = false;
                this.menus.openSummary$.set(false);
                break;
            case MenuType.BOX:
                this.menus.boxOpened = false;
                this.menus.boxOpened$.set(false);
                break;
            case MenuType.POKEDEX:
                this.menus.pokedexOpened = false;
                this.menus.pokedexOpened$.set(false);
                break;
            case MenuType.TRAINER:
                this.menus.trainerOpened = false;
                this.menus.trainerOpened$.set(false);
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
