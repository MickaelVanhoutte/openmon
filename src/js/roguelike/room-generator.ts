import {
	type Room,
	type RoomEncounter,
	type RoomExit,
	RoomTheme,
	EncounterType,
	THEME_MONSTERS,
	THEME_LEVEL_RANGES,
	DEFAULT_RUN_CONFIG,
	type RunConfig
} from './types';

export class SeededRandom {
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
		return arr[this.nextInt(0, arr.length - 1)];
	}

	pickWeighted(weights: Record<string, number>): string {
		const total = Object.values(weights).reduce((a, b) => a + b, 0);
		let roll = this.next() * total;
		for (const [key, weight] of Object.entries(weights)) {
			roll -= weight;
			if (roll <= 0) return key;
		}
		return Object.keys(weights)[0];
	}
}

const ROOM_SIZE = { width: 20, height: 15 };

export class RoomGenerator {
	private rng: SeededRandom;
	private config: RunConfig;
	private roomCounter = 0;

	constructor(seed: number, config: RunConfig = DEFAULT_RUN_CONFIG) {
		this.rng = new SeededRandom(seed);
		this.config = config;
	}

	generateRoom(floor: number, roomsCleared: number): Room {
		const theme = this.config.themeProgression[floor - 1] || RoomTheme.FOREST;
		const isBoss = roomsCleared > 0 && roomsCleared % this.config.bossEveryNRooms === 0;

		const encounterType = isBoss
			? EncounterType.BOSS
			: (this.rng.pickWeighted(
					this.config.encounterWeights as unknown as Record<string, number>
				) as EncounterType);

		const encounter = this.generateEncounter(encounterType, theme, floor);
		const exits = this.generateExits(floor, roomsCleared);
		const collisionIndices = this.generateCollisions();

		this.roomCounter++;

		return {
			id: `room_${floor}_${this.roomCounter}`,
			floor,
			theme,
			encounter,
			exits,
			cleared: false,
			width: ROOM_SIZE.width,
			height: ROOM_SIZE.height,
			collisionIndices
		};
	}

	private generateEncounter(type: EncounterType, theme: RoomTheme, floor: number): RoomEncounter {
		const monsters = THEME_MONSTERS[theme];
		const [minLvl, maxLvl] = THEME_LEVEL_RANGES[theme];
		const levelBoost = (floor - 1) * 3;

		switch (type) {
			case EncounterType.WILD_BATTLE:
				return {
					type,
					monsters: [this.rng.pick(monsters)],
					monsterLevel: [minLvl + levelBoost, maxLvl + levelBoost]
				};

			case EncounterType.TRAINER_BATTLE:
				const teamSize = this.rng.nextInt(1, 3);
				return {
					type,
					monsters: Array.from({ length: teamSize }, () => this.rng.pick(monsters)),
					monsterLevel: [minLvl + levelBoost, maxLvl + levelBoost],
					trainerName: this.rng.pick(['Bug Catcher', 'Lass', 'Youngster', 'Hiker', 'Picnicker']),
					money: 100 * floor * teamSize
				};

			case EncounterType.CATCH_EVENT:
				return {
					type,
					monsters: [this.rng.pick(monsters)],
					monsterLevel: [minLvl + levelBoost, maxLvl + levelBoost]
				};

			case EncounterType.BOSS:
				return {
					type,
					monsters: Array.from({ length: 3 }, () => this.rng.pick(monsters)),
					monsterLevel: [maxLvl + levelBoost, maxLvl + levelBoost + 5],
					trainerName: this.rng.pick(['Gym Leader', 'Elite Trainer', 'Champion']),
					money: 500 * floor
				};

			case EncounterType.SHOP:
				return {
					type,
					items: [4, 17, 33, 28]
				};

			case EncounterType.HEAL:
				return { type };

			case EncounterType.TREASURE:
				return {
					type,
					items: [this.rng.pick([4, 17, 33, 28, 1, 2, 3])],
					money: this.rng.nextInt(50, 200) * floor
				};

			default:
				return { type: EncounterType.WILD_BATTLE };
		}
	}

	private generateExits(floor: number, roomsCleared: number): RoomExit[] {
		const isFloorEnd = (roomsCleared + 1) % this.config.roomsPerFloor === 0;
		const isLastFloor = floor >= this.config.maxFloors;

		if (isFloorEnd && isLastFloor) {
			return [];
		}

		const exitCount = isFloorEnd ? 1 : this.rng.nextInt(2, 3);
		const exits: RoomExit[] = [];
		const directions: Array<'north' | 'east' | 'west'> = ['north', 'east', 'west'];

		for (let i = 0; i < exitCount && directions.length > 0; i++) {
			const dir = this.rng.pick(directions);
			directions.splice(directions.indexOf(dir), 1);

			const nextType = this.rng.pickWeighted(
				this.config.encounterWeights as unknown as Record<string, number>
			) as EncounterType;

			exits.push({ direction: dir, nextRoomType: nextType });
		}

		return exits;
	}

	private generateCollisions(): number[] {
		const indices: number[] = [];
		const { width, height } = ROOM_SIZE;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const isEdge = x === 0 || x === width - 1 || y === 0 || y === height - 1;
				const isDoor =
					(y === 0 && x >= width / 2 - 1 && x <= width / 2 + 1) ||
					(x === 0 && y >= height / 2 - 1 && y <= height / 2 + 1) ||
					(x === width - 1 && y >= height / 2 - 1 && y <= height / 2 + 1);

				if (isEdge && !isDoor) {
					indices.push(y * width + x);
				}
			}
		}

		const obstacleCount = this.rng.nextInt(3, 8);
		for (let i = 0; i < obstacleCount; i++) {
			const x = this.rng.nextInt(3, width - 4);
			const y = this.rng.nextInt(3, height - 4);
			indices.push(y * width + x);
		}

		return indices;
	}
}
