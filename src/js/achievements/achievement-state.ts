export interface AchievementProgress {
	achievementId: string;
	currentTier: number;
	notifiedTier: number;
}

export class AchievementState {
	progress: Map<string, AchievementProgress> = new Map();

	constructor(entries?: [string, AchievementProgress][]) {
		if (entries) {
			this.progress = new Map(entries);
		}
	}

	getProgress(achievementId: string): AchievementProgress {
		if (!this.progress.has(achievementId)) {
			this.progress.set(achievementId, {
				achievementId,
				currentTier: 0,
				notifiedTier: 0
			});
		}
		return this.progress.get(achievementId)!;
	}

	exportForSave(): [string, AchievementProgress][] {
		return Array.from(this.progress.entries());
	}
}
