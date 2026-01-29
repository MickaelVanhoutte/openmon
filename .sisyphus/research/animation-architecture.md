# Animation Engine Architecture Design

## Overview

This document defines the architecture for the new Pokemon-style animation engine, inspired by Pokemon Showdown's battle-tested system but adapted to use GSAP instead of jQuery.

## Design Principles

1. **Container-Relative Positioning**: All coordinates are relative to the `.wrapper` container element, not the viewport
2. **No Magic Numbers**: Offsets and positions are calculated or configurable
3. **Async/Non-Blocking**: All animations return Promises, never block the main thread
4. **Effect Pooling**: Reuse DOM elements for effects to reduce garbage collection
5. **Extensibility**: Easy to add new move animations without modifying core engine

---

## TypeScript Interfaces

### Position & Coordinate Types

```typescript
/**
 * Represents a position in the battle scene.
 * x/y are percentages (0-100) within the container.
 * z represents depth for pseudo-3D effects (0 = front, higher = back).
 */
interface Position {
	x: number; // Percentage (0-100) from left
	y: number; // Percentage (0-100) from top
	z: number; // Depth layer (0 = front, 200 = opponent side)
	scale: number; // Visual scale (affected by z-depth)
	opacity: number; // 0-1
}

/**
 * Partial position for animation targets (only specify what changes).
 */
type PositionDelta = Partial<Position>;

/**
 * Screen coordinates (pixels) for GSAP animations.
 */
interface ScreenCoords {
	left: number;
	top: number;
	width: number;
	height: number;
	opacity: number;
}
```

### Battle Scene Types

```typescript
/**
 * Identifies a Pokemon slot in battle.
 * Uses index-based system matching existing playerSide[]/oppSide[] arrays.
 */
interface BattleSlot {
	side: 'player' | 'opponent';
	index: number; // 0 for single battle, 0-1 for double battle
}

/**
 * Pokemon sprite reference for animations.
 */
interface PokemonSprite {
	slot: BattleSlot;
	element: HTMLElement;
	homePosition: Position; // Where Pokemon returns after attacks
}

/**
 * Battle layout configuration.
 */
interface BattleLayout {
	containerWidth: number;
	containerHeight: number;
	battleType: 'SINGLE' | 'DOUBLE';
	slots: Map<string, Position>; // "player-0", "opponent-1", etc.
}
```

### Animation Configuration Types

```typescript
/**
 * Easing function identifiers.
 * These create the "Pokemon feel" with ballistic arcs and weight.
 */
type EasingType =
	| 'linear' // Constant speed
	| 'ballistic' // Parabolic arc (jump)
	| 'ballistic2' // Double parabola (attack + return)
	| 'quadUp' // Deceleration (sqrt curve)
	| 'quadDown' // Acceleration (square curve)
	| 'swing' // Oscillating settle (knockback recovery)
	| 'accel' // Simple acceleration
	| 'decel'; // Simple deceleration

/**
 * Effect sprite configuration.
 */
interface EffectConfig {
	sprite: string; // Effect sprite name (e.g., 'fire', 'impact')
	frames: number; // Number of animation frames
	frameWidth: number; // Width of single frame in pixels
	frameHeight: number; // Height of single frame in pixels
	fps?: number; // Frames per second (default: 24)
	loop?: boolean; // Whether to loop animation
	tint?: string; // CSS filter hue-rotate value for type coloring
}

/**
 * Configuration for a move animation.
 */
interface MoveAnimationConfig {
	type: AnimationType;
	effect: string; // Primary effect sprite
	secondaryEffect?: string; // Additional effect (e.g., explosion on impact)
	duration?: number; // Override default duration (ms)
	sound?: string; // Sound effect ID
	screenShake?: number; // Shake intensity (0-10)
	backgroundFlash?: string; // CSS color for screen flash
}

/**
 * Animation type categories (evolved from current 7 types).
 */
type AnimationType =
	| 'dash' // Attacker moves to target, hits, returns
	| 'projectile' // Effect travels from attacker to target
	| 'beam' // Continuous beam connects attacker to target
	| 'onTarget' // Effect appears on target only
	| 'onSelf' // Effect appears on attacker only
	| 'spread' // Effect hits multiple targets
	| 'field' // Effect covers the entire field
	| 'transform'; // Special transformation animations
```

### Move Animation Definition

```typescript
/**
 * A move animation is a function that receives the engine and battle context.
 * It sequences effects using the engine's methods and returns when complete.
 */
type MoveAnimation = (
	engine: AnimationEngine,
	context: {
		attacker: PokemonSprite;
		defender: PokemonSprite | PokemonSprite[]; // Array for spread moves
		move: MoveData;
	}
) => Promise<void>;

/**
 * Registry of all move animations indexed by move name.
 */
type MoveAnimationRegistry = Map<string, MoveAnimation>;
```

---

## Coordinate System

### Container-Relative Design

```
┌─────────────────────────────────────────────────┐
│                  .wrapper                        │
│                                                  │
│    ┌─────────┐              ┌─────────┐         │
│    │ OPP-0   │              │ OPP-1   │   z=200 │
│    │(60,20)  │              │(80,25)  │         │
│    └─────────┘              └─────────┘         │
│                                                  │
│                                                  │
│    ┌─────────┐              ┌─────────┐         │
│    │PLAYER-0 │              │PLAYER-1 │   z=0   │
│    │(20,70)  │              │(40,75)  │         │
│    └─────────┘              └─────────┘         │
│                                                  │
└─────────────────────────────────────────────────┘
     x=0                                    x=100
```

### Default Slot Positions

```typescript
const SINGLE_BATTLE_SLOTS: Record<string, Position> = {
	'player-0': { x: 25, y: 70, z: 0, scale: 1.0, opacity: 1 },
	'opponent-0': { x: 75, y: 25, z: 200, scale: 0.85, opacity: 1 }
};

const DOUBLE_BATTLE_SLOTS: Record<string, Position> = {
	'player-0': { x: 20, y: 70, z: 0, scale: 0.9, opacity: 1 },
	'player-1': { x: 40, y: 75, z: 10, scale: 0.9, opacity: 1 },
	'opponent-0': { x: 60, y: 20, z: 200, scale: 0.75, opacity: 1 },
	'opponent-1': { x: 80, y: 25, z: 210, scale: 0.75, opacity: 1 }
};
```

### Z-Depth to Scale Calculation

```typescript
/**
 * Calculate visual scale based on z-depth.
 * Objects further back (higher z) appear smaller.
 */
function calculateScaleFromZ(z: number, baseScale: number = 1): number {
	// z=0 → scale=1, z=200 → scale≈0.85
	const depthFactor = 1 - z / 500;
	return baseScale * Math.max(0.5, depthFactor);
}
```

### Position to Screen Coords

```typescript
/**
 * Convert percentage-based Position to pixel ScreenCoords.
 */
function toScreenCoords(
	pos: Position,
	container: { width: number; height: number },
	spriteSize: number
): ScreenCoords {
	const scaledSize = spriteSize * pos.scale;
	return {
		left: (pos.x / 100) * container.width - scaledSize / 2,
		top: (pos.y / 100) * container.height - scaledSize / 2,
		width: scaledSize,
		height: scaledSize,
		opacity: pos.opacity
	};
}
```

---

## Class Architecture

### AnimationEngine (Main Orchestrator)

```typescript
class AnimationEngine {
	private container: HTMLElement;
	private positionSystem: BattlePositionSystem;
	private effectPool: EffectPool;
	private moveRegistry: MoveAnimationRegistry;
	private activeTimelines: Set<gsap.core.Timeline>;

	constructor(container: HTMLElement) {
		this.container = container;
		this.positionSystem = new BattlePositionSystem(container);
		this.effectPool = new EffectPool();
		this.moveRegistry = loadAllMoveAnimations();
		this.activeTimelines = new Set();
	}

	// === Primary API ===

	async playMove(
		moveName: string,
		attacker: PokemonSprite,
		defender: PokemonSprite | PokemonSprite[]
	): Promise<void>;

	// === Effect Methods ===

	async showEffect(
		effectName: string,
		position: Position,
		config?: Partial<EffectConfig>
	): Promise<void>;

	async moveEffect(
		effectName: string,
		from: Position,
		to: Position,
		duration: number,
		easing: EasingType
	): Promise<void>;

	async beam(from: Position, to: Position, effectName: string, duration: number): Promise<void>;

	// === Sprite Methods ===

	async moveSprite(
		sprite: PokemonSprite,
		to: Position,
		duration: number,
		easing: EasingType
	): Promise<void>;

	async shake(sprite: PokemonSprite, intensity: number, duration: number): Promise<void>;

	async flash(sprite: PokemonSprite, color: string, duration: number): Promise<void>;

	// === Scene Methods ===

	async backgroundFlash(color: string, duration: number, opacity: number): Promise<void>;

	async screenShake(intensity: number, duration: number): Promise<void>;

	// === Utility Methods ===

	async wait(ms: number): Promise<void>;

	getPosition(slot: BattleSlot): Position;

	behind(position: Position, distance: number): Position;

	// === Cleanup ===

	cancelAll(): void;
}
```

### BattlePositionSystem

```typescript
class BattlePositionSystem {
	private container: HTMLElement;
	private layout: BattleLayout;

	constructor(container: HTMLElement) {
		this.container = container;
		this.updateBounds();
	}

	setLayout(battleType: 'SINGLE' | 'DOUBLE'): void;

	updateBounds(): void; // Call on resize

	getSlotPosition(slot: BattleSlot): Position;

	toScreenCoords(pos: Position): ScreenCoords;

	lerp(from: Position, to: Position, t: number): Position;

	behind(pos: Position, distance: number): Position;

	above(pos: Position, distance: number): Position;
}
```

### EffectPool

```typescript
class EffectPool {
	private pools: Map<string, HTMLImageElement[]>;
	private active: Set<HTMLImageElement>;
	private manifest: EffectManifest;
	private maxPoolSize: number = 20;

	constructor();

	async preload(effectNames: string[]): Promise<void>;

	acquire(effectName: string): HTMLImageElement;

	release(element: HTMLImageElement): void;

	clear(): void; // Called on battle end
}
```

### EasingRegistry

```typescript
// Register custom easing functions with GSAP
function registerCustomEasings(): void {
	// Ballistic arc - peaks at midpoint
	gsap.registerEase('ballistic', (progress: number) => {
		return 1 - Math.pow(2 * progress - 1, 2);
	});

	// Double ballistic - two arcs (attack + return)
	gsap.registerEase('ballistic2', (progress: number) => {
		if (progress < 0.5) {
			return 1 - Math.pow(4 * progress - 1, 2);
		}
		return 1 - Math.pow(4 * progress - 3, 2);
	});

	// Deceleration (sqrt curve)
	gsap.registerEase('quadUp', (progress: number) => {
		return Math.sqrt(progress);
	});

	// Acceleration (square curve)
	gsap.registerEase('quadDown', (progress: number) => {
		return progress * progress;
	});

	// Oscillating settle
	gsap.registerEase('swing', (progress: number) => {
		return 0.5 - Math.cos(progress * Math.PI) / 2;
	});
}
```

---

## Integration with Existing Code

### Battle.svelte Integration

```svelte
<script lang="ts">
	import { AnimationEngine } from '$js/battle/animations/animation-engine';

	let container: HTMLElement;
	let engine: AnimationEngine;

	onMount(() => {
		engine = new AnimationEngine(container);
	});

	// Subscribe to existing animateAttack store
	$: if ($battleCtx?.events?.animateAttack) {
		const unsub = battleCtx.events.animateAttack.subscribe(async (value) => {
			if (!value) return;

			const { attacker, defender, move } = value;

			// Get sprite elements from DOM
			const attackerSprite = getPokemonSprite(attacker);
			const defenderSprite = getPokemonSprite(defender);

			// Play animation via new engine
			await engine.playMove(move.name, attackerSprite, defenderSprite);

			// Signal completion
			battleCtx.events.animateAttack.set(undefined);
		});
	}
</script>

<div class="wrapper" bind:this={container}>
	<!-- Battle UI -->
</div>
```

### Fallback Animation Strategy

```typescript
function getMoveFallback(move: MoveData): MoveAnimation {
	// Determine fallback based on move category and type
	if (move.category === 'physical') {
		return FALLBACK_PHYSICAL; // dash + impact effect
	} else if (move.category === 'special') {
		return FALLBACK_SPECIAL; // projectile + explosion
	} else {
		return FALLBACK_STATUS; // self sparkle + stat arrows
	}
}

const FALLBACK_PHYSICAL: MoveAnimation = async (engine, ctx) => {
	const { attacker, defender } = ctx;
	const defenderPos = engine.getPosition(defender.slot);

	// Dash to target
	await engine.moveSprite(attacker, engine.behind(defenderPos, -30), 300, 'ballistic');

	// Show impact
	await engine.showEffect('impact', defenderPos);
	await engine.shake(defender, 5, 100);

	// Return home
	await engine.moveSprite(attacker, attacker.homePosition, 400, 'ballistic');
};
```

---

## File Structure

```
src/js/battle/animations/
├── animation-engine.ts      # Main AnimationEngine class
├── position-system.ts       # BattlePositionSystem class
├── effect-pool.ts           # EffectPool class
├── effect-manifest.ts       # Effect sprite definitions
├── easing.ts                # Custom GSAP easing functions
├── types.ts                 # TypeScript interfaces
├── moves/
│   ├── index.ts             # Move registry aggregator
│   ├── physical.ts          # Physical move animations (~150)
│   ├── special.ts           # Special move animations (~170)
│   ├── status.ts            # Status move animations (~100)
│   └── other.ts             # Edge case animations
└── __tests__/               # Test files mirror this structure
```

---

## Migration Strategy

1. **Phase 1**: Create new engine alongside existing code
2. **Phase 2**: Wire new engine to `animateAttack` store with feature flag
3. **Phase 3**: Verify new engine works for all move types
4. **Phase 4**: Remove old animation code from `battle-animations.ts`

The old `battle-animations.ts` file (~1100 lines) will be fully replaced by the new modular architecture.
