import { deriveSeed } from './prng';
import { TileType3D, type ThrelteMapData } from '../mapping/threlte-maps/types';
import { OpenMap } from '../mapping/maps';
import { Position } from '../mapping/positions';
import type { FloorData } from './floor-generator';
import type { SparseMapData } from '../mapping/sparse-collision';
import { NPC } from '../characters/npc';
import { Script, Dialog, Message, HealAll, OpenShop } from '../scripting/scripts';

const REST_FLOOR_WIDTH = 10;
const REST_FLOOR_HEIGHT = 10;

const REST_SHOP_ITEMS: Record<string, number> = {
	'4': 200,
	'17': 200,
	'33': 600,
	'28': 1500
};

export function generateRestFloor(floor: number, runSeed: string): FloorData {
	deriveSeed(runSeed, floor);
	const width = REST_FLOOR_WIDTH;
	const height = REST_FLOOR_HEIGHT;
	const mapId = 1000 + floor;

	const grid: TileType3D[][] = [];
	for (let y = 0; y < height; y++) {
		const row: TileType3D[] = [];
		for (let x = 0; x < width; x++) {
			if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
				row.push(TileType3D.WALL);
			} else {
				row.push(TileType3D.REST_FLOOR);
			}
		}
		grid.push(row);
	}

	const playerStart = new Position(Math.floor(width / 2), height - 2);

	const stairsPosition = new Position(Math.floor(width / 2), 1);
	grid[stairsPosition.y][stairsPosition.x] = TileType3D.STAIRS_DOWN;

	const healNpc = createHealNpc(floor);
	const shopNpc = createShopNpc(floor);
	const npcs = [healNpc, shopNpc];

	const threlteMap: ThrelteMapData = {
		mapId,
		name: `Rest Floor ${floor}`,
		width,
		height,
		tiles: grid.map((row) => [...row]),
		playerStart,
		jonctions: [],
		npcs,
		items: [],
		monsters: [],
		levelRange: [1, 1],
		battleTileIndices: new Set<number>()
	};

	const collisionIndices: number[] = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (grid[y][x] === TileType3D.WALL) {
				collisionIndices.push(y * width + x);
			}
		}
	}

	const sparseData: SparseMapData = {
		collisionIndices,
		waterIndices: [],
		battleIndices: []
	};

	const openMap = OpenMap.fromSparse(
		mapId,
		'dungeon',
		width,
		height,
		sparseData,
		[],
		playerStart,
		[1, 1],
		[],
		undefined,
		npcs
	);

	return {
		threlteMap,
		openMap,
		playerStart,
		stairsPosition,
		trainerPositions: [],
		itemPositions: [],
		grassPatches: []
	};
}

function createHealNpc(floor: number): NPC {
	const healScript = new Script(
		'onInteract',
		[
			new Dialog([
				new Message('Welcome, weary traveler!'),
				new Message('Would you like me to heal your team?', 'Healer', ['Yes, please', 'No, thanks'])
			]),
			new HealAll(0),
			new Dialog([new Message('Your team is fully healed! Good luck ahead.', 'Healer')])
		],
		undefined,
		true
	);

	return new NPC(
		9000 + floor * 10,
		'Healer',
		3,
		new Position(3, 4),
		'down',
		'FEMALE',
		undefined,
		undefined,
		healScript,
		undefined,
		undefined,
		true
	);
}

function createShopNpc(floor: number): NPC {
	const shopScript = new Script(
		'onInteract',
		[
			new Dialog([
				new Message('Looking for supplies for your journey?', 'Merchant', [
					'Browse shop',
					'No, thanks'
				])
			]),
			new OpenShop(REST_SHOP_ITEMS, 0),
			new Dialog([new Message('Come back anytime!', 'Merchant')])
		],
		undefined,
		true
	);

	return new NPC(
		9001 + floor * 10,
		'Merchant',
		3,
		new Position(6, 4),
		'down',
		'MALE',
		undefined,
		undefined,
		shopScript,
		undefined,
		undefined,
		true
	);
}
