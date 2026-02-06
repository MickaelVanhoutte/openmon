import {
	type AnimationEngine,
	type MoveContext,
	type MoveAnimation,
	TYPE_HUE_ANGLES
} from '../animation-engine';

import caltropImg from '../../../../assets/battle/fx/caltrop.png';
import poisonCaltropImg from '../../../../assets/battle/fx/poisoncaltrop.png';
import webImg from '../../../../assets/battle/fx/web.png';
import rockImg from '../../../../assets/battle/fx/rock.png';

export const otherMoves: Record<string, MoveAnimation> = {};

async function multiHitAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType, hitCount } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);
	const hits = hitCount ?? 3;

	for (let i = 0; i < hits; i++) {
		await engine.moveSpriteTo(attacker, target, { duration: 0.1, overshoot: 25 });
		await engine.showSpriteEffect('impact', target, {
			hueRotate: hue,
			scale: 0.8 + i * 0.1,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.shake(target.element, 5, 80);
		await engine.wait(50);
	}
}

async function ohkoAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const color = engine.getTypeColor(moveType);

	await engine.backgroundFlash('#ffffff', 200);
	await engine.moveSpriteTo(attacker, target, {
		duration: 0.3,
		easing: 'power4.in',
		overshoot: 5
	});

	await Promise.all([
		engine.showSpriteEffect('impact', target, {
			scale: 2.5,
			duration: 500,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.screenShake(20, 500),
		engine.flashSprite(target, color, 300)
	]);

	const gsap = (await import('gsap')).default;
	await new Promise<void>((resolve) => {
		gsap.to(target.element, {
			filter: 'brightness(3) contrast(2)',
			duration: 0.2,
			onComplete: () => {
				gsap.to(target.element, { filter: 'none', duration: 0.3, onComplete: resolve });
			}
		});
	});
}

const HAZARD_SETTING_MOVES = ['spikes', 'toxic-spikes', 'stealth-rock', 'sticky-web'];

const HAZARD_SPRITES: Record<string, string> = {
	spikes: caltropImg,
	'stealth-rock': rockImg,
	'toxic-spikes': poisonCaltropImg,
	'sticky-web': webImg
};

async function hazardAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, moveName } = context;

	const normalizedName = moveName.toLowerCase();
	const spriteUrl = HAZARD_SPRITES[normalizedName];
	if (!spriteUrl) {
		return;
	}

	const gsap = (await import('gsap')).default;

	const battleScene = document.querySelector('.battle-scene') as HTMLElement;
	if (!battleScene) {
		return;
	}

	const sceneRect = battleScene.getBoundingClientRect();

	let startX: number;
	let startY: number;
	const isAllyAttacker = attacker.slot.side === 'player';

	if (attacker.element) {
		const attackerRect = attacker.element.getBoundingClientRect();
		startX = attackerRect.left - sceneRect.left + attackerRect.width / 2;
		startY = attackerRect.top - sceneRect.top + attackerRect.height / 2;
	} else {
		startX = isAllyAttacker ? sceneRect.width * 0.25 : sceneRect.width * 0.75;
		startY = sceneRect.height * 0.6;
	}

	const endX = isAllyAttacker ? sceneRect.width * 0.75 : sceneRect.width * 0.25;
	const endY = sceneRect.height * 0.75;

	const projectile = document.createElement('img');
	projectile.src = spriteUrl;
	projectile.style.cssText = `
		position: absolute;
		left: ${startX}px;
		top: ${startY}px;
		width: 40px;
		height: 40px;
		pointer-events: none;
		z-index: 1000;
		transform: translate(-50%, -50%);
	`;
	battleScene.appendChild(projectile);

	await new Promise<void>((resolve) => {
		gsap.to(projectile, {
			left: endX,
			top: endY,
			duration: 0.4,
			ease: 'power2.in',
			onComplete: () => {
				projectile.remove();
				resolve();
			}
		});
	});

	await engine.screenShake(3, 150);
}

async function fieldAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType, moveName } = context;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	const normalizedName = moveName.toLowerCase();
	const isHazardMove = HAZARD_SETTING_MOVES.includes(normalizedName);

	if (isHazardMove) {
		await hazardAnimation(engine, context);
		return;
	}

	const targetSprite = defender && !Array.isArray(defender) ? defender : attacker;

	await engine.showSpriteEffect('rock', targetSprite, {
		hueRotate: hue,
		scale: 1.5,
		tint: color,
		zIndex: engine.getEffectZIndex(targetSprite.slot)
	});
	await engine.backgroundFlash(color, 150);
	await engine.screenShake(5, 200);
}

async function transformAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker } = context;
	const homeScale = attacker.homePosition?.scale ?? 1;

	const gsap = (await import('gsap')).default;

	await new Promise<void>((resolve) => {
		const tl = gsap.timeline({ onComplete: resolve });
		tl.to(attacker.element, { filter: 'brightness(3)', scale: homeScale * 0.8, duration: 0.2 })
			.to(attacker.element, { filter: 'brightness(5)', scale: homeScale * 1.2, duration: 0.15 })
			.to(attacker.element, { filter: 'brightness(1)', scale: homeScale, duration: 0.25 });
	});
}

async function weatherAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { moveName } = context;

	const weatherColors: Record<string, string> = {
		'rain-dance': '#4488cc',
		'sunny-day': '#ffaa33',
		sandstorm: '#ccaa66',
		hail: '#aaddff',
		snowscape: '#cceeFF'
	};

	const color = weatherColors[moveName] ?? '#888888';
	await engine.backgroundFlash(color, 400);

	for (let i = 0; i < 5; i++) {
		await engine.wait(80);
		await engine.backgroundFlash(color, 100);
	}
}

async function terrainAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { moveName } = context;

	const terrainColors: Record<string, string> = {
		'electric-terrain': '#ffee55',
		'grassy-terrain': '#66cc66',
		'psychic-terrain': '#ff88cc',
		'misty-terrain': '#ffaaff'
	};

	const color = terrainColors[moveName] ?? '#888888';

	await engine.backgroundFlash(color, 300);
	await engine.screenShake(3, 200);
	await engine.backgroundFlash(color, 200);
}

async function sizeChangeAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, moveName } = context;
	const homeScale = attacker.homePosition?.scale ?? 1;

	const growMoves = ['growth', 'belly-drum', 'bulk-up', 'work-up'];
	const shrinkMoves = ['minimize'];

	const gsap = (await import('gsap')).default;

	if (shrinkMoves.includes(moveName)) {
		await new Promise<void>((resolve) => {
			const tl = gsap.timeline({ onComplete: resolve });
			tl.to(attacker.element, { scale: homeScale * 0.6, duration: 0.3, ease: 'power2.in' })
				.to(attacker.element, { scale: homeScale * 0.7, duration: 0.1 })
				.to(attacker.element, { scale: homeScale, duration: 0.2, ease: 'power2.out' });
		});
	} else {
		await engine.pulseScale(attacker, homeScale * 1.25, 400);
		await engine.showSpriteEffect('buff', attacker, {
			scale: 1.3,
			tint: '#ffcc00',
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
	}
}

const SIZE_CHANGE_MOVES = ['growth', 'belly-drum', 'minimize'];

const MULTI_HIT_MOVES = [
	'double-slap',
	'comet-punch',
	'fury-attack',
	'pin-missile',
	'spike-cannon',
	'barrage',
	'bone-rush',
	'arm-thrust',
	'bullet-seed',
	'icicle-spear',
	'rock-blast',
	'water-shuriken',
	'tail-slap',
	'triple-kick',
	'triple-axel',
	'scale-shot',
	'dual-wingbeat',
	'surging-strikes'
];

const OHKO_MOVES = ['guillotine', 'horn-drill', 'fissure', 'sheer-cold'];

const FIELD_MOVES = [
	'spikes',
	'toxic-spikes',
	'stealth-rock',
	'sticky-web',
	'rapid-spin',
	'defog',
	'court-change'
];

const TRANSFORM_MOVES = ['transform', 'ditto'];

const WEATHER_MOVES = ['rain-dance', 'sunny-day', 'sandstorm', 'hail', 'snowscape'];

const TERRAIN_MOVES = ['electric-terrain', 'grassy-terrain', 'psychic-terrain', 'misty-terrain'];

MULTI_HIT_MOVES.forEach((move) => {
	otherMoves[move] = multiHitAnimation;
});

OHKO_MOVES.forEach((move) => {
	otherMoves[move] = ohkoAnimation;
});

FIELD_MOVES.forEach((move) => {
	otherMoves[move] = fieldAnimation;
});

TRANSFORM_MOVES.forEach((move) => {
	otherMoves[move] = transformAnimation;
});

WEATHER_MOVES.forEach((move) => {
	otherMoves[move] = weatherAnimation;
});

TERRAIN_MOVES.forEach((move) => {
	otherMoves[move] = terrainAnimation;
});

SIZE_CHANGE_MOVES.forEach((move) => {
	otherMoves[move] = sizeChangeAnimation;
});

export function registerOtherMoves(engine: AnimationEngine): void {
	Object.entries(otherMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
