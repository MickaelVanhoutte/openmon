import { describe, it, expect, beforeEach } from 'vitest';
import { BattleField, Weather, Screen, Hazard, Terrain } from '../battle/battle-field';

describe('BattleField', () => {
	let field: BattleField;

	beforeEach(() => {
		field = new BattleField();
	});

	describe('Weather', () => {
		it('should start with no weather', () => {
			expect(field.weather).toBe(Weather.NONE);
			expect(field.weatherTurns).toBe(0);
		});

		it('should set weather for 5 turns by default', () => {
			field.setWeather(Weather.RAIN);
			expect(field.weather).toBe(Weather.RAIN);
			expect(field.weatherTurns).toBe(5);
		});

		it('should set weather with custom turn count', () => {
			field.setWeather(Weather.SUN, 8);
			expect(field.weather).toBe(Weather.SUN);
			expect(field.weatherTurns).toBe(8);
		});

		it('should replace existing weather', () => {
			field.setWeather(Weather.RAIN);
			field.setWeather(Weather.SAND);
			expect(field.weather).toBe(Weather.SAND);
			expect(field.weatherTurns).toBe(5);
		});

		it('should expire weather after turns', () => {
			field.setWeather(Weather.HAIL, 2);
			field.tickTurn();
			expect(field.weather).toBe(Weather.HAIL);
			expect(field.weatherTurns).toBe(1);
			field.tickTurn();
			expect(field.weather).toBe(Weather.NONE);
			expect(field.weatherTurns).toBe(0);
		});

		it('should clear weather when set to NONE', () => {
			field.setWeather(Weather.RAIN);
			field.setWeather(Weather.NONE);
			expect(field.weather).toBe(Weather.NONE);
			expect(field.weatherTurns).toBe(0);
		});
	});

	describe('Screens', () => {
		it('should start with no screens', () => {
			expect(field.allySide.screens.size).toBe(0);
			expect(field.enemySide.screens.size).toBe(0);
		});

		it('should add Reflect to ally side', () => {
			field.addScreen('ally', Screen.REFLECT);
			expect(field.allySide.screens.get(Screen.REFLECT)).toBe(5);
		});

		it('should add Light Screen to enemy side', () => {
			field.addScreen('enemy', Screen.LIGHT_SCREEN, 8);
			expect(field.enemySide.screens.get(Screen.LIGHT_SCREEN)).toBe(8);
		});

		it('should refresh screen duration when reapplied', () => {
			field.addScreen('ally', Screen.REFLECT, 3);
			field.addScreen('ally', Screen.REFLECT, 5);
			expect(field.allySide.screens.get(Screen.REFLECT)).toBe(5);
		});

		it('should expire screens after turns', () => {
			field.addScreen('ally', Screen.REFLECT, 2);
			field.tickTurn();
			expect(field.allySide.screens.get(Screen.REFLECT)).toBe(1);
			field.tickTurn();
			expect(field.allySide.screens.has(Screen.REFLECT)).toBe(false);
		});

		it('should have separate screens per side', () => {
			field.addScreen('ally', Screen.REFLECT);
			field.addScreen('enemy', Screen.LIGHT_SCREEN);
			expect(field.allySide.screens.has(Screen.REFLECT)).toBe(true);
			expect(field.allySide.screens.has(Screen.LIGHT_SCREEN)).toBe(false);
			expect(field.enemySide.screens.has(Screen.LIGHT_SCREEN)).toBe(true);
			expect(field.enemySide.screens.has(Screen.REFLECT)).toBe(false);
		});
	});

	describe('Hazards', () => {
		it('should start with no hazards', () => {
			expect(field.allySide.hazards.size).toBe(0);
			expect(field.enemySide.hazards.size).toBe(0);
		});

		it('should add Stealth Rock (no layers)', () => {
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			expect(field.enemySide.hazards.get(Hazard.STEALTH_ROCK)).toBe(1);
		});

		it('should stack Spikes up to 3 layers', () => {
			field.addHazard('enemy', Hazard.SPIKES);
			expect(field.enemySide.hazards.get(Hazard.SPIKES)).toBe(1);
			field.addHazard('enemy', Hazard.SPIKES);
			expect(field.enemySide.hazards.get(Hazard.SPIKES)).toBe(2);
			field.addHazard('enemy', Hazard.SPIKES);
			expect(field.enemySide.hazards.get(Hazard.SPIKES)).toBe(3);
			field.addHazard('enemy', Hazard.SPIKES);
			expect(field.enemySide.hazards.get(Hazard.SPIKES)).toBe(3); // Max 3
		});

		it('should stack Toxic Spikes up to 2 layers', () => {
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			expect(field.allySide.hazards.get(Hazard.TOXIC_SPIKES)).toBe(1);
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			expect(field.allySide.hazards.get(Hazard.TOXIC_SPIKES)).toBe(2);
			field.addHazard('ally', Hazard.TOXIC_SPIKES);
			expect(field.allySide.hazards.get(Hazard.TOXIC_SPIKES)).toBe(2); // Max 2
		});

		it('should not stack Stealth Rock', () => {
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			expect(field.enemySide.hazards.get(Hazard.STEALTH_ROCK)).toBe(1);
		});

		it('should clear hazards from a side', () => {
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			field.addHazard('enemy', Hazard.SPIKES);
			field.clearHazards('enemy');
			expect(field.enemySide.hazards.size).toBe(0);
		});
	});

	describe('Terrain', () => {
		it('should start with no terrain', () => {
			expect(field.terrain).toBe(Terrain.NONE);
			expect(field.terrainTurns).toBe(0);
		});

		it('should set terrain for 5 turns by default', () => {
			field.setTerrain(Terrain.ELECTRIC);
			expect(field.terrain).toBe(Terrain.ELECTRIC);
			expect(field.terrainTurns).toBe(5);
		});

		it('should expire terrain after turns', () => {
			field.setTerrain(Terrain.GRASSY, 2);
			field.tickTurn();
			field.tickTurn();
			expect(field.terrain).toBe(Terrain.NONE);
			expect(field.terrainTurns).toBe(0);
		});

		it('should replace existing terrain', () => {
			field.setTerrain(Terrain.PSYCHIC);
			field.setTerrain(Terrain.MISTY);
			expect(field.terrain).toBe(Terrain.MISTY);
		});
	});

	describe('Trick Room', () => {
		it('should start with Trick Room inactive', () => {
			expect(field.trickRoom).toBe(false);
			expect(field.trickRoomTurns).toBe(0);
		});

		it('should activate Trick Room for 5 turns', () => {
			field.setTrickRoom(true);
			expect(field.trickRoom).toBe(true);
			expect(field.trickRoomTurns).toBe(5);
		});

		it('should deactivate Trick Room when called again', () => {
			field.setTrickRoom(true);
			field.setTrickRoom(true); // Toggle off
			expect(field.trickRoom).toBe(false);
			expect(field.trickRoomTurns).toBe(0);
		});

		it('should expire Trick Room after turns', () => {
			field.setTrickRoom(true, 2);
			field.tickTurn();
			expect(field.trickRoom).toBe(true);
			field.tickTurn();
			expect(field.trickRoom).toBe(false);
		});
	});

	describe('tickTurn', () => {
		it('should decrement all turn counters', () => {
			field.setWeather(Weather.RAIN, 3);
			field.addScreen('ally', Screen.REFLECT, 3);
			field.setTerrain(Terrain.ELECTRIC, 3);
			field.setTrickRoom(true, 3);

			field.tickTurn();

			expect(field.weatherTurns).toBe(2);
			expect(field.allySide.screens.get(Screen.REFLECT)).toBe(2);
			expect(field.terrainTurns).toBe(2);
			expect(field.trickRoomTurns).toBe(2);
		});

		it('should not decrement hazards (they persist until cleared)', () => {
			field.addHazard('enemy', Hazard.SPIKES);
			field.addHazard('enemy', Hazard.SPIKES);
			field.tickTurn();
			field.tickTurn();
			expect(field.enemySide.hazards.get(Hazard.SPIKES)).toBe(2);
		});
	});

	describe('clearField', () => {
		it('should reset all field state', () => {
			field.setWeather(Weather.RAIN);
			field.addScreen('ally', Screen.REFLECT);
			field.addScreen('enemy', Screen.LIGHT_SCREEN);
			field.addHazard('enemy', Hazard.STEALTH_ROCK);
			field.setTerrain(Terrain.ELECTRIC);
			field.setTrickRoom(true);

			field.clearField();

			expect(field.weather).toBe(Weather.NONE);
			expect(field.weatherTurns).toBe(0);
			expect(field.allySide.screens.size).toBe(0);
			expect(field.enemySide.screens.size).toBe(0);
			expect(field.allySide.hazards.size).toBe(0);
			expect(field.enemySide.hazards.size).toBe(0);
			expect(field.terrain).toBe(Terrain.NONE);
			expect(field.terrainTurns).toBe(0);
			expect(field.trickRoom).toBe(false);
			expect(field.trickRoomTurns).toBe(0);
		});
	});

	describe('hasScreen', () => {
		it('should return true when screen is active', () => {
			field.addScreen('ally', Screen.REFLECT);
			expect(field.hasScreen('ally', Screen.REFLECT)).toBe(true);
			expect(field.hasScreen('ally', Screen.LIGHT_SCREEN)).toBe(false);
		});
	});

	describe('getHazardLayers', () => {
		it('should return 0 when no hazard', () => {
			expect(field.getHazardLayers('enemy', Hazard.SPIKES)).toBe(0);
		});

		it('should return correct layer count', () => {
			field.addHazard('enemy', Hazard.SPIKES);
			field.addHazard('enemy', Hazard.SPIKES);
			expect(field.getHazardLayers('enemy', Hazard.SPIKES)).toBe(2);
		});
	});
});
