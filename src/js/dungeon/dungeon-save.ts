import type { DungeonContext } from './dungeon-context';
import type { ExplorationTracker } from './exploration-tracker';
import { SavesHolder } from '../context/savesHolder';

export interface DungeonPersistExtras {
	explorationTracker?: ExplorationTracker;
	playerX?: number;
	playerY?: number;
}

export function persistDungeonState(
	ctx: DungeonContext,
	savesHolder: SavesHolder,
	extras?: DungeonPersistExtras
): void {
	const save = savesHolder.getActiveSave();
	if (!save) {
		return;
	}

	save.dungeonSeed = ctx.runSeed;
	save.dungeonFloor = ctx.currentFloor;
	save.dungeonDefeated = Array.from(ctx.defeatedTrainers);
	save.dungeonItems = Array.from(ctx.pickedItems);
	save.dungeonCurrency = ctx.runCurrency;
	save.dungeonActive = ctx.isRunActive;
	save.dungeonStarterPicked = ctx.starterPicked;
	save.dungeonPrologueCompleted = ctx.prologueCompleted;

	if (extras?.explorationTracker) {
		save.dungeonExplored = extras.explorationTracker.exportVisited();
	}
	if (extras?.playerX !== undefined) save.dungeonPlayerX = extras.playerX;
	if (extras?.playerY !== undefined) save.dungeonPlayerY = extras.playerY;

	savesHolder.persist(save);
}
