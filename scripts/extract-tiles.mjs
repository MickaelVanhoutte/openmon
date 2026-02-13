#!/usr/bin/env node
/**
 * HGSS Tile Extractor
 *
 * Extracts individual 32x32 terrain tiles from RPGMAKER XP tilesets.
 * Coordinates were visually verified from the source PNGs.
 *
 * Output: src/assets/tileset/tiles/*.png
 *
 * Usage: node scripts/extract-tiles.mjs
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILE_SIZE = 32;
const ASSET_DIR = path.resolve(__dirname, '../src/assets/tileset');
const SOURCE_DIR = path.join(ASSET_DIR, 'HGSS for RMXP');
const OUTPUT_DIR = path.join(ASSET_DIR, 'tiles');

const TILES = [
	{ name: 'grass', source: 'NatureRMXP.png', x: 672, y: 32 },
	{ name: 'path', source: 'NatureRMXP.png', x: 1184, y: 32 },
	{ name: 'water', source: 'NatureRMXP.png', x: 32, y: 32 },
	{ name: 'sand', source: 'NatureRMXP.png', x: 160, y: 32 },
	{ name: 'tree_ground', source: 'NatureRMXP.png', x: 800, y: 32 },
	{ name: 'flower_ground', source: 'NatureRMXP.png', x: 672, y: 288 },
	{ name: 'tall_grass', source: 'NatureRMXP.png', x: 160, y: 160 },
	{ name: 'wall', source: 'NatureRMXP.png', x: 1056, y: 32 },
	{ name: 'swamp', source: 'NatureRMXP.png', x: 160, y: 288 },
	{ name: 'building_floor', source: 'UrbanRMXP.png', x: 32, y: 672 },
	{ name: 'dungeon_floor', source: 'UrbanRMXP.png', x: 160, y: 544 },
	{ name: 'rest_floor', source: 'UrbanRMXP.png', x: 160, y: 288 },
	{ name: 'shop_floor', source: 'UrbanRMXP.png', x: 32, y: 800 },
	{ name: 'dark_floor', source: 'UrbanRMXP.png', x: 416, y: 416 }
];

const sourceCache = new Map();

function loadSource(filename) {
	if (!sourceCache.has(filename)) {
		const filePath = path.join(SOURCE_DIR, filename);
		const data = fs.readFileSync(filePath);
		sourceCache.set(filename, PNG.sync.read(data));
	}
	return sourceCache.get(filename);
}

function extractTile(tile) {
	const src = loadSource(tile.source);
	const dst = new PNG({ width: TILE_SIZE, height: TILE_SIZE });
	PNG.bitblt(src, dst, tile.x, tile.y, TILE_SIZE, TILE_SIZE, 0, 0);
	const outPath = path.join(OUTPUT_DIR, `${tile.name}.png`);
	fs.writeFileSync(outPath, PNG.sync.write(dst));
	console.log(`  extracted ${tile.name} (${tile.x}, ${tile.y}) from ${tile.source}`);
}

console.log('Extracting tiles from HGSS tilesets...\n');

if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (const tile of TILES) {
	extractTile(tile);
}

console.log(`\nDone! Extracted ${TILES.length} tiles to ${OUTPUT_DIR}`);
