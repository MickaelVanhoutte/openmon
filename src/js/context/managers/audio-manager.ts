/**
 * AudioManager - Handles all game audio including map music and battle sounds
 */
export class AudioManager {
	private sound?: Howl;
	private battleStartSound: Howl;
	private battleSound: Howl;
	private legendaryBattleSound: Howl;
	private mapSoundCache: Map<string, Howl> = new Map();

	constructor() {
		this.battleStartSound = new Howl({
			src: ['src/assets/audio/battle/battle-start.mp3'],
			autoplay: false,
			loop: false,
			volume: 0.5,
			html5: true
		});
		this.battleSound = new Howl({
			src: ['src/assets/audio/battle/battle2.mp3'],
			autoplay: false,
			loop: true,
			volume: 0.5,
			html5: true
		});
		this.legendaryBattleSound = new Howl({
			src: ['src/assets/audio/battle/PerituneMaterial_EpicBattle_J(chosic.com)-2.mp3'],
			autoplay: false,
			loop: true,
			volume: 0.5,
			html5: true
		});
	}

	playMapSound(mapSound?: string): void {
		if (mapSound) {
			const cached = this.mapSoundCache.get(mapSound);
			if (cached) {
				cached.volume(0.5);
				cached.seek(0);
				cached.play();
				this.sound = cached;
			} else {
				const howl = new Howl({
					src: ['src/assets/audio/' + mapSound + '.mp3'],
					autoplay: true,
					loop: true,
					volume: 0.5,
					html5: true
				});
				this.mapSoundCache.set(mapSound, howl);
				this.sound = howl;
			}
		}
	}

	fadeOutMapSound(duration: number = 900): void {
		if (this.sound) {
			const fadingSound = this.sound;
			fadingSound.fade(0.5, 0, duration);
			setTimeout(() => {
				fadingSound.stop();
			}, duration);
			this.sound = undefined;
		}
	}

	isMapSoundPlaying(): boolean {
		return !!this.sound && this.sound.playing();
	}

	startBattleTransition(): void {
		if (this.sound && this.sound.playing()) {
			this.sound.fade(0.5, 0, 500);
			this.battleStartSound.play();
			const fadingSound = this.sound;
			setTimeout(() => {
				fadingSound.stop();
			}, 500);
			this.sound = undefined;
			this.battleStartSound.fade(0, 0.5, 500);
		}
	}

	playBattleMusic(): void {
		this.battleStartSound.stop();
		this.battleSound.volume(0.5);
		this.battleSound.seek(0);
		this.battleSound.play();
	}

	playLegendaryBattleMusic(): void {
		this.battleStartSound.stop();
		this.legendaryBattleSound.volume(0.5);
		this.legendaryBattleSound.seek(0);
		this.legendaryBattleSound.play();
	}

	fadeOutBattleMusic(duration: number = 1000): void {
		if (this.battleSound.playing()) {
			this.battleSound.fade(0.5, 0, duration);
		}
		if (this.legendaryBattleSound.playing()) {
			this.legendaryBattleSound.fade(0.5, 0, duration);
		}
	}

	stopBattleMusic(): void {
		this.battleSound.stop();
		this.legendaryBattleSound.stop();
	}

	getCurrentSound(): Howl | undefined {
		return this.sound;
	}
}
