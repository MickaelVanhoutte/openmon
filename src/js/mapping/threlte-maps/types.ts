import type { Position } from '../positions';
import type { Jonction } from '../collisions';
import type { NPC } from '../../characters/npc';
import type { OverworldItem } from '../../items/overworldItem';

export enum TileType3D {
	GRASS = 0,
	PATH = 1,
	WATER = 2,
	SAND = 3,
	TREE_GROUND = 4,
	FLOWER_GROUND = 5,
	TALL_GRASS = 6,
	BUILDING_FLOOR = 7,
	WALL = 8,
	DUNGEON_FLOOR = 9,
	STAIRS_DOWN = 10,
	BOSS_GATE = 11,
	REST_FLOOR = 12,
	SHOP_FLOOR = 13,
	LAVA = 14,
	SWAMP = 15,
	DARK_FLOOR = 16,
	CLIFF_ROCK = 17,
	CAVE_ENTRANCE = 18
}

export const TILE_HEIGHTS: Map<TileType3D, number> = new Map([
	[TileType3D.GRASS, 0],
	[TileType3D.PATH, 0],
	[TileType3D.WATER, -0.15],
	[TileType3D.SAND, 0.05],
	[TileType3D.TREE_GROUND, 0.1],
	[TileType3D.FLOWER_GROUND, 0.1],
	[TileType3D.TALL_GRASS, 0],
	[TileType3D.BUILDING_FLOOR, 0],
	[TileType3D.WALL, 0.6],
	[TileType3D.DUNGEON_FLOOR, 0],
	[TileType3D.STAIRS_DOWN, -0.1],
	[TileType3D.BOSS_GATE, 0.3],
	[TileType3D.REST_FLOOR, 0],
	[TileType3D.SHOP_FLOOR, 0],
	[TileType3D.LAVA, -0.2],
	[TileType3D.SWAMP, -0.05],
	[TileType3D.DARK_FLOOR, 0],
	[TileType3D.CLIFF_ROCK, 0.6],
	[TileType3D.CAVE_ENTRANCE, 0]
]);

export const TILE_WALKABLE: Map<TileType3D, boolean> = new Map([
	[TileType3D.GRASS, true],
	[TileType3D.PATH, true],
	[TileType3D.WATER, false],
	[TileType3D.SAND, true],
	[TileType3D.TREE_GROUND, false],
	[TileType3D.FLOWER_GROUND, true],
	[TileType3D.TALL_GRASS, true],
	[TileType3D.BUILDING_FLOOR, false],
	[TileType3D.WALL, false],
	[TileType3D.DUNGEON_FLOOR, true],
	[TileType3D.STAIRS_DOWN, true],
	[TileType3D.BOSS_GATE, true],
	[TileType3D.REST_FLOOR, true],
	[TileType3D.SHOP_FLOOR, true],
	[TileType3D.LAVA, false],
	[TileType3D.SWAMP, true],
	[TileType3D.DARK_FLOOR, true],
	[TileType3D.CLIFF_ROCK, false],
	[TileType3D.CAVE_ENTRANCE, true]
]);

export const TILE_COLORS: Map<TileType3D, number> = new Map([
	[TileType3D.GRASS, 0x4caf50],
	[TileType3D.PATH, 0xbcaaa4],
	[TileType3D.WATER, 0x2196f3],
	[TileType3D.SAND, 0xfdd835],
	[TileType3D.TREE_GROUND, 0x2e7d32],
	[TileType3D.FLOWER_GROUND, 0x66bb6a],
	[TileType3D.TALL_GRASS, 0x388e3c],
	[TileType3D.BUILDING_FLOOR, 0x78909c],
	[TileType3D.WALL, 0x795548],
	[TileType3D.DUNGEON_FLOOR, 0x9e9e9e],
	[TileType3D.STAIRS_DOWN, 0xffc107],
	[TileType3D.BOSS_GATE, 0xd32f2f],
	[TileType3D.REST_FLOOR, 0x81c784],
	[TileType3D.SHOP_FLOOR, 0xce93d8],
	[TileType3D.LAVA, 0xff5722],
	[TileType3D.SWAMP, 0x558b2f],
	[TileType3D.DARK_FLOOR, 0x424242],
	[TileType3D.CLIFF_ROCK, 0x4a4a4a],
	[TileType3D.CAVE_ENTRANCE, 0x1a1a1a]
]);

export interface ThrelteMapData {
	mapId: number;
	name: string;
	width: number;
	height: number;
	/** 2D grid of tile types, indexed as tiles[row][col]. */
	tiles: TileType3D[][];
	playerStart: Position;
	jonctions: Jonction[];
	npcs: NPC[];
	items: OverworldItem[];
	monsters: number[];
	levelRange: [number, number];
	/** Flat indices (y * width + x) of tiles that trigger wild encounters. */
	battleTileIndices: Set<number>;
	sound?: string;
	/**
	 * Per-tile Y-scale overrides for padding decoration (flat index → scale).
	 * Values > 1 make elevated tiles appear taller, creating mountain peaks.
	 * Only set for padding tiles; absent means scale = 1.
	 */
	paddingHeightScales?: Map<number, number>;
}
