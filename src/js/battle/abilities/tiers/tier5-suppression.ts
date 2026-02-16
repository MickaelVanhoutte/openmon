import type { Ability, AbilityContext } from '../ability-types';

const MOLD_BREAKER_FAMILY = ['mold-breaker', 'teravolt', 'turboblaze'];

const UNCOPYABLE_ABILITIES = [
	'trace',
	'forecast',
	'flower-gift',
	'zen-mode',
	'illusion',
	'imposter',
	'stance-change',
	'power-of-alchemy',
	'receiver',
	'schooling',
	'comatose',
	'shields-down',
	'disguise',
	'battle-bond',
	'power-construct',
	'rks-system',
	'gulp-missile',
	'ice-face',
	'hunger-switch',
	'as-one',
	'neutralizing-gas'
];

const BLOCKED_EXPLOSION_MOVES = ['explosion', 'self-destruct', 'misty-explosion'];

function toKebabCase(str: string): string {
	if (!str) {
		return '';
	}
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

function isUncopyable(abilityName: string): boolean {
	return UNCOPYABLE_ABILITIES.includes(toKebabCase(abilityName));
}

export const moldBreaker: Ability = {
	id: 104,
	name: 'Mold Breaker',
	description: "Ignores the target's Ability when attacking.",
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Display message: "[Pokemon] breaks the mold!"
	}
};

export const teravolt: Ability = {
	id: 164,
	name: 'Teravolt',
	description: "Ignores the target's Ability when attacking.",
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Display message: "[Pokemon] is radiating Teravolt!"
	}
};

export const turboblaze: Ability = {
	id: 163,
	name: 'Turboblaze',
	description: "Ignores the target's Ability when attacking.",
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Display message: "[Pokemon] is radiating Turboblaze!"
	}
};

export const neutralizingGas: Ability = {
	id: 256,
	name: 'Neutralizing Gas',
	description: 'All other Abilities are suppressed while this Pokemon is on the field.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.neutralizingGasActive = true;
		return true;
	},
	onSwitchOut: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.neutralizingGasActive = false;
		return true;
	}
};

export const mummy: Ability = {
	id: 152,
	name: 'Mummy',
	description: "Contact changes the attacker's Ability to Mummy.",
	onDamagingHit: (ctx: AbilityContext, _damage: number): boolean | void => {
		if (ctx.move?.category === 'physical' && ctx.target) {
			ctx.target.currentAbility = 'Mummy';
			return true;
		}
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const lingeringAroma: Ability = {
	id: 298,
	name: 'Lingering Aroma',
	description: "Contact changes the attacker's Ability to Lingering Aroma.",
	onDamagingHit: (ctx: AbilityContext, _damage: number): boolean | void => {
		if (ctx.move?.category === 'physical' && ctx.target) {
			ctx.target.currentAbility = 'Lingering Aroma';
			return true;
		}
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const wanderingSpirit: Ability = {
	id: 254,
	name: 'Wandering Spirit',
	description: 'Swaps Ability with the attacker on contact.',
	onDamagingHit: (ctx: AbilityContext, _damage: number): boolean | void => {
		if (ctx.move?.category === 'physical' && ctx.target) {
			const attackerAbility = ctx.target.currentAbility;
			const defenderAbility = ctx.pokemon.currentAbility;
			if (attackerAbility && defenderAbility && !isUncopyable(attackerAbility)) {
				ctx.target.currentAbility = defenderAbility;
				ctx.pokemon.currentAbility = attackerAbility;
				return true;
			}
		}
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const trace: Ability = {
	id: 36,
	name: 'Trace',
	description: "Copies a random opposing Pokemon's Ability on switch-in.",
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		if (opponents.length === 0) {
			return;
		}

		const validOpponents = opponents.filter(
			(opp) => opp.currentAbility && !isUncopyable(opp.currentAbility)
		);
		if (validOpponents.length > 0) {
			const randomOpponent = validOpponents[Math.floor(Math.random() * validOpponents.length)];
			ctx.pokemon.currentAbility = randomOpponent.currentAbility;
			return true;
		}
	}
};

export const receiver: Ability = {
	id: 222,
	name: 'Receiver',
	description: "Copies a fainted ally's Ability.",
	onFaint: (ctx: AbilityContext): boolean | void => {
		const faintedAlly = (ctx.battleContext as any).faintedAlly;
		if (faintedAlly && faintedAlly.currentAbility && !isUncopyable(faintedAlly.currentAbility)) {
			ctx.pokemon.currentAbility = faintedAlly.currentAbility;
			return true;
		}
	}
};

export const powerOfAlchemy: Ability = {
	id: 223,
	name: 'Power of Alchemy',
	description: "Copies a fainted ally's Ability.",
	onFaint: (ctx: AbilityContext): boolean | void => {
		const faintedAlly = (ctx.battleContext as any).faintedAlly;
		if (faintedAlly && faintedAlly.currentAbility && !isUncopyable(faintedAlly.currentAbility)) {
			ctx.pokemon.currentAbility = faintedAlly.currentAbility;
			return true;
		}
	}
};

export const damp: Ability = {
	id: 6,
	name: 'Damp',
	description: 'Prevents Explosion, Self-Destruct, and Aftermath.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move) {
			const moveKey = toKebabCase(ctx.move.name);
			if (BLOCKED_EXPLOSION_MOVES.includes(moveKey)) {
				return false;
			}
		}
		return true;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const corrosion: Ability = {
	id: 212,
	name: 'Corrosion',
	description: 'Can poison Steel and Poison-type Pokemon.'
};

export const myceliumMight: Ability = {
	id: 299,
	name: 'Mycelium Might',
	description: 'Status moves always go last but ignore target Abilities.',
	onBeforeMove: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

export const unseenFist: Ability = {
	id: 260,
	name: 'Unseen Fist',
	description: 'Contact moves bypass Protect-like moves.'
};

export const mindsEye: Ability = {
	id: 302,
	name: "Mind's Eye",
	description: 'Ignores evasion and hits Ghost-types with Normal/Fighting moves.'
};

export const scrappy: Ability = {
	id: 113,
	name: 'Scrappy',
	description: 'Normal and Fighting moves can hit Ghost-types.'
};

export const armorTail: Ability = {
	id: 296,
	name: 'Armor Tail',
	description: 'Opponent cannot use priority moves.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const queenlyMajesty: Ability = {
	id: 214,
	name: 'Queenly Majesty',
	description: 'Opponent cannot use priority moves.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const dazzling: Ability = {
	id: 219,
	name: 'Dazzling',
	description: 'Opponent cannot use priority moves.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const innerFocus: Ability = {
	id: 39,
	name: 'Inner Focus',
	description: 'Prevents flinching and Intimidate.'
};

export const rattled: Ability = {
	id: 155,
	name: 'Rattled',
	description: 'Boosts Speed when hit by Bug, Dark, or Ghost moves, or Intimidated.',
	onStatChange: (ctx: AbilityContext, stat: string, change: number): number => {
		if (stat === 'attack' && change < 0) {
			ctx.pokemon.changeBattleStats('speed', 1);
		}
		return change;
	}
};

export const competitive: Ability = {
	id: 174,
	name: 'Competitive',
	description: 'Boosts Sp. Atk by 2 stages when any stat is lowered.',
	onStatChange: (ctx: AbilityContext, _stat: string, change: number): number => {
		if (change < 0) {
			ctx.pokemon.changeBattleStats('specialAttack', 2);
		}
		return change;
	}
};

export const defiant: Ability = {
	id: 128,
	name: 'Defiant',
	description: 'Boosts Attack by 2 stages when any stat is lowered.',
	onStatChange: (ctx: AbilityContext, _stat: string, change: number): number => {
		if (change < 0) {
			ctx.pokemon.changeBattleStats('attack', 2);
		}
		return change;
	}
};

export const mirrorArmor: Ability = {
	id: 240,
	name: 'Mirror Armor',
	description: 'Reflects stat-lowering effects back to the attacker.',
	onStatChange: (ctx: AbilityContext, stat: string, change: number): number => {
		if (change < 0 && ctx.target) {
			ctx.target.changeBattleStats(
				stat as 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed',
				change
			);
			return 0;
		}
		return change;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const clearBody: Ability = {
	id: 29,
	name: 'Clear Body',
	description: 'Prevents stat reduction by other Pokemon.',
	onStatChange: (_ctx: AbilityContext, _stat: string, change: number): number => {
		if (change < 0) {
			return 0;
		}
		return change;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const whitesmoke: Ability = {
	id: 73,
	name: 'White Smoke',
	description: 'Prevents stat reduction by other Pokemon.',
	onStatChange: (_ctx: AbilityContext, _stat: string, change: number): number => {
		if (change < 0) {
			return 0;
		}
		return change;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const fullMetalBody: Ability = {
	id: 230,
	name: 'Full Metal Body',
	description: 'Prevents stat reduction by other Pokemon (cannot be suppressed).',
	onStatChange: (_ctx: AbilityContext, _stat: string, change: number): number => {
		if (change < 0) {
			return 0;
		}
		return change;
	}
};

export const tier5SuppressionAbilities: Ability[] = [
	moldBreaker,
	teravolt,
	turboblaze,
	neutralizingGas,
	mummy,
	lingeringAroma,
	wanderingSpirit,
	trace,
	receiver,
	powerOfAlchemy,
	damp,
	corrosion,
	myceliumMight,
	unseenFist,
	mindsEye,
	scrappy,
	armorTail,
	queenlyMajesty,
	dazzling,
	innerFocus,
	rattled,
	competitive,
	defiant,
	mirrorArmor,
	clearBody,
	whitesmoke,
	fullMetalBody
];
