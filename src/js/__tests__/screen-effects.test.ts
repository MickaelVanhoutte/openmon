import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Screen } from '../battle/battle-field';
import {
	ReflectEffect,
	LightScreenEffect,
	getScreenDamageMultiplier
} from '../pokemons/effects/screen-effects';

describe('Screen Effects', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Screen Setting', () => {
		it('should set Reflect for 5 turns on ally side', () => {
			const effect = new ReflectEffect();
			effect.applyScreen(battleField, 'ally');
			expect(battleField.hasScreen('ally', Screen.REFLECT)).toBe(true);
			expect(battleField.getScreenTurns('ally', Screen.REFLECT)).toBe(5);
		});

		it('should set Light Screen for 5 turns on ally side', () => {
			const effect = new LightScreenEffect();
			effect.applyScreen(battleField, 'ally');
			expect(battleField.hasScreen('ally', Screen.LIGHT_SCREEN)).toBe(true);
			expect(battleField.getScreenTurns('ally', Screen.LIGHT_SCREEN)).toBe(5);
		});

		it('should set screen on enemy side', () => {
			const effect = new ReflectEffect();
			effect.applyScreen(battleField, 'enemy');
			expect(battleField.hasScreen('enemy', Screen.REFLECT)).toBe(true);
			expect(battleField.hasScreen('ally', Screen.REFLECT)).toBe(false);
		});

		it('should allow custom turn duration', () => {
			const effect = new ReflectEffect();
			effect.applyScreen(battleField, 'ally', 8);
			expect(battleField.getScreenTurns('ally', Screen.REFLECT)).toBe(8);
		});
	});

	describe('Screen Damage Reduction', () => {
		it('should reduce physical damage by 0.5x when Reflect is active', () => {
			battleField.addScreen('ally', Screen.REFLECT);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'physical');
			expect(multiplier).toBe(0.5);
		});

		it('should reduce special damage by 0.5x when Light Screen is active', () => {
			battleField.addScreen('ally', Screen.LIGHT_SCREEN);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'special');
			expect(multiplier).toBe(0.5);
		});

		it('should not reduce physical damage when only Light Screen is active', () => {
			battleField.addScreen('ally', Screen.LIGHT_SCREEN);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'physical');
			expect(multiplier).toBe(1);
		});

		it('should not reduce special damage when only Reflect is active', () => {
			battleField.addScreen('ally', Screen.REFLECT);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'special');
			expect(multiplier).toBe(1);
		});

		it('should not affect status moves', () => {
			battleField.addScreen('ally', Screen.REFLECT);
			battleField.addScreen('ally', Screen.LIGHT_SCREEN);
			const multiplier = getScreenDamageMultiplier(battleField, 'ally', 'status');
			expect(multiplier).toBe(1);
		});

		it('should return 1x when no screens are active', () => {
			expect(getScreenDamageMultiplier(battleField, 'ally', 'physical')).toBe(1);
			expect(getScreenDamageMultiplier(battleField, 'ally', 'special')).toBe(1);
		});

		it('should check correct side for screens', () => {
			battleField.addScreen('enemy', Screen.REFLECT);
			expect(getScreenDamageMultiplier(battleField, 'ally', 'physical')).toBe(1);
			expect(getScreenDamageMultiplier(battleField, 'enemy', 'physical')).toBe(0.5);
		});
	});
});
