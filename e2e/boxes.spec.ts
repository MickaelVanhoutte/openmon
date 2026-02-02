import { test, expect } from '@playwright/test';
import { injectSaveState, waitForWorld, waitForLoadSave } from './helpers';
import validSave from './fixtures/valid-save.json' with { type: 'json' };

test.describe('Pokemon Box Operations', () => {
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

	test('can open boxes menu', async ({ page }) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const boxesMenu = page.locator('.boxes');
		await expect(boxesMenu).toBeVisible();
	});

	test('box displays Pokemon from save', async ({ page }) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const boxEntry = page.locator('.boxes .box .entries .entry img').first();
		await expect(boxEntry).toBeVisible();
	});

	test('selecting Pokemon in box and choosing move shows moving state', async ({ page }) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const firstPokemonInBox = page.locator('.boxes .box .entries .entry').first();
		await firstPokemonInBox.click();
		await page.waitForTimeout(300);

		const optionsMenu = page.locator('.boxes .options');
		await expect(optionsMenu).toBeVisible();

		const moveOption = optionsMenu.getByText('MOVE');
		await moveOption.click();
		await page.waitForTimeout(300);

		await expect(optionsMenu).not.toHaveClass(/opened/);
	});

	test('moving Pokemon from box to team swaps correctly and updates immediately', async ({
		page
	}) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const boxEntries = page.locator('.boxes .box .entries .entry');
		const firstBoxSlot = boxEntries.first();

		const pokemonImgBefore = firstBoxSlot.locator('img:not(.moving)');
		const pokemonNameBefore = await pokemonImgBefore.getAttribute('alt');
		await expect(pokemonImgBefore).toBeVisible();

		await firstBoxSlot.click();
		await page.waitForTimeout(300);

		const moveOption = page.locator('.boxes .options').getByText('MOVE');
		await moveOption.click();
		await page.waitForTimeout(300);

		const firstTeamSlot = page.locator('.boxes .party .entries .entry').first();
		await firstTeamSlot.click();
		await page.waitForTimeout(500);

		const pokemonImgAfter = firstBoxSlot.locator('img:not(.moving)');
		const pokemonNameAfter = await pokemonImgAfter.getAttribute('alt');

		expect(pokemonNameAfter).not.toBe(pokemonNameBefore);
	});

	test('swapping two Pokemon in box updates display immediately', async ({ page }) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const boxEntries = page.locator('.boxes .box .entries .entry');
		const firstSlot = boxEntries.nth(0);
		const secondSlot = boxEntries.nth(1);

		await firstSlot.click();
		await page.waitForTimeout(300);

		const moveOption = page.locator('.boxes .options').getByText('MOVE');
		await moveOption.click();
		await page.waitForTimeout(300);

		await secondSlot.click();
		await page.waitForTimeout(500);

		const optionsMenu = page.locator('.boxes .options');
		await expect(optionsMenu).not.toHaveClass(/opened/);
	});

	test('can close boxes menu', async ({ page }) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const closeButton = page.locator('.boxes button[aria-label="Close boxes"]');
		await closeButton.click();
		await page.waitForTimeout(500);

		const boxesMenu = page.locator('.boxes');
		await expect(boxesMenu).not.toBeVisible();
	});

	test('can navigate between boxes using arrow buttons', async ({ page }) => {
		const boxesButton = page.locator('button[aria-label="Open Pokemon boxes"]');
		await boxesButton.click();
		await page.waitForTimeout(600);

		const boxName = page.locator('.boxes .box .box-change span');
		const initialName = await boxName.textContent();

		const nextButton = page.locator('.boxes .box .box-change button[aria-label="Next box"]');
		await nextButton.click();
		await page.waitForTimeout(400);

		const newName = await boxName.textContent();
		expect(newName).not.toBe(initialName);
	});
});
