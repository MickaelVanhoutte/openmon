export class FrameOptions {
    frameId: number = 0;
    then: number = Date.now();
    fpsInterval: number = 1000 / 18;
    debug: boolean = false;
    imageScale: number = 2.5;
    playerScale: number = .83;
    walk: number = .3;
    run: number = .6;
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

export class Scenes {
    wakeUp: boolean = false;
    starterSelection: boolean = false;
}

export class OverworldContext {

    frames: FrameOptions;
    menus: Menus;
    scenes: Scenes;

    changingMap: boolean = false;
    running: boolean = false;
    isPaused: boolean = false;

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    toggleMenu(menuType?: MenuType) {
        this.togglePause();
        this.menus.menuOpened = !this.menus.menuOpened;
        this.menus.pokemonListOpened = menuType === MenuType.POKEMON_LIST;
        this.menus.switchOpened = menuType === MenuType.SWITCH;
        this.menus.bagOpened = menuType === MenuType.BAG;
        this.menus.openSummary = menuType === MenuType.SUMMARY;
        this.menus.boxOpened = menuType === MenuType.BOX;
    }

    constructor() {
        this.frames = new FrameOptions();
        this.menus = new Menus();
        this.scenes = new Scenes();
    }
}
