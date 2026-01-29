import { type AnimationEngine } from '../animation-engine';
import { physicalMoves, registerPhysicalMoves } from './physical';
import { specialMoves, registerSpecialMoves } from './special';
import { statusMoves, registerStatusMoves } from './status';
import { otherMoves, registerOtherMoves } from './other';

export function registerAllMoves(engine: AnimationEngine): void {
	registerPhysicalMoves(engine);
	registerSpecialMoves(engine);
	registerStatusMoves(engine);
	registerOtherMoves(engine);
}

export function getMoveCount(): number {
	return (
		Object.keys(physicalMoves).length +
		Object.keys(specialMoves).length +
		Object.keys(statusMoves).length +
		Object.keys(otherMoves).length
	);
}

export function getAllMoveNames(): string[] {
	return [
		...Object.keys(physicalMoves),
		...Object.keys(specialMoves),
		...Object.keys(statusMoves),
		...Object.keys(otherMoves)
	];
}

export { physicalMoves } from './physical';
export { specialMoves } from './special';
export { statusMoves } from './status';
export { otherMoves } from './other';
