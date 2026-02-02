import { test, expect } from '@playwright/test';
import { clearSaveState, waitForPlayerCreation } from './helpers';

test.describe('Game Start (DEBUG mode skips intro)', () => {
	test('fresh game goes directly to player creation', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		await expect(page.getByTestId('player-creation')).toBeVisible();
	});

	test('intro screen is skipped in DEBUG mode', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		const introScreen = page.getByTestId('intro-screen');
		await expect(introScreen).not.toBeVisible({ timeout: 3000 });
	});
});
