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

export async function animateEntry(element: HTMLElement, _isAlly: boolean): Promise<void> {
	if (!element) return;
	gsap.set(element, { opacity: 0, scale: 0.5 });
	await gsap.to(element, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out' });
}

export async function animateFaint(element: HTMLElement): Promise<void> {
	if (!element) return;
	await gsap.to(element, { opacity: 0, y: 50, duration: 0.5, ease: 'power2.in' });
	gsap.set(element, { y: 0 });
}

export async function animateRun(element: HTMLElement): Promise<void> {
	if (!element) return;
	await gsap.to(element, { x: -200, opacity: 0, duration: 0.4, ease: 'power2.in' });
	gsap.set(element, { x: 0, opacity: 1 });
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

export { AnimationEngine } from './animation-engine';
export { BattlePositionSystem } from './position-system';
export { EffectPool } from './effect-pool';
export { registerCustomEasings } from './easing';
export { registerAllMoves, getMoveCount, getAllMoveNames } from './moves';
