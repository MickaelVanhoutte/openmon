import { Howl } from 'howler';
import type { Settings } from '../../characters/settings';
import { getMoveSFXPath, getBattleSFXPath } from '../../battle/animations/audio-sync';

export const UI_SFX_MAP: Record<string, string> = {
	'menu-open': 'src/assets/audio/ui/menu.wav',
	'menu-close': 'src/assets/audio/ui/menu.wav',
	'cursor-move': 'src/assets/audio/ui/cursor-move.mp3',
	confirm: 'src/assets/audio/ui/menu.wav',
	cancel: 'src/assets/audio/ui/cancel.mp3',
	'item-use': 'src/assets/audio/ui/item-use.mp3',
	'error-buzz': 'src/assets/audio/ui/error-buzz.mp3'
};

const MAX_CONCURRENT_SFX = 6;

interface ActiveSound {
	id: string;
	howl: Howl;
}

export class SoundManager {
	private settings: Settings;
	private sfxCache: Map<string, Howl> = new Map();
	private cryCache: Map<string, Howl> = new Map();
	private activeSounds: ActiveSound[] = [];
	private sfxVolume: number;
	private cryVolume: number;
	private enabled: boolean;

	constructor(settings: Settings) {
		this.settings = settings;
		this.sfxVolume = settings.sfxVolume;
		this.cryVolume = settings.cryVolume;
		this.enabled = settings.soundEnabled;
	}

	playMoveSFX(moveName: string): void {
		if (!this.enabled) {
			return;
		}

		const path = getMoveSFXPath(moveName);
		if (!path) {
			console.warn(`[SoundManager] No SFX mapping for move: ${moveName}`);
			return;
		}

		this.playSound(path, this.sfxVolume, this.sfxCache);
	}

	playMoveSFXAsync(moveName: string): Promise<void> {
		if (!this.enabled) {
			return Promise.resolve();
		}

		const path = getMoveSFXPath(moveName);
		if (!path) {
			return Promise.resolve();
		}

		return this.playSoundAsync(path, this.sfxVolume, this.sfxCache);
	}

	playBattleSFX(key: string): void {
		if (!this.enabled) {
			return;
		}

		const path = getBattleSFXPath(key);
		if (!path) {
			console.warn(`[SoundManager] Unknown battle SFX key: ${key}`);
			return;
		}

		this.playSound(path, this.sfxVolume, this.sfxCache);
	}

	playCry(pokemonName: string): void {
		if (!this.enabled) {
			return;
		}

		const normalized = pokemonName.toLowerCase().replace(/\s+/g, '-');
		const path = `src/assets/audio/cries/${normalized}.mp3`;
		this.playSound(path, this.cryVolume, this.cryCache);
	}

	playUISFX(key: string): void {
		if (!this.enabled) {
			return;
		}

		const path = UI_SFX_MAP[key];
		if (!path) {
			console.warn(`[SoundManager] Unknown UI SFX key: ${key}`);
			return;
		}

		this.playSound(path, this.sfxVolume, this.sfxCache);
	}

	stopAll(): void {
		for (const active of this.activeSounds) {
			active.howl.stop();
		}
		this.activeSounds = [];
	}

	setMusicVolume(v: number): void {
		this.settings.musicVolume = v;
	}

	setSfxVolume(v: number): void {
		this.sfxVolume = v;
		this.settings.sfxVolume = v;
		for (const [, howl] of this.sfxCache) {
			howl.volume(v);
		}
	}

	setCryVolume(v: number): void {
		this.cryVolume = v;
		this.settings.cryVolume = v;
		for (const [, howl] of this.cryCache) {
			howl.volume(v);
		}
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		this.settings.soundEnabled = enabled;
		if (!enabled) {
			this.stopAll();
		}
	}

	private playSound(path: string, volume: number, cache: Map<string, Howl>): void {
		if (this.activeSounds.length >= MAX_CONCURRENT_SFX) {
			const oldest = this.activeSounds.shift();
			oldest?.howl.stop();
		}

		let howl = cache.get(path);
		if (!howl) {
			howl = new Howl({
				src: [path],
				autoplay: false,
				loop: false,
				volume
			});
			cache.set(path, howl);
		}

		howl.volume(volume);
		howl.play();
		this.activeSounds.push({ id: path, howl });
	}

	private playSoundAsync(path: string, volume: number, cache: Map<string, Howl>): Promise<void> {
		if (this.activeSounds.length >= MAX_CONCURRENT_SFX) {
			const oldest = this.activeSounds.shift();
			oldest?.howl.stop();
		}

		let howl = cache.get(path);
		if (!howl) {
			howl = new Howl({
				src: [path],
				autoplay: false,
				loop: false,
				volume
			});
			cache.set(path, howl);
		}

		howl.volume(volume);
		return new Promise<void>((resolve) => {
			howl!.once('end', () => resolve());
			howl!.play();
			this.activeSounds.push({ id: path, howl: howl! });
		});
	}
}
