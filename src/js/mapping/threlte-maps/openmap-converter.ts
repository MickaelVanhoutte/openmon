import type { OpenMap } from '../maps';
import { TileType3D, type ThrelteMapData } from './types';

const cache = new Map<number, ThrelteMapData>();

export function convertOpenMapToThrelte(openMap: OpenMap): ThrelteMapData {
	const { width, height } = openMap;

	const tiles: TileType3D[][] = [];
	for (let row = 0; row < height; row++) {
		tiles[row] = new Array<TileType3D>(width).fill(TileType3D.GRASS);
	}

	for (const boundary of openMap.waterZones) {
		const { x, y } = boundary.position;
		if (y >= 0 && y < height && x >= 0 && x < width) {
			tiles[y][x] = TileType3D.WATER;
		}
	}

	for (const boundary of openMap.collisionsZones) {
		const { x, y } = boundary.position;
		if (y >= 0 && y < height && x >= 0 && x < width) {
			tiles[y][x] = TileType3D.TREE_GROUND;
		}
	}

	for (const boundary of openMap.battleZones) {
		const { x, y } = boundary.position;
		if (y >= 0 && y < height && x >= 0 && x < width) {
			tiles[y][x] = TileType3D.TALL_GRASS;
		}
	}

	const battleTileIndices = new Set<number>();
	for (const boundary of openMap.battleZones) {
		battleTileIndices.add(boundary.position.y * width + boundary.position.x);
	}

	return {
		mapId: openMap.mapId,
		name: `map-${openMap.mapId}`,
		width,
		height,
		tiles,
		playerStart: openMap.playerInitialPosition,
		jonctions: openMap.jonctions,
		npcs: openMap.npcs,
		items: openMap.items,
		monsters: openMap.monsters,
		levelRange: openMap.levelRange as [number, number],
		battleTileIndices,
		sound: openMap.sound
	};
}

export function getOrConvertMap(openMap: OpenMap): ThrelteMapData {
	const cached = cache.get(openMap.mapId);
	if (cached) {
		return cached;
	}
	const converted = convertOpenMapToThrelte(openMap);
	cache.set(openMap.mapId, converted);
	return converted;
}
