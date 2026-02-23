/**
 * Critical asset preloading — called once at app startup.
 *
 * Fires off background fetches so assets are warm in the browser cache
 * (and the PWA service worker cache) before they're needed in-game.
 * All loads are non-blocking: failures are silently ignored so a slow
 * or absent network never prevents the app from starting.
 */

import { EFFECT_MANIFEST } from './battle/animations/effect-manifest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function preloadImage(url: string): void {
	const img = new Image();
	img.src = url;
	// No onload / onerror — fire-and-forget, browser caches the response
}

function preloadFetch(url: string): void {
	// fetch() goes through the service worker and populates the SW cache
	fetch(url, { priority: 'low' } as RequestInit).catch(() => {/* offline — ignore */});
}

// ─── Battle FX sprites ───────────────────────────────────────────────────────

/**
 * Preload all battle effect spritesheets.
 * These are the most painful to miss — a missing FX sprite means a blank
 * animation during battle, which looks broken.
 */
function preloadBattleEffects(): void {
	const seen = new Set<string>();
	for (const def of Object.values(EFFECT_MANIFEST)) {
		if (!seen.has(def.path)) {
			seen.add(def.path);
			preloadImage(def.path);
		}
	}
}

// ─── Follower / player sprites for the current session ───────────────────────

/**
 * Preload the walk sprite + AnimData.xml for a specific Pokemon.
 * Call this as soon as you know which Pokemon will be the follower
 * (e.g. on game load, party change, or map transition).
 */
export function preloadFollowerSprite(pokemonId: number, isShiny: boolean = false): void {
	const paddedId = pokemonId.toString().padStart(4, '0');
	const shinyPath = isShiny ? 'shiny/' : '';
	const base = `src/assets/monsters/pmd/${paddedId}/${shinyPath}`;

	preloadImage(`${base}Walk-Anim.png`);
	preloadFetch(`${base}AnimData.xml`);

	// Also warm the non-shiny fallback so the error path is fast too
	if (isShiny) {
		const fallbackBase = `src/assets/monsters/pmd/${paddedId}/`;
		preloadImage(`${fallbackBase}Walk-Anim.png`);
		preloadFetch(`${fallbackBase}AnimData.xml`);
	}
}

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Kick off all critical preloads. Call once, as early as possible in main.ts.
 * Everything runs in the background — this function returns immediately.
 */
export function preloadCriticalAssets(): void {
	// Use requestIdleCallback when available so we don't compete with the
	// initial render; fall back to a short timeout otherwise.
	const schedule = (cb: () => void) =>
		typeof requestIdleCallback !== 'undefined'
			? requestIdleCallback(cb, { timeout: 3000 })
			: setTimeout(cb, 200);

	schedule(() => {
		preloadBattleEffects();
	});
}
