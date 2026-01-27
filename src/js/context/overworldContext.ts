import { writable, type Writable } from 'svelte/store';
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

	mapOpened: boolean = false;
	mapOpened$: Writable<boolean> = writable(false);
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

	setPaused(paused: boolean, caller: string, infos?: any) {
		console.log('setPaused by ' + caller, paused, infos);
		this.isPaused = paused;
	}

	getPaused(): boolean {
		return this.isPaused;
	}

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

	toggleMenu(menuType: MenuType) {
		switch (menuType) {
			case MenuType.MAIN:
				this.isPaused = !this.isPaused;
				this.menus.menuOpened = !this.menus.menuOpened;
				this.menus.menuOpened$.set(this.menus.menuOpened);
				break;
			case MenuType.POKEMON_LIST:
				this.isPaused = !this.isPaused;
				this.menus.pokemonListOpened = !this.menus.pokemonListOpened;
				this.menus.pokemonListOpened$.set(this.menus.pokemonListOpened);
				break;
			case MenuType.SWITCH:
				this.isPaused = !this.isPaused;
				this.menus.switchOpened = !this.menus.switchOpened;
				this.menus.switchOpened$.set(this.menus.switchOpened);
				break;
			case MenuType.BAG:
				this.isPaused = !this.isPaused;
				this.menus.bagOpened = !this.menus.bagOpened;
				this.menus.bagOpened$.set(this.menus.bagOpened);
				break;
			case MenuType.SUMMARY:
				this.isPaused = !this.isPaused;
				this.menus.openSummary = !this.menus.openSummary;
				this.menus.openSummary$.set(this.menus.openSummary);
				break;
			case MenuType.BOX:
				this.isPaused = !this.isPaused;
				this.menus.boxOpened = !this.menus.boxOpened;
				this.menus.boxOpened$.set(this.menus.boxOpened);
				break;
			case MenuType.POKEDEX:
				this.isPaused = !this.isPaused;
				this.menus.pokedexOpened = !this.menus.pokedexOpened;
				this.menus.pokedexOpened$.set(this.menus.pokedexOpened);
				break;
			case MenuType.TRAINER:
				this.isPaused = !this.isPaused;
				this.menus.trainerOpened = !this.menus.trainerOpened;
				this.menus.trainerOpened$.set(this.menus.trainerOpened);
				break;
			case MenuType.MAP:
				this.menus.mapOpened = !this.menus.mapOpened;
				this.menus.mapOpened$.set(this.menus.mapOpened);
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
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.pokemonListOpened = true;
				this.menus.pokemonListOpened$.set(true);
				break;
			case MenuType.SWITCH:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.switchOpened = true;
				this.menus.switchOpened$.set(true);
				break;
			case MenuType.BAG:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.bagOpened = true;
				this.menus.bagOpened$.set(true);
				break;
			case MenuType.SUMMARY:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.openSummary = true;
				this.menus.openSummary$.set(true);
				break;
			case MenuType.BOX:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.boxOpened = true;
				this.menus.boxOpened$.set(true);
				break;
			case MenuType.POKEDEX:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.pokedexOpened = true;
				this.menus.pokedexOpened$.set(true);
				break;
			case MenuType.TRAINER:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.trainerOpened = true;
				this.menus.trainerOpened$.set(true);
				break;
			case MenuType.MAP:
				this.menus.menuOpened = false;
				this.menus.menuOpened$.set(false);
				this.menus.mapOpened = true;
				this.menus.mapOpened$.set(true);
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
				this.isPaused = false;
				this.menus.pokemonListOpened = false;
				this.menus.pokemonListOpened$.set(false);
				break;
			case MenuType.SWITCH:
				this.isPaused = false;
				this.menus.switchOpened = false;
				this.menus.switchOpened$.set(false);
				break;
			case MenuType.BAG:
				this.isPaused = false;
				this.menus.bagOpened = false;
				this.menus.bagOpened$.set(false);
				break;
			case MenuType.SUMMARY:
				this.isPaused = false;
				this.menus.openSummary = false;
				this.menus.openSummary$.set(false);
				break;
			case MenuType.BOX:
				this.isPaused = false;
				this.menus.boxOpened = false;
				this.menus.boxOpened$.set(false);
				break;
			case MenuType.POKEDEX:
				this.isPaused = false;
				this.menus.pokedexOpened = false;
				this.menus.pokedexOpened$.set(false);
				break;
			case MenuType.TRAINER:
				this.isPaused = false;
				this.menus.trainerOpened = false;
				this.menus.trainerOpened$.set(false);
				break;
			case MenuType.MAP:
				this.isPaused = false;
				this.menus.mapOpened = false;
				this.menus.mapOpened$.set(false);
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
