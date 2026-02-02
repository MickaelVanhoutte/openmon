import { test, expect } from '@playwright/test';
import { clearSaveState, waitForPlayerCreation, waitForWorld } from './helpers';

test.describe('Battle Flow', () => {
	test('can create new game and enter world', async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		await page.getByTestId('name-input').fill('TestPlayer');
		await page.getByTestId('confirm-button').click();
		await waitForWorld(page);
		await expect(page.getByTestId('world-screen')).toBeVisible();
	});

	test('battle UI elements are defined via testids', async ({ page }) => {
		await page.goto('/');
		const battleScreen = page.getByTestId('battle-screen');
		const allyInfo = page.getByTestId('ally-pokemon-info');
		const opponentInfo = page.getByTestId('opponent-pokemon-info');
		const allyHpBar = page.getByTestId('ally-hp-bar');
		const opponentHpBar = page.getByTestId('opponent-hp-bar');

		expect(battleScreen).toBeDefined();
		expect(allyInfo).toBeDefined();
		expect(opponentInfo).toBeDefined();
		expect(allyHpBar).toBeDefined();
		expect(opponentHpBar).toBeDefined();
	});

	test('modal overlay is accessible', async ({ page }) => {
		await page.goto('/');
		const modalOverlay = page.getByTestId('modal-overlay');
		const modalClose = page.getByTestId('modal-close');

		expect(modalOverlay).toBeDefined();
		expect(modalClose).toBeDefined();
	});

	test('dialog elements are accessible', async ({ page }) => {
		await page.goto('/');
		const dialogBox = page.getByTestId('dialog-box');
		const dialogText = page.getByTestId('dialog-text');

		expect(dialogBox).toBeDefined();
		expect(dialogText).toBeDefined();
	});
});
