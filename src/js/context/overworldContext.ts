import { get, writable, type Writable } from 'svelte/store';
import { Keys } from '../commands/controls';
import type { OpenMap } from '../mapping/maps';

export class FrameOptions {
	frameId: number = 0;
	then: number = Date.now();
	fpsInterval: number = 1000 / 40;
	debug: boolean = false;
	imageScale: number = 2.5;
	playerScale: number = 1;
	followerScale: number = 1.5;
}

export class Menus {
	menuOpened$: Writable<boolean> = writable(false);
	pokemonListOpened$: Writable<boolean> = writable(false);
	switchOpened$: Writable<boolean> = writable(false);
	bagOpened$: Writable<boolean> = writable(false);
	openSummary$: Writable<boolean> = writable(false);
	summaryIndex: number = 0;
	boxOpened$: Writable<boolean> = writable(false);
	pokedexOpened$: Writable<boolean> = writable(false);
	trainerOpened$: Writable<boolean> = writable(false);
	mapOpened$: Writable<boolean> = writable(false);

	private storeByType: Map<MenuType, Writable<boolean>>;

	constructor() {
		this.storeByType = new Map([
			[MenuType.MAIN, this.menuOpened$],
			[MenuType.POKEMON_LIST, this.pokemonListOpened$],
			[MenuType.SWITCH, this.switchOpened$],
			[MenuType.BAG, this.bagOpened$],
			[MenuType.SUMMARY, this.openSummary$],
			[MenuType.BOX, this.boxOpened$],
			[MenuType.POKEDEX, this.pokedexOpened$],
			[MenuType.TRAINER, this.trainerOpened$],
			[MenuType.MAP, this.mapOpened$]
		]);
	}

	getStore(type: MenuType): Writable<boolean> {
		return this.storeByType.get(type)!;
	}

	isOpen(type: MenuType): boolean {
		return get(this.storeByType.get(type)!);
	}

	setOpen(type: MenuType, open: boolean): void {
		this.storeByType.get(type)!.set(open);
	}
}

export enum MenuType {
	MAIN = 0,
	POKEMON_LIST = 1,
	SWITCH = 2,
	BAG = 3,
	SUMMARY = 4,
	BOX = 5,
	POKEDEX = 6,
	TRAINER = 7,
	MAP = 8
}

export enum SceneType {
	WAKE_UP = 0,
	STARTER_SELECTION = 1,
	PROLOGUE = 2
}

export class Scenes {
	wakeUp: boolean = false;
	starterSelection: boolean = false;
	prologue: boolean = false;
}

export class OverworldContext {
	frames: FrameOptions;
	menus: Menus;
	scenes: Scenes;
	keys: Keys = new Keys();

	changingMap: boolean = false;
	isPaused: boolean = false;
	portalAnimating: boolean = false;

	map: OpenMap;

	setPaused(paused: boolean, _caller?: string, _infos?: any) {
		this.isPaused = paused;
	}

	getPaused(): boolean {
		return this.isPaused;
	}

	startScene(sceneType: SceneType) {
		this.isPaused = true;
		this.scenes.wakeUp = sceneType === SceneType.WAKE_UP;
		this.scenes.starterSelection = sceneType === SceneType.STARTER_SELECTION;
		this.scenes.prologue = sceneType === SceneType.PROLOGUE;
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
			case SceneType.PROLOGUE:
				this.scenes.prologue = false;
				break;
		}
	}

	toggleMenu(menuType: MenuType) {
		const isOpen = this.menus.isOpen(menuType);
		this.menus.setOpen(menuType, !isOpen);
		// MAP toggle doesn't affect pause state
		if (menuType !== MenuType.MAP) {
			this.isPaused = !isOpen;
		}
	}

	openMenu(menuType: MenuType) {
		this.isPaused = true;
		// Close main menu when opening a sub-menu
		if (menuType !== MenuType.MAIN) {
			this.menus.setOpen(MenuType.MAIN, false);
		}
		this.menus.setOpen(menuType, true);
	}

	closeMenu(menuType: MenuType) {
		this.isPaused = false;
		this.menus.setOpen(menuType, false);
	}

	constructor(map: OpenMap) {
		this.frames = new FrameOptions();
		this.menus = new Menus();
		this.scenes = new Scenes();
		this.map = map;
	}
}
