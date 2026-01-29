import gsap from 'gsap';
import {
	BattlePositionSystem,
	type Position,
	type ScreenCoords,
	type BattleSlot
} from './position-system';
import { EffectPool } from './effect-pool';
import { EFFECT_MANIFEST } from './effect-manifest';
import { registerCustomEasings, type EasingType } from './easing';

export interface PokemonSprite {
	slot: BattleSlot;
	element: HTMLElement;
	homePosition: Position;
}

export interface EffectOptions {
	scale?: number;
	opacity?: number;
	duration?: number;
	tint?: string;
}

export interface MoveContext {
	attacker: PokemonSprite;
	defender: PokemonSprite | PokemonSprite[];
	moveName: string;
	moveCategory: 'physical' | 'special' | 'status';
	moveType: string;
}

export type MoveAnimation = (engine: AnimationEngine, context: MoveContext) => Promise<void>;

export class AnimationEngine {
	private container: HTMLElement;
	private positionSystem: BattlePositionSystem;
	private effectPool: EffectPool;
	private moveRegistry: Map<string, MoveAnimation> = new Map();
	private activeTimelines: Set<gsap.core.Timeline> = new Set();
	private initialized: boolean = false;

	constructor(container: HTMLElement) {
		this.container = container;
		this.positionSystem = new BattlePositionSystem();
		this.effectPool = new EffectPool();
	}

	initialize(): void {
		if (this.initialized) return;

		const rect = this.container.getBoundingClientRect();
		this.positionSystem.setContainerBounds(rect.width, rect.height);
		registerCustomEasings();
		this.initialized = true;
	}

	setLayout(battleType: 'SINGLE' | 'DOUBLE'): void {
		this.positionSystem.setLayout(battleType);
	}

	registerMove(moveName: string, animation: MoveAnimation): void {
		this.moveRegistry.set(moveName.toLowerCase(), animation);
	}

	async playMove(context: MoveContext): Promise<void> {
		if (!this.initialized) this.initialize();

		const animation = this.moveRegistry.get(context.moveName.toLowerCase());

		if (animation) {
			await animation(this, context);
		} else {
			await this.playFallbackAnimation(context);
		}
	}

	private async playFallbackAnimation(context: MoveContext): Promise<void> {
		const { attacker, defender, moveCategory } = context;
		const target = Array.isArray(defender) ? defender[0] : defender;

		switch (moveCategory) {
			case 'physical':
				await this.dashAttack(attacker, target);
				break;
			case 'special':
				await this.projectileAttack(attacker, target, 'fire');
				break;
			case 'status':
				await this.statusEffect(attacker);
				break;
		}
	}

	private async dashAttack(attacker: PokemonSprite, defender: PokemonSprite): Promise<void> {
		// Calculate relative movement using transforms (x/y) not absolute positioning
		const attackerRect = attacker.element.getBoundingClientRect();
		const defenderRect = defender.element.getBoundingClientRect();

		// Calculate how far to move toward the defender
		const deltaX = defenderRect.left - attackerRect.left;
		const deltaY = defenderRect.top - attackerRect.top;

		// Stop 30px short of the defender
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const stopDistance = Math.max(0, distance - 30);
		const ratio = distance > 0 ? stopDistance / distance : 0;

		const moveX = deltaX * ratio;
		const moveY = deltaY * ratio;

		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		timeline
			.to(attacker.element, {
				x: moveX,
				y: moveY,
				duration: 0.2,
				ease: 'power2.in'
			})
			.add(() => this.shake(defender.element, 8, 150))
			.to(attacker.element, {
				x: 0,
				y: 0,
				duration: 0.3,
				ease: 'power2.out'
			});

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
	}

	private async projectileAttack(
		attacker: PokemonSprite,
		defender: PokemonSprite,
		_effectName: string
	): Promise<void> {
		await this.flashElement(defender.element, '#ff6600', 150);
		await this.shake(defender.element, 6, 150);
	}

	private async statusEffect(pokemon: PokemonSprite): Promise<void> {
		await this.flashElement(pokemon.element, '#00ff88', 300);
		await this.shake(pokemon.element, 3, 200);
	}

	private async flashElement(element: HTMLElement, color: string, duration: number): Promise<void> {
		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		timeline
			.to(element, {
				filter: `brightness(2) drop-shadow(0 0 10px ${color})`,
				duration: duration / 2000
			})
			.to(element, {
				filter: 'brightness(1) drop-shadow(0 0 0 transparent)',
				duration: duration / 2000
			});

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
	}

	async showEffectAt(
		effectName: string,
		position: Position,
		options: EffectOptions = {}
	): Promise<void> {
		const element = this.effectPool.acquire(effectName);
		if (!element) return;

		const definition = EFFECT_MANIFEST[effectName];
		if (!definition) {
			this.effectPool.release(element);
			return;
		}

		const coords = this.positionSystem.toScreenCoords(position, definition.frameWidth);
		const duration = options.duration || 300;
		const fps = definition.fps || 24;
		const frameTime = 1000 / fps;

		element.style.display = 'block';
		element.style.left = `${coords.left}px`;
		element.style.top = `${coords.top}px`;
		element.style.opacity = String(options.opacity ?? 1);
		element.style.transform = `scale(${options.scale ?? 1})`;

		this.container.appendChild(element);

		await this.animateSpriteSheet(element, definition.frames, frameTime, duration);

		this.effectPool.release(element);
	}

	async moveEffect(
		effectName: string,
		from: Position,
		to: Position,
		duration: number,
		easing: EasingType = 'linear'
	): Promise<void> {
		const element = this.effectPool.acquire(effectName);
		if (!element) return;

		const definition = EFFECT_MANIFEST[effectName];
		if (!definition) {
			this.effectPool.release(element);
			return;
		}

		const fromCoords = this.positionSystem.toScreenCoords(from, definition.frameWidth);
		const toCoords = this.positionSystem.toScreenCoords(to, definition.frameWidth);

		element.style.display = 'block';
		element.style.left = `${fromCoords.left}px`;
		element.style.top = `${fromCoords.top}px`;
		this.container.appendChild(element);

		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		timeline.to(element, {
			left: toCoords.left,
			top: toCoords.top,
			duration: duration / 1000,
			ease: easing
		});

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
		this.effectPool.release(element);
	}

	async shake(element: HTMLElement, intensity: number, duration: number): Promise<void> {
		const originalTransform = element.style.transform;
		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		const shakeCount = Math.floor(duration / 50);
		for (let i = 0; i < shakeCount; i++) {
			const xOffset = (Math.random() - 0.5) * intensity * 2;
			const yOffset = (Math.random() - 0.5) * intensity * 2;
			timeline.to(element, {
				x: xOffset,
				y: yOffset,
				duration: 0.05
			});
		}

		timeline.to(element, {
			x: 0,
			y: 0,
			duration: 0.05
		});

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
		element.style.transform = originalTransform;
	}

	async backgroundFlash(color: string, duration: number, opacity: number = 0.5): Promise<void> {
		const overlay = document.createElement('div');
		overlay.style.cssText = `
			position: absolute;
			inset: 0;
			background-color: ${color};
			opacity: 0;
			pointer-events: none;
			z-index: 1000;
		`;
		this.container.appendChild(overlay);

		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		timeline
			.to(overlay, { opacity, duration: duration / 2000 })
			.to(overlay, { opacity: 0, duration: duration / 2000 });

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
		overlay.remove();
	}

	async screenShake(intensity: number, duration: number): Promise<void> {
		await this.shake(this.container, intensity, duration);
	}

	async wait(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	getPosition(slot: BattleSlot): Position {
		return this.positionSystem.getSlotPosition(slot);
	}

	behind(position: Position, distance: number): Position {
		return this.positionSystem.behind(position, distance);
	}

	above(position: Position, distance: number): Position {
		return this.positionSystem.above(position, distance);
	}

	cancelAll(): void {
		this.activeTimelines.forEach((timeline) => timeline.kill());
		this.activeTimelines.clear();
		this.effectPool.clear();
	}

	private async animateSpriteSheet(
		element: HTMLElement,
		frames: number,
		frameTime: number,
		totalDuration: number
	): Promise<void> {
		return new Promise((resolve) => {
			let currentFrame = 0;
			const frameWidth = parseInt(element.style.width) || 192;
			const endTime = Date.now() + totalDuration;

			const animate = () => {
				if (Date.now() >= endTime) {
					resolve();
					return;
				}

				element.style.backgroundPosition = `-${currentFrame * frameWidth}px 0`;
				currentFrame = (currentFrame + 1) % frames;

				setTimeout(animate, frameTime);
			};

			animate();
		});
	}
}
