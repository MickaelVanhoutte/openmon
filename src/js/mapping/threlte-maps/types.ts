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
	BUILDING_FLOOR = 7
}

export const TILE_HEIGHTS: Map<TileType3D, number> = new Map([
	[TileType3D.GRASS, 0.1],
	[TileType3D.PATH, 0],
	[TileType3D.WATER, -0.15],
	[TileType3D.SAND, 0.05],
	[TileType3D.TREE_GROUND, 0.1],
	[TileType3D.FLOWER_GROUND, 0.1],
	[TileType3D.TALL_GRASS, 0.15],
	[TileType3D.BUILDING_FLOOR, 0]
]);

export const TILE_WALKABLE: Map<TileType3D, boolean> = new Map([
	[TileType3D.GRASS, true],
	[TileType3D.PATH, true],
	[TileType3D.WATER, false],
	[TileType3D.SAND, true],
	[TileType3D.TREE_GROUND, false],
	[TileType3D.FLOWER_GROUND, true],
	[TileType3D.TALL_GRASS, true],
	[TileType3D.BUILDING_FLOOR, false]
]);

export const TILE_COLORS: Map<TileType3D, number> = new Map([
	[TileType3D.GRASS, 0x4caf50],
	[TileType3D.PATH, 0xbcaaa4],
	[TileType3D.WATER, 0x2196f3],
	[TileType3D.SAND, 0xfdd835],
	[TileType3D.TREE_GROUND, 0x2e7d32],
	[TileType3D.FLOWER_GROUND, 0x66bb6a],
	[TileType3D.TALL_GRASS, 0x388e3c],
	[TileType3D.BUILDING_FLOOR, 0x78909c]
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
}
