import { NPC } from '../characters/npc';
import type { DungeonMonsterConfig } from '../characters/characters-model';
import { Position } from '../mapping/positions';
import {
	Script,
	StartBattle,
	Dialog,
	Message,
	MoveToPlayer,
	GiveMoney,
	RemoveNpc
} from '../scripting/scripts';
import { SeededRNG } from './prng';
import { type BiomeConfig } from './biomes';
import type { FloorData } from './floor-generator';
import { getBossForFloor } from './boss-loader';

// Trainer sprite pools (character IDs = sprite index + 10)
// Excluded: 0=Birch, 1-2=story chars, 25-26=swimmers, 49-50=Blue/Red
// Elite pool (arena/league trainers, used for bosses): sprites 28-48 → IDs 38-58
// Generic pool (regular dungeon trainers): sprites 3-24, 27, 51-79 → IDs 13-34, 37, 61-89
const ELITE_TRAINER_SPRITE_IDS: number[] = Array.from({ length: 21 }, (_, i) => 38 + i); // 38-58
const GENERIC_TRAINER_SPRITE_IDS: number[] = [
	...Array.from({ length: 22 }, (_, i) => 13 + i), // 13-34  (sprites 3-24)
	37, //                                               sprite 27
	...Array.from({ length: 29 }, (_, i) => 61 + i)  // 61-89  (sprites 51-79)
];

export interface TrainerScaling {
	minFloor: number;
	maxFloor: number;
	trainerCount: [number, number];
	pokemonPerTrainer: [number, number];
}

export const TRAINER_SCALING: TrainerScaling[] = [
	{ minFloor: 1, maxFloor: 5, trainerCount: [1, 1], pokemonPerTrainer: [1, 2] },
	{ minFloor: 6, maxFloor: 10, trainerCount: [2, 2], pokemonPerTrainer: [1, 2] },
	{ minFloor: 11, maxFloor: 20, trainerCount: [2, 3], pokemonPerTrainer: [2, 3] },
	{ minFloor: 21, maxFloor: 30, trainerCount: [3, 4], pokemonPerTrainer: [2, 4] },
	{ minFloor: 31, maxFloor: Infinity, trainerCount: [3, 5], pokemonPerTrainer: [3, 5] }
];

export function getTrainerScaling(floor: number): TrainerScaling {
	return (
		TRAINER_SCALING.find((s) => floor >= s.minFloor && floor <= s.maxFloor) ??
		TRAINER_SCALING[TRAINER_SCALING.length - 1]
	);
}

export function createTrainer(
	position: Position,
	direction: 'up' | 'down' | 'left' | 'right',
	floorNumber: number,
	biomeConfig: BiomeConfig,
	rng: SeededRNG,
	id: number = rng.nextInt(1000, 9999)
): NPC {
	const trainerNames = ['Trainer', 'Dungeon Trainer', 'Explorer', 'Challenger', 'Hiker', 'Camper'];
	const name = rng.pick(trainerNames);

	const spriteId = rng.pick(GENERIC_TRAINER_SPRITE_IDS);
	const gender: 'MALE' | 'FEMALE' = rng.nextInt(0, 1) === 0 ? 'MALE' : 'FEMALE';

	const scaling = getTrainerScaling(floorNumber);
	const pokemonCount = rng.nextInt(scaling.pokemonPerTrainer[0], scaling.pokemonPerTrainer[1]);
	const baseLevel = floorNumber + 2;
	const dungeonTeam: DungeonMonsterConfig[] = [];
	for (let i = 0; i < pokemonCount; i++) {
		const speciesId = rng.pick(biomeConfig.monsterTable).id;
		const level = Math.max(1, Math.min(baseLevel + rng.nextInt(0, 2), 100));
		dungeonTeam.push({ speciesId, level });
	}
	const monsterIds = dungeonTeam.map((m) => m.speciesId);

	const rewardLevel = Math.max(...dungeonTeam.map((m) => m.level));

	const mainScript = new Script('onSight', [
		new MoveToPlayer(id),
		new Dialog([
			new Message(
				rng.pick([
					'I was looking for items, but a battle is better!',
					"You won't get past me!",
					'My Pokemon are ready for you!',
					'A challenger! Finally!'
				]),
				name
			)
		]),
		new StartBattle(id),
		new GiveMoney(100 + floorNumber * 10 + rewardLevel),
		new Dialog([
			new Message(
				rng.pick([
					'You are stronger than you look...',
					'Well played!',
					'I need more training.',
					'Take your reward and go'
				]),
				name
			)
		]),
		new RemoveNpc(id)
	]);

	const npc = new NPC(
		id,
		name,
		spriteId,
		position,
		direction,
		gender,
		monsterIds,
		undefined,
		mainScript
	);
	npc.dungeonTeam = dungeonTeam;
	return npc;
}

export function createBossTrainer(
	position: Position,
	floorNumber: number,
	biomeConfig: BiomeConfig,
	rng: SeededRNG,
	id: number = rng.nextInt(10000, 19999)
): NPC {
	const bossDef = getBossForFloor(floorNumber);

	if (bossDef) {
		// Use JSON-defined boss: curated name, sprite, team, and dialogue
		const baseLevel = floorNumber + 2;
		const dungeonTeam: DungeonMonsterConfig[] = bossDef.team.map((member) => ({
			speciesId: member.speciesId,
			level: Math.min(baseLevel + member.levelOffset, 120),
			heldItemId: member.heldItemId ?? undefined
		}));

		const name = bossDef.name;
		const monsterIds = dungeonTeam.map((m) => m.speciesId);
		const rewardLevel = Math.max(...dungeonTeam.map((m) => m.level));

		// Convert dialogBefore to array of Message objects
		const dialogBeforeArray = Array.isArray(bossDef.dialogBefore)
			? bossDef.dialogBefore
			: [bossDef.dialogBefore];
		const beforeMessages = dialogBeforeArray.map((text) => new Message(text, name));

		// Convert dialogAfter to array of Message objects
		const dialogAfterArray = Array.isArray(bossDef.dialogAfter)
			? bossDef.dialogAfter
			: [bossDef.dialogAfter];
		const afterMessages = dialogAfterArray.map((text) => new Message(text, name));

		const mainScript = new Script('onSight', [
			new MoveToPlayer(id),
			new Dialog(beforeMessages),
			new StartBattle(id),
			new GiveMoney(500 + floorNumber * 50 + rewardLevel * 5),
			new Dialog(afterMessages),
			new RemoveNpc(id)
		]);

		const npc = new NPC(
			id,
			name,
			bossDef.spriteId,
			position,
			'down',
			'MALE',
			monsterIds,
			undefined,
			mainScript
		);
		npc.dungeonTeam = dungeonTeam;
		return npc;
	}

	// Fallback: procedural boss (should not happen with 10 defined bosses covering all cycles)
	const name = 'Floor Boss';
	const baseLevel = floorNumber + 2;
	const pokemonCount = rng.nextInt(3, 6);
	const bossLevel = Math.max(1, Math.min(baseLevel + 5, 120));
	const dungeonTeam: DungeonMonsterConfig[] = [];
	for (let i = 0; i < pokemonCount; i++) {
		const speciesId = rng.pick(biomeConfig.monsterTable).id;
		dungeonTeam.push({ speciesId, level: bossLevel });
	}
	const monsterIds = dungeonTeam.map((m) => m.speciesId);

	const mainScript = new Script('onSight', [
		new MoveToPlayer(id),
		new Dialog([
			new Message('I am the guardian of this floor!', name),
			new Message('Prove your worth in battle!', name)
		]),
		new StartBattle(id),
		new GiveMoney(500 + floorNumber * 50 + bossLevel * 5),
		new Dialog([new Message('Impressive. You may proceed to the next floor.', name)]),
		new RemoveNpc(id)
	]);

	const npc = new NPC(id, name, rng.pick(ELITE_TRAINER_SPRITE_IDS), position, 'down', 'MALE', monsterIds, undefined, mainScript);
	npc.dungeonTeam = dungeonTeam;
	return npc;
}

export function populateFloor(
	generatorOutput: FloorData,
	floorNumber: number,
	biomeConfig: BiomeConfig,
	rng: SeededRNG
): NPC[] {
	const npcs: NPC[] = [];
	const isBossFloor = floorNumber % 5 === 0;
	const trainerPositions = generatorOutput.trainerPositions;

	// Use actual floor number for scaling (not effective biome floor) so difficulty
	// keeps increasing on cycling floors (51+)
	const scaling = getTrainerScaling(floorNumber);
	const maxRegularTrainers = rng.nextInt(scaling.trainerCount[0], scaling.trainerCount[1]);

	if (isBossFloor && trainerPositions.length > 0) {
		// Boss gets the last position; regular trainers fill earlier positions up to scaling limit
		const bossPos = trainerPositions[trainerPositions.length - 1];
		const regularPositions = trainerPositions.slice(0, -1);
		const regularCount = Math.min(regularPositions.length, maxRegularTrainers);

		for (let i = 0; i < regularCount; i++) {
			const pos = regularPositions[i];
			const direction = rng.pick(['up', 'down', 'left', 'right'] as const);
			const id = 100 + i;
			npcs.push(createTrainer(pos, direction, floorNumber, biomeConfig, rng, id));
		}

		const bossId = 100 + regularCount;
		npcs.push(createBossTrainer(bossPos, floorNumber, biomeConfig, rng, bossId));
	} else {
		const regularCount = Math.min(trainerPositions.length, maxRegularTrainers);

		for (let i = 0; i < regularCount; i++) {
			const pos = trainerPositions[i];
			const direction = rng.pick(['up', 'down', 'left', 'right'] as const);
			const id = 100 + i;
			npcs.push(createTrainer(pos, direction, floorNumber, biomeConfig, rng, id));
		}
	}

	return npcs;
}
