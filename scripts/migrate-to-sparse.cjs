#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const COLLISION_TILE = 40104;
const WATER_TILE = 40111;
const BATTLE_TILE = 2239;

function extractSparseIndices(fullArray, tileId) {
	const indices = [];
	for (let i = 0; i < fullArray.length; i++) {
		if (fullArray[i] === tileId) {
			indices.push(i);
		}
	}
	return indices;
}

function formatIndicesArray(indices, name) {
	if (indices.length === 0) {
		return `const ${name}: number[] = [];`;
	}
	const chunks = [];
	for (let i = 0; i < indices.length; i += 30) {
		chunks.push('\t' + indices.slice(i, i + 30).join(', '));
	}
	return `const ${name}: number[] = [\n${chunks.join(',\n')}\n];`;
}

function processMapFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');

	const collisionMatch = content.match(/const collisions\s*=\s*\[([\s\S]*?)\];/);
	const waterMatch = content.match(/const water(?:Collisions)?\s*=\s*\[([\s\S]*?)\];/);
	const battleMatch = content.match(/const battles\s*=\s*\[([\s\S]*?)\];/);

	const results = { file: path.basename(filePath) };

	if (collisionMatch) {
		const arr = collisionMatch[1]
			.split(',')
			.map((s) => parseInt(s.trim(), 10))
			.filter((n) => !isNaN(n));
		const sparse = extractSparseIndices(arr, COLLISION_TILE);
		results.collisions = {
			original: arr.length,
			sparse: sparse.length,
			reduction: ((1 - sparse.length / arr.length) * 100).toFixed(1) + '%',
			code: formatIndicesArray(sparse, 'collisionIndices')
		};
	}

	if (waterMatch) {
		const arr = waterMatch[1]
			.split(',')
			.map((s) => parseInt(s.trim(), 10))
			.filter((n) => !isNaN(n));
		const sparse = extractSparseIndices(arr, WATER_TILE);
		results.water = {
			original: arr.length,
			sparse: sparse.length,
			reduction: ((1 - sparse.length / arr.length) * 100).toFixed(1) + '%',
			code: formatIndicesArray(sparse, 'waterIndices')
		};
	}

	if (battleMatch) {
		const arr = battleMatch[1]
			.split(',')
			.map((s) => parseInt(s.trim(), 10))
			.filter((n) => !isNaN(n));
		const sparse = extractSparseIndices(arr, BATTLE_TILE);
		results.battles = {
			original: arr.length,
			sparse: sparse.length,
			reduction: ((1 - sparse.length / arr.length) * 100).toFixed(1) + '%',
			code: formatIndicesArray(sparse, 'battleIndices')
		};
	}

	return results;
}

const args = process.argv.slice(2);
if (args.length === 0) {
	console.log('Usage: node migrate-to-sparse.js <map-file.ts> [--output]');
	console.log('       node migrate-to-sparse.js src/js/mapping/maps/firstBeach.ts');
	console.log('       node migrate-to-sparse.js src/js/mapping/maps/firstBeach.ts --output');
	process.exit(1);
}

const mapFile = args[0];
const showOutput = args.includes('--output');

if (!fs.existsSync(mapFile)) {
	console.error(`File not found: ${mapFile}`);
	process.exit(1);
}

const result = processMapFile(mapFile);

console.log(`\n=== ${result.file} ===\n`);

if (result.collisions) {
	console.log(
		`Collisions: ${result.collisions.original} → ${result.collisions.sparse} (${result.collisions.reduction} reduction)`
	);
	if (showOutput) {
		console.log('\n' + result.collisions.code + '\n');
	}
}

if (result.water) {
	console.log(
		`Water: ${result.water.original} → ${result.water.sparse} (${result.water.reduction} reduction)`
	);
	if (showOutput) {
		console.log('\n' + result.water.code + '\n');
	}
}

if (result.battles) {
	console.log(
		`Battles: ${result.battles.original} → ${result.battles.sparse} (${result.battles.reduction} reduction)`
	);
	if (showOutput) {
		console.log('\n' + result.battles.code + '\n');
	}
}

const totalOriginal =
	(result.collisions?.original || 0) +
	(result.water?.original || 0) +
	(result.battles?.original || 0);
const totalSparse =
	(result.collisions?.sparse || 0) + (result.water?.sparse || 0) + (result.battles?.sparse || 0);
console.log(
	`\nTotal: ${totalOriginal} → ${totalSparse} values (${((1 - totalSparse / totalOriginal) * 100).toFixed(1)}% reduction)`
);
