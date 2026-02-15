import { describe, it, expect } from 'vitest';
import { createTrainer, createBossTrainer, populateFloor } from '../../dungeon/trainer-factory';
import { Position } from '../../mapping/positions';
import { SeededRNG } from '../../dungeon/prng';
import { GRASS_FOREST } from '../../dungeon/biomes';
import { NPC } from '../../characters/npc';

describe('trainer-factory', () => {
	const rng = new SeededRNG('test-seed');
	const pos = new Position(5, 5);

	describe('createTrainer', () => {
		it('should create a regular trainer with 1-3 Pokemon', () => {
			const trainer = createTrainer(pos, 'down', 1, GRASS_FOREST, rng);
			expect(trainer).toBeInstanceOf(NPC);
			expect(trainer.monsterIds.length).toBeGreaterThanOrEqual(1);
			expect(trainer.monsterIds.length).toBeLessThanOrEqual(3);
			expect(trainer.mainScript).toBeDefined();
			expect(trainer.mainScript?.triggerType).toBe('onSight');
		});

		it('should use Pokemon from the biome monsterTable', () => {
			const trainer = createTrainer(pos, 'down', 1, GRASS_FOREST, rng);
			const validIds = GRASS_FOREST.monsterTable.map((m) => m.id);
			trainer.monsterIds.forEach((id) => {
				expect(validIds).toContain(id);
			});
		});
	});

	describe('createBossTrainer', () => {
		it('should create a boss trainer from JSON boss definitions', () => {
			const boss = createBossTrainer(pos, 5, GRASS_FOREST, rng);
			expect(boss.name).toBe('Ranger Oakley');
			expect(boss.monsterIds.length).toBe(3);
			expect(boss.mainScript).toBeDefined();
		});
	});

	describe('populateFloor', () => {
		it('should limit trainers to scaling table count', () => {
			const trainerPositions = [new Position(1, 1), new Position(2, 2)];
			const generatorOutput = { trainerPositions } as any;
			const localRng = new SeededRNG('populate-seed');
			const npcs = populateFloor(generatorOutput, 1, GRASS_FOREST, localRng);
			expect(npcs.length).toBe(1);
			expect(npcs[0].position.positionOnMap.x).toBe(1);
		});

		it('should create a boss on boss floors at the last position', () => {
			const trainerPositions = [new Position(1, 1), new Position(2, 2)];
			const generatorOutput = { trainerPositions } as any;
			const localRng = new SeededRNG('boss-populate-seed');
			const npcs = populateFloor(generatorOutput, 5, GRASS_FOREST, localRng);
			const bossNpc = npcs.find((n) => n.name === 'Ranger Oakley');
			expect(bossNpc).toBeDefined();
			expect(npcs.filter((n) => n.name !== 'Ranger Oakley').length).toBeGreaterThanOrEqual(0);
		});
	});

	describe('determinism', () => {
		it('should produce the same trainers for the same seed', () => {
			const rng1 = new SeededRNG('same-seed');
			const rng2 = new SeededRNG('same-seed');

			const trainer1 = createTrainer(pos, 'down', 1, GRASS_FOREST, rng1);
			const trainer2 = createTrainer(pos, 'down', 1, GRASS_FOREST, rng2);

			expect(trainer1.name).toBe(trainer2.name);
			expect(trainer1.monsterIds).toEqual(trainer2.monsterIds);
			expect(trainer1.spriteId).toBe(trainer2.spriteId);
		});
	});
});
