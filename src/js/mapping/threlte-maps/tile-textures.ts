import { TileType3D } from './types';

import grass1Url from '../../../assets/tiles/grass1.png';
import grass2Url from '../../../assets/tiles/grass2.png';
import grass3Url from '../../../assets/tiles/grass3.png';
import dirtUrl from '../../../assets/tiles/dirt.png';
import sandUrl from '../../../assets/tiles/sand.png';
import grassFlowersUrl from '../../../assets/tiles/grass-flowers.png';
import grassFlowers2Url from '../../../assets/tiles/grass-flowers2.png';
import highGrassUrl from '../../../assets/tiles/high-grass2.png';
import planksUrl from '../../../assets/tiles/planks.png';
import wallUrl from '../../../assets/tiles/wall.png';
import rock1Url from '../../../assets/tiles/rock1.png';
import pavmentUrl from '../../../assets/tiles/pavment.png';
import rock2Url from '../../../assets/tiles/rock2.png';
import tree1Url from '../../../assets/tiles/tree1.png';
import tree2Url from '../../../assets/tiles/tree2.png';
import swampDirtUrl from '../../../assets/tiles/swamp-dirt.png';
import swampWaterUrl from '../../../assets/tiles/swamp-water.png';
import deadTreeUrl from '../../../assets/tiles/dead-tree.png';
import deadTreeDirtUrl from '../../../assets/tiles/dead-tree-dirt.png';
import smallRocksUrl from '../../../assets/tiles/small-rocks.png';

export const TILE_TEXTURES: Record<TileType3D, string | null> = {
	[TileType3D.GRASS]: grass1Url,
	[TileType3D.PATH]: sandUrl,
	[TileType3D.WATER]: swampWaterUrl,
	[TileType3D.SAND]: sandUrl,
	[TileType3D.TREE_GROUND]: grass1Url,
	[TileType3D.FLOWER_GROUND]: grassFlowersUrl,
	[TileType3D.TALL_GRASS]: grass1Url,
	[TileType3D.BUILDING_FLOOR]: planksUrl,
	[TileType3D.WALL]: dirtUrl,
	[TileType3D.DUNGEON_FLOOR]: dirtUrl,
	[TileType3D.STAIRS_DOWN]: null,
	[TileType3D.BOSS_GATE]: null,
	[TileType3D.REST_FLOOR]: planksUrl,
	[TileType3D.SHOP_FLOOR]: pavmentUrl,
	[TileType3D.LAVA]: null,
	[TileType3D.SWAMP]: swampDirtUrl,
	[TileType3D.DARK_FLOOR]: dirtUrl,
	[TileType3D.CLIFF_ROCK]: dirtUrl,
	[TileType3D.CAVE_ENTRANCE]: dirtUrl
};

export const TREE_TEXTURES: string[] = [tree1Url, tree2Url];

export const BUSH_TEXTURES: string[] = [highGrassUrl];

export const WALL_SIDE_TEXTURE: string = wallUrl;

export const ROCK_TEXTURES: string[] = [rock1Url, rock2Url];

/**
 * Grass variants for GRASS and TALL_GRASS tiles.
 * 75% base grass1, 25% split across other variants.
 * Array length is a power-of-two-friendly number to avoid modulo bias.
 */
export const GRASS_TEXTURES: string[] = [
	// 75% grass1 (12 out of 16)
	grass1Url, grass1Url, grass1Url, grass1Url,
	grass1Url, grass1Url, grass1Url, grass1Url,
	grass1Url, grass1Url, grass1Url, grass1Url,
	// 25% variants (4 out of 16)
	grass2Url,
	grass3Url,
	grassFlowersUrl,
	grassFlowers2Url
];

/** Forest floor grass variants — used on FLOWER_GROUND and TREE_GROUND tiles in forest biomes. */
export const FOREST_GRASS_TEXTURES: string[] = [grassFlowersUrl, grassFlowers2Url];

/**
 * Biome-specific floor textures for DUNGEON_FLOOR tiles.
 * 75% base texture, 25% variants. Array length 16 for clean modulo distribution.
 */
export const BIOME_FLOOR_TEXTURES: Record<string, string[]> = {
	// Grass Forest: 75% grass1, rest spread across other grass variants
	'Grass Forest': [
		grass1Url, grass1Url, grass1Url, grass1Url,
		grass1Url, grass1Url, grass1Url, grass1Url,
		grass1Url, grass1Url, grass1Url, grass1Url,
		grass2Url, grass3Url, grassFlowersUrl, grassFlowers2Url
	],
	'Cave Rock': [dirtUrl],
	'Water Swamp': [swampDirtUrl],
	// Volcanic: 75% dirt, 25% sand (volcanic ash)
	'Fire Volcanic': [
		dirtUrl, dirtUrl, dirtUrl, dirtUrl,
		dirtUrl, dirtUrl, dirtUrl, dirtUrl,
		dirtUrl, dirtUrl, dirtUrl, dirtUrl,
		sandUrl, sandUrl, sandUrl, sandUrl
	],
	'Dark Haunted': [dirtUrl],
	// Overworld: 75% grass1, 25% variants
	Overworld: [
		grass1Url, grass1Url, grass1Url, grass1Url,
		grass1Url, grass1Url, grass1Url, grass1Url,
		grass1Url, grass1Url, grass1Url, grass1Url,
		grass2Url, grass3Url, grassFlowersUrl, grassFlowers2Url
	]
};

/** Dead tree billboard sprite — placed as decoration over SWAMP tiles. */
export const DEAD_TREE_TEXTURES: string[] = [deadTreeUrl];

/** Dead tree on dirt billboard — placed as decoration over swamp TREE_GROUND / PATH-like tiles. */
export const DEAD_TREE_DIRT_TEXTURES: string[] = [deadTreeDirtUrl];

/** Small rocks sprite — placed as decoration on DUNGEON_FLOOR tiles in cave biomes. */
export const SMALL_ROCKS_TEXTURES: string[] = [smallRocksUrl];
