import type { Ability, AbilityContext } from '../ability-types';

const MOLD_BREAKER_FAMILY = ['mold-breaker', 'teravolt', 'turboblaze'];
const STAT_STAGE_MAX = 6;
const STAT_STAGE_MIN = -6;

// =============================================================================
// STAT CHANGE MODIFIERS
// =============================================================================

export const contrary: Ability = {
	id: 126,
	name: 'Contrary',
	description: 'Makes stat changes have an opposite effect.',
	onStatChange: (_ctx: AbilityContext, _stat: string, change: number): number => {
		if (change === 0) {
			return 0;
		}
		return -change;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const simple: Ability = {
	id: 86,
	name: 'Simple',
	description: 'Doubles the effect of stat changes.',
	onStatChange: (_ctx: AbilityContext, _stat: string, change: number): number => {
		const doubled = change * 2;
		if (doubled > STAT_STAGE_MAX) {
			return STAT_STAGE_MAX;
		}
		if (doubled < STAT_STAGE_MIN) {
			return STAT_STAGE_MIN;
		}
		return doubled;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const unaware: Ability = {
	id: 109,
	name: 'Unaware',
	description: 'Ignores stat changes of the opposing Pokemon when dealing or receiving damage.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

// =============================================================================
// EXIT ABILITIES
// =============================================================================

export const regenerator: Ability = {
	id: 144,
	name: 'Regenerator',
	description: 'Restores 1/3 of max HP upon switching out.',
	onSwitchOut: (ctx: AbilityContext): boolean | void => {
		const maxHp = ctx.pokemon.currentStats.hp;
		const healAmount = Math.floor(maxHp / 3);
		ctx.pokemon.currentHp = Math.min(ctx.pokemon.currentHp + healAmount, maxHp);
		return true;
	}
};

export const naturalCure: Ability = {
	id: 30,
	name: 'Natural Cure',
	description: 'All status conditions are healed upon switching out.',
	onSwitchOut: (ctx: AbilityContext): boolean | void => {
		ctx.pokemon.status = undefined;
		return true;
	}
};

// =============================================================================
// MULTI-HIT ABILITIES
// =============================================================================

const MULTI_HIT_EFFECT_ID = 30;

const SPREAD_TARGETS = new Set([
	'all-opponents',
	'all-other-pokemon',
	'all-pokemon',
	'user-and-allies'
]);

export const parentalBond: Ability = {
	id: 185,
	name: 'Parental Bond',
	description: 'Attacks twice. The second hit deals 25% damage.',
	// Simplified: 1.25x total damage (100% first hit + 25% second hit) instead of a true second hit
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		const move = ctx.move;
		if (!move) {
			return damage;
		}
		if (move.effect?.move_effect_id === MULTI_HIT_EFFECT_ID) {
			return damage;
		}
		if (SPREAD_TARGETS.has(move.target)) {
			return damage;
		}
		return Math.floor(damage * 1.25);
	}
};

export const skillLink: Ability = {
	id: 92,
	name: 'Skill Link',
	description: 'Multi-hit moves always hit 5 times.'
};

// =============================================================================
// FORM CHANGE ABILITIES
// =============================================================================

export const disguise: Ability = {
	id: 209,
	name: 'Disguise',
	description: 'The shroud that covers the Pokemon can protect it from an attack once.',
	onDamagingHit: (ctx: AbilityContext, _damage: number): boolean | void => {
		if (!(ctx.pokemon as any).disguiseBroken) {
			(ctx.pokemon as any).disguiseBroken = true;
			return true;
		}
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const stanceChange: Ability = {
	id: 176,
	name: 'Stance Change',
	description: 'Changes between Blade and Shield Forme based on moves used.'
	// TODO: Implement form change on attacking vs King's Shield
};

export const zenMode: Ability = {
	id: 161,
	name: 'Zen Mode',
	description: 'Changes to Zen Mode when HP drops below half.'
	// TODO: Implement form change when HP < 50%
};

export const battleBond: Ability = {
	id: 210,
	name: 'Battle Bond',
	description: 'Transforms into Ash-Greninja after defeating an opposing Pokemon.'
	// TODO: Implement transformation after KO
};

export const shieldsDown: Ability = {
	id: 197,
	name: 'Shields Down',
	description: 'Changes form when HP drops below half.'
	// TODO: Implement form change when HP < 50%
};

export const schooling: Ability = {
	id: 208,
	name: 'Schooling',
	description: 'Changes to School Form if level 20+ and HP above 25%.'
	// TODO: Implement form change based on level and HP
};

export const powerConstruct: Ability = {
	id: 211,
	name: 'Power Construct',
	description: 'Changes to Complete Forme when HP drops below half.'
	// TODO: Implement form change when HP < 50%
};

// =============================================================================
// SPECIAL CONDITION ABILITIES
// =============================================================================

export const magicGuard: Ability = {
	id: 98,
	name: 'Magic Guard',
	description: 'Only takes damage from attacks.'
};

export const magicBounce: Ability = {
	id: 156,
	name: 'Magic Bounce',
	description: 'Reflects status moves back at the user.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const prankster: Ability = {
	id: 158,
	name: 'Prankster',
	description: 'Gives priority to status moves.',
	priority: 1
};

export const infiltrator: Ability = {
	id: 151,
	name: 'Infiltrator',
	description: 'Ignores screens, Substitute, Mist, and Safeguard.'
};

export const multiScale: Ability = {
	id: 136,
	name: 'Multiscale',
	description: 'Halves damage when at full HP.',
	onSourceModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.pokemon.currentHp === ctx.pokemon.currentStats.hp) {
			return Math.floor(damage / 2);
		}
		return damage;
	},
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const shadowShield: Ability = {
	id: 231,
	name: 'Shadow Shield',
	description: 'Halves damage when at full HP (cannot be suppressed).',
	onSourceModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.pokemon.currentHp === ctx.pokemon.currentStats.hp) {
			return Math.floor(damage / 2);
		}
		return damage;
	}
};

export const prismArmor: Ability = {
	id: 232,
	name: 'Prism Armor',
	description: 'Reduces super-effective damage.'
};

export const solidRock: Ability = {
	id: 116,
	name: 'Solid Rock',
	description: 'Reduces super-effective damage by 25%.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const filter: Ability = {
	id: 111,
	name: 'Filter',
	description: 'Reduces super-effective damage by 25%.',
	suppressedBy: MOLD_BREAKER_FAMILY
};

export const tintedLens: Ability = {
	id: 110,
	name: 'Tinted Lens',
	description: 'Not very effective moves deal double damage.'
};

export const neuroforce: Ability = {
	id: 233,
	name: 'Neuroforce',
	description: 'Powers up super-effective moves by 25%.'
};

// =============================================================================
// ABILITY EXPORT
// =============================================================================

export const tier6ComplexAbilities: Ability[] = [
	contrary,
	simple,
	unaware,
	regenerator,
	naturalCure,
	parentalBond,
	skillLink,
	disguise,
	stanceChange,
	zenMode,
	battleBond,
	shieldsDown,
	schooling,
	powerConstruct,
	magicGuard,
	magicBounce,
	prankster,
	infiltrator,
	multiScale,
	shadowShield,
	prismArmor,
	solidRock,
	filter,
	tintedLens,
	neuroforce
];
