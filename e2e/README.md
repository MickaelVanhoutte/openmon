# E2E Testing with Playwright

This directory contains end-to-end tests for OpenMon using Playwright.

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/intro.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
e2e/
├── fixtures/           # Mock save data for different game states
│   ├── fresh-game.json
│   ├── world-exploration.json
│   ├── battle-ready.json
│   ├── full-team.json
│   └── menu-testing.json
├── helpers/            # Test utilities
│   ├── index.ts
│   ├── save-state.ts   # localStorage injection
│   └── game-state.ts   # Wait helpers
├── intro.spec.ts       # Intro screen tests
├── player-creation.spec.ts
├── save-load.spec.ts
├── world.spec.ts
├── menus.spec.ts
└── battle.spec.ts
```

## Writing New Tests

### Using Fixtures

```typescript
import { injectSaveState } from './helpers';

const mySave = [
	{
		/* save data */
	}
];

test('my test', async ({ page }) => {
	await injectSaveState(page, mySave);
	await page.goto('/');
	// ...
});
```

### Waiting for Game States

```typescript
import { waitForWorld, waitForBattle } from './helpers';

test('navigate to world', async ({ page }) => {
	await page.goto('/');
	await waitForWorld(page);
});
```

### Using data-testid

All interactive elements have `data-testid` attributes:

```typescript
await page.getByTestId('intro-screen');
await page.getByTestId('start-button').click();
await page.getByTestId('world-screen');
```

## CI Integration

Tests run automatically on:

- Pull requests (Chromium only for fast feedback)
- Push to master/main (All 3 browsers)

Test reports are uploaded as artifacts.

## Troubleshooting

### Tests timeout

- Increase timeout in playwright.config.ts
- Check if dev server is running properly

### Element not found

- Check if data-testid exists in component
- Use `await expect(element).toBeVisible()` with timeout

### Flaky tests

- Avoid hardcoded timeouts
- Use state-based waits instead
