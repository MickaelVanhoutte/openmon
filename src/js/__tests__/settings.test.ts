import { describe, it, expect } from 'vitest';
import { Settings } from '../characters/settings';

describe('Settings', () => {
	describe('Audio Fields - Defaults', () => {
		it('should have correct default values for new Settings instance', () => {
			// Arrange & Act
			const settings = new Settings();

			// Assert
			expect(settings.musicVolume).toBe(0.5);
			expect(settings.sfxVolume).toBe(0.5);
			expect(settings.cryVolume).toBe(0.5);
			expect(settings.soundEnabled).toBe(true);
		});

		it('should have correct default values for existing fields', () => {
			// Arrange & Act
			const settings = new Settings();

			// Assert
			expect(settings.xpShare).toBe(true);
			expect(settings.difficulty).toBe('HARD');
		});
	});

	describe('Audio Fields - Backward Compatibility', () => {
		it('should restore defaults when loading old save without audio fields', () => {
			// Arrange: Simulate old save data (no audio fields)
			const oldSaveData = {
				xpShare: false,
				difficulty: 'NORMAL'
			};

			// Act: Deserialize using Object.assign pattern
			const settings = new Settings();
			Object.assign(settings, oldSaveData);

			// Assert: Audio fields should retain their defaults
			expect(settings.musicVolume).toBe(0.5);
			expect(settings.sfxVolume).toBe(0.5);
			expect(settings.cryVolume).toBe(0.5);
			expect(settings.soundEnabled).toBe(true);
			// Existing fields should be updated
			expect(settings.xpShare).toBe(false);
			expect(settings.difficulty).toBe('NORMAL');
		});

		it('should restore saved audio values when loading new save with audio fields', () => {
			// Arrange: Simulate new save data (with audio fields)
			const newSaveData = {
				xpShare: true,
				difficulty: 'HARD',
				musicVolume: 0.8,
				sfxVolume: 0.3,
				cryVolume: 0.6,
				soundEnabled: false
			};

			// Act: Deserialize using Object.assign pattern
			const settings = new Settings();
			Object.assign(settings, newSaveData);

			// Assert: All fields should be restored
			expect(settings.musicVolume).toBe(0.8);
			expect(settings.sfxVolume).toBe(0.3);
			expect(settings.cryVolume).toBe(0.6);
			expect(settings.soundEnabled).toBe(false);
			expect(settings.xpShare).toBe(true);
			expect(settings.difficulty).toBe('HARD');
		});
	});

	describe('Audio Fields - Type Validation', () => {
		it('should have volume fields as numbers between 0 and 1', () => {
			// Arrange & Act
			const settings = new Settings();

			// Assert
			expect(typeof settings.musicVolume).toBe('number');
			expect(typeof settings.sfxVolume).toBe('number');
			expect(typeof settings.cryVolume).toBe('number');
			expect(settings.musicVolume).toBeGreaterThanOrEqual(0);
			expect(settings.musicVolume).toBeLessThanOrEqual(1);
			expect(settings.sfxVolume).toBeGreaterThanOrEqual(0);
			expect(settings.sfxVolume).toBeLessThanOrEqual(1);
			expect(settings.cryVolume).toBeGreaterThanOrEqual(0);
			expect(settings.cryVolume).toBeLessThanOrEqual(1);
		});

		it('should have soundEnabled as boolean', () => {
			// Arrange & Act
			const settings = new Settings();

			// Assert
			expect(typeof settings.soundEnabled).toBe('boolean');
		});
	});

	describe('Audio Fields - JSON Serialization', () => {
		it('should serialize and deserialize audio fields correctly', () => {
			// Arrange
			const original = new Settings();
			original.musicVolume = 0.7;
			original.sfxVolume = 0.4;
			original.cryVolume = 0.9;
			original.soundEnabled = false;

			// Act: Simulate JSON round-trip
			const json = JSON.stringify(original);
			const parsed = JSON.parse(json);
			const restored = new Settings();
			Object.assign(restored, parsed);

			// Assert
			expect(restored.musicVolume).toBe(0.7);
			expect(restored.sfxVolume).toBe(0.4);
			expect(restored.cryVolume).toBe(0.9);
			expect(restored.soundEnabled).toBe(false);
		});
	});
});
