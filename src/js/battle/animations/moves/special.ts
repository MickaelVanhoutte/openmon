import { type AnimationEngine, type MoveContext, type MoveAnimation } from '../animation-engine';

export const specialMoves: Record<string, MoveAnimation> = {};

async function beamAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	const { defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;

	const typeColors: Record<string, string> = {
		fire: '#ff6600',
		water: '#3399ff',
		electric: '#ffcc00',
		grass: '#66cc66',
		ice: '#66ccff',
		psychic: '#ff66cc',
		dragon: '#7766ee',
		dark: '#665544',
		fairy: '#ffaaff',
		normal: '#aaaaaa',
		fighting: '#cc6633',
		poison: '#aa55aa',
		ground: '#ddbb55',
		flying: '#8899ff',
		bug: '#aabb22',
		rock: '#bbaa66',
		ghost: '#6666bb',
		steel: '#aaaabb'
	};

	const color = typeColors[moveType.toLowerCase()] || '#ffffff';

	const gsap = (await import('gsap')).default;

	await new Promise<void>((resolve) => {
		const timeline = gsap.timeline({ onComplete: resolve });
		timeline
			.to(target.element, {
				filter: `brightness(2) drop-shadow(0 0 10px ${color})`,
				duration: 0.1
			})
			.to(target.element, {
				filter: 'brightness(1) drop-shadow(0 0 0 transparent)',
				duration: 0.1
			});
	});

	await engine.shake(target.element, 6, 150);
}

async function projectileAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await beamAnimation(engine, context);
}

async function burstAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await beamAnimation(engine, context);
}

async function waveAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await beamAnimation(engine, context);
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

export function registerSpecialMoves(engine: AnimationEngine): void {
	Object.entries(specialMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
