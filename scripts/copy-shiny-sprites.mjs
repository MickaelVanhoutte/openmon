#!/usr/bin/env node
/**
 * Copies shiny PMD sprites from SpriteCollab to project assets.
 *
 * Source: ../pokemon_sprites/SpriteCollab/sprite/{id}/0000/0001/
 * Dest: src/assets/monsters/pmd/{id}/shiny/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPRITE_COLLAB_DIR = path.join(__dirname, '../../pokemon_sprites/SpriteCollab/sprite');
const PMD_ASSETS_DIR = path.join(__dirname, '../src/assets/monsters/pmd');

const REQUIRED_FILES = ['Walk-Anim.png', 'Idle-Anim.png', 'AnimData.xml'];

async function main() {
	console.log('Copying shiny PMD sprites...\n');

	const pokemonFolders = fs.readdirSync(PMD_ASSETS_DIR).filter((f) => {
		const fullPath = path.join(PMD_ASSETS_DIR, f);
		return fs.statSync(fullPath).isDirectory() && /^\d{4}$/.test(f);
	});

	let copied = 0;
	let skipped = 0;
	let missing = 0;

	for (const pokemonId of pokemonFolders) {
		const shinySourceDir = path.join(SPRITE_COLLAB_DIR, pokemonId, '0000', '0001');
		const shinyDestDir = path.join(PMD_ASSETS_DIR, pokemonId, 'shiny');

		if (!fs.existsSync(shinySourceDir)) {
			missing++;
			continue;
		}

		const walkExists = fs.existsSync(path.join(shinySourceDir, 'Walk-Anim.png'));
		if (!walkExists) {
			missing++;
			continue;
		}

		if (fs.existsSync(path.join(shinyDestDir, 'Walk-Anim.png'))) {
			skipped++;
			continue;
		}

		fs.mkdirSync(shinyDestDir, { recursive: true });

		for (const file of REQUIRED_FILES) {
			const srcFile = path.join(shinySourceDir, file);
			const destFile = path.join(shinyDestDir, file);

			if (fs.existsSync(srcFile)) {
				fs.copyFileSync(srcFile, destFile);
			}
		}

		copied++;
		if (copied % 100 === 0) {
			console.log(`  Copied ${copied}...`);
		}
	}

	console.log(`\nDone!`);
	console.log(`  Copied: ${copied}`);
	console.log(`  Already existed: ${skipped}`);
	console.log(`  No shiny available: ${missing}`);
}

main().catch(console.error);
