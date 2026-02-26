import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SHOWDOWN_BASE = 'https://play.pokemonshowdown.com/sprites';
const SPRITE_DIRS = ['ani', 'ani-back', 'ani-shiny', 'ani-back-shiny'];
const OUTPUT_BASE = join(ROOT, 'src/assets/monsters/showdown');
const MAX_CONCURRENT = 10;

/**
 * Derives the Showdown sprite filename from the pokedex entry name.
 * Showdown sprite files use the display name lowercased with spaces removed.
 * Examples:
 *   "Charizard" -> "charizard"
 *   "Charizard-Mega-X" -> "charizard-megax"
 *   "Charizard-Mega-Y" -> "charizard-megay"
 *   "Mr. Mime" -> "mrmime"
 *   "Nidoran-F" -> "nidoranf" (but file is nidoran-f)
 *   "Wormadam-Sandy" -> "wormadam-sandy"
 *   "Darmanitan-Galar-Zen" -> "darmanitan-galar-zen"
 *
 * The actual convention is: Showdown uses toID() for keys (strips everything),
 * but for sprites uses a different convention that preserves hyphens in some cases.
 * We derive the sprite name by lowercasing and handling known patterns.
 */
/**
 * Special cases where the Showdown sprite filename doesn't match the standard derivation.
 * These Pokemon have hyphens in their canonical name that Showdown's sprite system removes.
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
	// Start with the display name, lowercase it
	let spriteName = name.toLowerCase();

	// Remove special characters but keep hyphens
	spriteName = spriteName
		.replace(/[.':\s%]+/g, '') // Remove dots, apostrophes, colons, spaces, percent signs
		.replace(/♀/g, '-f')
		.replace(/♂/g, '-m')
		.replace(/é/g, 'e');

	// Showdown sprite convention: "Mega-X" -> "megax", "Mega-Y" -> "megay"
	spriteName = spriteName.replace(/-mega-x$/, '-megax');
	spriteName = spriteName.replace(/-mega-y$/, '-megay');

	// Apply overrides for names where hyphens are removed
	if (SPRITE_NAME_OVERRIDES[spriteName]) {
		return SPRITE_NAME_OVERRIDES[spriteName];
	}

	return spriteName;
}

interface ShowdownPokemon {
	num: number;
	name: string;
	baseSpecies?: string;
	forme?: string;
	isNonstandard?: string;
}

async function downloadSprite(
	spriteName: string,
	dir: string,
	outputDir: string
): Promise<{ ok: boolean; status?: number }> {
	const url = `${SHOWDOWN_BASE}/${dir}/${spriteName}.gif`;
	const outputPath = join(outputDir, `${spriteName}.gif`);

	if (existsSync(outputPath)) {
		return { ok: true };
	}

	try {
		const response = await fetch(url);
		if (!response.ok) {
			return { ok: false, status: response.status };
		}
		const buffer = await response.arrayBuffer();
		writeFileSync(outputPath, Buffer.from(buffer));
		return { ok: true };
	} catch {
		return { ok: false };
	}
}

async function processInBatches<T>(
	items: T[],
	batchSize: number,
	processor: (item: T) => Promise<void>
): Promise<void> {
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await Promise.all(batch.map(processor));
	}
}

async function main() {
	const pokedexPath = join(ROOT, 'src/assets/data/raw/showdown/pokedex.json');

	if (!existsSync(pokedexPath)) {
		console.error('Showdown pokedex.json not found. Run download-showdown-data.ts first.');
		process.exit(1);
	}

	const pokedex: Record<string, ShowdownPokemon> = JSON.parse(
		readFileSync(pokedexPath, 'utf-8')
	);

	// Create output directories
	for (const dir of SPRITE_DIRS) {
		const outputDir = join(OUTPUT_BASE, dir);
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
		}
	}

	// Build the list of Pokemon to download sprites for
	// Filter out CAP (Create-A-Pokemon) and other non-standard entries we don't want
	const pokemonList: { key: string; spriteName: string; name: string }[] = [];
	const seenSpriteNames = new Set<string>();

	for (const [key, pokemon] of Object.entries(pokedex)) {
		// Skip CAP Pokemon and other non-standard
		if (pokemon.isNonstandard === 'CAP' || pokemon.isNonstandard === 'Custom') {
			continue;
		}
		// Skip Pokemon with num <= 0 (missingno, etc.) except cosmetic forms
		if (pokemon.num <= 0) {
			continue;
		}

		const spriteName = deriveSpriteName(pokemon.name);

		// Avoid duplicates
		if (seenSpriteNames.has(spriteName)) {
			continue;
		}
		seenSpriteNames.add(spriteName);

		pokemonList.push({ key, spriteName, name: pokemon.name });
	}

	console.log(`Found ${pokemonList.length} Pokemon to download sprites for.`);
	console.log(`Downloading from ${SPRITE_DIRS.length} directories...\n`);

	let totalDownloaded = 0;
	let totalSkipped = 0;
	let totalFailed = 0;
	const failures: string[] = [];

	for (const dir of SPRITE_DIRS) {
		const outputDir = join(OUTPUT_BASE, dir);
		let dirDownloaded = 0;
		let dirSkipped = 0;
		let dirFailed = 0;

		console.log(`\n--- ${dir} ---`);

		await processInBatches(pokemonList, MAX_CONCURRENT, async (pokemon) => {
			const result = await downloadSprite(pokemon.spriteName, dir, outputDir);
			if (result.ok) {
				if (existsSync(join(outputDir, `${pokemon.spriteName}.gif`))) {
					// Could be either downloaded or skipped
					dirDownloaded++;
				}
			} else {
				dirFailed++;
				if (result.status !== 404) {
					// 404s are expected for some forms, only log other errors
					failures.push(`${dir}/${pokemon.spriteName} (${pokemon.name}) [${result.status}]`);
				}
			}
		});

		console.log(`  Downloaded/existing: ${dirDownloaded}, Failed: ${dirFailed}`);
		totalDownloaded += dirDownloaded;
		totalSkipped += dirSkipped;
		totalFailed += dirFailed;
	}

	console.log(`\n=== Sprite Download Complete ===`);
	console.log(`Total downloaded/existing: ${totalDownloaded}`);
	console.log(`Total failed: ${totalFailed}`);

	if (failures.length > 0 && failures.length < 50) {
		console.log(`\nNon-404 failures:`);
		failures.forEach((f) => console.log(`  - ${f}`));
	} else if (failures.length >= 50) {
		console.log(`\n${failures.length} non-404 failures (too many to list)`);
	}
}

main().catch(console.error);
