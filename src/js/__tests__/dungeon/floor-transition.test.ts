import { describe, it, expect, beforeEach } from 'vitest';
import { DungeonContext } from '../../dungeon/dungeon-context';
import { generateFloor } from '../../dungeon/floor-generator';
import { getBiomeForFloor } from '../../dungeon/biomes';
import { TileType3D } from '../../mapping/threlte-maps/types';
import {
	registerThrelteMap,
	clearThrelteMapCache,
	getThrelteMap
} from '../../mapping/threlte-maps/threlte-map-registry';

describe('Floor Transition System', () => {
	describe('changeDungeonFloor logic', () => {
		let dc: DungeonContext;

		beforeEach(() => {
			dc = new DungeonContext();
			dc.startRun('test-seed');
		});

		it('should increment floor number when advancing', () => {
			expect(dc.currentFloor).toBe(1);
			dc.advanceFloor();
			expect(dc.currentFloor).toBe(2);
		});

		it('should generate and register a new floor map', () => {
			const biome = getBiomeForFloor(dc.currentFloor);
			const floorData = generateFloor(dc.runSeed, dc.currentFloor, biome);

			expect(floorData.threlteMap).toBeDefined();
			expect(floorData.openMap).toBeDefined();
			expect(floorData.playerStart).toBeDefined();
			expect(floorData.threlteMap.mapId).toBe(1000 + dc.currentFloor);

			registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
			expect(getThrelteMap(floorData.threlteMap.mapId)).toBe(floorData.threlteMap);

			clearThrelteMapCache(floorData.threlteMap.mapId);
		});

		it('should clear old floor and register new floor on transition', () => {
			const biome1 = getBiomeForFloor(1);
			const floor1 = generateFloor(dc.runSeed, 1, biome1);
			registerThrelteMap(floor1.threlteMap.mapId, floor1.threlteMap);
			expect(getThrelteMap(1001)).toBeDefined();

			const previousMapId = 1000 + dc.currentFloor;
			dc.advanceFloor();

			const biome2 = getBiomeForFloor(dc.currentFloor);
			const floor2 = generateFloor(dc.runSeed, dc.currentFloor, biome2);

			clearThrelteMapCache(previousMapId);
			registerThrelteMap(floor2.threlteMap.mapId, floor2.threlteMap);

			expect(getThrelteMap(1001)).toBeUndefined();
			expect(getThrelteMap(1002)).toBeDefined();
			expect(dc.currentFloor).toBe(2);

			clearThrelteMapCache(1002);
		});

		it('should produce deterministic floors for same seed and floor number', () => {
			const biome = getBiomeForFloor(1);
			const floor1a = generateFloor('same-seed', 1, biome);
			const floor1b = generateFloor('same-seed', 1, biome);

			expect(floor1a.playerStart.x).toBe(floor1b.playerStart.x);
			expect(floor1a.playerStart.y).toBe(floor1b.playerStart.y);
			expect(floor1a.stairsPosition.x).toBe(floor1b.stairsPosition.x);
			expect(floor1a.stairsPosition.y).toBe(floor1b.stairsPosition.y);
		});
	});

	describe('stairs detection logic', () => {
		it('should detect STAIRS_DOWN tile at player position', () => {
			const tiles: TileType3D[][] = [
				[TileType3D.WALL, TileType3D.WALL, TileType3D.WALL],
				[TileType3D.WALL, TileType3D.STAIRS_DOWN, TileType3D.WALL],
				[TileType3D.WALL, TileType3D.DUNGEON_FLOOR, TileType3D.WALL]
			];

			const px = 1;
			const py = 1;
			const isStairs =
				py >= 0 &&
				py < tiles.length &&
				px >= 0 &&
				px < tiles[py].length &&
				tiles[py][px] === TileType3D.STAIRS_DOWN;

			expect(isStairs).toBe(true);
		});

		it('should not detect stairs on regular floor tile', () => {
			const tiles: TileType3D[][] = [
				[TileType3D.WALL, TileType3D.WALL, TileType3D.WALL],
				[TileType3D.WALL, TileType3D.STAIRS_DOWN, TileType3D.WALL],
				[TileType3D.WALL, TileType3D.DUNGEON_FLOOR, TileType3D.WALL]
			];

			const px = 1;
			const py = 2;
			const isStairs =
				py >= 0 &&
				py < tiles.length &&
				px >= 0 &&
				px < tiles[py].length &&
				tiles[py][px] === TileType3D.STAIRS_DOWN;

			expect(isStairs).toBe(false);
		});

		it('should handle out-of-bounds positions gracefully', () => {
			const tiles: TileType3D[][] = [[TileType3D.DUNGEON_FLOOR, TileType3D.STAIRS_DOWN]];

			const px = 5;
			const py = 0;
			const isStairs =
				py >= 0 &&
				py < tiles.length &&
				px >= 0 &&
				px < tiles[py].length &&
				tiles[py][px] === TileType3D.STAIRS_DOWN;

			expect(isStairs).toBe(false);
		});
	});

	describe('boss floor gate check', () => {
		let dc: DungeonContext;

		beforeEach(() => {
			dc = new DungeonContext();
			dc.startRun('test-seed');
		});

		it('should block stairs on boss floor when boss not defeated', () => {
			dc.currentFloor = 5;
			const isBossFloor = dc.isFloorBoss(dc.currentFloor);
			const bossId = `boss_floor_${dc.currentFloor}`;
			const bossDefeated = dc.defeatedTrainers.has(bossId);

			expect(isBossFloor).toBe(true);
			expect(bossDefeated).toBe(false);

			const shouldBlock = isBossFloor && !bossDefeated;
			expect(shouldBlock).toBe(true);
		});

		it('should allow stairs on boss floor when boss is defeated', () => {
			dc.currentFloor = 5;
			dc.defeatedTrainers.add('boss_floor_5');

			const isBossFloor = dc.isFloorBoss(dc.currentFloor);
			const bossId = `boss_floor_${dc.currentFloor}`;
			const bossDefeated = dc.defeatedTrainers.has(bossId);

			expect(isBossFloor).toBe(true);
			expect(bossDefeated).toBe(true);

			const shouldBlock = isBossFloor && !bossDefeated;
			expect(shouldBlock).toBe(false);
		});

		it('should not block stairs on normal floors', () => {
			dc.currentFloor = 3;

			const isBossFloor = dc.isFloorBoss(dc.currentFloor);
			expect(isBossFloor).toBe(false);

			const shouldBlock = isBossFloor && !dc.defeatedTrainers.has(`boss_floor_${dc.currentFloor}`);
			expect(shouldBlock).toBe(false);
		});

		it('should not block stairs on rest floors', () => {
			dc.currentFloor = 4;

			const isBossFloor = dc.isFloorBoss(dc.currentFloor);
			expect(isBossFloor).toBe(false);

			const shouldBlock = isBossFloor && !dc.defeatedTrainers.has(`boss_floor_${dc.currentFloor}`);
			expect(shouldBlock).toBe(false);
		});
	});
});
