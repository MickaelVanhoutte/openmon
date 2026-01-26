import type { PokemonInstance } from '../pokemons/pokedex';

export enum EncounterType {
	WILD_BATTLE = 'WILD_BATTLE',
	TRAINER_BATTLE = 'TRAINER_BATTLE',
	CATCH_EVENT = 'CATCH_EVENT',
	SHOP = 'SHOP',
	HEAL = 'HEAL',
	BOSS = 'BOSS',
	TREASURE = 'TREASURE'
}

export enum RoomTheme {
	FOREST = 'FOREST',
	CAVE = 'CAVE',
	BEACH = 'BEACH',
	RUINS = 'RUINS'
}

export interface RoomEncounter {
	type: EncounterType;
	monsters?: number[];
	monsterLevel?: [number, number];
	trainerName?: string;
	items?: number[];
	money?: number;
}

export interface RoomExit {
	direction: 'north' | 'south' | 'east' | 'west';
	nextRoomType: EncounterType;
}

export interface Room {
	id: string;
	floor: number;
	theme: RoomTheme;
	encounter: RoomEncounter;
	exits: RoomExit[];
	cleared: boolean;
	width: number;
	height: number;
	collisionIndices: number[];
}

export interface RunState {
	id: string;
	seed: number;
	currentFloor: number;
	currentRoom: Room | null;
	team: PokemonInstance[];
	starterPokemonId: number;
	money: number;
	itemsCollected: number[];
	roomsCleared: number;
	isActive: boolean;
}

export interface RunConfig {
	maxFloors: number;
	roomsPerFloor: number;
	startingMoney: number;
	encounterWeights: Record<EncounterType, number>;
	themeProgression: RoomTheme[];
	bossEveryNRooms: number;
}

export const DEFAULT_RUN_CONFIG: RunConfig = {
	maxFloors: 5,
	roomsPerFloor: 8,
	startingMoney: 500,
	encounterWeights: {
		[EncounterType.WILD_BATTLE]: 35,
		[EncounterType.TRAINER_BATTLE]: 20,
		[EncounterType.CATCH_EVENT]: 15,
		[EncounterType.SHOP]: 10,
		[EncounterType.HEAL]: 10,
		[EncounterType.BOSS]: 0,
		[EncounterType.TREASURE]: 10
	},
	themeProgression: [
		RoomTheme.FOREST,
		RoomTheme.CAVE,
		RoomTheme.BEACH,
		RoomTheme.RUINS,
		RoomTheme.RUINS
	],
	bossEveryNRooms: 8
};

export const THEME_MONSTERS: Record<RoomTheme, number[]> = {
	[RoomTheme.FOREST]: [10, 11, 13, 14, 16, 17, 19, 20, 21, 25, 43, 46, 48, 69],
	[RoomTheme.CAVE]: [41, 42, 50, 51, 66, 67, 74, 75, 95, 104, 105],
	[RoomTheme.BEACH]: [7, 54, 55, 60, 72, 79, 86, 90, 98, 116, 118, 120],
	[RoomTheme.RUINS]: [63, 64, 65, 92, 93, 94, 96, 97, 102, 103, 106, 137]
};

export const THEME_LEVEL_RANGES: Record<RoomTheme, [number, number]> = {
	[RoomTheme.FOREST]: [5, 10],
	[RoomTheme.CAVE]: [12, 18],
	[RoomTheme.BEACH]: [8, 14],
	[RoomTheme.RUINS]: [18, 25]
};
