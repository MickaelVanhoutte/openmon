import { describe, it, expect } from 'vitest';
import { demoTown } from '../mapping/threlte-maps/demo-town';
import { demoRoute } from '../mapping/threlte-maps/demo-route';
import {
	TileType3D,
	TILE_WALKABLE,
	TILE_HEIGHTS,
	TILE_COLORS
} from '../mapping/threlte-maps/types';
import {
	threlteMapRegistry,
	getThrelteMap,
	registerThrelteMap,
	clearThrelteMapCache
} from '../mapping/threlte-maps/threlte-map-registry';

describe('threlte map data', () => {
	describe('type lookup maps', () => {
		it('should have an entry for every TileType3D value', () => {
			const allTypes = [
				TileType3D.GRASS,
				TileType3D.PATH,
				TileType3D.WATER,
				TileType3D.SAND,
				TileType3D.TREE_GROUND,
				TileType3D.FLOWER_GROUND,
				TileType3D.TALL_GRASS,
				TileType3D.BUILDING_FLOOR
			];
			for (const t of allTypes) {
				expect(TILE_HEIGHTS.has(t)).toBe(true);
				expect(TILE_WALKABLE.has(t)).toBe(true);
				expect(TILE_COLORS.has(t)).toBe(true);
			}
		});

		it('WATER and TREE_GROUND and BUILDING_FLOOR should not be walkable', () => {
			expect(TILE_WALKABLE.get(TileType3D.WATER)).toBe(false);
			expect(TILE_WALKABLE.get(TileType3D.TREE_GROUND)).toBe(false);
			expect(TILE_WALKABLE.get(TileType3D.BUILDING_FLOOR)).toBe(false);
		});

		it('GRASS, PATH, TALL_GRASS should be walkable', () => {
			expect(TILE_WALKABLE.get(TileType3D.GRASS)).toBe(true);
			expect(TILE_WALKABLE.get(TileType3D.PATH)).toBe(true);
			expect(TILE_WALKABLE.get(TileType3D.TALL_GRASS)).toBe(true);
		});
	});

	describe('demo-town', () => {
		it('should have correct dimensions', () => {
			expect(demoTown.width).toBe(30);
			expect(demoTown.height).toBe(30);
			expect(demoTown.tiles.length).toBe(demoTown.height);
			for (const row of demoTown.tiles) {
				expect(row.length).toBe(demoTown.width);
			}
		});

		it('should have mapId 100', () => {
			expect(demoTown.mapId).toBe(100);
		});

		it('should have player start on a walkable tile', () => {
			const { x, y } = demoTown.playerStart;
			const tile = demoTown.tiles[y][x];
			expect(TILE_WALKABLE.get(tile)).toBe(true);
		});

		it('should have player start within map bounds', () => {
			expect(demoTown.playerStart.x).toBeGreaterThanOrEqual(0);
			expect(demoTown.playerStart.x).toBeLessThan(demoTown.width);
			expect(demoTown.playerStart.y).toBeGreaterThanOrEqual(0);
			expect(demoTown.playerStart.y).toBeLessThan(demoTown.height);
		});

		it('should have jonction positions within map bounds', () => {
			for (const jonction of demoTown.jonctions) {
				for (const pos of jonction.positions) {
					expect(pos.x).toBeGreaterThanOrEqual(0);
					expect(pos.x).toBeLessThan(demoTown.width);
					expect(pos.y).toBeGreaterThanOrEqual(0);
					expect(pos.y).toBeLessThan(demoTown.height);
				}
			}
		});

		it('should have battleTileIndices matching TALL_GRASS tiles', () => {
			const expectedIndices = new Set<number>();
			for (let row = 0; row < demoTown.height; row++) {
				for (let col = 0; col < demoTown.width; col++) {
					if (demoTown.tiles[row][col] === TileType3D.TALL_GRASS) {
						expectedIndices.add(row * demoTown.width + col);
					}
				}
			}
			expect(demoTown.battleTileIndices.size).toBe(expectedIndices.size);
			for (const idx of expectedIndices) {
				expect(demoTown.battleTileIndices.has(idx)).toBe(true);
			}
		});

		it('should have NPCs at valid positions', () => {
			expect(demoTown.npcs.length).toBe(2);
		});

		it('should have monsters and level range', () => {
			expect(demoTown.monsters).toEqual([1, 4, 7]);
			expect(demoTown.levelRange).toEqual([3, 6]);
		});
	});

	describe('demo-route', () => {
		it('should have correct dimensions', () => {
			expect(demoRoute.width).toBe(20);
			expect(demoRoute.height).toBe(40);
			expect(demoRoute.tiles.length).toBe(demoRoute.height);
			for (const row of demoRoute.tiles) {
				expect(row.length).toBe(demoRoute.width);
			}
		});

		it('should have mapId 101', () => {
			expect(demoRoute.mapId).toBe(101);
		});

		it('should have player start on a walkable tile', () => {
			const { x, y } = demoRoute.playerStart;
			const tile = demoRoute.tiles[y][x];
			expect(TILE_WALKABLE.get(tile)).toBe(true);
		});

		it('should have player start within map bounds', () => {
			expect(demoRoute.playerStart.x).toBeGreaterThanOrEqual(0);
			expect(demoRoute.playerStart.x).toBeLessThan(demoRoute.width);
			expect(demoRoute.playerStart.y).toBeGreaterThanOrEqual(0);
			expect(demoRoute.playerStart.y).toBeLessThan(demoRoute.height);
		});

		it('should have jonction positions within map bounds', () => {
			for (const jonction of demoRoute.jonctions) {
				for (const pos of jonction.positions) {
					expect(pos.x).toBeGreaterThanOrEqual(0);
					expect(pos.x).toBeLessThan(demoRoute.width);
					expect(pos.y).toBeGreaterThanOrEqual(0);
					expect(pos.y).toBeLessThan(demoRoute.height);
				}
			}
		});

		it('should have battleTileIndices matching TALL_GRASS tiles', () => {
			const expectedIndices = new Set<number>();
			for (let row = 0; row < demoRoute.height; row++) {
				for (let col = 0; col < demoRoute.width; col++) {
					if (demoRoute.tiles[row][col] === TileType3D.TALL_GRASS) {
						expectedIndices.add(row * demoRoute.width + col);
					}
				}
			}
			expect(demoRoute.battleTileIndices.size).toBe(expectedIndices.size);
			for (const idx of expectedIndices) {
				expect(demoRoute.battleTileIndices.has(idx)).toBe(true);
			}
		});

		it('should have monsters and level range', () => {
			expect(demoRoute.monsters).toEqual([10, 13, 16]);
			expect(demoRoute.levelRange).toEqual([2, 5]);
		});
	});

	describe('bidirectional junction integrity', () => {
		it('town jonction should reference route mapId', () => {
			const townJonction = demoTown.jonctions[0];
			expect(townJonction.mapIdx).toBe(demoRoute.mapId);
		});

		it('route jonction should reference town mapId', () => {
			const routeJonction = demoRoute.jonctions[0];
			expect(routeJonction.mapIdx).toBe(demoTown.mapId);
		});

		it('town jonction start should be within route bounds', () => {
			const townJonction = demoTown.jonctions[0];
			expect(townJonction.start.x).toBeGreaterThanOrEqual(0);
			expect(townJonction.start.x).toBeLessThan(demoRoute.width);
			expect(townJonction.start.y).toBeGreaterThanOrEqual(0);
			expect(townJonction.start.y).toBeLessThan(demoRoute.height);
		});

		it('route jonction start should be within town bounds', () => {
			const routeJonction = demoRoute.jonctions[0];
			expect(routeJonction.start.x).toBeGreaterThanOrEqual(0);
			expect(routeJonction.start.x).toBeLessThan(demoTown.width);
			expect(routeJonction.start.y).toBeGreaterThanOrEqual(0);
			expect(routeJonction.start.y).toBeLessThan(demoTown.height);
		});

		it('town jonction start should land on a walkable tile in route', () => {
			const townJonction = demoTown.jonctions[0];
			const tile = demoRoute.tiles[townJonction.start.y][townJonction.start.x];
			expect(TILE_WALKABLE.get(tile)).toBe(true);
		});

		it('route jonction start should land on a walkable tile in town', () => {
			const routeJonction = demoRoute.jonctions[0];
			const tile = demoTown.tiles[routeJonction.start.y][routeJonction.start.x];
			expect(TILE_WALKABLE.get(tile)).toBe(true);
		});
	});

	describe('threlte map registry', () => {
		it('should contain both demo maps', () => {
			expect(threlteMapRegistry.size).toBe(2);
			expect(threlteMapRegistry.has(100)).toBe(true);
			expect(threlteMapRegistry.has(101)).toBe(true);
		});

		it('getThrelteMap should return demo-town for mapId 100', () => {
			const map = getThrelteMap(100);
			expect(map).toBeDefined();
			expect(map?.name).toBe('Demo Town');
		});

		it('getThrelteMap should return demo-route for mapId 101', () => {
			const map = getThrelteMap(101);
			expect(map).toBeDefined();
			expect(map?.name).toBe('Demo Route');
		});

		it('getThrelteMap should return undefined for unknown mapId', () => {
			expect(getThrelteMap(999)).toBeUndefined();
		});

		it('registerThrelteMap should make the map available via getThrelteMap', () => {
			const fakeMap = {
				mapId: 1001,
				name: 'Floor 1',
				width: 5,
				height: 5,
				tiles: [],
				playerStart: { x: 1, y: 1 },
				jonctions: [],
				npcs: [],
				items: [],
				monsters: [],
				levelRange: [3, 6] as [number, number],
				battleTileIndices: new Set<number>()
			};
			registerThrelteMap(1001, fakeMap);
			expect(getThrelteMap(1001)).toBe(fakeMap);
			clearThrelteMapCache(1001);
		});

		it('clearThrelteMapCache should remove a previously registered map', () => {
			const fakeMap = {
				mapId: 1002,
				name: 'Floor 2',
				width: 5,
				height: 5,
				tiles: [],
				playerStart: { x: 1, y: 1 },
				jonctions: [],
				npcs: [],
				items: [],
				monsters: [],
				levelRange: [3, 6] as [number, number],
				battleTileIndices: new Set<number>()
			};
			registerThrelteMap(1002, fakeMap);
			expect(getThrelteMap(1002)).toBe(fakeMap);
			clearThrelteMapCache(1002);
			expect(getThrelteMap(1002)).toBeUndefined();
		});
	});
});
