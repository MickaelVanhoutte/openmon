import { test, expect } from '@playwright/test';
import {
	injectSaveState,
	waitForLoadSave,
	waitForWorld,
	createMenuTestingFixture
} from './helpers';

test.describe('Menu Navigation (Preloaded Save)', () => {
	let saves: unknown[];

	test.beforeAll(() => {
		saves = createMenuTestingFixture();
	});

	test.beforeEach(async ({ page }) => {
		await injectSaveState(page, saves);
		await page.goto('/');
		await waitForLoadSave(page);
		await page.getByTestId('save-slot').first().dblclick();
		await waitForWorld(page);
	});

	test('dock panel opens when menu trigger is clicked', async ({ page }) => {
		const trigger = page.locator('button[aria-label="Open menu"]');
		await expect(trigger).toBeVisible();
		await trigger.click();
		await expect(page.locator('.dock-panel')).toBeVisible();
	});

	test('team menu shows pokemon list with poke cards', async ({ page }) => {
		await page.locator('button[aria-label="Open menu"]').click();
		await expect(page.locator('.dock-panel')).toBeVisible();

		await page.locator('button[aria-label="Open team menu"]').click();
		const pokemonList = page.locator('.pokemon-list');
		await expect(pokemonList).toBeVisible();
		await expect(pokemonList.locator('.poke-card').first()).toBeVisible();
	});

	test('bag opens with category tabs accessible', async ({ page }) => {
		await page.locator('button[aria-label="Open menu"]').click();
		await expect(page.locator('.dock-panel')).toBeVisible();

		await page.locator('button[aria-label="Open bag"]').click();
		const bag = page.locator('.bag');
		await expect(bag).toBeVisible();
		await expect(bag.locator('.nav .brand')).toContainText('BAG');
		await expect(bag.locator('[role="tablist"]')).toBeVisible();
		await expect(bag.locator('[role="tab"]').first()).toBeVisible();
	});

	test('pokedex view opens', async ({ page }) => {
		await page.locator('button[aria-label="Open menu"]').click();
		await expect(page.locator('.dock-panel')).toBeVisible();

		await page.locator('button[aria-label="Open Pokedex"]').click();
		await expect(page.locator('.pokedex')).toBeVisible();
	});

	test('pokemon summary view shows pokemon details', async ({ page }) => {
		await page.locator('button[aria-label="Open menu"]').click();
		await expect(page.locator('.dock-panel')).toBeVisible();

		await page.locator('button[aria-label="Open team menu"]').click();
		await expect(page.locator('.pokemon-list')).toBeVisible();

		const firstPokemon = page.locator('.pokemon-list .first .poke-card');
		await firstPokemon.click();

		const summaryOption = page.locator('.options').getByText('SUMMARY');
		await expect(summaryOption).toBeVisible();
		await summaryOption.click();

		const summaryBrand = page.locator('.screen .nav .brand');
		await expect(summaryBrand).toBeVisible();
		await expect(summaryBrand).toContainText('Delphox');
	});

	test('escape key closes open menu and returns to world', async ({ page }) => {
		await page.locator('button[aria-label="Open menu"]').click();
		await expect(page.locator('.dock-panel')).toBeVisible();

		await page.locator('button[aria-label="Open team menu"]').click();
		await expect(page.locator('.pokemon-list')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.locator('.pokemon-list')).not.toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.getByTestId('world-screen')).toBeVisible();
	});
});
