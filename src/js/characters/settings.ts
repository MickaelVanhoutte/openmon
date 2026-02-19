export class Settings {
	xpShare: boolean = true;
	difficulty: 'NORMAL' | 'HARD' = 'HARD';
	gameMode: GameMode = GameMode.CLASSIC;
	musicVolume: number = 0.5;
	sfxVolume: number = 0.5;
	cryVolume: number = 0.5;
	soundEnabled: boolean = true;

	constructor() {}
}

export enum GameMode {
	CLASSIC = 'CLASSIC',
	RANDOM = 'RANDOM',
	NUZELOCK = 'NUZELOCK',
	RANDOM_NUZLOCK = 'RANDOM_NUZLOCK'
}
