import {
	type AnimationEngine,
	type MoveContext,
	type MoveAnimation,
	TYPE_HUE_ANGLES
} from '../animation-engine';

export const physicalMoves: Record<string, MoveAnimation> = {};

async function punchAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, { duration: 0.15, overshoot: 25 });
	await Promise.all([
		engine.showSpriteEffect('fist', target, { hueRotate: hue, scale: 1.2, tint: typeColor }),
		engine.showImpact(target, { intensity: 10, color: typeColor })
	]);
}

async function kickAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.2,
		easing: 'power3.in',
		overshoot: 20,
		returnDuration: 0.35,
		returnEasing: 'bounce.out'
	});
	await Promise.all([
		engine.showSpriteEffect('foot', target, { hueRotate: hue, scale: 1.3, tint: typeColor }),
		engine.showImpact(target, { intensity: 12, color: typeColor })
	]);
}

async function slashAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, { duration: 0.12, overshoot: 35 });
	await Promise.all([
		engine.showSpriteEffect('slash', target, { hueRotate: hue, scale: 1.5, tint: typeColor }),
		engine.flashSprite(target, typeColor, 100),
		engine.shake(target.element, 6, 150)
	]);
}

async function clawAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, { duration: 0.1, overshoot: 30 });
	await engine.showSpriteEffect('claws', target, { hueRotate: hue, scale: 1.4, tint: typeColor });
	await engine.wait(50);
	await Promise.all([
		engine.showSpriteEffect('slash', target, { hueRotate: hue, scale: 1.2, tint: typeColor }),
		engine.shake(target.element, 8, 200)
	]);
}

async function biteAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, { duration: 0.18, overshoot: 15 });
	await Promise.all([
		engine.showSpriteEffect('crunch', target, { hueRotate: hue, scale: 1.3, tint: typeColor }),
		engine.showImpact(target, { intensity: 10, color: typeColor })
	]);
}

async function tackleAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.25,
		easing: 'power4.in',
		overshoot: 10,
		returnDuration: 0.4,
		returnEasing: 'power2.out'
	});
	await Promise.all([
		engine.showSpriteEffect('impact', target, { scale: 1.5, tint: typeColor }),
		engine.showImpact(target, { intensity: 15, color: typeColor }),
		engine.screenShake(10, 200)
	]);
}

async function chopAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);

	await engine.moveSpriteTo(attacker, target, { duration: 0.15, overshoot: 25 });
	await Promise.all([
		engine.showSpriteEffect('slash', target, { hueRotate: hue, scale: 1.3, tint: typeColor }),
		engine.showImpact(target, { intensity: 8, color: typeColor })
	]);
}

const PUNCH_MOVES = [
	'mega-punch',
	'fire-punch',
	'ice-punch',
	'thunder-punch',
	'comet-punch',
	'mach-punch',
	'focus-punch',
	'dynamic-punch',
	'drain-punch',
	'power-up-punch',
	'sky-uppercut',
	'bullet-punch',
	'shadow-punch',
	'meteor-mash',
	'hammer-arm',
	'sucker-punch',
	'plasma-fists',
	'surging-strikes'
];

const KICK_MOVES = [
	'mega-kick',
	'jump-kick',
	'rolling-kick',
	'hi-jump-kick',
	'low-kick',
	'triple-kick',
	'blaze-kick',
	'stomp',
	'double-kick',
	'low-sweep',
	'high-horsepower',
	'pyro-ball'
];

const SLASH_MOVES = [
	'cut',
	'slash',
	'fury-cutter',
	'night-slash',
	'x-scissor',
	'psycho-cut',
	'leaf-blade',
	'air-slash',
	'razor-shell',
	'sacred-sword',
	'secret-sword',
	'smart-strike',
	'solar-blade',
	'behemoth-blade',
	'wicked-blow'
];

const CLAW_MOVES = [
	'scratch',
	'shadow-claw',
	'dragon-claw',
	'metal-claw',
	'crush-claw',
	'hone-claws',
	'fury-swipes',
	'cross-chop',
	'aerial-ace'
];

const BITE_MOVES = [
	'bite',
	'crunch',
	'fire-fang',
	'ice-fang',
	'thunder-fang',
	'poison-fang',
	'hyper-fang',
	'super-fang',
	'psychic-fangs',
	'fishious-rend',
	'jaw-lock'
];

const TACKLE_MOVES = [
	'tackle',
	'body-slam',
	'take-down',
	'double-edge',
	'headbutt',
	'slam',
	'quick-attack',
	'extreme-speed',
	'aqua-jet',
	'bullet-seed',
	'rock-throw',
	'rollout',
	'rapid-spin',
	'facade',
	'return',
	'frustration',
	'horn-attack',
	'fury-attack',
	'peck',
	'drill-peck',
	'wing-attack',
	'brave-bird',
	'head-smash',
	'iron-head',
	'zen-headbutt',
	'skull-bash',
	'wild-charge',
	'volt-tackle',
	'flare-blitz',
	'giga-impact',
	'last-resort',
	'retaliate',
	'head-charge',
	'raging-bull',
	'collision-course'
];

const CHOP_MOVES = ['karate-chop', 'brick-break', 'cross-chop', 'dual-chop', 'throat-chop'];

PUNCH_MOVES.forEach((move) => {
	physicalMoves[move] = punchAnimation;
});

KICK_MOVES.forEach((move) => {
	physicalMoves[move] = kickAnimation;
});

SLASH_MOVES.forEach((move) => {
	physicalMoves[move] = slashAnimation;
});

CLAW_MOVES.forEach((move) => {
	physicalMoves[move] = clawAnimation;
});

BITE_MOVES.forEach((move) => {
	physicalMoves[move] = biteAnimation;
});

TACKLE_MOVES.forEach((move) => {
	physicalMoves[move] = tackleAnimation;
});

CHOP_MOVES.forEach((move) => {
	physicalMoves[move] = chopAnimation;
});

export function registerPhysicalMoves(engine: AnimationEngine): void {
	Object.entries(physicalMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
