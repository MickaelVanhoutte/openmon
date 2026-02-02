import { test, expect } from '@playwright/test';
import {
	clearSaveState,
	waitForPlayerCreation,
	waitForWorld,
	injectSaveState,
	waitForLoadSave
} from './helpers';
import validSave from './fixtures/valid-save.json' with { type: 'json' };

test.describe('World Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		await page.getByTestId('name-input').fill('TestPlayer');
		await page.getByTestId('confirm-button').click();
		await waitForWorld(page);
	});

	test('world screen renders with player', async ({ page }) => {
		await expect(page.getByTestId('world-screen')).toBeVisible();
		await expect(page.locator('canvas#main')).toBeVisible();
	});

	test('menu dock is accessible', async ({ page }) => {
		await expect(page.getByTestId('controls-menu')).toBeVisible();
	});

	test('can open menu with dock trigger', async ({ page }) => {
		const dockTrigger = page.locator('.dock-trigger');
		if (await dockTrigger.isVisible()) {
			await dockTrigger.click();
			await expect(page.locator('.dock-panel')).toBeVisible();
		}
	});

	test('keyboard escape opens/closes menu', async ({ page }) => {
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);
	});

	test('arrow keys are recognized for movement', async ({ page }) => {
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowUp');
	});
});

test.describe('Run Toggle', () => {
	test.beforeEach(async ({ page }) => {
		await injectSaveState(page, validSave);
		await page.goto('/');
		await waitForLoadSave(page);
		const saveSlot = page.getByTestId('save-slot').first();
		await saveSlot.dblclick();
		await waitForWorld(page);
	});

	test('run button is visible when running shoes are unlocked', async ({ page }) => {
		const runButton = page.locator('button[aria-label="Toggle Run"]');
		await expect(runButton).toBeVisible();
	});

	test('run button toggles active state when clicked', async ({ page }) => {
		const runButton = page.locator('button[aria-label="Toggle Run"]');
		await expect(runButton).toBeVisible();

		const hasActiveBefore = await runButton.evaluate((el) => el.classList.contains('active'));
		expect(hasActiveBefore).toBe(false);

		await runButton.click();
		await page.waitForTimeout(100);

		const hasActiveAfter = await runButton.evaluate((el) => el.classList.contains('active'));
		expect(hasActiveAfter).toBe(true);

		await runButton.click();
		await page.waitForTimeout(100);

		const hasActiveAfterToggleOff = await runButton.evaluate((el) =>
			el.classList.contains('active')
		);
		expect(hasActiveAfterToggleOff).toBe(false);
	});

	test('shift key toggles run button active state', async ({ page }) => {
		const runButton = page.locator('button[aria-label="Toggle Run"]');
		await expect(runButton).toBeVisible();

		const hasActiveBefore = await runButton.evaluate((el) => el.classList.contains('active'));
		expect(hasActiveBefore).toBe(false);

		await page.keyboard.press('Shift');
		await page.waitForTimeout(100);

		const hasActiveAfter = await runButton.evaluate((el) => el.classList.contains('active'));
		expect(hasActiveAfter).toBe(true);

		await page.keyboard.press('Shift');
		await page.waitForTimeout(100);

		const hasActiveAfterToggleOff = await runButton.evaluate((el) =>
			el.classList.contains('active')
		);
		expect(hasActiveAfterToggleOff).toBe(false);
	});
});
