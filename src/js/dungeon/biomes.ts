import { TileType3D } from '../mapping/threlte-maps/types';

export interface BiomeConfig {
	name: string;
	floorRange: [number, number];
	tileColorOverrides: Partial<Record<TileType3D, number>>;
	monsterTable: { id: number; weight: number }[];
	levelRange: [number, number];
	encounterRate: number;
	trainerCount: [number, number];
	floorSizeRange: [number, number];
	ambientTrack?: string;
}

export const GRASS_FOREST: BiomeConfig = {
	name: 'Grass Forest',
	floorRange: [1, 10],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0x4caf50,
		[TileType3D.WALL]: 0x2e7d32
	},
	monsterTable: [
		{ id: 10, weight: 30 },
		{ id: 13, weight: 30 },
		{ id: 43, weight: 20 },
		{ id: 69, weight: 15 },
		{ id: 46, weight: 5 }
	],
	levelRange: [5, 12],
	encounterRate: 0.1,
	trainerCount: [1, 2],
	floorSizeRange: [15, 25]
};

export const CAVE_ROCK: BiomeConfig = {
	name: 'Cave Rock',
	floorRange: [11, 20],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0x9e9e9e,
		[TileType3D.WALL]: 0x616161
	},
	monsterTable: [
		{ id: 74, weight: 35 },
		{ id: 41, weight: 30 },
		{ id: 50, weight: 20 },
		{ id: 66, weight: 10 },
		{ id: 95, weight: 5 }
	],
	levelRange: [12, 22],
	encounterRate: 0.12,
	trainerCount: [1, 3],
	floorSizeRange: [20, 30]
};

export const WATER_SWAMP: BiomeConfig = {
	name: 'Water Swamp',
	floorRange: [21, 30],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0x558b2f,
		[TileType3D.WALL]: 0x33691e,
		[TileType3D.SWAMP]: 0x2e7d32
	},
	monsterTable: [
		{ id: 72, weight: 30 },
		{ id: 60, weight: 25 },
		{ id: 88, weight: 20 },
		{ id: 109, weight: 15 },
		{ id: 90, weight: 10 }
	],
	levelRange: [22, 32],
	encounterRate: 0.15,
	trainerCount: [2, 4],
	floorSizeRange: [25, 35]
};

export const FIRE_VOLCANIC: BiomeConfig = {
	name: 'Fire Volcanic',
	floorRange: [31, 40],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0xbf360c,
		[TileType3D.WALL]: 0x3e2723,
		[TileType3D.LAVA]: 0xff5722
	},
	monsterTable: [
		{ id: 37, weight: 30 },
		{ id: 58, weight: 25 },
		{ id: 77, weight: 20 },
		{ id: 126, weight: 15 },
		{ id: 218, weight: 10 }
	],
	levelRange: [32, 42],
	encounterRate: 0.18,
	trainerCount: [2, 5],
	floorSizeRange: [30, 40]
};

export const DARK_HAUNTED: BiomeConfig = {
	name: 'Dark Haunted',
	floorRange: [41, 50],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0x424242,
		[TileType3D.WALL]: 0x212121,
		[TileType3D.DARK_FLOOR]: 0x000000
	},
	monsterTable: [
		{ id: 92, weight: 35 },
		{ id: 93, weight: 25 },
		{ id: 200, weight: 20 },
		{ id: 198, weight: 15 },
		{ id: 94, weight: 5 }
	],
	levelRange: [42, 55],
	encounterRate: 0.2,
	trainerCount: [3, 6],
	floorSizeRange: [35, 50]
};

export const BIOMES: BiomeConfig[] = [
	GRASS_FOREST,
	CAVE_ROCK,
	WATER_SWAMP,
	FIRE_VOLCANIC,
	DARK_HAUNTED
];

export function getBiomeForFloor(floor: number): BiomeConfig {
	const biome = BIOMES.find((b) => floor >= b.floorRange[0] && floor <= b.floorRange[1]);
	return biome ?? DARK_HAUNTED;
}

export function getBiomeMix(floor: number): BiomeConfig[] {
	const currentBiome = getBiomeForFloor(floor);
	const nextFloor = currentBiome.floorRange[1] + 1;
	const nextBiome = getBiomeForFloor(nextFloor);

	if (currentBiome !== nextBiome && floor >= currentBiome.floorRange[1] - 1) {
		return [currentBiome, nextBiome];
	}

	return [currentBiome];
}

export function getFloorSize(floor: number, biome: BiomeConfig): { width: number; height: number } {
	const [minSize, maxSize] = biome.floorSizeRange;
	const [minFloor, maxFloor] = biome.floorRange;

	const range = maxFloor - minFloor;
	const progress = range === 0 ? 0 : (floor - minFloor) / range;
	const size = Math.floor(minSize + (maxSize - minSize) * Math.min(1, Math.max(0, progress)));

	return { width: size, height: size };
}
