import type { DungeonContext } from './dungeon-context';

const META_STORAGE_KEY = 'openmon_dungeon_meta';

export interface MetaProgress {
	bestFloor: number;
	totalRuns: number;
	totalCurrency: number;
}

function defaultMetaProgress(): MetaProgress {
	return {
		bestFloor: 0,
		totalRuns: 0,
		totalCurrency: 0
	};
}

export function loadMetaProgress(): MetaProgress {
	try {
		const raw = localStorage.getItem(META_STORAGE_KEY);
		if (!raw) {
			return defaultMetaProgress();
		}
		const parsed = JSON.parse(raw) as Partial<MetaProgress>;
		return {
			bestFloor: typeof parsed.bestFloor === 'number' ? parsed.bestFloor : 0,
			totalRuns: typeof parsed.totalRuns === 'number' ? parsed.totalRuns : 0,
			totalCurrency: typeof parsed.totalCurrency === 'number' ? parsed.totalCurrency : 0
		};
	} catch {
		return defaultMetaProgress();
	}
}

export function saveMetaProgress(progress: MetaProgress): void {
	try {
		localStorage.setItem(META_STORAGE_KEY, JSON.stringify(progress));
	} catch {
		// Storage full or unavailable — silently ignore
	}
}

export function updateMetaProgress(dungeonCtx: DungeonContext): MetaProgress {
	const current = loadMetaProgress();
	const updated: MetaProgress = {
		bestFloor: Math.max(current.bestFloor, dungeonCtx.currentFloor),
		totalRuns: current.totalRuns + 1,
		totalCurrency: current.totalCurrency + dungeonCtx.runCurrency
	};
	saveMetaProgress(updated);
	return updated;
}
