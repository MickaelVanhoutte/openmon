import { AnimationEngine, type MoveContext, type PokemonSprite } from './animation-engine';
import { registerAllMoves } from './moves';
import gsap from 'gsap';
import pokeballImage from '../../../assets/menus/pokeball.png';

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
	target: HTMLImageElement,
	source: 'ally' | 'opponent',
	idx: number = 0,
	partner: boolean = false,
	_double: boolean = false,
	isWild: boolean = false
): Promise<gsap.core.Timeline> {
	const timeline = gsap.timeline();

	if (isWild) {
		gsap.set(target, {
			scale: 1,
			filter: 'brightness(0)',
			opacity: 1
		});

		const staggerDelay = partner ? 0 : idx * 0.3;

		timeline.to(
			target,
			{
				duration: 1.5,
				delay: staggerDelay,
				filter: 'brightness(1)',
				ease: 'power2.inOut'
			},
			0
		);

		return new Promise((resolve) => {
			timeline.eventCallback('onComplete', () => {
				gsap.set(target, {
					scale: 1,
					filter: 'brightness(1)',
					opacity: 1,
					clearProps: 'filter'
				});
				resolve(timeline);
			});
		});
	}

	const targetRect = target.getBoundingClientRect();
	const targetCenterX = targetRect.left + targetRect.width / 2;
	const targetCenterY = targetRect.top + targetRect.height / 2;

	const isAlly = source === 'ally';
	const startX = isAlly ? -50 : window.innerWidth + 50;
	const startY = window.innerHeight * (isAlly ? 0.7 : 0.3);

	const pokeball = document.createElement('img');
	pokeball.src = pokeballImage;
	pokeball.style.cssText = `
		position: fixed;
		width: 40px;
		height: 40px;
		z-index: 100;
		pointer-events: none;
		image-rendering: pixelated;
		left: ${startX}px;
		top: ${startY}px;
		transform-origin: center center;
	`;
	document.body.appendChild(pokeball);

	gsap.set(target, {
		scale: 0,
		filter: 'brightness(10)',
		opacity: 0
	});

	const endX = targetCenterX - 20;
	const endY = targetCenterY;
	const arcHeight = Math.min(150, Math.abs(endX - startX) * 0.3);
	const controlY = Math.min(startY, endY) - arcHeight;

	const staggerDelay = partner ? 0 : idx * 0.3;

	const arcProgress = { t: 0 };
	timeline
		.to(
			arcProgress,
			{
				t: 1,
				duration: 0.6,
				delay: staggerDelay,
				ease: 'power1.out',
				onUpdate: () => {
					const t = arcProgress.t;
					const x =
						(1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + endX) / 2) + t * t * endX;
					const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
					pokeball.style.left = `${x}px`;
					pokeball.style.top = `${y}px`;
					pokeball.style.transform = `rotate(${t * (isAlly ? 720 : -720)}deg)`;
				}
			},
			0
		)
		.to(
			pokeball,
			{
				duration: 0.15,
				scale: 1.5,
				filter: 'brightness(3)',
				ease: 'power2.out'
			},
			'>-0.1'
		)
		.to(
			pokeball,
			{
				duration: 0.2,
				scale: 0,
				opacity: 0,
				ease: 'power2.in',
				onComplete: () => {
					pokeball.remove();
				}
			},
			'>'
		)
		.to(
			target,
			{
				duration: 0.1,
				opacity: 1,
				scale: 0.1
			},
			'<-0.15'
		)
		.to(
			target,
			{
				duration: 0.4,
				scale: 1,
				ease: 'back.out(1.4)'
			},
			'>'
		)
		.to(
			target,
			{
				duration: 0.3,
				filter: 'brightness(1)',
				ease: 'power2.out'
			},
			'<+0.1'
		);

	return new Promise((resolve) => {
		timeline.eventCallback('onComplete', () => {
			gsap.set(target, {
				scale: 1,
				filter: 'brightness(1)',
				opacity: 1,
				clearProps: 'filter'
			});
			resolve(timeline);
		});
	});
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
	source: 'ally' | 'opponent',
	idx: number = 0,
	container?: HTMLElement
): gsap.core.Timeline {
	const timeline = gsap.timeline();

	timeline
		.to(target, {
			filter: 'brightness(5)',
			scale: 0.1,
			transformOrigin: 'center center',
			duration: 0.8,
			delay: 0.3
		})
		.to(
			target,
			{
				x: source === 'ally' ? -window.innerWidth / 2 : window.innerWidth / 2,
				duration: 1,
				delay: 0
			},
			'>'
		);

	if (container) {
		const shadow = container.querySelector(`.${source}-shadow[data-idx="${idx}"]`) as HTMLElement;
		if (shadow) {
			timeline.to(
				shadow,
				{
					opacity: 0,
					duration: 0.8
				},
				0.3
			);
		}

		const parentContainer = container.parentElement || container;
		const hpBars = parentContainer.querySelectorAll(`[data-testid="${source}-pokemon-info"]`);
		if (hpBars[idx]) {
			timeline.to(
				hpBars[idx],
				{
					opacity: 0,
					duration: 0.8
				},
				0.3
			);
		}
	}

	return timeline.play();
}

export function animateSwitchOut(
	target: HTMLImageElement,
	source: 'ally' | 'opponent',
	idx: number = 0,
	container?: HTMLElement
): Promise<void> {
	const timeline = gsap.timeline();

	// Get pokemon position before any transforms
	const targetRect = target.getBoundingClientRect();
	const pokemonCenterX = targetRect.left + targetRect.width / 2;
	const pokemonCenterY = targetRect.top + targetRect.height / 2;

	// Trainer edge (same as animateEntry start positions)
	const isAlly = source === 'ally';
	const trainerX = isAlly ? -50 : window.innerWidth + 50;
	const trainerY = window.innerHeight * (isAlly ? 0.7 : 0.3);

	// Step 1: Pokemon shrinks + brightens into recall (0.4s)
	timeline.to(target, {
		filter: 'brightness(5)',
		scale: 0.1,
		transformOrigin: 'center center',
		duration: 0.4,
		ease: 'power2.in'
	});

	// Step 2: Pokemon disappears (0.1s)
	timeline.to(
		target,
		{
			opacity: 0,
			duration: 0.1
		},
		'>'
	);

	// Step 3: Create pokeball at pokemon position
	const pokeball = document.createElement('img');
	pokeball.src = pokeballImage;
	pokeball.style.cssText = `
		position: fixed;
		width: 40px;
		height: 40px;
		z-index: 100;
		pointer-events: none;
		image-rendering: pixelated;
		left: ${pokemonCenterX - 20}px;
		top: ${pokemonCenterY}px;
		transform-origin: center center;
		transform: scale(0);
		opacity: 0;
	`;

	// Add pokeball to DOM when Step 2 starts
	timeline.call(
		() => {
			document.body.appendChild(pokeball);
		},
		[],
		'<'
	);

	// Step 4: Pokeball appears with flash (0.15s)
	timeline.to(
		pokeball,
		{
			scale: 1,
			opacity: 1,
			filter: 'brightness(3)',
			duration: 0.15,
			ease: 'power2.out'
		},
		'>'
	);

	timeline.to(
		pokeball,
		{
			filter: 'brightness(1)',
			duration: 0.1,
			ease: 'power2.out'
		},
		'>'
	);

	// Step 5: Pokeball arcs back to trainer edge (0.6s) — reverse of entry
	const startX = pokemonCenterX - 20;
	const startY = pokemonCenterY;
	const endX = trainerX;
	const endY = trainerY;
	const arcHeight = Math.min(150, Math.abs(endX - startX) * 0.3);
	const controlY = Math.min(startY, endY) - arcHeight;

	const arcProgress = { t: 0 };
	timeline.to(
		arcProgress,
		{
			t: 1,
			duration: 0.6,
			ease: 'power1.in',
			onUpdate: () => {
				const t = arcProgress.t;
				const x =
					(1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + endX) / 2) + t * t * endX;
				const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
				pokeball.style.left = `${x}px`;
				pokeball.style.top = `${y}px`;
				pokeball.style.transform = `rotate(${t * (isAlly ? -720 : 720)}deg)`;
			},
			onComplete: () => {
				pokeball.remove();
			}
		},
		'>'
	);

	// Shadow and HP bar fade (in parallel with the whole sequence)
	if (container) {
		const shadow = container.querySelector(`.${source}-shadow[data-idx="${idx}"]`) as HTMLElement;
		if (shadow) {
			timeline.to(
				shadow,
				{
					opacity: 0,
					duration: 0.6
				},
				0
			);
		}

		const parentContainer = container.parentElement || container;
		const hpBars = parentContainer.querySelectorAll(`[data-testid="${source}-pokemon-info"]`);
		if (hpBars[idx]) {
			timeline.to(
				hpBars[idx],
				{
					opacity: 0,
					duration: 0.6
				},
				0
			);
		}
	}

	return new Promise((resolve) => {
		timeline.eventCallback('onComplete', () => {
			resolve();
		});
		timeline.play();
	});
}

export interface LegacyAnimateAttackParams {
	initiator: HTMLElement;
	target: HTMLElement;
	initiatorSlot: { side: 'player' | 'opponent'; index: number };
	targetSlot: { side: 'player' | 'opponent'; index: number };
	moveName: string;
	moveCategory: 'physical' | 'special' | 'status';
	moveType: string;
	hitCount?: number;
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
		moveType: params.moveType,
		hitCount: params.hitCount
	};

	await engineInstance.playMove(context);
}

export { AnimationEngine, TYPE_COLORS } from './animation-engine';
export { BattlePositionSystem } from './position-system';
export { EffectPool } from './effect-pool';
export { registerCustomEasings } from './easing';
export { registerAllMoves, getMoveCount, getAllMoveNames } from './moves';
