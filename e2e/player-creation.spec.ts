import { test, expect } from '@playwright/test';
import { clearSaveState, waitForPlayerCreation, waitForWorld } from './helpers';

test.describe('Player Creation', () => {
	test('player creation screen shows for new game (no saves)', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		await expect(page.getByTestId('player-creation')).toBeVisible();
	});

	test('can enter player name', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		const nameInput = page.getByTestId('name-input');
		await nameInput.fill('TestPlayer');
		await expect(nameInput).toHaveValue('TestPlayer');
	});

	test('start button is disabled without name', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		const confirmButton = page.getByTestId('confirm-button');
		await expect(confirmButton).toBeDisabled();
	});

	test('confirming creation with name starts game', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		await page.getByTestId('name-input').fill('TestPlayer');
		await page.getByTestId('confirm-button').click();
		await waitForWorld(page);
		await expect(page.getByTestId('world-screen')).toBeVisible();
	});
});
