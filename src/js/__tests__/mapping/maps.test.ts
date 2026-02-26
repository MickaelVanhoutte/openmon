import { describe, it, expect } from 'vitest';
import { OpenMap, MapSave } from '../../mapping/maps';
import { Jonction } from '../../mapping/collisions';
import { Position } from '../../mapping/positions';

function createSimpleMap(overrides: Partial<{
	width: number;
	height: number;
	collisions: number[];
	battles: number[];
	water: number[];
	monsters: number[];
	jonctions: Jonction[];
}> = {}): OpenMap {
	const width = overrides.width ?? 5;
	const height = overrides.height ?? 5;
	const tileId = 4295;
	const battleTileId = 2239;

	// Build a simple tile array
	const collisions = overrides.collisions ?? [];
	const battles = overrides.battles ?? [];
	const water = overrides.water ?? [];

	return new OpenMap(
		1,
		'test-bg',
		width,
		height,
		collisions,
		water,
		battles,
		overrides.monsters ?? [1, 4, 7],
		new Position(2, 2),
		[5, 15],
		overrides.jonctions ?? [],
		undefined,
		battleTileId,
		tileId,
		undefined,
		[],
		[],
		undefined,
		[]
	);
}

describe('MapSave', () => {
	it('stores mapId and pickedItems', () => {
		const save = new MapSave(3, [1, 2, 3]);
		expect(save.mapId).toBe(3);
		expect(save.pickedItems).toEqual([1, 2, 3]);
	});

	it('defaults pickedItems to empty', () => {
		const save = new MapSave(0);
		expect(save.pickedItems).toEqual([]);
	});
});

describe('OpenMap', () => {
	describe('constructor', () => {
		it('creates a map with basic properties', () => {
			const map = createSimpleMap();
			expect(map.mapId).toBe(1);
			expect(map.width).toBe(5);
			expect(map.height).toBe(5);
			expect(map.monsters).toEqual([1, 4, 7]);
		});
	});

	describe('empty', () => {
		it('creates a minimal 1x1 stub map', () => {
			const map = OpenMap.empty();
			expect(map.mapId).toBe(-1);
			expect(map.width).toBe(1);
			expect(map.height).toBe(1);
		});
	});

	describe('fromSparse', () => {
		it('creates a map from sparse collision data', () => {
			const sparseData = {
				collisionIndices: [0, 1, 2],
				waterIndices: [10],
				battleIndices: [15, 16]
			};
			const map = OpenMap.fromSparse(
				1, 'test-bg', 5, 5, sparseData, [1, 2, 3]
			);
			expect(map.collisionsZones).toHaveLength(3);
			expect(map.waterZones).toHaveLength(1);
			expect(map.battleZones).toHaveLength(2);
		});
	});

	describe('randomMonster', () => {
		it('returns a monster id from the list', () => {
			const map = createSimpleMap({ monsters: [1, 4, 7] });
			const result = map.randomMonster();
			expect([1, 4, 7]).toContain(result.id);
		});

		it('returns a level within the range', () => {
			const map = createSimpleMap();
			const result = map.randomMonster();
			expect(result.level).toBeGreaterThanOrEqual(5);
			expect(result.level).toBeLessThanOrEqual(15);
		});
	});

	describe('hasBattleZoneAt', () => {
		it('returns true for battle tile positions', () => {
			const tileId = 2239;
			const battles = new Array(25).fill(0);
			battles[12] = tileId; // position (2,2) in 5-wide map
			const map = createSimpleMap({ battles });
			expect(map.hasBattleZoneAt(new Position(2, 2))).toBe(true);
		});

		it('returns false for non-battle positions', () => {
			const map = createSimpleMap();
			expect(map.hasBattleZoneAt(new Position(0, 0))).toBe(false);
		});
	});

	describe('hasCollisionAt', () => {
		it('returns true for collision tile positions', () => {
			const tileId = 4295;
			const collisions = new Array(25).fill(0);
			collisions[6] = tileId; // position (1,1) in 5-wide map
			const map = createSimpleMap({ collisions });
			expect(map.hasCollisionAt(new Position(1, 1))).toBe(true);
		});

		it('returns false for open positions', () => {
			const map = createSimpleMap();
			expect(map.hasCollisionAt(new Position(2, 2))).toBe(false);
		});
	});

	describe('hasBoundaryAt', () => {
		it('returns true at out-of-bounds negative positions', () => {
			const map = createSimpleMap();
			expect(map.hasBoundaryAt(new Position(-1, 0))).toBe(true);
			expect(map.hasBoundaryAt(new Position(0, -1))).toBe(true);
		});

		it('returns true beyond map width/height', () => {
			const map = createSimpleMap({ width: 5, height: 5 });
			expect(map.hasBoundaryAt(new Position(5, 0))).toBe(true);
			expect(map.hasBoundaryAt(new Position(0, 5))).toBe(true);
		});

		it('returns false for valid open positions', () => {
			const map = createSimpleMap();
			expect(map.hasBoundaryAt(new Position(2, 2))).toBe(false);
		});
	});

	describe('jonctionAt', () => {
		it('finds junction at matching position', () => {
			const jonction = new Jonction(1, 2, [new Position(3, 0), new Position(4, 0)], new Position(5, 5));
			const map = createSimpleMap({ jonctions: [jonction] });
			expect(map.jonctionAt(new Position(3, 0))).toBe(jonction);
			expect(map.jonctionAt(new Position(4, 0))).toBe(jonction);
		});

		it('returns undefined when no junction at position', () => {
			const map = createSimpleMap();
			expect(map.jonctionAt(new Position(0, 0))).toBeUndefined();
		});
	});

	describe('npcAt', () => {
		it('returns false when no NPCs', () => {
			const map = createSimpleMap();
			expect(map.npcAt(new Position(0, 0))).toBe(false);
		});
	});

	describe('itemAt', () => {
		it('returns undefined when no items', () => {
			const map = createSimpleMap();
			expect(map.itemAt(new Position(0, 0))).toBeUndefined();
		});
	});

	describe('elementInFront', () => {
		it('checks position one tile in given direction', () => {
			const map = createSimpleMap();
			// No NPCs or items, should return undefined
			expect(map.elementInFront(new Position(2, 2), 'up')).toBeUndefined();
			expect(map.elementInFront(new Position(2, 2), 'down')).toBeUndefined();
			expect(map.elementInFront(new Position(2, 2), 'left')).toBeUndefined();
			expect(map.elementInFront(new Position(2, 2), 'right')).toBeUndefined();
		});
	});

	describe('elementBehindCounter', () => {
		it('checks position two tiles away', () => {
			const map = createSimpleMap();
			expect(map.elementBehindCounter(new Position(2, 2), 'up')).toBeUndefined();
		});
	});

	describe('removeCollisionAt', () => {
		it('removes collision at a flat index', () => {
			const tileId = 4295;
			const collisions = new Array(25).fill(0);
			collisions[6] = tileId;
			const map = createSimpleMap({ collisions });
			expect(map.hasCollisionAt(new Position(1, 1))).toBe(true);
			map.removeCollisionAt(6);
			expect(map.hasCollisionAt(new Position(1, 1))).toBe(false);
		});
	});

	describe('fromInstance', () => {
		it('creates a copy with same mapId', () => {
			const original = createSimpleMap();
			const copy = OpenMap.fromInstance(original);
			expect(copy.mapId).toBe(original.mapId);
			expect(copy.width).toBe(original.width);
		});

		it('overrides player position when provided', () => {
			const original = createSimpleMap();
			const copy = OpenMap.fromInstance(original, new Position(4, 4));
			expect(copy.playerInitialPosition.x).toBe(4);
			expect(copy.playerInitialPosition.y).toBe(4);
		});
	});

	describe('initBoundaries', () => {
		it('creates boundaries from collision array', () => {
			const map = createSimpleMap();
			const collisions = [0, 4295, 0, 4295, 0, 0, 0, 0, 0, 0];
			const boundaries = map.initBoundaries(collisions, 5, 4295);
			expect(boundaries).toHaveLength(2);
			expect(boundaries[0].position.x).toBe(1);
			expect(boundaries[0].position.y).toBe(0);
		});
	});

	describe('initBattlesZones', () => {
		it('creates battle zones from battle array', () => {
			const map = createSimpleMap();
			const battles = [0, 0, 2239, 0, 0, 2239, 0, 0, 0, 0];
			const zones = map.initBattlesZones(battles, 5, 2239);
			expect(zones).toHaveLength(2);
		});
	});
});
