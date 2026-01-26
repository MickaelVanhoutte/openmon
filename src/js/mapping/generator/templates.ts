import type { SparseMapData } from '../sparse-collision';
import type { NPC } from '../../characters/npc';
import type { Jonction } from '../collisions';
import type { Script } from '../../scripting/scripts';
import { Position } from '../positions';

export interface BiomeTemplate {
	name: string;
	monsters: number[];
	levelRange: [number, number];
	sound?: string;

	features: {
		trees?: FeatureConfig;
		water?: FeatureConfig;
		rocks?: FeatureConfig;
		grass?: FeatureConfig;
		paths?: PathConfig;
		clearings?: ClearingConfig;
	};

	npcTemplates?: NPCTemplate[];
}

export interface FeatureConfig {
	density: number;
	clusterSize: [number, number];
	clusterCount: [number, number];
}

export interface PathConfig {
	count: number;
	width: [number, number];
	curviness: number;
}

export interface ClearingConfig {
	count: [number, number];
	size: [number, number];
}

export interface NPCTemplate {
	type: 'trainer' | 'healer' | 'shop' | 'dialog';
	spriteId: number;
	name: string;
	gender: 'MALE' | 'FEMALE';
	monsters?: number[];
	placement: 'path' | 'clearing' | 'random';
}

export interface MapGeneratorConfig {
	mapId: number;
	width: number;
	height: number;
	template: BiomeTemplate;
	seed?: number;
	entries?: EntryPoint[];
	exits?: ExitPoint[];
}

export interface EntryPoint {
	edge: 'north' | 'south' | 'east' | 'west';
	position: number;
	width: number;
}

export interface ExitPoint {
	edge: 'north' | 'south' | 'east' | 'west';
	position: number;
	width: number;
	targetMapId: number;
	targetPosition: Position;
}

export interface GeneratedMap {
	sparseData: SparseMapData;
	npcs: NPC[];
	scripts: Script[];
	jonctions: Jonction[];
	playerStart: Position;
	debugGrid: string[][];
}

export const FOREST_TEMPLATE: BiomeTemplate = {
	name: 'forest',
	monsters: [10, 11, 13, 14, 16, 17, 19, 20, 21, 23, 25, 27, 29, 41, 43, 46, 48, 69, 127],
	levelRange: [5, 12],
	sound: 'forest',
	features: {
		trees: {
			density: 0.35,
			clusterSize: [3, 8],
			clusterCount: [15, 25]
		},
		water: {
			density: 0.05,
			clusterSize: [4, 12],
			clusterCount: [1, 3]
		},
		grass: {
			density: 0.25,
			clusterSize: [5, 15],
			clusterCount: [8, 15]
		},
		paths: {
			count: 2,
			width: [2, 3],
			curviness: 0.3
		},
		clearings: {
			count: [2, 4],
			size: [5, 10]
		}
	},
	npcTemplates: [
		{
			type: 'trainer',
			spriteId: 1,
			name: 'Bug Catcher',
			gender: 'MALE',
			monsters: [10, 13],
			placement: 'path'
		},
		{
			type: 'trainer',
			spriteId: 2,
			name: 'Lass',
			gender: 'FEMALE',
			monsters: [16, 19],
			placement: 'clearing'
		},
		{ type: 'healer', spriteId: 4, name: 'Forest Ranger', gender: 'MALE', placement: 'clearing' }
	]
};

export const BEACH_TEMPLATE: BiomeTemplate = {
	name: 'beach',
	monsters: [7, 54, 55, 60, 61, 72, 79, 86, 90, 98, 116, 117, 118, 120, 129, 130, 131],
	levelRange: [3, 8],
	sound: 'beach',
	features: {
		water: {
			density: 0.3,
			clusterSize: [10, 30],
			clusterCount: [1, 2]
		},
		rocks: {
			density: 0.1,
			clusterSize: [2, 5],
			clusterCount: [5, 10]
		},
		grass: {
			density: 0.15,
			clusterSize: [3, 8],
			clusterCount: [5, 10]
		},
		paths: {
			count: 1,
			width: [3, 4],
			curviness: 0.2
		}
	}
};

export const CAVE_TEMPLATE: BiomeTemplate = {
	name: 'cave',
	monsters: [41, 42, 50, 51, 66, 67, 74, 75, 95, 104, 105, 111],
	levelRange: [10, 18],
	sound: 'cave',
	features: {
		rocks: {
			density: 0.4,
			clusterSize: [2, 6],
			clusterCount: [20, 35]
		},
		water: {
			density: 0.08,
			clusterSize: [3, 8],
			clusterCount: [1, 2]
		},
		clearings: {
			count: [3, 6],
			size: [4, 8]
		}
	}
};
