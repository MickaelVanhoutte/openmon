import { describe, it, expect, vi } from 'vitest';
import { XpManager, type XpOwner } from '../../pokemons/helpers/xp-manager';
import { Stats } from '../../pokemons/pokedex';

function createOwner(overrides: Partial<XpOwner> = {}): XpOwner {
	return {
		level: 50,
		currentXp: 0,
		xpToNextLevel: 1000,
		evsToDistribute: 10,
		currentHp: 100,
		currentStats: new Stats(100, 80, 70, 90, 75, 85),
		evs: new Stats(0, 0, 0, 0, 0, 0),
		evolution: [],
		growthRateId: 1,
		baseXp: 64,
		totalEvs: 0,
		moves: [],
		updateCurrentStats: vi.fn(),
		...overrides
	};
}

describe('XpManager', () => {
	describe('computeXpToNextLevel', () => {
		it('returns xp needed for current level and growth rate', () => {
			const owner = createOwner({ level: 10, growthRateId: 1 });
			const mgr = new XpManager(owner);
			const result = mgr.computeXpToNextLevel();
			expect(result).toBeGreaterThan(0);
			expect(typeof result).toBe('number');
		});
	});

	describe('howMuchXpWon', () => {
		it('returns xp gained from battle', () => {
			const owner = createOwner({ baseXp: 64, level: 20 });
			const mgr = new XpManager(owner);
			const result = mgr.howMuchXpWon(1, false, false);
			expect(result).toBeGreaterThan(0);
		});

		it('returns more xp from trainer battle', () => {
			const owner = createOwner({ baseXp: 64, level: 20 });
			const mgr = new XpManager(owner);
			const wildXp = mgr.howMuchXpWon(1, false, false);
			const trainerXp = mgr.howMuchXpWon(1, true, false);
			expect(trainerXp).toBeGreaterThan(wildXp);
		});
	});

	describe('addXpResult', () => {
		it('adds xp without leveling up', () => {
			const owner = createOwner({ currentXp: 0, xpToNextLevel: 1000 });
			const mgr = new XpManager(owner);
			const result = mgr.addXpResult(500, 0);
			expect(result.levelup).toBe(false);
			expect(result.xpLeft).toBe(0);
			expect(owner.currentXp).toBe(500);
		});

		it('triggers level up when xp exceeds threshold', () => {
			const owner = createOwner({ currentXp: 800, xpToNextLevel: 1000 });
			const mgr = new XpManager(owner);
			const result = mgr.addXpResult(300, 0);
			expect(result.levelup).toBe(true);
			expect(result.xpLeft).toBe(100);
			expect(owner.currentXp).toBe(1000);
		});

		it('does nothing at level 100', () => {
			const owner = createOwner({ level: 100, currentXp: 0 });
			const mgr = new XpManager(owner);
			const result = mgr.addXpResult(9999, 0);
			expect(result.levelup).toBe(false);
			expect(owner.currentXp).toBe(0);
		});

		it('adds EVs to distribute within 510 cap', () => {
			const owner = createOwner({ totalEvs: 500, evsToDistribute: 0 });
			const mgr = new XpManager(owner);
			mgr.addXpResult(0, 20);
			// 500 + 20 > 510, so evs added = 500 + 20 - 510 = 10
			expect(owner.evsToDistribute).toBe(10);
		});

		it('adds full EVs when under 510 cap', () => {
			const owner = createOwner({ totalEvs: 100, evsToDistribute: 0 });
			const mgr = new XpManager(owner);
			mgr.addXpResult(0, 20);
			expect(owner.evsToDistribute).toBe(20);
		});
	});

	describe('addEv', () => {
		it('adds EV to a stat when conditions are met', () => {
			const owner = createOwner({ evsToDistribute: 10, totalEvs: 0 });
			const mgr = new XpManager(owner);
			mgr.addEv('attack', 4);
			expect(owner.evs.attack).toBe(4);
			expect(owner.evsToDistribute).toBe(6);
			expect(owner.updateCurrentStats).toHaveBeenCalled();
		});

		it('does not add when not enough evsToDistribute', () => {
			const owner = createOwner({ evsToDistribute: 2 });
			const mgr = new XpManager(owner);
			mgr.addEv('attack', 4);
			expect(owner.evs.attack).toBe(0);
		});

		it('does not exceed 252 per stat', () => {
			const owner = createOwner({ evsToDistribute: 10, totalEvs: 250 });
			owner.evs.attack = 250;
			const mgr = new XpManager(owner);
			mgr.addEv('attack', 4);
			expect(owner.evs.attack).toBe(250);
		});

		it('does not exceed 510 total', () => {
			const owner = createOwner({ evsToDistribute: 10, totalEvs: 508 });
			const mgr = new XpManager(owner);
			mgr.addEv('speed', 4);
			expect(owner.evs.speed).toBe(0);
		});
	});

	describe('canEvolve', () => {
		it('returns true when level-based evolution is available', () => {
			const owner = createOwner({
				level: 16,
				evolution: [{ id: 2, level: 16, method: 'level' }]
			});
			const mgr = new XpManager(owner);
			expect(mgr.canEvolve()).toBe(true);
		});

		it('returns true when past evolution level', () => {
			const owner = createOwner({
				level: 30,
				evolution: [{ id: 2, level: 16, method: 'level' }]
			});
			const mgr = new XpManager(owner);
			expect(mgr.canEvolve()).toBe(true);
		});

		it('returns false when below evolution level', () => {
			const owner = createOwner({
				level: 10,
				evolution: [{ id: 2, level: 16, method: 'level' }]
			});
			const mgr = new XpManager(owner);
			expect(mgr.canEvolve()).toBe(false);
		});

		it('returns false for non-level evolution methods', () => {
			const owner = createOwner({
				level: 50,
				evolution: [{ id: 2, level: 0, method: 'trade' }]
			});
			const mgr = new XpManager(owner);
			expect(mgr.canEvolve()).toBe(false);
		});

		it('returns false when no evolutions exist', () => {
			const owner = createOwner({ evolution: [] });
			const mgr = new XpManager(owner);
			expect(mgr.canEvolve()).toBe(false);
		});
	});

	describe('levelUp', () => {
		it('increments level and returns stat changes', () => {
			const owner = createOwner({ level: 49, currentHp: 100 });
			const mgr = new XpManager(owner);
			const result = mgr.levelUp();
			expect(owner.level).toBe(50);
			expect(result.oldStats).toBeDefined();
			expect(result.newStats).toBeDefined();
			expect(owner.currentXp).toBe(0);
			expect(owner.updateCurrentStats).toHaveBeenCalled();
		});

		it('returns empty object at level 100', () => {
			const owner = createOwner({ level: 100 });
			const mgr = new XpManager(owner);
			const result = mgr.levelUp();
			expect(result).toEqual({});
			expect(owner.level).toBe(100);
		});

		it('returns new moves learned at the new level', () => {
			const owner = createOwner({
				level: 15,
				moves: [
					{ id: 1, name: 'Tackle', level: 1, type: 'normal', category: 'physical', power: 40, accuracy: 100, pp: 35, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', method: 1 },
					{ id: 2, name: 'Ember', level: 16, type: 'fire', category: 'special', power: 40, accuracy: 100, pp: 25, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', method: 1 }
				] as any
			});
			const mgr = new XpManager(owner);
			const result = mgr.levelUp();
			expect(owner.level).toBe(16);
			expect(result.moves).toHaveLength(1);
			expect(result.moves![0].name).toBe('Ember');
		});
	});
});
