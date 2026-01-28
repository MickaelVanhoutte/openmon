import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField } from '../battle/battle-field';
import {
	TrickRoomEffect,
	sortActionsWithTrickRoom
} from '../pokemons/effects/complex-move-effects';

describe('Trick Room', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Trick Room Activation', () => {
		it('should set trick room to active', () => {
			battleField.setTrickRoom(true, 5);
			expect(battleField.trickRoom).toBe(true);
			expect(battleField.trickRoomTurns).toBe(5);
		});

		it('should toggle off if already active', () => {
			battleField.setTrickRoom(true, 5);
			battleField.setTrickRoom(true, 5);
			expect(battleField.trickRoom).toBe(false);
		});

		it('should expire after 5 turns', () => {
			battleField.setTrickRoom(true, 5);
			for (let i = 0; i < 5; i++) {
				expect(battleField.trickRoom).toBe(true);
				battleField.tickTurn();
			}
			expect(battleField.trickRoom).toBe(false);
		});
	});

	describe('Turn Order Sorting', () => {
		it('should sort faster Pokemon first without Trick Room', () => {
			const actions = [
				{ priority: 0, speed: 50 },
				{ priority: 0, speed: 100 },
				{ priority: 0, speed: 75 }
			];

			const sorted = sortActionsWithTrickRoom(actions, false);
			expect(sorted[0].speed).toBe(100);
			expect(sorted[1].speed).toBe(75);
			expect(sorted[2].speed).toBe(50);
		});

		it('should sort slower Pokemon first with Trick Room', () => {
			const actions = [
				{ priority: 0, speed: 50 },
				{ priority: 0, speed: 100 },
				{ priority: 0, speed: 75 }
			];

			const sorted = sortActionsWithTrickRoom(actions, true);
			expect(sorted[0].speed).toBe(50);
			expect(sorted[1].speed).toBe(75);
			expect(sorted[2].speed).toBe(100);
		});

		it('should still respect priority brackets', () => {
			const actions = [
				{ priority: 0, speed: 100 },
				{ priority: 1, speed: 50 },
				{ priority: -1, speed: 150 }
			];

			const sorted = sortActionsWithTrickRoom(actions, true);
			expect(sorted[0].priority).toBe(1);
			expect(sorted[1].priority).toBe(0);
			expect(sorted[2].priority).toBe(-1);
		});

		it('should reverse speed within same priority in Trick Room', () => {
			const actions = [
				{ priority: 1, speed: 100 },
				{ priority: 1, speed: 50 },
				{ priority: 0, speed: 75 }
			];

			const sorted = sortActionsWithTrickRoom(actions, true);
			expect(sorted[0].speed).toBe(50);
			expect(sorted[1].speed).toBe(100);
			expect(sorted[2].speed).toBe(75);
		});

		it('should handle Quick Attack (priority +1) going first even in Trick Room', () => {
			const actions = [
				{ priority: 0, speed: 30 },
				{ priority: 1, speed: 80 },
				{ priority: 0, speed: 120 }
			];

			const sorted = sortActionsWithTrickRoom(actions, true);
			expect(sorted[0].priority).toBe(1);
			expect(sorted[1].speed).toBe(30);
			expect(sorted[2].speed).toBe(120);
		});
	});

	describe('TrickRoomEffect', () => {
		it('should have correct move_effect_id', () => {
			const effect = new TrickRoomEffect();
			expect(effect.move_effect_id).toBe(218);
		});

		it('should activate trick room on battlefield', () => {
			const effect = new TrickRoomEffect();
			effect.activateTrickRoom(battleField);
			expect(battleField.trickRoom).toBe(true);
			expect(battleField.trickRoomTurns).toBe(5);
		});
	});
});
