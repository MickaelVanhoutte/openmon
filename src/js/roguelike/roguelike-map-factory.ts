import { OpenMap } from '../mapping/maps';
import type { SparseMapData } from '../mapping/sparse-collision';
import { NPC } from '../characters/npc';
import { Position } from '../mapping/positions';
import { Jonction } from '../mapping/collisions';
import {
	Script,
	StartBattle,
	Dialog,
	HealAll,
	OpenShop,
	GiveMoney,
	Message
} from '../scripting/scripts';
import { BattleType } from '../battle/battle-model';
import { Bag } from '../items/bag';
import {
	EncounterType,
	RoomTheme,
	THEME_MONSTERS,
	THEME_LEVEL_RANGES,
	type RoomExit
} from './types';

const MIN_ROOM_SIZE = 25;
const MAX_ROOM_SIZE = 50;
const TILE_SIZE = 16;

const TRAINER_NAMES: Record<RoomTheme, string[]> = {
	[RoomTheme.FOREST]: ['Bug Catcher', 'Picnicker', 'Ranger'],
	[RoomTheme.CAVE]: ['Hiker', 'Rock Climber', 'Spelunker'],
	[RoomTheme.BEACH]: ['Swimmer', 'Surfer', 'Fisher'],
	[RoomTheme.RUINS]: ['Psychic', 'Ace Trainer', 'Mystic']
};

const THEME_COLORS: Record<RoomTheme, { floor: string; wall: string; grass: string }> = {
	[RoomTheme.FOREST]: { floor: '#8B7355', wall: '#2d5a27', grass: '#3a8a3a' },
	[RoomTheme.CAVE]: { floor: '#4a4a5a', wall: '#2a2a3a', grass: '#5a5a6a' },
	[RoomTheme.BEACH]: { floor: '#e6d5a8', wall: '#8b7355', grass: '#a8c8a8' },
	[RoomTheme.RUINS]: { floor: '#6a6a7a', wall: '#3a3a4a', grass: '#5a7a5a' }
};

const SHOP_ITEMS: Record<string, number> = {
	'17': 200,
	'26': 500,
	'27': 1000,
	'1': 200,
	'2': 600
};

export interface RoguelikeRoomConfig {
	roomId: string;
	floor: number;
	theme: RoomTheme;
	encounterType: EncounterType;
	trainerCount: number;
	exits: RoomExit[];
	seed: number;
}

export interface GeneratedRoom {
	map: OpenMap;
	trainerNpcIds: number[];
	backgroundDataUrl: string;
}

class SeededRandom {
	private seed: number;

	constructor(seed: number) {
		this.seed = seed;
	}

	next(): number {
		this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
		return this.seed / 0x7fffffff;
	}

	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}

	pick<T>(arr: T[]): T {
		return arr[Math.floor(this.next() * arr.length)];
	}

	shuffle<T>(arr: T[]): T[] {
		const result = [...arr];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(this.next() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}
}

function generateRoomBackground(theme: RoomTheme, width: number, height: number): string {
	const canvas = document.createElement('canvas');
	canvas.width = width * TILE_SIZE;
	canvas.height = height * TILE_SIZE;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return '';
	}
	const colors = THEME_COLORS[theme];

	ctx.fillStyle = colors.floor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = colors.wall;
	ctx.fillRect(0, 0, canvas.width, TILE_SIZE);
	ctx.fillRect(0, (height - 1) * TILE_SIZE, canvas.width, TILE_SIZE);
	ctx.fillRect(0, 0, TILE_SIZE, canvas.height);
	ctx.fillRect((width - 1) * TILE_SIZE, 0, TILE_SIZE, canvas.height);

	ctx.fillStyle = 'rgba(0,0,0,0.05)';
	for (let x = 1; x < width - 1; x++) {
		for (let y = 1; y < height - 1; y++) {
			if ((x + y) % 2 === 0) {
				ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	return canvas.toDataURL();
}

function generateCollisions(
	width: number,
	height: number,
	exits: RoomExit[]
): { collisionIndices: number[]; exitPositions: Map<string, number[]> } {
	const collisions: number[] = [];
	const exitPositions = new Map<string, number[]>();

	for (let x = 0; x < width; x++) {
		const topIndex = x;
		const bottomIndex = x + (height - 1) * width;
		const hasNorthExit = exits.some((e) => e.direction === 'north');
		const hasSouthExit = exits.some((e) => e.direction === 'south');
		const doorStart = Math.floor(width / 2) - 1;
		const doorEnd = doorStart + 2;

		if (x >= doorStart && x <= doorEnd && hasNorthExit) {
			if (!exitPositions.has('north')) exitPositions.set('north', []);
			exitPositions.get('north')!.push(topIndex);
		} else {
			collisions.push(topIndex);
		}

		if (x >= doorStart && x <= doorEnd && hasSouthExit) {
			if (!exitPositions.has('south')) exitPositions.set('south', []);
			exitPositions.get('south')!.push(bottomIndex);
		} else {
			collisions.push(bottomIndex);
		}
	}

	for (let y = 1; y < height - 1; y++) {
		const leftIndex = y * width;
		const rightIndex = y * width + (width - 1);
		const hasWestExit = exits.some((e) => e.direction === 'west');
		const hasEastExit = exits.some((e) => e.direction === 'east');
		const doorStart = Math.floor(height / 2) - 1;
		const doorEnd = doorStart + 2;

		if (y >= doorStart && y <= doorEnd && hasWestExit) {
			if (!exitPositions.has('west')) exitPositions.set('west', []);
			exitPositions.get('west')!.push(leftIndex);
		} else {
			collisions.push(leftIndex);
		}

		if (y >= doorStart && y <= doorEnd && hasEastExit) {
			if (!exitPositions.has('east')) exitPositions.set('east', []);
			exitPositions.get('east')!.push(rightIndex);
		} else {
			collisions.push(rightIndex);
		}
	}

	return { collisionIndices: collisions, exitPositions };
}

function generateBattleZones(
	width: number,
	height: number,
	rng: SeededRandom,
	encounterType: EncounterType
): number[] {
	const battleIndices: number[] = [];

	if (encounterType !== EncounterType.WILD_BATTLE && encounterType !== EncounterType.CATCH_EVENT) {
		return battleIndices;
	}

	const patchCount = rng.nextInt(2, 3);
	const usedPositions = new Set<number>();

	for (let p = 0; p < patchCount; p++) {
		const patchX = rng.nextInt(3, width - 6);
		const patchY = rng.nextInt(3, height - 5);
		const patchW = rng.nextInt(2, 4);
		const patchH = rng.nextInt(2, 3);

		for (let x = patchX; x < patchX + patchW && x < width - 1; x++) {
			for (let y = patchY; y < patchY + patchH && y < height - 1; y++) {
				const index = y * width + x;
				if (!usedPositions.has(index)) {
					battleIndices.push(index);
					usedPositions.add(index);
				}
			}
		}
	}

	return battleIndices;
}

function createTrainerNpcs(
	config: RoguelikeRoomConfig,
	rng: SeededRandom,
	width: number,
	height: number
): NPC[] {
	const npcs: NPC[] = [];

	if (
		config.encounterType !== EncounterType.TRAINER_BATTLE &&
		config.encounterType !== EncounterType.BOSS
	) {
		return npcs;
	}

	const trainerCount = config.encounterType === EncounterType.BOSS ? 1 : config.trainerCount;
	const names = TRAINER_NAMES[config.theme];
	const monsters = THEME_MONSTERS[config.theme];
	const [minLvl, maxLvl] = THEME_LEVEL_RANGES[config.theme];
	const levelBonus = config.floor * 2;
	const actualMinLvl = minLvl + levelBonus;
	const actualMaxLvl = maxLvl + levelBonus;

	const possiblePositions: Position[] = [];
	for (let i = 0; i < 10; i++) {
		const x = rng.nextInt(3, width - 4);
		const y = rng.nextInt(3, height - 4);
		possiblePositions.push(new Position(x, y));
	}

	const shuffledPositions = rng.shuffle(possiblePositions);

	for (let i = 0; i < trainerCount && i < shuffledPositions.length; i++) {
		const npcId = parseInt(config.roomId.replace(/\D/g, '') || '0') * 100 + i + 1;
		const name = config.encounterType === EncounterType.BOSS ? 'Boss Trainer' : rng.pick(names);
		const spriteId = rng.nextInt(1, 4);
		const position = shuffledPositions[i];
		const direction = rng.pick(['up', 'down', 'left', 'right'] as const);
		const gender = rng.pick(['MALE', 'FEMALE'] as const);

		const monsterCount = config.encounterType === EncounterType.BOSS ? 3 : rng.nextInt(1, 2);
		const trainerMonsters: number[] = [];
		for (let m = 0; m < monsterCount; m++) {
			trainerMonsters.push(rng.pick(monsters));
		}

		let trainerMinLvl: number;
		let trainerMaxLvl: number;
		if (config.floor === 1) {
			if (monsterCount === 1) {
				trainerMinLvl = 3;
				trainerMaxLvl = 4;
			} else {
				trainerMinLvl = 2;
				trainerMaxLvl = 3;
			}
		} else {
			trainerMinLvl = actualMinLvl;
			trainerMaxLvl = actualMaxLvl;
		}

		const battleScript = new Script('onSight', [
			new StartBattle(npcId, BattleType.SINGLE),
			new Dialog([new Message(`${name} wants to battle!`)])
		]);

		const npc = new NPC(
			npcId,
			name,
			spriteId,
			position,
			direction,
			gender,
			trainerMonsters,
			new Bag(),
			battleScript,
			undefined,
			undefined,
			false
		);

		(npc as unknown as { levelRange: [number, number] }).levelRange = [
			trainerMinLvl,
			trainerMaxLvl
		];

		npcs.push(npc);
	}

	return npcs;
}

function createServiceNpcs(config: RoguelikeRoomConfig, width: number, height: number): NPC[] {
	const npcs: NPC[] = [];

	if (config.encounterType === EncounterType.SHOP) {
		const npc = new NPC(
			9000 + config.floor,
			'Merchant',
			2,
			new Position(Math.floor(width / 2), 3),
			'down',
			'MALE',
			undefined,
			undefined,
			new Script('onInteract', [new OpenShop(SHOP_ITEMS)]),
			[new Script('onInteract', [new Dialog([new Message('Welcome! Take a look at my wares.')])])],
			undefined,
			true
		);
		npcs.push(npc);
	} else if (config.encounterType === EncounterType.HEAL) {
		const npc = new NPC(
			9100 + config.floor,
			'Healer',
			3,
			new Position(Math.floor(width / 2), 3),
			'down',
			'FEMALE',
			undefined,
			undefined,
			new Script('onInteract', [
				new Dialog([new Message('Let me heal your Pokemon!')]),
				new HealAll(),
				new Dialog([new Message('Your Pokemon are fully healed!')])
			]),
			undefined,
			undefined,
			true
		);
		npcs.push(npc);
	} else if (config.encounterType === EncounterType.TREASURE) {
		const moneyAmount = 100 + config.floor * 50;
		const npc = new NPC(
			9200 + config.floor,
			'Treasure Chest',
			1,
			new Position(Math.floor(width / 2), Math.floor(height / 2)),
			'down',
			'MALE',
			undefined,
			undefined,
			new Script('onInteract', [
				new Dialog([new Message(`You found ${moneyAmount} coins!`)]),
				new GiveMoney(moneyAmount)
			])
		);
		npcs.push(npc);
	}

	return npcs;
}

function createJonctions(
	config: RoguelikeRoomConfig,
	exitPositions: Map<string, number[]>,
	width: number,
	height: number
): Jonction[] {
	const jonctions: Jonction[] = [];
	const currentRoomId = parseInt(config.roomId.replace(/\D/g, '') || '1');
	const nextRoomBaseId = currentRoomId + 1;
	const directionOffset: Record<string, number> = { north: 0, south: 1, east: 2, west: 3 };

	for (const exit of config.exits) {
		const positions = exitPositions.get(exit.direction);
		if (!positions || positions.length === 0) continue;

		const positionArray = positions.map(
			(idx) => new Position(idx % width, Math.floor(idx / width))
		);

		let targetPos: Position;
		switch (exit.direction) {
			case 'north':
				targetPos = new Position(Math.floor(width / 2), height - 2);
				break;
			case 'south':
				targetPos = new Position(Math.floor(width / 2), 2);
				break;
			case 'east':
				targetPos = new Position(2, Math.floor(height / 2));
				break;
			case 'west':
				targetPos = new Position(width - 2, Math.floor(height / 2));
				break;
		}

		const nextMapIdx = nextRoomBaseId * 10 + directionOffset[exit.direction];
		const jonction = new Jonction(currentRoomId, nextMapIdx, positionArray, targetPos);

		(jonction as unknown as { locked: boolean }).locked = true;

		jonctions.push(jonction);
	}

	return jonctions;
}

export function generateRoguelikeRoom(config: RoguelikeRoomConfig): GeneratedRoom {
	const rng = new SeededRandom(config.seed);
	const width = rng.nextInt(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
	const height = rng.nextInt(MIN_ROOM_SIZE, MAX_ROOM_SIZE);

	const backgroundDataUrl = generateRoomBackground(config.theme, width, height);
	const { collisionIndices, exitPositions } = generateCollisions(width, height, config.exits);
	const battleIndices = generateBattleZones(width, height, rng, config.encounterType);

	const sparseData: SparseMapData = {
		collisionIndices,
		waterIndices: [],
		battleIndices
	};

	const wildMonsters =
		config.encounterType === EncounterType.WILD_BATTLE ||
		config.encounterType === EncounterType.CATCH_EVENT
			? THEME_MONSTERS[config.theme]
			: [];

	const [baseMin, baseMax] = THEME_LEVEL_RANGES[config.theme];
	const levelRange: [number, number] = [baseMin + config.floor * 2, baseMax + config.floor * 2];

	const trainerNpcs = createTrainerNpcs(config, rng, width, height);
	const serviceNpcs = createServiceNpcs(config, width, height);
	const allNpcs = [...trainerNpcs, ...serviceNpcs];
	const jonctions = createJonctions(config, exitPositions, width, height);
	const playerPosition = new Position(Math.floor(width / 2), height - 3);

	const roomIdNum = parseInt(config.roomId.replace(/\D/g, '') || '1');

	const map = OpenMap.fromSparse(
		roomIdNum,
		backgroundDataUrl,
		width,
		height,
		sparseData,
		wildMonsters,
		playerPosition,
		levelRange,
		jonctions,
		undefined,
		allNpcs,
		undefined,
		undefined,
		[]
	);

	return {
		map,
		trainerNpcIds: trainerNpcs.map((n) => n.id),
		backgroundDataUrl
	};
}

export function areAllTrainersDefeated(
	trainerNpcIds: number[],
	defeatedNpcIds: Set<number>
): boolean {
	return trainerNpcIds.every((id) => defeatedNpcIds.has(id));
}

export function unlockRoomExits(map: OpenMap): void {
	for (const jonction of map.jonctions) {
		(jonction as unknown as { locked: boolean }).locked = false;
	}
}

export function spawnMerchantOnMap(map: OpenMap, floor: number): void {
	const width = map.width;
	const merchantNpc = new NPC(
		9000 + floor,
		'Merchant',
		2,
		new Position(Math.floor(width / 2), 3),
		'down',
		'MALE',
		undefined,
		undefined,
		new Script('onInteract', [new OpenShop(SHOP_ITEMS)]),
		[new Script('onInteract', [new Dialog([new Message('Welcome! Take a look at my wares.')])])],
		undefined,
		true
	);
	map.npcs.push(merchantNpc);
}

export { MIN_ROOM_SIZE, MAX_ROOM_SIZE, TILE_SIZE };
