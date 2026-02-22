import { SeededRNG, deriveSeed } from './prng';
import { type BiomeConfig, getFloorSize } from './biomes';
import { TileType3D, type BiomeName } from '../mapping/threlte-maps/types';
import { Position } from '../mapping/positions';
import type { FloorData } from './floor-generator';
import {
	isFloorTile,
	findWalkableNearEdge,
	findAdjacentWalkable,
	placeGrassPatches,
	placeTrainers,
	placeItems,
	buildThrelteMap,
	buildOpenMap
} from './floor-utils';

export function generateMaze(
	seed: string,
	floorNumber: number,
	biomeConfig: BiomeConfig
): FloorData {
	const floorSeed = deriveSeed(seed, floorNumber);
	const rng = new SeededRNG(floorSeed);
	const rawSize = getFloorSize(floorNumber, biomeConfig);
	const width = ensureOdd(rawSize.width, biomeConfig.floorSizeRange[1]);
	const height = ensureOdd(rawSize.height, biomeConfig.floorSizeRange[1]);

	const grid = carveMaze(width, height, rng);
	carveRooms(grid, width, height, rng);
	widenCorridors(grid, width, height, rng);

	const playerStart = findWalkableNearEdge(grid, width, height, 'bottom');
	const stairsPosition = findMazeStairsPosition(grid, width, height, playerStart);
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
		biomeConfig.ambientTrack,
		biomeConfig.name as BiomeName
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

function ensureOdd(size: number, max: number): number {
	if (size % 2 === 1) {
		return size;
	}
	if (size + 1 <= max) {
		return size + 1;
	}
	return size - 1;
}

function carveMaze(width: number, height: number, rng: SeededRNG): TileType3D[][] {
	const grid: TileType3D[][] = [];
	for (let y = 0; y < height; y++) {
		grid.push(new Array<TileType3D>(width).fill(TileType3D.WALL));
	}

	const cellsX = (width - 1) / 2;
	const cellsY = (height - 1) / 2;

	const visited: boolean[][] = Array.from({ length: cellsY }, () =>
		new Array<boolean>(cellsX).fill(false)
	);

	const startCX = rng.nextInt(0, cellsX - 1);
	const startCY = rng.nextInt(0, cellsY - 1);
	visited[startCY][startCX] = true;
	grid[startCY * 2 + 1][startCX * 2 + 1] = TileType3D.DUNGEON_FLOOR;

	const stack: [number, number][] = [[startCX, startCY]];
	const directions: [number, number][] = [
		[0, -1],
		[0, 1],
		[-1, 0],
		[1, 0]
	];

	while (stack.length > 0) {
		const [cx, cy] = stack[stack.length - 1];
		const unvisited: [number, number][] = [];

		for (const [dx, dy] of directions) {
			const nx = cx + dx;
			const ny = cy + dy;
			if (nx >= 0 && nx < cellsX && ny >= 0 && ny < cellsY && !visited[ny][nx]) {
				unvisited.push([nx, ny]);
			}
		}

		if (unvisited.length > 0) {
			const [nx, ny] = rng.pick(unvisited);
			grid[cy * 2 + 1 + (ny - cy)][cx * 2 + 1 + (nx - cx)] = TileType3D.DUNGEON_FLOOR;
			visited[ny][nx] = true;
			grid[ny * 2 + 1][nx * 2 + 1] = TileType3D.DUNGEON_FLOOR;
			stack.push([nx, ny]);
		} else {
			stack.pop();
		}
	}

	return grid;
}

function carveRooms(grid: TileType3D[][], width: number, height: number, rng: SeededRNG): void {
	const junctions: [number, number][] = [];
	const deadEnds: [number, number][] = [];

	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			if (!isFloorTile(grid[y][x])) {
				continue;
			}

			let openNeighbors = 0;
			if (isFloorTile(grid[y - 1][x])) {
				openNeighbors++;
			}
			if (isFloorTile(grid[y + 1][x])) {
				openNeighbors++;
			}
			if (isFloorTile(grid[y][x - 1])) {
				openNeighbors++;
			}
			if (isFloorTile(grid[y][x + 1])) {
				openNeighbors++;
			}

			if (openNeighbors >= 3) {
				junctions.push([x, y]);
			} else if (openNeighbors === 1) {
				deadEnds.push([x, y]);
			}
		}
	}

	const candidates = rng.shuffle([...junctions, ...deadEnds]);
	const area = width * height;
	const minRooms = 3;
	const maxRooms = Math.min(6, Math.max(minRooms, Math.floor(area / 150)));
	const roomCount = rng.nextInt(minRooms, maxRooms);

	const carved = new Set<string>();
	let placed = 0;

	for (const [cx, cy] of candidates) {
		if (placed >= roomCount) {
			break;
		}

		const roomW = rng.nextInt(3, 5);
		const roomH = rng.nextInt(3, 5);
		const halfW = Math.floor(roomW / 2);
		const halfH = Math.floor(roomH / 2);

		const startX = cx - halfW;
		const startY = cy - halfH;
		const endX = cx + halfW;
		const endY = cy + halfH;

		if (startX < 1 || startY < 1 || endX >= width - 1 || endY >= height - 1) {
			continue;
		}

		const roomKey = `${cx},${cy}`;
		let tooClose = false;
		for (const key of carved) {
			const [px, py] = key.split(',').map(Number);
			if (Math.abs(px - cx) < 5 && Math.abs(py - cy) < 5) {
				tooClose = true;
				break;
			}
		}
		if (tooClose) {
			continue;
		}

		for (let ry = startY; ry <= endY; ry++) {
			for (let rx = startX; rx <= endX; rx++) {
				grid[ry][rx] = TileType3D.DUNGEON_FLOOR;
			}
		}

		carved.add(roomKey);
		placed++;
	}
}

function widenCorridors(grid: TileType3D[][], width: number, height: number, rng: SeededRNG): void {
	const segments: { y: number; xStart: number; xEnd: number; dir: 'h' | 'v' }[] = [];

	for (let y = 2; y < height - 2; y++) {
		let runStart = -1;
		for (let x = 1; x < width - 1; x++) {
			if (isFloorTile(grid[y][x])) {
				if (runStart === -1) {
					runStart = x;
				}
			} else {
				if (runStart !== -1 && x - runStart >= 3) {
					segments.push({ y, xStart: runStart, xEnd: x - 1, dir: 'h' });
				}
				runStart = -1;
			}
		}
		if (runStart !== -1 && width - 1 - runStart >= 3) {
			segments.push({ y, xStart: runStart, xEnd: width - 2, dir: 'h' });
		}
	}

	for (let x = 2; x < width - 2; x++) {
		let runStart = -1;
		for (let y = 1; y < height - 1; y++) {
			if (isFloorTile(grid[y][x])) {
				if (runStart === -1) {
					runStart = y;
				}
			} else {
				if (runStart !== -1 && y - runStart >= 3) {
					segments.push({ y: runStart, xStart: x, xEnd: y - 1, dir: 'v' });
				}
				runStart = -1;
			}
		}
		if (runStart !== -1 && height - 1 - runStart >= 3) {
			segments.push({ y: runStart, xStart: x, xEnd: height - 2, dir: 'v' });
		}
	}

	const shuffled = rng.shuffle(segments);
	const widenCount = Math.floor(shuffled.length * 0.25);

	for (let i = 0; i < widenCount; i++) {
		const seg = shuffled[i];

		if (seg.dir === 'h') {
			const dy = rng.nextBool() ? -1 : 1;
			const ny = seg.y + dy;
			if (ny < 1 || ny >= height - 1) {
				continue;
			}

			for (let x = seg.xStart; x <= seg.xEnd; x++) {
				grid[ny][x] = TileType3D.DUNGEON_FLOOR;
			}
		} else {
			const dx = rng.nextBool() ? -1 : 1;
			const nx = seg.xStart + dx;
			if (nx < 1 || nx >= width - 1) {
				continue;
			}

			for (let y = seg.y; y <= seg.xEnd; y++) {
				grid[y][nx] = TileType3D.DUNGEON_FLOOR;
			}
		}
	}
}

function findMazeStairsPosition(
	grid: TileType3D[][],
	width: number,
	height: number,
	playerStart: Position
): Position {
	const minDistance = Math.floor(width / 3);
	const deadEnds: Position[] = [];
	const candidates: Position[] = [];

	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			if (!isFloorTile(grid[y][x])) {
				continue;
			}

			const manhattan = Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y);
			if (manhattan < minDistance) {
				continue;
			}

			const pos = new Position(x, y);
			candidates.push(pos);

			let neighborCount = 0;
			if (x > 0 && isFloorTile(grid[y][x - 1])) {
				neighborCount++;
			}
			if (x < width - 1 && isFloorTile(grid[y][x + 1])) {
				neighborCount++;
			}
			if (y > 0 && isFloorTile(grid[y - 1][x])) {
				neighborCount++;
			}
			if (y < height - 1 && isFloorTile(grid[y + 1][x])) {
				neighborCount++;
			}

			if (neighborCount === 1) {
				deadEnds.push(pos);
			}
		}
	}

	const pool = deadEnds.length > 0 ? deadEnds : candidates;
	let bestPos: Position | undefined;
	let bestDist = -1;

	for (const pos of pool) {
		const dist = Math.abs(pos.x - playerStart.x) + Math.abs(pos.y - playerStart.y);
		if (dist > bestDist) {
			bestDist = dist;
			bestPos = pos;
		}
	}

	if (bestPos) {
		return bestPos;
	}
	return findWalkableNearEdge(grid, width, height, 'top');
}
