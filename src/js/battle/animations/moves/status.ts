import {
	type AnimationEngine,
	type MoveContext,
	type MoveAnimation,
	TYPE_HUE_ANGLES
} from '../animation-engine';
import { gsap } from 'gsap';

export const statusMoves: Record<string, MoveAnimation> = {};

async function buffAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, moveType } = context;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	await engine.pulseScale(attacker, 1.15, 300);

	for (let i = 0; i < 3; i++) {
		engine.showSpriteEffect('buff', attacker, {
			hueRotate: hue,
			scale: 0.8 + i * 0.2,
			opacity: 1 - i * 0.3,
			duration: 250,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.wait(100);
	}

	await engine.flashSprite(attacker, color, 150);
}

async function debuffAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	await engine.showSpriteEffect('debuff', target, {
		hueRotate: hue,
		scale: 1.2,
		tint: color,
		zIndex: engine.getEffectZIndex(attacker.slot)
	});

	await new Promise<void>((resolve) => {
		gsap.to(target.element, {
			filter: 'brightness(0.7) saturate(0.8)',
			duration: 0.2,
			onComplete: () => {
				gsap.to(target.element, {
					filter: 'brightness(1) saturate(1)',
					duration: 0.3,
					onComplete: resolve
				});
			}
		});
	});
}

async function healAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker } = context;
	const healColor = '#66ff88';

	for (let i = 0; i < 4; i++) {
		engine.showSpriteEffect('heal', attacker, {
			scale: 0.6 + i * 0.15,
			opacity: 1 - i * 0.2,
			duration: 200,
			tint: healColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.wait(80);
	}

	await engine.flashSprite(attacker, healColor, 200);
	await engine.pulseScale(attacker, 1.08, 250);
}

async function statusConditionAnimation(
	engine: AnimationEngine,
	context: MoveContext
): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	await engine.showSpriteEffect('psychic', target, {
		hueRotate: hue,
		scale: 1.3,
		tint: color,
		zIndex: engine.getEffectZIndex(attacker.slot)
	});

	await new Promise<void>((resolve) => {
		const tl = gsap.timeline({ onComplete: resolve });
		tl.to(target.element, {
			filter: `drop-shadow(0 0 8px ${color}) brightness(1.3)`,
			duration: 0.15
		})
			.to(target.element, { filter: 'none', duration: 0.15 })
			.to(target.element, {
				filter: `drop-shadow(0 0 8px ${color}) brightness(1.3)`,
				duration: 0.15
			})
			.to(target.element, { filter: 'none', duration: 0.15 });
	});
}

async function protectAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker } = context;

	const shield = document.createElement('div');
	shield.style.cssText = `
		position: absolute;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		border: 4px solid rgba(100, 200, 255, 0.8);
		background: radial-gradient(circle, rgba(100, 200, 255, 0.3) 0%, transparent 70%);
		z-index: 100;
		transform: scale(0);
	`;

	const attackerRect = attacker.element.getBoundingClientRect();
	const container = attacker.element.closest('.battle-scene') as HTMLElement;
	const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0 };

	shield.style.left = `${attackerRect.left - containerRect.left + attackerRect.width / 2 - 60}px`;
	shield.style.top = `${attackerRect.top - containerRect.top + attackerRect.height / 2 - 60}px`;
	container?.appendChild(shield);

	await new Promise<void>((resolve) => {
		const tl = gsap.timeline({ onComplete: resolve });
		tl.to(shield, { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out' })
			.to(shield, { opacity: 0.6, duration: 0.3 })
			.to(shield, { scale: 1.2, opacity: 0, duration: 0.3, onComplete: () => shield.remove() });
	});
}

export async function spinAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await new Promise<void>((resolve) => {
		gsap.to(attacker.element, {
			rotation: 720,
			duration: 0.4,
			ease: 'power2.inOut',
			onComplete: () => {
				gsap.set(attacker.element, { rotation: 0 });
				resolve();
			}
		});
	});

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.12,
		overshoot: 20,
		returnDuration: 0.25
	});

	await Promise.all([
		engine.showSpriteEffect('wind', target, {
			hueRotate: hue,
			scale: 1.3,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 8, color: typeColor })
	]);
}

export async function whipAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.showSpriteEffect('leaf', attacker, {
		hueRotate: hue,
		scale: 0.8,
		duration: 150,
		tint: typeColor,
		zIndex: engine.getEffectZIndex(attacker.slot)
	});

	for (let i = 0; i < 2; i++) {
		await engine.showSpriteEffect('slash', target, {
			hueRotate: hue,
			scale: 1.2 + i * 0.2,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.wait(60);
	}

	await Promise.all([
		engine.shake(target.element, 8, 200),
		engine.flashSprite(target, typeColor, 100)
	]);
}

const BUFF_MOVES = [
	'swords-dance',
	'dragon-dance',
	'calm-mind',
	'bulk-up',
	'nasty-plot',
	'agility',
	'rock-polish',
	'shell-smash',
	'quiver-dance',
	'coil',
	'hone-claws',
	'work-up',
	'curse',
	'shift-gear',
	'cotton-guard',
	'iron-defense',
	'acid-armor',
	'barrier',
	'amnesia',
	'cosmic-power',
	'defend-order',
	'stockpile',
	'double-team',
	'autotomize',
	'charge',
	'focus-energy',
	'meditate',
	'sharpen',
	'acupressure',
	'geomancy',
	'extreme-evoboost',
	'switcheroo',
	'tailwind',
	'mirror-move',
	'mud-sport',
	'rototiller',
	'copycat',
	'camouflage',
	'helping-hand',
	'splash',
	'psych-up',
	'sleep-talk',
	'bestow',
	'pain-split',
	'assist',
	'metronome',
	'recycle',
	'follow-me',
	'mimic',
	'magic-room',
	'role-play',
	'ally-switch',
	'power-trick',
	'trick',
	'speed-swap',
	'teleport',
	'gravity',
	'trick-room',
	'psycho-shift',
	'heart-swap',
	'aromatic-mist',
	'haze'
];

const DEBUFF_MOVES = [
	'growl',
	'leer',
	'tail-whip',
	'string-shot',
	'sand-attack',
	'smokescreen',
	'flash',
	'kinesis',
	'sweet-scent',
	'scary-face',
	'cotton-spore',
	'fake-tears',
	'metal-sound',
	'screech',
	'charm',
	'feather-dance',
	'captivate',
	'memento',
	'parting-shot',
	'noble-roar',
	'play-nice',
	'baby-doll-eyes',
	'tearful-look',
	'tickle',
	'venom-drench',
	'quash',
	'roar'
];

const HEAL_MOVES = [
	'recover',
	'soft-boiled',
	'milk-drink',
	'slack-off',
	'roost',
	'moonlight',
	'morning-sun',
	'synthesis',
	'wish',
	'heal-order',
	'shore-up',
	'rest',
	'aqua-ring',
	'ingrain',
	'leech-seed',
	'strength-sap',
	'life-dew',
	'floral-healing',
	'heal-pulse',
	'pollen-puff',
	'jungle-healing',
	'aromatherapy',
	'refresh',
	'swallow',
	'healing-wish'
];

const STATUS_CONDITION_MOVES = [
	'thunder-wave',
	'stun-spore',
	'glare',
	'nuzzle',
	'zap-cannon',
	'will-o-wisp',
	'toxic',
	'poison-powder',
	'poison-gas',
	'sleep-powder',
	'hypnosis',
	'sing',
	'lovely-kiss',
	'grass-whistle',
	'spore',
	'yawn',
	'dark-void',
	'confuse-ray',
	'supersonic',
	'swagger',
	'flatter',
	'teeter-dance',
	'attract',
	'encore',
	'taunt',
	'torment',
	'disable',
	'spite',
	'grudge',
	'destiny-bond',
	'perish-song',
	'sweet-kiss',
	'nightmare',
	'spider-web',
	'block',
	'mean-look'
];

const PROTECT_MOVES = [
	'protect',
	'detect',
	'endure',
	'wide-guard',
	'quick-guard',
	'kings-shield',
	'spiky-shield',
	'baneful-bunker',
	'obstruct',
	'max-guard',
	'crafty-shield',
	'mat-block',
	'light-screen',
	'reflect',
	'aurora-veil',
	'safeguard',
	'mist',
	'substitute',
	'magic-coat'
];

const WHIP_MOVES = ['branch-poke', 'bind', 'constrict', 'wrap'];

BUFF_MOVES.forEach((move) => {
	statusMoves[move] = buffAnimation;
});

DEBUFF_MOVES.forEach((move) => {
	statusMoves[move] = debuffAnimation;
});

HEAL_MOVES.forEach((move) => {
	statusMoves[move] = healAnimation;
});

STATUS_CONDITION_MOVES.forEach((move) => {
	statusMoves[move] = statusConditionAnimation;
});

PROTECT_MOVES.forEach((move) => {
	statusMoves[move] = protectAnimation;
});

WHIP_MOVES.forEach((move) => {
	statusMoves[move] = whipAnimation;
});

export function registerStatusMoves(engine: AnimationEngine): void {
	Object.entries(statusMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
