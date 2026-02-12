import { describe, it, expect } from 'vitest';
import { generateRestFloor } from '../../dungeon/special-floors';
import { TileType3D } from '../../mapping/threlte-maps/types';

describe('generateRestFloor', () => {
	const SEED = 'test-seed';
	const FLOOR_4 = 4;
	const FLOOR_9 = 9;

	it('should return all required FloorData fields', () => {
		const result = generateRestFloor(FLOOR_4, SEED);

		expect(result.threlteMap).toBeDefined();
		expect(result.openMap).toBeDefined();
		expect(result.playerStart).toBeDefined();
		expect(result.stairsPosition).toBeDefined();
		expect(result.trainerPositions).toBeDefined();
		expect(result.itemPositions).toBeDefined();
		expect(result.grassPatches).toBeDefined();
	});

	describe('room dimensions', () => {
		it('should create a 10x10 grid', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			const { tiles, width, height } = result.threlteMap;

			expect(width).toBe(10);
			expect(height).toBe(10);
			expect(tiles.length).toBe(10);
			for (const row of tiles) {
				expect(row.length).toBe(10);
			}
		});

		it('should have matching OpenMap dimensions', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.openMap.width).toBe(10);
			expect(result.openMap.height).toBe(10);
		});
	});

	describe('tile types', () => {
		it('should have WALL tiles on all borders', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
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

		it('should have REST_FLOOR tiles for interior (except stairs)', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			const { tiles, width, height } = result.threlteMap;

			for (let y = 1; y < height - 1; y++) {
				for (let x = 1; x < width - 1; x++) {
					const tile = tiles[y][x];
					expect(tile === TileType3D.REST_FLOOR || tile === TileType3D.STAIRS_DOWN).toBe(true);
				}
			}
		});

		it('should have STAIRS_DOWN tile at stairs position', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			const { tiles } = result.threlteMap;
			expect(tiles[result.stairsPosition.y][result.stairsPosition.x]).toBe(TileType3D.STAIRS_DOWN);
		});
	});

	describe('player start position', () => {
		it('should place player at bottom center', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.playerStart.x).toBe(5);
			expect(result.playerStart.y).toBe(8);
		});

		it('should be on a walkable tile', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			const tile = result.threlteMap.tiles[result.playerStart.y][result.playerStart.x];
			expect(tile).toBe(TileType3D.REST_FLOOR);
		});
	});

	describe('stairs position', () => {
		it('should place stairs at top center', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.stairsPosition.x).toBe(5);
			expect(result.stairsPosition.y).toBe(1);
		});
	});

	describe('NPC placement', () => {
		it('should have exactly 2 NPCs (healer and merchant)', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.threlteMap.npcs.length).toBe(2);
		});

		it('should have a healer NPC with heal script', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			const healer = result.threlteMap.npcs.find((npc) => npc.name === 'Healer');
			expect(healer).toBeDefined();
			expect(healer!.mainScript).toBeDefined();
			expect(healer!.behindCounter).toBe(true);
		});

		it('should have a merchant NPC with shop script', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			const merchant = result.threlteMap.npcs.find((npc) => npc.name === 'Merchant');
			expect(merchant).toBeDefined();
			expect(merchant!.mainScript).toBeDefined();
			expect(merchant!.behindCounter).toBe(true);
		});

		it('should place NPCs on walkable tiles', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			for (const npc of result.threlteMap.npcs) {
				const pos = npc.position.positionOnMap;
				const tile = result.threlteMap.tiles[pos.y][pos.x];
				expect(tile).toBe(TileType3D.REST_FLOOR);
			}
		});

		it('should have NPCs in the OpenMap as well', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.openMap.npcs.length).toBe(2);
		});
	});

	describe('no encounters or trainers', () => {
		it('should have empty trainerPositions', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.trainerPositions).toEqual([]);
		});

		it('should have empty itemPositions', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.itemPositions).toEqual([]);
		});

		it('should have empty grassPatches', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.grassPatches).toEqual([]);
		});

		it('should have empty battleTileIndices', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.threlteMap.battleTileIndices.size).toBe(0);
		});

		it('should have empty monsters list', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.threlteMap.monsters).toEqual([]);
		});
	});

	describe('map metadata', () => {
		it('should have correct mapId (1000 + floor)', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.threlteMap.mapId).toBe(1004);
			expect(result.openMap.mapId).toBe(1004);
		});

		it('should have correct name', () => {
			const result = generateRestFloor(FLOOR_4, SEED);
			expect(result.threlteMap.name).toBe('Rest Floor 4');
		});

		it('should use correct mapId for different floors', () => {
			const result = generateRestFloor(FLOOR_9, SEED);
			expect(result.threlteMap.mapId).toBe(1009);
		});
	});

	describe('determinism', () => {
		it('should produce identical output for same seed and floor', () => {
			const result1 = generateRestFloor(FLOOR_4, SEED);
			const result2 = generateRestFloor(FLOOR_4, SEED);

			expect(result1.playerStart.x).toBe(result2.playerStart.x);
			expect(result1.playerStart.y).toBe(result2.playerStart.y);
			expect(result1.stairsPosition.x).toBe(result2.stairsPosition.x);
			expect(result1.stairsPosition.y).toBe(result2.stairsPosition.y);
			expect(result1.threlteMap.npcs.length).toBe(result2.threlteMap.npcs.length);
		});
	});

	describe('NPC unique IDs per floor', () => {
		it('should generate different NPC IDs for different floors', () => {
			const result4 = generateRestFloor(FLOOR_4, SEED);
			const result9 = generateRestFloor(FLOOR_9, SEED);

			const ids4 = result4.threlteMap.npcs.map((n) => n.id);
			const ids9 = result9.threlteMap.npcs.map((n) => n.id);

			for (const id of ids4) {
				expect(ids9).not.toContain(id);
			}
		});
	});
});
