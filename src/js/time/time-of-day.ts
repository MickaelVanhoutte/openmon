import { writable, derived, type Readable } from 'svelte/store';

export enum TimeOfDay {
	DAWN = 'dawn',
	DAY = 'day',
	DUSK = 'dusk',
	NIGHT = 'night'
}

export interface DayCycleConfig {
	cycleDurationMs: number;
	paused: boolean;
}

const DEFAULT_CONFIG: DayCycleConfig = {
	cycleDurationMs: 60 * 60 * 10,
	paused: false
};

function progressToGameHour(progress: number): number {
	return progress * 24;
}

function getTimeOfDayFromHour(hour: number): TimeOfDay {
	if (hour >= 6 && hour < 9) return TimeOfDay.DAWN;
	if (hour >= 9 && hour < 18) return TimeOfDay.DAY;
	if (hour >= 18 && hour < 21) return TimeOfDay.DUSK;
	return TimeOfDay.NIGHT;
}

export class TimeOfDayService {
	private startTime: number;
	private config: DayCycleConfig;
	private pausedAt: number | null = null;

	public readonly progress = writable(0);
	public readonly gameHour: Readable<number>;
	public readonly timeOfDay: Readable<TimeOfDay>;
	public readonly backgroundOffset: Readable<string>;

	constructor(config: Partial<DayCycleConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.startTime = Date.now();

		this.gameHour = derived(this.progress, ($progress) => progressToGameHour($progress));

		this.timeOfDay = derived(this.gameHour, ($hour) => getTimeOfDayFromHour($hour));

		this.backgroundOffset = derived(this.timeOfDay, ($tod) => {
			switch ($tod) {
				case TimeOfDay.DAWN:
					return '33.33%';
				case TimeOfDay.DAY:
					return '0%';
				case TimeOfDay.DUSK:
					return '33.33%';
				case TimeOfDay.NIGHT:
					return '66.66%';
			}
		});

		this.startUpdateLoop();
	}

	private startUpdateLoop() {
		const update = () => {
			if (!this.config.paused) {
				const elapsed = Date.now() - this.startTime;
				const cycleProgress = (elapsed % this.config.cycleDurationMs) / this.config.cycleDurationMs;
				this.progress.set(cycleProgress);
			}
			requestAnimationFrame(update);
		};
		requestAnimationFrame(update);
	}

	setTimeOfDay(tod: TimeOfDay) {
		let targetHour: number;
		switch (tod) {
			case TimeOfDay.DAWN:
				targetHour = 7;
				break;
			case TimeOfDay.DAY:
				targetHour = 12;
				break;
			case TimeOfDay.DUSK:
				targetHour = 19;
				break;
			case TimeOfDay.NIGHT:
				targetHour = 0;
				break;
		}
		const targetProgress = targetHour / 24;
		this.startTime = Date.now() - targetProgress * this.config.cycleDurationMs;
		this.progress.set(targetProgress);
	}

	pause() {
		if (!this.config.paused) {
			this.config.paused = true;
			this.pausedAt = Date.now();
		}
	}

	resume() {
		if (this.config.paused && this.pausedAt) {
			const pauseDuration = Date.now() - this.pausedAt;
			this.startTime += pauseDuration;
			this.config.paused = false;
			this.pausedAt = null;
		}
	}

	setCycleDuration(minutes: number) {
		this.config.cycleDurationMs = minutes * 60 * 1000;
	}

	getConfig(): DayCycleConfig {
		return { ...this.config };
	}
}

export const timeOfDayService = new TimeOfDayService();
