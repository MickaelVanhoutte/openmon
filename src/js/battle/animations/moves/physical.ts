import {
	type AnimationEngine,
	type MoveContext,
	type MoveAnimation,
	TYPE_HUE_ANGLES
} from '../animation-engine';

export const physicalMoves: Record<string, MoveAnimation> = {};

const TYPE_TO_EFFECT: Record<string, string> = {
	fire: 'fire',
	water: 'water',
	electric: 'thunder',
	grass: 'leaf',
	ice: 'ice',
	poison: 'poison',
	rock: 'rock',
	ground: 'rock',
	flying: 'wind',
	psychic: 'lightball',
	ghost: 'shadowball',
	dragon: 'fire',
	dark: 'shadowball',
	fairy: 'lightball',
	bug: 'leaf',
	steel: 'impact'
};

async function punchAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);
	const typeEffect = TYPE_TO_EFFECT[moveType.toLowerCase()];

	await engine.moveSpriteTo(attacker, target, { duration: 0.15, overshoot: 25 });

	const effects: Promise<void>[] = [
		engine.showSpriteEffect('fist', target, {
			hueRotate: hue,
			scale: 1.2,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 10, color: typeColor })
	];

	if (typeEffect && typeEffect !== 'impact') {
		effects.push(
			engine.showSpriteEffect(typeEffect, target, {
				hueRotate: hue,
				scale: 1.0,
				tint: typeColor,
				zIndex: engine.getEffectZIndex(attacker.slot) - 1
			})
		);
	}

	await Promise.all(effects);
}

async function kickAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);
	const typeEffect = TYPE_TO_EFFECT[moveType.toLowerCase()];

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.2,
		easing: 'power3.in',
		overshoot: 20,
		returnDuration: 0.35,
		returnEasing: 'bounce.out'
	});

	const effects: Promise<void>[] = [
		engine.showSpriteEffect('foot', target, {
			hueRotate: hue,
			scale: 1.3,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 12, color: typeColor })
	];

	if (typeEffect && typeEffect !== 'impact') {
		effects.push(
			engine.showSpriteEffect(typeEffect, target, {
				hueRotate: hue,
				scale: 1.1,
				tint: typeColor,
				zIndex: engine.getEffectZIndex(attacker.slot) - 1
			})
		);
	}

	await Promise.all(effects);
}

async function slashAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);
	const typeEffect = TYPE_TO_EFFECT[moveType.toLowerCase()];

	await engine.moveSpriteTo(attacker, target, { duration: 0.12, overshoot: 35 });

	const effects: Promise<void>[] = [
		engine.showSpriteEffect('slash', target, {
			hueRotate: hue,
			scale: 1.5,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.flashSprite(target, typeColor, 100),
		engine.shake(target.element, 6, 150)
	];

	if (typeEffect && typeEffect !== 'impact') {
		effects.push(
			engine.showSpriteEffect(typeEffect, target, {
				hueRotate: hue,
				scale: 1.2,
				tint: typeColor,
				zIndex: engine.getEffectZIndex(attacker.slot) - 1
			})
		);
	}

	await Promise.all(effects);
}

async function clawAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);
	const typeEffect = TYPE_TO_EFFECT[moveType.toLowerCase()];

	await engine.moveSpriteTo(attacker, target, { duration: 0.1, overshoot: 30 });
	await engine.showSpriteEffect('claws', target, {
		hueRotate: hue,
		scale: 1.4,
		tint: typeColor,
		zIndex: engine.getEffectZIndex(attacker.slot)
	});
	await engine.wait(50);

	const effects: Promise<void>[] = [
		engine.showSpriteEffect('slash', target, {
			hueRotate: hue,
			scale: 1.2,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.shake(target.element, 8, 200)
	];

	if (typeEffect && typeEffect !== 'impact') {
		effects.push(
			engine.showSpriteEffect(typeEffect, target, {
				hueRotate: hue,
				scale: 1.0,
				tint: typeColor,
				zIndex: engine.getEffectZIndex(attacker.slot) - 1
			})
		);
	}

	await Promise.all(effects);
}

async function biteAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const typeColor = engine.getTypeColor(moveType);
	const typeEffect = TYPE_TO_EFFECT[moveType.toLowerCase()];

	await engine.moveSpriteTo(attacker, target, { duration: 0.18, overshoot: 15 });

	const effects: Promise<void>[] = [
		engine.showSpriteEffect('crunch', target, {
			hueRotate: hue,
			scale: 1.3,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 10, color: typeColor })
	];

	if (typeEffect && typeEffect !== 'impact') {
		effects.push(
			engine.showSpriteEffect(typeEffect, target, {
				hueRotate: hue,
				scale: 1.0,
				tint: typeColor,
				zIndex: engine.getEffectZIndex(attacker.slot) - 1
			})
		);
	}

	await Promise.all(effects);
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
		engine.showSpriteEffect('impact', target, {
			scale: 1.5,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
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
		engine.showSpriteEffect('slash', target, {
			hueRotate: hue,
			scale: 1.3,
			tint: typeColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 8, color: typeColor })
	]);
}

async function waterContactAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const waterColor = engine.getTypeColor('water');

	await engine.moveSpriteTo(attacker, target, { duration: 0.2, overshoot: 20 });
	await Promise.all([
		engine.showSpriteEffect('water', target, {
			scale: 1.5,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 12, color: waterColor })
	]);
}

async function waterPunchAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const waterColor = engine.getTypeColor('water');
	const hue = TYPE_HUE_ANGLES['water'] ?? 200;

	await engine.moveSpriteTo(attacker, target, { duration: 0.15, overshoot: 25 });
	await Promise.all([
		engine.showSpriteEffect('fist', target, {
			hueRotate: hue,
			scale: 1.2,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showSpriteEffect('water', target, {
			scale: 1.3,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot) - 1
		}),
		engine.showImpact(target, { intensity: 10, color: waterColor })
	]);
}

async function waterTailAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const waterColor = engine.getTypeColor('water');

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.18,
		overshoot: 25,
		returnDuration: 0.35
	});
	await Promise.all([
		engine.showSpriteEffect('water', target, {
			scale: 1.6,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showSpriteEffect('slash', target, {
			hueRotate: TYPE_HUE_ANGLES['water'] ?? 200,
			scale: 1.2,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 14, color: waterColor })
	]);
}

async function waterDashAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const waterColor = engine.getTypeColor('water');

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.12,
		overshoot: 15,
		returnDuration: 0.25
	});
	await Promise.all([
		engine.showSpriteEffect('water', target, {
			scale: 1.4,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 10, color: waterColor }),
		engine.flashSprite(target, waterColor, 100)
	]);
}

async function waterBurstAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const waterColor = engine.getTypeColor('water');

	await engine.moveSpriteTo(attacker, target, {
		duration: 0.25,
		overshoot: 10,
		returnDuration: 0.4
	});
	await engine.backgroundFlash(waterColor, 100);
	await Promise.all([
		engine.showSpriteEffect('water', target, {
			scale: 2.0,
			duration: 400,
			tint: waterColor,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 18, color: waterColor }),
		engine.screenShake(12, 250)
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
	'fury-swipes',
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

const WATER_CONTACT_MOVES = ['liquidation', 'waterfall', 'flip-turn'];

const WATER_PUNCH_MOVES = ['crabhammer', 'jet-punch'];

const WATER_TAIL_MOVES = ['aqua-tail'];

const WATER_DASH_MOVES = ['aqua-jet', 'aqua-step'];

const WATER_BURST_MOVES = ['wave-crash', 'dive'];

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

WATER_CONTACT_MOVES.forEach((move) => {
	physicalMoves[move] = waterContactAnimation;
});

WATER_PUNCH_MOVES.forEach((move) => {
	physicalMoves[move] = waterPunchAnimation;
});

WATER_TAIL_MOVES.forEach((move) => {
	physicalMoves[move] = waterTailAnimation;
});

WATER_DASH_MOVES.forEach((move) => {
	physicalMoves[move] = waterDashAnimation;
});

WATER_BURST_MOVES.forEach((move) => {
	physicalMoves[move] = waterBurstAnimation;
});

export function registerPhysicalMoves(engine: AnimationEngine): void {
	Object.entries(physicalMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
