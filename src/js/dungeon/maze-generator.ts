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

	// t=0 → easy early floors (open, roomy), t=1 → hard late floors (tight, mazy)
	const effectiveFloor = ((floorNumber - 1) % 50) + 1;
	const t = Math.min(1, Math.max(0, (effectiveFloor - 1) / 49));

	const grid = carveMaze(width, height, rng);
	carveRooms(grid, width, height, rng, t);
	widenCorridors(grid, width, height, rng, t);

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

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function carveRooms(grid: TileType3D[][], width: number, height: number, rng: SeededRNG, t: number): void {
	const junctions: [number, number][] = [];
	const deadEnds: [number, number][] = [];

	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			if (!isFloorTile(grid[y][x])) {
				continue;
			}

			let openNeighbors = 0;
			if (isFloorTile(grid[y - 1][x])) openNeighbors++;
			if (isFloorTile(grid[y + 1][x])) openNeighbors++;
			if (isFloorTile(grid[y][x - 1])) openNeighbors++;
			if (isFloorTile(grid[y][x + 1])) openNeighbors++;

			if (openNeighbors >= 3) {
				junctions.push([x, y]);
			} else if (openNeighbors === 1) {
				deadEnds.push([x, y]);
			}
		}
	}

	// Expand dead-ends into alcoves — larger on early floors, shrink to nothing on late floors.
	// At t=0: all dead-ends get a 2–3 tile alcove. At t=1: no alcoves (pure dead-end stubs).
	const alcoveChance = lerp(1.0, 0.0, t);       // probability a dead-end gets an alcove
	const alcoveMaxSize = Math.round(lerp(3, 1, t)); // max alcove radius (1 = no expansion)
	for (const [cx, cy] of deadEnds) {
		if (!rng.nextBool(alcoveChance)) continue;
		const alcoveSize = rng.nextInt(2, alcoveMaxSize);
		const half = Math.floor(alcoveSize / 2);
		const sx = Math.max(1, cx - half);
		const sy = Math.max(1, cy - half);
		const ex = Math.min(width - 2, cx + half);
		const ey = Math.min(height - 2, cy + half);
		for (let ry = sy; ry <= ey; ry++) {
			for (let rx = sx; rx <= ex; rx++) {
				grid[ry][rx] = TileType3D.DUNGEON_FLOOR;
			}
		}
	}

	// Place rooms at junctions and dead-ends.
	// Early floors: more rooms, larger rooms. Late floors: fewer, smaller.
	const candidates = rng.shuffle([...junctions, ...deadEnds]);
	const area = width * height;
	const areaDivisor = Math.round(lerp(80, 150, t));  // t=0 → area/80 (many), t=1 → area/150 (few)
	const minRooms = Math.round(lerp(4, 2, t));
	const maxRooms = Math.max(minRooms, Math.floor(area / areaDivisor));
	const roomCount = rng.nextInt(minRooms, maxRooms);

	const carved = new Set<string>();
	let placed = 0;

	for (const [cx, cy] of candidates) {
		if (placed >= roomCount) {
			break;
		}

		const roomMaxSize = Math.round(lerp(6, 4, t));  // t=0 → up to 6 wide, t=1 → up to 4
		const roomW = rng.nextInt(3, roomMaxSize);
		const roomH = rng.nextInt(3, roomMaxSize);
		const halfW = Math.floor(roomW / 2);
		const halfH = Math.floor(roomH / 2);

		const startX = cx - halfW;
		const startY = cy - halfH;
		const endX = cx + halfW;
		const endY = cy + halfH;

		if (startX < 1 || startY < 1 || endX >= width - 1 || endY >= height - 1) {
			continue;
		}

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

		carved.add(`${cx},${cy}`);
		placed++;
	}
}

function widenCorridors(grid: TileType3D[][], width: number, height: number, rng: SeededRNG, t: number): void {
	const segments: { y: number; xStart: number; xEnd: number; dir: 'h' | 'v' }[] = [];

	// Collect horizontal segments (runs of 3+ floor tiles)
	for (let y = 2; y < height - 2; y++) {
		let runStart = -1;
		for (let x = 1; x < width - 1; x++) {
			if (isFloorTile(grid[y][x])) {
				if (runStart === -1) runStart = x;
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

	// Collect vertical segments (runs of 3+ floor tiles)
	for (let x = 2; x < width - 2; x++) {
		let runStart = -1;
		for (let y = 1; y < height - 1; y++) {
			if (isFloorTile(grid[y][x])) {
				if (runStart === -1) runStart = y;
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

	// Widen rate: t=0 → 60% of segments widened, t=1 → 20%
	const widenRate = lerp(0.6, 0.2, t);
	const shuffled = rng.shuffle(segments);
	const widenCount = Math.floor(shuffled.length * widenRate);

	for (let i = 0; i < widenCount; i++) {
		const seg = shuffled[i];
		const side = rng.nextBool() ? -1 : 1;

		if (seg.dir === 'h') {
			const ny = seg.y + side;
			if (ny < 1 || ny >= height - 1) continue;
			for (let x = seg.xStart; x <= seg.xEnd; x++) {
				grid[ny][x] = TileType3D.DUNGEON_FLOOR;
			}
		} else {
			const nx = seg.xStart + side;
			if (nx < 1 || nx >= width - 1) continue;
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
