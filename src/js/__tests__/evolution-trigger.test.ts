import { describe, it, expect } from 'vitest';

describe('Evolution Trigger Gating (Characterization)', () => {
	const canEvolve = (
		evolution: { method: string; level: number; id: number }[] | undefined,
		currentLevel: number
	): boolean => {
		return (
			(evolution?.filter((evo) => evo.method === 'level' && evo.level <= currentLevel)?.length ??
				0) > 0
		);
	};

	const shouldTriggerEvolution = (
		monsters: {
			id: number;
			evolution?: { method: string; level: number; id: number }[];
			level: number;
		}[],
		leveledUpMonsterIds: Set<number>
	): boolean => {
		return monsters.some(
			(pkmn) => leveledUpMonsterIds.has(pkmn.id) && canEvolve(pkmn.evolution, pkmn.level)
		);
	};

	it('should NOT trigger evolution for Pokemon that did not level up in battle', () => {
		const monsters = [{ id: 1, level: 20, evolution: [{ method: 'level', level: 16, id: 2 }] }];
		const leveledUpMonsterIds = new Set<number>();
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIds)).toBe(false);
	});

	it('should trigger evolution for Pokemon that leveled up past evolution level', () => {
		const monsters = [{ id: 1, level: 16, evolution: [{ method: 'level', level: 16, id: 2 }] }];
		const leveledUpMonsterIds = new Set<number>([1]);
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIds)).toBe(true);
	});

	it('should NOT trigger evolution for Pokemon that leveled up but has no evolution', () => {
		const monsters = [{ id: 1, level: 50 }];
		const leveledUpMonsterIds = new Set<number>([1]);
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIds)).toBe(false);
	});

	it('should handle empty leveledUpMonsterIds set', () => {
		const monsters = [{ id: 1, level: 16, evolution: [{ method: 'level', level: 16, id: 2 }] }];
		const leveledUpMonsterIds = new Set<number>();
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIds)).toBe(false);
	});

	it('should only trigger for the Pokemon that leveled up, not others', () => {
		const monsters = [
			{ id: 1, level: 10, evolution: [{ method: 'level', level: 16, id: 2 }] },
			{ id: 3, level: 16, evolution: [{ method: 'level', level: 16, id: 4 }] },
			{ id: 5, level: 20 }
		];
		const leveledUpMonsterIds = new Set<number>([3]);
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIds)).toBe(true);

		const leveledUpMonsterIdsNone = new Set<number>([1, 5]);
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIdsNone)).toBe(false);
	});

	it('should NOT trigger for item-based evolution methods', () => {
		const monsters = [{ id: 1, level: 20, evolution: [{ method: 'item', level: 1, id: 2 }] }];
		const leveledUpMonsterIds = new Set<number>([1]);
		expect(shouldTriggerEvolution(monsters, leveledUpMonsterIds)).toBe(false);
	});
});
