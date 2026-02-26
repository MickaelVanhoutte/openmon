import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Howl } from 'howler';
import { SoundManager } from '../context/managers/sound-manager';
import { Settings } from '../characters/settings';

vi.mock('../battle/animations/audio-sync', () => ({
	getMoveSFXPath: vi.fn((name: string) => {
		const map: Record<string, string> = {
			thunderbolt: 'src/assets/audio/move-effects/Thunderbolt.mp3',
			'swords-dance': 'src/assets/audio/move-effects/Swords Dance.mp3'
		};
		return map[name.toLowerCase()];
	}),
	getBattleSFXPath: vi.fn((key: string) => {
		const map: Record<string, string> = {
			faint: 'src/assets/audio/move-effects/In-Battle Faint No Health.mp3'
		};
		return map[key.toLowerCase()];
	})
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockHowl = Howl as any;

function createMockHowl() {
	return {
		play: vi.fn(),
		stop: vi.fn(),
		volume: vi.fn(),
		unload: vi.fn(),
		on: vi.fn()
	};
}

describe('SoundManager', () => {
	let settings: Settings;
	let manager: SoundManager;

	beforeEach(() => {
		vi.clearAllMocks();
		MockHowl.mockImplementation(function () {
			return createMockHowl();
		});
		settings = new Settings();
		manager = new SoundManager(settings);
	});

	describe('constructor', () => {
		it('creates SoundManager with Settings reference', () => {
			// Arrange & Act
			const mgr = new SoundManager(settings);

			// Assert
			expect(mgr).toBeDefined();
			expect(mgr).toBeInstanceOf(SoundManager);
		});
	});

	describe('playMoveSFX', () => {
		it('creates Howl with correct path and plays it for thunderbolt', () => {
			// Act
			manager.playMoveSFX('thunderbolt');

			// Assert
			expect(MockHowl).toHaveBeenCalledWith(
				expect.objectContaining({
					src: ['src/assets/audio/move-effects/Thunderbolt.mp3']
				})
			);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalled();
		});

		it('converts multi-word kebab-case to Title Case path', () => {
			// Act
			manager.playMoveSFX('swords-dance');

			// Assert
			expect(MockHowl).toHaveBeenCalledWith(
				expect.objectContaining({
					src: ['src/assets/audio/move-effects/Swords Dance.mp3']
				})
			);
		});

		it('logs warning for nonexistent move and does not crash', () => {
			// Arrange
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Act & Assert
			expect(() => manager.playMoveSFX('nonexistent-move')).not.toThrow();
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('nonexistent-move'));
			expect(MockHowl).not.toHaveBeenCalled();

			warnSpy.mockRestore();
		});
	});

	describe('playBattleSFX', () => {
		it('creates Howl with correct path for faint', () => {
			// Act
			manager.playBattleSFX('faint');

			// Assert
			expect(MockHowl).toHaveBeenCalledWith(
				expect.objectContaining({
					src: ['src/assets/audio/move-effects/In-Battle Faint No Health.mp3']
				})
			);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalled();
		});

		it('logs warning for unknown battle SFX key', () => {
			// Arrange
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Act
			manager.playBattleSFX('unknown-key');

			// Assert
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-key'));
			expect(MockHowl).not.toHaveBeenCalled();

			warnSpy.mockRestore();
		});
	});

	describe('playCry', () => {
		it('creates Howl with correct path for pikachu', () => {
			// Act
			manager.playCry('pikachu');

			// Assert
			expect(MockHowl).toHaveBeenCalledWith(
				expect.objectContaining({
					src: ['src/assets/audio/cries/pikachu.mp3']
				})
			);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalled();
		});

		it('normalizes pokemon name with spaces to kebab-case', () => {
			// Act
			manager.playCry('Mr Mime');

			// Assert
			expect(MockHowl).toHaveBeenCalledWith(
				expect.objectContaining({
					src: ['src/assets/audio/cries/mr-mime.mp3']
				})
			);
		});
	});

	describe('playUISFX', () => {
		it('creates Howl with correct path for menu-open', () => {
			// Act
			manager.playUISFX('menu-open');

			// Assert
			expect(MockHowl).toHaveBeenCalledWith(
				expect.objectContaining({
					src: ['src/assets/audio/ui/menu.wav']
				})
			);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalled();
		});

		it('logs warning for unknown UI SFX key', () => {
			// Arrange
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Act
			manager.playUISFX('unknown-ui-key');

			// Assert
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-ui-key'));
			expect(MockHowl).not.toHaveBeenCalled();

			warnSpy.mockRestore();
		});
	});

	describe('Howl caching', () => {
		it('reuses cached Howl instance on second play', () => {
			// Act
			manager.playCry('pikachu');
			manager.playCry('pikachu');

			// Assert — only 1 Howl created, played twice
			expect(MockHowl).toHaveBeenCalledTimes(1);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalledTimes(2);
		});

		it('creates separate Howl instances for different sounds', () => {
			// Act
			manager.playCry('pikachu');
			manager.playCry('bulbasaur');

			// Assert
			expect(MockHowl).toHaveBeenCalledTimes(2);
		});
	});

	describe('concurrent sound limit', () => {
		it('stops oldest sound when max concurrent (6) is exceeded', () => {
			// Arrange — play 7 different cries
			const names = [
				'pikachu',
				'bulbasaur',
				'charmander',
				'squirtle',
				'eevee',
				'jigglypuff',
				'mewtwo'
			];

			// Act
			for (const name of names) {
				manager.playCry(name);
			}

			// Assert — 7 Howls created
			expect(MockHowl).toHaveBeenCalledTimes(7);

			// First (pikachu) should have been stopped
			const firstInstance = MockHowl.mock.results[0].value;
			expect(firstInstance.stop).toHaveBeenCalled();

			// Remaining 6 should NOT have been stopped
			for (let i = 1; i <= 6; i++) {
				const instance = MockHowl.mock.results[i].value;
				expect(instance.stop).not.toHaveBeenCalled();
			}
		});
	});

	describe('stopAll', () => {
		it('stops all active sounds', () => {
			// Arrange
			manager.playCry('pikachu');
			manager.playCry('bulbasaur');
			manager.playCry('charmander');

			// Act
			manager.stopAll();

			// Assert
			for (let i = 0; i < 3; i++) {
				const instance = MockHowl.mock.results[i].value;
				expect(instance.stop).toHaveBeenCalled();
			}
		});

		it('allows new sounds to play after stopAll', () => {
			// Arrange
			manager.playCry('pikachu');
			manager.stopAll();
			vi.clearAllMocks();

			// Act
			manager.playCry('bulbasaur');

			// Assert — reuses cached pikachu Howl? No, bulbasaur is different
			expect(MockHowl).toHaveBeenCalledTimes(1);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalled();
		});
	});

	describe('setSfxVolume', () => {
		it('updates volume on all cached SFX Howl instances', () => {
			// Arrange — play two SFX sounds
			manager.playBattleSFX('faint');
			manager.playMoveSFX('thunderbolt');

			// Act
			manager.setSfxVolume(0.8);

			// Assert — both cached instances should have volume updated
			const faintInstance = MockHowl.mock.results[0].value;
			const moveInstance = MockHowl.mock.results[1].value;
			expect(faintInstance.volume).toHaveBeenCalledWith(0.8);
			expect(moveInstance.volume).toHaveBeenCalledWith(0.8);
		});

		it('updates settings sfxVolume', () => {
			// Act
			manager.setSfxVolume(0.3);

			// Assert
			expect(settings.sfxVolume).toBe(0.3);
		});
	});

	describe('setCryVolume', () => {
		it('updates volume on cached cry Howl instances', () => {
			// Arrange
			manager.playCry('pikachu');

			// Act
			manager.setCryVolume(0.9);

			// Assert
			const instance = MockHowl.mock.results[0].value;
			expect(instance.volume).toHaveBeenCalledWith(0.9);
		});

		it('updates settings cryVolume', () => {
			// Act
			manager.setCryVolume(0.2);

			// Assert
			expect(settings.cryVolume).toBe(0.2);
		});
	});

	describe('setEnabled', () => {
		it('makes all play methods no-ops when disabled', () => {
			// Arrange
			manager.setEnabled(false);

			// Act
			manager.playCry('pikachu');
			manager.playBattleSFX('faint');
			manager.playMoveSFX('thunderbolt');
			manager.playUISFX('menu-open');

			// Assert — no Howl instances created
			expect(MockHowl).not.toHaveBeenCalled();
		});

		it('re-enables playback when set to true', () => {
			// Arrange
			manager.setEnabled(false);
			manager.playCry('pikachu');
			expect(MockHowl).not.toHaveBeenCalled();

			// Act
			manager.setEnabled(true);
			manager.playCry('pikachu');

			// Assert
			expect(MockHowl).toHaveBeenCalledTimes(1);
			const instance = MockHowl.mock.results[0].value;
			expect(instance.play).toHaveBeenCalled();
		});

		it('stops all active sounds when disabling', () => {
			// Arrange
			manager.playCry('pikachu');
			manager.playCry('bulbasaur');

			// Act
			manager.setEnabled(false);

			// Assert — both should have been stopped
			const first = MockHowl.mock.results[0].value;
			const second = MockHowl.mock.results[1].value;
			expect(first.stop).toHaveBeenCalled();
			expect(second.stop).toHaveBeenCalled();
		});

		it('updates settings soundEnabled', () => {
			// Act
			manager.setEnabled(false);

			// Assert
			expect(settings.soundEnabled).toBe(false);
		});
	});

	describe('setMusicVolume', () => {
		it('updates settings musicVolume', () => {
			// Act
			manager.setMusicVolume(0.7);

			// Assert
			expect(settings.musicVolume).toBe(0.7);
		});
	});
});
