/**
 * Convert animated GIF sprites to horizontal-strip PNG sprite sheets
 * with JSON metadata for use as Three.js textures.
 *
 * Input:  src/assets/monsters/showdown/{ani,ani-back,ani-shiny,ani-back-shiny}/*.gif
 * Output: src/assets/monsters/showdown/sheets/{dir}/{name}.png + {name}.json
 *
 * Usage: npx tsx scripts/convert-gifs-to-sheets.ts [--force]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { PNG } from 'pngjs';

// omggif is a CommonJS module with no types
const require = createRequire(import.meta.url);
const { GifReader } = require('omggif');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DIRS = ['ani', 'ani-back', 'ani-shiny', 'ani-back-shiny'];
const SHOWDOWN_BASE = join(ROOT, 'src/assets/monsters/showdown');
const SHEETS_BASE = join(SHOWDOWN_BASE, 'sheets');
const FORCE = process.argv.includes('--force');

interface SheetMetadata {
	frameCount: number;
	frameWidth: number;
	frameHeight: number;
	durations: number[];
}

function convertGif(gifPath: string, outPngPath: string, outJsonPath: string): boolean {
	const buffer = readFileSync(gifPath);
	const reader = new GifReader(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));

	const frameCount: number = reader.numFrames();
	const width: number = reader.width;
	const height: number = reader.height;

	if (frameCount === 0) return false;

	// Decode all frames with proper disposal handling
	const frames: Uint8Array[] = [];
	const durations: number[] = [];
	const canvas = new Uint8Array(width * height * 4); // compositing canvas
	const prevCanvas = new Uint8Array(width * height * 4); // for disposal=3 (restore previous)

	for (let i = 0; i < frameCount; i++) {
		const frameInfo = reader.frameInfo(i);
		// GIF delay is in centiseconds (1/100th of a second)
		const delayMs = Math.max((frameInfo.delay || 10) * 10, 20); // min 20ms
		durations.push(delayMs);

		// Save current canvas state before applying this frame (for disposal=3)
		prevCanvas.set(canvas);

		// Decode frame pixels into a temporary buffer
		const framePixels = new Uint8Array(width * height * 4);
		reader.decodeAndBlitFrameRGBA(i, framePixels);

		// Composite frame onto canvas
		// Only overwrite pixels that have non-zero alpha from the new frame
		const fx = frameInfo.x || 0;
		const fy = frameInfo.y || 0;
		const fw = frameInfo.width || width;
		const fh = frameInfo.height || height;

		for (let py = fy; py < fy + fh; py++) {
			for (let px = fx; px < fx + fw; px++) {
				const idx = (py * width + px) * 4;
				if (framePixels[idx + 3] > 0) {
					canvas[idx] = framePixels[idx];
					canvas[idx + 1] = framePixels[idx + 1];
					canvas[idx + 2] = framePixels[idx + 2];
					canvas[idx + 3] = framePixels[idx + 3];
				}
			}
		}

		// Store snapshot of the composited canvas as this frame
		frames.push(new Uint8Array(canvas));

		// Handle disposal method
		const disposal = frameInfo.disposal;
		if (disposal === 2) {
			// Restore to background (clear the frame area)
			for (let py = fy; py < fy + fh; py++) {
				for (let px = fx; px < fx + fw; px++) {
					const idx = (py * width + px) * 4;
					canvas[idx] = 0;
					canvas[idx + 1] = 0;
					canvas[idx + 2] = 0;
					canvas[idx + 3] = 0;
				}
			}
		} else if (disposal === 3) {
			// Restore to previous state
			canvas.set(prevCanvas);
		}
		// disposal === 0 or 1: leave canvas as-is (no disposal)
	}

	// Compose horizontal strip PNG
	const totalWidth = width * frameCount;
	const png = new PNG({ width: totalWidth, height });

	for (let f = 0; f < frameCount; f++) {
		const frame = frames[f];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const srcIdx = (y * width + x) * 4;
				const dstIdx = (y * totalWidth + (f * width + x)) * 4;
				png.data[dstIdx] = frame[srcIdx];
				png.data[dstIdx + 1] = frame[srcIdx + 1];
				png.data[dstIdx + 2] = frame[srcIdx + 2];
				png.data[dstIdx + 3] = frame[srcIdx + 3];
			}
		}
	}

	writeFileSync(outPngPath, PNG.sync.write(png));

	const meta: SheetMetadata = {
		frameCount,
		frameWidth: width,
		frameHeight: height,
		durations
	};
	writeFileSync(outJsonPath, JSON.stringify(meta));

	return true;
}

function processDirectory(dirName: string): void {
	const srcDir = join(SHOWDOWN_BASE, dirName);
	const outDir = join(SHEETS_BASE, dirName);

	if (!existsSync(srcDir)) {
		console.log(`  Skipping ${dirName} (not found)`);
		return;
	}

	mkdirSync(outDir, { recursive: true });

	const gifs = readdirSync(srcDir).filter((f) => f.endsWith('.gif'));
	let processed = 0;
	let skipped = 0;
	let failed = 0;

	for (const gif of gifs) {
		const name = basename(gif, '.gif');
		const outPng = join(outDir, `${name}.png`);
		const outJson = join(outDir, `${name}.json`);

		if (!FORCE && existsSync(outPng) && existsSync(outJson)) {
			skipped++;
			continue;
		}

		try {
			if (convertGif(join(srcDir, gif), outPng, outJson)) {
				processed++;
			} else {
				failed++;
			}
		} catch (e) {
			console.error(`  Failed: ${gif} - ${(e as Error).message}`);
			failed++;
		}
	}

	console.log(
		`  ${dirName}: ${processed} converted, ${skipped} skipped, ${failed} failed (${gifs.length} total)`
	);
}

console.log('Converting GIF sprites to sprite sheets...\n');
const start = Date.now();

for (const dir of DIRS) {
	processDirectory(dir);
}

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\nDone in ${elapsed}s`);
