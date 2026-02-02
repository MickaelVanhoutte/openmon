import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function waitForGameReady(page: Page): Promise<void> {
	await page.waitForSelector(
		'[data-testid="intro-screen"], [data-testid="load-save-screen"], [data-testid="world-screen"], [data-testid="player-creation"]',
		{ timeout: 10000 }
	);
}

export async function waitForIntro(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="intro-screen"]', { timeout: 10000 });
}

export async function waitForIntroReady(page: Page): Promise<void> {
	await expect(page.getByTestId('start-button')).toContainText('Touch to start', {
		timeout: 20000
	});
}

export async function waitForWorld(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="world-screen"]', { timeout: 15000 });
}

export async function waitForBattle(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="battle-screen"]', { timeout: 10000 });
}

export async function waitForLoadSave(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="load-save-screen"]', { timeout: 10000 });
}

export async function waitForPlayerCreation(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="player-creation"]', { timeout: 10000 });
}

export async function goThroughIntro(page: Page): Promise<void> {
	await page.goto('/');
	await waitForIntro(page);
	await waitForIntroReady(page);
	await page.getByTestId('start-button').click();
}
