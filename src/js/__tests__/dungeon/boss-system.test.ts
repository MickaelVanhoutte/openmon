import { describe, it, expect } from 'vitest';
import { getBossForFloor } from '../../dungeon/boss-loader';
import { createBossTrainer } from '../../dungeon/trainer-factory';
import { GRASS_FOREST, DARK_HAUNTED, getBiomeForFloor } from '../../dungeon/biomes';
import { SeededRNG } from '../../dungeon/prng';
import { Position } from '../../mapping/positions';

describe('Boss System', () => {
	const pos = new Position(7, 7);

	describe('getBossForFloor', () => {
		it('returns a boss every 5 floors', () => {
			expect(getBossForFloor(5)).toBeDefined();
			expect(getBossForFloor(10)).toBeDefined();
			expect(getBossForFloor(15)).toBeDefined();
			expect(getBossForFloor(50)).toBeDefined();
		});

		it('returns undefined for non-boss floors', () => {
			expect(getBossForFloor(1)).toBeUndefined();
			expect(getBossForFloor(3)).toBeUndefined();
			expect(getBossForFloor(7)).toBeUndefined();
			expect(getBossForFloor(12)).toBeUndefined();
		});

		it('returns undefined for floor 0 and negative floors', () => {
			expect(getBossForFloor(0)).toBeUndefined();
			expect(getBossForFloor(-5)).toBeUndefined();
		});

		it('10 unique bosses across floors 5-50', () => {
			const bossNames = new Set<string>();
			for (let floor = 5; floor <= 50; floor += 5) {
				const boss = getBossForFloor(floor);
				expect(boss).toBeDefined();
				bossNames.add(boss!.name);
			}
			expect(bossNames.size).toBe(10);
		});

		it('bosses cycle after floor 50', () => {
			const boss5 = getBossForFloor(5);
			const boss55 = getBossForFloor(55);
			expect(boss5!.name).toBe(boss55!.name);

			const boss50 = getBossForFloor(50);
			const boss100 = getBossForFloor(100);
			expect(boss50!.name).toBe(boss100!.name);
		});
	});

	describe('BossDefinition fields', () => {
		const bossFloors = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

		it.each(bossFloors)('floor %i boss has name, team, dialogue', (floor) => {
			const boss = getBossForFloor(floor)!;
			expect(boss.name).toBeTruthy();
			expect(boss.team.length).toBeGreaterThan(0);
			expect(boss.dialogBefore).toBeTruthy();
			expect(boss.dialogAfter).toBeTruthy();
			expect(boss.spriteId).toBeGreaterThan(0);
			expect(boss.id).toBeTruthy();
			expect(boss.biome).toBeTruthy();
		});

		it.each(bossFloors)('floor %i team members have valid speciesId and levelOffset', (floor) => {
			const boss = getBossForFloor(floor)!;
			boss.team.forEach((member) => {
				expect(member.speciesId).toBeGreaterThan(0);
				expect(Number.isInteger(member.speciesId)).toBe(true);
				expect(member.levelOffset).toBeGreaterThanOrEqual(0);
			});
		});

		it.each(bossFloors)('floor %i held items are valid item IDs or null', (floor) => {
			const boss = getBossForFloor(floor)!;
			boss.team.forEach((member) => {
				if (member.heldItemId !== null) {
					expect(member.heldItemId).toBeGreaterThanOrEqual(4001);
					expect(member.heldItemId).toBeLessThanOrEqual(4022);
				}
			});
		});
	});

	describe('Boss level scaling', () => {
		it('boss level uses floor-based formula + offset', () => {
			const rng = new SeededRNG('boss-level-check');
			const boss = createBossTrainer(pos, 5, GRASS_FOREST, rng);
			const bossDef = getBossForFloor(5)!;
			const baseLevel = 5 + 2;

			boss.dungeonTeam!.forEach((m, i) => {
				const expectedLevel = Math.min(baseLevel + bossDef.team[i].levelOffset, 120);
				expect(m.level).toBe(expectedLevel);
			});
		});

		it('boss level capped at 120 for extreme floors', () => {
			const rng = new SeededRNG('boss-cap-check');
			const boss = createBossTrainer(pos, 200, DARK_HAUNTED, rng);

			boss.dungeonTeam!.forEach((m) => {
				expect(m.level).toBeLessThanOrEqual(120);
			});
		});

		it('boss team size matches JSON definition', () => {
			for (let floor = 5; floor <= 50; floor += 5) {
				const bossDef = getBossForFloor(floor)!;
				const rng = new SeededRNG(`boss-size-${floor}`);
				const biome = getBiomeForFloor(floor);
				const boss = createBossTrainer(pos, floor, biome, rng);
				expect(boss.dungeonTeam!.length).toBe(bossDef.team.length);
			}
		});

		it('boss NPC has correct name from JSON', () => {
			const expected: Record<number, string> = {
				5: 'Ranger Oakley',
				10: 'Warden Thorn',
				15: 'Miner Slate',
				20: 'Foreman Basalt',
				25: 'Captain Coral',
				30: 'Admiral Murk',
				35: 'Pyro Ember',
				40: 'Inferno Rex',
				45: 'Phantom Nyx',
				50: 'Overlord Shade'
			};

			for (const [floor, name] of Object.entries(expected)) {
				const rng = new SeededRNG(`boss-name-${floor}`);
				const biome = getBiomeForFloor(Number(floor));
				const boss = createBossTrainer(pos, Number(floor), biome, rng);
				expect(boss.name).toBe(name);
			}
		});
	});
});
