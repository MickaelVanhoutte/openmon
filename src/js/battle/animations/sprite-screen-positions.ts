import { writable } from 'svelte/store';

export interface ScreenSpritePosition {
	x: number;
	y: number;
	width: number;
	height: number;
	visible: boolean;
}

export interface BattleScreenPositions {
	ally: ScreenSpritePosition[];
	opponent: ScreenSpritePosition[];
}

/**
 * Reactive store publishing screen-space positions of all 3D battle sprites.
 * Updated every frame by BattleSprites3DContainer via useTask.
 * Consumed by FloatingPokemonInfo for HP bar positioning.
 */
export const battleScreenPositions = writable<BattleScreenPositions>({
	ally: [],
	opponent: []
});

/**
 * Store publishing proxy HTMLElements for each battle slot.
 * BattleSprites3DContainer publishes these; Battle.svelte reads them
 * to use as `sprite.element` for the AnimationEngine.
 */
export const battleSpriteProxies = writable<{
	ally: HTMLElement[];
	opponent: HTMLElement[];
}>({
	ally: [],
	opponent: []
});

/**
 * Version counter incremented by Battle.svelte on pokemon switches.
 * BattleSprites3DContainer subscribes to this to re-run its reconciliation
 * $effect, since battleCtx.playerSide is a plain class property and
 * mutations aren't tracked by Svelte 5 reactivity.
 */
export const battleSpriteVersion = writable(0);
