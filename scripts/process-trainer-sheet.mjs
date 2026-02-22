#!/usr/bin/env node
/**
 * Trainer Spritesheet Extractor
 *
 * Slices the trainers-overworld.png mega-sheet into individual trainer walking
 * sprites and upscales them 2x using nearest-neighbor interpolation.
 *
 * Source sheet layout:
 *   - 957x1101px total
 *   - Blue background (0,128,255) used as chroma key — NOT alpha transparency
 *   - 10 columns x 8 rows = 80 trainers
 *   - Each trainer occupies a 3-col x 4-row block of individual frames
 *   - Frames are separated by blue gaps (variable widths)
 *
 * Actual per-cell direction mapping (source row, source col) → (direction, frame):
 *   (0,0) → UP   f0 (stand)   (0,1) → RIGHT f0   (0,2) → UP    f1
 *   (1,0) → LEFT f0           (1,1) → RIGHT f1   (1,2) → DOWN  f0 (stand)
 *   (2,0) → LEFT f1           (2,1) → RIGHT f2   (2,2) → DOWN  f1
 *   (3,0) → LEFT f2           (3,1) → UP    f2   (3,2) → DOWN  f2
 *
 * Output direction order (rows, top to bottom): down / left / right / up
 * (matching existing 4-frame character sheets so DIRECTION_UV_Y in NPCSprite3D works)
 *
 * Output:
 *   - src/assets/characts/final/walking/trainer-{0..79}.png
 *     Each file: (max_frame_w * 3 * SCALE) x (max_frame_h * 4 * SCALE) px
 *     Blue background converted to transparent
 *   - Appends/replaces 80 entries (IDs 10-89) in characters.json
 *
 * Usage: node scripts/process-trainer-sheet.mjs
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'src/assets/characts/tmp/trainers-overworld.png');
const OUTPUT_DIR = path.join(ROOT, 'src/assets/characts/final/walking');
const CHARACTERS_JSON = path.join(ROOT, 'src/assets/characts/final/characters.json');

const FRAMES_PER_DIR = 3;
const DIRS = 4;
const TRAINER_COLS = 10;
const TRAINER_ROWS = 8;
const SCALE = 2;
const FIRST_ID = 10;

// Blue chroma key color (background of the source sheet)
const BLUE_R = 0, BLUE_G = 128, BLUE_B = 255;

// Output direction order (row index in output PNG):
// Must match DIRECTION_UV_Y in NPCSprite3D.svelte: down=0.75(top), left=0.5, right=0.25, up=0.0(bottom)
const DIR_DOWN  = 0; // top row of output
const DIR_LEFT  = 1;
const DIR_RIGHT = 2;
const DIR_UP    = 3; // bottom row of output

// Maps (source_row, source_col) → [output_dir, output_frame]
// Derived from visual inspection of trainers-overworld.png
const CELL_MAP = [
	// source row 0
	[DIR_UP,    0], [DIR_RIGHT, 0], [DIR_UP,    1],
	// source row 1
	[DIR_LEFT,  0], [DIR_RIGHT, 1], [DIR_DOWN,  0],
	// source row 2
	[DIR_LEFT,  1], [DIR_RIGHT, 2], [DIR_DOWN,  1],
	// source row 3
	[DIR_LEFT,  2], [DIR_UP,    2], [DIR_DOWN,  2],
];

function readPng(filePath) {
	return new Promise((resolve, reject) => {
		fs.createReadStream(filePath)
			.pipe(new PNG())
			.on('parsed', function () {
				resolve(this);
			})
			.on('error', reject);
	});
}

function writePng(png, filePath) {
	return new Promise((resolve, reject) => {
		const buf = PNG.sync.write(png);
		fs.writeFile(filePath, buf, (err) => (err ? reject(err) : resolve()));
	});
}

function isBlue(r, g, b) {
	return r === BLUE_R && g === BLUE_G && b === BLUE_B;
}

/**
 * Find contiguous groups of columns/rows that contain non-blue pixels.
 * Returns array of [start, end] pairs (inclusive).
 */
function findGroups(counts, threshold = 3) {
	const groups = [];
	let inSprite = false;
	let start = 0;
	for (let i = 0; i < counts.length; i++) {
		const active = counts[i] > threshold;
		if (active && !inSprite) { start = i; inSprite = true; }
		if (!active && inSprite) { groups.push([start, i - 1]); inSprite = false; }
	}
	if (inSprite) groups.push([start, counts.length - 1]);
	return groups;
}

/**
 * Extract a single frame from the source PNG.
 * Converts blue background to transparent.
 */
function extractFrame(sheet, x0, y0, fw, fh) {
	const pixels = new Uint8Array(fw * fh * 4);
	for (let y = 0; y < fh; y++) {
		for (let x = 0; x < fw; x++) {
			const si = ((y0 + y) * sheet.width + (x0 + x)) * 4;
			const di = (y * fw + x) * 4;
			const r = sheet.data[si], g = sheet.data[si + 1], b = sheet.data[si + 2];
			if (isBlue(r, g, b)) {
				pixels[di] = pixels[di + 1] = pixels[di + 2] = pixels[di + 3] = 0;
			} else {
				pixels[di] = r;
				pixels[di + 1] = g;
				pixels[di + 2] = b;
				pixels[di + 3] = sheet.data[si + 3];
			}
		}
	}
	return pixels;
}

/**
 * Compose a trainer's 12 frames into a single PNG.
 * Output layout: DIRS rows (down/left/right/up) x FRAMES_PER_DIR cols.
 * Each cell is cellW x cellH (upscaled by SCALE), frame centered within cell.
 */
function composeTrainer(framesByDirFrame, frameWidths, frameHeights, cellW, cellH) {
	const outW = cellW * FRAMES_PER_DIR * SCALE;
	const outH = cellH * DIRS * SCALE;
	const out = new PNG({ width: outW, height: outH });
	out.data.fill(0);

	for (let dir = 0; dir < DIRS; dir++) {
		for (let frame = 0; frame < FRAMES_PER_DIR; frame++) {
			const key = dir * FRAMES_PER_DIR + frame;
			const srcPixels = framesByDirFrame[key];
			if (!srcPixels) continue;
			const fw = frameWidths[key];
			const fh = frameHeights[key];

			const offsetX = Math.floor((cellW - fw) / 2);
			const offsetY = Math.floor((cellH - fh) / 2);
			const destCellX = frame * cellW;
			const destCellY = dir * cellH;

			for (let y = 0; y < fh; y++) {
				for (let x = 0; x < fw; x++) {
					const si = (y * fw + x) * 4;
					const r = srcPixels[si], g = srcPixels[si + 1], b = srcPixels[si + 2], a = srcPixels[si + 3];
					if (a === 0) continue;
					for (let sy = 0; sy < SCALE; sy++) {
						for (let sx = 0; sx < SCALE; sx++) {
							const dx = (destCellX + offsetX + x) * SCALE + sx;
							const dy = (destCellY + offsetY + y) * SCALE + sy;
							const di = (dy * outW + dx) * 4;
							out.data[di] = r;
							out.data[di + 1] = g;
							out.data[di + 2] = b;
							out.data[di + 3] = a;
						}
					}
				}
			}
		}
	}
	return out;
}

async function main() {
	console.log('Reading source spritesheet...');
	const sheet = await readPng(SOURCE_PATH);
	console.log(`Sheet: ${sheet.width}x${sheet.height}px`);

	// Compute per-column and per-row non-blue pixel counts
	const SCAN_HEIGHT = sheet.height - 80;
	const colCounts = new Array(sheet.width).fill(0);
	const rowCounts = new Array(sheet.height).fill(0);

	for (let y = 0; y < SCAN_HEIGHT; y++) {
		for (let x = 0; x < sheet.width; x++) {
			const i = (y * sheet.width + x) * 4;
			const r = sheet.data[i], g = sheet.data[i + 1], b = sheet.data[i + 2], a = sheet.data[i + 3];
			if (!isBlue(r, g, b) && a > 10) {
				colCounts[x]++;
				rowCounts[y]++;
			}
		}
	}

	const colGroups = findGroups(colCounts);
	const rowGroupsAll = findGroups(rowCounts);
	const rowGroups = rowGroupsAll.filter(([s, e]) => e - s < 50);

	const expectedCols = TRAINER_COLS * FRAMES_PER_DIR;
	const expectedRows = TRAINER_ROWS * DIRS;
	console.log(`Column groups: ${colGroups.length} (expect ${expectedCols})`);
	console.log(`Row groups: ${rowGroups.length} (expect ${expectedRows})`);

	if (colGroups.length !== expectedCols) {
		throw new Error(`Expected ${expectedCols} column groups, got ${colGroups.length}`);
	}
	if (rowGroups.length !== expectedRows) {
		throw new Error(`Expected ${expectedRows} row groups, got ${rowGroups.length}`);
	}

	// Compute max frame dimensions for uniform cell size
	let maxFW = 0, maxFH = 0;
	for (const [s, e] of colGroups) maxFW = Math.max(maxFW, e - s + 1);
	for (const [s, e] of rowGroups) maxFH = Math.max(maxFH, e - s + 1);
	console.log(`Max frame size: ${maxFW}x${maxFH}px -> upscaled cell: ${maxFW*SCALE}x${maxFH*SCALE}px`);

	if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	const newCharacters = [];
	let count = 0;

	for (let trow = 0; trow < TRAINER_ROWS; trow++) {
		for (let tcol = 0; tcol < TRAINER_COLS; tcol++) {
			const index = trow * TRAINER_COLS + tcol;

			// Extract all 12 source cells, remapping to (output_dir, output_frame) via CELL_MAP
			// framesByDirFrame[dir * FRAMES_PER_DIR + frame] = pixel data
			const framesByDirFrame = {};
			const frameWidths = {};
			const frameHeights = {};

			for (let srcRow = 0; srcRow < DIRS; srcRow++) {
				for (let srcCol = 0; srcCol < FRAMES_PER_DIR; srcCol++) {
					const cellIdx = srcRow * FRAMES_PER_DIR + srcCol;
					const [outDir, outFrame] = CELL_MAP[cellIdx];
					const outKey = outDir * FRAMES_PER_DIR + outFrame;

					const rowGroupIdx = trow * DIRS + srcRow;
					const colGroupIdx = tcol * FRAMES_PER_DIR + srcCol;
					const [ry0, ry1] = rowGroups[rowGroupIdx];
					const [cx0, cx1] = colGroups[colGroupIdx];
					const fw = cx1 - cx0 + 1;
					const fh = ry1 - ry0 + 1;

					framesByDirFrame[outKey] = extractFrame(sheet, cx0, ry0, fw, fh);
					frameWidths[outKey] = fw;
					frameHeights[outKey] = fh;
				}
			}

			const png = composeTrainer(framesByDirFrame, frameWidths, frameHeights, maxFW, maxFH);
			const outputPath = path.join(OUTPUT_DIR, `trainer-${index}.png`);
			await writePng(png, outputPath);

			const id = FIRST_ID + index;
			newCharacters.push({
				id,
				name: `Trainer ${index}`,
				overworld: {
					walking: {
						source: `src/assets/characts/final/walking/trainer-${index}.png`,
						startX: 0,
						startY: 0,
						height: maxFH * SCALE,
						width: maxFW * SCALE,
						frameNumber: FRAMES_PER_DIR
					}
				}
			});

			count++;
			if (count % 10 === 0) process.stdout.write(`  Processed ${count}/${TRAINER_COLS * TRAINER_ROWS} trainers\n`);
		}
	}

	// Update characters.json: keep entries with id < FIRST_ID, replace trainer entries
	const existing = JSON.parse(fs.readFileSync(CHARACTERS_JSON, 'utf-8'));
	const base = existing.filter((c) => c.id < FIRST_ID);
	const updated = [...base, ...newCharacters];
	fs.writeFileSync(CHARACTERS_JSON, JSON.stringify(updated, null, 4));

	const cellW = maxFW * SCALE;
	const cellH = maxFH * SCALE;
	console.log(`\nDone! Extracted ${newCharacters.length} trainers.`);
	console.log(`Each sprite: ${cellW * FRAMES_PER_DIR}x${cellH * DIRS}px (${FRAMES_PER_DIR} frames x ${DIRS} dirs, each ${cellW}x${cellH}px)`);
	console.log(`Updated: ${CHARACTERS_JSON}`);
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
