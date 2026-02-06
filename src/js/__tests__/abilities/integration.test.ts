import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../sprites/pmd-sprite-data', () => ({
	getSpriteAnchor: vi.fn(),
	inferPMDSpriteInfo: vi.fn(),
	getPMDSpriteInfoFromAnimData: vi.fn(),
	getPMDSpritePath: vi.fn(),
	PMD_DIRECTION_MAP: {},
	PMD_DIRECTION_COUNT: 8
}));

import { createTestPokemon, createTestBattleContext } from './test-helpers';
import { AbilityTrigger } from '../../battle/abilities/ability-types';
import { AbilityEngine } from '../../battle/abilities/ability-engine';
import * as registry from '../../battle/abilities/ability-registry';
import { Weather } from '../../battle/battle-field';
import { Move } from '../../pokemons/pokedex';

import { intimidate, drizzle } from '../../battle/abilities/tiers/tier2-on-switch';
import { moldBreaker } from '../../battle/abilities/tiers/tier5-suppression';
import { swiftSwim, hugePower, thickFat } from '../../battle/abilities/tiers/tier1-passive-stats';
import { levitate, roughSkin } from '../../battle/abilities/tiers/tier3-damage-contact';
import { speedBoost } from '../../battle/abilities/tiers/tier4-turn-status';

describe('Ability Integration Tests', () => {
	let engine: AbilityEngine;

	beforeEach(() => {
		engine = new AbilityEngine();
		vi.restoreAllMocks();
		global.fetch = vi.fn().mockImplementation(() =>
			Promise.resolve({
				json: () => Promise.resolve({})
			})
		);
	});

	describe('Intimidate Flow', () => {
		it('should lower opponent Attack on switch-in', () => {
			const intimidatePokemon = createTestPokemon({
				ability: 'Intimidate',
				name: 'Gyarados'
			});
			const opponent = createTestPokemon({
				ability: 'None',
				name: 'Arcanine'
			});
			const ctx = createTestBattleContext({
				allySide: [intimidatePokemon],
				oppSide: [opponent]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Intimidate') {
					return intimidate;
				}
				return undefined;
			});

			engine.runEvent(AbilityTrigger.ON_SWITCH_IN, intimidatePokemon, ctx);

			expect(opponent.changeBattleStats).toHaveBeenCalledWith('attack', -1);
		});
	});

	describe('Type Immunity', () => {
		it('should block Ground moves with Levitate', () => {
			const levitatePokemon = createTestPokemon({
				ability: 'Levitate',
				name: 'Gengar'
			});
			const attacker = createTestPokemon({
				ability: 'None',
				name: 'Dugtrio'
			});

			const groundMove = new Move(
				1,
				'Earthquake',
				'Ground',
				'physical',
				100,
				100,
				10,
				0,
				'selected-pokemon',
				{} as any,
				0,
				'',
				1
			);

			const ctx = createTestBattleContext({
				allySide: [levitatePokemon],
				oppSide: [attacker]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Levitate') {
					return levitate;
				}
				return undefined;
			});

			const canHit = engine.runEvent<boolean>(
				AbilityTrigger.ON_TRY_HIT,
				levitatePokemon,
				ctx,
				attacker,
				groundMove
			);

			expect(canHit).toBe(false);
		});
	});

	describe('Weather + Ability', () => {
		it('Drizzle sets rain which then affects Swift Swim', () => {
			const drizzlePokemon = createTestPokemon({
				ability: 'Drizzle',
				name: 'Politoed'
			});
			const swiftSwimPokemon = createTestPokemon({
				ability: 'Swift Swim',
				name: 'Kingdra',
				speed: 100
			});
			const ctx = createTestBattleContext({
				allySide: [drizzlePokemon, swiftSwimPokemon]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Drizzle') {
					return drizzle;
				}
				if (name === 'Swift Swim') {
					return swiftSwim;
				}
				return undefined;
			});

			engine.runEvent(AbilityTrigger.ON_SWITCH_IN, drizzlePokemon, ctx);
			expect(ctx.battleField.weather).toBe(Weather.RAIN);

			const modifiedSpeed = engine.runEvent<number>(
				AbilityTrigger.ON_MODIFY_SPE,
				swiftSwimPokemon,
				ctx,
				undefined,
				100
			);

			expect(modifiedSpeed).toBe(200);
		});
	});

	describe('Suppression', () => {
		it('Mold Breaker attacker should ignore Levitate defender', () => {
			const levitatePokemon = createTestPokemon({
				ability: 'Levitate',
				name: 'Gengar'
			});
			const attacker = createTestPokemon({
				ability: 'Mold Breaker',
				name: 'Excadrill'
			});
			const groundMove = new Move(
				1,
				'Earthquake',
				'Ground',
				'physical',
				100,
				100,
				10,
				0,
				'selected-pokemon',
				{} as any,
				0,
				'',
				1
			);

			const ctx = createTestBattleContext({
				allySide: [levitatePokemon],
				oppSide: [attacker]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Levitate') {
					return levitate;
				}
				if (name === 'Mold Breaker') {
					return moldBreaker;
				}
				return undefined;
			});

			const result = engine.runEvent<boolean>(
				AbilityTrigger.ON_TRY_HIT,
				levitatePokemon,
				ctx,
				attacker,
				groundMove
			);

			expect(result).toBeUndefined();
		});
	});

	describe('Contact Damage', () => {
		it('Attack with physical move vs Rough Skin should inflict recoil', () => {
			const roughSkinPokemon = createTestPokemon({
				ability: 'Rough Skin',
				name: 'Sharpedo',
				maxHp: 100,
				hp: 100
			});
			const attacker = createTestPokemon({
				ability: 'None',
				name: 'Machamp',
				maxHp: 100,
				hp: 100
			});
			const physicalMove = new Move(
				1,
				'Close Combat',
				'Fighting',
				'physical',
				120,
				100,
				5,
				0,
				'selected-pokemon',
				{} as any,
				0,
				'',
				1
			);

			const ctx = createTestBattleContext({
				allySide: [roughSkinPokemon],
				oppSide: [attacker]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Rough Skin') {
					return roughSkin;
				}
				return undefined;
			});

			engine.runEvent(AbilityTrigger.ON_CONTACT, roughSkinPokemon, ctx, attacker, physicalMove);

			expect(attacker.currentHp).toBeLessThan(100);
		});
	});

	describe('Turn End Triggers', () => {
		it('Speed Boost should raise speed at turn end', () => {
			const speedBoostPokemon = createTestPokemon({
				ability: 'Speed Boost',
				name: 'Yanmega',
				speed: 100
			});
			const ctx = createTestBattleContext({
				allySide: [speedBoostPokemon]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Speed Boost') {
					return speedBoost;
				}
				return undefined;
			});

			engine.runEvent(AbilityTrigger.ON_TURN_END, speedBoostPokemon, ctx);

			expect(speedBoostPokemon.changeBattleStats).toHaveBeenCalledWith('speed', 1);
		});
	});

	describe('Stat Modifier Triggers', () => {
		it('Huge Power should double Attack stat', () => {
			const hugePowerPokemon = createTestPokemon({
				ability: 'Huge Power',
				name: 'Azumarill',
				attack: 100
			});
			const opponent = createTestPokemon({
				ability: 'None',
				name: 'Magikarp'
			});

			const ctx = createTestBattleContext({
				allySide: [hugePowerPokemon],
				oppSide: [opponent]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Huge Power') {
					return hugePower;
				}
				return undefined;
			});

			const modifiedAtk = engine.runEvent<number>(
				AbilityTrigger.ON_MODIFY_ATK,
				hugePowerPokemon,
				ctx,
				opponent,
				100
			);

			expect(modifiedAtk).toBe(200);
		});

		it('Thick Fat should halve Fire damage', () => {
			const thickFatPokemon = createTestPokemon({
				ability: 'Thick Fat',
				name: 'Snorlax'
			});
			const attacker = createTestPokemon({
				ability: 'None',
				name: 'Charizard'
			});

			const ctx = createTestBattleContext({
				allySide: [thickFatPokemon],
				oppSide: [attacker]
			});

			vi.spyOn(registry, 'getAbility').mockImplementation((name) => {
				if (name === 'Thick Fat') {
					return thickFat;
				}
				return undefined;
			});

			const modifiedDamage = thickFat.onSourceModifyDamage!(
				{
					battleContext: ctx,
					pokemon: thickFatPokemon,
					target: attacker,
					move: { type: 'fire' } as any
				},
				100
			);

			expect(modifiedDamage).toBe(50);
		});
	});
});
