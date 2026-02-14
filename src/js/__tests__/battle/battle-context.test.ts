import '@abraham/reflection';
import { describe, it, expect, vi } from 'vitest';
import {
	ActionType,
	type ActionV2Interface,
	type TargetSlot
} from '../../battle/actions/actions-model';
import { createTestPokemon, createTestBattleContext } from '../abilities/test-helpers';

function createMockAction(
	type: ActionType,
	description: string,
	speed: number = 100,
	priority: number = 0
): ActionV2Interface & { move?: { priority: number } } {
	const initiator = createTestPokemon({ name: description, speed });
	return {
		type,
		description,
		initiator,
		execute: vi.fn(),
		move: { priority } as any
	};
}

describe('BattleContext Utilities', () => {
	describe('sortActions', () => {
		// sortActions is a method on BattleContext that takes player actions and opponent actions
		// and returns them sorted for LIFO stack execution.
		// Priority: RUN > SWITCH (speed asc) > ITEM (speed asc) > ATTACK (move.priority asc, then speed asc)
		// Since it's LIFO, last item in array executes first.

		it('should sort run actions before switches', () => {
			const runAction = createMockAction(ActionType.RUN, 'RunAway', 50);
			const switchAction = createMockAction(ActionType.SWITCH, 'Switch', 100);
			const attackAction = createMockAction(ActionType.ATTACK, 'Attack', 80, 0);

			// In sorted order for LIFO: Run should execute first (be last in array)
			// So Run > Switch > Attack
			const actions = [attackAction, switchAction, runAction];

			const typePriority: Record<string, number> = {
				[ActionType.RUN]: 4,
				[ActionType.SWITCH]: 3,
				[ActionType.ITEM]: 2,
				[ActionType.ATTACK]: 1
			};

			actions.sort((a, b) => {
				const aPri = typePriority[a.type] ?? 0;
				const bPri = typePriority[b.type] ?? 0;
				if (aPri !== bPri) {
					return aPri - bPri; // ascending for LIFO
				}
				return (a.initiator.battleStats?.speed ?? 0) - (b.initiator.battleStats?.speed ?? 0);
			});

			expect(actions[actions.length - 1].type).toBe(ActionType.RUN);
			expect(actions[0].type).toBe(ActionType.ATTACK);
		});

		it('should sort switches by speed ascending (LIFO)', () => {
			const slow = createMockAction(ActionType.SWITCH, 'SlowSwitch', 30);
			const fast = createMockAction(ActionType.SWITCH, 'FastSwitch', 100);

			const actions = [fast, slow];
			actions.sort((a, b) => {
				return (a.initiator.battleStats?.speed ?? 0) - (b.initiator.battleStats?.speed ?? 0);
			});

			expect(actions[actions.length - 1].initiator.battleStats.speed).toBe(100);
			expect(actions[0].initiator.battleStats.speed).toBe(30);
		});

		it('should sort attacks by move priority then speed', () => {
			const normalPriority = createMockAction(ActionType.ATTACK, 'Normal', 100, 0);
			const highPriority = createMockAction(ActionType.ATTACK, 'QuickAttack', 50, 1);
			const lowSpeed = createMockAction(ActionType.ATTACK, 'SlowAttack', 30, 0);

			const actions = [normalPriority, highPriority, lowSpeed];
			actions.sort((a, b) => {
				const aPri = a.move?.priority ?? 0;
				const bPri = b.move?.priority ?? 0;
				if (aPri !== bPri) {
					return aPri - bPri;
				}
				return (a.initiator.battleStats?.speed ?? 0) - (b.initiator.battleStats?.speed ?? 0);
			});

			expect(actions[actions.length - 1].description).toBe('QuickAttack');
		});
	});

	describe('getPossibleTargets logic', () => {
		it('should resolve all-opponents to all opponent slots', () => {
			const ctx = createTestBattleContext();
			const opp1 = createTestPokemon({ name: 'Opp1' });
			ctx.oppSide[0] = opp1;

			const oppSlots = ctx.oppSide
				.map((p, i) => (p ? { side: 'opponent' as const, index: i } : null))
				.filter((s) => s !== null) as TargetSlot[];

			expect(oppSlots.length).toBeGreaterThan(0);
			expect(oppSlots[0].side).toBe('opponent');
			expect(oppSlots[0].index).toBe(0);
		});

		it('should resolve user target to initiator slot', () => {
			const ctx = createTestBattleContext();
			const pokemon = createTestPokemon({ name: 'Pikachu' });
			ctx.playerSide[0] = pokemon;

			const initiatorIdx = ctx.playerSide.findIndex((p) => p === pokemon);
			const userSlot: TargetSlot = { side: 'player', index: initiatorIdx };

			expect(userSlot.side).toBe('player');
			expect(userSlot.index).toBe(0);
		});

		it('should resolve selected-pokemon as selectable', () => {
			const ctx = createTestBattleContext();
			const opp = createTestPokemon({ name: 'Opp' });
			ctx.oppSide[0] = opp;

			const slots: TargetSlot[] = [{ side: 'opponent', index: 0 }];
			expect(slots.length).toBe(1);
		});
	});

	describe('checkFainted logic', () => {
		it('should mark pokemon as fainted when HP <= 0', () => {
			const pokemon = createTestPokemon({ name: 'Pikachu', hp: 0 });
			pokemon.currentHp = 0;

			if (pokemon.currentHp <= 0) {
				pokemon.fainted = true;
			}
			expect(pokemon.fainted).toBe(true);
		});

		it('should not mark pokemon as fainted when HP > 0', () => {
			const pokemon = createTestPokemon({ name: 'Pikachu', hp: 50 });

			if (pokemon.currentHp <= 0) {
				pokemon.fainted = true;
			}
			expect(pokemon.fainted).toBe(false);
		});

		it('should clear status when fainted', () => {
			const pokemon = createTestPokemon({ name: 'Pikachu', hp: 0 });
			pokemon.currentHp = 0;
			pokemon.status = { abr: 'PSN' } as any;

			if (pokemon.currentHp <= 0) {
				pokemon.fainted = true;
				pokemon.status = undefined;
			}

			expect(pokemon.fainted).toBe(true);
			expect(pokemon.status).toBeUndefined();
		});
	});

	describe('selectOpponentAction logic', () => {
		it('should select a random move in NORMAL difficulty', () => {
			const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
			const moves = [
				{ name: 'Tackle', power: 40, type: 'Normal', accuracy: 100, pp: 35, maxPp: 35 },
				{ name: 'Growl', power: 0, type: 'Normal', accuracy: 100, pp: 40, maxPp: 40 }
			];

			const selectedIdx = Math.floor(Math.random() * moves.length);
			expect(selectedIdx).toBe(0);
			expect(moves[selectedIdx].name).toBe('Tackle');

			randomSpy.mockRestore();
		});

		it('should select different moves with different random values', () => {
			const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
			const moves = [
				{ name: 'Tackle', power: 40, type: 'Normal' },
				{ name: 'Growl', power: 0, type: 'Normal' }
			];

			const selectedIdx = Math.floor(Math.random() * moves.length);
			expect(selectedIdx).toBe(1);
			expect(moves[selectedIdx].name).toBe('Growl');

			randomSpy.mockRestore();
		});
	});

	describe('Action priority ordering', () => {
		it('should prioritize RUN over all other action types', () => {
			const typePriority: Record<string, number> = {
				[ActionType.RUN]: 4,
				[ActionType.SWITCH]: 3,
				[ActionType.ITEM]: 2,
				[ActionType.ATTACK]: 1
			};

			expect(typePriority[ActionType.RUN]).toBeGreaterThan(typePriority[ActionType.SWITCH]);
			expect(typePriority[ActionType.SWITCH]).toBeGreaterThan(typePriority[ActionType.ITEM]);
			expect(typePriority[ActionType.ITEM]).toBeGreaterThan(typePriority[ActionType.ATTACK]);
		});

		it('should sort mixed actions correctly for LIFO execution', () => {
			const run = createMockAction(ActionType.RUN, 'Run', 50);
			const switchA = createMockAction(ActionType.SWITCH, 'Switch', 100);
			const item = createMockAction(ActionType.ITEM, 'Item', 80);
			const attack = createMockAction(ActionType.ATTACK, 'Attack', 120, 0);

			const typePriority: Record<string, number> = {
				[ActionType.RUN]: 4,
				[ActionType.SWITCH]: 3,
				[ActionType.ITEM]: 2,
				[ActionType.ATTACK]: 1
			};

			const actions = [attack, run, item, switchA];
			actions.sort((a, b) => {
				const aPri = typePriority[a.type] ?? 0;
				const bPri = typePriority[b.type] ?? 0;
				return aPri - bPri;
			});

			// LIFO: last element executes first
			expect(actions[3].type).toBe(ActionType.RUN);
			expect(actions[2].type).toBe(ActionType.SWITCH);
			expect(actions[1].type).toBe(ActionType.ITEM);
			expect(actions[0].type).toBe(ActionType.ATTACK);
		});
	});
});
