import { Vector3, type PerspectiveCamera, type Camera } from 'three';
import type { BattleSlot } from './position-system';

/**
 * Screen-space battle slot position.
 * Sprites are positioned by unprojecting desired screen coordinates
 * through the camera, guaranteeing stable screen placement regardless
 * of camera angle, position, or FOV.
 */
export interface ScreenSlotPosition {
	/** Normalized Device Coordinate X: -1 (left) to 1 (right) */
	ndcX: number;
	/** Normalized Device Coordinate Y: -1 (bottom) to 1 (top) */
	ndcY: number;
	/** Distance from camera along the view ray (world units) */
	depth: number;
	/** Desired apparent height as a fraction of viewport height (0–1) */
	screenHeight: number;
}

type BattleType = 'SINGLE' | 'DOUBLE';

/**
 * Screen positions mirroring the 2D system (position-system.ts):
 *   2D player-0:   x:22%, y:80%  → NDC(-0.56, -0.60)
 *   2D opponent-0: x:75%, y:37%  → NDC( 0.50,  0.26)
 *
 * Ally at closer depth → appears larger + foreground.
 * Opponent at further depth → appears smaller + background.
 * Camera sway creates natural parallax between depths.
 */
const SINGLE_SLOTS_3D: Record<string, ScreenSlotPosition> = {
	'player-0': { ndcX: -0.38, ndcY: -0.60, depth: 3.5, screenHeight: 0.35 },
	'opponent-0': { ndcX: 0.40, ndcY: 0.26, depth: 4.5, screenHeight: 0.22 }
};

const DOUBLE_SLOTS_3D: Record<string, ScreenSlotPosition> = {
	'player-0': { ndcX: -0.56, ndcY: -0.60, depth: 3.5, screenHeight: 0.28 },
	'player-1': { ndcX: -0.30, ndcY: -0.70, depth: 3.2, screenHeight: 0.28 },
	'opponent-0': { ndcX: 0.20, ndcY: 0.26, depth: 5.5, screenHeight: 0.18 },
	'opponent-1': { ndcX: 0.84, ndcY: 0.26, depth: 5.5, screenHeight: 0.18 }
};

/** Base world-unit height for a reference (96px) sprite at scale=1 */
const WORLD_UNIT_SCALE = 0.8;

// Reusable vectors to avoid allocations in the per-frame loop
const _ndc = new Vector3();
const _dir = new Vector3();

export class BattlePositionSystem3D {
	private battleType: BattleType = 'SINGLE';

	setLayout(type: BattleType): void {
		this.battleType = type;
	}

	/**
	 * Compute the world position and scale for a battle slot by unprojecting
	 * the desired screen position through the camera.
	 *
	 * Call this every frame — positions track the moving camera automatically.
	 */
	computeWorldPosition(
		slot: BattleSlot,
		camera: PerspectiveCamera
	): { position: Vector3; scale: number } {
		const key = `${slot.side}-${slot.index}`;
		const slots = this.battleType === 'SINGLE' ? SINGLE_SLOTS_3D : DOUBLE_SLOTS_3D;
		const screenSlot = slots[key] ?? { ndcX: 0, ndcY: 0, depth: 4, screenHeight: 0.25 };

		// 1. Create NDC point and unproject to world space
		_ndc.set(screenSlot.ndcX, screenSlot.ndcY, -1);
		_ndc.unproject(camera);

		// 2. Build ray direction from camera through the NDC point
		_dir.copy(_ndc).sub(camera.position).normalize();

		// 3. Walk along ray to desired depth
		const worldPos = camera.position.clone().add(_dir.clone().multiplyScalar(screenSlot.depth));

		// 4. Compute scale so sprite fills the desired screen height fraction
		const vFov = (camera.fov * Math.PI) / 180;
		const viewportWorldHeight = 2 * screenSlot.depth * Math.tan(vFov / 2);
		const targetWorldHeight = screenSlot.screenHeight * viewportWorldHeight;
		const scale = targetWorldHeight / WORLD_UNIT_SCALE;

		return { position: worldPos, scale };
	}

	/**
	 * Get the screen slot definition for a given battle slot.
	 * Useful for reading depth/screenHeight values externally.
	 */
	getScreenSlot(slot: BattleSlot): ScreenSlotPosition {
		const key = `${slot.side}-${slot.index}`;
		const slots = this.battleType === 'SINGLE' ? SINGLE_SLOTS_3D : DOUBLE_SLOTS_3D;
		return slots[key] ?? { ndcX: 0, ndcY: 0, depth: 4, screenHeight: 0.25 };
	}

	/**
	 * Project a 3D world position to screen coordinates.
	 * Returns {x, y} in pixels from top-left of viewport.
	 */
	projectToScreen(worldPos: Vector3, camera: Camera): { x: number; y: number } {
		const projected = worldPos.clone().project(camera);
		return {
			x: (projected.x * 0.5 + 0.5) * window.innerWidth,
			y: (-projected.y * 0.5 + 0.5) * window.innerHeight
		};
	}
}
