import { SeededRNG, deriveSeed } from './prng';
import { type BiomeConfig, getFloorSize } from './biomes';
import { TileType3D, type ThrelteMapData } from '../mapping/threlte-maps/types';
import { OpenMap } from '../mapping/maps';
import { Position } from '../mapping/positions';
import type { SparseMapData } from '../mapping/sparse-collision';

export interface FloorData {
	threlteMap: ThrelteMapData;
	openMap: OpenMap;
	playerStart: Position;
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
	const startTime = performance.now();

	try {
		const result = generateFloorInternal(seed, floorNumber, biomeConfig, startTime);
		return result;
	} catch {
		return generateFallbackFloor(floorNumber, biomeConfig);
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
		stairsPosition,
		trainerPositions: [],
		itemPositions: [],
		grassPatches: []
	};
}

function generateFloorInternal(
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

	const stairsPosition = findStairsPosition(grid, width, height, playerStart);
	grid[stairsPosition.y][stairsPosition.x] = TileType3D.STAIRS_DOWN;

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

function isFloorTile(tile: TileType3D): boolean {
	return tile !== TileType3D.WALL && tile !== TileType3D.LAVA && tile !== TileType3D.WATER;
}

function findWalkableNearEdge(
	grid: TileType3D[][],
	width: number,
	height: number,
	edge: 'top' | 'bottom'
): Position {
	const startRow = edge === 'bottom' ? height - 1 : 0;
	const direction = edge === 'bottom' ? -1 : 1;

	for (let y = startRow; y >= 0 && y < height; y += direction) {
		const centerX = Math.floor(width / 2);
		for (let offset = 0; offset < width; offset++) {
			const x1 = centerX + offset;
			const x2 = centerX - offset;

			if (x1 < width && isFloorTile(grid[y][x1])) {
				return new Position(x1, y);
			}
			if (x2 >= 0 && isFloorTile(grid[y][x2])) {
				return new Position(x2, y);
			}
		}
	}

	return new Position(Math.floor(width / 2), Math.floor(height / 2));
}

function findStairsPosition(
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

function placeGrassPatches(
	grid: TileType3D[][],
	width: number,
	height: number,
	rng: SeededRNG,
	playerStart: Position,
	stairsPosition: Position
): Position[][] {
	const patchCount = rng.nextInt(2, 5);
	const patches: Position[][] = [];
	const occupiedSet = new Set<string>();
	occupiedSet.add(`${playerStart.x},${playerStart.y}`);
	occupiedSet.add(`${stairsPosition.x},${stairsPosition.y}`);

	const floorTiles: Position[] = [];
	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			if (grid[y][x] === TileType3D.DUNGEON_FLOOR) {
				floorTiles.push(new Position(x, y));
			}
		}
	}

	if (floorTiles.length === 0) {
		return patches;
	}

	const shuffled = rng.shuffle(floorTiles);
	let seedIdx = 0;

	for (let p = 0; p < patchCount && seedIdx < shuffled.length; p++) {
		const patchSize = rng.nextInt(3, 8);
		const patch: Position[] = [];
		const patchSeed = shuffled[seedIdx++];

		if (occupiedSet.has(`${patchSeed.x},${patchSeed.y}`)) {
			continue;
		}

		const visited = new Set<string>();
		const queue: Position[] = [patchSeed];
		visited.add(`${patchSeed.x},${patchSeed.y}`);

		while (queue.length > 0 && patch.length < patchSize) {
			const current = queue.shift()!;
			const key = `${current.x},${current.y}`;

			if (occupiedSet.has(key)) {
				continue;
			}
			if (grid[current.y][current.x] !== TileType3D.DUNGEON_FLOOR) {
				continue;
			}

			patch.push(current);
			grid[current.y][current.x] = TileType3D.TALL_GRASS;
			occupiedSet.add(key);

			const neighbors = rng.shuffle([
				new Position(current.x + 1, current.y),
				new Position(current.x - 1, current.y),
				new Position(current.x, current.y + 1),
				new Position(current.x, current.y - 1)
			]);

			for (const n of neighbors) {
				const nKey = `${n.x},${n.y}`;
				if (n.x > 0 && n.x < width - 1 && n.y > 0 && n.y < height - 1 && !visited.has(nKey)) {
					visited.add(nKey);
					queue.push(n);
				}
			}
		}

		if (patch.length >= 3) {
			patches.push(patch);
		} else {
			for (const pos of patch) {
				grid[pos.y][pos.x] = TileType3D.DUNGEON_FLOOR;
				occupiedSet.delete(`${pos.x},${pos.y}`);
			}
		}
	}

	return patches;
}

function placeTrainers(
	grid: TileType3D[][],
	width: number,
	height: number,
	rng: SeededRNG,
	biomeConfig: BiomeConfig,
	playerStart: Position
): Position[] {
	const [minTrainers, maxTrainers] = biomeConfig.trainerCount;
	const targetCount = rng.nextInt(minTrainers, maxTrainers);
	const positions: Position[] = [];

	const candidates: Position[] = [];
	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			if (grid[y][x] === TileType3D.DUNGEON_FLOOR) {
				const dist = Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y);
				if (dist >= 3) {
					candidates.push(new Position(x, y));
				}
			}
		}
	}

	const shuffled = rng.shuffle(candidates);

	for (const candidate of shuffled) {
		if (positions.length >= targetCount) {
			break;
		}

		const tooClose = positions.some((t) => {
			return Math.abs(t.x - candidate.x) + Math.abs(t.y - candidate.y) < 5;
		});
		if (tooClose) {
			continue;
		}

		if (hasLineOfSight(grid, candidate, width, height)) {
			positions.push(candidate);
		}
	}

	return positions;
}

function hasLineOfSight(
	grid: TileType3D[][],
	pos: Position,
	width: number,
	height: number
): boolean {
	const directions = [
		{ dx: 0, dy: -1 },
		{ dx: 0, dy: 1 },
		{ dx: -1, dy: 0 },
		{ dx: 1, dy: 0 }
	];

	for (const dir of directions) {
		let clearTiles = 0;
		let cx = pos.x + dir.dx;
		let cy = pos.y + dir.dy;

		while (cx >= 0 && cx < width && cy >= 0 && cy < height) {
			if (grid[cy][cx] === TileType3D.WALL) {
				break;
			}
			clearTiles++;
			if (clearTiles >= 3) {
				return true;
			}
			cx += dir.dx;
			cy += dir.dy;
		}
	}

	return false;
}

function placeItems(
	grid: TileType3D[][],
	width: number,
	height: number,
	rng: SeededRNG,
	playerStart: Position,
	biomeConfig: BiomeConfig
): Position[] {
	const itemCount = rng.nextInt(biomeConfig.itemCount[0], biomeConfig.itemCount[1]);
	const positions: Position[] = [];

	const candidates: Position[] = [];
	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			if (grid[y][x] === TileType3D.DUNGEON_FLOOR) {
				const dist = Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y);
				if (dist >= 3) {
					candidates.push(new Position(x, y));
				}
			}
		}
	}

	const shuffled = rng.shuffle(candidates);

	for (const candidate of shuffled) {
		if (positions.length >= itemCount) {
			break;
		}
		positions.push(candidate);
	}

	return positions;
}

function buildThrelteMap(
	grid: TileType3D[][],
	width: number,
	height: number,
	mapId: number,
	floorNumber: number,
	playerStart: Position,
	monsters: number[],
	levelRange: [number, number],
	sound?: string
): ThrelteMapData {
	const tiles: TileType3D[][] = grid.map((row) => [...row]);
	const battleTileIndices = new Set<number>();

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			if (tiles[row][col] === TileType3D.TALL_GRASS) {
				battleTileIndices.add(row * width + col);
			}
		}
	}

	return {
		mapId,
		name: `Floor ${floorNumber}`,
		width,
		height,
		tiles,
		playerStart,
		jonctions: [],
		npcs: [],
		items: [],
		monsters,
		levelRange,
		battleTileIndices,
		sound
	};
}

function buildOpenMap(
	grid: TileType3D[][],
	width: number,
	height: number,
	mapId: number,
	playerStart: Position,
	monsters: number[],
	levelRange: [number, number],
	sound?: string
): OpenMap {
	const collisionIndices: number[] = [];
	const waterIndices: number[] = [];
	const battleIndices: number[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const tile = grid[y][x];
			const index = y * width + x;

			if (tile === TileType3D.WALL) {
				collisionIndices.push(index);
			} else if (tile === TileType3D.LAVA || tile === TileType3D.WATER) {
				waterIndices.push(index);
			}

			if (tile === TileType3D.TALL_GRASS) {
				battleIndices.push(index);
			}
		}
	}

	const sparseData: SparseMapData = {
		collisionIndices,
		waterIndices,
		battleIndices
	};

	return OpenMap.fromSparse(
		mapId,
		'dungeon',
		width,
		height,
		sparseData,
		monsters,
		playerStart,
		levelRange,
		[],
		undefined,
		undefined,
		undefined,
		sound
	);
}
