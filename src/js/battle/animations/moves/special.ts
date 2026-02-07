import {
	type AnimationEngine,
	type MoveContext,
	type MoveAnimation,
	TYPE_HUE_ANGLES,
	type PokemonSprite
} from '../animation-engine';
import { gsap } from 'gsap';

export const specialMoves: Record<string, MoveAnimation> = {};

const TYPE_TO_EFFECT: Record<string, string> = {
	fire: 'fire',
	water: 'water',
	electric: 'thunder',
	grass: 'leaf',
	ice: 'ice',
	psychic: 'lightball',
	poison: 'poison',
	rock: 'rock',
	ghost: 'shadowball',
	dragon: 'fire',
	dark: 'shadowball',
	fairy: 'lightball',
	fighting: 'impact',
	ground: 'rock',
	flying: 'wind',
	bug: 'leaf',
	steel: 'impact',
	normal: 'impact'
};

async function beamAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	await engine.backgroundFlash(color, 100);

	const effect = TYPE_TO_EFFECT[moveType.toLowerCase()] ?? 'impact';
	for (let i = 0; i < 3; i++) {
		engine.showSpriteEffect(effect, target, {
			hueRotate: hue,
			scale: 1 + i * 0.2,
			duration: 150,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.wait(50);
	}
	await engine.wait(100);
	await Promise.all([
		engine.shake(target.element, 10, 200),
		engine.flashSprite(target, color, 150)
	]);
}

async function projectileAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const effect = TYPE_TO_EFFECT[moveType.toLowerCase()] ?? 'impact';
	const color = engine.getTypeColor(moveType);

	await engine.showSpriteEffect(effect, attacker, {
		hueRotate: hue,
		scale: 0.8,
		duration: 100,
		tint: color,
		zIndex: engine.getEffectZIndex(attacker.slot)
	});

	const projectile = document.createElement('div');
	projectile.style.cssText = `
		position: absolute;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: radial-gradient(circle, ${color} 0%, transparent 70%);
		filter: hue-rotate(${hue}deg) blur(2px);
		z-index: 100;
	`;

	const attackerRect = attacker.element.getBoundingClientRect();
	const targetRect = target.element.getBoundingClientRect();
	const container = attacker.element.closest('.battle-scene') as HTMLElement;
	const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0 };

	projectile.style.left = `${attackerRect.left - containerRect.left + attackerRect.width / 2}px`;
	projectile.style.top = `${attackerRect.top - containerRect.top + attackerRect.height / 2}px`;
	container?.appendChild(projectile);

	await new Promise<void>((resolve) => {
		gsap.to(projectile, {
			left: targetRect.left - containerRect.left + targetRect.width / 2,
			top: targetRect.top - containerRect.top + targetRect.height / 2,
			duration: 0.3,
			ease: 'power2.in',
			onComplete: () => {
				projectile.remove();
				resolve();
			}
		});
	});

	await Promise.all([
		engine.showSpriteEffect(effect, target, {
			hueRotate: hue,
			scale: 1.2,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		}),
		engine.showImpact(target, { intensity: 8, color })
	]);
}

async function burstAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const targets = Array.isArray(defender) ? defender : [defender];
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const effect = TYPE_TO_EFFECT[moveType.toLowerCase()] ?? 'impact';
	const color = engine.getTypeColor(moveType);

	await engine.backgroundFlash(color, 150);

	const explosions = targets.map(async (target) => {
		await engine.showSpriteEffect(effect, target, {
			hueRotate: hue,
			scale: 2,
			duration: 400,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.showImpact(target, { intensity: 15, color });
	});

	await Promise.all([...explosions, engine.screenShake(12, 300)]);
}

async function waveAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const effect = TYPE_TO_EFFECT[moveType.toLowerCase()] ?? 'psychic';
	const color = engine.getTypeColor(moveType);

	for (let i = 0; i < 4; i++) {
		engine.showSpriteEffect(effect, target, {
			hueRotate: hue,
			scale: 0.8 + i * 0.3,
			opacity: 1 - i * 0.2,
			duration: 200,
			tint: color,
			zIndex: engine.getEffectZIndex(attacker.slot)
		});
		await engine.wait(80);
	}

	await Promise.all([engine.shake(target.element, 8, 250), engine.flashSprite(target, color, 100)]);
}

async function drainAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { attacker, defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	await engine.showSpriteEffect('psychic', target, {
		hueRotate: hue,
		scale: 1.2,
		tint: color,
		zIndex: engine.getEffectZIndex(attacker.slot)
	});
	await engine.shake(target.element, 6, 150);

	for (let i = 0; i < 3; i++) {
		const orb = document.createElement('div');
		orb.style.cssText = `
			position: absolute;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: radial-gradient(circle, ${color} 0%, transparent 70%);
			z-index: 100;
		`;

		const targetRect = target.element.getBoundingClientRect();
		const attackerRect = attacker.element.getBoundingClientRect();
		const container = target.element.closest('.battle-scene') as HTMLElement;
		const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0 };

		orb.style.left = `${targetRect.left - containerRect.left + targetRect.width / 2 + (i - 1) * 20}px`;
		orb.style.top = `${targetRect.top - containerRect.top + targetRect.height / 2}px`;
		container?.appendChild(orb);

		gsap.to(orb, {
			left: attackerRect.left - containerRect.left + attackerRect.width / 2,
			top: attackerRect.top - containerRect.top + attackerRect.height / 2,
			duration: 0.5,
			delay: i * 0.1,
			ease: 'power2.inOut',
			onComplete: () => orb.remove()
		});
	}

	await engine.wait(600);
	await engine.flashSprite(attacker, '#66ff66', 150);
}

const BEAM_MOVES = [
	'hyper-beam',
	'solar-beam',
	'ice-beam',
	'aurora-beam',
	'psybeam',
	'bubble-beam',
	'signal-beam',
	'charge-beam',
	'flash-cannon',
	'dragon-pulse',
	'dark-pulse',
	'water-pulse',
	'aura-sphere',
	'focus-blast',
	'energy-ball',
	'shadow-ball',
	'sludge-bomb',
	'moonblast',
	'dazzling-gleam',
	'power-gem',
	'tri-attack',
	'techno-blast',
	'judgment',
	'doom-desire',
	'origin-pulse',
	'prismatic-laser',
	'photon-geyser',
	'meteor-beam',
	'eternabeam'
];

const PROJECTILE_MOVES = [
	'ember',
	'flamethrower',
	'fire-blast',
	'water-gun',
	'hydro-pump',
	'thunderbolt',
	'thunder',
	'ice-shard',
	'icicle-spear',
	'bullet-seed',
	'seed-bomb',
	'sludge',
	'acid',
	'poison-jab',
	'gunk-shot',
	'rock-slide',
	'stone-edge',
	'ancient-power',
	'power-gem',
	'muddy-water',
	'surf',
	'scald',
	'brine',
	'whirlpool',
	'flame-burst',
	'lava-plume',
	'eruption',
	'water-spout',
	'draco-meteor',
	'meteor-mash',
	'iron-head'
];

const BURST_MOVES = [
	'explosion',
	'self-destruct',
	'mind-blown',
	'misty-explosion',
	'earthquake',
	'magnitude',
	'bulldoze',
	'discharge',
	'parabolic-charge',
	'heat-wave',
	'blizzard',
	'hurricane',
	'twister',
	'ominous-wind',
	'silver-wind',
	'petal-blizzard',
	'petal-dance',
	'fiery-dance'
];

const WAVE_MOVES = [
	'psychic',
	'psyshock',
	'stored-power',
	'extrasensory',
	'confusion',
	'dream-eater',
	'night-shade',
	'hex',
	'shadow-sneak',
	'shadow-force',
	'phantom-force',
	'poltergeist',
	'spirit-shackle',
	'spectral-thief'
];

const DRAIN_MOVES = [
	'absorb',
	'mega-drain',
	'giga-drain',
	'leech-life',
	'drain-punch',
	'draining-kiss',
	'horn-leech',
	'parabolic-charge',
	'oblivion-wing',
	'dream-eater',
	'leech-seed'
];

BEAM_MOVES.forEach((move) => {
	specialMoves[move] = beamAnimation;
});

PROJECTILE_MOVES.forEach((move) => {
	specialMoves[move] = projectileAnimation;
});

BURST_MOVES.forEach((move) => {
	specialMoves[move] = burstAnimation;
});

WAVE_MOVES.forEach((move) => {
	specialMoves[move] = waveAnimation;
});

DRAIN_MOVES.forEach((move) => {
	specialMoves[move] = drainAnimation;
});

export function registerSpecialMoves(engine: AnimationEngine): void {
	Object.entries(specialMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
