import { NPC } from '../../characters/npc';
import { Jonction } from '../collisions';
import { Position } from '../positions';
import { TileType3D, type ThrelteMapData } from './types';

const G = TileType3D.GRASS;
const P = TileType3D.PATH;
const W = TileType3D.WATER;
const T = TileType3D.TREE_GROUND;
const H = TileType3D.TALL_GRASS;

const WIDTH = 20;
const HEIGHT = 40;

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

	// Tree borders on left and right edges
	fill(0, 39, 0, 1, T);
	fill(0, 39, 18, 19, T);

	// Winding path from south to north
	fill(35, 39, 9, 11, P);
	fill(30, 35, 9, 11, P);
	fill(28, 30, 8, 12, P);
	fill(24, 28, 10, 12, P);
	fill(20, 24, 8, 10, P);
	fill(16, 20, 7, 9, P);
	fill(12, 16, 9, 11, P);
	fill(8, 12, 8, 10, P);
	fill(4, 8, 9, 11, P);
	fill(0, 4, 9, 11, P);

	// Water pond near center (rows 18-22, cols 13-16)
	fill(18, 22, 13, 16, W);

	// Tall grass encounter zones along the route
	fill(32, 36, 4, 7, H);
	fill(14, 18, 3, 6, H);
	fill(6, 10, 13, 16, H);

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

export const demoRoute: ThrelteMapData = {
	mapId: 101,
	name: 'Demo Route',
	width: WIDTH,
	height: HEIGHT,
	tiles,
	playerStart: new Position(10, 38),
	jonctions: [
		new Jonction(
			1,
			100,
			[
				new Position(8, 39),
				new Position(9, 39),
				new Position(10, 39),
				new Position(11, 39),
				new Position(12, 39)
			],
			new Position(15, 1)
		)
	],
	npcs: [new NPC(1, 'Hiker', 2, new Position(10, 20), 'down', 'MALE')],
	items: [],
	monsters: [10, 13, 16],
	levelRange: [2, 5],
	battleTileIndices: computeBattleTileIndices(tiles),
	sound: 'route'
};
