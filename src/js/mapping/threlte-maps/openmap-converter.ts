import type { OpenMap } from '../maps';
import { Jonction } from '../collisions';
import { Position } from '../positions';
import { TileType3D, type ThrelteMapData } from './types';
import { SeededRNG } from '../../dungeon/prng';

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

export const MAP_PAD_SIZE = 8;

const DECOR_TILES: TileType3D[] = [
	...Array<TileType3D>(35).fill(TileType3D.TREE_GROUND),
	...Array<TileType3D>(20).fill(TileType3D.TALL_GRASS),
	...Array<TileType3D>(15).fill(TileType3D.WATER),
	...Array<TileType3D>(10).fill(TileType3D.FLOWER_GROUND),
	...Array<TileType3D>(20).fill(TileType3D.WALL)
];

/**
 * Fills the padding area (outside the inner map) with natural terrain features
 * instead of uniform WALL tiles. The outermost ring always stays WALL.
 * Two-pass: random fill then neighbor-majority smoothing for natural clusters.
 */
function decoratePadding(
	tiles: TileType3D[][],
	mapId: number,
	padSize: number,
	newWidth: number,
	newHeight: number
): void {
	const rng = new SeededRNG(`pad-${mapId}`);

	const innerStartX = padSize;
	const innerStartY = padSize;
	const innerEndX = newWidth - padSize;
	const innerEndY = newHeight - padSize;
	const edgeMargin = 1; // outermost ring stays WALL

	const isInPadding = (x: number, y: number): boolean =>
		y < innerStartY || y >= innerEndY || x < innerStartX || x >= innerEndX;

	// Pass 1: random fill (skip outermost ring and inner map area)
	for (let y = edgeMargin; y < newHeight - edgeMargin; y++) {
		for (let x = edgeMargin; x < newWidth - edgeMargin; x++) {
			if (isInPadding(x, y)) {
				tiles[y][x] = rng.pick(DECOR_TILES);
			}
		}
	}

	// Pass 2: neighbor-majority smoothing to create natural clusters
	const snapshot = tiles.map((row) => [...row]);
	for (let y = edgeMargin; y < newHeight - edgeMargin; y++) {
		for (let x = edgeMargin; x < newWidth - edgeMargin; x++) {
			if (!isInPadding(x, y)) continue;
			const neighborCandidates: [TileType3D | undefined, number, number][] = [
				[snapshot[y - 1]?.[x], x, y - 1],
				[snapshot[y + 1]?.[x], x, y + 1],
				[snapshot[y][x - 1], x - 1, y],
				[snapshot[y][x + 1], x + 1, y]
			];
			const neighbors = neighborCandidates
				.filter(([t, nx, ny]) => t !== undefined && isInPadding(nx, ny))
				.map(([t]) => t as TileType3D);
			const counts = new Map<TileType3D, number>();
			for (const n of neighbors) {
				counts.set(n, (counts.get(n) ?? 0) + 1);
			}
			for (const [type, count] of counts) {
				if (count >= 2) {
					tiles[y][x] = type;
					break;
				}
			}
		}
	}
}

export function padMapWithCliffs(
	mapData: ThrelteMapData,
	padSize: number = MAP_PAD_SIZE
): ThrelteMapData {
	const newWidth = mapData.width + padSize * 2;
	const newHeight = mapData.height + padSize * 2;

	const newTiles: TileType3D[][] = [];
	for (let y = 0; y < newHeight; y++) {
		newTiles.push(new Array<TileType3D>(newWidth).fill(TileType3D.WALL));
	}

	for (let y = 0; y < mapData.height; y++) {
		for (let x = 0; x < mapData.width; x++) {
			newTiles[y + padSize][x + padSize] = mapData.tiles[y][x];
		}
	}

	decoratePadding(newTiles, mapData.mapId, padSize, newWidth, newHeight);

	const newPlayerStart = new Position(
		mapData.playerStart.x + padSize,
		mapData.playerStart.y + padSize
	);

	// Trigger positions live on THIS map so always offset.
	// start is on the DESTINATION map -- all destinations are padded (overworld
	// by the converter, dungeons by padFloorData) so always offset start too.
	const newJonctions = mapData.jonctions.map((j) => {
		const offsetPositions = j.positions.map((p) => new Position(p.x + padSize, p.y + padSize));
		const offsetStart = new Position(j.start.x + padSize, j.start.y + padSize);
		return new Jonction(j.id, j.mapIdx, offsetPositions, offsetStart);
	});

	// Shallow-clone NPCs to avoid mutating the OpenMap originals
	const newNpcs = mapData.npcs.map((npc) => {
		const clone = Object.assign(Object.create(Object.getPrototypeOf(npc)), npc);
		clone.position = Object.assign(
			Object.create(Object.getPrototypeOf(npc.position)),
			npc.position
		);
		clone.position.positionOnMap = new Position(
			npc.position.positionOnMap.x + padSize,
			npc.position.positionOnMap.y + padSize
		);
		clone.position.targetPosition = new Position(
			npc.position.targetPosition.x + padSize,
			npc.position.targetPosition.y + padSize
		);
		return clone;
	});

	const newItems = mapData.items.map((item) => {
		const clone = Object.assign(Object.create(Object.getPrototypeOf(item)), item);
		clone.position = new Position(item.position.x + padSize, item.position.y + padSize);
		return clone;
	});

	// Flat indices use y*width+x -- width change requires full recomputation, not just offset
	const newBattleTileIndices = new Set<number>();
	for (const oldIndex of mapData.battleTileIndices) {
		const oldX = oldIndex % mapData.width;
		const oldY = Math.floor(oldIndex / mapData.width);
		const newIndex = (oldY + padSize) * newWidth + (oldX + padSize);
		newBattleTileIndices.add(newIndex);
	}

	return {
		...mapData,
		width: newWidth,
		height: newHeight,
		tiles: newTiles,
		playerStart: newPlayerStart,
		jonctions: newJonctions,
		npcs: newNpcs,
		items: newItems,
		battleTileIndices: newBattleTileIndices
	};
}

export function getOrConvertMap(openMap: OpenMap): ThrelteMapData {
	const cached = cache.get(openMap.mapId);
	if (cached) {
		return cached;
	}
	let converted = convertOpenMapToThrelte(openMap);
	// Pad overworld maps with cliff border; dungeons (mapId >= 1000) already have walls
	if (openMap.mapId < 1000) {
		converted = padMapWithCliffs(converted);
	}
	cache.set(openMap.mapId, converted);
	return converted;
}

export function preRegisterThrelteMap(mapId: number, threlteMap: ThrelteMapData): void {
	cache.set(mapId, threlteMap);
}

export function clearConverterCache(mapId: number): void {
	cache.delete(mapId);
}
