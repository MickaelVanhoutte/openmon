// =============================================================================
// Sprite Positioning Utility for Spatial Battle UI
// =============================================================================
// Provides functions for calculating dynamic positions of UI elements
// relative to Pokemon sprites during battle.
// =============================================================================

/**
 * Sprite position data extracted from a DOM element
 */
export interface SpritePosition {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Anchor position for positioning UI elements
 */
export interface AnchorPosition {
	top: number;
	left: number;
}

/**
 * Position data for attack plate including rotation for radial layout
 */
export interface AttackPlatePosition {
	top: number;
	left: number;
	rotation: number;
}

/**
 * Gets the current position and dimensions of a sprite element.
 * Uses getBoundingClientRect() for accurate viewport-relative positioning.
 *
 * @param element - The sprite HTMLElement to measure
 * @returns Position data or null if element is null/undefined
 */
export function getSpritePosition(element: HTMLElement | null): SpritePosition | null {
	if (!element) {
		return null;
	}

	const rect = element.getBoundingClientRect();

	return {
		x: rect.left,
		y: rect.top,
		width: rect.width,
		height: rect.height
	};
}

/**
 * Calculates the anchor position for an HP widget above a Pokemon's head.
 * The widget should appear centered above the sprite with appropriate offset.
 *
 * @param spritePos - The sprite's position data (from getSpritePosition)
 * @param isAlly - Whether this is an ally Pokemon (affects positioning logic)
 * @returns Anchor position for the HP widget
 */
export function getHPWidgetAnchor(
	spritePos: SpritePosition | null,
	isAlly: boolean
): AnchorPosition {
	// Default fallback positions if sprite position is unavailable
	if (!spritePos) {
		return isAlly ? { top: 60, left: 20 } : { top: 15, left: 55 };
	}

	// Calculate position above the sprite's head (top-center)
	// Offset upward by ~25% of sprite height to position above head
	const headOffset = spritePos.height * 0.25;

	// Center horizontally on sprite
	const centerX = spritePos.x + spritePos.width / 2;

	// Position above sprite - allies are lower on screen, opponents higher
	const widgetTop = spritePos.y - headOffset;

	// Convert to percentage of viewport for responsive positioning
	const viewportHeight = window.innerHeight || 600;
	const viewportWidth = window.innerWidth || 800;

	return {
		top: (widgetTop / viewportHeight) * 100,
		left: (centerX / viewportWidth) * 100
	};
}

/**
 * Calculates radial positions for attack plates that fan out from a sprite.
 * The plates are arranged in a vertical stack to the RIGHT of the sprite.
 *
 * @param spritePos - The sprite's position data (from getSpritePosition)
 * @param moveCount - Number of moves (1-4) to position
 * @returns Array of positions with rotation angles for each attack plate
 */
export function getAttackPlatePositions(
	spritePos: SpritePosition | null,
	moveCount: number
): AttackPlatePosition[] {
	const count = Math.max(1, Math.min(4, moveCount));

	const viewportHeight = window.innerHeight || 600;
	const viewportWidth = window.innerWidth || 800;

	// 2 buttons on LEFT, 2 on RIGHT - surrounding the Pokemon
	if (!spritePos) {
		const fallbackPositions = [
			{ top: 45, left: 8, rotation: -2 }, // Move 1 - top left
			{ top: 45, left: 38, rotation: 2 }, // Move 2 - top right
			{ top: 60, left: 8, rotation: -2 }, // Move 3 - bottom left
			{ top: 60, left: 38, rotation: 2 } // Move 4 - bottom right
		];
		return fallbackPositions.slice(0, count);
	}

	const spriteCenter = {
		x: spritePos.x + spritePos.width / 2,
		y: spritePos.y + spritePos.height / 2
	};

	const horizontalOffset = spritePos.width * 0.7 + 80;
	const verticalOffset = 45;

	const leftX = spriteCenter.x - horizontalOffset;
	const rightX = spriteCenter.x + horizontalOffset - 150;
	const topY = spriteCenter.y - verticalOffset;
	const bottomY = spriteCenter.y + verticalOffset - 15;

	// Convert to percentages and clamp to screen bounds (min 0%)
	const leftXPercent = Math.max(0, (leftX / viewportWidth) * 100);
	const rightXPercent = Math.max(0, (rightX / viewportWidth) * 100);
	const topYPercent = Math.max(0, (topY / viewportHeight) * 100);
	const bottomYPercent = Math.max(0, (bottomY / viewportHeight) * 100);

	const allPositions = [
		{
			// Move 1 - top left
			top: topYPercent - 10,
			left: leftXPercent,
			rotation: -1
		},
		{
			// Move 2 - top right
			top: topYPercent,
			left: rightXPercent,
			rotation: 1
		},
		{
			// Move 3 - bottom left
			top: bottomYPercent - 10,
			left: leftXPercent,
			rotation: -1
		},
		{
			// Move 4 - bottom right
			top: bottomYPercent,
			left: rightXPercent,
			rotation: 1
		}
	];

	return allPositions.slice(0, count);
}

/**
 * Gets positions for multiple HP widgets in a double battle.
 * Ensures widgets don't overlap by adjusting spacing.
 *
 * @param allySpritePos - Position of first ally sprite
 * @param allyPartnerSpritePos - Position of second ally sprite
 * @returns Tuple of anchor positions for both ally widgets
 */
export function getDoubleAllyWidgetAnchors(
	allySpritePos: SpritePosition | null,
	allyPartnerSpritePos: SpritePosition | null
): [AnchorPosition, AnchorPosition] {
	const widget1 = getHPWidgetAnchor(allySpritePos, true);
	const widget2 = getHPWidgetAnchor(allyPartnerSpritePos, true);

	// Check for overlap and adjust if needed
	const minHorizontalGap = 15; // Minimum 15% gap between widgets
	if (Math.abs(widget1.left - widget2.left) < minHorizontalGap) {
		// Spread them apart
		widget1.left -= minHorizontalGap / 2;
		widget2.left += minHorizontalGap / 2;
	}

	return [widget1, widget2];
}

/**
 * Gets positions for opponent HP widgets in a double battle.
 *
 * @param opponentSpritePos - Position of first opponent sprite
 * @param opponentPartnerSpritePos - Position of second opponent sprite
 * @returns Tuple of anchor positions for both opponent widgets
 */
export function getDoubleOpponentWidgetAnchors(
	opponentSpritePos: SpritePosition | null,
	opponentPartnerSpritePos: SpritePosition | null
): [AnchorPosition, AnchorPosition] {
	const widget1 = getHPWidgetAnchor(opponentSpritePos, false);
	const widget2 = getHPWidgetAnchor(opponentPartnerSpritePos, false);

	// Check for overlap and adjust if needed
	const minHorizontalGap = 15;
	if (Math.abs(widget1.left - widget2.left) < minHorizontalGap) {
		widget1.left -= minHorizontalGap / 2;
		widget2.left += minHorizontalGap / 2;
	}

	return [widget1, widget2];
}
