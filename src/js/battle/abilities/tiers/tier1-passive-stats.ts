import type { Ability, AbilityContext } from '../ability-types';
import { Weather } from '../../battle-field';

// =============================================================================
// ATTACK MODIFIERS
// =============================================================================

export const hugePower: Ability = {
	id: 37,
	name: 'Huge Power',
	description: "Doubles the Pokemon's Attack stat.",
	onModifyAtk: (_ctx: AbilityContext, attack: number): number => {
		return attack * 2;
	}
};

export const purePower: Ability = {
	id: 74,
	name: 'Pure Power',
	description: "Doubles the Pokemon's Attack stat.",
	onModifyAtk: (_ctx: AbilityContext, attack: number): number => {
		return attack * 2;
	}
};

export const hustle: Ability = {
	id: 55,
	name: 'Hustle',
	description: 'Boosts Attack by 50%, but lowers accuracy of physical moves.',
	onModifyAtk: (_ctx: AbilityContext, attack: number): number => {
		return Math.floor(attack * 1.5);
	}
};

export const guts: Ability = {
	id: 62,
	name: 'Guts',
	description: 'Boosts Attack by 50% when statused. Ignores burn Attack drop.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		if (ctx.pokemon.status) {
			return Math.floor(attack * 1.5);
		}
		return attack;
	}
};

export const gorillaTactics: Ability = {
	id: 255,
	name: 'Gorilla Tactics',
	description: 'Boosts Attack by 50%, but only the first selected move can be used.',
	onModifyAtk: (_ctx: AbilityContext, attack: number): number => {
		return Math.floor(attack * 1.5);
	}
};

export const toxicBoost: Ability = {
	id: 137,
	name: 'Toxic Boost',
	description: 'Boosts Attack by 50% when poisoned.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		const status = ctx.pokemon.status;
		if (status && (status.abr === 'PSN' || status.abr === 'TOX')) {
			return Math.floor(attack * 1.5);
		}
		return attack;
	}
};

export const flareBoost: Ability = {
	id: 138,
	name: 'Flare Boost',
	description: 'Boosts Special Attack by 50% when burned.',
	onModifySpA: (ctx: AbilityContext, spAtk: number): number => {
		if (ctx.pokemon.status?.abr === 'BRN') {
			return Math.floor(spAtk * 1.5);
		}
		return spAtk;
	}
};

// =============================================================================
// DEFEATIST - NEGATIVE MODIFIER
// =============================================================================

export const defeatist: Ability = {
	id: 129,
	name: 'Defeatist',
	description: 'Halves Attack and Special Attack when HP is below 50%.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		const hpPercent = ctx.pokemon.currentHp / ctx.pokemon.currentStats.hp;
		if (hpPercent < 0.5) {
			return Math.floor(attack * 0.5);
		}
		return attack;
	},
	onModifySpA: (ctx: AbilityContext, spAtk: number): number => {
		const hpPercent = ctx.pokemon.currentHp / ctx.pokemon.currentStats.hp;
		if (hpPercent < 0.5) {
			return Math.floor(spAtk * 0.5);
		}
		return spAtk;
	}
};

// =============================================================================
// DEFENSE MODIFIERS
// =============================================================================

export const furCoat: Ability = {
	id: 169,
	name: 'Fur Coat',
	description: "Doubles the Pokemon's Defense stat.",
	onModifyDef: (_ctx: AbilityContext, defense: number): number => {
		return defense * 2;
	}
};

export const marvelScale: Ability = {
	id: 63,
	name: 'Marvel Scale',
	description: 'Boosts Defense by 50% when statused.',
	onModifyDef: (ctx: AbilityContext, defense: number): number => {
		if (ctx.pokemon.status) {
			return Math.floor(defense * 1.5);
		}
		return defense;
	}
};

export const grassPelt: Ability = {
	id: 179,
	name: 'Grass Pelt',
	description: 'Boosts Defense by 50% on Grassy Terrain.',
	onModifyDef: (ctx: AbilityContext, defense: number): number => {
		if (ctx.battleContext.battleField.terrain === 'grassy') {
			return Math.floor(defense * 1.5);
		}
		return defense;
	}
};

export const iceFace: Ability = {
	id: 248,
	name: 'Ice Face',
	description: 'Nullifies damage from a physical move, then changes form.',
	onModifyDef: (_ctx: AbilityContext, defense: number): number => {
		return defense;
	}
};

export const iceScales: Ability = {
	id: 246,
	name: 'Ice Scales',
	description: 'Halves damage taken from special moves.',
	onSourceModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move?.category === 'special') {
			return Math.floor(damage * 0.5);
		}
		return damage;
	}
};

// =============================================================================
// SPEED MODIFIERS - WEATHER BASED
// =============================================================================

export const chlorophyll: Ability = {
	id: 34,
	name: 'Chlorophyll',
	description: 'Doubles Speed in harsh sunlight.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.SUN) {
			return speed * 2;
		}
		return speed;
	}
};

export const swiftSwim: Ability = {
	id: 33,
	name: 'Swift Swim',
	description: 'Doubles Speed in rain.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.RAIN) {
			return speed * 2;
		}
		return speed;
	}
};

export const sandRush: Ability = {
	id: 146,
	name: 'Sand Rush',
	description: 'Doubles Speed in a sandstorm.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.SAND) {
			return speed * 2;
		}
		return speed;
	}
};

export const slushRush: Ability = {
	id: 202,
	name: 'Slush Rush',
	description: 'Doubles Speed in hail or snow.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.HAIL) {
			return speed * 2;
		}
		return speed;
	}
};

// =============================================================================
// SPEED MODIFIERS - STATUS BASED
// =============================================================================

export const quickFeet: Ability = {
	id: 95,
	name: 'Quick Feet',
	description: 'Boosts Speed by 50% when statused. Ignores paralysis Speed drop.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.pokemon.status) {
			return Math.floor(speed * 1.5);
		}
		return speed;
	}
};

export const unburden: Ability = {
	id: 84,
	name: 'Unburden',
	description: 'Doubles Speed when the held item is lost.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (!ctx.pokemon.heldItem || Object.keys(ctx.pokemon.heldItem).length === 0) {
			return speed * 2;
		}
		return speed;
	}
};

export const surgeSwimmer: Ability = {
	id: 207,
	name: 'Surge Surfer',
	description: 'Doubles Speed on Electric Terrain.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.battleContext.battleField.terrain === 'electric') {
			return speed * 2;
		}
		return speed;
	}
};

// =============================================================================
// SPECIAL ATTACK MODIFIERS
// =============================================================================

export const solarPower: Ability = {
	id: 94,
	name: 'Solar Power',
	description: 'Boosts Special Attack by 50% in harsh sunlight, but takes residual damage.',
	onModifySpA: (ctx: AbilityContext, spAtk: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.SUN) {
			return Math.floor(spAtk * 1.5);
		}
		return spAtk;
	}
};

export const transistor: Ability = {
	id: 262,
	name: 'Transistor',
	description: 'Powers up Electric-type moves by 50%.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		if (ctx.move?.type === 'electric') {
			return Math.floor(attack * 1.5);
		}
		return attack;
	},
	onModifySpA: (ctx: AbilityContext, spAtk: number): number => {
		if (ctx.move?.type === 'electric') {
			return Math.floor(spAtk * 1.5);
		}
		return spAtk;
	}
};

export const dragonsMaw: Ability = {
	id: 263,
	name: "Dragon's Maw",
	description: 'Powers up Dragon-type moves by 50%.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		if (ctx.move?.type === 'dragon') {
			return Math.floor(attack * 1.5);
		}
		return attack;
	},
	onModifySpA: (ctx: AbilityContext, spAtk: number): number => {
		if (ctx.move?.type === 'dragon') {
			return Math.floor(spAtk * 1.5);
		}
		return spAtk;
	}
};

export const plusMinus: Ability = {
	id: 57,
	name: 'Plus/Minus',
	description: 'Boosts Special Attack by 50% if an ally has Plus or Minus.',
	onModifySpA: (_ctx: AbilityContext, spAtk: number): number => {
		return spAtk;
	}
};

// =============================================================================
// SPECIAL DEFENSE MODIFIERS
// =============================================================================

export const flowerVeil: Ability = {
	id: 166,
	name: 'Flower Veil',
	description: 'Prevents stat lowering of Grass-type allies.',
	onModifySpD: (_ctx: AbilityContext, spDef: number): number => {
		return spDef;
	}
};

// =============================================================================
// TYPE-SPECIFIC DAMAGE MODIFIERS
// =============================================================================

export const thickFat: Ability = {
	id: 47,
	name: 'Thick Fat',
	description: 'Halves damage from Fire and Ice-type moves.',
	onSourceModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move?.type === 'fire' || ctx.move?.type === 'ice') {
			return Math.floor(damage * 0.5);
		}
		return damage;
	}
};

export const waterBubble: Ability = {
	id: 199,
	name: 'Water Bubble',
	description: 'Halves Fire damage taken and doubles Water move power.',
	onSourceModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move?.type === 'fire') {
			return Math.floor(damage * 0.5);
		}
		return damage;
	},
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move?.type === 'water') {
			return damage * 2;
		}
		return damage;
	}
};

export const steelworker: Ability = {
	id: 200,
	name: 'Steelworker',
	description: 'Powers up Steel-type moves by 50%.',
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move?.type === 'steel') {
			return Math.floor(damage * 1.5);
		}
		return damage;
	}
};

export const heatproof: Ability = {
	id: 85,
	name: 'Heatproof',
	description: 'Halves damage from Fire-type moves and burn damage.',
	onSourceModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move?.type === 'fire') {
			return Math.floor(damage * 0.5);
		}
		return damage;
	}
};

// =============================================================================
// DAMAGE BOOST ABILITIES (require damage hook)
// =============================================================================

export const sniper: Ability = {
	id: 97,
	name: 'Sniper',
	description: 'Powers up moves on critical hits. (1.5x -> 2.25x)',
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.pokemon.lastHitCritical) {
			return Math.floor(damage * 1.5);
		}
		return damage;
	}
};

export const adaptability: Ability = {
	id: 91,
	name: 'Adaptability',
	description: 'Powers up moves of the same type as the Pokemon (STAB: 1.5x -> 2x).',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const stakeout: Ability = {
	id: 198,
	name: 'Stakeout',
	description: 'Doubles damage on switching Pokemon.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const analytic: Ability = {
	id: 148,
	name: 'Analytic',
	description: 'Boosts move power by 30% if the user moves last.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const technician: Ability = {
	id: 101,
	name: 'Technician',
	description: 'Powers up moves with base power of 60 or less by 50%.',
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.move && ctx.move.power <= 60) {
			return Math.floor(damage * 1.5);
		}
		return damage;
	}
};

export const ironFist: Ability = {
	id: 89,
	name: 'Iron Fist',
	description: 'Powers up punching moves by 20%.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const strongJaw: Ability = {
	id: 173,
	name: 'Strong Jaw',
	description: 'Powers up biting moves by 50%.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const megaLauncher: Ability = {
	id: 178,
	name: 'Mega Launcher',
	description: 'Powers up aura and pulse moves by 50%.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const reckless: Ability = {
	id: 120,
	name: 'Reckless',
	description: 'Powers up recoil moves by 20%.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const sheerForce: Ability = {
	id: 125,
	name: 'Sheer Force',
	description: 'Powers up moves with secondary effects by 30%, but removes the effects.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const toughClaws: Ability = {
	id: 181,
	name: 'Tough Claws',
	description: 'Powers up contact moves by 30%.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const punkRock: Ability = {
	id: 244,
	name: 'Punk Rock',
	description: 'Powers up sound moves by 30% and halves sound damage taken.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const steelySpirit: Ability = {
	id: 252,
	name: 'Steely Spirit',
	description: 'Powers up Steel-type moves of allies by 50%.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const sandForce: Ability = {
	id: 159,
	name: 'Sand Force',
	description: 'Boosts Rock, Ground, and Steel moves by 30% in sandstorm.',
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.SAND) {
			if (ctx.move?.type === 'rock' || ctx.move?.type === 'ground' || ctx.move?.type === 'steel') {
				return Math.floor(damage * 1.3);
			}
		}
		return damage;
	}
};

// =============================================================================
// ALLY BOOST ABILITIES
// =============================================================================

export const flowerGift: Ability = {
	id: 122,
	name: 'Flower Gift',
	description: 'Boosts Attack and Sp. Def of self and allies in sun.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.SUN) {
			return Math.floor(attack * 1.5);
		}
		return attack;
	},
	onModifySpD: (ctx: AbilityContext, spDef: number): number => {
		if (ctx.battleContext.battleField.weather === Weather.SUN) {
			return Math.floor(spDef * 1.5);
		}
		return spDef;
	}
};

export const victoryStarAura: Ability = {
	id: 162,
	name: 'Victory Star',
	description: 'Boosts accuracy of self and allies by 10%.',
	onModifyAtk: (_ctx: AbilityContext, attack: number): number => {
		return attack;
	}
};

// =============================================================================
// MISC PASSIVE ABILITIES
// =============================================================================

export const rivalry: Ability = {
	id: 79,
	name: 'Rivalry',
	description: 'Deals more damage to same-gender foes, less to opposite.',
	onModifyDamage: (_ctx: AbilityContext, damage: number): number => {
		return damage;
	}
};

export const overcoat: Ability = {
	id: 142,
	name: 'Overcoat',
	description: 'Protects against damage from weather.'
};

// =============================================================================
// EXPORT ALL TIER 1 ABILITIES
// =============================================================================

export const tier1PassiveStatAbilities: Ability[] = [
	hugePower,
	purePower,
	hustle,
	guts,
	gorillaTactics,
	toxicBoost,
	flareBoost,
	defeatist,
	furCoat,
	marvelScale,
	grassPelt,
	iceFace,
	iceScales,
	chlorophyll,
	swiftSwim,
	sandRush,
	slushRush,
	quickFeet,
	unburden,
	surgeSwimmer,
	solarPower,
	transistor,
	dragonsMaw,
	plusMinus,
	flowerVeil,
	thickFat,
	waterBubble,
	steelworker,
	heatproof,
	sniper,
	adaptability,
	stakeout,
	analytic,
	technician,
	ironFist,
	strongJaw,
	megaLauncher,
	reckless,
	sheerForce,
	toughClaws,
	punkRock,
	steelySpirit,
	sandForce,
	flowerGift,
	victoryStarAura,
	rivalry,
	overcoat
];
