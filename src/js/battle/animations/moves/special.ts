import { type AnimationEngine, type MoveContext, type MoveAnimation } from '../animation-engine';

export const specialMoves: Record<string, MoveAnimation> = {};

async function beamAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function projectileAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function burstAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function waveAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
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
