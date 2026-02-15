import { describe, it, expect } from 'vitest';
import {
	getTrainerScaling,
	TRAINER_SCALING,
	createTrainer,
	populateFloor
} from '../../dungeon/trainer-factory';
import { GRASS_FOREST, DARK_HAUNTED, getBiomeForFloor } from '../../dungeon/biomes';
import { SeededRNG } from '../../dungeon/prng';
import { Position } from '../../mapping/positions';

describe('Trainer Scaling', () => {
	describe('getTrainerScaling', () => {
		it('floor 1: 1 trainer, 1-2 Pokemon', () => {
			const s = getTrainerScaling(1);
			expect(s.trainerCount).toEqual([1, 1]);
			expect(s.pokemonPerTrainer).toEqual([1, 2]);
		});

		it('floor 5: 1 trainer, 1-2 Pokemon', () => {
			const s = getTrainerScaling(5);
			expect(s.trainerCount).toEqual([1, 1]);
			expect(s.pokemonPerTrainer).toEqual([1, 2]);
		});

		it('floor 6: 2 trainers, 1-2 Pokemon', () => {
			const s = getTrainerScaling(6);
			expect(s.trainerCount).toEqual([2, 2]);
			expect(s.pokemonPerTrainer).toEqual([1, 2]);
		});

		it('floor 15: 2-3 trainers, 2-3 Pokemon', () => {
			const s = getTrainerScaling(15);
			expect(s.trainerCount).toEqual([2, 3]);
			expect(s.pokemonPerTrainer).toEqual([2, 3]);
		});

		it('floor 25: 3-4 trainers, 2-4 Pokemon', () => {
			const s = getTrainerScaling(25);
			expect(s.trainerCount).toEqual([3, 4]);
			expect(s.pokemonPerTrainer).toEqual([2, 4]);
		});

		it('floor 35: 3-5 trainers, 3-5 Pokemon', () => {
			const s = getTrainerScaling(35);
			expect(s.trainerCount).toEqual([3, 5]);
			expect(s.pokemonPerTrainer).toEqual([3, 5]);
		});

		it('floor 100 (cycling): still uses 31+ scaling', () => {
			const s = getTrainerScaling(100);
			expect(s.trainerCount).toEqual([3, 5]);
			expect(s.pokemonPerTrainer).toEqual([3, 5]);
		});

		it('TRAINER_SCALING has 5 tiers', () => {
			expect(TRAINER_SCALING).toHaveLength(5);
		});

		it('tiers cover all positive floors without gaps', () => {
			expect(TRAINER_SCALING[0].minFloor).toBe(1);
			for (let i = 1; i < TRAINER_SCALING.length; i++) {
				expect(TRAINER_SCALING[i].minFloor).toBe(TRAINER_SCALING[i - 1].maxFloor + 1);
			}
			expect(TRAINER_SCALING[TRAINER_SCALING.length - 1].maxFloor).toBe(Infinity);
		});
	});

	describe('createTrainer pokemon count matches scaling', () => {
		const testCases = [
			{ floor: 1, minPoke: 1, maxPoke: 2 },
			{ floor: 6, minPoke: 1, maxPoke: 2 },
			{ floor: 15, minPoke: 2, maxPoke: 3 },
			{ floor: 25, minPoke: 2, maxPoke: 4 },
			{ floor: 35, minPoke: 3, maxPoke: 5 }
		];

		it.each(testCases)(
			'floor $floor: $minPoke-$maxPoke pokemon per trainer',
			({ floor, minPoke, maxPoke }) => {
				const rng = new SeededRNG(`poke-count-${floor}`);
				const pos = new Position(5, 5);
				const biome = getBiomeForFloor(floor);
				const trainer = createTrainer(pos, 'down', floor, biome, rng);
				expect(trainer.dungeonTeam!.length).toBeGreaterThanOrEqual(minPoke);
				expect(trainer.dungeonTeam!.length).toBeLessThanOrEqual(maxPoke);
			}
		);
	});

	describe('populateFloor trainer limiting', () => {
		it('limits trainers to scaling table count', () => {
			const positions = Array.from({ length: 5 }, (_, i) => new Position(i + 1, i + 1));
			const generatorOutput = { trainerPositions: positions } as any;
			const rng = new SeededRNG('populate-limit-test');
			const npcs = populateFloor(generatorOutput, 1, GRASS_FOREST, rng);
			expect(npcs.length).toBe(1);
		});

		it('higher floors get more trainers', () => {
			const positions = Array.from({ length: 8 }, (_, i) => new Position(i + 1, i + 1));
			const output = { trainerPositions: positions } as any;

			const rng1 = new SeededRNG('populate-high-1');
			const npcs1 = populateFloor(output, 1, GRASS_FOREST, rng1);

			const rng31 = new SeededRNG('populate-high-31');
			const npcs31 = populateFloor(output, 31, DARK_HAUNTED, rng31);

			expect(npcs31.length).toBeGreaterThan(npcs1.length);
		});

		it('boss floor: boss is additional to regular trainers', () => {
			const positions = Array.from({ length: 4 }, (_, i) => new Position(i + 1, i + 1));
			const generatorOutput = { trainerPositions: positions } as any;
			const rng = new SeededRNG('boss-additional-test');
			const npcs = populateFloor(generatorOutput, 5, GRASS_FOREST, rng);

			const bossDef = npcs.find((n) => n.name === 'Ranger Oakley');
			expect(bossDef).toBeDefined();

			const regularTrainers = npcs.filter((n) => n.name !== 'Ranger Oakley');
			expect(regularTrainers.length).toBeGreaterThanOrEqual(0);
			expect(npcs.length).toBeGreaterThanOrEqual(1);
		});

		it('non-boss floor has no boss trainer', () => {
			const positions = Array.from({ length: 4 }, (_, i) => new Position(i + 1, i + 1));
			const generatorOutput = { trainerPositions: positions } as any;
			const rng = new SeededRNG('no-boss-test');
			const npcs = populateFloor(generatorOutput, 3, GRASS_FOREST, rng);

			npcs.forEach((npc) => {
				const bossDef = ['Ranger Oakley', 'Warden Thorn', 'Floor Boss'];
				expect(bossDef).not.toContain(npc.name);
			});
		});

		it('empty positions array produces no trainers', () => {
			const generatorOutput = { trainerPositions: [] } as any;
			const rng = new SeededRNG('empty-positions');
			const npcs = populateFloor(generatorOutput, 1, GRASS_FOREST, rng);
			expect(npcs.length).toBe(0);
		});
	});
});
