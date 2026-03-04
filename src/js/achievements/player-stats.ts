/**
 * Cumulative player statistics tracked for achievement progress.
 * All fields are simple numbers for direct JSON serialization.
 */
export class PlayerStats {
	// Capture stats
	totalCaught: number = 0;
	legendariesCaught: number = 0;
	shiniesCaught: number = 0;

	// Battle stats
	wildKOs: number = 0;
	trainersBeaten: number = 0;
	battlesWon: number = 0;
	battlesLost: number = 0;
	criticalHitsLanded: number = 0;
	superEffectiveHits: number = 0;
	combosUsed: number = 0;
	bossesDefeated: number = 0;
	totalDamageDealt: number = 0;

	// Economy stats
	totalMoneyEarned: number = 0;
	totalMoneySpent: number = 0;
	itemsUsed: number = 0;

	// Progression stats
	highestLevel: number = 0;
	totalLevelUps: number = 0;
	evolutionsTriggered: number = 0;

	// Dungeon stats
	dungeonFloorsCleared: number = 0;
	biomesVisited: number = 0;

	constructor(stats?: Partial<PlayerStats>) {
		if (stats) {
			Object.assign(this, stats);
		}
	}
}
