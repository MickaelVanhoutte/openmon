import { TileType3D } from '../mapping/threlte-maps/types';
import { getBiomePool } from './biome-pool-loader';

export type GenerationType = 'cave' | 'maze';

export interface BiomeConfig {
	name: string;
	floorRange: [number, number];
	tileColorOverrides: Partial<Record<TileType3D, number>>;
	monsterTable: { id: number; weight: number }[];
	levelRange: [number, number];
	encounterRate: number;
	trainerCount: [number, number];
	itemCount: [number, number];
	floorSizeRange: [number, number];
	ambientTrack?: string;
	generationType?: GenerationType;
}

export const GRASS_FOREST: BiomeConfig = {
	name: 'Grass Forest',
	floorRange: [1, 10],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0x4caf50,
		[TileType3D.WALL]: 0x2e7d32
	},
	monsterTable: getBiomePool('GRASS_FOREST').map((e) => ({ id: e.id, weight: e.weight })),
	levelRange: [5, 12],
	encounterRate: 0.1,
	trainerCount: [2, 4],
	itemCount: [2, 4],
	floorSizeRange: [15, 25]
};

export const CAVE_ROCK: BiomeConfig = {
	name: 'Cave Rock',
	floorRange: [11, 20],
	tileColorOverrides: {
		[TileType3D.DUNGEON_FLOOR]: 0x9e9e9e,
		[TileType3D.WALL]: 0x616161
	},
	monsterTable: getBiomePool('CAVE_ROCK').map((e) => ({ id: e.id, weight: e.weight })),
	levelRange: [12, 22],
	encounterRate: 0.12,
	trainerCount: [3, 5],
	itemCount: [3, 5],
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
	monsterTable: getBiomePool('WATER_SWAMP').map((e) => ({ id: e.id, weight: e.weight })),
	levelRange: [22, 32],
	encounterRate: 0.15,
	trainerCount: [4, 6],
	itemCount: [3, 6],
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
	monsterTable: getBiomePool('FIRE_VOLCANIC').map((e) => ({ id: e.id, weight: e.weight })),
	levelRange: [32, 42],
	encounterRate: 0.18,
	trainerCount: [4, 7],
	itemCount: [4, 6],
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
	monsterTable: getBiomePool('DARK_HAUNTED').map((e) => ({ id: e.id, weight: e.weight })),
	levelRange: [42, 55],
	encounterRate: 0.2,
	trainerCount: [5, 8],
	itemCount: [4, 7],
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
	// Cycle every 50 floors so dungeons can extend infinitely
	const effectiveFloor = ((floor - 1) % 50) + 1;
	const biome = BIOMES.find(
		(b) => effectiveFloor >= b.floorRange[0] && effectiveFloor <= b.floorRange[1]
	);
	return biome ?? BIOMES[BIOMES.length - 1];
}

export function getBiomeMix(floor: number): BiomeConfig[] {
	const effectiveFloor = ((floor - 1) % 50) + 1;
	const currentBiome = getBiomeForFloor(floor);
	const nextBiome = getBiomeForFloor(floor + 1);

	if (currentBiome !== nextBiome && effectiveFloor >= currentBiome.floorRange[1] - 1) {
		return [currentBiome, nextBiome];
	}

	return [currentBiome];
}

export function getFloorSize(floor: number, biome: BiomeConfig): { width: number; height: number } {
	const effectiveFloor = ((floor - 1) % 50) + 1;
	const [minSize, maxSize] = biome.floorSizeRange;
	const [minFloor, maxFloor] = biome.floorRange;

	const range = maxFloor - minFloor;
	const progress = range === 0 ? 0 : (effectiveFloor - minFloor) / range;
	const size = Math.floor(minSize + (maxSize - minSize) * Math.min(1, Math.max(0, progress)));

	return { width: size, height: size };
}
