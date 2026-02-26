import { describe, it, expect } from 'vitest';
import {
	BattleField,
	Weather,
	Terrain,
	Screen,
	Hazard
} from '../../battle/battle-field';

describe('BattleField', () => {
	describe('initial state', () => {
		it('starts with no weather, terrain, or trick room', () => {
			const field = new BattleField();
			expect(field.weather).toBe(Weather.NONE);
			expect(field.terrain).toBe(Terrain.NONE);
			expect(field.trickRoom).toBe(false);
			expect(field.weatherTurns).toBe(0);
			expect(field.terrainTurns).toBe(0);
			expect(field.trickRoomTurns).toBe(0);
		});
	});

	describe('setWeather', () => {
		it('sets weather with default 5 turns', () => {
			const field = new BattleField();
			field.setWeather(Weather.RAIN);
			expect(field.weather).toBe(Weather.RAIN);
			expect(field.weatherTurns).toBe(5);
		});

		it('sets weather with custom turns', () => {
			const field = new BattleField();
			field.setWeather(Weather.SUN, 8);
			expect(field.weather).toBe(Weather.SUN);
			expect(field.weatherTurns).toBe(8);
		});

		it('clears weather when set to NONE', () => {
			const field = new BattleField();
			field.setWeather(Weather.RAIN);
			field.setWeather(Weather.NONE);
			expect(field.weather).toBe(Weather.NONE);
			expect(field.weatherTurns).toBe(0);
		});

		it('strong winds cannot be overwritten by normal weather', () => {
			const field = new BattleField();
			field.setWeather(Weather.STRONG_WINDS);
			field.setWeather(Weather.RAIN);
			expect(field.weather).toBe(Weather.STRONG_WINDS);
		});

		it('strong winds can be cleared by NONE', () => {
			const field = new BattleField();
			field.setWeather(Weather.STRONG_WINDS);
			field.setWeather(Weather.NONE);
			expect(field.weather).toBe(Weather.NONE);
		});

		it('strong winds can be overwritten by strong winds', () => {
			const field = new BattleField();
			field.setWeather(Weather.STRONG_WINDS, 3);
			field.setWeather(Weather.STRONG_WINDS, 5);
			expect(field.weather).toBe(Weather.STRONG_WINDS);
			expect(field.weatherTurns).toBe(5);
		});

		it('increments weatherVersion on each set', () => {
			const field = new BattleField();
			const initial = field.weatherVersion;
			field.setWeather(Weather.SUN);
			expect(field.weatherVersion).toBe(initial + 1);
		});
	});

	describe('setTerrain', () => {
		it('sets terrain with default turns', () => {
			const field = new BattleField();
			field.setTerrain(Terrain.ELECTRIC);
			expect(field.terrain).toBe(Terrain.ELECTRIC);
			expect(field.terrainTurns).toBe(5);
		});

		it('clears terrain when set to NONE', () => {
			const field = new BattleField();
			field.setTerrain(Terrain.GRASSY);
			field.setTerrain(Terrain.NONE);
			expect(field.terrain).toBe(Terrain.NONE);
			expect(field.terrainTurns).toBe(0);
		});
	});

	describe('setTrickRoom', () => {
		it('activates trick room', () => {
			const field = new BattleField();
			field.setTrickRoom(true);
			expect(field.trickRoom).toBe(true);
			expect(field.trickRoomTurns).toBe(5);
		});

		it('toggles off when already active', () => {
			const field = new BattleField();
			field.setTrickRoom(true);
			field.setTrickRoom(true);
			expect(field.trickRoom).toBe(false);
			expect(field.trickRoomTurns).toBe(0);
		});

		it('deactivates with false', () => {
			const field = new BattleField();
			field.setTrickRoom(true);
			field.setTrickRoom(false);
			expect(field.trickRoom).toBe(false);
		});
	});

	describe('screens', () => {
		it('adds and checks screens', () => {
			const field = new BattleField();
			field.addScreen('ally', Screen.REFLECT, 5);
			expect(field.hasScreen('ally', Screen.REFLECT)).toBe(true);
			expect(field.hasScreen('enemy', Screen.REFLECT)).toBe(false);
		});

		it('removes screens', () => {
			const field = new BattleField();
			field.addScreen('ally', Screen.LIGHT_SCREEN);
			field.removeScreen('ally', Screen.LIGHT_SCREEN);
			expect(field.hasScreen('ally', Screen.LIGHT_SCREEN)).toBe(false);
		});

		it('gets screen turns', () => {
			const field = new BattleField();
			field.addScreen('enemy', Screen.REFLECT, 3);
			expect(field.getScreenTurns('enemy', Screen.REFLECT)).toBe(3);
		});

		it('returns 0 turns for missing screen', () => {
			const field = new BattleField();
			expect(field.getScreenTurns('ally', Screen.REFLECT)).toBe(0);
		});
	});

	describe('hazards', () => {
		it('adds and checks hazards', () => {
			const field = new BattleField();
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			expect(field.hasHazard('enemy', Hazard.STEALTH_ROCK)).toBe(true);
			expect(field.getHazardLayers('enemy', Hazard.STEALTH_ROCK)).toBe(1);
		});

		it('stacks spikes up to max 3 layers', () => {
			const field = new BattleField();
			field.addHazard('ally', Hazard.SPIKES);
			field.addHazard('ally', Hazard.SPIKES);
			field.addHazard('ally', Hazard.SPIKES);
			field.addHazard('ally', Hazard.SPIKES); // should not exceed 3
			expect(field.getHazardLayers('ally', Hazard.SPIKES)).toBe(3);
		});

		it('stealth rock maxes at 1 layer', () => {
			const field = new BattleField();
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			expect(field.getHazardLayers('enemy', Hazard.STEALTH_ROCK)).toBe(1);
		});

		it('toxic spikes maxes at 2 layers', () => {
			const field = new BattleField();
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			expect(field.getHazardLayers('ally', Hazard.TOXIC_SPIKES)).toBe(2);
		});

		it('removes hazard', () => {
			const field = new BattleField();
			field.addHazard('enemy', Hazard.SPIKES);
			field.removeHazard('enemy', Hazard.SPIKES);
			expect(field.hasHazard('enemy', Hazard.SPIKES)).toBe(false);
		});

		it('clears all hazards on a side', () => {
			const field = new BattleField();
			field.addHazard('ally', Hazard.STEALTH_ROCK);
			field.addHazard('ally', Hazard.SPIKES);
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			field.clearHazards('ally');
			expect(field.hasHazard('ally', Hazard.STEALTH_ROCK)).toBe(false);
			expect(field.hasHazard('ally', Hazard.SPIKES)).toBe(false);
			expect(field.hasHazard('ally', Hazard.TOXIC_SPIKES)).toBe(false);
		});

		it('returns 0 layers for non-existent hazard', () => {
			const field = new BattleField();
			expect(field.getHazardLayers('ally', Hazard.STEALTH_ROCK)).toBe(0);
		});
	});

	describe('tickTurn', () => {
		it('decrements weather turns and clears at 0', () => {
			const field = new BattleField();
			field.setWeather(Weather.RAIN, 2);
			field.tickTurn();
			expect(field.weatherTurns).toBe(1);
			expect(field.weather).toBe(Weather.RAIN);
			field.tickTurn();
			expect(field.weatherTurns).toBe(0);
			expect(field.weather).toBe(Weather.NONE);
		});

		it('decrements terrain turns and clears at 0', () => {
			const field = new BattleField();
			field.setTerrain(Terrain.GRASSY, 1);
			field.tickTurn();
			expect(field.terrainTurns).toBe(0);
			expect(field.terrain).toBe(Terrain.NONE);
		});

		it('decrements trick room turns and clears at 0', () => {
			const field = new BattleField();
			field.setTrickRoom(true, 1);
			field.tickTurn();
			expect(field.trickRoomTurns).toBe(0);
			expect(field.trickRoom).toBe(false);
		});

		it('decrements screen turns and removes expired screens', () => {
			const field = new BattleField();
			field.addScreen('ally', Screen.REFLECT, 1);
			field.addScreen('enemy', Screen.LIGHT_SCREEN, 2);
			field.tickTurn();
			expect(field.hasScreen('ally', Screen.REFLECT)).toBe(false);
			expect(field.hasScreen('enemy', Screen.LIGHT_SCREEN)).toBe(true);
			expect(field.getScreenTurns('enemy', Screen.LIGHT_SCREEN)).toBe(1);
		});

		it('does nothing with no active effects', () => {
			const field = new BattleField();
			field.tickTurn();
			expect(field.weather).toBe(Weather.NONE);
			expect(field.terrain).toBe(Terrain.NONE);
		});
	});

	describe('clearField', () => {
		it('resets all field state', () => {
			const field = new BattleField();
			field.setWeather(Weather.RAIN, 5);
			field.setTerrain(Terrain.ELECTRIC, 5);
			field.setTrickRoom(true, 5);
			field.addScreen('ally', Screen.REFLECT);
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			field.clearField();

			expect(field.weather).toBe(Weather.NONE);
			expect(field.weatherTurns).toBe(0);
			expect(field.terrain).toBe(Terrain.NONE);
			expect(field.terrainTurns).toBe(0);
			expect(field.trickRoom).toBe(false);
			expect(field.trickRoomTurns).toBe(0);
			expect(field.hasScreen('ally', Screen.REFLECT)).toBe(false);
			expect(field.hasHazard('enemy', Hazard.STEALTH_ROCK)).toBe(false);
		});
	});
});
