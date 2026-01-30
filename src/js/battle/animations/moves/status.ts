import {
	type AnimationEngine,
	type MoveContext,
	type MoveAnimation,
	TYPE_HUE_ANGLES
} from '../animation-engine';

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
			tint: color
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

	await engine.showSpriteEffect('debuff', target, { hueRotate: hue, scale: 1.2, tint: color });

	const gsap = (await import('gsap')).default;
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
			tint: healColor
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
	const { defender, moveType } = context;
	const target = Array.isArray(defender) ? defender[0] : defender;
	const hue = TYPE_HUE_ANGLES[moveType] ?? 0;
	const color = engine.getTypeColor(moveType);

	await engine.showSpriteEffect('psychic', target, { hueRotate: hue, scale: 1.3, tint: color });

	const gsap = (await import('gsap')).default;
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

	const gsap = (await import('gsap')).default;

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
