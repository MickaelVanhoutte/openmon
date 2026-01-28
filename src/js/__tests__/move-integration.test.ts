import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Weather, Screen, Hazard, Terrain } from '../battle/battle-field';
import { VolatileTracker, VolatileStatus } from '../pokemons/volatile-status';

import {
	getWeatherDamageMultiplier,
	applyWeatherDamage
} from '../pokemons/effects/weather-effects';
import { getScreenDamageMultiplier } from '../pokemons/effects/screen-effects';
import {
	getTerrainDamageMultiplier,
	blocksPriorityOnTerrain
} from '../pokemons/effects/terrain-effects';
import {
	calculateStealthRockDamage,
	calculateSpikesDamage,
	applyToxicSpikes,
	isGroundedForHazards
} from '../pokemons/effects/hazard-effects';
import { sortActionsWithTrickRoom } from '../pokemons/effects/complex-move-effects';

describe('Move Integration Tests', () => {
	let battleField: BattleField;

	beforeEach(() => {
		battleField = new BattleField();
	});

	describe('Weather Move Effects', () => {
		it('Rain Dance should boost Water moves and reduce Fire moves', () => {
			battleField.setWeather(Weather.RAIN, 5);
			expect(getWeatherDamageMultiplier(battleField, 'water')).toBe(1.5);
			expect(getWeatherDamageMultiplier(battleField, 'fire')).toBe(0.5);
		});

		it('Sunny Day should boost Fire moves and reduce Water moves', () => {
			battleField.setWeather(Weather.SUN, 5);
			expect(getWeatherDamageMultiplier(battleField, 'fire')).toBe(1.5);
			expect(getWeatherDamageMultiplier(battleField, 'water')).toBe(0.5);
		});

		it('Sandstorm should deal damage to non-Rock/Ground/Steel types', () => {
			battleField.setWeather(Weather.SAND, 5);
			const rockDamage = applyWeatherDamage(battleField, 200, ['rock']);
			const normalDamage = applyWeatherDamage(battleField, 200, ['normal']);
			expect(rockDamage).toBe(0);
			expect(normalDamage).toBe(12);
		});

		it('Hail should deal damage to non-Ice types', () => {
			battleField.setWeather(Weather.HAIL, 5);
			const iceDamage = applyWeatherDamage(battleField, 200, ['ice']);
			const normalDamage = applyWeatherDamage(battleField, 200, ['normal']);
			expect(iceDamage).toBe(0);
			expect(normalDamage).toBe(12);
		});
	});

	describe('Screen Move Effects', () => {
		it('Reflect should halve physical damage', () => {
			battleField.addScreen('ally', Screen.REFLECT, 5);
			expect(getScreenDamageMultiplier(battleField, 'ally', 'physical')).toBe(0.5);
			expect(getScreenDamageMultiplier(battleField, 'ally', 'special')).toBe(1);
		});

		it('Light Screen should halve special damage', () => {
			battleField.addScreen('ally', Screen.LIGHT_SCREEN, 5);
			expect(getScreenDamageMultiplier(battleField, 'ally', 'special')).toBe(0.5);
			expect(getScreenDamageMultiplier(battleField, 'ally', 'physical')).toBe(1);
		});
	});

	describe('Entry Hazard Move Effects', () => {
		it('Stealth Rock should deal type-based damage', () => {
			expect(calculateStealthRockDamage(200, ['fire'])).toBe(50);
			expect(calculateStealthRockDamage(200, ['fire', 'flying'])).toBe(100);
			expect(calculateStealthRockDamage(200, ['steel'])).toBe(12);
		});

		it('Spikes should deal layer-based damage', () => {
			expect(calculateSpikesDamage(200, 1)).toBe(25);
			expect(calculateSpikesDamage(200, 2)).toBe(33);
			expect(calculateSpikesDamage(200, 3)).toBe(50);
		});

		it('Toxic Spikes should apply poison or bad poison', () => {
			expect(applyToxicSpikes(1)).toBe('poison');
			expect(applyToxicSpikes(2)).toBe('toxic');
		});

		it('Flying types should be immune to ground hazards', () => {
			expect(isGroundedForHazards(['flying'])).toBe(false);
			expect(isGroundedForHazards(['normal'])).toBe(true);
		});
	});

	describe('Terrain Move Effects', () => {
		it('Electric Terrain should boost Electric moves', () => {
			expect(getTerrainDamageMultiplier(Terrain.ELECTRIC, 'electric', true)).toBeCloseTo(1.3);
		});

		it('Grassy Terrain should boost Grass and weaken ground moves', () => {
			expect(getTerrainDamageMultiplier(Terrain.GRASSY, 'grass', true)).toBeCloseTo(1.3);
			expect(getTerrainDamageMultiplier(Terrain.GRASSY, 'ground', true, 'earthquake')).toBe(0.5);
		});

		it('Psychic Terrain should boost Psychic and block priority', () => {
			expect(getTerrainDamageMultiplier(Terrain.PSYCHIC, 'psychic', true)).toBeCloseTo(1.3);
			expect(blocksPriorityOnTerrain(Terrain.PSYCHIC, true)).toBe(true);
		});

		it('Misty Terrain should weaken Dragon moves', () => {
			expect(getTerrainDamageMultiplier(Terrain.MISTY, 'dragon', true)).toBe(0.5);
		});
	});

	describe('Trick Room Effect', () => {
		it('should reverse speed order within priority brackets', () => {
			const actions = [
				{ priority: 0, speed: 50 },
				{ priority: 0, speed: 100 },
				{ priority: 0, speed: 75 }
			];

			const normalOrder = sortActionsWithTrickRoom(actions, false);
			expect(normalOrder[0].speed).toBe(100);

			const trickRoomOrder = sortActionsWithTrickRoom(actions, true);
			expect(trickRoomOrder[0].speed).toBe(50);
		});

		it('should still respect priority even in Trick Room', () => {
			const actions = [
				{ priority: 0, speed: 100 },
				{ priority: 1, speed: 50 }
			];

			const sorted = sortActionsWithTrickRoom(actions, true);
			expect(sorted[0].priority).toBe(1);
		});
	});

	describe('Volatile Status Effects', () => {
		let tracker: VolatileTracker;

		beforeEach(() => {
			tracker = new VolatileTracker();
		});

		it('should track confusion', () => {
			tracker.add(VolatileStatus.CONFUSED);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(true);
			tracker.remove(VolatileStatus.CONFUSED);
			expect(tracker.has(VolatileStatus.CONFUSED)).toBe(false);
		});

		it('should track bound status', () => {
			tracker.add(VolatileStatus.BOUND);
			expect(tracker.has(VolatileStatus.BOUND)).toBe(true);
		});

		it('should track seeded status', () => {
			tracker.add(VolatileStatus.SEEDED);
			expect(tracker.has(VolatileStatus.SEEDED)).toBe(true);
		});
	});

	describe('Combined Field Effects', () => {
		it('should handle Rain + Reflect for Water physical move', () => {
			battleField.setWeather(Weather.RAIN, 5);
			battleField.addScreen('enemy', Screen.REFLECT, 5);

			const weatherMod = getWeatherDamageMultiplier(battleField, 'water');
			const screenMod = getScreenDamageMultiplier(battleField, 'enemy', 'physical');

			expect(weatherMod * screenMod).toBe(0.75);
		});

		it('should handle all hazards on same side', () => {
			battleField.addHazard('ally', Hazard.STEALTH_ROCK);
			battleField.addHazard('ally', Hazard.SPIKES);
			battleField.addHazard('ally', Hazard.SPIKES);
			battleField.addHazard('ally', Hazard.SPIKES);
			battleField.addHazard('ally', Hazard.TOXIC_SPIKES);
			battleField.addHazard('ally', Hazard.TOXIC_SPIKES);

			expect(battleField.getHazardLayers('ally', Hazard.STEALTH_ROCK)).toBe(1);
			expect(battleField.getHazardLayers('ally', Hazard.SPIKES)).toBe(3);
			expect(battleField.getHazardLayers('ally', Hazard.TOXIC_SPIKES)).toBe(2);
		});

		it('should handle Trick Room with terrain', () => {
			battleField.setTrickRoom(true, 5);
			battleField.setTerrain(Terrain.ELECTRIC, 5);

			expect(battleField.trickRoom).toBe(true);
			expect(battleField.terrain).toBe(Terrain.ELECTRIC);
		});
	});

	describe('Field Duration Mechanics', () => {
		it('should expire weather after turns', () => {
			battleField.setWeather(Weather.RAIN, 3);
			battleField.tickTurn();
			battleField.tickTurn();
			expect(battleField.weather).toBe(Weather.RAIN);
			battleField.tickTurn();
			expect(battleField.weather).toBe(Weather.NONE);
		});

		it('should expire screens after turns', () => {
			battleField.addScreen('ally', Screen.REFLECT, 2);
			battleField.tickTurn();
			expect(battleField.hasScreen('ally', Screen.REFLECT)).toBe(true);
			battleField.tickTurn();
			expect(battleField.hasScreen('ally', Screen.REFLECT)).toBe(false);
		});

		it('should expire Trick Room after turns', () => {
			battleField.setTrickRoom(true, 2);
			battleField.tickTurn();
			expect(battleField.trickRoom).toBe(true);
			battleField.tickTurn();
			expect(battleField.trickRoom).toBe(false);
		});
	});
});
