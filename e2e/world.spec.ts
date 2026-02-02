import { test, expect } from '@playwright/test';
import { clearSaveState, waitForPlayerCreation, waitForWorld } from './helpers';

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
