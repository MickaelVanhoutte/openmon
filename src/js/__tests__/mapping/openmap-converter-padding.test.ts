import { describe, it, expect } from 'vitest';
import {
	padMapWithCliffs,
	MAP_PAD_SIZE,
	getOrConvertMap,
	clearConverterCache
} from '../../mapping/threlte-maps/openmap-converter';
import { TileType3D, type ThrelteMapData } from '../../mapping/threlte-maps/types';
import { Jonction } from '../../mapping/collisions';
import { Position } from '../../mapping/positions';
import type { NPC } from '../../characters/npc';
import type { OverworldItem } from '../../items/overworldItem';

function makeTiles(w: number, h: number, fill: TileType3D = TileType3D.GRASS): TileType3D[][] {
	const tiles: TileType3D[][] = [];
	for (let y = 0; y < h; y++) {
		tiles.push(new Array<TileType3D>(w).fill(fill));
	}
	return tiles;
}

function makeMapData(overrides: Partial<ThrelteMapData> = {}): ThrelteMapData {
	const width = overrides.width ?? 10;
	const height = overrides.height ?? 10;
	return {
		mapId: 1,
		name: 'test-map',
		width,
		height,
		tiles: makeTiles(width, height),
		playerStart: new Position(5, 5),
		jonctions: [],
		npcs: [],
		items: [],
		monsters: [1, 2, 3],
		levelRange: [1, 10] as [number, number],
		battleTileIndices: new Set(),
		sound: 'route1.mp3',
		...overrides
	};
}

function makeMockNpc(x: number, y: number): NPC {
	return {
		position: {
			positionOnMap: new Position(x, y),
			targetPosition: new Position(x, y)
		}
	} as unknown as NPC;
}

function makeMockItem(x: number, y: number): OverworldItem {
	return { position: new Position(x, y) } as unknown as OverworldItem;
}

describe('padMapWithCliffs', () => {
	const pad = MAP_PAD_SIZE;

	describe('dimensions', () => {
		it('should expand a 10x10 map to 26x26', () => {
			const result = padMapWithCliffs(makeMapData());
			expect(result.width).toBe(10 + pad * 2);
			expect(result.height).toBe(10 + pad * 2);
		});

		it('should respect a custom padSize', () => {
			const result = padMapWithCliffs(makeMapData(), 4);
			expect(result.width).toBe(10 + 4 * 2);
			expect(result.height).toBe(10 + 4 * 2);
		});
	});

	describe('border tiles', () => {
		it('should fill entire border ring with WALL tiles', () => {
			const result = padMapWithCliffs(makeMapData());
			for (let y = 0; y < result.height; y++) {
				for (let x = 0; x < result.width; x++) {
					const isInBorder =
						y < pad || y >= result.height - pad || x < pad || x >= result.width - pad;
					if (isInBorder) {
						expect(result.tiles[y][x]).toBe(TileType3D.WALL);
					}
				}
			}
		});
	});

	describe('original tiles preserved', () => {
		it('should copy original tiles into the center region', () => {
			const original = makeMapData();
			original.tiles[2][3] = TileType3D.WATER;
			original.tiles[0][0] = TileType3D.TALL_GRASS;
			original.tiles[9][9] = TileType3D.SAND;

			const result = padMapWithCliffs(original);
			expect(result.tiles[2 + pad][3 + pad]).toBe(TileType3D.WATER);
			expect(result.tiles[0 + pad][0 + pad]).toBe(TileType3D.TALL_GRASS);
			expect(result.tiles[9 + pad][9 + pad]).toBe(TileType3D.SAND);
		});
	});

	describe('playerStart offset', () => {
		it('should offset playerStart by padSize', () => {
			const result = padMapWithCliffs(makeMapData({ playerStart: new Position(5, 5) }));
			expect(result.playerStart.x).toBe(5 + pad);
			expect(result.playerStart.y).toBe(5 + pad);
		});
	});

	describe('junction offset', () => {
		it('should offset trigger positions by padSize', () => {
			const junction = new Jonction(
				1,
				2,
				[new Position(0, 10), new Position(0, 11)],
				new Position(20, 5)
			);
			const result = padMapWithCliffs(makeMapData({ jonctions: [junction] }));
			expect(result.jonctions[0].positions[0].x).toBe(0 + pad);
			expect(result.jonctions[0].positions[0].y).toBe(10 + pad);
			expect(result.jonctions[0].positions[1].x).toBe(0 + pad);
			expect(result.jonctions[0].positions[1].y).toBe(11 + pad);
		});

		it('should offset start for overworld destinations (mapIdx < 1000)', () => {
			const junction = new Jonction(1, 2, [new Position(0, 5)], new Position(20, 5));
			const result = padMapWithCliffs(makeMapData({ jonctions: [junction] }));
			expect(result.jonctions[0].start.x).toBe(20 + pad);
			expect(result.jonctions[0].start.y).toBe(5 + pad);
		});

		it('should offset start for dungeon destinations (mapIdx >= 1000) since dungeons are now padded', () => {
			const junction = new Jonction(1, 1000, [new Position(0, 5)], new Position(3, 3));
			const result = padMapWithCliffs(makeMapData({ jonctions: [junction] }));
			expect(result.jonctions[0].start.x).toBe(3 + pad);
			expect(result.jonctions[0].start.y).toBe(3 + pad);
		});

		it('should preserve junction id and mapIdx', () => {
			const junction = new Jonction(42, 7, [new Position(0, 0)], new Position(1, 1));
			const result = padMapWithCliffs(makeMapData({ jonctions: [junction] }));
			expect(result.jonctions[0].id).toBe(42);
			expect(result.jonctions[0].mapIdx).toBe(7);
		});
	});

	describe('NPC offset', () => {
		it('should offset NPC positionOnMap by padSize', () => {
			const npc = makeMockNpc(3, 3);
			const result = padMapWithCliffs(makeMapData({ npcs: [npc] }));
			expect(result.npcs[0].position.positionOnMap.x).toBe(3 + pad);
			expect(result.npcs[0].position.positionOnMap.y).toBe(3 + pad);
		});

		it('should not mutate the original NPC', () => {
			const npc = makeMockNpc(3, 3);
			padMapWithCliffs(makeMapData({ npcs: [npc] }));
			expect(npc.position.positionOnMap.x).toBe(3);
			expect(npc.position.positionOnMap.y).toBe(3);
		});
	});

	describe('item offset', () => {
		it('should offset item position by padSize', () => {
			const item = makeMockItem(7, 7);
			const result = padMapWithCliffs(makeMapData({ items: [item] }));
			expect(result.items[0].position.x).toBe(7 + pad);
			expect(result.items[0].position.y).toBe(7 + pad);
		});

		it('should not mutate the original item', () => {
			const item = makeMockItem(7, 7);
			padMapWithCliffs(makeMapData({ items: [item] }));
			expect(item.position.x).toBe(7);
			expect(item.position.y).toBe(7);
		});
	});

	describe('battleTileIndices recalculation', () => {
		it('should recalculate flat indices with new width', () => {
			const oldWidth = 10;
			const oldIndex = 4 * oldWidth + 3;
			const mapData = makeMapData({ battleTileIndices: new Set([oldIndex]) });
			const result = padMapWithCliffs(mapData);

			const newWidth = oldWidth + pad * 2;
			const expectedIndex = (4 + pad) * newWidth + (3 + pad);
			expect(result.battleTileIndices.has(expectedIndex)).toBe(true);
			expect(result.battleTileIndices.size).toBe(1);
		});

		it('should NOT contain the old index', () => {
			const oldWidth = 10;
			const oldIndex = 4 * oldWidth + 3;
			const mapData = makeMapData({ battleTileIndices: new Set([oldIndex]) });
			const result = padMapWithCliffs(mapData);
			expect(result.battleTileIndices.has(oldIndex)).toBe(false);
		});

		it('should handle multiple battle tiles', () => {
			const oldWidth = 10;
			const indices = new Set([0 * oldWidth + 0, 5 * oldWidth + 5, 9 * oldWidth + 9]);
			const result = padMapWithCliffs(makeMapData({ battleTileIndices: indices }));
			const newWidth = oldWidth + pad * 2;
			expect(result.battleTileIndices.has((0 + pad) * newWidth + (0 + pad))).toBe(true);
			expect(result.battleTileIndices.has((5 + pad) * newWidth + (5 + pad))).toBe(true);
			expect(result.battleTileIndices.has((9 + pad) * newWidth + (9 + pad))).toBe(true);
			expect(result.battleTileIndices.size).toBe(3);
		});
	});

	describe('empty map handling', () => {
		it('should handle map with no junctions, NPCs, items, or battle tiles', () => {
			const result = padMapWithCliffs(makeMapData());
			expect(result.jonctions).toHaveLength(0);
			expect(result.npcs).toHaveLength(0);
			expect(result.items).toHaveLength(0);
			expect(result.battleTileIndices.size).toBe(0);
		});
	});

	describe('metadata preservation', () => {
		it('should preserve mapId', () => {
			const result = padMapWithCliffs(makeMapData({ mapId: 42 }));
			expect(result.mapId).toBe(42);
		});

		it('should preserve name', () => {
			const result = padMapWithCliffs(makeMapData({ name: 'pallet-town' }));
			expect(result.name).toBe('pallet-town');
		});

		it('should preserve sound', () => {
			const result = padMapWithCliffs(makeMapData({ sound: 'route1.mp3' }));
			expect(result.sound).toBe('route1.mp3');
		});

		it('should preserve monsters and levelRange', () => {
			const result = padMapWithCliffs(makeMapData({ monsters: [25, 26], levelRange: [5, 15] }));
			expect(result.monsters).toEqual([25, 26]);
			expect(result.levelRange).toEqual([5, 15]);
		});
	});
});

describe('getOrConvertMap dungeon exclusion', () => {
	it('should NOT pad dungeon maps (mapId >= 1000)', () => {
		clearConverterCache(1000);
		const fakeOpenMap = {
			mapId: 1000,
			width: 10,
			height: 10,
			waterZones: [],
			collisionsZones: [],
			battleZones: [],
			playerInitialPosition: new Position(5, 5),
			jonctions: [],
			npcs: [],
			items: [],
			monsters: [],
			levelRange: [1, 10],
			sound: undefined
		} as any;

		const result = getOrConvertMap(fakeOpenMap);
		expect(result.width).toBe(10);
		expect(result.height).toBe(10);
		clearConverterCache(1000);
	});

	it('should pad overworld maps (mapId < 1000)', () => {
		clearConverterCache(1);
		const fakeOpenMap = {
			mapId: 1,
			width: 10,
			height: 10,
			waterZones: [],
			collisionsZones: [],
			battleZones: [],
			playerInitialPosition: new Position(5, 5),
			jonctions: [],
			npcs: [],
			items: [],
			monsters: [],
			levelRange: [1, 10],
			sound: undefined
		} as any;

		const result = getOrConvertMap(fakeOpenMap);
		expect(result.width).toBe(10 + MAP_PAD_SIZE * 2);
		expect(result.height).toBe(10 + MAP_PAD_SIZE * 2);
		clearConverterCache(1);
	});
});
