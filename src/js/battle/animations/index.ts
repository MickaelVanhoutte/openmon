import { AnimationEngine, type MoveContext, type PokemonSprite } from './animation-engine';
import { registerAllMoves } from './moves';
import gsap from 'gsap';

let engineInstance: AnimationEngine | null = null;

export function initializeAnimationEngine(container: HTMLElement): AnimationEngine {
	if (engineInstance) {
		engineInstance.cancelAll();
	}

	engineInstance = new AnimationEngine(container);
	registerAllMoves(engineInstance);
	engineInstance.initialize();

	return engineInstance;
}

export function getAnimationEngine(): AnimationEngine | null {
	return engineInstance;
}

export function destroyAnimationEngine(): void {
	if (engineInstance) {
		engineInstance.cancelAll();
		engineInstance = null;
	}
}

export function animateEntry(
	_target: HTMLImageElement,
	_source: 'ally' | 'opponent',
	_idx: number = 0,
	_partner: boolean = false,
	_double: boolean = false
): gsap.core.Timeline {
	return gsap.timeline();
}

export function animateFaint(target: HTMLImageElement): gsap.core.Timeline {
	return gsap
		.timeline()
		.to(target, {
			filter: 'brightness(0)',
			y: window.innerHeight,
			duration: 1,
			delay: 2
		})
		.play();
}

export function animateRun(
	target: HTMLImageElement,
	source: 'ally' | 'opponent'
): gsap.core.Timeline {
	return gsap
		.timeline()
		.to(target, {
			filter: 'brightness(5)',
			transform: 'scale(.1)',
			duration: 0.8,
			delay: 0.3
		})
		.to(target, {
			x: source === 'ally' ? -window.innerWidth / 2 : window.innerWidth / 2,
			duration: 1,
			delay: 0
		})
		.play();
}

export interface LegacyAnimateAttackParams {
	initiator: HTMLElement;
	target: HTMLElement;
	initiatorSlot: { side: 'player' | 'opponent'; index: number };
	targetSlot: { side: 'player' | 'opponent'; index: number };
	moveName: string;
	moveCategory: 'physical' | 'special' | 'status';
	moveType: string;
}

export async function animateAttackWithNewEngine(params: LegacyAnimateAttackParams): Promise<void> {
	if (!engineInstance) {
		console.warn('Animation engine not initialized');
		return;
	}

	const attackerSprite: PokemonSprite = {
		slot: params.initiatorSlot,
		element: params.initiator,
		homePosition: engineInstance.getPosition(params.initiatorSlot)
	};

	const defenderSprite: PokemonSprite = {
		slot: params.targetSlot,
		element: params.target,
		homePosition: engineInstance.getPosition(params.targetSlot)
	};

	const context: MoveContext = {
		attacker: attackerSprite,
		defender: defenderSprite,
		moveName: params.moveName,
		moveCategory: params.moveCategory,
		moveType: params.moveType
	};

	await engineInstance.playMove(context);
}

export { AnimationEngine, TYPE_COLORS } from './animation-engine';
export { BattlePositionSystem } from './position-system';
export { EffectPool } from './effect-pool';
export { registerCustomEasings } from './easing';
export { registerAllMoves, getMoveCount, getAllMoveNames } from './moves';
