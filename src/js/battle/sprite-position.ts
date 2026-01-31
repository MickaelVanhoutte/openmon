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
 * The plates are arranged in a semi-circular arc to the right of the sprite.
 *
 * @param spritePos - The sprite's position data (from getSpritePosition)
 * @param moveCount - Number of moves (1-4) to position
 * @returns Array of positions with rotation angles for each attack plate
 */
export function getAttackPlatePositions(
	spritePos: SpritePosition | null,
	moveCount: number
): AttackPlatePosition[] {
	const positions: AttackPlatePosition[] = [];

	// Clamp move count to valid range
	const count = Math.max(1, Math.min(4, moveCount));

	// Default base position if sprite position unavailable
	const baseX = spritePos ? spritePos.x + spritePos.width : 200;
	const baseY = spritePos ? spritePos.y + spritePos.height / 2 : 300;

	// Arc configuration
	const arcRadius = 120; // Distance from sprite center
	const totalArcAngle = 70; // Total spread angle in degrees
	const startAngle = -totalArcAngle / 2; // Start from top of arc

	// Calculate angle step based on move count
	const angleStep = count > 1 ? totalArcAngle / (count - 1) : 0;

	// Convert to viewport percentages
	const viewportHeight = window.innerHeight || 600;
	const viewportWidth = window.innerWidth || 800;

	for (let i = 0; i < count; i++) {
		// Calculate angle for this plate (in degrees)
		const angleDeg = count === 1 ? 0 : startAngle + angleStep * i;
		const angleRad = (angleDeg * Math.PI) / 180;

		// Calculate position along the arc
		const offsetX = Math.cos(angleRad) * arcRadius;
		const offsetY = Math.sin(angleRad) * arcRadius;

		const plateX = baseX + offsetX;
		const plateY = baseY + offsetY;

		positions.push({
			top: (plateY / viewportHeight) * 100,
			left: (plateX / viewportWidth) * 100,
			rotation: angleDeg * 0.3 // Subtle rotation following the arc
		});
	}

	return positions;
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
