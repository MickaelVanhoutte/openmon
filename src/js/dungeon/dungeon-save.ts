import type { DungeonContext } from './dungeon-context';
import { SavesHolder } from '../context/savesHolder';

export function persistDungeonState(ctx: DungeonContext, savesHolder: SavesHolder): void {
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
	savesHolder.persist(save);
}
