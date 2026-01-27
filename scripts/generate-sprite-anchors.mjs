#!/usr/bin/env node
/**
 * Sprite Anchor Generator
 *
 * Analyzes PMD sprite images to find the bottom-most non-transparent pixel
 * for each direction, generating anchor offset data for proper positioning.
 *
 * Output: src/assets/monsters/pmd/sprite-anchors.json
 *
 * Usage: node scripts/generate-sprite-anchors.mjs
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PMD_SPRITE_DIR = path.join(__dirname, '../src/assets/monsters/pmd');
const OUTPUT_FILE = path.join(PMD_SPRITE_DIR, 'sprite-anchors.json');

// PMD sprites have 8 directions in rows: down, down-right, right, up-right, up, up-left, left, down-left
const DIRECTION_COUNT = 8;
const DIRECTION_NAMES = [
	'down',
	'down-right',
	'right',
	'up-right',
	'up',
	'up-left',
	'left',
	'down-left'
];

/**
 * Parse AnimData.xml to get frame dimensions
 */
function parseAnimDataXml(xmlPath) {
	const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
	const animations = {};

	// Extract ShadowSize
	const shadowMatch = xmlContent.match(/<ShadowSize>(\d+)<\/ShadowSize>/);
	const shadowSize = shadowMatch ? parseInt(shadowMatch[1], 10) : 1;

	// Extract each animation's frame dimensions
	const animRegex =
		/<Anim>[\s\S]*?<Name>(\w+)<\/Name>[\s\S]*?<FrameWidth>(\d+)<\/FrameWidth>[\s\S]*?<FrameHeight>(\d+)<\/FrameHeight>[\s\S]*?<\/Anim>/g;

	let match;
	while ((match = animRegex.exec(xmlContent)) !== null) {
		const [, name, frameWidth, frameHeight] = match;
		animations[name] = {
			frameWidth: parseInt(frameWidth, 10),
			frameHeight: parseInt(frameHeight, 10)
		};
	}

	return { shadowSize, animations };
}

/**
 * Analyze a single frame to find the bottom-most non-transparent pixel
 * Returns the Y offset from the bottom of the frame to the "feet"
 */
function analyzeFrame(png, startX, startY, frameWidth, frameHeight) {
	let bottomMostY = 0;
	let hasContent = false;

	// Scan from bottom to top to find the bottom-most non-transparent pixel
	for (let y = frameHeight - 1; y >= 0; y--) {
		for (let x = 0; x < frameWidth; x++) {
			const imgX = startX + x;
			const imgY = startY + y;
			const idx = (png.width * imgY + imgX) * 4;
			const alpha = png.data[idx + 3];

			if (alpha > 10) {
				// Non-transparent pixel found
				bottomMostY = y;
				hasContent = true;
				// Found the bottom row with content, break inner loop
				break;
			}
		}
		if (hasContent) break;
	}

	// Return how many pixels from the bottom of the frame to the feet
	// 0 means feet are at the very bottom, positive means there's padding below
	return {
		bottomOffset: frameHeight - 1 - bottomMostY,
		hasContent
	};
}

/**
 * Analyze a sprite sheet and find anchor offsets for each direction
 */
function analyzeSpriteSheet(pngPath, frameWidth, frameHeight) {
	const pngData = fs.readFileSync(pngPath);
	const png = PNG.sync.read(pngData);

	const directionOffsets = {};
	const frameCount = Math.floor(png.width / frameWidth);

	for (let dir = 0; dir < DIRECTION_COUNT; dir++) {
		const dirName = DIRECTION_NAMES[dir];
		let maxBottomOffset = 0;

		// Analyze all frames for this direction and take the minimum bottom offset
		// (the frame where feet are closest to the bottom)
		for (let frame = 0; frame < frameCount; frame++) {
			const startX = frame * frameWidth;
			const startY = dir * frameHeight;

			const { bottomOffset, hasContent } = analyzeFrame(
				png,
				startX,
				startY,
				frameWidth,
				frameHeight
			);

			if (hasContent) {
				// We want the maximum bottom offset across frames
				// This ensures we anchor at the lowest point the sprite reaches
				maxBottomOffset = Math.max(maxBottomOffset, bottomOffset);
			}
		}

		directionOffsets[dirName] = maxBottomOffset;
	}

	// Calculate the average for a single anchor value (simpler to use)
	const offsets = Object.values(directionOffsets);
	const avgOffset = Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length);

	return {
		perDirection: directionOffsets,
		average: avgOffset,
		frameWidth,
		frameHeight
	};
}

/**
 * Process all Pokemon sprite folders
 */
async function main() {
	console.log('Analyzing PMD sprite anchors...\n');

	const anchors = {};
	const folders = fs.readdirSync(PMD_SPRITE_DIR).filter((f) => {
		const fullPath = path.join(PMD_SPRITE_DIR, f);
		return fs.statSync(fullPath).isDirectory() && /^\d{4}$/.test(f);
	});

	let processed = 0;
	let skipped = 0;

	for (const folder of folders) {
		const pokemonId = parseInt(folder, 10);
		const folderPath = path.join(PMD_SPRITE_DIR, folder);

		const animDataPath = path.join(folderPath, 'AnimData.xml');
		const walkSpritePath = path.join(folderPath, 'Walk-Anim.png');

		if (!fs.existsSync(animDataPath) || !fs.existsSync(walkSpritePath)) {
			console.log(`  Skipping ${folder}: missing AnimData.xml or Walk-Anim.png`);
			skipped++;
			continue;
		}

		try {
			const animData = parseAnimDataXml(animDataPath);
			const walkAnim = animData.animations['Walk'];

			if (!walkAnim) {
				console.log(`  Skipping ${folder}: no Walk animation in AnimData.xml`);
				skipped++;
				continue;
			}

			const walkAnalysis = analyzeSpriteSheet(
				walkSpritePath,
				walkAnim.frameWidth,
				walkAnim.frameHeight
			);

			// Also analyze Idle if available
			let idleAnalysis = null;
			const idleSpritePath = path.join(folderPath, 'Idle-Anim.png');
			if (fs.existsSync(idleSpritePath) && animData.animations['Idle']) {
				const idleAnim = animData.animations['Idle'];
				idleAnalysis = analyzeSpriteSheet(
					idleSpritePath,
					idleAnim.frameWidth,
					idleAnim.frameHeight
				);
			}

			anchors[pokemonId] = {
				shadowSize: animData.shadowSize,
				walk: {
					bottomOffset: walkAnalysis.average,
					frameWidth: walkAnalysis.frameWidth,
					frameHeight: walkAnalysis.frameHeight
				},
				idle: idleAnalysis
					? {
							bottomOffset: idleAnalysis.average,
							frameWidth: idleAnalysis.frameWidth,
							frameHeight: idleAnalysis.frameHeight
						}
					: null
			};

			processed++;
			if (processed % 50 === 0) {
				console.log(`  Processed ${processed}/${folders.length}...`);
			}
		} catch (err) {
			console.error(`  Error processing ${folder}:`, err.message);
			skipped++;
		}
	}

	// Write output
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(anchors, null, '\t'));

	console.log(`\nDone!`);
	console.log(`  Processed: ${processed}`);
	console.log(`  Skipped: ${skipped}`);
	console.log(`  Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
