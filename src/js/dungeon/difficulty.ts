export interface DifficultyConfig {
	pokemonLevel: { min: number; max: number };
	trainerCount: { min: number; max: number };
	encounterRate: number;
	wallDensity: number;
}

const LEVEL_BASE = 5;
const LEVEL_GROWTH = 0.1;
const TRAINER_BASE = 1.5;
const TRAINER_GROWTH = 0.05;
const ENCOUNTER_BASE = 0.05;
const ENCOUNTER_GROWTH = 0.023;
const WALL_BASE = 0.4;
const WALL_GROWTH = 0.0046;

export function getDifficulty(floorNumber: number): DifficultyConfig {
	const floor = Math.max(1, floorNumber);

	const levelBase = Math.min(100, LEVEL_BASE * Math.pow(1 + LEVEL_GROWTH, floor - 1));
	const levelMin = Math.max(1, Math.floor(levelBase - 2));
	const levelMax = Math.min(100, Math.floor(levelBase + 2));

	const trainerBase = TRAINER_BASE * Math.pow(1 + TRAINER_GROWTH, floor - 1);
	const trainerCountBase = Math.floor(trainerBase);
	const trainerMin = Math.max(0, Math.min(20, trainerCountBase));
	const trainerMax = Math.max(0, Math.min(22, trainerCountBase + 2));

	const encounterRate = Math.min(0.25, ENCOUNTER_BASE * Math.pow(1 + ENCOUNTER_GROWTH, floor - 1));

	const wallDensity = Math.min(0.6, WALL_BASE * Math.pow(1 + WALL_GROWTH, floor - 1));

	return {
		pokemonLevel: { min: levelMin, max: levelMax },
		trainerCount: { min: trainerMin, max: trainerMax },
		encounterRate,
		wallDensity
	};
}
