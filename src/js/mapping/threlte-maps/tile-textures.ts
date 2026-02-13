import { TileType3D } from './types';

import grass1Url from '../../../assets/tiles/grass1.png';
import dirtUrl from '../../../assets/tiles/dirt.png';
import sandUrl from '../../../assets/tiles/sand.png';
import grassFlowersUrl from '../../../assets/tiles/grass-flowers.png';
import highGrassUrl from '../../../assets/tiles/high-grass.png';
import planksUrl from '../../../assets/tiles/planks.png';
import wallUrl from '../../../assets/tiles/wall.png';
import rock1Url from '../../../assets/tiles/rock1.png';
import pavmentUrl from '../../../assets/tiles/pavment.png';
import rock2Url from '../../../assets/tiles/rock2.png';
import bushUrl from '../../../assets/tiles/bush.png';
import bush2Url from '../../../assets/tiles/bush2.png';
import tree1Url from '../../../assets/tiles/tree1.png';
import tree2Url from '../../../assets/tiles/tree2.png';

export const TILE_TEXTURES: Record<TileType3D, string | null> = {
	[TileType3D.GRASS]: grass1Url,
	[TileType3D.PATH]: dirtUrl,
	[TileType3D.WATER]: null,
	[TileType3D.SAND]: sandUrl,
	[TileType3D.TREE_GROUND]: grass1Url,
	[TileType3D.FLOWER_GROUND]: grassFlowersUrl,
	[TileType3D.TALL_GRASS]: highGrassUrl,
	[TileType3D.BUILDING_FLOOR]: planksUrl,
	[TileType3D.WALL]: dirtUrl,
	[TileType3D.DUNGEON_FLOOR]: dirtUrl,
	[TileType3D.STAIRS_DOWN]: null,
	[TileType3D.BOSS_GATE]: null,
	[TileType3D.REST_FLOOR]: planksUrl,
	[TileType3D.SHOP_FLOOR]: pavmentUrl,
	[TileType3D.LAVA]: null,
	[TileType3D.SWAMP]: null,
	[TileType3D.DARK_FLOOR]: dirtUrl
};

export const TREE_TEXTURES: string[] = [tree1Url, tree2Url];

export const BUSH_TEXTURES: string[] = [bushUrl, bush2Url];

export const WALL_SIDE_TEXTURE: string = wallUrl;

export const ROCK_TEXTURES: string[] = [rock1Url, rock2Url];
