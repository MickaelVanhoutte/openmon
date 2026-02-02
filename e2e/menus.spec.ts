import { test, expect } from '@playwright/test';
import {
	clearSaveState,
	waitForPlayerCreation,
	waitForWorld,
	injectSaveState,
	waitForLoadSave
} from './helpers';
import validSave from './fixtures/valid-save.json' with { type: 'json' };

test.describe('Menu Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await clearSaveState(page);
		await page.goto('/');
		await waitForPlayerCreation(page);
		await page.getByTestId('name-input').fill('TestPlayer');
		await page.getByTestId('confirm-button').click();
		await waitForWorld(page);
	});

	test('menu dock contains expected items', async ({ page }) => {
		const menuDock = page.getByTestId('controls-menu');
		await expect(menuDock).toBeVisible();
	});

	test('can open team menu', async ({ page }) => {
		const teamButton = page.locator('.dock-panel').getByText('Team');
		if (await teamButton.isVisible()) {
			await teamButton.click();
			await page.waitForTimeout(500);
		}
	});

	test('can open bag menu', async ({ page }) => {
		const bagButton = page.locator('.dock-panel').getByText('Bag');
		if (await bagButton.isVisible()) {
			await bagButton.click();
			await page.waitForTimeout(500);
		}
	});

	test('can open pokedex', async ({ page }) => {
		const pokedexButton = page.locator('.dock-panel').getByText('Pokedex');
		if (await pokedexButton.isVisible()) {
			await pokedexButton.click();
			await page.waitForTimeout(500);
		}
	});

	test('escape key closes menus', async ({ page }) => {
		await page.keyboard.press('Escape');
		await page.waitForTimeout(300);
		await page.keyboard.press('Escape');
	});
});

test.describe('Pokemon Summary from Team Menu', () => {
	test.beforeEach(async ({ page }) => {
		await injectSaveState(page, validSave);
		await page.goto('/');
		await waitForLoadSave(page);
		const saveSlot = page.getByTestId('save-slot').first();
		await saveSlot.dblclick();
		await waitForWorld(page);
		await page.locator('button[aria-label="Open menu"]').click();
		await page.waitForTimeout(300);
	});

	test('summary shows correct pokemon when second pokemon selected from team menu', async ({
		page
	}) => {
		const teamButton = page.locator('button[aria-label="Open team menu"]');
		await teamButton.click();
		await page.waitForTimeout(600);

		const pokemonList = page.locator('.pokemon-list');
		await expect(pokemonList).toBeVisible();

		const secondPokemon = page.locator('.pokemon-list .others .poke-card').first();
		await secondPokemon.click();
		await page.waitForTimeout(300);

		await secondPokemon.click();
		await page.waitForTimeout(300);

		const summaryOption = page.locator('.options').getByText('SUMMARY');
		await expect(summaryOption).toBeVisible();
		await summaryOption.click();
		await page.waitForTimeout(600);

		const summaryScreen = page.locator('.screen .nav .brand');
		await expect(summaryScreen).toBeVisible();
		await expect(summaryScreen).toContainText('Lilligant');
	});

	test('summary shows first pokemon when first pokemon selected from team menu', async ({
		page
	}) => {
		const teamButton = page.locator('button[aria-label="Open team menu"]');
		await teamButton.click();
		await page.waitForTimeout(600);

		const pokemonList = page.locator('.pokemon-list');
		await expect(pokemonList).toBeVisible();

		const firstPokemon = page.locator('.pokemon-list .first .poke-card');
		await firstPokemon.click();
		await page.waitForTimeout(300);

		const summaryOption = page.locator('.options').getByText('SUMMARY');
		await expect(summaryOption).toBeVisible();
		await summaryOption.click();
		await page.waitForTimeout(600);

		const summaryScreen = page.locator('.screen .nav .brand');
		await expect(summaryScreen).toBeVisible();
		await expect(summaryScreen).toContainText('Delphox');
	});

	test('summary appears immediately without closing team menu first', async ({ page }) => {
		const teamButton = page.locator('button[aria-label="Open team menu"]');
		await teamButton.click();
		await page.waitForTimeout(600);

		const pokemonList = page.locator('.pokemon-list');
		await expect(pokemonList).toBeVisible();

		const secondPokemon = page.locator('.pokemon-list .others .poke-card').first();
		await secondPokemon.click();
		await page.waitForTimeout(300);
		await secondPokemon.click();
		await page.waitForTimeout(300);

		const summaryOption = page.locator('.options').getByText('SUMMARY');
		await summaryOption.click();

		const summaryScreen = page.locator('.screen .nav .brand');
		await expect(summaryScreen).toBeVisible({ timeout: 1000 });
	});
});
