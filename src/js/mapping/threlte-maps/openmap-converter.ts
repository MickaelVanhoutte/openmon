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

/**
 * Biome-specific tile palettes for padding decoration.
 * WALL (height 0.6) and CLIFF_ROCK (height 0.6) act as "mountains" —
 * their clustering via the smoothing pass creates ridge/peak shapes.
 * Cave and volcanic bias heavily toward elevated tiles; other biomes
 * add a smaller mountain accent for organic variation.
 */
const PAD_PALETTES = {
	// Forest: lush greenery with occasional rocky outcrops (~20% elevated)
	forest: [
		...Array<TileType3D>(35).fill(TileType3D.TREE_GROUND),
		...Array<TileType3D>(20).fill(TileType3D.TALL_GRASS),
		...Array<TileType3D>(12).fill(TileType3D.WATER),
		...Array<TileType3D>(8).fill(TileType3D.FLOWER_GROUND),
		...Array<TileType3D>(15).fill(TileType3D.WALL),
		...Array<TileType3D>(10).fill(TileType3D.CLIFF_ROCK)
	],
	// Cave: dominated by towering rock walls and cliff faces (~85% elevated)
	cave: [
		...Array<TileType3D>(45).fill(TileType3D.WALL),
		...Array<TileType3D>(40).fill(TileType3D.CLIFF_ROCK),
		...Array<TileType3D>(15).fill(TileType3D.DUNGEON_FLOOR)
	],
	// Swamp: wetlands with tree clumps and a few rocky rises (~25% elevated)
	swamp: [
		...Array<TileType3D>(30).fill(TileType3D.SWAMP),
		...Array<TileType3D>(22).fill(TileType3D.WATER),
		...Array<TileType3D>(18).fill(TileType3D.TREE_GROUND),
		...Array<TileType3D>(8).fill(TileType3D.TALL_GRASS),
		...Array<TileType3D>(12).fill(TileType3D.WALL),
		...Array<TileType3D>(10).fill(TileType3D.CLIFF_ROCK)
	],
	// Volcanic: lava fields broken by jagged rock mountains (~65% elevated)
	volcanic: [
		...Array<TileType3D>(35).fill(TileType3D.LAVA),
		...Array<TileType3D>(38).fill(TileType3D.WALL),
		...Array<TileType3D>(27).fill(TileType3D.CLIFF_ROCK)
	],
	// Dark: shadowy stone labyrinth (~70% elevated)
	dark: [
		...Array<TileType3D>(30).fill(TileType3D.DARK_FLOOR),
		...Array<TileType3D>(40).fill(TileType3D.WALL),
		...Array<TileType3D>(30).fill(TileType3D.CLIFF_ROCK)
	]
} satisfies Record<string, TileType3D[]>;

type PaletteKey = keyof typeof PAD_PALETTES;

/**
 * Maps a BiomeConfig name to a palette key.
 * Allows callers that already know the biome to skip tile-composition inference.
 */
const BIOME_NAME_TO_PALETTE: Record<string, PaletteKey> = {
	'Grass Forest': 'forest',
	'Cave Rock': 'cave',
	'Water Swamp': 'swamp',
	'Fire Volcanic': 'volcanic',
	'Dark Haunted': 'dark'
};

/**
 * Infers a padding palette from the inner map's tile composition.
 * Counts landmark tile types and picks the best-matching biome palette.
 */
function inferPalette(innerTiles: TileType3D[][]): PaletteKey {
	const counts: Partial<Record<TileType3D, number>> = {};
	for (const row of innerTiles) {
		for (const t of row) {
			counts[t] = (counts[t] ?? 0) + 1;
		}
	}
	const c = (t: TileType3D) => counts[t] ?? 0;
	const total = innerTiles.length * (innerTiles[0]?.length ?? 1) || 1;

	const lavaRatio = c(TileType3D.LAVA) / total;
	const swampRatio = (c(TileType3D.SWAMP) + c(TileType3D.WATER)) / total;
	const darkRatio = c(TileType3D.DARK_FLOOR) / total;
	const caveRatio = (c(TileType3D.DUNGEON_FLOOR) + c(TileType3D.WALL)) / total;

	if (lavaRatio > 0.05) return 'volcanic';
	if (darkRatio > 0.05) return 'dark';
	if (swampRatio > 0.15) return 'swamp';
	if (caveRatio > 0.4) return 'cave';
	return 'forest';
}

/** Tile types that are considered elevated (mountains/ridges). */
const ELEVATED_TILES = new Set([TileType3D.WALL, TileType3D.CLIFF_ROCK]);

/**
 * Fills the padding area (outside the inner map) with biome-contextual terrain.
 * The outermost ring always stays WALL.
 * Two-pass: random fill then neighbor-majority smoothing for natural clusters.
 * Returns a Map of flat-index → Y-scale for elevated padding tiles so the
 * renderer can stack them into mountain peaks.
 */
function decoratePadding(
	tiles: TileType3D[][],
	mapId: number,
	padSize: number,
	newWidth: number,
	newHeight: number,
	paletteKey?: PaletteKey
): Map<number, number> {
	// Use provided palette key if known, otherwise infer from inner map tiles
	let resolvedKey: PaletteKey;
	if (paletteKey) {
		resolvedKey = paletteKey;
	} else {
		const innerTiles = tiles
			.slice(padSize, newHeight - padSize)
			.map((row) => row.slice(padSize, newWidth - padSize));
		resolvedKey = inferPalette(innerTiles);
	}
	const palette = PAD_PALETTES[resolvedKey];
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
				tiles[y][x] = rng.pick(palette);
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

	// Pass 3: assign Y-scale to elevated padding tiles based on distance from
	// the inner map edge. Tiles at the outer boundary get the tallest scale,
	// tiles adjacent to the inner map get scale 1 (no change).
	// Scale range: 1.0 (inner edge) → 3.0 (outer edge).
	const heightScales = new Map<number, number>();
	const maxDist = padSize - 1; // distance from inner edge to outermost decorable row
	for (let y = edgeMargin; y < newHeight - edgeMargin; y++) {
		for (let x = edgeMargin; x < newWidth - edgeMargin; x++) {
			if (!isInPadding(x, y) || !ELEVATED_TILES.has(tiles[y][x])) continue;
			// Distance from inner map edge (0 = adjacent to inner map, maxDist = outermost)
			const distFromInner = Math.min(
				y < innerStartY ? innerStartY - y - 1 : y - innerEndY,
				x < innerStartX ? innerStartX - x - 1 : x - innerEndX
			);
			const t = maxDist > 0 ? distFromInner / maxDist : 0;
			// Add some noise so peaks are jagged rather than uniform ridges
			const noise = rng.next() * 0.6 - 0.3; // ±0.3
			const scale = Math.max(1, 1 + t * 2 + noise); // 1.0 → ~3.0
			heightScales.set(y * newWidth + x, scale);
		}
	}
	return heightScales;
}

export function padMapWithCliffs(
	mapData: ThrelteMapData,
	padSize: number = MAP_PAD_SIZE,
	biomeName?: string
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

	const paletteKey = biomeName ? BIOME_NAME_TO_PALETTE[biomeName] : undefined;
	const paddingHeightScales = decoratePadding(newTiles, mapData.mapId, padSize, newWidth, newHeight, paletteKey);

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
		battleTileIndices: newBattleTileIndices,
		paddingHeightScales
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
