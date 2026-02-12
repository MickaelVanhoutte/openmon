import { NPC } from '../characters/npc';
import { Position } from '../mapping/positions';
import {
	Script,
	StartBattle,
	Dialog,
	Message,
	MoveToPlayer,
	GiveMoney
} from '../scripting/scripts';
import { SeededRNG } from './prng';
import { type BiomeConfig } from './biomes';
import type { FloorData } from './floor-generator';

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

	const spriteId = rng.pick([3, 4]);
	const gender = spriteId === 4 ? 'FEMALE' : 'MALE';

	const pokemonCount = rng.nextInt(1, 3);
	const monsterIds: number[] = [];
	for (let i = 0; i < pokemonCount; i++) {
		monsterIds.push(rng.pick(biomeConfig.monsterTable).id);
	}

	const [minLevel, maxLevel] = biomeConfig.levelRange;
	const biomeFloorRange = biomeConfig.floorRange;
	const floorProgress =
		(floorNumber - biomeFloorRange[0]) / (biomeFloorRange[1] - biomeFloorRange[0] || 1);
	const baseLevel = Math.floor(minLevel + (maxLevel - minLevel) * floorProgress);
	const level = Math.max(1, baseLevel + rng.nextInt(-1, 1));

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
		new GiveMoney(100 + floorNumber * 10 + level),
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
		])
	]);

	return new NPC(
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
}

export function createBossTrainer(
	position: Position,
	floorNumber: number,
	biomeConfig: BiomeConfig,
	rng: SeededRNG,
	id: number = rng.nextInt(10000, 19999)
): NPC {
	const name = 'Floor Boss';
	const spriteId = 3;
	const gender = 'MALE';

	const pokemonCount = rng.nextInt(3, 6);
	const monsterIds: number[] = [];
	for (let i = 0; i < pokemonCount; i++) {
		monsterIds.push(rng.pick(biomeConfig.monsterTable).id);
	}

	const [_, maxLevel] = biomeConfig.levelRange;
	const level = maxLevel + 5;

	const mainScript = new Script('onSight', [
		new MoveToPlayer(id),
		new Dialog([
			new Message('I am the guardian of this floor!', name),
			new Message('Prove your worth in battle!', name)
		]),
		new StartBattle(id),
		new GiveMoney(500 + floorNumber * 50 + level * 5),
		new Dialog([new Message('Impressive. You may proceed to the next floor.', name)])
	]);

	return new NPC(id, name, spriteId, position, 'down', gender, monsterIds, undefined, mainScript);
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

	for (let i = 0; i < trainerPositions.length; i++) {
		const pos = trainerPositions[i];
		const direction = rng.pick(['up', 'down', 'left', 'right'] as const);
		const id = 100 + i;

		if (isBossFloor && i === trainerPositions.length - 1) {
			npcs.push(createBossTrainer(pos, floorNumber, biomeConfig, rng, id));
		} else {
			npcs.push(createTrainer(pos, direction, floorNumber, biomeConfig, rng, id));
		}
	}

	return npcs;
}
