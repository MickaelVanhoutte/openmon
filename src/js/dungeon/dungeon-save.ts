import type { DungeonContext } from './dungeon-context';

const DUNGEON_RUN_KEY = 'openmon_dungeon_run';

export interface DungeonRunSave {
	runSeed: string;
	currentFloor: number;
	defeatedTrainers: string[];
	pickedItems: string[];
	runCurrency: number;
}

export function saveDungeonRun(ctx: DungeonContext): void {
	try {
		const save: DungeonRunSave = {
			runSeed: ctx.runSeed,
			currentFloor: ctx.currentFloor,
			defeatedTrainers: Array.from(ctx.defeatedTrainers),
			pickedItems: Array.from(ctx.pickedItems),
			runCurrency: ctx.runCurrency
		};
		localStorage.setItem(DUNGEON_RUN_KEY, JSON.stringify(save));
	} catch {
		// Storage full or unavailable -- silently ignore
	}
}

export function loadDungeonRun(): DungeonRunSave | null {
	try {
		const raw = localStorage.getItem(DUNGEON_RUN_KEY);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as Partial<DungeonRunSave>;
		if (typeof parsed.runSeed !== 'string' || typeof parsed.currentFloor !== 'number') {
			return null;
		}
		return {
			runSeed: parsed.runSeed,
			currentFloor: parsed.currentFloor,
			defeatedTrainers: Array.isArray(parsed.defeatedTrainers) ? parsed.defeatedTrainers : [],
			pickedItems: Array.isArray(parsed.pickedItems) ? parsed.pickedItems : [],
			runCurrency: typeof parsed.runCurrency === 'number' ? parsed.runCurrency : 0
		};
	} catch {
		return null;
	}
}

export function clearDungeonRunSave(): void {
	try {
		localStorage.removeItem(DUNGEON_RUN_KEY);
	} catch {
		// Storage unavailable -- silently ignore
	}
}
