import { describe, it, expect } from 'vitest';
import {
	FlagEntry,
	Flags,
	Objective,
	ObjectiveState,
	Quest,
	QuestState,
	QUESTS
} from '../../scripting/quests';

describe('Quests Module', () => {
	describe('FlagEntry enum', () => {
		it('should have RUNNING_SHOES_UNLOCKED value', () => {
			expect(FlagEntry.RUNNING_SHOES_UNLOCKED).toBeDefined();
		});

		it('should have COMBO_MOVES_UNLOCKED value', () => {
			expect(FlagEntry.COMBO_MOVES_UNLOCKED).toBeDefined();
		});

		it('should be usable as a Map key', () => {
			const map = new Map<FlagEntry, boolean>();
			map.set(FlagEntry.RUNNING_SHOES_UNLOCKED, true);
			map.set(FlagEntry.COMBO_MOVES_UNLOCKED, false);

			expect(map.get(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(true);
			expect(map.get(FlagEntry.COMBO_MOVES_UNLOCKED)).toBe(false);
		});
	});

	describe('Flags', () => {
		it('should create with all flags set to false when no argument given', () => {
			const flags = new Flags();

			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(false);
			expect(flags.getFlag(FlagEntry.COMBO_MOVES_UNLOCKED)).toBe(false);
		});

		it('should create with a provided Map and restore prototype', () => {
			const existingMap = new Map<FlagEntry, boolean>();
			existingMap.set(FlagEntry.RUNNING_SHOES_UNLOCKED, true);

			const flags = new Flags(existingMap);

			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(true);
			expect(flags.flags instanceof Map).toBe(true);
		});

		it('should restore Map prototype on deserialized plain objects passed as flags', () => {
			const rawMap = new Map<FlagEntry, boolean>();
			rawMap.set(FlagEntry.COMBO_MOVES_UNLOCKED, true);
			Object.setPrototypeOf(rawMap, Object.prototype);

			const flags = new Flags(rawMap as Map<FlagEntry, boolean>);

			expect(flags.flags instanceof Map).toBe(true);
		});

		it('should set a flag with setFlag', () => {
			const flags = new Flags();

			flags.setFlag(FlagEntry.RUNNING_SHOES_UNLOCKED, true);

			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(true);
		});

		it('should return false for unset flags via getFlag', () => {
			const flags = new Flags();

			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(false);
		});

		it('should set multiple flags independently', () => {
			const flags = new Flags();

			flags.setFlag(FlagEntry.RUNNING_SHOES_UNLOCKED, true);
			flags.setFlag(FlagEntry.COMBO_MOVES_UNLOCKED, false);

			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(true);
			expect(flags.getFlag(FlagEntry.COMBO_MOVES_UNLOCKED)).toBe(false);
		});

		it('should allow toggling a flag back to false', () => {
			const flags = new Flags();

			flags.setFlag(FlagEntry.RUNNING_SHOES_UNLOCKED, true);
			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(true);

			flags.setFlag(FlagEntry.RUNNING_SHOES_UNLOCKED, false);
			expect(flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)).toBe(false);
		});
	});

	describe('ObjectiveState', () => {
		it('should store id and completed status', () => {
			const state = new ObjectiveState(1, true);

			expect(state.id).toBe(1);
			expect(state.completed).toBe(true);
		});

		it('should store not-completed status', () => {
			const state = new ObjectiveState(0, false);

			expect(state.id).toBe(0);
			expect(state.completed).toBe(false);
		});
	});

	describe('Objective', () => {
		it('should create with id, description, and default completed to false', () => {
			const objective = new Objective(0, 'Find your Pokemon');

			expect(objective.id).toBe(0);
			expect(objective.description).toBe('Find your Pokemon');
			expect(objective.completed).toBe(false);
		});

		it('should accept explicit completed value', () => {
			const objective = new Objective(1, 'Already done', true);

			expect(objective.id).toBe(1);
			expect(objective.description).toBe('Already done');
			expect(objective.completed).toBe(true);
		});

		it('should set completed to true when complete() is called', () => {
			const objective = new Objective(0, 'Find your Pokemon');

			expect(objective.completed).toBe(false);
			objective.complete();
			expect(objective.completed).toBe(true);
		});

		it('should remain completed after calling complete() multiple times', () => {
			const objective = new Objective(0, 'Find your Pokemon');

			objective.complete();
			objective.complete();

			expect(objective.completed).toBe(true);
		});
	});

	describe('Quest', () => {
		it('should create with all required properties', () => {
			const objectives = [new Objective(0, 'Do something'), new Objective(1, 'Do another thing')];
			const quest = new Quest(0, 'Test Quest', 'A test quest', objectives);

			expect(quest.id).toBe(0);
			expect(quest.name).toBe('Test Quest');
			expect(quest.description).toBe('A test quest');
			expect(quest.objectives).toHaveLength(2);
			expect(quest.completed).toBe(false);
			expect(quest.leaveMessage).toBe("I shouldn't leave");
			expect(quest.area).toBeUndefined();
		});

		it('should accept optional area parameter', () => {
			const area = { start: { x: 10, y: 20 }, end: { x: 30, y: 40 } };
			const quest = new Quest(0, 'Area Quest', 'Has area', [], area);

			expect(quest.area).toEqual(area);
		});

		it('should accept custom leaveMessage', () => {
			const quest = new Quest(0, 'Custom', 'Desc', [], undefined, 'Stay here!');

			expect(quest.leaveMessage).toBe('Stay here!');
		});

		it('should accept explicit completed value', () => {
			const quest = new Quest(0, 'Done', 'Desc', [], undefined, 'msg', true);

			expect(quest.completed).toBe(true);
		});

		describe('toState()', () => {
			it('should return a QuestState with matching id and completed', () => {
				const objectives = [new Objective(0, 'Obj 1'), new Objective(1, 'Obj 2')];
				const quest = new Quest(0, 'Test', 'Desc', objectives);

				const state = quest.toState();

				expect(state).toBeInstanceOf(QuestState);
				expect(state.id).toBe(0);
				expect(state.completed).toBe(false);
			});

			it('should map objectives to ObjectiveState instances', () => {
				const objectives = [new Objective(0, 'Obj 1'), new Objective(1, 'Obj 2')];
				objectives[0].complete();
				const quest = new Quest(0, 'Test', 'Desc', objectives);

				const state = quest.toState();

				expect(state.objectives).toHaveLength(2);
				expect(state.objectives[0]).toBeInstanceOf(ObjectiveState);
				expect(state.objectives[0].id).toBe(0);
				expect(state.objectives[0].completed).toBe(true);
				expect(state.objectives[1].id).toBe(1);
				expect(state.objectives[1].completed).toBe(false);
			});

			it('should reflect completed quest in state', () => {
				const quest = new Quest(0, 'Done', 'Desc', [], undefined, 'msg', true);

				const state = quest.toState();

				expect(state.completed).toBe(true);
				expect(state.objectives).toHaveLength(0);
			});
		});
	});

	describe('QuestState', () => {
		it('should store id, completed, and objectives', () => {
			const objectives = [new ObjectiveState(0, true), new ObjectiveState(1, false)];
			const state = new QuestState(1, false, objectives);

			expect(state.id).toBe(1);
			expect(state.completed).toBe(false);
			expect(state.objectives).toHaveLength(2);
			expect(state.objectives[0].id).toBe(0);
			expect(state.objectives[0].completed).toBe(true);
			expect(state.objectives[1].id).toBe(1);
			expect(state.objectives[1].completed).toBe(false);
		});

		it('should store empty objectives array', () => {
			const state = new QuestState(0, true, []);

			expect(state.id).toBe(0);
			expect(state.completed).toBe(true);
			expect(state.objectives).toHaveLength(0);
		});
	});

	describe('QUESTS constant', () => {
		it('should be an empty array', () => {
			expect(QUESTS).toEqual([]);
			expect(QUESTS.length).toBe(0);
		});
	});
});
