export enum Weather {
	NONE = 'none',
	RAIN = 'rain',
	SUN = 'sun',
	SAND = 'sand',
	HAIL = 'hail'
}

export enum Screen {
	REFLECT = 'reflect',
	LIGHT_SCREEN = 'light_screen'
}

export enum Hazard {
	STEALTH_ROCK = 'stealth_rock',
	SPIKES = 'spikes',
	TOXIC_SPIKES = 'toxic_spikes'
}

export enum Terrain {
	NONE = 'none',
	ELECTRIC = 'electric',
	GRASSY = 'grassy',
	PSYCHIC = 'psychic',
	MISTY = 'misty'
}

export type Side = 'ally' | 'enemy';

export interface SideState {
	screens: Map<Screen, number>;
	hazards: Map<Hazard, number>;
}

const MAX_HAZARD_LAYERS: Record<Hazard, number> = {
	[Hazard.STEALTH_ROCK]: 1,
	[Hazard.SPIKES]: 3,
	[Hazard.TOXIC_SPIKES]: 2
};

export class BattleField {
	weather: Weather = Weather.NONE;
	weatherTurns: number = 0;

	terrain: Terrain = Terrain.NONE;
	terrainTurns: number = 0;

	trickRoom: boolean = false;
	trickRoomTurns: number = 0;

	allySide: SideState = {
		screens: new Map(),
		hazards: new Map()
	};

	enemySide: SideState = {
		screens: new Map(),
		hazards: new Map()
	};

	private getSide(side: Side): SideState {
		return side === 'ally' ? this.allySide : this.enemySide;
	}

	setWeather(weather: Weather, turns: number = 5): void {
		if (weather === Weather.NONE) {
			this.weather = Weather.NONE;
			this.weatherTurns = 0;
		} else {
			this.weather = weather;
			this.weatherTurns = turns;
		}
	}

	setTerrain(terrain: Terrain, turns: number = 5): void {
		if (terrain === Terrain.NONE) {
			this.terrain = Terrain.NONE;
			this.terrainTurns = 0;
		} else {
			this.terrain = terrain;
			this.terrainTurns = turns;
		}
	}

	setTrickRoom(active: boolean, turns: number = 5): void {
		if (this.trickRoom && active) {
			this.trickRoom = false;
			this.trickRoomTurns = 0;
		} else if (active) {
			this.trickRoom = true;
			this.trickRoomTurns = turns;
		} else {
			this.trickRoom = false;
			this.trickRoomTurns = 0;
		}
	}

	addScreen(side: Side, screen: Screen, turns: number = 5): void {
		this.getSide(side).screens.set(screen, turns);
	}

	removeScreen(side: Side, screen: Screen): void {
		this.getSide(side).screens.delete(screen);
	}

	hasScreen(side: Side, screen: Screen): boolean {
		return this.getSide(side).screens.has(screen);
	}

	getScreenTurns(side: Side, screen: Screen): number {
		return this.getSide(side).screens.get(screen) ?? 0;
	}

	addHazard(side: Side, hazard: Hazard): void {
		const sideState = this.getSide(side);
		const currentLayers = sideState.hazards.get(hazard) ?? 0;
		const maxLayers = MAX_HAZARD_LAYERS[hazard];
		if (currentLayers < maxLayers) {
			sideState.hazards.set(hazard, currentLayers + 1);
		}
	}

	removeHazard(side: Side, hazard: Hazard): void {
		this.getSide(side).hazards.delete(hazard);
	}

	clearHazards(side: Side): void {
		this.getSide(side).hazards.clear();
	}

	hasHazard(side: Side, hazard: Hazard): boolean {
		return this.getSide(side).hazards.has(hazard);
	}

	getHazardLayers(side: Side, hazard: Hazard): number {
		return this.getSide(side).hazards.get(hazard) ?? 0;
	}

	tickTurn(): void {
		if (this.weatherTurns > 0) {
			this.weatherTurns--;
			if (this.weatherTurns === 0) {
				this.weather = Weather.NONE;
			}
		}

		if (this.terrainTurns > 0) {
			this.terrainTurns--;
			if (this.terrainTurns === 0) {
				this.terrain = Terrain.NONE;
			}
		}

		if (this.trickRoomTurns > 0) {
			this.trickRoomTurns--;
			if (this.trickRoomTurns === 0) {
				this.trickRoom = false;
			}
		}

		this.tickScreens(this.allySide);
		this.tickScreens(this.enemySide);
	}

	private tickScreens(sideState: SideState): void {
		for (const [screen, turns] of sideState.screens) {
			if (turns <= 1) {
				sideState.screens.delete(screen);
			} else {
				sideState.screens.set(screen, turns - 1);
			}
		}
	}

	clearField(): void {
		this.weather = Weather.NONE;
		this.weatherTurns = 0;
		this.terrain = Terrain.NONE;
		this.terrainTurns = 0;
		this.trickRoom = false;
		this.trickRoomTurns = 0;
		this.allySide.screens.clear();
		this.allySide.hazards.clear();
		this.enemySide.screens.clear();
		this.enemySide.hazards.clear();
	}
}
