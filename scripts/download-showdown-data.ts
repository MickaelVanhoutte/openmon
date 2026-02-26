import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'src/assets/data/raw/showdown');

const SHOWDOWN_DATA_URLS: Record<string, string> = {
	'pokedex.json': 'https://play.pokemonshowdown.com/data/pokedex.json',
	'moves.json': 'https://play.pokemonshowdown.com/data/moves.json',
	'learnsets.json': 'https://play.pokemonshowdown.com/data/learnsets.json'
};

async function downloadFile(filename: string, url: string): Promise<boolean> {
	const outputPath = join(OUTPUT_DIR, filename);

	try {
		console.log(`Downloading ${filename}...`);
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`  FAIL [${response.status}] ${url}`);
			return false;
		}
		const text = await response.text();
		writeFileSync(outputPath, text, 'utf-8');
		const sizeMB = (Buffer.byteLength(text, 'utf-8') / 1024 / 1024).toFixed(2);
		console.log(`  OK ${filename} (${sizeMB} MB)`);
		return true;
	} catch (err) {
		console.error(`  ERROR ${filename}: ${err}`);
		return false;
	}
}

async function main() {
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	console.log('Downloading Showdown data files...\n');

	let succeeded = 0;
	let failed = 0;

	for (const [filename, url] of Object.entries(SHOWDOWN_DATA_URLS)) {
		const ok = await downloadFile(filename, url);
		if (ok) succeeded++;
		else failed++;
	}

	console.log(`\n=== Download Complete ===`);
	console.log(`Succeeded: ${succeeded}`);
	console.log(`Failed: ${failed}`);

	if (failed > 0) {
		process.exit(1);
	}
}

main().catch(console.error);
