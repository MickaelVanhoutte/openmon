export class OverworldContext {

    frames = {
        frameId: 0,
        then: Date.now(),
        fpsInterval: 1000 / 18,
        debug: false,
        imageScale: 2.5,
        playerScale: .83,
        walk: .3,
        run: .6,
    }

    menus = {
        menuOpened: false,
        pokemonListOpened: false,
        switchOpened: false,
        bagOpened: false,
        openSummary: false,
        boxOpened: false,
        wakeUp: false,
        starterSelection: false,
    }

    changingMap: boolean = false;
    running: boolean = false;
    isPaused: boolean = false;

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    constructor() {
    }
}