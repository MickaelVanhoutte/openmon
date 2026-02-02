import type { Page } from '@playwright/test';

export interface SaveFixture {
	id: number;
	version: number;
	created: number;
	updated: number;
	playTime: number;
	currentMap: {
		mapId: string;
		x: number;
		y: number;
	};
	player: {
		spriteId: number;
		name: string;
		gender: 'MALE' | 'FEMALE';
		monsters: Array<{
			id: number;
			speciesId: number;
			nickname?: string;
			level: number;
			currentHp: number;
			maxHp: number;
			moves: Array<{ id: number; pp: number; maxPp: number }>;
			status?: string | null;
			ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
			evs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
			exp?: number;
			nature?: string;
			abilityIdx?: number;
		}>;
		bag: {
			potions: Array<{ id: number; quantity: number }>;
			pokeballs: Array<{ id: number; quantity: number }>;
			keyItems: Array<{ id: number; quantity: number }>;
			tms: Array<{ id: number; quantity: number }>;
			berries: Array<{ id: number; quantity: number }>;
		};
		lvl: number;
		moving: boolean;
		comboJauge: { value: number; stored: number };
	};
	boxes: Array<{
		name: string;
		values: Array<unknown>;
	}>;
	settings: {
		musicVolume: number;
		sfxVolume: number;
	};
	isNewGame: boolean;
	viewedGuides: number[];
	savedEntry: Array<{ id: number; caughtAt: number }>;
	questStates: Array<unknown>;
	flags: Record<string, boolean | number | string>;
}

export function createValidSave(overrides: Partial<SaveFixture> = {}): SaveFixture {
	const now = Date.now();
	return {
		id: 1,
		version: 1,
		created: now,
		updated: now,
		playTime: 0,
		currentMap: { mapId: 'pallet_town', x: 10, y: 10 },
		player: {
			spriteId: 0,
			name: 'TestPlayer',
			gender: 'MALE',
			monsters: [
				{
					id: 1,
					speciesId: 4,
					nickname: 'Charmander',
					level: 5,
					currentHp: 20,
					maxHp: 20,
					moves: [
						{ id: 10, pp: 35, maxPp: 35 },
						{ id: 52, pp: 25, maxPp: 25 }
					],
					status: null,
					ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
					evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
					exp: 0,
					nature: 'hardy',
					abilityIdx: 0
				}
			],
			bag: {
				potions: [{ id: 4, quantity: 5 }],
				pokeballs: [{ id: 1, quantity: 10 }],
				keyItems: [],
				tms: [],
				berries: []
			},
			lvl: 1,
			moving: false,
			comboJauge: { value: 0, stored: 0 }
		},
		boxes: [],
		settings: { musicVolume: 0.5, sfxVolume: 0.5 },
		isNewGame: false,
		viewedGuides: [],
		savedEntry: [{ id: 4, caughtAt: now }],
		questStates: [],
		flags: {},
		...overrides
	};
}

export async function injectSaveState(page: Page, saves: SaveFixture[] | unknown[]): Promise<void> {
	await page.addInitScript((savesJson: string) => {
		localStorage.setItem('saves', savesJson);
	}, JSON.stringify(saves));
}

export async function clearSaveState(page: Page): Promise<void> {
	await page.addInitScript(() => {
		localStorage.removeItem('saves');
	});
}

export async function getSaveState(page: Page): Promise<SaveFixture[] | null> {
	return await page.evaluate(() => {
		const saves = localStorage.getItem('saves');
		return saves ? JSON.parse(saves) : null;
	});
}
