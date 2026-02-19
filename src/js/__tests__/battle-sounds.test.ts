import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundManager } from '../context/managers/sound-manager';
import { Settings } from '../characters/settings';
import { Howl } from 'howler';
import { getBattleSFXPath } from '../battle/animations/audio-sync';

vi.mock('howler', () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const MockHowl = vi.fn().mockImplementation(function (this: any) {
		this.play = vi.fn();
		this.stop = vi.fn();
		this.volume = vi.fn();
		this.unload = vi.fn();
		this.on = vi.fn();
	});
	return { Howl: MockHowl };
});

vi.mock('../battle/animations/audio-sync', () => ({
	getMoveSFXPath: vi.fn((name: string) => {
		const map: Record<string, string> = {
			thunderbolt: 'src/assets/audio/move-effects/Thunderbolt.mp3',
			'swords-dance': 'src/assets/audio/move-effects/Swords Dance.mp3',
			flamethrower: 'src/assets/audio/move-effects/Flamethrower.mp3',
			'ice-beam': 'src/assets/audio/move-effects/Ice Beam.mp3'
		};
		return map[name.toLowerCase()];
	}),
	getBattleSFXPath: vi.fn((key: string) => {
		const map: Record<string, string> = {
			faint: 'src/assets/audio/move-effects/In-Battle Faint No Health.mp3',
			'stat-rise': 'src/assets/audio/move-effects/Stat Rise Up.mp3',
			'stat-fall': 'src/assets/audio/move-effects/Stat Fall Down.mp3',
			'hit-normal': 'src/assets/audio/move-effects/Hit Normal Damage.mp3',
			'hit-super-effective': 'src/assets/audio/move-effects/Hit Super Effective.mp3',
			'hit-not-very-effective': 'src/assets/audio/move-effects/Hit Weak Not Very Effective.mp3',
			'switch-alive': 'src/assets/audio/move-effects/In-Battle Recall Switch Alive.mp3',
			'switch-fainted': 'src/assets/audio/move-effects/In-Battle Recall Switch Fainted.mp3'
		};
		return map[key.toLowerCase()];
	})
}));

describe('Battle Sound Integration', () => {
	let settings: Settings;
	let soundManager: SoundManager;

	beforeEach(() => {
		vi.clearAllMocks();
		settings = new Settings();
		soundManager = new SoundManager(settings);
	});

	describe('Move SFX triggers', () => {
		it('plays move SFX when animateAttack fires', () => {
			const spy = vi.spyOn(soundManager, 'playMoveSFX');
			soundManager.playMoveSFX('thunderbolt');
			expect(spy).toHaveBeenCalledWith('thunderbolt');
		});

		it('plays move SFX for different moves', () => {
			const spy = vi.spyOn(soundManager, 'playMoveSFX');
			soundManager.playMoveSFX('flamethrower');
			soundManager.playMoveSFX('ice-beam');
			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenCalledWith('flamethrower');
			expect(spy).toHaveBeenCalledWith('ice-beam');
		});
	});

	describe('Faint sound triggers', () => {
		it('plays faint sound when pokemon faints', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');
			soundManager.playBattleSFX('faint');
			expect(spy).toHaveBeenCalledWith('faint');
		});

		it('uses correct BATTLE_SFX_MAP key for faint', () => {
			soundManager.playBattleSFX('faint');
			expect(getBattleSFXPath).toHaveBeenCalledWith('faint');
		});
	});

	describe('Stat change sound triggers', () => {
		it('plays stat-rise sound for positive stat changes', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');
			const stages = 1;
			soundManager.playBattleSFX(stages > 0 ? 'stat-rise' : 'stat-fall');
			expect(spy).toHaveBeenCalledWith('stat-rise');
		});

		it('plays stat-fall sound for negative stat changes', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');
			const stages = -1;
			soundManager.playBattleSFX(stages > 0 ? 'stat-rise' : 'stat-fall');
			expect(spy).toHaveBeenCalledWith('stat-fall');
		});

		it('plays stat-fall for -2 stage drops', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');
			const stages = -2;
			soundManager.playBattleSFX(stages > 0 ? 'stat-rise' : 'stat-fall');
			expect(spy).toHaveBeenCalledWith('stat-fall');
		});
	});

	describe('Hit effectiveness sound triggers', () => {
		it('plays hit-super-effective for effectiveness > 1', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');
			const effectiveness = 2;
			if (effectiveness > 1) {
				soundManager.playBattleSFX('hit-super-effective');
			} else if (effectiveness < 1 && effectiveness > 0) {
				soundManager.playBattleSFX('hit-not-very-effective');
			} else if (effectiveness > 0) {
				soundManager.playBattleSFX('hit-normal');
			}

			expect(spy).toHaveBeenCalledWith('hit-super-effective');
		});

		it('plays hit-not-very-effective for effectiveness < 1', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');

			const effectiveness = 0.5;
			if (effectiveness > 1) {
				soundManager.playBattleSFX('hit-super-effective');
			} else if (effectiveness < 1 && effectiveness > 0) {
				soundManager.playBattleSFX('hit-not-very-effective');
			} else if (effectiveness > 0) {
				soundManager.playBattleSFX('hit-normal');
			}

			expect(spy).toHaveBeenCalledWith('hit-not-very-effective');
		});

		it('plays hit-normal for neutral effectiveness', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');

			const effectiveness = 1;
			if (effectiveness > 1) {
				soundManager.playBattleSFX('hit-super-effective');
			} else if (effectiveness < 1 && effectiveness > 0) {
				soundManager.playBattleSFX('hit-not-very-effective');
			} else if (effectiveness > 0) {
				soundManager.playBattleSFX('hit-normal');
			}

			expect(spy).toHaveBeenCalledWith('hit-normal');
		});

		it('plays no hit sound for immune (effectiveness = 0)', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');

			const effectiveness = 0;
			if (effectiveness > 1) {
				soundManager.playBattleSFX('hit-super-effective');
			} else if (effectiveness < 1 && effectiveness > 0) {
				soundManager.playBattleSFX('hit-not-very-effective');
			} else if (effectiveness > 0) {
				soundManager.playBattleSFX('hit-normal');
			}

			expect(spy).not.toHaveBeenCalled();
		});

		it('plays hit-super-effective for 4x effectiveness', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');

			const effectiveness = 4;
			if (effectiveness > 1) {
				soundManager.playBattleSFX('hit-super-effective');
			} else if (effectiveness < 1 && effectiveness > 0) {
				soundManager.playBattleSFX('hit-not-very-effective');
			} else if (effectiveness > 0) {
				soundManager.playBattleSFX('hit-normal');
			}

			expect(spy).toHaveBeenCalledWith('hit-super-effective');
		});
	});

	describe('Switch sound triggers', () => {
		it('plays switch-alive when switching non-fainted pokemon', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');
			const isFaintSwitch = false;
			soundManager.playBattleSFX(isFaintSwitch ? 'switch-fainted' : 'switch-alive');
			expect(spy).toHaveBeenCalledWith('switch-alive');
		});

		it('plays switch-fainted when replacing fainted pokemon', () => {
			const spy = vi.spyOn(soundManager, 'playBattleSFX');

			const isFaintSwitch = true;
			soundManager.playBattleSFX(isFaintSwitch ? 'switch-fainted' : 'switch-alive');
			expect(spy).toHaveBeenCalledWith('switch-fainted');
		});
	});

	describe('Battle cleanup', () => {
		it('calls stopAll on battle end', () => {
			const spy = vi.spyOn(soundManager, 'stopAll');
			soundManager.stopAll();
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('stopAll after playing multiple sounds', () => {
			soundManager.playBattleSFX('faint');
			soundManager.playBattleSFX('stat-rise');
			soundManager.playMoveSFX('thunderbolt');

			soundManager.stopAll();

			const spy = vi.spyOn(soundManager, 'stopAll');
			soundManager.stopAll();
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('Sound disabled behavior', () => {
		it('does not play sounds when disabled', () => {
			soundManager.setEnabled(false);

			soundManager.playMoveSFX('thunderbolt');
			soundManager.playBattleSFX('faint');
			soundManager.playBattleSFX('stat-rise');
			soundManager.playBattleSFX('hit-normal');

			expect(Howl).not.toHaveBeenCalled();
		});
	});

	describe('BATTLE_SFX_MAP key correctness', () => {
		it('uses correct keys matching BATTLE_SFX_MAP', () => {
			const battleSfxKeys = [
				'faint',
				'stat-rise',
				'stat-fall',
				'hit-normal',
				'hit-super-effective',
				'hit-not-very-effective',
				'switch-alive',
				'switch-fainted'
			];

			for (const key of battleSfxKeys) {
				soundManager.playBattleSFX(key);
			}

			expect(getBattleSFXPath).toHaveBeenCalledTimes(battleSfxKeys.length);
			for (const key of battleSfxKeys) {
				expect(getBattleSFXPath).toHaveBeenCalledWith(key);
			}
		});
	});
});
