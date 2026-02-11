import { NPC } from '../../characters/npc';
import { Jonction } from '../collisions';
import { Position } from '../positions';
import { TileType3D, type ThrelteMapData } from './types';

const G = TileType3D.GRASS;
const P = TileType3D.PATH;
const T = TileType3D.TREE_GROUND;
const F = TileType3D.FLOWER_GROUND;
const H = TileType3D.TALL_GRASS;
const B = TileType3D.BUILDING_FLOOR;

const WIDTH = 30;
const HEIGHT = 30;

function createTiles(): TileType3D[][] {
	const tiles: TileType3D[][] = Array.from({ length: HEIGHT }, () =>
		Array.from({ length: WIDTH }, () => G)
	);

	const fill = (
		rowStart: number,
		rowEnd: number,
		colStart: number,
		colEnd: number,
		type: TileType3D
	) => {
		for (let r = rowStart; r <= rowEnd; r++) {
			for (let c = colStart; c <= colEnd; c++) {
				tiles[r][c] = type;
			}
		}
	};

	// North exit road leading to junction (cols 12-17, rows 0-5)
	fill(0, 5, 12, 17, P);

	// Main vertical road (col 14-15, rows 0-29)
	fill(0, 29, 14, 15, P);

	// Main horizontal road (row 15, cols 0-29)
	fill(15, 15, 0, 29, P);

	// Secondary horizontal road (row 8, cols 4-25)
	fill(8, 8, 4, 25, P);

	// Town square at intersection (rows 14-16, cols 13-16)
	fill(14, 16, 13, 16, P);

	// Building footprint — Pokecenter (rows 9-12, cols 5-8)
	fill(9, 12, 5, 8, B);

	// Second building (rows 9-12, cols 20-23)
	fill(9, 12, 20, 23, B);

	// Flower patches
	fill(18, 20, 3, 5, F);
	fill(12, 13, 25, 27, F);
	fill(5, 6, 9, 11, F);

	// Tall grass encounter zones
	fill(20, 24, 20, 25, H);
	fill(3, 6, 22, 26, H);

	// Tree borders along edges
	fill(0, 0, 0, 11, T);
	fill(0, 0, 18, 29, T);
	fill(0, 29, 0, 0, T);
	fill(0, 29, 29, 29, T);
	fill(29, 29, 0, 29, T);

	return tiles;
}

function computeBattleTileIndices(tiles: TileType3D[][]): Set<number> {
	const indices = new Set<number>();
	for (let row = 0; row < tiles.length; row++) {
		for (let col = 0; col < tiles[row].length; col++) {
			if (tiles[row][col] === TileType3D.TALL_GRASS) {
				indices.add(row * WIDTH + col);
			}
		}
	}
	return indices;
}

const tiles = createTiles();

export const demoTown: ThrelteMapData = {
	mapId: 100,
	name: 'Demo Town',
	width: WIDTH,
	height: HEIGHT,
	tiles,
	playerStart: new Position(15, 25),
	jonctions: [
		new Jonction(
			1,
			101,
			[
				new Position(12, 0),
				new Position(13, 0),
				new Position(14, 0),
				new Position(15, 0),
				new Position(16, 0),
				new Position(17, 0)
			],
			new Position(10, 38)
		)
	],
	npcs: [
		new NPC(1, 'Townsperson', 2, new Position(10, 10), 'down', 'MALE'),
		new NPC(2, 'Guide', 3, new Position(15, 3), 'down', 'FEMALE')
	],
	items: [],
	monsters: [1, 4, 7],
	levelRange: [3, 6],
	battleTileIndices: computeBattleTileIndices(tiles),
	sound: 'town'
};
