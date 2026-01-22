/**
 * AudioManager - Handles all game audio including map music and battle sounds
 */
export class AudioManager {
	private sound?: Howl;
	private battleStartSound: Howl;
	private battleSound: Howl;

	constructor() {
		this.battleStartSound = new Howl({
			src: ['src/assets/audio/battle/battle-start.mp3'],
			autoplay: false,
			loop: false,
			volume: 0.5
		});
		this.battleSound = new Howl({
			src: ['src/assets/audio/battle/battle2.mp3'],
			autoplay: false,
			loop: true,
			volume: 0.5
		});
	}

	playMapSound(mapSound?: string): void {
		if (mapSound) {
			this.sound = new Howl({
				src: ['src/assets/audio/' + mapSound + '.mp3'],
				autoplay: true,
				loop: true,
				volume: 0.5
			});
		}
	}

	fadeOutMapSound(duration: number = 900): void {
		if (this.sound) {
			this.sound.fade(0.5, 0, duration);
			setTimeout(() => {
				this.sound?.stop();
				this.sound = undefined;
			}, duration);
		}
	}

	isMapSoundPlaying(): boolean {
		return !!this.sound && this.sound.playing();
	}

	startBattleTransition(): void {
		if (this.sound && this.sound.playing()) {
			this.sound.fade(0.5, 0, 500);
			this.battleStartSound.play();
			setTimeout(() => {
				this.sound?.stop();
				this.battleStartSound.fade(0, 0.5, 500);
			}, 500);
		}
	}

	playBattleMusic(): void {
		this.battleStartSound.stop();
		this.battleSound.play();
	}

	fadeOutBattleMusic(duration: number = 1000): void {
		this.battleSound.fade(0.5, 0, duration);
	}

	stopBattleMusic(): void {
		this.battleSound.stop();
	}

	getCurrentSound(): Howl | undefined {
		return this.sound;
	}
}
