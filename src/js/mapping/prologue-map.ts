import { TileType3D, type ThrelteMapData } from './threlte-maps/types';
import { OpenMap } from './maps';
import { Position } from './positions';
import { registerThrelteMap } from './threlte-maps/threlte-map-registry';
import { preRegisterThrelteMap, padMapWithCliffs, MAP_PAD_SIZE } from './threlte-maps/openmap-converter';
import { CustomScriptable, Dialog, Message, Script, StepBack } from '../scripting/scripts';
import { OverworldItem } from '../items/overworldItem';
import { dungeonContext } from '../dungeon/dungeon-context';
import { buildOpenMap } from '../dungeon/floor-utils';
import type { GameContext } from '../context/gameContext';
import { get } from 'svelte/store';

export const PROLOGUE_MAP_ID = 99;

const PROLOGUE_WIDTH = 8;
const PROLOGUE_HEIGHT = 12;

export const PROLOGUE_WAKE_UP_POS = new Position(3, 8);
export const PROLOGUE_NOTE_POS = new Position(3, 6);
export const PROLOGUE_POKEBALL_POS = new Position(5, 8);
export const PROLOGUE_CAVE_ENTRANCE_POS = new Position(4, 2);

/*
 * Inner grid (8 x 12) before padMapWithCliffs wraps it in rocky cliff scenery:
 *
 * W W W W W W W W    row 0   (W = WALL, becomes cliff padding edge)
 * W . . . . . . W    row 1
 * W . . . S . . W    row 2   (S = STAIRS_DOWN — dungeon entry, visible from below)
 * W . . . . . . W    row 3
 * W . . . . . . W    row 4
 * W . . . . . . W    row 5
 * W . . N . . . W    row 6   (N = note item)
 * W . . . . . . W    row 7
 * W . . W . P . W    row 8   (W = wake-up / player start, P = pokeball)
 * W . . . . . . W    row 9
 * W . . . . . . W    row 10
 * W W W W W W W W    row 11
 *
 * After padding (MAP_PAD_SIZE = 8), all positions shift by +8 in both axes.
 */

function createWakeUpScript(): Script {
	return new Script('onEnter', [
		new Dialog([
			new Message('...Where am I? My body aches...', 'thought'),
			new Message('How long have I been lying here?', 'thought'),
			new Message('I remember... a battle.', 'thought'),
			new Message('I lost.', 'thought'),
			new Message('They took everything.', 'thought'),
			new Message('My team... gone.', 'thought'),
			new Message("There's something on the ground nearby. A Pokeball... ", 'thought'),
			new Message('A Pokeball...'),
		])
	]);
}

function createNoteItem(): OverworldItem {
	return new OverworldItem(
		'Note',
		true,
		PROLOGUE_NOTE_POS,
		'src/assets/menus/pokeball.png',
		undefined,
		[
			new Script('onInteract', [
				new Dialog([
					new Message('A crumpled note, stained with dirt.', 'System'),
					new Message('The handwriting is sharp, deliberate.', 'System'),
					new Message("'You should have stayed down, Champion.'", 'System'),
					new Message("'What lies below is not for you.'", 'System'),
					new Message("'Do not follow me. \u2014 V'", 'System'),
					new Message("V... That initial. I've seen it before.", 'thought')
				])
			])
		]
	);
}

function createPokeballItem(): OverworldItem {
	return new OverworldItem(
		'Pokeball',
		true,
		PROLOGUE_POKEBALL_POS,
		'src/assets/menus/pokeball.png',
		undefined,
		[
			new Script('onInteract', [
				new Dialog([
					new Message("A cracked Pokeball. It's still warm...", 'System')
				]),
				new CustomScriptable((ctx: GameContext) => {
					const dc = get(dungeonContext);
					if (!dc) {
						return;
					}
					//const STARTERS = [1, 4, 7];
					//const rng = new SeededRNG(dc.runSeed + '-starter');
					//const starterId = rng.pick(STARTERS);
					const pokemon = ctx.POKEDEX.findById(50).result?.instanciate(5, 25, true);
					if (pokemon) {
						ctx.player.monsters.push(pokemon);
						ctx.player.setFollower(pokemon);
						ctx.POKEDEX.setCaught(50);
						dc.starterPicked = true;
						dc.prologueCompleted = true;
						ctx.updateMenuAvailability();
						dungeonContext.set(dc);

						// Disable cave gate script so player can reach STAIRS_DOWN tile.
						// stepPosition is in padded coords at runtime.
						const paddedGateX = PROLOGUE_CAVE_ENTRANCE_POS.x + MAP_PAD_SIZE;
						const paddedGateY = PROLOGUE_CAVE_ENTRANCE_POS.y + MAP_PAD_SIZE;
						const gateScript = ctx.map.scripts?.find(
							(s) =>
								s.triggerType === 'onStep' &&
								s.stepPosition?.x === paddedGateX &&
								s.stepPosition?.y === paddedGateY
						);
						if (gateScript) {
							gateScript.replayable = false;
							gateScript.played = true;
						}
					}
				}),
				new Dialog([
					new Message(
						"Eevee !",
						'self'
					),
					new Message('Vee !', 'follower'),
					new Message('Maybe there\'s a way out of here...', 'thought')
				])
			])
		]
	);
}

function createCaveGateScript(): Script {
	return new Script(
		'onStep',
		[
			new Dialog([
				new Message(
					"I can't go in there without a Pokemon.",
					'thought'
				),
				new Message('I need to look around first.', 'thought')
			]),
			new StepBack()
		],
		PROLOGUE_CAVE_ENTRANCE_POS,
		true // replayable — keeps blocking until disabled by pokeball pickup
	);
}

export function createPrologueMap(): { openMap: OpenMap; threlteMap: ThrelteMapData } {
	const width = PROLOGUE_WIDTH;
	const height = PROLOGUE_HEIGHT;
	const mapId = PROLOGUE_MAP_ID;

	const W = TileType3D.WALL;
	const F = TileType3D.DUNGEON_FLOOR;
	const S = TileType3D.STAIRS_DOWN;

	// Build inner grid — single-tile WALL border, walkable floor inside.
	// padMapWithCliffs() will wrap this with visual rocky cliffs.
	const grid: TileType3D[][] = [];
	for (let y = 0; y < height; y++) {
		const row: TileType3D[] = [];
		for (let x = 0; x < width; x++) {
			if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
				row.push(W);
			} else {
				row.push(F);
			}
		}
		grid.push(row);
	}

	// Place stairs at the pre-padding position (top of inner walkable area)
	grid[PROLOGUE_CAVE_ENTRANCE_POS.y][PROLOGUE_CAVE_ENTRANCE_POS.x] = S;

	const noteItem = createNoteItem();
	const pokeballItem = createPokeballItem();

	// Pre-padding ThrelteMapData — player start and item positions are pre-padding coords.
	// padMapWithCliffs will offset playerStart and item positions automatically.
	const prePadThrelteMap: ThrelteMapData = {
		mapId,
		name: 'Cliffside Prologue',
		width,
		height,
		tiles: grid.map((row) => [...row]),
		playerStart: new Position(PROLOGUE_WAKE_UP_POS.x, PROLOGUE_WAKE_UP_POS.y),
		jonctions: [],
		npcs: [],
		items: [noteItem, pokeballItem],
		monsters: [],
		levelRange: [1, 1],
		battleTileIndices: new Set<number>()
	};

	// Apply cliff padding — same treatment as dungeon floors
	const paddedThrelteMap = padMapWithCliffs(prePadThrelteMap, MAP_PAD_SIZE, 'Cave Rock');

	// Build OpenMap from the padded tile data (handles WALL → collision automatically)
	const openMap = buildOpenMap(
		paddedThrelteMap.tiles,
		paddedThrelteMap.width,
		paddedThrelteMap.height,
		mapId,
		paddedThrelteMap.playerStart,
		[],
		[1, 1]
	);

	// Attach scripts and items to the open map.
	// Script step-positions must use padded coords since the player moves in padded space.
	const wakeUpScript = createWakeUpScript();
	const caveGateScript = createCaveGateScript();
	// Fix the gate script's stepPosition to padded coordinates
	if (caveGateScript.stepPosition) {
		caveGateScript.stepPosition = new Position(
			caveGateScript.stepPosition.x + MAP_PAD_SIZE,
			caveGateScript.stepPosition.y + MAP_PAD_SIZE
		);
	}

	openMap.scripts = [wakeUpScript, caveGateScript];
	openMap.items = paddedThrelteMap.items; // already offset by padMapWithCliffs

	return { openMap, threlteMap: paddedThrelteMap };
}

export function registerPrologueMap(maps: Record<number, OpenMap>): {
	openMap: OpenMap;
	threlteMap: ThrelteMapData;
} {
	const { openMap, threlteMap } = createPrologueMap();
	registerThrelteMap(threlteMap.mapId, threlteMap);
	preRegisterThrelteMap(threlteMap.mapId, threlteMap);
	maps[openMap.mapId] = openMap;
	return { openMap, threlteMap };
}
