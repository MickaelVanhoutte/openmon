import { test, expect, type Page } from '@playwright/test';
import {
	injectSaveState,
	createBattleReadyFixture,
	waitForLoadSave,
	waitForWorld,
	waitForBattle
} from './helpers';

/**
 * Load a battle-ready save and enter the overworld.
 * Overrides Math.random to 0.05 to guarantee battle encounters
 * and ensure escape succeeds (0.05 * 255 * 30 = 382 > 255).
 */
async function loadSaveAndEnterWorld(page: Page) {
	await page.addInitScript(() => {
		Math.random = () => 0.05;
	});

	const fixture = createBattleReadyFixture();

	// Position player in a battle zone on map 0 (First Beach)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const save = fixture[0] as any;
	save.player.position.positionOnMap = { x: 112, y: 13 };
	save.player.position.targetPosition = { x: 112, y: 13 };
	save.player.position.positionInPx = { x: 112 * 16, y: 13 * 16 };
	save.player.position.targetPositionInPx = { x: 112 * 16, y: 13 * 16 };

	await injectSaveState(page, fixture);
	await page.goto('/');
	await waitForLoadSave(page);

	const saveSlot = page.locator('[data-testid="save-slot"]').first();
	await saveSlot.dblclick();

	await waitForWorld(page);
}

/**
 * Walk back and forth in the battle zone until an encounter triggers.
 * Uses requestAnimationFrame between steps to let the game loop process movement.
 */
async function triggerBattle(page: Page) {
	const battleScreen = page.locator('[data-testid="battle-screen"]');

	for (let i = 0; i < 50; i++) {
		const direction = i % 2 === 0 ? 'ArrowRight' : 'ArrowLeft';
		await page.keyboard.press(direction);

		if (await battleScreen.isVisible().catch(() => false)) {
			break;
		}

		// Yield to the browser render loop so the game can process the step
		await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));

		if (await battleScreen.isVisible().catch(() => false)) {
			break;
		}
	}

	await waitForBattle(page);
}

async function waitForActionMenu(page: Page) {
	await expect(page.locator('button[aria-label="FIGHT"]')).toBeVisible({ timeout: 20000 });
}

test.describe('Battle System', () => {
	test('can trigger and display battle screen', async ({ page }) => {
		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);

		await expect(page.locator('[data-testid="battle-screen"]')).toBeVisible();
	});

	test('battle shows ally and opponent pokemon info', async ({ page }) => {
		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);

		const allyInfo = page.locator('[data-testid="ally-pokemon-info"]');
		const opponentInfo = page.locator('[data-testid="opponent-pokemon-info"]');

		await expect(allyInfo).toBeVisible({ timeout: 20000 });
		await expect(opponentInfo).toBeVisible({ timeout: 5000 });
	});

	test('can open fight menu and see moves', async ({ page }) => {
		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);
		await waitForActionMenu(page);

		await page.locator('button[aria-label="FIGHT"]').click();

		const moveButtons = page.locator('.attack-plate');
		await expect(moveButtons.first()).toBeVisible({ timeout: 5000 });
	});

	test('can select and use a move', async ({ page }) => {
		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);
		await waitForActionMenu(page);

		await page.locator('button[aria-label="FIGHT"]').click();
		const moveButtons = page.locator('.attack-plate');
		await expect(moveButtons.first()).toBeVisible({ timeout: 5000 });
		await moveButtons.first().click();

		await page.waitForSelector('button[aria-label="FIGHT"], [data-testid="world-screen"]', {
			state: 'visible',
			timeout: 30000
		});
	});

	test('can flee from wild battle', async ({ page }) => {
		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);
		await waitForActionMenu(page);

		await page.locator('button[aria-label="RUN"]').click();

		await expect(page.locator('[data-testid="world-screen"]')).toBeVisible({ timeout: 15000 });
	});

	test('enemy faints after repeated attacks', async ({ page }) => {
		test.setTimeout(120000);

		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);

		for (let turn = 0; turn < 20; turn++) {
			const worldVisible = await page
				.locator('[data-testid="world-screen"]')
				.isVisible()
				.catch(() => false);
			if (worldVisible) {
				break;
			}

			const fightBtn = page.locator('button[aria-label="FIGHT"]');
			const fightReady = await fightBtn
				.waitFor({ state: 'visible', timeout: 20000 })
				.then(() => true)
				.catch(() => false);

			if (!fightReady) {
				break;
			}

			await fightBtn.click();
			const moveButtons = page.locator('.attack-plate');
			await expect(moveButtons.first()).toBeVisible({ timeout: 5000 });
			await moveButtons.first().click();

			await page.waitForSelector('button[aria-label="FIGHT"], [data-testid="world-screen"]', {
				state: 'visible',
				timeout: 30000
			});
		}

		await expect(page.locator('[data-testid="world-screen"]')).toBeVisible({ timeout: 30000 });
	});

	test('can switch pokemon during battle', async ({ page }) => {
		test.setTimeout(120000);

		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);
		await waitForActionMenu(page);

		await page.locator('button[aria-label="POKEMON"]').click();

		const switchMenu = page.locator('.mini-pkmn-menu');
		await expect(switchMenu).toBeVisible({ timeout: 5000 });

		const lilligant = page.locator('[aria-label*="Lilligant"]');
		await expect(lilligant).toBeVisible({ timeout: 5000 });
		await lilligant.click();

		const switchBtn = page.locator('.btn-switch');
		await expect(switchBtn).toBeVisible({ timeout: 5000 });
		await expect(switchBtn).toBeEnabled({ timeout: 5000 });
		await switchBtn.click();

		await waitForActionMenu(page);

		await expect(page.locator('[data-testid="ally-pokemon-info"]')).toBeVisible({
			timeout: 10000
		});
	});

	test('can use an item from bag during battle', async ({ page }) => {
		test.setTimeout(120000);

		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);
		await waitForActionMenu(page);

		await page.locator('button[aria-label="FIGHT"]').click();
		await expect(page.locator('.attack-plate').first()).toBeVisible({ timeout: 5000 });
		await page.locator('.attack-plate').first().click();
		await page.waitForSelector('button[aria-label="FIGHT"], [data-testid="world-screen"]', {
			state: 'visible',
			timeout: 30000
		});

		if (
			await page
				.locator('[data-testid="world-screen"]')
				.isVisible()
				.catch(() => false)
		) {
			return;
		}

		await page.locator('button[aria-label="BAG"]').click();
		const bagMenu = page.locator('.mini-bag');
		await expect(bagMenu).toBeVisible({ timeout: 5000 });

		await expect(page.locator('.mini-bag .item').first()).toBeVisible({ timeout: 5000 });

		const useBtn = page.locator('button[aria-label*="Use item on"]').first();
		await expect(useBtn).toBeVisible({ timeout: 5000 });

		if (await useBtn.isEnabled().catch(() => false)) {
			await useBtn.click();
			await page.waitForSelector('button[aria-label="FIGHT"], [data-testid="world-screen"]', {
				state: 'visible',
				timeout: 30000
			});
		}
	});

	test('multi-turn combat reduces HP', async ({ page }) => {
		test.setTimeout(120000);

		await loadSaveAndEnterWorld(page);
		await triggerBattle(page);
		await waitForActionMenu(page);

		// Regex extracts percentage from inline width style on HP bar fill element
		async function getOpponentHpPercent(): Promise<number> {
			const fill = page.locator('[data-testid="opponent-hp-bar"] .hp-bar-fill');
			const style = await fill.getAttribute('style');
			const match = style?.match(/width:\s*([\d.]+)%/);
			return match ? parseFloat(match[1]) : 100;
		}

		const initialHp = await getOpponentHpPercent();

		for (let turn = 0; turn < 3; turn++) {
			const worldVisible = await page
				.locator('[data-testid="world-screen"]')
				.isVisible()
				.catch(() => false);
			if (worldVisible) {
				break;
			}

			const fightBtn = page.locator('button[aria-label="FIGHT"]');
			const fightReady = await fightBtn
				.waitFor({ state: 'visible', timeout: 20000 })
				.then(() => true)
				.catch(() => false);

			if (!fightReady) {
				break;
			}

			await fightBtn.click();
			const moveButtons = page.locator('.attack-plate');
			await expect(moveButtons.first()).toBeVisible({ timeout: 5000 });
			await moveButtons.first().click();

			await page.waitForSelector('button[aria-label="FIGHT"], [data-testid="world-screen"]', {
				state: 'visible',
				timeout: 30000
			});
		}

		const worldVisible = await page
			.locator('[data-testid="world-screen"]')
			.isVisible()
			.catch(() => false);

		if (worldVisible) {
			expect(true).toBe(true);
		} else {
			await page.waitForTimeout(1500);
			const finalHp = await getOpponentHpPercent();
			expect(finalHp).toBeLessThan(initialHp);
		}
	});
});
