#!/usr/bin/env node
const fs = require('fs');

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

function formatIndicesArray(indices) {
	if (indices.length === 0) return '[]';
	const chunks = [];
	for (let i = 0; i < indices.length; i += 20) {
		chunks.push('\t' + indices.slice(i, i + 20).join(', '));
	}
	return '[\n' + chunks.join(',\n') + '\n]';
}

function convertMapToSparse(inputPath, outputPath) {
	const content = fs.readFileSync(inputPath, 'utf8');

	const collisionMatch = content.match(/const collisions\s*=\s*\[([\s\S]*?)\];/);
	const waterMatch = content.match(/const waterCollision\s*=\s*\[([\s\S]*?)\];/);
	const battleMatch = content.match(/const battle\s*=\s*\[([\s\S]*?)\];/);

	const collisions = collisionMatch
		? collisionMatch[1]
				.split(',')
				.map((s) => parseInt(s.trim(), 10))
				.filter((n) => !isNaN(n))
		: [];
	const water = waterMatch
		? waterMatch[1]
				.split(',')
				.map((s) => parseInt(s.trim(), 10))
				.filter((n) => !isNaN(n))
		: [];
	const battles = battleMatch
		? battleMatch[1]
				.split(',')
				.map((s) => parseInt(s.trim(), 10))
				.filter((n) => !isNaN(n))
		: [];

	const collisionIndices = extractSparseIndices(collisions, COLLISION_TILE);
	const waterIndices = extractSparseIndices(water, WATER_TILE);
	const battleIndices = extractSparseIndices(battles, BATTLE_TILE);

	const importMatch = content.match(/(import[\s\S]*?)(?=\n\nconst monsters)/);
	const monstersMatch = content.match(/(const monsters[\s\S]*?)\n\nconst collisions/);
	const npcsMatch = content.match(/(const shopItems[\s\S]*?)(?=\nexport const firstBeach)/);
	const exportMatch = content.match(/export const firstBeach[\s\S]*$/);

	const newImports = importMatch[1]
		.replace(
			/import { OpenMap } from '\.\.\/maps';/,
			"import { OpenMap } from '../maps';\nimport type { SparseMapData } from '../sparse-collision';"
		)
		.replace(/, GiveItem/, '')
		.replace(/, MoveTo/, '')
		.replace(/\nimport { SceneType } from .*;/, '');

	const newExport = exportMatch[0]
		.replace(/OpenMap\.fromScratch\(/, 'OpenMap.fromSparse(')
		.replace(/collisions,\s*waterCollision,\s*battle,/, 'sparseData,')
		.replace(/39951,\s*40104,\s*40111,\s*/, '');

	const sparseDataDef = `const sparseData: SparseMapData = {
	collisionIndices: ${formatIndicesArray(collisionIndices)},
	waterIndices: ${formatIndicesArray(waterIndices)},
	battleIndices: ${formatIndicesArray(battleIndices)}
};`;

	const newContent = `${newImports}

${monstersMatch[1]}

${sparseDataDef}

${npcsMatch[1]}
${newExport}`;

	fs.writeFileSync(outputPath, newContent);
	console.log(`Converted: ${inputPath} -> ${outputPath}`);
	console.log(`Collisions: ${collisions.length} -> ${collisionIndices.length}`);
	console.log(`Water: ${water.length} -> ${waterIndices.length}`);
	console.log(`Battles: ${battles.length} -> ${battleIndices.length}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
	console.log('Usage: node convert-map-sparse.cjs <input.ts> <output.ts>');
	process.exit(1);
}

convertMapToSparse(args[0], args[1]);
