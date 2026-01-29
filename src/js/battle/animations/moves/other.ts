import { type AnimationEngine, type MoveContext, type MoveAnimation } from '../animation-engine';

export const otherMoves: Record<string, MoveAnimation> = {};

async function multiHitAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function ohkoAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function fieldAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function transformAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function weatherAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function terrainAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

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

export function registerOtherMoves(engine: AnimationEngine): void {
	Object.entries(otherMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
