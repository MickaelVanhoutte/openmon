import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SPECIAL_CASES: Record<string, string> = {
	'mr. mime': 'mrmime',
	'mime jr.': 'mimejr',
	'mr. rime': 'mrrime',
	'nidoran♀': 'nidoranf',
	'nidoran♂': 'nidoranm',
	"farfetch'd": 'farfetchd',
	'ho-oh': 'hooh',
	'porygon-z': 'porygonz',
	'type: null': 'typenull',
	'jangmo-o': 'jangmoo',
	'hakamo-o': 'hakamoo',
	'kommo-o': 'kommoo',
	'tapu koko': 'tapukoko',
	'tapu lele': 'tapulele',
	'tapu bulu': 'tapubulu',
	'tapu fini': 'tapufini',
	flabébé: 'flabebe'
};

const REGIONAL_FORMS: Record<string, string> = {
	alolan: 'alola',
	galarian: 'galar',
	hisuian: 'hisui',
	paldean: 'paldea'
};

function normalizeName(name: string): string {
	const lower = name.toLowerCase().trim();

	if (SPECIAL_CASES[lower]) {
		return SPECIAL_CASES[lower];
	}

	const megaMatch = lower.match(/^mega (.+?)( [xy])?$/);
	if (megaMatch) {
		const baseName = megaMatch[1].replace(/[^a-z0-9]/g, '');
		const suffix = megaMatch[2] ? megaMatch[2].trim() : '';
		return `${baseName}mega${suffix}`;
	}

	for (const [form, suffix] of Object.entries(REGIONAL_FORMS)) {
		if (lower.startsWith(form + ' ')) {
			const baseName = lower.slice(form.length + 1).replace(/[^a-z0-9]/g, '');
			return `${baseName}${suffix}`;
		}
	}

	return lower.replace(/[^a-z0-9]/g, '');
}

interface PokedexEntry {
	id: number;
	name: string;
}

async function downloadCry(name: string, normalized: string, outputDir: string): Promise<boolean> {
	const url = `https://play.pokemonshowdown.com/audio/cries/${normalized}.mp3`;
	const outputPath = join(outputDir, `${normalized}.mp3`);

	if (existsSync(outputPath)) {
		return true;
	}

	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`  FAIL [${response.status}] ${name} → ${normalized}`);
			return false;
		}
		const buffer = await response.arrayBuffer();
		writeFileSync(outputPath, Buffer.from(buffer));
		return true;
	} catch (err) {
		console.error(`  ERROR ${name} → ${normalized}: ${err}`);
		return false;
	}
}

async function main() {
	const pokedexPath = join(ROOT, 'src/assets/data/final/beta/pokedex-animatedV3.json');
	const outputDir = join(ROOT, 'src/assets/audio/cries');

	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	const pokedex: PokedexEntry[] = JSON.parse(readFileSync(pokedexPath, 'utf-8'));
	const total = pokedex.length;

	console.log(`Downloading cries for ${total} Pokemon...`);

	let succeeded = 0;
	let skipped = 0;
	let failed = 0;
	const failures: string[] = [];

	for (let i = 0; i < pokedex.length; i++) {
		const entry = pokedex[i];
		const normalized = normalizeName(entry.name);
		const outputPath = join(outputDir, `${normalized}.mp3`);

		if (existsSync(outputPath)) {
			skipped++;
			if ((i + 1) % 50 === 0 || i + 1 === total) {
				console.log(
					`Progress: ${i + 1}/${total} (${succeeded} downloaded, ${skipped} skipped, ${failed} failed)`
				);
			}
			continue;
		}

		const ok = await downloadCry(entry.name, normalized, outputDir);
		if (ok) {
			succeeded++;
		} else {
			failed++;
			failures.push(`${entry.name} → ${normalized}`);
		}

		if ((i + 1) % 10 === 0 || i + 1 === total) {
			console.log(
				`Progress: ${i + 1}/${total} (${succeeded} downloaded, ${skipped} skipped, ${failed} failed)`
			);
		}
	}

	console.log('\n=== Download Complete ===');
	console.log(`Total: ${total}`);
	console.log(`Downloaded: ${succeeded}`);
	console.log(`Skipped (already existed): ${skipped}`);
	console.log(`Failed: ${failed}`);

	if (failures.length > 0) {
		console.log('\nFailed Pokemon:');
		failures.forEach((f) => console.log(`  - ${f}`));
	}
}

main().catch(console.error);
