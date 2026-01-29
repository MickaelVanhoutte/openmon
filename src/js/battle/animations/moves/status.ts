import { type AnimationEngine, type MoveContext, type MoveAnimation } from '../animation-engine';

export const statusMoves: Record<string, MoveAnimation> = {};

async function buffAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function debuffAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function healAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
}

async function statusConditionAnimation(
	engine: AnimationEngine,
	context: MoveContext
): Promise<void> {
	await engine.wait(50);
}

async function protectAnimation(engine: AnimationEngine, context: MoveContext): Promise<void> {
	await engine.wait(50);
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
	'growth',
	'curse',
	'belly-drum',
	'shift-gear',
	'cotton-guard',
	'iron-defense',
	'acid-armor',
	'barrier',
	'amnesia',
	'cosmic-power',
	'defend-order',
	'stockpile',
	'minimize',
	'double-team',
	'autotomize',
	'charge',
	'focus-energy',
	'meditate',
	'sharpen',
	'acupressure',
	'ancient-power',
	'geomancy',
	'extreme-evoboost'
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
	'venom-drench'
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
	'giga-drain',
	'mega-drain',
	'absorb',
	'drain-punch',
	'horn-leech',
	'oblivion-wing',
	'parabolic-charge',
	'strength-sap',
	'life-dew',
	'floral-healing',
	'heal-pulse',
	'pollen-puff',
	'jungle-healing'
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
	'toxic-spikes',
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
	'perish-song'
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

export function registerStatusMoves(engine: AnimationEngine): void {
	Object.entries(statusMoves).forEach(([name, animation]) => {
		engine.registerMove(name, animation);
	});
}
