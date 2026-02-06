export class Settings {
	xpShare: boolean = true;
	difficulty: 'NORMAL' | 'HARD' = 'HARD';
	gameMode: GameMode = GameMode.CLASSIC;

	constructor() {}
}

export enum GameMode {
	CLASSIC = 'CLASSIC',
	RANDOM = 'RANDOM',
	NUZELOCK = 'NUZELOCK',
	RANDOM_NUZLOCK = 'RANDOM_NUZLOCK'
}
