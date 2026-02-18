import { type BiomeConfig } from './biomes';
import type { SeededRNG } from './prng';
import { TileType3D, type ThrelteMapData } from '../mapping/threlte-maps/types';
import { OpenMap } from '../mapping/maps';
import { Position } from '../mapping/positions';
import type { SparseMapData } from '../mapping/sparse-collision';
import { padMapWithCliffs, MAP_PAD_SIZE } from '../mapping/threlte-maps/openmap-converter';
import type { FloorData } from './floor-generator';

export function isFloorTile(tile: TileType3D): boolean {
	return tile !== TileType3D.WALL && tile !== TileType3D.LAVA && tile !== TileType3D.WATER;
}

export function findWalkableNearEdge(
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

export function findAdjacentWalkable(
	grid: TileType3D[][],
	playerStart: Position,
	width: number,
	height: number
): Position {
	const cardinalOffsets = [
		{ dx: 1, dy: 0 },
		{ dx: -1, dy: 0 },
		{ dx: 0, dy: 1 },
		{ dx: 0, dy: -1 }
	];

	for (const { dx, dy } of cardinalOffsets) {
		const nx = playerStart.x + dx;
		const ny = playerStart.y + dy;
		if (nx >= 0 && nx < width && ny >= 0 && ny < height && isFloorTile(grid[ny][nx])) {
			return new Position(nx, ny);
		}
	}

	// No adjacent walkable tile found -- carve one to the right
	const carveX = playerStart.x + 1;
	const carveY = playerStart.y;
	grid[carveY][carveX] = TileType3D.DUNGEON_FLOOR;
	return new Position(carveX, carveY);
}

export function placeGrassPatches(
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
			const current = queue.shift();
			if (!current) {
				break;
			}
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

export function placeTrainers(
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

export function hasLineOfSight(
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

export function placeItems(
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

export function buildThrelteMap(
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

export function buildOpenMap(
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

export function padFloorData(floorData: FloorData, biomeConfig?: BiomeConfig): FloorData {
	const pad = MAP_PAD_SIZE;

	const paddedMap = padMapWithCliffs(floorData.threlteMap, pad, biomeConfig?.name);

	const paddedOpenMap = buildOpenMap(
		paddedMap.tiles,
		paddedMap.width,
		paddedMap.height,
		paddedMap.mapId,
		paddedMap.playerStart,
		paddedMap.monsters,
		paddedMap.levelRange,
		paddedMap.sound
	);

	const offsetPos = (p: Position) => new Position(p.x + pad, p.y + pad);

	return {
		threlteMap: paddedMap,
		openMap: paddedOpenMap,
		playerStart: offsetPos(floorData.playerStart),
		stairsPosition: offsetPos(floorData.stairsPosition),
		starterItemPosition: offsetPos(floorData.starterItemPosition),
		trainerPositions: floorData.trainerPositions.map(offsetPos),
		itemPositions: floorData.itemPositions.map(offsetPos),
		grassPatches: floorData.grassPatches.map((patch) => patch.map(offsetPos))
	};
}
