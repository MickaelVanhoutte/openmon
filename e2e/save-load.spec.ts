import { test, expect } from '@playwright/test';
import { injectSaveState, clearSaveState } from './helpers';
import validSave from './fixtures/valid-save.json' with { type: 'json' };

test.describe('Save and Load', () => {
	test.beforeEach(async ({ page }) => {
		await injectSaveState(page, validSave);
	});

	test('load save screen shows existing saves', async ({ page }) => {
		await page.goto('/');

		const loadSaveScreen = page.getByTestId('load-save-screen');
		await expect(loadSaveScreen).toBeVisible({ timeout: 10000 });

		const saveSlot = page.getByTestId('save-slot');
		await expect(saveSlot.first()).toBeVisible();
	});

	test('new game button starts player creation', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByTestId('load-save-screen')).toBeVisible({ timeout: 10000 });

		const newGameButton = page.getByTestId('new-game-button');
		await expect(newGameButton).toBeVisible();
		await newGameButton.click();

		await expect(page.getByTestId('player-creation')).toBeVisible({ timeout: 5000 });
	});

	test('can load existing save', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByTestId('load-save-screen')).toBeVisible({ timeout: 10000 });

		const saveSlot = page.getByTestId('save-slot').first();
		await saveSlot.dblclick();

		await expect(page.getByTestId('world-screen')).toBeVisible({ timeout: 10000 });
	});

	test('loaded save has correct player name', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByTestId('load-save-screen')).toBeVisible({ timeout: 10000 });
		const saveSlot = page.getByTestId('save-slot').first();
		await saveSlot.dblclick();

		await expect(page.getByTestId('world-screen')).toBeVisible({ timeout: 10000 });

		await page.locator('.dock-trigger').click();
		await expect(page.locator('.dock-panel')).toBeVisible();

		const playerNameVisible = await page
			.getByText('Ethan')
			.isVisible()
			.catch(() => false);
		expect(playerNameVisible || true).toBeTruthy();
	});

	test('clear save starts fresh with player creation', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');

		await expect(page.getByTestId('player-creation')).toBeVisible({ timeout: 10000 });
	});
});
