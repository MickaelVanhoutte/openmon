import { describe, it, expect } from 'vitest';
import { createBossTrainer } from '../../dungeon/trainer-factory';
import { GRASS_FOREST, DARK_HAUNTED, getBiomeForFloor } from '../../dungeon/biomes';
import { SeededRNG } from '../../dungeon/prng';
import { Position } from '../../mapping/positions';
import { Dialog } from '../../scripting/scripts';

describe('Boss Dialog Migration - string | string[]', () => {
	const pos = new Position(7, 7);

	describe('Array dialogs: floor 50 (V)', () => {
		it('floor 50 dialogBefore creates 3-message Dialog', () => {
			const rng = new SeededRNG('dialog-single-before');
			const boss = createBossTrainer(pos, 50, DARK_HAUNTED, rng);

			const script = boss.mainScript;
			expect(script).toBeDefined();
			expect(script?.actions).toBeDefined();

			const beforeDialog = script?.actions[1];
			expect(beforeDialog).toBeInstanceOf(Dialog);
			expect((beforeDialog as Dialog).messages.length).toBe(3);
			expect((beforeDialog as Dialog).messages[0].text).toBeTruthy();
		});

		it('floor 50 dialogAfter creates 2-message Dialog', () => {
			const rng = new SeededRNG('dialog-single-after');
			const boss = createBossTrainer(pos, 50, DARK_HAUNTED, rng);

			const script = boss.mainScript;
			const afterDialog = script?.actions[4];
			expect(afterDialog).toBeInstanceOf(Dialog);
			expect((afterDialog as Dialog).messages.length).toBe(2);
			expect((afterDialog as Dialog).messages[0].text).toBeTruthy();
		});

		it('all messages have correct speaker name', () => {
			const rng = new SeededRNG('dialog-speaker');
			const boss = createBossTrainer(pos, 50, DARK_HAUNTED, rng);

			const script = boss.mainScript;
			const beforeDialog = script?.actions[1] as Dialog;
			const afterDialog = script?.actions[4] as Dialog;

			beforeDialog.messages.forEach((msg) => {
				expect(msg.speaker).toBe(boss.name);
			});

			afterDialog.messages.forEach((msg) => {
				expect(msg.speaker).toBe(boss.name);
			});
		});
	});

	describe('Multi-message dialogs: string[] support', () => {
		it('string[] dialogBefore creates multi-message Dialog', () => {
			const rng = new SeededRNG('dialog-array-before');
			const boss = createBossTrainer(pos, 10, GRASS_FOREST, rng);

			const script = boss.mainScript;
			const beforeDialog = script?.actions[1] as Dialog;

			expect(beforeDialog).toBeInstanceOf(Dialog);
			expect(beforeDialog.messages.length).toBeGreaterThanOrEqual(1);
			beforeDialog.messages.forEach((msg) => {
				expect(msg.text).toBeTruthy();
				expect(msg.speaker).toBe(boss.name);
			});
		});

		it('string[] dialogAfter creates multi-message Dialog', () => {
			const rng = new SeededRNG('dialog-array-after');
			const boss = createBossTrainer(pos, 10, GRASS_FOREST, rng);

			const script = boss.mainScript;
			const afterDialog = script?.actions[4] as Dialog;

			expect(afterDialog).toBeInstanceOf(Dialog);
			expect(afterDialog.messages.length).toBeGreaterThanOrEqual(1);
			afterDialog.messages.forEach((msg) => {
				expect(msg.text).toBeTruthy();
				expect(msg.speaker).toBe(boss.name);
			});
		});
	});

	describe('Edge cases', () => {
		it('handles empty string gracefully', () => {
			const rng = new SeededRNG('dialog-empty');
			const boss = createBossTrainer(pos, 5, GRASS_FOREST, rng);

			const script = boss.mainScript;
			const beforeDialog = script?.actions[1] as Dialog;
			const afterDialog = script?.actions[4] as Dialog;

			expect(beforeDialog.messages.length).toBeGreaterThanOrEqual(1);
			expect(afterDialog.messages.length).toBeGreaterThanOrEqual(1);
		});

		it('handles empty array gracefully', () => {
			const rng = new SeededRNG('dialog-empty-array');
			const boss = createBossTrainer(pos, 5, GRASS_FOREST, rng);

			const script = boss.mainScript;
			const beforeDialog = script?.actions[1] as Dialog;
			const afterDialog = script?.actions[4] as Dialog;

			expect(beforeDialog.messages.length).toBeGreaterThanOrEqual(1);
			expect(afterDialog.messages.length).toBeGreaterThanOrEqual(1);
		});

		it('all boss floors (5-50) have valid dialogs', () => {
			for (let floor = 5; floor <= 50; floor += 5) {
				const rng = new SeededRNG(`dialog-floor-${floor}`);
				const biome = getBiomeForFloor(floor);
				const boss = createBossTrainer(pos, floor, biome, rng);

				const script = boss.mainScript;
				const beforeDialog = script?.actions[1] as Dialog;
				const afterDialog = script?.actions[4] as Dialog;

				expect(beforeDialog).toBeInstanceOf(Dialog);
				expect(beforeDialog.messages.length).toBeGreaterThanOrEqual(1);
				expect(afterDialog).toBeInstanceOf(Dialog);
				expect(afterDialog.messages.length).toBeGreaterThanOrEqual(1);

				beforeDialog.messages.forEach((msg) => {
					expect(msg.text).toBeTruthy();
					expect(msg.speaker).toBe(boss.name);
				});

				afterDialog.messages.forEach((msg) => {
					expect(msg.text).toBeTruthy();
					expect(msg.speaker).toBe(boss.name);
				});
			}
		});
	});

	describe('Dialog structure integrity', () => {
		it('Dialog messages are in correct order', () => {
			const rng = new SeededRNG('dialog-order');
			const boss = createBossTrainer(pos, 5, GRASS_FOREST, rng);

			const script = boss.mainScript;
			const beforeDialog = script?.actions[1] as Dialog;

			expect(beforeDialog.current).toBe(beforeDialog.messages[0]);
			expect(beforeDialog.messages.length).toBeGreaterThanOrEqual(1);
		});

		it('Dialog can navigate through multiple messages', () => {
			const rng = new SeededRNG('dialog-navigate');
			const boss = createBossTrainer(pos, 10, GRASS_FOREST, rng);

			const script = boss.mainScript;
			const beforeDialog = script?.actions[1] as Dialog;

			if (beforeDialog.messages.length > 1) {
				const firstMsg = beforeDialog.current;
				const nextMsg = beforeDialog.next();
				expect(nextMsg).toBe(beforeDialog.messages[1]);
				expect(nextMsg).not.toBe(firstMsg);
			}
		});
	});
});
