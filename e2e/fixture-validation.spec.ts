import { test, expect } from '@playwright/test';
import {
	injectSaveState,
	waitForLoadSave,
	waitForWorld,
	createBattleReadyFixture,
	createMenuTestingFixture,
	createFullTeamFixture,
	createWorldExplorationFixture
} from './helpers';

test.describe('Fixture Validation', () => {
	test('battle-ready fixture loads and reaches world screen', async ({ page }) => {
		const fixture = createBattleReadyFixture();
		await injectSaveState(page, fixture);
		await page.goto('/');
		await waitForLoadSave(page);

		const saveSlot = page.locator('[data-testid="save-slot"]').first();
		await saveSlot.dblclick();
		await waitForWorld(page);

		await expect(page.locator('[data-testid="world-screen"]')).toBeVisible();
	});

	test('menu-testing fixture loads and reaches world screen', async ({ page }) => {
		const fixture = createMenuTestingFixture();
		await injectSaveState(page, fixture);
		await page.goto('/');
		await waitForLoadSave(page);

		const saveSlot = page.locator('[data-testid="save-slot"]').first();
		await saveSlot.dblclick();
		await waitForWorld(page);

		await expect(page.locator('[data-testid="world-screen"]')).toBeVisible();
	});

	test('full-team fixture loads and reaches world screen', async ({ page }) => {
		const fixture = createFullTeamFixture();
		await injectSaveState(page, fixture);
		await page.goto('/');
		await waitForLoadSave(page);

		const saveSlot = page.locator('[data-testid="save-slot"]').first();
		await saveSlot.dblclick();
		await waitForWorld(page);

		await expect(page.locator('[data-testid="world-screen"]')).toBeVisible();
	});

	test('world-exploration fixture loads and reaches world screen', async ({ page }) => {
		const fixture = createWorldExplorationFixture();
		await injectSaveState(page, fixture);
		await page.goto('/');
		await waitForLoadSave(page);

		const saveSlot = page.locator('[data-testid="save-slot"]').first();
		await saveSlot.dblclick();
		await waitForWorld(page);

		await expect(page.locator('[data-testid="world-screen"]')).toBeVisible();
	});
});
