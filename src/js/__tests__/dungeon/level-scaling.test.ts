import { describe, it, expect } from 'vitest';
import { createTrainer, createBossTrainer } from '../../dungeon/trainer-factory';
import { GRASS_FOREST, DARK_HAUNTED } from '../../dungeon/biomes';
import { SeededRNG } from '../../dungeon/prng';
import { Position } from '../../mapping/positions';

describe('Floor-based Level Scaling', () => {
	const pos = new Position(5, 5);

	function getTrainerLevels(floor: number): number[] {
		const rng = new SeededRNG(`level-test-${floor}`);
		const trainer = createTrainer(pos, 'down', floor, GRASS_FOREST, rng);
		return trainer.dungeonTeam!.map((m) => m.level);
	}

	it('floor 1 produces base level 3 with +0 to +2 variance', () => {
		const levels = getTrainerLevels(1);
		levels.forEach((level) => {
			expect(level).toBeGreaterThanOrEqual(3);
			expect(level).toBeLessThanOrEqual(5);
		});
	});

	it('floor 50 produces base level 52 with +0 to +2 variance', () => {
		const levels = getTrainerLevels(50);
		levels.forEach((level) => {
			expect(level).toBeGreaterThanOrEqual(52);
			expect(level).toBeLessThanOrEqual(54);
		});
	});

	it('trainer level is capped at 100', () => {
		const levels = getTrainerLevels(99);
		levels.forEach((level) => {
			expect(level).toBeLessThanOrEqual(100);
			expect(level).toBeGreaterThanOrEqual(1);
		});
	});

	it('boss level uses floor-based formula plus offset', () => {
		const rng = new SeededRNG('boss-level-test');
		const boss = createBossTrainer(pos, 5, GRASS_FOREST, rng);
		const bossLevels = boss.dungeonTeam!.map((m) => m.level);

		bossLevels.forEach((level) => {
			expect(level).toBeGreaterThanOrEqual(7);
			expect(level).toBeLessThanOrEqual(11);
		});
	});

	it('boss level capped at 120', () => {
		const rng = new SeededRNG('boss-cap-test');
		const boss = createBossTrainer(pos, 200, DARK_HAUNTED, rng);
		const bossLevels = boss.dungeonTeam!.map((m) => m.level);

		bossLevels.forEach((level) => {
			expect(level).toBeLessThanOrEqual(120);
		});
	});

	it('level is always at least 1', () => {
		const rng = new SeededRNG('min-level-test');
		const trainer = createTrainer(pos, 'down', 1, GRASS_FOREST, rng);
		trainer.dungeonTeam!.forEach((m) => {
			expect(m.level).toBeGreaterThanOrEqual(1);
		});
	});

	it('levels increase with floor number', () => {
		const levels1 = getTrainerLevels(1);
		const levels30 = getTrainerLevels(30);
		const avg1 = levels1.reduce((a, b) => a + b, 0) / levels1.length;
		const avg30 = levels30.reduce((a, b) => a + b, 0) / levels30.length;
		expect(avg30).toBeGreaterThan(avg1);
	});

	it('boss at floor 50 has higher levels than boss at floor 5', () => {
		const rng5 = new SeededRNG('boss-compare-5');
		const rng50 = new SeededRNG('boss-compare-50');
		const boss5 = createBossTrainer(pos, 5, GRASS_FOREST, rng5);
		const boss50 = createBossTrainer(pos, 50, DARK_HAUNTED, rng50);
		const avgBoss5 =
			boss5.dungeonTeam!.reduce((a, m) => a + m.level, 0) / boss5.dungeonTeam!.length;
		const avgBoss50 =
			boss50.dungeonTeam!.reduce((a, m) => a + m.level, 0) / boss50.dungeonTeam!.length;
		expect(avgBoss50).toBeGreaterThan(avgBoss5);
	});
});
