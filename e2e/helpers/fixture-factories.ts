import validSaveData from '../fixtures/valid-save.json' with { type: 'json' };

/**
 * Deep-clone valid-save.json and optionally apply modifications.
 * All fixtures are derived from valid-save.json which is a REAL game export
 * that the game's SavesHolder can successfully load.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cloneAndModify(modifier?: (save: any) => void): unknown[] {
	const saves = JSON.parse(JSON.stringify(validSaveData));
	if (modifier) {
		modifier(saves[0]);
	}
	return saves;
}

/**
 * Battle-ready fixture: extra healing items and pokeballs.
 * Base save already has lvl75 Delphox + lvl75 Lilligant.
 */
export function createBattleReadyFixture(): unknown[] {
	return cloneAndModify((save) => {
		save.player.bag.potions['17'] = 10;
		save.player.bag.balls['4'] = 20;
	});
}

/**
 * Menu-testing fixture: diverse items for testing bag/inventory menus.
 */
export function createMenuTestingFixture(): unknown[] {
	return cloneAndModify((save) => {
		save.player.bag.potions['17'] = 5;
		save.player.bag.balls['4'] = 10;
		save.player.bag.money = 10000;
	});
}

/**
 * Full-team fixture: 6 monsters in the party (base has 3, so duplicate).
 */
export function createFullTeamFixture(): unknown[] {
	return cloneAndModify((save) => {
		const existing = save.player.monsters;
		while (save.player.monsters.length < 6) {
			const clone = JSON.parse(
				JSON.stringify(existing[save.player.monsters.length % existing.length])
			);
			save.player.monsters.push(clone);
		}
	});
}

/**
 * World-exploration fixture: base save as-is (already in overworld).
 */
export function createWorldExplorationFixture(): unknown[] {
	return cloneAndModify();
}
