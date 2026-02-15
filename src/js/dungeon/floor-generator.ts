import { SeededRNG, deriveSeed } from './prng';
import { type BiomeConfig, getFloorSize } from './biomes';
import { TileType3D, type ThrelteMapData } from '../mapping/threlte-maps/types';
import type { OpenMap } from '../mapping/maps';
import { Position } from '../mapping/positions';
import { generateMaze } from './maze-generator';
import {
	isFloorTile,
	findWalkableNearEdge,
	findAdjacentWalkable,
	placeGrassPatches,
	placeTrainers,
	placeItems,
	buildThrelteMap,
	buildOpenMap,
	padFloorData
} from './floor-utils';

export interface FloorData {
	threlteMap: ThrelteMapData;
	openMap: OpenMap;
	playerStart: Position;
	starterItemPosition: Position;
	stairsPosition: Position;
	trainerPositions: Position[];
	itemPositions: Position[];
	grassPatches: Position[][];
}

const WALL_INIT_PROBABILITY = 0.5;
const SMOOTHING_PASSES = 4;
const WALL_NEIGHBOR_THRESHOLD = 5;

const GENERATION_TIMEOUT_MS = 500;
const FALLBACK_SIZE = 10;

export function generateFloor(
	seed: string,
	floorNumber: number,
	biomeConfig: BiomeConfig
): FloorData {
	const generationType = biomeConfig.generationType ?? 'maze';

	if (generationType === 'maze') {
		try {
			return padFloorData(generateMaze(seed, floorNumber, biomeConfig));
		} catch {
			return padFloorData(generateFallbackFloor(floorNumber, biomeConfig));
		}
	}

	const startTime = performance.now();

	try {
		const result = generateCaveFloor(seed, floorNumber, biomeConfig, startTime);
		return padFloorData(result);
	} catch {
		return padFloorData(generateFallbackFloor(floorNumber, biomeConfig));
	}
}

function generateFallbackFloor(floorNumber: number, biomeConfig: BiomeConfig): FloorData {
	const width = FALLBACK_SIZE;
	const height = FALLBACK_SIZE;
	const mapId = 1000 + floorNumber;

	const grid: TileType3D[][] = [];
	for (let y = 0; y < height; y++) {
		const row: TileType3D[] = [];
		for (let x = 0; x < width; x++) {
			if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
				row.push(TileType3D.WALL);
			} else {
				row.push(TileType3D.DUNGEON_FLOOR);
			}
		}
		grid.push(row);
	}

	const playerStart = new Position(1, 1);
	const starterItemPosition = new Position(2, 1);
	const stairsPosition = new Position(8, 8);
	grid[stairsPosition.y][stairsPosition.x] = TileType3D.STAIRS_DOWN;

	const monsters = biomeConfig.monsterTable.map((m) => m.id);

	const threlteMap = buildThrelteMap(
		grid,
		width,
		height,
		mapId,
		floorNumber,
		playerStart,
		monsters,
		biomeConfig.levelRange,
		biomeConfig.ambientTrack
	);

	const openMap = buildOpenMap(
		grid,
		width,
		height,
		mapId,
		playerStart,
		monsters,
		biomeConfig.levelRange,
		biomeConfig.ambientTrack
	);

	return {
		threlteMap,
		openMap,
		playerStart,
		starterItemPosition,
		stairsPosition,
		trainerPositions: [],
		itemPositions: [],
		grassPatches: []
	};
}

function generateCaveFloor(
	seed: string,
	floorNumber: number,
	biomeConfig: BiomeConfig,
	startTime: number
): FloorData {
	const floorSeed = deriveSeed(seed, floorNumber);
	const rng = new SeededRNG(floorSeed);
	const { width, height } = getFloorSize(floorNumber, biomeConfig);

	const grid = initializeGrid(width, height, rng);

	for (let i = 0; i < SMOOTHING_PASSES; i++) {
		smoothGrid(grid, width, height);
	}

	if (performance.now() - startTime > GENERATION_TIMEOUT_MS) {
		return generateFallbackFloor(floorNumber, biomeConfig);
	}

	ensureConnectivity(grid, width, height);

	if (performance.now() - startTime > GENERATION_TIMEOUT_MS) {
		return generateFallbackFloor(floorNumber, biomeConfig);
	}

	const playerStart = findWalkableNearEdge(grid, width, height, 'bottom');

	const stairsPosition = findCaveStairsPosition(grid, width, height, playerStart);
	grid[stairsPosition.y][stairsPosition.x] = TileType3D.STAIRS_DOWN;

	const starterItemPosition = findAdjacentWalkable(grid, playerStart, width, height);

	const grassPatches = placeGrassPatches(grid, width, height, rng, playerStart, stairsPosition);

	const trainerPositions = placeTrainers(grid, width, height, rng, biomeConfig, playerStart);

	const itemPositions = placeItems(grid, width, height, rng, playerStart, biomeConfig);

	const mapId = 1000 + floorNumber;
	const monsters = biomeConfig.monsterTable.map((m) => m.id);

	const threlteMap = buildThrelteMap(
		grid,
		width,
		height,
		mapId,
		floorNumber,
		playerStart,
		monsters,
		biomeConfig.levelRange,
		biomeConfig.ambientTrack
	);

	const openMap = buildOpenMap(
		grid,
		width,
		height,
		mapId,
		playerStart,
		monsters,
		biomeConfig.levelRange,
		biomeConfig.ambientTrack
	);

	return {
		threlteMap,
		openMap,
		playerStart,
		starterItemPosition,
		stairsPosition,
		trainerPositions,
		itemPositions,
		grassPatches
	};
}

function initializeGrid(width: number, height: number, rng: SeededRNG): TileType3D[][] {
	const grid: TileType3D[][] = [];

	for (let y = 0; y < height; y++) {
		const row: TileType3D[] = [];
		for (let x = 0; x < width; x++) {
			if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
				row.push(TileType3D.WALL);
			} else if (rng.nextBool(WALL_INIT_PROBABILITY)) {
				row.push(TileType3D.WALL);
			} else {
				row.push(TileType3D.DUNGEON_FLOOR);
			}
		}
		grid.push(row);
	}

	return grid;
}

function smoothGrid(grid: TileType3D[][], width: number, height: number): void {
	const snapshot: TileType3D[][] = grid.map((row) => [...row]);

	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			const wallCount = countWallNeighbors(snapshot, x, y);
			if (wallCount >= WALL_NEIGHBOR_THRESHOLD) {
				grid[y][x] = TileType3D.WALL;
			} else {
				grid[y][x] = TileType3D.DUNGEON_FLOOR;
			}
		}
	}
}

function countWallNeighbors(grid: TileType3D[][], x: number, y: number): number {
	let count = 0;
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			if (dx === 0 && dy === 0) {
				continue;
			}
			const nx = x + dx;
			const ny = y + dy;
			if (
				ny < 0 ||
				ny >= grid.length ||
				nx < 0 ||
				nx >= grid[0].length ||
				grid[ny][nx] === TileType3D.WALL
			) {
				count++;
			}
		}
	}
	return count;
}

function ensureConnectivity(grid: TileType3D[][], width: number, height: number): void {
	const visited: boolean[][] = Array.from({ length: height }, () =>
		Array.from({ length: width }, () => false)
	);

	const regions: Position[][] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (!visited[y][x] && isFloorTile(grid[y][x])) {
				const region = floodFill(grid, visited, x, y, width, height);
				regions.push(region);
			}
		}
	}

	if (regions.length === 0) {
		for (let x = 1; x < width - 1; x++) {
			grid[Math.floor(height / 2)][x] = TileType3D.DUNGEON_FLOOR;
		}
		return;
	}

	let largestIdx = 0;
	for (let i = 1; i < regions.length; i++) {
		if (regions[i].length > regions[largestIdx].length) {
			largestIdx = i;
		}
	}

	const largestSet = new Set(regions[largestIdx].map((p) => `${p.x},${p.y}`));
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (isFloorTile(grid[y][x]) && !largestSet.has(`${x},${y}`)) {
				grid[y][x] = TileType3D.WALL;
			}
		}
	}
}

function floodFill(
	grid: TileType3D[][],
	visited: boolean[][],
	startX: number,
	startY: number,
	width: number,
	height: number
): Position[] {
	const region: Position[] = [];
	const stack: Position[] = [new Position(startX, startY)];

	while (stack.length > 0) {
		const pos = stack.pop()!;
		const { x, y } = pos;

		if (x < 0 || x >= width || y < 0 || y >= height) {
			continue;
		}
		if (visited[y][x]) {
			continue;
		}
		if (!isFloorTile(grid[y][x])) {
			continue;
		}

		visited[y][x] = true;
		region.push(pos);

		stack.push(new Position(x + 1, y));
		stack.push(new Position(x - 1, y));
		stack.push(new Position(x, y + 1));
		stack.push(new Position(x, y - 1));
	}

	return region;
}

function findCaveStairsPosition(
	grid: TileType3D[][],
	width: number,
	height: number,
	playerStart: Position
): Position {
	const minDistance = Math.floor(width / 2);
	let bestPos: Position | undefined;
	let bestDistFromTop = Infinity;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (!isFloorTile(grid[y][x])) {
				continue;
			}

			const manhattan = Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y);
			if (manhattan < minDistance) {
				continue;
			}

			if (y < bestDistFromTop) {
				bestDistFromTop = y;
				bestPos = new Position(x, y);
			}
		}
	}

	if (bestPos) {
		return bestPos;
	}

	return findWalkableNearEdge(grid, width, height, 'top');
}
