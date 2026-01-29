/**
 * Test fixtures for animation testing.
 * Provides consistent mock data for positions, containers, and effects.
 */

/**
 * Position type matching the architecture design.
 */
export interface Position {
	x: number;
	y: number;
	z: number;
	scale: number;
	opacity: number;
}

/**
 * Battle slot identifier.
 */
export interface BattleSlot {
	side: 'player' | 'opponent';
	index: number;
}

// =============================================================================
// POSITION FIXTURES
// =============================================================================

/**
 * Single battle slot positions (percentage-based within container).
 */
export const SINGLE_BATTLE_POSITIONS: Record<string, Position> = {
	'player-0': { x: 25, y: 70, z: 0, scale: 1.0, opacity: 1 },
	'opponent-0': { x: 75, y: 25, z: 200, scale: 0.85, opacity: 1 }
};

/**
 * Double battle slot positions.
 */
export const DOUBLE_BATTLE_POSITIONS: Record<string, Position> = {
	'player-0': { x: 20, y: 70, z: 0, scale: 0.9, opacity: 1 },
	'player-1': { x: 40, y: 75, z: 10, scale: 0.9, opacity: 1 },
	'opponent-0': { x: 60, y: 20, z: 200, scale: 0.75, opacity: 1 },
	'opponent-1': { x: 80, y: 25, z: 210, scale: 0.75, opacity: 1 }
};

/**
 * Get position key from slot.
 */
export function slotToKey(slot: BattleSlot): string {
	return `${slot.side}-${slot.index}`;
}

/**
 * Mock player Pokemon position for single battle.
 */
export const mockPlayerPosition: Position = SINGLE_BATTLE_POSITIONS['player-0'];

/**
 * Mock opponent Pokemon position for single battle.
 */
export const mockOpponentPosition: Position = SINGLE_BATTLE_POSITIONS['opponent-0'];

// =============================================================================
// CONTAINER FIXTURES
// =============================================================================

/**
 * Standard battle container dimensions.
 */
export const mockContainerBounds = {
	width: 800,
	height: 600
};

/**
 * Mobile battle container dimensions.
 */
export const mockMobileContainerBounds = {
	width: 375,
	height: 667
};

// =============================================================================
// EFFECT FIXTURES
// =============================================================================

/**
 * Effect sprite manifest matching current assets.
 */
export const mockEffectManifest: Record<
	string,
	{
		path: string;
		frames: number;
		frameWidth: number;
		frameHeight: number;
	}
> = {
	impact: {
		path: '/assets/battle/fx/impact-sprite.png',
		frames: 4,
		frameWidth: 192,
		frameHeight: 192
	},
	fire: {
		path: '/assets/battle/fx/fire-sprite.png',
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	thunder: {
		path: '/assets/battle/fx/thunder-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	slash: {
		path: '/assets/battle/fx/slash-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	water: {
		path: '/assets/battle/fx/water-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	ice: {
		path: '/assets/battle/fx/ice-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	fist: {
		path: '/assets/battle/fx/fist-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	foot: {
		path: '/assets/battle/fx/foot-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	}
};

// =============================================================================
// POKEMON SPRITE FIXTURES
// =============================================================================

/**
 * Mock Pokemon sprite data.
 */
export interface MockPokemonSprite {
	slot: BattleSlot;
	homePosition: Position;
	speciesId: number;
}

export const mockPlayerSprite: MockPokemonSprite = {
	slot: { side: 'player', index: 0 },
	homePosition: mockPlayerPosition,
	speciesId: 25 // Pikachu
};

export const mockOpponentSprite: MockPokemonSprite = {
	slot: { side: 'opponent', index: 0 },
	homePosition: mockOpponentPosition,
	speciesId: 6 // Charizard
};

// =============================================================================
// MOVE FIXTURES
// =============================================================================

/**
 * Sample move data for testing.
 */
export const mockMoves = {
	tackle: {
		name: 'tackle',
		type: 'normal',
		category: 'physical',
		power: 40
	},
	thunderbolt: {
		name: 'thunderbolt',
		type: 'electric',
		category: 'special',
		power: 90
	},
	swordsDance: {
		name: 'swords-dance',
		type: 'normal',
		category: 'status',
		power: 0
	}
};
