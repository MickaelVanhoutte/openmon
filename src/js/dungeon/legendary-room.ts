import { TileType3D, type ThrelteMapData } from '../mapping/threlte-maps/types';
import { OpenMap } from '../mapping/maps';
import { Position } from '../mapping/positions';
import { Jonction } from '../mapping/collisions';
import { NPC } from '../characters/npc';
import { Script, Dialog, Message, StartWildBattle } from '../scripting/scripts';
import type { FloorData } from './floor-generator';
import { padMapWithCliffs, MAP_PAD_SIZE } from '../mapping/threlte-maps/openmap-converter';
import { buildOpenMap } from './floor-utils';

const LEGENDARY_ROOM_WIDTH = 10;
const LEGENDARY_ROOM_HEIGHT = 10;

/** Legendary Pokémon IDs available in the game */
export const LEGENDARY_IDS = [233, 234, 235, 236, 237, 238, 239, 240];

const LEGENDARY_NAMES: Record<number, string> = {
	233: 'Articuno',
	234: 'Zapdos',
	235: 'Moltres',
	236: 'Marshadow',
	237: 'Magearna',
	238: 'Zeraora',
	239: 'Diancie',
	240: 'Darkrai'
};

/**
 * Maps game internal ID → national Pokédex ID used by PMD sprite folders.
 * PMD community sprites are indexed by national dex number.
 */
const LEGENDARY_NATIONAL_DEX_ID: Record<number, number> = {
	233: 144, // Articuno (Galarian)
	234: 145, // Zapdos (Galarian)
	235: 146, // Moltres (Galarian)
	236: 802, // Marshadow
	237: 801, // Magearna
	238: 807, // Zeraora
	239: 719, // Diancie
	240: 491  // Darkrai
};

/** Set of PMD national-dex sprite IDs used for legendary NPCs — used by NPCSprite3D to scale them up */
export const LEGENDARY_SPRITE_IDS = new Set(Object.values(LEGENDARY_NATIONAL_DEX_ID));

/**
 * Generates a legendary side room map for the given floor.
 * The room is a small 10×10 padded room with a legendary Pokémon NPC at the center.
 *
 * @param floor - The dungeon floor number (used for mapId and level scaling)
 * @param legendaryId - The Pokémon ID of the legendary to place in this room
 * @param mainFloorMapId - The mapId of the main floor (used for the return jonction)
 * @param mainFloorReturnPos - Position on the main floor to return to when leaving
 * @param portalPos - Position on the main floor where the portal tile is placed
 * @param alreadyEncountered - Whether the legendary was already battled (no NPC if true)
 * @returns sideRoomFloorData and mainFloorJonction
 */
export function generateLegendaryRoom(
	floor: number,
	legendaryId: number,
	mainFloorMapId: number,
	mainFloorReturnPos: Position,
	portalPos: Position,
	alreadyEncountered: boolean
): { sideRoomFloorData: FloorData; mainFloorJonction: Jonction } {
	const width = LEGENDARY_ROOM_WIDTH;
	const height = LEGENDARY_ROOM_HEIGHT;
	const sideRoomMapId = 9500 + floor;

	// Build inner 10×10 grid
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

	// Return portal: top-center wall tile — the exit the player walks back to
	const innerReturnTile = new Position(Math.floor(width / 2), 0);
	// Player spawns just inside the portal (y=1), one step south of the wall.
	// The portal is immediately visible behind/above them — they walk into the room.
	const innerPlayerEntry = new Position(Math.floor(width / 2), 1);

	// Legendary NPC deeper in the room — player walks toward them from the portal
	const innerLegendaryPos = new Position(Math.floor(width / 2), Math.floor(height / 2) + 1);

	// Build NPC (only if not already encountered)
	const npcs: NPC[] = [];
	if (!alreadyEncountered) {
		const level = Math.min(floor + 5, 100);
		const legendaryName = LEGENDARY_NAMES[legendaryId] ?? 'Legendary';
		// Use national dex ID for PMD sprite folder lookup (PMD sprites use national dex numbering)
		const pmdSpriteId = LEGENDARY_NATIONAL_DEX_ID[legendaryId] ?? legendaryId;
		const legendaryNpc = new NPC(
			9700 + floor, // unique NPC ID
			legendaryName,
			pmdSpriteId, // national dex ID — used as PMD folder path in NPCSprite3D
			innerLegendaryPos,
			'down',
			'MALE',
			undefined,
			undefined,
			new Script(
				'onInteract',
				[
					new Dialog([
						new Message(`A wild ${legendaryName} appears!`, 'System')
					]),
					new StartWildBattle(legendaryId, level, 20)
				],
				undefined,
				false // not replayable — one-time encounter
			)
		);
		npcs.push(legendaryNpc);
	}

	// Build pre-padding ThrelteMapData
	const prePadThrelteMap: ThrelteMapData = {
		mapId: sideRoomMapId,
		name: `Legendary Room (Floor ${floor})`,
		width,
		height,
		tiles: grid.map((row) => [...row]),
		playerStart: innerPlayerEntry,
		jonctions: [], // returnJonction added after padding to avoid double-offset
		npcs,
		items: [],
		monsters: [],
		levelRange: [floor, Math.min(floor + 10, 100)],
		battleTileIndices: new Set<number>()
	};

	// Apply cliff padding (same as regular dungeon floors)
	const paddedThrelteMap = padMapWithCliffs(prePadThrelteMap, MAP_PAD_SIZE);

	// Return jonction built after padding — positions are already in padded space.
	// Trigger tile: padded innerReturnTile. start: mainFloorReturnPos is already padded.
	const paddedReturnTilePos = new Position(
		innerReturnTile.x + MAP_PAD_SIZE,
		innerReturnTile.y + MAP_PAD_SIZE
	);
	const returnJonction = new Jonction(
		8600 + floor,
		mainFloorMapId,
		[paddedReturnTilePos],
		mainFloorReturnPos
	);
	paddedThrelteMap.jonctions.push(returnJonction);

	// Mark exit wall as a legendary portal for the visual effect
	if (!paddedThrelteMap.legendaryPortals) paddedThrelteMap.legendaryPortals = [];
	paddedThrelteMap.legendaryPortals.push({ x: paddedReturnTilePos.x, y: paddedReturnTilePos.y });

	// Build OpenMap from the padded data
	const paddedOpenMap = buildOpenMap(
		paddedThrelteMap.tiles,
		paddedThrelteMap.width,
		paddedThrelteMap.height,
		sideRoomMapId,
		paddedThrelteMap.playerStart,
		[],
		paddedThrelteMap.levelRange
	);

	// Sync NPCs and jonctions from padded threlte map to openmap
	paddedOpenMap.npcs = paddedThrelteMap.npcs;
	paddedOpenMap.jonctions = paddedThrelteMap.jonctions;

	// Make the return wall tile walkable so the jonction trigger can fire
	// (WALL stays in threlteMap for rendering the door sprite; openMap must allow stepping on it)
	const returnFlatIndex = paddedReturnTilePos.y * paddedThrelteMap.width + paddedReturnTilePos.x;
	paddedOpenMap.removeCollisionAt(returnFlatIndex);

	const sideRoomFloorData: FloorData = {
		threlteMap: paddedThrelteMap,
		openMap: paddedOpenMap,
		playerStart: paddedThrelteMap.playerStart,
		stairsPosition: paddedThrelteMap.playerStart, // no stairs
		starterItemPosition: paddedThrelteMap.playerStart,
		trainerPositions: [],
		itemPositions: [],
		grassPatches: []
	};

	// Main floor jonction: standing on the portal tile on the main floor → this side room
	// The start position is where the player spawns in the side room (padded player entry)
	const mainFloorJonction = new Jonction(
		8500 + floor, // unique jonction ID
		sideRoomMapId,
		[portalPos],
		paddedThrelteMap.playerStart
	);

	return { sideRoomFloorData, mainFloorJonction };
}
