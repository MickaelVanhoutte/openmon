import bossData from '../../assets/data/final/beta/boss-definitions.json';

export interface BossTeamMember {
	speciesId: number;
	levelOffset: number;
	heldItemId: number | null;
}

export interface BossDefinition {
	id: string;
	name: string;
	biome: string;
	floor: number;
	spriteId: number;
	dialogBefore: string | string[];
	dialogAfter: string | string[];
	team: BossTeamMember[];
}

interface BossFile {
	bosses: BossDefinition[];
}

const data = bossData as BossFile;
const bosses: BossDefinition[] = data.bosses;

/**
 * Returns the boss definition for a given floor, or undefined for non-boss floors.
 * Boss floors are every 5th floor (5, 10, 15, ...).
 * Bosses cycle through the 10 defined bosses:
 *   Floor 5 → boss 0, Floor 10 → boss 1, ..., Floor 50 → boss 9, Floor 55 → boss 0 again.
 */
export function getBossForFloor(floor: number): BossDefinition | undefined {
	if (floor <= 0 || floor % 5 !== 0) {
		return undefined;
	}
	const bossIndex = (((floor / 5 - 1) % bosses.length) + bosses.length) % bosses.length;
	return bosses[bossIndex];
}
