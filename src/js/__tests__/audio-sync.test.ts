import { describe, it, expect } from 'vitest';
import {
	MOVE_SFX_MAP,
	BATTLE_SFX_MAP,
	getMoveSFXPath,
	getBattleSFXPath
} from '../battle/animations/audio-sync';

describe('audio-sync', () => {
	describe('MOVE_SFX_MAP', () => {
		it('should have entries', () => {
			expect(Object.keys(MOVE_SFX_MAP).length).toBeGreaterThan(0);
		});

		it('should contain thunderbolt', () => {
			expect(MOVE_SFX_MAP['thunderbolt']).toBeDefined();
		});

		it('should contain aerial-ace', () => {
			expect(MOVE_SFX_MAP['aerial-ace']).toBeDefined();
		});

		it('should contain double-edge with hyphen preserved', () => {
			expect(MOVE_SFX_MAP['double-edge']).toBeDefined();
		});
	});

	describe('BATTLE_SFX_MAP', () => {
		it('should have all 22 expected keys', () => {
			const expectedKeys = [
				'hit-normal',
				'hit-super-effective',
				'hit-not-very-effective',
				'faint',
				'stat-rise',
				'stat-fall',
				'status-burned',
				'status-confused',
				'status-frozen',
				'status-paralyzed',
				'status-poisoned',
				'status-sleep',
				'ability-activate',
				'eat-berry',
				'heal',
				'health-low',
				'held-item',
				'switch-alive',
				'switch-fainted',
				'switch-flee',
				'switch-forced',
				'switch-pokeball'
			];
			expectedKeys.forEach((key) => {
				expect(BATTLE_SFX_MAP[key]).toBeDefined();
			});
		});

		it('should have faint key', () => {
			expect(BATTLE_SFX_MAP['faint']).toBeDefined();
		});

		it('should have stat-rise key', () => {
			expect(BATTLE_SFX_MAP['stat-rise']).toBeDefined();
		});
	});

	describe('getMoveSFXPath', () => {
		it('should return correct path for thunderbolt', () => {
			const path = getMoveSFXPath('thunderbolt');
			expect(path).toBeDefined();
			expect(path).toContain('src/assets/audio/move-effects/');
			expect(path).toContain('.mp3');
		});

		it('should return undefined for nonexistent move', () => {
			const path = getMoveSFXPath('nonexistent-move');
			expect(path).toBeUndefined();
		});

		it('should handle hyphenated names correctly', () => {
			const path = getMoveSFXPath('double-edge');
			expect(path).toBeDefined();
			expect(path).toContain('src/assets/audio/move-effects/');
		});

		it('should handle aerial-ace', () => {
			const path = getMoveSFXPath('aerial-ace');
			expect(path).toBeDefined();
			expect(path).toContain('Aerial Ace');
		});
	});

	describe('getBattleSFXPath', () => {
		it('should return correct path for faint', () => {
			const path = getBattleSFXPath('faint');
			expect(path).toBeDefined();
			expect(path).toContain('src/assets/audio/move-effects/');
			expect(path).toContain('In-Battle Faint No Health');
		});

		it('should return correct path for stat-rise', () => {
			const path = getBattleSFXPath('stat-rise');
			expect(path).toBeDefined();
			expect(path).toContain('Stat Rise Up');
		});

		it('should return undefined for unknown key', () => {
			const path = getBattleSFXPath('unknown-key');
			expect(path).toBeUndefined();
		});

		it('should return correct path for hit-normal', () => {
			const path = getBattleSFXPath('hit-normal');
			expect(path).toBeDefined();
			expect(path).toContain('Hit Normal Damage');
		});
	});
});
