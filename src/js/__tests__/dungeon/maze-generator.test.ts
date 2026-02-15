import { describe, it, expect } from 'vitest';
import { generateMaze } from '../../dungeon/maze-generator';
import { GRASS_FOREST, CAVE_ROCK, DARK_HAUNTED, BIOMES } from '../../dungeon/biomes';
import { TileType3D } from '../../mapping/threlte-maps/types';
import { Position } from '../../mapping/positions';

function bfsReachable(
	tiles: TileType3D[][],
	start: Position,
	target: Position,
	width: number,
	height: number
): boolean {
	const visited = new Set<string>();
	const queue: Position[] = [start];
	visited.add(`${start.x},${start.y}`);

	while (queue.length > 0) {
		const pos = queue.shift()!;
		if (pos.x === target.x && pos.y === target.y) {
			return true;
		}

		const neighbors = [
			new Position(pos.x + 1, pos.y),
			new Position(pos.x - 1, pos.y),
			new Position(pos.x, pos.y + 1),
			new Position(pos.x, pos.y - 1)
		];

		for (const n of neighbors) {
			const key = `${n.x},${n.y}`;
			if (
				n.x >= 0 &&
				n.x < width &&
				n.y >= 0 &&
				n.y < height &&
				!visited.has(key) &&
				tiles[n.y][n.x] !== TileType3D.WALL &&
				tiles[n.y][n.x] !== TileType3D.LAVA &&
				tiles[n.y][n.x] !== TileType3D.WATER
			) {
				visited.add(key);
				queue.push(n);
			}
		}
	}

	return false;
}

function bfsReachableAll(
	tiles: TileType3D[][],
	start: Position,
	width: number,
	height: number
): Set<string> {
	const visited = new Set<string>();
	const queue: Position[] = [start];
	visited.add(`${start.x},${start.y}`);

	while (queue.length > 0) {
		const pos = queue.shift()!;

		const neighbors = [
			new Position(pos.x + 1, pos.y),
			new Position(pos.x - 1, pos.y),
			new Position(pos.x, pos.y + 1),
			new Position(pos.x, pos.y - 1)
		];

		for (const n of neighbors) {
			const key = `${n.x},${n.y}`;
			if (
				n.x >= 0 &&
				n.x < width &&
				n.y >= 0 &&
				n.y < height &&
				!visited.has(key) &&
				tiles[n.y][n.x] !== TileType3D.WALL &&
				tiles[n.y][n.x] !== TileType3D.LAVA &&
				tiles[n.y][n.x] !== TileType3D.WATER
			) {
				visited.add(key);
				queue.push(n);
			}
		}
	}

	return visited;
}

describe('generateMaze', () => {
	const SEED = 'test-seed';

	describe('basic output', () => {
		it('should return FloorData with all required fields defined', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);

			expect(result.threlteMap).toBeDefined();
			expect(result.openMap).toBeDefined();
			expect(result.playerStart).toBeDefined();
			expect(result.starterItemPosition).toBeDefined();
			expect(result.stairsPosition).toBeDefined();
			expect(result.trainerPositions).toBeDefined();
			expect(result.itemPositions).toBeDefined();
			expect(result.grassPatches).toBeDefined();
		});

		it('should produce tile dimensions within biome floorSizeRange', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			const { width, height } = result.threlteMap;

			expect(width).toBeGreaterThanOrEqual(GRASS_FOREST.floorSizeRange[0]);
			expect(width).toBeLessThanOrEqual(GRASS_FOREST.floorSizeRange[1]);
			expect(height).toBeGreaterThanOrEqual(GRASS_FOREST.floorSizeRange[0]);
			expect(height).toBeLessThanOrEqual(GRASS_FOREST.floorSizeRange[1]);
		});
	});

	describe('connectivity', () => {
		it('should produce connected mazes where player can reach stairs for 100+ seeds across all biomes', () => {
			for (const biome of BIOMES) {
				for (let i = 0; i < 25; i++) {
					const seed = `maze-connectivity-${biome.name}-${i}`;
					const floorNumber = biome.floorRange[0];
					const result = generateMaze(seed, floorNumber, biome);
					const { tiles, width, height } = result.threlteMap;

					const reachable = bfsReachable(
						tiles,
						result.playerStart,
						result.stairsPosition,
						width,
						height
					);
					expect(reachable).toBe(true);
				}
			}
		});

		it('should have every walkable tile reachable from playerStart (single connected region)', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `maze-single-region-${i}`;
				const result = generateMaze(seed, 1, GRASS_FOREST);
				const { tiles, width, height } = result.threlteMap;

				const reachableSet = bfsReachableAll(tiles, result.playerStart, width, height);

				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						const tile = tiles[y][x];
						if (tile !== TileType3D.WALL && tile !== TileType3D.LAVA && tile !== TileType3D.WATER) {
							expect(reachableSet.has(`${x},${y}`)).toBe(true);
						}
					}
				}
			}
		});
	});

	describe('determinism', () => {
		it('should produce identical output for same seed + floorNumber + biomeConfig', () => {
			const result1 = generateMaze(SEED, 1, GRASS_FOREST);
			const result2 = generateMaze(SEED, 1, GRASS_FOREST);

			expect(result1.playerStart.x).toBe(result2.playerStart.x);
			expect(result1.playerStart.y).toBe(result2.playerStart.y);
			expect(result1.stairsPosition.x).toBe(result2.stairsPosition.x);
			expect(result1.stairsPosition.y).toBe(result2.stairsPosition.y);
			expect(result1.trainerPositions.length).toBe(result2.trainerPositions.length);
			expect(result1.itemPositions.length).toBe(result2.itemPositions.length);
			expect(result1.grassPatches.length).toBe(result2.grassPatches.length);

			for (let row = 0; row < result1.threlteMap.height; row++) {
				for (let col = 0; col < result1.threlteMap.width; col++) {
					expect(result1.threlteMap.tiles[row][col]).toBe(result2.threlteMap.tiles[row][col]);
				}
			}
		});

		it('should produce different layouts for different seeds', () => {
			const result1 = generateMaze('maze-seed-a', 1, GRASS_FOREST);
			const result2 = generateMaze('maze-seed-b', 1, GRASS_FOREST);

			let hasDifference = false;
			for (let row = 0; row < result1.threlteMap.height; row++) {
				for (let col = 0; col < result1.threlteMap.width; col++) {
					if (result1.threlteMap.tiles[row][col] !== result2.threlteMap.tiles[row][col]) {
						hasDifference = true;
						break;
					}
				}
				if (hasDifference) {
					break;
				}
			}
			expect(hasDifference).toBe(true);
		});
	});

	describe('corridor pattern', () => {
		it('should have a higher wall-to-walkable ratio than cellular automata caves', () => {
			for (let i = 0; i < 20; i++) {
				const seed = `maze-wall-ratio-${i}`;
				const result = generateMaze(seed, 5, CAVE_ROCK);
				const { tiles, width, height } = result.threlteMap;

				let wallCount = 0;
				let walkableCount = 0;
				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						if (tiles[y][x] === TileType3D.WALL) {
							wallCount++;
						} else {
							walkableCount++;
						}
					}
				}

				const wallRatio = wallCount / (wallCount + walkableCount);
				expect(wallRatio).toBeGreaterThan(0.35);
			}
		});

		it('should have small average open-space cluster size (narrow corridors)', () => {
			for (let i = 0; i < 20; i++) {
				const seed = `maze-corridor-width-${i}`;
				const result = generateMaze(seed, 5, CAVE_ROCK);
				const { tiles, width, height } = result.threlteMap;

				let totalAdjacent = 0;
				let walkableCount = 0;

				for (let y = 1; y < height - 1; y++) {
					for (let x = 1; x < width - 1; x++) {
						if (tiles[y][x] === TileType3D.WALL) {
							continue;
						}

						walkableCount++;
						let adjacentWalkable = 0;
						const neighbors = [
							[x + 1, y],
							[x - 1, y],
							[x, y + 1],
							[x, y - 1]
						];
						for (const [nx, ny] of neighbors) {
							if (
								nx >= 0 &&
								nx < width &&
								ny >= 0 &&
								ny < height &&
								tiles[ny][nx] !== TileType3D.WALL
							) {
								adjacentWalkable++;
							}
						}
						totalAdjacent += adjacentWalkable;
					}
				}

				if (walkableCount > 0) {
					const avgAdjacent = totalAdjacent / walkableCount;
					expect(avgAdjacent).toBeLessThanOrEqual(3.0);
					expect(avgAdjacent).toBeGreaterThanOrEqual(1.5);
				}
			}
		});
	});

	describe('player and stairs placement', () => {
		it('should place playerStart on a walkable tile', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `maze-player-walkable-${i}`;
				const result = generateMaze(seed, 1, GRASS_FOREST);
				const { tiles } = result.threlteMap;
				const tile = tiles[result.playerStart.y][result.playerStart.x];

				expect(tile).not.toBe(TileType3D.WALL);
				expect(tile).not.toBe(TileType3D.LAVA);
				expect(tile).not.toBe(TileType3D.WATER);
			}
		});

		it('should place stairsPosition on STAIRS_DOWN tile', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			const { tiles } = result.threlteMap;
			expect(tiles[result.stairsPosition.y][result.stairsPosition.x]).toBe(TileType3D.STAIRS_DOWN);
		});

		it('should place stairs far from playerStart (distance >= width/3)', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `maze-stairs-distance-${i}`;
				const result = generateMaze(seed, 1, GRASS_FOREST);
				const dist =
					Math.abs(result.stairsPosition.x - result.playerStart.x) +
					Math.abs(result.stairsPosition.y - result.playerStart.y);
				const minExpectedDistance = Math.floor(result.threlteMap.width / 3);
				expect(dist).toBeGreaterThanOrEqual(minExpectedDistance);
			}
		});

		it('should place both positions within grid bounds', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `maze-bounds-${i}`;
				const result = generateMaze(seed, 1, GRASS_FOREST);
				const { width, height } = result.threlteMap;

				expect(result.playerStart.x).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.x).toBeLessThan(width);
				expect(result.playerStart.y).toBeGreaterThanOrEqual(0);
				expect(result.playerStart.y).toBeLessThan(height);

				expect(result.stairsPosition.x).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.x).toBeLessThan(width);
				expect(result.stairsPosition.y).toBeGreaterThanOrEqual(0);
				expect(result.stairsPosition.y).toBeLessThan(height);
			}
		});
	});

	describe('border walls', () => {
		it('should have all edge tiles as WALL', () => {
			const result = generateMaze(SEED, 5, GRASS_FOREST);
			const { tiles, width, height } = result.threlteMap;

			for (let x = 0; x < width; x++) {
				expect(tiles[0][x]).toBe(TileType3D.WALL);
				expect(tiles[height - 1][x]).toBe(TileType3D.WALL);
			}
			for (let y = 0; y < height; y++) {
				expect(tiles[y][0]).toBe(TileType3D.WALL);
				expect(tiles[y][width - 1]).toBe(TileType3D.WALL);
			}
		});
	});

	describe('variable sizing', () => {
		it('should produce maze dimensions within GRASS_FOREST range (15-25)', () => {
			for (let i = 0; i < 20; i++) {
				const seed = `maze-size-grass-${i}`;
				const floor = GRASS_FOREST.floorRange[0] + (i % 10);
				const result = generateMaze(seed, floor, GRASS_FOREST);
				const { width, height } = result.threlteMap;

				expect(width).toBeGreaterThanOrEqual(15);
				expect(width).toBeLessThanOrEqual(25);
				expect(height).toBeGreaterThanOrEqual(15);
				expect(height).toBeLessThanOrEqual(25);
			}
		});

		it('should produce maze dimensions within DARK_HAUNTED range (35-50)', () => {
			for (let i = 0; i < 20; i++) {
				const seed = `maze-size-dark-${i}`;
				const floor = DARK_HAUNTED.floorRange[0] + (i % 10);
				const result = generateMaze(seed, floor, DARK_HAUNTED);
				const { width, height } = result.threlteMap;

				expect(width).toBeGreaterThanOrEqual(35);
				expect(width).toBeLessThanOrEqual(50);
				expect(height).toBeGreaterThanOrEqual(35);
				expect(height).toBeLessThanOrEqual(50);
			}
		});

		it('should produce larger mazes for larger biomes', () => {
			const smallResult = generateMaze(SEED, 1, GRASS_FOREST);
			const largeResult = generateMaze(SEED, 41, DARK_HAUNTED);

			expect(largeResult.threlteMap.width).toBeGreaterThan(smallResult.threlteMap.width);
			expect(largeResult.threlteMap.height).toBeGreaterThan(smallResult.threlteMap.height);
		});
	});

	describe('ThrelteMapData integration', () => {
		it('should have mapId = 1000 + floorNumber', () => {
			const result = generateMaze(SEED, 7, GRASS_FOREST);
			expect(result.threlteMap.mapId).toBe(1007);
		});

		it('should have name = Floor N', () => {
			const result = generateMaze(SEED, 7, GRASS_FOREST);
			expect(result.threlteMap.name).toBe('Floor 7');
		});

		it('should have width and height matching tile grid', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			expect(result.threlteMap.tiles.length).toBe(result.threlteMap.height);
			for (const row of result.threlteMap.tiles) {
				expect(row.length).toBe(result.threlteMap.width);
			}
		});

		it('should have battleTileIndices matching TALL_GRASS positions', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			const { tiles, width, battleTileIndices } = result.threlteMap;

			let grassCount = 0;
			for (let row = 0; row < tiles.length; row++) {
				for (let col = 0; col < tiles[row].length; col++) {
					if (tiles[row][col] === TileType3D.TALL_GRASS) {
						expect(battleTileIndices.has(row * width + col)).toBe(true);
						grassCount++;
					}
				}
			}
			expect(battleTileIndices.size).toBe(grassCount);
		});

		it('should include monsters from biome monsterTable', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			const expectedMonsters = GRASS_FOREST.monsterTable.map((m) => m.id);
			expect(result.threlteMap.monsters).toEqual(expectedMonsters);
		});

		it('should include levelRange from biome config', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			expect(result.threlteMap.levelRange).toEqual(GRASS_FOREST.levelRange);
		});
	});

	describe('OpenMap integration', () => {
		it('should have mapId matching threlteMap mapId', () => {
			const result = generateMaze(SEED, 3, GRASS_FOREST);
			expect(result.openMap.mapId).toBe(result.threlteMap.mapId);
		});

		it('should have dimensions matching threlteMap', () => {
			const result = generateMaze(SEED, 1, GRASS_FOREST);
			expect(result.openMap.width).toBe(result.threlteMap.width);
			expect(result.openMap.height).toBe(result.threlteMap.height);
		});
	});

	describe('performance', () => {
		it('should generate a 50x50 maze in under 200ms', () => {
			const start = performance.now();
			generateMaze(SEED, 50, DARK_HAUNTED);
			const elapsed = performance.now() - start;

			expect(elapsed).toBeLessThan(200);
		});
	});
});
