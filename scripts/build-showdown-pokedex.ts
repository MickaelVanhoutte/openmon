/**
 * build-showdown-pokedex.ts
 *
 * Transforms downloaded Showdown data (pokedex, moves, learnsets) + PokeAPI species data
 * into the game's internal format. Outputs:
 *   - public/data/pokedex-full.json     (ALL Pokemon)
 *   - public/data/moves-full.json       (ALL moves)
 *   - public/data/pokedex-game.json     (filtered by game-pokemon.json, replaces pokedex-animatedV3.json)
 *   - src/assets/data/game-pokemon.json (initial filter if not existing)
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SHOWDOWN_DIR = join(ROOT, 'src/assets/data/raw/showdown');
const PUBLIC_DATA = join(ROOT, 'public/data');
const GAME_FILTER_PATH = join(ROOT, 'src/assets/data/game-pokemon.json');

// ---------------------------------------------------------------------------
// Types (matching game format from pokedex.ts)
// ---------------------------------------------------------------------------

interface GameMove {
	id: number;
	name: string;
	type: string;
	category: 'physical' | 'special' | 'no-damage';
	power: number | string; // some moves have "" for no power
	accuracy: number;
	pp: number;
	priority: number;
	target: string;
	effect: {
		move_effect_id: number;
		local_language_id: number;
		short_effect: string;
		effect: string;
	};
	effectChance: number;
	description: string;
	level: number;
	method: number;
}

interface GameEvolution {
	id: number; // game ID of the evolution target
	level: number | null;
	method: string;
}

interface GameSprites {
	male: {
		front: { frame1: string; shiny1: string };
		back: { frame1: string; shiny1: string };
	};
}

interface GamePokemonEntry {
	id: number;
	regionalId: number;
	region: string;
	name: string;
	types: string[];
	abilities: string[];
	baseXp: number;
	moves: GameMove[];
	stats: {
		hp: number;
		attack: number;
		defense: number;
		specialAttack: number;
		specialDefense: number;
		speed: number;
		total: number;
	};
	height: number;
	weight: number;
	description: string;
	isLegendary: boolean;
	captureRate: number;
	growthRateId: number;
	percentageMale: number;
	evolution: GameEvolution[];
	sprites: GameSprites;
	spriteName: string;
}

// ---------------------------------------------------------------------------
// Showdown types
// ---------------------------------------------------------------------------

interface ShowdownPokemon {
	num: number;
	name: string;
	types: string[];
	baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
	abilities: Record<string, string>;
	heightm: number;
	weightkg: number;
	evos?: string[];
	prevo?: string;
	evoLevel?: number;
	evoType?: string;
	evoItem?: string;
	evoMove?: string;
	evoCondition?: string;
	baseSpecies?: string;
	forme?: string;
	otherFormes?: string[];
	isNonstandard?: string;
	genderRatio?: { M: number; F: number };
	gender?: string;
}

interface ShowdownMove {
	num: number;
	name: string;
	type: string;
	category: string;
	basePower: number;
	accuracy: number | true;
	pp: number;
	priority: number;
	target: string;
	secondary?: { chance?: number; boosts?: Record<string, number>; status?: string; volatileStatus?: string } | null;
	flags: Record<string, number>;
	desc?: string;
	shortDesc?: string;
	isNonstandard?: string;
}

interface ShowdownLearnset {
	learnset: Record<string, string[]>;
}

interface SpeciesExtra {
	captureRate: number;
	growthRateId: number;
	baseXp: number;
	genderRate: number;
	percentageMale: number;
	description: string;
	isLegendary: boolean;
	isMythical: boolean;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Map Showdown target names to game target names */
const TARGET_MAP: Record<string, string> = {
	normal: 'selected-pokemon',
	self: 'user',
	allAdjacentFoes: 'all-opponents',
	allAdjacent: 'all-other-pokemon',
	adjacentFoe: 'selected-pokemon',
	adjacentAlly: 'ally',
	adjacentAllyOrSelf: 'user-or-ally',
	allySide: 'users-field',
	foeSide: 'opponents-field',
	all: 'entire-field',
	any: 'selected-pokemon',
	randomNormal: 'random-opponent',
	scripted: 'selected-pokemon',
	allies: 'user-and-allies'
};

/** Map Showdown category to game category */
function mapCategory(category: string): 'physical' | 'special' | 'no-damage' {
	switch (category) {
		case 'Physical':
			return 'physical';
		case 'Special':
			return 'special';
		case 'Status':
			return 'no-damage';
		default:
			return 'no-damage';
	}
}

/**
 * Derives the Showdown sprite filename from the display name.
 * "Charizard-Mega-X" → "charizard-megax"
 * "Mr. Mime" → "mrmime"
 */
const SPRITE_NAME_OVERRIDES: Record<string, string> = {
	'nidoran-f': 'nidoranf',
	'nidoran-m': 'nidoranm',
	'porygon-z': 'porygonz',
	'ho-oh': 'hooh',
	'jangmo-o': 'jangmoo',
	'hakamo-o': 'hakamoo',
	'kommo-o': 'kommoo',
	'type-null': 'typenull',
	'tapu-koko': 'tapukoko',
	'tapu-lele': 'tapulele',
	'tapu-bulu': 'tapubulu',
	'tapu-fini': 'tapufini',
	'chi-yu': 'chiyu',
	'chien-pao': 'chienpao',
	'ting-lu': 'tinglu',
	'wo-chien': 'wochien'
};

function deriveSpriteName(name: string): string {
	let spriteName = name.toLowerCase();
	spriteName = spriteName
		.replace(/[.':\s%]+/g, '')
		.replace(/♀/g, '-f')
		.replace(/♂/g, '-m')
		.replace(/é/g, 'e');
	spriteName = spriteName.replace(/-mega-x$/, '-megax');
	spriteName = spriteName.replace(/-mega-y$/, '-megay');
	if (SPRITE_NAME_OVERRIDES[spriteName]) {
		return SPRITE_NAME_OVERRIDES[spriteName];
	}
	return spriteName;
}

/** Showdown toID: lowercase, strip non-alphanumeric */
function toID(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Determine the "region" tag for a Pokemon based on its form.
 * Normal Pokemon get "normal", regional forms get their region name.
 */
function determineRegion(pokemon: ShowdownPokemon): string {
	const forme = pokemon.forme?.toLowerCase() ?? '';
	if (forme.includes('alola')) return 'alolan';
	if (forme.includes('galar')) return 'galarian';
	if (forme.includes('hisui')) return 'hisuian';
	if (forme.includes('paldea')) return 'paldean';
	if (forme.includes('mega')) return 'mega';
	return 'normal';
}

/**
 * Maps the old pokemon-ids.json entry (e.g., "549-h") to a Showdown pokedex key.
 * This is needed to build game-pokemon.json from the existing roster.
 */
function oldIdToShowdownKey(
	oldId: string,
	showdownPokedex: Record<string, ShowdownPokemon>
): string | null {
	const parts = oldId.trim().split('-');
	const num = parseInt(parts[0]);
	const formCode = parts[1] || '';

	if (isNaN(num)) return null;

	// Map form codes to Showdown form identifiers
	const formMap: Record<string, string[]> = {
		'': [''], // base form
		h: ['hisui'],
		a: ['alola'],
		g: ['galar']
	};

	const searchForms = formMap[formCode] ?? [formCode];

	// Find matching entry in Showdown pokedex
	for (const [key, pokemon] of Object.entries(showdownPokedex)) {
		if (pokemon.num !== num) continue;

		if (formCode === '' && !pokemon.baseSpecies) {
			// Base form: no baseSpecies means it's the main entry
			return key;
		}

		if (formCode !== '') {
			const pokemonForme = (pokemon.forme ?? '').toLowerCase();
			if (searchForms.some((f) => pokemonForme.includes(f))) {
				return key;
			}
		}
	}

	// Fallback: find any entry with matching num
	if (formCode === '') {
		for (const [key, pokemon] of Object.entries(showdownPokedex)) {
			if (pokemon.num === num && !pokemon.baseSpecies) {
				return key;
			}
		}
	}

	return null;
}

// ---------------------------------------------------------------------------
// Main build logic
// ---------------------------------------------------------------------------

function loadJSON<T>(path: string): T {
	if (!existsSync(path)) {
		console.error(`Missing file: ${path}`);
		process.exit(1);
	}
	return JSON.parse(readFileSync(path, 'utf-8'));
}

function main() {
	console.log('Building Showdown pokedex...\n');

	// Load all source data
	const showdownPokedex = loadJSON<Record<string, ShowdownPokemon>>(
		join(SHOWDOWN_DIR, 'pokedex.json')
	);
	const showdownMoves = loadJSON<Record<string, ShowdownMove>>(
		join(SHOWDOWN_DIR, 'moves.json')
	);
	const showdownLearnsets = loadJSON<Record<string, ShowdownLearnset>>(
		join(SHOWDOWN_DIR, 'learnsets.json')
	);

	const speciesExtraPath = join(SHOWDOWN_DIR, 'species-extra.json');
	const speciesExtra: Record<string, SpeciesExtra> = existsSync(speciesExtraPath)
		? loadJSON(speciesExtraPath)
		: {};

	// -----------------------------------------------------------------------
	// Step 1: Build moves catalog
	// -----------------------------------------------------------------------
	console.log('Building moves catalog...');

	const movesById = new Map<number, ShowdownMove>();
	const movesByKey = new Map<string, ShowdownMove>();
	const moveIdByKey = new Map<string, number>(); // Showdown key → our move ID

	let moveIdCounter = 1;
	const allGameMoves: (GameMove & { showdownKey: string })[] = [];

	for (const [key, move] of Object.entries(showdownMoves)) {
		if (move.isNonstandard === 'CAP' || move.isNonstandard === 'Custom') continue;
		if (move.num <= 0 && key !== 'struggle') continue;

		movesByKey.set(key, move);
		movesById.set(move.num, move);

		const gameMove: GameMove & { showdownKey: string } = {
			showdownKey: key,
			id: move.num > 0 ? move.num : moveIdCounter,
			name: move.name.toLowerCase().replace(/\s+/g, '-'),
			type: move.type.toLowerCase(),
			category: mapCategory(move.category),
			power: move.basePower || '',
			accuracy: move.accuracy === true ? 101 : (move.accuracy || 0),
			pp: move.pp,
			priority: move.priority,
			target: TARGET_MAP[move.target] ?? 'selected-pokemon',
			effect: {
				move_effect_id: 1,
				local_language_id: 9,
				short_effect: move.shortDesc ?? move.desc ?? '',
				effect: move.desc ?? move.shortDesc ?? ''
			},
			effectChance: move.secondary?.chance ?? 100,
			description: move.shortDesc ?? move.desc ?? '',
			level: 0,
			method: 1
		};

		moveIdByKey.set(key, gameMove.id);
		allGameMoves.push(gameMove);
		moveIdCounter++;
	}

	console.log(`  ${allGameMoves.length} moves processed.`);

	// -----------------------------------------------------------------------
	// Step 2: Build full Pokemon catalog
	// -----------------------------------------------------------------------
	console.log('Building full Pokemon catalog...');

	// We need a stable ordering for the full catalog. Use num + form order.
	const pokemonEntries: { key: string; pokemon: ShowdownPokemon }[] = [];

	for (const [key, pokemon] of Object.entries(showdownPokedex)) {
		// Skip CAP and custom
		if (pokemon.isNonstandard === 'CAP' || pokemon.isNonstandard === 'Custom') continue;
		// Skip num <= 0
		if (pokemon.num <= 0) continue;
		// Skip entries without base stats (some cosmetic-only forms)
		if (!pokemon.baseStats) continue;
		// Skip entries without types
		if (!pokemon.types || pokemon.types.length === 0) continue;
		pokemonEntries.push({ key, pokemon });
	}

	// Sort by national dex number, then by base form first
	pokemonEntries.sort((a, b) => {
		if (a.pokemon.num !== b.pokemon.num) return a.pokemon.num - b.pokemon.num;
		// Base forms first
		const aIsBase = !a.pokemon.baseSpecies ? 0 : 1;
		const bIsBase = !b.pokemon.baseSpecies ? 0 : 1;
		return aIsBase - bIsBase;
	});

	// Build a key→gameId map for the full catalog (for evolution lookups)
	// The full catalog uses sequential IDs starting from 1
	const fullKeyToId = new Map<string, number>();
	pokemonEntries.forEach((entry, index) => {
		fullKeyToId.set(entry.key, index + 1);
	});

	// Also build a map from Showdown display name (toID) to key for evolution resolution
	const nameToKey = new Map<string, string>();
	for (const [key, pokemon] of Object.entries(showdownPokedex)) {
		nameToKey.set(toID(pokemon.name), key);
	}

	// Build the full pokedex
	const fullPokedex: GamePokemonEntry[] = pokemonEntries.map((entry, index) => {
		const { key, pokemon } = entry;
		const id = index + 1;
		const species = speciesExtra[String(pokemon.num)];
		const spriteName = deriveSpriteName(pokemon.name);

		// Learnset: look up by key, fallback to base species key
		const learnsetKey = showdownLearnsets[key]
			? key
			: pokemon.baseSpecies
				? toID(pokemon.baseSpecies)
				: key;
		const learnset = showdownLearnsets[learnsetKey]?.learnset ?? {};

		// Build moves list from learnset
		const moves: GameMove[] = [];
		for (const [moveName, learnMethods] of Object.entries(learnset)) {
			const moveData = movesByKey.get(moveName);
			if (!moveData) continue;

			// Find the best learn method, preferring latest gen
			let bestLevel = 0;
			let bestMethod = 4; // default to TM
			let found = false;

			for (const entry of learnMethods) {
				// Parse format like "9L15", "9M", "9E", "9T"
				const match = entry.match(/^(\d+)([LMETS])(\d*)$/);
				if (!match) continue;

				const gen = parseInt(match[1]);
				const methodChar = match[2];
				const levelNum = match[3] ? parseInt(match[3]) : 0;

				// Prefer gen 9, fallback to latest available
				if (!found || gen >= 9) {
					switch (methodChar) {
						case 'L':
							bestMethod = 1;
							bestLevel = levelNum;
							break;
						case 'E':
							bestMethod = 2;
							bestLevel = 0;
							break;
						case 'T':
							bestMethod = 3;
							bestLevel = 0;
							break;
						case 'M':
							bestMethod = 4;
							bestLevel = 0;
							break;
						case 'S':
							bestMethod = 1;
							bestLevel = 0;
							break;
					}
					found = true;
					if (gen >= 9) break; // gen 9 is preferred, stop looking
				}
			}

			const moveId = moveIdByKey.get(moveName) ?? 0;
			if (moveId === 0) continue;

			moves.push({
				id: moveId,
				name: moveData.name.toLowerCase().replace(/\s+/g, '-'),
				type: moveData.type.toLowerCase(),
				category: mapCategory(moveData.category),
				power: moveData.basePower || '',
				accuracy: moveData.accuracy === true ? 101 : (moveData.accuracy || 0),
				pp: moveData.pp,
				priority: moveData.priority,
				target: TARGET_MAP[moveData.target] ?? 'selected-pokemon',
				effect: {
					move_effect_id: 1,
					local_language_id: 9,
					short_effect: moveData.shortDesc ?? moveData.desc ?? '',
					effect: moveData.desc ?? moveData.shortDesc ?? ''
				},
				effectChance: moveData.secondary?.chance ?? 100,
				description: moveData.shortDesc ?? moveData.desc ?? '',
				level: bestLevel,
				method: bestMethod
			});
		}

		// Sort moves: level-up by level, then alphabetically
		moves.sort((a, b) => {
			if (a.level !== b.level) return a.level - b.level;
			return a.name.localeCompare(b.name);
		});

		// Build evolution chain
		const evolutions: GameEvolution[] = [];
		if (pokemon.evos) {
			for (const evoName of pokemon.evos) {
				const evoKey = toID(evoName);
				const evoShowdown = showdownPokedex[evoKey];
				const evoGameId = fullKeyToId.get(evoKey);

				if (evoShowdown && evoGameId) {
					let level: number | null = null;
					let method = 'level';

					if (evoShowdown.evoLevel) {
						level = evoShowdown.evoLevel;
						method = 'level';
					} else if (evoShowdown.evoItem) {
						method = evoShowdown.evoItem;
					} else if (evoShowdown.evoType === 'trade') {
						method = 'trade';
					} else if (evoShowdown.evoType === 'useItem') {
						method = evoShowdown.evoItem ?? 'item';
					} else if (evoShowdown.evoMove) {
						method = `move:${evoShowdown.evoMove}`;
					} else if (evoShowdown.evoCondition) {
						method = evoShowdown.evoCondition;
					} else if (evoShowdown.evoType === 'levelFriendship') {
						method = 'friendship';
					} else {
						method = evoShowdown.evoType ?? 'level';
					}

					evolutions.push({
						id: evoGameId,
						level,
						method
					});
				}
			}
		}

		// Gender ratio
		let percentageMale = species?.percentageMale ?? 50;
		if (pokemon.gender === 'M') percentageMale = 100;
		else if (pokemon.gender === 'F') percentageMale = 0;
		else if (pokemon.gender === 'N') percentageMale = -1;
		else if (pokemon.genderRatio) {
			percentageMale = Math.round(pokemon.genderRatio.M * 100);
		}

		const stats = pokemon.baseStats;
		const total = stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe;

		return {
			id, // sequential, will be overridden for game-filtered version
			regionalId: pokemon.num,
			region: determineRegion(pokemon),
			name: pokemon.name,
			types: pokemon.types.map((t) => t.toLowerCase()),
			abilities: Object.values(pokemon.abilities),
			baseXp: species?.baseXp ?? 100,
			moves,
			stats: {
				hp: stats.hp,
				attack: stats.atk,
				defense: stats.def,
				specialAttack: stats.spa,
				specialDefense: stats.spd,
				speed: stats.spe,
				total
			},
			height: pokemon.heightm ?? 0,
			weight: pokemon.weightkg ?? 0,
			description: species?.description ?? '',
			isLegendary: species?.isLegendary || species?.isMythical || false,
			captureRate: species?.captureRate ?? 45,
			growthRateId: species?.growthRateId ?? 2,
			percentageMale,
			evolution: evolutions,
			sprites: {
				male: {
					front: {
						frame1: `src/assets/monsters/showdown/ani/${spriteName}.gif`,
						shiny1: `src/assets/monsters/showdown/ani-shiny/${spriteName}.gif`
					},
					back: {
						frame1: `src/assets/monsters/showdown/ani-back/${spriteName}.gif`,
						shiny1: `src/assets/monsters/showdown/ani-back-shiny/${spriteName}.gif`
					}
				}
			},
			spriteName
		};
	});

	console.log(`  ${fullPokedex.length} Pokemon processed.`);

	// -----------------------------------------------------------------------
	// Step 3: Build or load game filter
	// -----------------------------------------------------------------------
	console.log('Processing game filter...');

	let gameFilter: string[];

	if (existsSync(GAME_FILTER_PATH)) {
		gameFilter = loadJSON<string[]>(GAME_FILTER_PATH);
		console.log(`  Loaded existing game filter with ${gameFilter.length} Pokemon.`);
	} else {
		// Generate initial filter from pokemon-ids.json
		const oldIdsPath = join(ROOT, 'src/assets/data/raw/dex/pokemon-ids.json');
		const oldIds = loadJSON<string[]>(oldIdsPath);

		gameFilter = [];
		const unmapped: string[] = [];

		for (const oldId of oldIds) {
			const trimmed = oldId.trim();
			if (!trimmed) continue;

			const showdownKey = oldIdToShowdownKey(trimmed, showdownPokedex);
			if (showdownKey) {
				gameFilter.push(showdownKey);
			} else {
				unmapped.push(trimmed);
			}
		}

		if (unmapped.length > 0) {
			console.warn(`  WARNING: ${unmapped.length} Pokemon from pokemon-ids.json could not be mapped:`);
			unmapped.forEach((id) => console.warn(`    - ${id}`));
		}

		writeFileSync(GAME_FILTER_PATH, JSON.stringify(gameFilter, null, 2), 'utf-8');
		console.log(`  Generated game-pokemon.json with ${gameFilter.length} Pokemon.`);
	}

	// -----------------------------------------------------------------------
	// Step 4: Build game-filtered pokedex
	// -----------------------------------------------------------------------
	console.log('Building game-filtered pokedex...');

	// Build a key→full entry map
	const fullByKey = new Map<string, GamePokemonEntry>();
	for (const entry of fullPokedex) {
		const key = pokemonEntries.find(
			(_, i) => fullPokedex[i] === entry
		)?.key;
		if (key) fullByKey.set(key, entry);
	}

	// Also index by key directly using the pokemonEntries array
	const keyToFullEntry = new Map<string, GamePokemonEntry>();
	pokemonEntries.forEach((pe, i) => {
		keyToFullEntry.set(pe.key, fullPokedex[i]);
	});

	// Build game-specific key→gameId mapping (for evolution resolution)
	const gameKeyToId = new Map<string, number>();
	gameFilter.forEach((key, index) => {
		gameKeyToId.set(key, index + 1);
	});

	const gamePokedex: GamePokemonEntry[] = [];
	const missingFromGame: string[] = [];

	gameFilter.forEach((key, index) => {
		const fullEntry = keyToFullEntry.get(key);
		if (!fullEntry) {
			missingFromGame.push(key);
			return;
		}

		// Clone and override ID to sequential game ID
		const gameEntry: GamePokemonEntry = {
			...fullEntry,
			id: index + 1,
			// Re-resolve evolutions with game IDs
			evolution: fullEntry.evolution
				.map((evo) => {
					// Find the evolution target's showdown key
					const evoFullEntry = fullPokedex.find((e) => e.id === evo.id);
					if (!evoFullEntry) return null;

					const evoKey = pokemonEntries.find(
						(_, i) => fullPokedex[i] === evoFullEntry
					)?.key;
					if (!evoKey) return null;

					const gameId = gameKeyToId.get(evoKey);
					if (!gameId) return null; // Evolution target not in game

					return { ...evo, id: gameId };
				})
				.filter((e): e is GameEvolution => e !== null)
		};

		gamePokedex.push(gameEntry);
	});

	if (missingFromGame.length > 0) {
		console.warn(`  WARNING: ${missingFromGame.length} filter entries not found in Showdown pokedex:`);
		missingFromGame.forEach((key) => console.warn(`    - ${key}`));
	}

	console.log(`  ${gamePokedex.length} Pokemon in game pokedex.`);

	// -----------------------------------------------------------------------
	// Step 5: Write output files
	// -----------------------------------------------------------------------
	console.log('\nWriting output files...');

	if (!existsSync(PUBLIC_DATA)) {
		mkdirSync(PUBLIC_DATA, { recursive: true });
	}

	// Full pokedex
	const fullPath = join(PUBLIC_DATA, 'pokedex-full.json');
	writeFileSync(fullPath, JSON.stringify(fullPokedex), 'utf-8');
	const fullSizeMB = (readFileSync(fullPath).length / 1024 / 1024).toFixed(2);
	console.log(`  pokedex-full.json: ${fullPokedex.length} Pokemon (${fullSizeMB} MB)`);

	// Moves
	// Strip the showdownKey from the output
	const movesOutput = allGameMoves.map(({ showdownKey, ...rest }) => rest);
	const movesPath = join(PUBLIC_DATA, 'moves-full.json');
	writeFileSync(movesPath, JSON.stringify(movesOutput), 'utf-8');
	const movesSizeMB = (readFileSync(movesPath).length / 1024 / 1024).toFixed(2);
	console.log(`  moves-full.json: ${movesOutput.length} moves (${movesSizeMB} MB)`);

	// Game pokedex
	const gamePath = join(PUBLIC_DATA, 'pokedex-game.json');
	writeFileSync(gamePath, JSON.stringify(gamePokedex), 'utf-8');
	const gameSizeMB = (readFileSync(gamePath).length / 1024 / 1024).toFixed(2);
	console.log(`  pokedex-game.json: ${gamePokedex.length} Pokemon (${gameSizeMB} MB)`);

	console.log('\n=== Build Complete ===');

	// Print some stats
	const withMoves = gamePokedex.filter((p) => p.moves.length > 0).length;
	const withoutMoves = gamePokedex.filter((p) => p.moves.length === 0).length;
	console.log(`  Pokemon with moves: ${withMoves}`);
	console.log(`  Pokemon without moves: ${withoutMoves}`);

	if (withoutMoves > 0) {
		console.log('  Pokemon missing moves:');
		gamePokedex
			.filter((p) => p.moves.length === 0)
			.slice(0, 10)
			.forEach((p) => console.log(`    - ${p.name} (${p.id})`));
		if (withoutMoves > 10) console.log(`    ... and ${withoutMoves - 10} more`);
	}
}

main();
