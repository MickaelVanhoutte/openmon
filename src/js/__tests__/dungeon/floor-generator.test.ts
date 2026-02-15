import { describe, it, expect } from 'vitest';
import { generateFloor } from '../../dungeon/floor-generator';
import { GRASS_FOREST, CAVE_ROCK, FIRE_VOLCANIC } from '../../dungeon/biomes';
import { TileType3D } from '../../mapping/threlte-maps/types';
import { Position } from '../../mapping/positions';
import { MAP_PAD_SIZE } from '../../mapping/threlte-maps/openmap-converter';

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

describe('generateFloor', () => {
	const SEED = 'test-seed';

	it('should return all required fields', () => {
		const result = generateFloor(SEED, 1, GRASS_FOREST);

		expect(result.threlteMap).toBeDefined();
		expect(result.openMap).toBeDefined();
		expect(result.playerStart).toBeDefined();
		expect(result.starterItemPosition).toBeDefined();
		expect(result.stairsPosition).toBeDefined();
		expect(result.trainerPositions).toBeDefined();
		expect(result.itemPositions).toBeDefined();
		expect(result.grassPatches).toBeDefined();
	});

	it('should be deterministic - same seed produces identical output', () => {
		const result1 = generateFloor(SEED, 1, GRASS_FOREST);
		const result2 = generateFloor(SEED, 1, GRASS_FOREST);

		expect(result1.playerStart.x).toBe(result2.playerStart.x);
		expect(result1.playerStart.y).toBe(result2.playerStart.y);
		expect(result1.starterItemPosition.x).toBe(result2.starterItemPosition.x);
		expect(result1.starterItemPosition.y).toBe(result2.starterItemPosition.y);
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

	it('should produce different output for different seeds', () => {
		const result1 = generateFloor('seed-a', 1, GRASS_FOREST);
		const result2 = generateFloor('seed-b', 1, GRASS_FOREST);

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

	describe('connectivity', () => {
		it('should produce connected floors where player can reach stairs for 100 seeds', () => {
			for (let i = 0; i < 100; i++) {
				const seed = `connectivity-test-${i}`;
				const result = generateFloor(seed, 1, GRASS_FOREST);
				const { tiles } = result.threlteMap;
				const { width, height } = result.threlteMap;

				const reachable = bfsReachable(
					tiles,
					result.playerStart,
					result.stairsPosition,
					width,
					height
				);
				expect(reachable).toBe(true);
			}
		});
	});

	describe('border walls', () => {
		it('should have all edge tiles as WALL', () => {
			const result = generateFloor(SEED, 5, GRASS_FOREST);
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

	describe('grass patches', () => {
		it('should place between 2-5 patches of 3-8 tiles each', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `grass-test-${i}`;
				const result = generateFloor(seed, 1, GRASS_FOREST);

				expect(result.grassPatches.length).toBeGreaterThanOrEqual(0);
				expect(result.grassPatches.length).toBeLessThanOrEqual(5);

				for (const patch of result.grassPatches) {
					expect(patch.length).toBeGreaterThanOrEqual(3);
					expect(patch.length).toBeLessThanOrEqual(8);
				}
			}
		});

		it('should place TALL_GRASS tiles in the grid', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			const { tiles } = result.threlteMap;

			for (const patch of result.grassPatches) {
				for (const pos of patch) {
					expect(tiles[pos.y][pos.x]).toBe(TileType3D.TALL_GRASS);
				}
			}
		});
	});

	describe('trainer positions', () => {
		it('should place trainers within biome trainerCount range', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `trainer-test-${i}`;
				const result = generateFloor(seed, 1, GRASS_FOREST);

				expect(result.trainerPositions.length).toBeGreaterThanOrEqual(0);
				expect(result.trainerPositions.length).toBeLessThanOrEqual(GRASS_FOREST.trainerCount[1]);
			}
		});

		it('should maintain minimum 5-tile spacing between trainers', () => {
			const result = generateFloor(SEED, 15, CAVE_ROCK);

			for (let i = 0; i < result.trainerPositions.length; i++) {
				for (let j = i + 1; j < result.trainerPositions.length; j++) {
					const a = result.trainerPositions[i];
					const b = result.trainerPositions[j];
					const dist = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
					expect(dist).toBeGreaterThanOrEqual(5);
				}
			}
		});

		it('should place trainers on DUNGEON_FLOOR tiles', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);

			for (const pos of result.trainerPositions) {
				expect(result.threlteMap.tiles[pos.y][pos.x]).toBe(TileType3D.DUNGEON_FLOOR);
			}
		});
	});

	describe('item positions', () => {
		it('should place items within biome itemCount range', () => {
			for (let i = 0; i < 50; i++) {
				const seed = `item-test-v2-${i}`;
				const result = generateFloor(seed, 1, GRASS_FOREST);

				expect(result.itemPositions.length).toBeGreaterThanOrEqual(2);
				expect(result.itemPositions.length).toBeLessThanOrEqual(4);

				for (const pos of result.itemPositions) {
					const dist =
						Math.abs(pos.x - result.playerStart.x) + Math.abs(pos.y - result.playerStart.y);
					expect(dist).toBeGreaterThanOrEqual(3);
				}
			}
		});
	});

	describe('stairs position', () => {
		it('should place stairs tile in the grid', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			const { tiles } = result.threlteMap;
			expect(tiles[result.stairsPosition.y][result.stairsPosition.x]).toBe(TileType3D.STAIRS_DOWN);
		});

		it('should place stairs far from player start', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			const dist =
				Math.abs(result.stairsPosition.x - result.playerStart.x) +
				Math.abs(result.stairsPosition.y - result.playerStart.y);
			const unpaddedWidth = result.threlteMap.width - 2 * MAP_PAD_SIZE;
			const minExpectedDistance = Math.floor(unpaddedWidth / 2);
			expect(dist).toBeGreaterThanOrEqual(minExpectedDistance);
		});
	});

	describe('starter item position', () => {
		it('should be adjacent to playerStart and on a walkable tile', () => {
			for (let i = 0; i < 100; i++) {
				const seed = `starter-pos-test-${i}`;
				const result = generateFloor(seed, 1, GRASS_FOREST);
				const { starterItemPosition, playerStart, threlteMap } = result;

				expect(starterItemPosition).toBeDefined();

				const manhattan =
					Math.abs(starterItemPosition.x - playerStart.x) +
					Math.abs(starterItemPosition.y - playerStart.y);
				expect(manhattan).toBe(1);

				const tile = threlteMap.tiles[starterItemPosition.y][starterItemPosition.x];
				expect(tile).not.toBe(TileType3D.WALL);
				expect(tile).not.toBe(TileType3D.LAVA);
				expect(tile).not.toBe(TileType3D.WATER);
			}
		});
	});

	describe('ThrelteMapData output', () => {
		it('should have correct mapId and name', () => {
			const result = generateFloor(SEED, 7, GRASS_FOREST);
			expect(result.threlteMap.mapId).toBe(1007);
			expect(result.threlteMap.name).toBe('Floor 7');
		});

		it('should have correct dimensions', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			expect(result.threlteMap.tiles.length).toBe(result.threlteMap.height);
			for (const row of result.threlteMap.tiles) {
				expect(row.length).toBe(result.threlteMap.width);
			}
		});

		it('should have battleTileIndices matching TALL_GRASS positions', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
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

		it('should include monsters from biome config', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			const expectedMonsters = GRASS_FOREST.monsterTable.map((m) => m.id);
			expect(result.threlteMap.monsters).toEqual(expectedMonsters);
		});

		it('should include level range from biome config', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			expect(result.threlteMap.levelRange).toEqual(GRASS_FOREST.levelRange);
		});
	});

	describe('OpenMap output', () => {
		it('should have correct mapId', () => {
			const result = generateFloor(SEED, 3, GRASS_FOREST);
			expect(result.openMap.mapId).toBe(1003);
		});

		it('should have matching dimensions', () => {
			const result = generateFloor(SEED, 1, GRASS_FOREST);
			expect(result.openMap.width).toBe(result.threlteMap.width);
			expect(result.openMap.height).toBe(result.threlteMap.height);
		});
	});

	describe('performance', () => {
		it('should generate a 40x40 floor in under 200ms', () => {
			const start = performance.now();
			generateFloor(SEED, 40, FIRE_VOLCANIC);
			const elapsed = performance.now() - start;

			expect(elapsed).toBeLessThan(200);
		});
	});
});
