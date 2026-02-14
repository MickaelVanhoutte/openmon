import gsap from 'gsap';
import { BattlePositionSystem, type Position, type BattleSlot } from './position-system';
import { EffectPool } from './effect-pool';
import { EFFECT_MANIFEST } from './effect-manifest';
import { registerCustomEasings, type EasingType } from './easing';

/**
 * Type color mapping for move type-based visual effects.
 * Used with CSS hue-rotate filter for type-colored animations.
 */
export const TYPE_COLORS: Record<string, string> = {
	normal: '#A8A878',
	fire: '#F08030',
	water: '#6890F0',
	electric: '#F8D030',
	grass: '#78C850',
	ice: '#98D8D8',
	fighting: '#C03028',
	poison: '#A040A0',
	ground: '#E0C068',
	flying: '#A890F0',
	psychic: '#F85888',
	bug: '#A8B820',
	rock: '#B8A038',
	ghost: '#705898',
	dragon: '#7038F8',
	dark: '#705848',
	steel: '#B8B8D0',
	fairy: '#EE99AC'
};

/**
 * Type to hue-rotate angle mapping for CSS filter-based coloring.
 */
export const TYPE_HUE_ANGLES: Record<string, number> = {
	normal: 0,
	fire: 0,
	water: 200,
	electric: 50,
	grass: 90,
	ice: 180,
	fighting: -20,
	poison: 280,
	ground: 30,
	flying: 250,
	psychic: 320,
	bug: 70,
	rock: 35,
	ghost: 260,
	dragon: 270,
	dark: 0,
	steel: 220,
	fairy: 330
};

export interface SpriteEffectOptions {
	scale?: number;
	opacity?: number;
	duration?: number;
	tint?: string;
	hueRotate?: number;
	zIndex?: number;
	onComplete?: () => void;
}

export interface MoveSpriteOptions {
	duration?: number;
	easing?: EasingType;
	overshoot?: number;
	returnDuration?: number;
	returnEasing?: EasingType;
}

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
	hitCount?: number;
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
		if (this.initialized) {
			return;
		}

		const rect = this.container.getBoundingClientRect();
		this.positionSystem.setContainerBounds(rect.width, rect.height);
		registerCustomEasings();
		this.initialized = true;
	}

	setLayout(battleType: 'SINGLE' | 'DOUBLE'): void {
		this.positionSystem.setLayout(battleType);
	}

	getEffectZIndex(attackerSlot: BattleSlot): number {
		const isAllyAttacking = attackerSlot.side === 'player';
		const ABOVE_OPPONENT_SPRITES = 200;
		const BELOW_ALLY_SPRITES = 4;
		return isAllyAttacking ? ABOVE_OPPONENT_SPRITES : BELOW_ALLY_SPRITES;
	}

	registerMove(moveName: string, animation: MoveAnimation): void {
		this.moveRegistry.set(moveName.toLowerCase(), animation);
	}

	async playMove(context: MoveContext): Promise<void> {
		if (!this.initialized) {
			this.initialize();
		}

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
		const attackerRect = attacker.element.getBoundingClientRect();
		const defenderRect = defender.element.getBoundingClientRect();

		const deltaX = defenderRect.left - attackerRect.left;
		const deltaY = defenderRect.top - attackerRect.top;

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
		this.resetSpriteToHome(attacker);
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
		if (!element) {
			return;
		}

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
		if (!element) {
			return;
		}

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
		gsap.set(element, { clearProps: 'x,y' });
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

	async showSpriteEffect(
		effectName: string,
		target: PokemonSprite | HTMLElement,
		options: SpriteEffectOptions = {}
	): Promise<void> {
		const element = this.effectPool.acquire(effectName);
		if (!element) {
			return;
		}

		const definition = EFFECT_MANIFEST[effectName];
		if (!definition) {
			this.effectPool.release(element);
			return;
		}

		const targetElement = 'element' in target ? target.element : target;
		const targetRect = targetElement.getBoundingClientRect();
		const containerRect = this.container.getBoundingClientRect();

		const centerX = targetRect.left - containerRect.left + targetRect.width / 2;
		const centerY = targetRect.top - containerRect.top + targetRect.height / 2;

		const duration = options.duration ?? 400;
		const scale = options.scale ?? 1;
		const fps = definition.fps ?? 24;
		const frameTime = 1000 / fps;

		element.style.display = 'block';
		element.style.position = 'absolute';
		element.style.left = `${centerX - (definition.frameWidth * scale) / 2}px`;
		element.style.top = `${centerY - (definition.frameHeight * scale) / 2}px`;
		element.style.width = `${definition.frameWidth}px`;
		element.style.height = `${definition.frameHeight}px`;
		element.style.opacity = String(options.opacity ?? 1);
		element.style.transform = `scale(${scale})`;
		element.style.zIndex = String(options.zIndex ?? 100);

		if (options.hueRotate !== undefined) {
			const glowColor = options.tint ?? 'rgba(255, 255, 255, 0.8)';
			element.style.filter = `hue-rotate(${options.hueRotate}deg) drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 6px ${glowColor}) brightness(1.2)`;
		} else if (options.tint) {
			element.style.filter = `drop-shadow(0 0 12px ${options.tint}) drop-shadow(0 0 6px ${options.tint}) brightness(1.2)`;
		}

		this.container.appendChild(element);

		await this.animateSpriteSheet(element, definition.frames, frameTime, duration);

		element.style.filter = '';
		this.effectPool.release(element);
		options.onComplete?.();
	}

	async moveSpriteTo(
		sprite: PokemonSprite,
		target: PokemonSprite | { x: number; y: number },
		options: MoveSpriteOptions = {}
	): Promise<void> {
		const duration = options.duration ?? 0.25;
		const returnDuration = options.returnDuration ?? 0.3;
		const easing = options.easing ?? 'power2.in';
		const returnEasing = options.returnEasing ?? 'power2.out';
		const overshoot = options.overshoot ?? 30;

		const attackerRect = sprite.element.getBoundingClientRect();
		let targetX: number;
		let targetY: number;

		if ('element' in target) {
			const targetRect = target.element.getBoundingClientRect();
			targetX = targetRect.left;
			targetY = targetRect.top;
		} else {
			targetX = target.x;
			targetY = target.y;
		}

		const deltaX = targetX - attackerRect.left;
		const deltaY = targetY - attackerRect.top;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const stopDistance = Math.max(0, distance - overshoot);
		const ratio = distance > 0 ? stopDistance / distance : 0;

		const moveX = deltaX * ratio;
		const moveY = deltaY * ratio;

		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		timeline
			.to(sprite.element, {
				x: moveX,
				y: moveY,
				duration,
				ease: easing
			})
			.to(sprite.element, {
				x: 0,
				y: 0,
				duration: returnDuration,
				ease: returnEasing
			});

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
		this.resetSpriteToHome(sprite);
	}

	async showImpact(
		target: PokemonSprite | HTMLElement,
		options: { intensity?: number; duration?: number; color?: string } = {}
	): Promise<void> {
		const targetElement = 'element' in target ? target.element : target;
		const intensity = options.intensity ?? 8;
		const duration = options.duration ?? 200;
		const color = options.color ?? '#ffffff';

		await Promise.all([
			this.showSpriteEffect('impact', target as PokemonSprite, {
				scale: 1.2,
				duration: duration,
				tint: color
			}),
			this.shake(targetElement, intensity, duration)
		]);
	}

	async flashSprite(sprite: PokemonSprite, color: string, duration: number = 150): Promise<void> {
		await this.flashElement(sprite.element, color, duration);
	}

	async pulseScale(
		sprite: PokemonSprite,
		targetScale: number,
		duration: number = 300
	): Promise<void> {
		const timeline = gsap.timeline();
		this.activeTimelines.add(timeline);

		const homeScale = sprite.homePosition?.scale ?? 1;

		timeline
			.to(sprite.element, {
				scale: targetScale,
				duration: duration / 2000,
				ease: 'power2.out'
			})
			.to(sprite.element, {
				scale: homeScale,
				duration: duration / 2000,
				ease: 'power2.in'
			});

		await timeline.then(() => {});
		this.activeTimelines.delete(timeline);
	}

	resetSpriteToHome(sprite: PokemonSprite): void {
		const homeScale = sprite.homePosition?.scale ?? 1;
		gsap.set(sprite.element, {
			x: 0,
			y: 0,
			scale: homeScale
		});
	}

	getTypeColor(type: string): string {
		return TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.normal;
	}

	getTypeHueAngle(type: string): number {
		return TYPE_HUE_ANGLES[type.toLowerCase()] ?? TYPE_HUE_ANGLES.normal;
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
