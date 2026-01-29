import { type AnimationEngine, type MoveContext, type MoveAnimation } from '../animation-engine';

export const physicalMoves: Record<string, MoveAnimation> = {};

async function dashToTarget(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;

	const attackerRect = attacker.element.getBoundingClientRect();
	const defenderRect = target.element.getBoundingClientRect();

	const deltaX = defenderRect.left - attackerRect.left;
	const deltaY = defenderRect.top - attackerRect.top;

	const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	const stopDistance = Math.max(0, distance - 30);
	const ratio = distance > 0 ? stopDistance / distance : 0;

	const moveX = deltaX * ratio;
	const moveY = deltaY * ratio;

	const gsap = (await import('gsap')).default;

	await new Promise<void>((resolve) => {
		const timeline = gsap.timeline({ onComplete: resolve });
		timeline
			.to(attacker.element, { x: moveX, y: moveY, duration: 0.2, ease: 'power2.in' })
			.add(() => engine.shake(target.element, 8, 150))
			.to(attacker.element, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
	});
}

async function punchAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await dashToTarget(engine, context);
}

async function kickAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await dashToTarget(engine, context);
}

async function slashAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await dashToTarget(engine, context);
}

async function biteAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await dashToTarget(engine, context);
}

async function tackleAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await dashToTarget(engine, context);
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
	'cross-chop',
	'psycho-cut',
	'leaf-blade',
	'air-slash',
	'shadow-claw',
	'dragon-claw',
	'metal-claw',
	'crush-claw',
	'hone-claws',
	'aerial-ace',
	'fury-swipes',
	'razor-shell',
	'sacred-sword',
	'secret-sword',
	'smart-strike',
	'solar-blade',
	'behemoth-blade',
	'wicked-blow'
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
	'aerial-ace',
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

PUNCH_MOVES.forEach((move) => {
	physicalMoves[move] = punchAnimation;
});

KICK_MOVES.forEach((move) => {
	physicalMoves[move] = kickAnimation;
});

SLASH_MOVES.forEach((move) => {
	physicalMoves[move] = slashAnimation;
});

BITE_MOVES.forEach((move) => {
	physicalMoves[move] = biteAnimation;
});

TACKLE_MOVES.forEach((move) => {
	physicalMoves[move] = tackleAnimation;
});

export function registerPhysicalMoves(engine: AnimationEngine): void {
	Object.entries(physicalMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
