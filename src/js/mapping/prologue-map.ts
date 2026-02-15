import { TileType3D, type ThrelteMapData } from './threlte-maps/types';
import { OpenMap } from './maps';
import { Position } from './positions';
import type { SparseMapData } from './sparse-collision';
import { registerThrelteMap } from './threlte-maps/threlte-map-registry';
import { preRegisterThrelteMap } from './threlte-maps/openmap-converter';
import { CustomScriptable, Dialog, Message, Script, StepBack } from '../scripting/scripts';
import { OverworldItem } from '../items/overworldItem';
import { SeededRNG } from '../dungeon/prng';
import { dungeonContext } from '../dungeon/dungeon-context';
import type { GameContext } from '../context/gameContext';
import { get } from 'svelte/store';

export const PROLOGUE_MAP_ID = 99;

const PROLOGUE_WIDTH = 8;
const PROLOGUE_HEIGHT = 12;

export const PROLOGUE_WAKE_UP_POS = new Position(3, 3);
export const PROLOGUE_NOTE_POS = new Position(3, 5);
export const PROLOGUE_POKEBALL_POS = new Position(5, 3);
export const PROLOGUE_CAVE_ENTRANCE_POS = new Position(4, 9);

/*
 * Layout (8 x 12) — spatial reference for the procedural grid below:
 *
 * R R R R R R R R    row 0   (R = CLIFF_ROCK)
 * R R R R R R R R    row 1
 * R R . . . . R R    row 2   (. = DUNGEON_FLOOR, walkable)
 * R R . W . P R R    row 3   (W = wake-up, P = pokeball)
 * R R . . . . R R    row 4
 * R R . N . . R R    row 5   (N = note)
 * R R . . . . R R    row 6
 * R R . . . . R R    row 7
 * R R . . . . R R    row 8
 * R R . . S . R R    row 9   (S = STAIRS_DOWN — dungeon entry)
 * R R R R R R R R    row 10
 * R R R R R R R R    row 11
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

						// Disable cave gate script so player can reach STAIRS_DOWN tile
						const gateScript = ctx.map.scripts?.find(
							(s) =>
								s.triggerType === 'onStep' &&
								s.stepPosition?.x === PROLOGUE_CAVE_ENTRANCE_POS.x &&
								s.stepPosition?.y === PROLOGUE_CAVE_ENTRANCE_POS.y
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

	const R = TileType3D.CLIFF_ROCK;
	const F = TileType3D.DUNGEON_FLOOR;
	const S = TileType3D.STAIRS_DOWN;

	const grid: TileType3D[][] = [];
	for (let y = 0; y < height; y++) {
		const row: TileType3D[] = [];
		for (let x = 0; x < width; x++) {
			if (y <= 1 || y >= 10) {
				row.push(R);
			} else if (x <= 1 || x >= 6) {
				row.push(R);
			} else {
				row.push(F);
			}
		}
		grid.push(row);
	}

	grid[PROLOGUE_CAVE_ENTRANCE_POS.y][PROLOGUE_CAVE_ENTRANCE_POS.x] = S;

	const playerStart = new Position(PROLOGUE_WAKE_UP_POS.x, PROLOGUE_WAKE_UP_POS.y);

	const wakeUpScript = createWakeUpScript();
	const caveGateScript = createCaveGateScript();
	const noteItem = createNoteItem();
	const pokeballItem = createPokeballItem();

	const collisionIndices: number[] = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (grid[y][x] === R) {
				collisionIndices.push(y * width + x);
			}
		}
	}

	const threlteMap: ThrelteMapData = {
		mapId,
		name: 'Cliffside Prologue',
		width,
		height,
		tiles: grid.map((row) => [...row]),
		playerStart,
		jonctions: [],
		npcs: [],
		items: [noteItem, pokeballItem],
		monsters: [],
		levelRange: [1, 1],
		battleTileIndices: new Set<number>()
	};

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
		[], // jonctions: gated until starter picked (caveJonction added by pokeball script)
		undefined,
		[],
		[wakeUpScript, caveGateScript],
		undefined,
		[noteItem, pokeballItem]
	);

	return { openMap, threlteMap };
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
