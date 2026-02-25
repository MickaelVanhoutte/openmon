import { SeededRNG, deriveSeed } from './prng';
import { TileType3D, type ThrelteMapData } from '../mapping/threlte-maps/types';
import { OpenMap } from '../mapping/maps';
import { Position } from '../mapping/positions';
import type { FloorData } from './floor-generator';
import type { SparseMapData } from '../mapping/sparse-collision';
import { NPC } from '../characters/npc';
import { Script, Dialog, Message, HealAll, OpenShop, OpenMoveRelearner } from '../scripting/scripts';
import { createBossTrainer } from './trainer-factory';
import { getBiomeForFloor } from './biomes';
import { OverworldItem } from '../items/overworldItem';

const REST_FLOOR_WIDTH = 10;
const REST_FLOOR_HEIGHT = 10;

const REST_SHOP_ITEMS: Record<string, number> = {
	'4': 200,
	'17': 200,
	'33': 600,
	'28': 1500
};

// Competitive held items that rotate across rest floor shops (one per shop, each shop different)
const COMPETITIVE_HELD_ITEMS: Array<{ id: string; price: number }> = [
	{ id: '4001', price: 3000 }, // Choice Band
	{ id: '4002', price: 3000 }, // Choice Specs
	{ id: '4003', price: 3000 }, // Choice Scarf
	{ id: '4004', price: 3500 }, // Life Orb
	{ id: '4005', price: 2000 }, // Expert Belt
	{ id: '4006', price: 2500 }, // Leftovers
	{ id: '4007', price: 2000 }, // Focus Sash
	{ id: '4008', price: 3000 }, // Assault Vest
	{ id: '4023', price: 2500 }, // Rocky Helmet
	{ id: '4024', price: 2000 }, // Black Sludge
	{ id: '4025', price: 4000 }, // Weakness Policy
	{ id: '4026', price: 2000 }, // Flame Orb
	{ id: '4027', price: 2000 }, // Toxic Orb
	{ id: '4028', price: 2500 }  // Heavy-Duty Boots
];

const NARRATIVE_NOTES: Record<number, string> = {
	4: 'The Champion fell silently. No one witnessed it. That was the point.',
	9: "Sealed orders from the League: 'Dungeon access restricted until further notice. By order of V.'",
	14: 'Research log: The artifact resonates with Pokemon energy. It could amplify — or sever — the bond.',
	19: "V's journal: 'The Champion trusted me. That made it easy. I almost felt guilty. Almost.'",
	24: "League memo: 'The restructuring is proceeding as planned. The old Champion is no longer a concern.'",
	29: 'The artifact was never meant to be wielded by a single trainer. The ancients sealed it for a reason.',
	34: "V's journal: 'I can feel it calling from below. Once I have it, no trainer will ever control a Pokemon by force again.'",
	39: "Final entry: 'If anyone reads this, I failed to stop V. The Champion — if you survived — please.'"
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
	const moveTutorNpc = createMoveTutorNpc(floor);
	const npcs = [healNpc, shopNpc, moveTutorNpc];

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

	if (NARRATIVE_NOTES[floor]) {
		const notePosition = new Position(7, 5);
		const noteItem = new OverworldItem(
			'Note',
			true,
			notePosition,
			'src/assets/menus/pokeball.png',
			undefined,
			[new Script('onInteract', [new Dialog([new Message(NARRATIVE_NOTES[floor], 'System')])])]
		);
		openMap.items.push(noteItem);
		threlteMap.items.push(noteItem);
	}

	return {
		threlteMap,
		openMap,
		playerStart,
		starterItemPosition: new Position(0, 0),
		stairsPosition,
		trainerPositions: [],
		itemPositions: [],
		grassPatches: []
	};
}

const BOSS_FLOOR_WIDTH = 15;
const BOSS_FLOOR_HEIGHT = 15;

export function generateBossFloor(floor: number, runSeed: string): FloorData {
	const floorSeed = deriveSeed(runSeed, floor);
	const rng = new SeededRNG(floorSeed);
	const width = BOSS_FLOOR_WIDTH;
	const height = BOSS_FLOOR_HEIGHT;
	const mapId = 1000 + floor;

	const grid: TileType3D[][] = [];
	for (let y = 0; y < height; y++) {
		const row: TileType3D[] = [];
		for (let x = 0; x < width; x++) {
			if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
				row.push(TileType3D.BOSS_GATE);
			} else {
				row.push(TileType3D.DUNGEON_FLOOR);
			}
		}
		grid.push(row);
	}

	const playerStart = new Position(Math.floor(width / 2), height - 2);

	const stairsPosition = new Position(Math.floor(width / 2), 1);
	grid[stairsPosition.y][stairsPosition.x] = TileType3D.STAIRS_DOWN;

	const biome = getBiomeForFloor(floor);
	const bossPosition = new Position(Math.floor(width / 2), Math.floor(height / 2));
	const bossNpc = createBossTrainer(bossPosition, floor, biome, rng);

	const threlteMap: ThrelteMapData = {
		mapId,
		name: `Boss Floor ${floor}`,
		width,
		height,
		tiles: grid.map((row) => [...row]),
		playerStart,
		jonctions: [],
		npcs: [bossNpc],
		items: [],
		monsters: [],
		levelRange: biome.levelRange,
		battleTileIndices: new Set<number>()
	};

	const collisionIndices: number[] = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (grid[y][x] === TileType3D.BOSS_GATE) {
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
		biome.levelRange,
		[],
		undefined,
		[bossNpc]
	);

	return {
		threlteMap,
		openMap,
		playerStart,
		starterItemPosition: new Position(0, 0),
		stairsPosition,
		trainerPositions: [bossPosition],
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
	// Each rest floor gets a different competitive held item, cycling through the list
	const restFloorIndex = Math.floor(floor / 5); // floor 4 -> 0, floor 9 -> 1, floor 14 -> 2, etc.
	const heldItem = COMPETITIVE_HELD_ITEMS[restFloorIndex % COMPETITIVE_HELD_ITEMS.length];
	const shopItems: Record<string, number> = {
		...REST_SHOP_ITEMS,
		[heldItem.id]: heldItem.price
	};

	const shopScript = new Script(
		'onInteract',
		[
			new Dialog([
				new Message('Looking for supplies for your journey?', 'Merchant', [
					'Browse shop',
					'No, thanks'
				])
			]),
			new OpenShop(shopItems, 0),
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

function createMoveTutorNpc(floor: number): NPC {
	const tutorScript = new Script(
		'onInteract',
		[
			new Dialog([
				new Message(
					'I can help your Pokemon remember forgotten moves or learn new techniques!',
					'Move Tutor',
					['Teach a move', 'No, thanks']
				)
			]),
			new OpenMoveRelearner(0),
			new Dialog([new Message('Use those moves wisely!', 'Move Tutor')]),
			new Dialog([new Message('Come back anytime you need!', 'Move Tutor')], 1)
		],
		undefined,
		true
	);

	return new NPC(
		9002 + floor * 10,
		'Move Tutor',
		3,
		new Position(4, 2),
		'down',
		'MALE',
		undefined,
		undefined,
		tutorScript,
		undefined,
		undefined,
		true
	);
}
