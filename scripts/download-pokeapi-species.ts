import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SHOWDOWN_DIR = join(ROOT, 'src/assets/data/raw/showdown');
const OUTPUT_PATH = join(SHOWDOWN_DIR, 'species-extra.json');
const CACHE_DIR = join(SHOWDOWN_DIR, 'pokeapi-cache');

const MAX_CONCURRENT = 5;
const DELAY_BETWEEN_BATCHES_MS = 200;

const GROWTH_RATE_MAP: Record<string, number> = {
	slow: 1,
	medium: 2,
	fast: 3,
	'medium-slow': 4,
	'slow-then-very-fast': 5,
	'fast-then-very-slow': 6
};

interface SpeciesExtra {
	captureRate: number;
	growthRateId: number;
	baseXp: number;
	genderRate: number; // PokeAPI format: -1=genderless, 0-8 scale
	percentageMale: number;
	description: string;
	isLegendary: boolean;
	isMythical: boolean;
}

function genderRateToPercentMale(genderRate: number): number {
	if (genderRate === -1) return -1; // genderless
	// PokeAPI: 0 = 100% male, 8 = 100% female
	// Each increment = 12.5% more female
	return Math.round((1 - genderRate / 8) * 100);
}

async function fetchWithCache(url: string, cacheKey: string): Promise<unknown | null> {
	const cachePath = join(CACHE_DIR, `${cacheKey}.json`);

	if (existsSync(cachePath)) {
		return JSON.parse(readFileSync(cachePath, 'utf-8'));
	}

	try {
		const response = await fetch(url);
		if (!response.ok) {
			if (response.status === 404) return null;
			console.error(`  FAIL [${response.status}] ${url}`);
			return null;
		}
		const data = await response.json();
		writeFileSync(cachePath, JSON.stringify(data), 'utf-8');
		return data;
	} catch (err) {
		console.error(`  ERROR ${url}: ${err}`);
		return null;
	}
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
	const pokedexPath = join(SHOWDOWN_DIR, 'pokedex.json');

	if (!existsSync(pokedexPath)) {
		console.error('Showdown pokedex.json not found. Run download-showdown-data.ts first.');
		process.exit(1);
	}

	if (!existsSync(CACHE_DIR)) {
		mkdirSync(CACHE_DIR, { recursive: true });
	}

	// Load existing output if any (to merge incrementally)
	let existing: Record<string, SpeciesExtra> = {};
	if (existsSync(OUTPUT_PATH)) {
		existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
	}

	const pokedex: Record<string, { num: number; name: string; isNonstandard?: string }> =
		JSON.parse(readFileSync(pokedexPath, 'utf-8'));

	// Collect unique national dex numbers
	const uniqueNums = new Set<number>();
	for (const pokemon of Object.values(pokedex)) {
		if (pokemon.num > 0 && pokemon.isNonstandard !== 'CAP' && pokemon.isNonstandard !== 'Custom') {
			uniqueNums.add(pokemon.num);
		}
	}

	const numsList = Array.from(uniqueNums).sort((a, b) => a - b);
	console.log(`Found ${numsList.length} unique species to fetch from PokeAPI.\n`);

	// Filter to ones we haven't fetched yet
	const toFetch = numsList.filter((num) => !existing[String(num)]);
	console.log(`Already have ${numsList.length - toFetch.length}, need to fetch ${toFetch.length}.\n`);

	let succeeded = 0;
	let failed = 0;

	for (let i = 0; i < toFetch.length; i += MAX_CONCURRENT) {
		const batch = toFetch.slice(i, i + MAX_CONCURRENT);

		await Promise.all(
			batch.map(async (num) => {
				// Fetch species data (capture rate, growth rate, gender, description, legendary)
				const speciesData = (await fetchWithCache(
					`https://pokeapi.co/api/v2/pokemon-species/${num}`,
					`species-${num}`
				)) as Record<string, unknown> | null;

				// Fetch pokemon data (base experience)
				const pokemonData = (await fetchWithCache(
					`https://pokeapi.co/api/v2/pokemon/${num}`,
					`pokemon-${num}`
				)) as Record<string, unknown> | null;

				if (!speciesData) {
					failed++;
					return;
				}

				// Extract description (English, latest gen)
				let description = '';
				const flavorEntries = speciesData.flavor_text_entries as
					| { flavor_text: string; language: { name: string }; version: { name: string } }[]
					| undefined;
				if (flavorEntries) {
					const englishEntries = flavorEntries.filter((e) => e.language.name === 'en');
					if (englishEntries.length > 0) {
						// Take the last English entry (latest gen)
						description = englishEntries[englishEntries.length - 1].flavor_text
							.replace(/\n/g, ' ')
							.replace(/\f/g, ' ')
							.replace(/\s+/g, ' ')
							.trim();
					}
				}

				const growthRate = speciesData.growth_rate as { name: string } | undefined;
				const genderRate = (speciesData.gender_rate as number) ?? -1;

				const entry: SpeciesExtra = {
					captureRate: (speciesData.capture_rate as number) ?? 45,
					growthRateId: GROWTH_RATE_MAP[growthRate?.name ?? 'medium'] ?? 2,
					baseXp: (pokemonData?.base_experience as number) ?? 100,
					genderRate,
					percentageMale: genderRateToPercentMale(genderRate),
					description,
					isLegendary: (speciesData.is_legendary as boolean) ?? false,
					isMythical: (speciesData.is_mythical as boolean) ?? false
				};

				existing[String(num)] = entry;
				succeeded++;
			})
		);

		// Progress report
		const done = Math.min(i + MAX_CONCURRENT, toFetch.length);
		if (done % 50 === 0 || done === toFetch.length) {
			console.log(`Progress: ${done}/${toFetch.length} (${succeeded} ok, ${failed} failed)`);
		}

		// Save incrementally every 50
		if (done % 50 === 0 || done === toFetch.length) {
			writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2), 'utf-8');
		}

		if (i + MAX_CONCURRENT < toFetch.length) {
			await delay(DELAY_BETWEEN_BATCHES_MS);
		}
	}

	// Final save
	writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2), 'utf-8');

	console.log(`\n=== PokeAPI Species Download Complete ===`);
	console.log(`Total species: ${numsList.length}`);
	console.log(`Fetched: ${succeeded}`);
	console.log(`Failed: ${failed}`);
	console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);
