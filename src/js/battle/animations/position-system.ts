export interface Position {
	x: number;
	y: number;
	z: number;
	scale: number;
	opacity: number;
}

export interface ScreenCoords {
	left: number;
	top: number;
	width: number;
	height: number;
	opacity: number;
}

export interface BattleSlot {
	side: 'player' | 'opponent';
	index: number;
}

type BattleType = 'SINGLE' | 'DOUBLE';

const SINGLE_BATTLE_SLOTS: Record<string, Position> = {
	'player-0': { x: 22, y: 70, z: 0, scale: 1.0, opacity: 1 },
	'opponent-0': { x: 75, y: 25, z: 200, scale: 0.85, opacity: 1 }
};

const DOUBLE_BATTLE_SLOTS: Record<string, Position> = {
	'player-0': { x: 22, y: 70, z: 0, scale: 0.9, opacity: 1 },
	'player-1': { x: 35, y: 75, z: 10, scale: 0.9, opacity: 1 },
	'opponent-0': { x: 60, y: 20, z: 200, scale: 0.75, opacity: 1 },
	'opponent-1': { x: 85, y: 25, z: 210, scale: 0.75, opacity: 1 }
};

export class BattlePositionSystem {
	private containerWidth: number = 800;
	private containerHeight: number = 600;
	private battleType: BattleType = 'SINGLE';

	setContainerBounds(width: number, height: number): void {
		this.containerWidth = width;
		this.containerHeight = height;
	}

	setLayout(battleType: BattleType): void {
		this.battleType = battleType;
	}

	getSlotPosition(slot: BattleSlot): Position {
		const key = `${slot.side}-${slot.index}`;
		const slots = this.battleType === 'SINGLE' ? SINGLE_BATTLE_SLOTS : DOUBLE_BATTLE_SLOTS;
		const position = slots[key];

		if (!position) {
			return { x: 50, y: 50, z: 100, scale: 1, opacity: 1 };
		}

		return { ...position };
	}

	toScreenCoords(pos: Position, spriteSize: number): ScreenCoords {
		const scaledSize = spriteSize * pos.scale;
		return {
			left: (pos.x / 100) * this.containerWidth - scaledSize / 2,
			top: (pos.y / 100) * this.containerHeight - scaledSize / 2,
			width: scaledSize,
			height: scaledSize,
			opacity: pos.opacity
		};
	}

	lerp(from: Position, to: Position, t: number): Position {
		const clampedT = Math.max(0, Math.min(1, t));
		return {
			x: from.x + (to.x - from.x) * clampedT,
			y: from.y + (to.y - from.y) * clampedT,
			z: from.z + (to.z - from.z) * clampedT,
			scale: from.scale + (to.scale - from.scale) * clampedT,
			opacity: from.opacity + (to.opacity - from.opacity) * clampedT
		};
	}

	behind(pos: Position, distance: number): Position {
		return {
			...pos,
			z: pos.z + distance
		};
	}

	above(pos: Position, distance: number): Position {
		return {
			...pos,
			y: pos.y - distance
		};
	}

	getContainerBounds(): { width: number; height: number } {
		return { width: this.containerWidth, height: this.containerHeight };
	}
}
