import { describe, it, expect, beforeEach } from 'vitest';
import {
	MasteryType,
	MasteryGroup,
	MasteriesBonuses,
	PlayerMasteries,
	Mastery
} from '../../characters/mastery-model';
import { EXPERIENCE_CHART } from '../../pokemons/experience';

describe('MasteryType enum', () => {
	it('should have 30 values', () => {
		const values = Object.values(MasteryType);
		expect(values).toHaveLength(30);
	});

	it('should contain core combat types', () => {
		expect(MasteryType.START).toBe('start');
		expect(MasteryType.CATCH).toBe('catch');
		expect(MasteryType.XP).toBe('xp');
		expect(MasteryType.EV).toBe('ev');
		expect(MasteryType.SHINY).toBe('shiny');
		expect(MasteryType.CRITICAL).toBe('critical');
		expect(MasteryType.STAB).toBe('stab');
		expect(MasteryType.NON_STAB).toBe('nonStab');
		expect(MasteryType.ACCURACY).toBe('accuracy');
	});

	it('should contain effectiveness and resistance types', () => {
		expect(MasteryType.EFFECTIVENESS).toBe('effectiveness');
		expect(MasteryType.RESISTANCE).toBe('resistance');
	});

	it('should contain combo types', () => {
		expect(MasteryType.COMBO_JAUGE).toBe('comboJauge');
		expect(MasteryType.COMBO_DAMAGE).toBe('comboDamage');
	});

	it('should contain healing types', () => {
		expect(MasteryType.HEAL).toBe('heal');
		expect(MasteryType.AUTO_HEAL).toBe('autoHeal');
	});

	it('should contain status effect types', () => {
		expect(MasteryType.DOT_CHANCE).toBe('dotChance');
		expect(MasteryType.DOT_DAMAGE).toBe('dotDamage');
		expect(MasteryType.CONFUSE).toBe('confuse');
		expect(MasteryType.ATTRACT).toBe('attract');
	});

	it('should contain weather types', () => {
		expect(MasteryType.WEATHER_SUN).toBe('wSun');
		expect(MasteryType.WEATHER_RAIN).toBe('wRain');
		expect(MasteryType.WEATHER_SAND).toBe('wSand');
		expect(MasteryType.WEATHER_HAIL).toBe('wHail');
		expect(MasteryType.WEATHER_TURN_ALLY).toBe('wTurnAlly');
		expect(MasteryType.WEATHER_TURN_OPPONENT).toBe('wTurnOpp');
	});

	it('should contain HM types', () => {
		expect(MasteryType.CUT).toBe('cut');
		expect(MasteryType.FLY).toBe('fly');
		expect(MasteryType.SURF).toBe('surf');
		expect(MasteryType.STRENGTH).toBe('strength');
		expect(MasteryType.ROCK_SMASH).toBe('rockSmash');
	});
});

describe('MasteryGroup enum', () => {
	it('should have NOVICE value', () => {
		expect(MasteryGroup.NOVICE).toBe('novice');
	});

	it('should have EXPERT value', () => {
		expect(MasteryGroup.EXPERT).toBe('expert');
	});

	it('should have exactly 2 values', () => {
		expect(Object.values(MasteryGroup)).toHaveLength(2);
	});
});

describe('MasteriesBonuses', () => {
	let bonuses: MasteriesBonuses;

	beforeEach(() => {
		bonuses = new MasteriesBonuses();
	});

	describe('default values', () => {
		it('should initialize all combat bonuses to 0', () => {
			expect(bonuses.catch).toBe(0);
			expect(bonuses.xp).toBe(0);
			expect(bonuses.ev).toBe(0);
			expect(bonuses.shiny).toBe(0);
			expect(bonuses.critical).toBe(0);
			expect(bonuses.stab).toBe(0);
			expect(bonuses.nonStab).toBe(0);
		});

		it('should initialize all utility bonuses to 0', () => {
			expect(bonuses.accuracy).toBe(0);
			expect(bonuses.effectiveness).toBe(0);
			expect(bonuses.resistance).toBe(0);
			expect(bonuses.comboJauge).toBe(0);
			expect(bonuses.comboDamage).toBe(0);
		});

		it('should initialize HM bonuses to 0', () => {
			expect(bonuses.cut).toBe(0);
			expect(bonuses.fly).toBe(0);
			expect(bonuses.surf).toBe(0);
			expect(bonuses.strength).toBe(0);
			expect(bonuses.rockSmash).toBe(0);
		});
	});

	describe('enableMastery', () => {
		it('should add value to the specified mastery type', () => {
			bonuses.enableMastery(MasteryType.CATCH, 10);
			expect(bonuses.catch).toBe(10);
		});

		it('should accumulate values on repeated calls', () => {
			bonuses.enableMastery(MasteryType.XP, 5);
			bonuses.enableMastery(MasteryType.XP, 3);
			expect(bonuses.xp).toBe(8);
		});

		it('should not affect other mastery types', () => {
			bonuses.enableMastery(MasteryType.CRITICAL, 15);
			expect(bonuses.critical).toBe(15);
			expect(bonuses.stab).toBe(0);
			expect(bonuses.catch).toBe(0);
		});
	});

	describe('getMastery', () => {
		it('should return 0 for unset mastery', () => {
			expect(bonuses.getMastery(MasteryType.SHINY)).toBe(0);
		});

		it('should return the current value after enableMastery', () => {
			bonuses.enableMastery(MasteryType.STAB, 20);
			expect(bonuses.getMastery(MasteryType.STAB)).toBe(20);
		});

		it('should return accumulated value after multiple enableMastery calls', () => {
			bonuses.enableMastery(MasteryType.EV, 3);
			bonuses.enableMastery(MasteryType.EV, 7);
			expect(bonuses.getMastery(MasteryType.EV)).toBe(10);
		});
	});

	describe('constructor with custom values', () => {
		it('should accept custom initial values', () => {
			const custom = new MasteriesBonuses(5, 10, 15);
			expect(custom.catch).toBe(5);
			expect(custom.xp).toBe(10);
			expect(custom.ev).toBe(15);
		});

		it('should default remaining params to 0', () => {
			const custom = new MasteriesBonuses(1, 2);
			expect(custom.catch).toBe(1);
			expect(custom.xp).toBe(2);
			expect(custom.ev).toBe(0);
			expect(custom.shiny).toBe(0);
		});
	});
});

describe('PlayerMasteries', () => {
	let masteries: PlayerMasteries;

	beforeEach(() => {
		masteries = new PlayerMasteries();
	});

	describe('constructor', () => {
		it('should load novice masteries from JSON data', () => {
			expect(masteries.novice.length).toBeGreaterThan(0);
		});

		it('should load expert masteries from JSON data', () => {
			expect(masteries.expert.length).toBeGreaterThan(0);
		});

		it('should initialize novice entries as Mastery instances', () => {
			expect(masteries.novice[0]).toBeInstanceOf(Mastery);
		});

		it('should initialize expert entries as Mastery instances', () => {
			expect(masteries.expert[0]).toBeInstanceOf(Mastery);
		});

		it('should start at level 1', () => {
			expect(masteries.level).toBe(1);
		});

		it('should start with 20 points', () => {
			expect(masteries.points).toBe(20);
		});

		it('should start with 0 exp', () => {
			expect(masteries.exp).toBe(0);
		});

		it('should compute xpToNextLevel from EXPERIENCE_CHART', () => {
			const expected = EXPERIENCE_CHART.howMuchINeed(1, 1) * 2;
			expect(masteries.xpToNextLevel).toBe(expected);
		});

		it('should have xpToNextLevel of 0 at level 1', () => {
			expect(masteries.xpToNextLevel).toBe(0);
		});

		it('should initialize bonuses as default MasteriesBonuses', () => {
			expect(masteries.bonuses).toBeInstanceOf(MasteriesBonuses);
			expect(masteries.bonuses.catch).toBe(0);
		});

		it('should assign correct group to novice entries', () => {
			masteries.novice.forEach((m) => {
				expect(m.group).toBe(MasteryGroup.NOVICE);
			});
		});

		it('should assign correct group to expert entries', () => {
			masteries.expert.forEach((m) => {
				expect(m.group).toBe(MasteryGroup.EXPERT);
			});
		});
	});

	describe('addExp', () => {
		it('should increase exp by the given amount', () => {
			masteries.addExp(10);
			expect(masteries.exp).toBe(10);
		});

		it('should level up immediately at level 1 since xpToNextLevel is 0', () => {
			masteries.addExp(1);
			expect(masteries.level).toBe(2);
		});

		it('should level up even when adding 0 exp at level 1 since threshold is 0', () => {
			masteries.addExp(0);
			expect(masteries.level).toBe(2);
			expect(masteries.exp).toBe(0);
			expect(masteries.points).toBe(21);
		});

		it('should level up when exp reaches threshold', () => {
			const xpNeeded = masteries.xpToNextLevel;
			masteries.addExp(xpNeeded);
			expect(masteries.level).toBe(2);
			expect(masteries.points).toBe(21);
			expect(masteries.exp).toBe(0);
		});

		it('should carry over leftover exp after level up', () => {
			const xpNeeded = masteries.xpToNextLevel;
			const leftover = 5;
			masteries.addExp(xpNeeded + leftover);
			expect(masteries.level).toBe(2);
			expect(masteries.exp).toBe(leftover);
		});

		it('should handle recursive level ups', () => {
			const xpForLevel1 = masteries.xpToNextLevel;
			masteries.addExp(xpForLevel1);
			expect(masteries.level).toBe(2);
			const xpForLevel2 = masteries.xpToNextLevel;

			masteries = new PlayerMasteries();
			masteries.addExp(xpForLevel1 + xpForLevel2);
			expect(masteries.level).toBe(3);
			expect(masteries.points).toBe(22);
		});

		it('should recalculate xpToNextLevel after level up', () => {
			const initialXp = masteries.xpToNextLevel;
			masteries.addExp(initialXp);
			const newXp = masteries.xpToNextLevel;
			expect(newXp).toBe(EXPERIENCE_CHART.howMuchINeed(2, 1) * 2);
			expect(newXp).not.toBe(initialXp);
		});
	});

	describe('levelUp', () => {
		it('should increment points by 1', () => {
			const before = masteries.points;
			masteries.levelUp();
			expect(masteries.points).toBe(before + 1);
		});

		it('should reset exp to 0', () => {
			masteries.exp = 50;
			masteries.levelUp();
			expect(masteries.exp).toBe(0);
		});

		it('should recalculate xpToNextLevel based on current level', () => {
			masteries.level = 5;
			masteries.levelUp();
			expect(masteries.xpToNextLevel).toBe(EXPERIENCE_CHART.howMuchINeed(5, 1) * 2);
		});
	});

	describe('setMastery', () => {
		function findSettableNode(pm: PlayerMasteries): Mastery | undefined {
			return pm.novice.find((m) => !m.set && m.settable && m.cost <= pm.points);
		}

		it('should mark a valid node as set', () => {
			const node = findSettableNode(masteries);
			if (!node) {
				return;
			}
			masteries.setMastery(node);
			const found = masteries.novice.find((m) => m.q === node.q && m.r === node.r);
			expect(found?.set).toBe(true);
		});

		it('should mark a valid node as no longer settable', () => {
			const node = findSettableNode(masteries);
			if (!node) {
				return;
			}
			masteries.setMastery(node);
			const found = masteries.novice.find((m) => m.q === node.q && m.r === node.r);
			expect(found?.settable).toBe(false);
		});

		it('should deduct cost from points', () => {
			const node = findSettableNode(masteries);
			if (!node) {
				return;
			}
			const pointsBefore = masteries.points;
			masteries.setMastery(node);
			expect(masteries.points).toBe(pointsBefore - node.cost);
		});

		it('should enable the mastery bonus', () => {
			const node = findSettableNode(masteries);
			if (!node) {
				return;
			}
			masteries.setMastery(node);
			expect(masteries.bonuses.getMastery(node.type)).toBeGreaterThanOrEqual(node.value);
		});

		it('should not deduct points when node is already set', () => {
			const node = findSettableNode(masteries);
			if (!node) {
				return;
			}
			masteries.setMastery(node);
			const pointsAfterFirst = masteries.points;
			masteries.setMastery(node);
			expect(masteries.points).toBe(pointsAfterFirst);
		});

		it('should not deduct points when insufficient points available', () => {
			const node = findSettableNode(masteries);
			if (!node) {
				return;
			}
			masteries.points = 0;
			masteries.setMastery(node);
			const found = masteries.novice.find((m) => m.q === node.q && m.r === node.r);
			expect(found?.set).toBe(false);
			expect(masteries.points).toBe(0);
		});

		it('should not set a node that does not exist in any group', () => {
			const fakeMastery = new Mastery(
				999,
				999,
				1,
				'Fake',
				'',
				'red',
				false,
				false,
				true,
				MasteryType.XP,
				5,
				MasteryGroup.NOVICE
			);
			const pointsBefore = masteries.points;
			masteries.setMastery(fakeMastery);
			expect(masteries.points).toBe(pointsBefore);
		});
	});

	describe('fromInstance', () => {
		it('should create a new PlayerMasteries when called without argument', () => {
			const restored = PlayerMasteries.fromInstance();
			expect(restored).toBeInstanceOf(PlayerMasteries);
			expect(restored.level).toBe(1);
			expect(restored.points).toBe(20);
		});

		it('should restore level and points from saved data', () => {
			masteries.level = 5;
			masteries.points = 15;
			const restored = PlayerMasteries.fromInstance(masteries);
			expect(restored.level).toBe(5);
			expect(restored.points).toBe(15);
		});

		it('should restore exp and xpToNextLevel', () => {
			masteries.exp = 42;
			masteries.xpToNextLevel = 200;
			const restored = PlayerMasteries.fromInstance(masteries);
			expect(restored.exp).toBe(42);
			expect(restored.xpToNextLevel).toBe(200);
		});

		it('should restore bonuses as proper MasteriesBonuses instance', () => {
			masteries.bonuses.enableMastery(MasteryType.CATCH, 10);
			const restored = PlayerMasteries.fromInstance(masteries);
			expect(restored.bonuses).toBeInstanceOf(MasteriesBonuses);
			expect(restored.bonuses.catch).toBe(10);
		});

		it('should restore novice entries as Mastery instances', () => {
			const restored = PlayerMasteries.fromInstance(masteries);
			expect(restored.novice.length).toBe(masteries.novice.length);
			restored.novice.forEach((m) => {
				expect(m).toBeInstanceOf(Mastery);
			});
		});

		it('should restore expert entries as Mastery instances', () => {
			const restored = PlayerMasteries.fromInstance(masteries);
			expect(restored.expert.length).toBe(masteries.expert.length);
			restored.expert.forEach((m) => {
				expect(m).toBeInstanceOf(Mastery);
			});
		});

		it('should preserve set state of mastery nodes', () => {
			const node = masteries.novice.find((m) => !m.set && m.settable && m.cost <= masteries.points);
			if (!node) {
				return;
			}
			masteries.setMastery(node);
			const restored = PlayerMasteries.fromInstance(masteries);
			const restoredNode = restored.novice.find((m) => m.q === node.q && m.r === node.r);
			expect(restoredNode?.set).toBe(true);
		});

		it('should produce an independent copy', () => {
			const restored = PlayerMasteries.fromInstance(masteries);
			restored.level = 99;
			expect(masteries.level).toBe(1);
		});

		it('should handle deserialized plain objects (prototype restoration)', () => {
			const plain = JSON.parse(JSON.stringify(masteries));
			const restored = PlayerMasteries.fromInstance(plain);
			expect(restored).toBeInstanceOf(PlayerMasteries);
			expect(restored.bonuses).toBeInstanceOf(MasteriesBonuses);
			expect(restored.novice[0]).toBeInstanceOf(Mastery);
			expect(restored.level).toBe(masteries.level);
		});
	});
});
