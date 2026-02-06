import type { Ability, AbilityContext } from '../ability-types';
import { Weather } from '../../battle-field';
import { VolatileStatus } from '../../../pokemons/volatile-status';

// =============================================================================
// TURN END ABILITIES
// =============================================================================

/**
 * Speed Boost - Raises Speed by 1 stage at end of each turn.
 */
export const speedBoost: Ability = {
	id: 3,
	name: 'Speed Boost',
	description: 'Raises Speed at the end of each turn.',
	onTurnEnd: (ctx: AbilityContext): void => {
		ctx.pokemon.changeBattleStats('speed', 1);
	}
};

/**
 * Moody - Raises one stat by 2 stages and lowers another by 1 at turn end.
 */
type StatName = 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

export const moody: Ability = {
	id: 141,
	name: 'Moody',
	description: 'Raises one stat by 2 and lowers another by 1 at the end of each turn.',
	onTurnEnd: (ctx: AbilityContext): void => {
		const stats: StatName[] = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
		const boostStat = stats[Math.floor(Math.random() * stats.length)];
		const lowerStats = stats.filter((s) => s !== boostStat);
		const lowerStat = lowerStats[Math.floor(Math.random() * lowerStats.length)];
		ctx.pokemon.changeBattleStats(boostStat, 2);
		ctx.pokemon.changeBattleStats(lowerStat, -1);
	}
};

/**
 * Poison Heal - Heals 1/8 max HP if poisoned instead of taking damage.
 */
export const poisonHeal: Ability = {
	id: 90,
	name: 'Poison Heal',
	description: 'Heals 1/8 max HP when poisoned instead of taking damage.',
	onTurnEnd: (ctx: AbilityContext): void => {
		const status = ctx.pokemon.status;
		if (status && (status.abr === 'PSN' || status.abr === 'TOX')) {
			const heal = Math.floor(ctx.pokemon.currentStats.hp / 8);
			ctx.pokemon.currentHp = Math.min(ctx.pokemon.currentHp + heal, ctx.pokemon.currentStats.hp);
		}
	}
};

/**
 * Rain Dish - Heals 1/16 max HP in rain at turn end.
 */
export const rainDish: Ability = {
	id: 44,
	name: 'Rain Dish',
	description: 'Heals 1/16 max HP in rain.',
	onTurnEnd: (ctx: AbilityContext): void => {
		if (ctx.battleContext.battleField.weather === Weather.RAIN) {
			const heal = Math.floor(ctx.pokemon.currentStats.hp / 16);
			ctx.pokemon.currentHp = Math.min(ctx.pokemon.currentHp + heal, ctx.pokemon.currentStats.hp);
		}
	}
};

/**
 * Ice Body - Heals 1/16 max HP in hail at turn end.
 */
export const iceBody: Ability = {
	id: 115,
	name: 'Ice Body',
	description: 'Heals 1/16 max HP in hail or snow.',
	onTurnEnd: (ctx: AbilityContext): void => {
		if (ctx.battleContext.battleField.weather === Weather.HAIL) {
			const heal = Math.floor(ctx.pokemon.currentStats.hp / 16);
			ctx.pokemon.currentHp = Math.min(ctx.pokemon.currentHp + heal, ctx.pokemon.currentStats.hp);
		}
	}
};

/**
 * Dry Skin - Heals 1/8 HP in rain, takes 1/8 damage in sun at turn end.
 * Also has Water immunity (see tier3-damage-contact for onTryHit).
 */
export const drySkin: Ability = {
	id: 87,
	name: 'Dry Skin',
	description: 'Heals 1/8 max HP in rain; takes 1/8 damage in sun.',
	onTurnEnd: (ctx: AbilityContext): void => {
		const weather = ctx.battleContext.battleField.weather;
		if (weather === Weather.RAIN) {
			const heal = Math.floor(ctx.pokemon.currentStats.hp / 8);
			ctx.pokemon.currentHp = Math.min(ctx.pokemon.currentHp + heal, ctx.pokemon.currentStats.hp);
		} else if (weather === Weather.SUN) {
			const damage = Math.floor(ctx.pokemon.currentStats.hp / 8);
			ctx.pokemon.currentHp = Math.max(ctx.pokemon.currentHp - damage, 0);
		}
	}
};

/**
 * Shed Skin - 30% chance to cure status at turn end.
 */
export const shedSkin: Ability = {
	id: 61,
	name: 'Shed Skin',
	description: '30% chance to cure status condition at the end of each turn.',
	onTurnEnd: (ctx: AbilityContext): void => {
		if (ctx.pokemon.status && Math.random() < 0.3) {
			ctx.pokemon.status = undefined;
		}
	}
};

/**
 * Hydration - Cures status in rain at turn end.
 */
export const hydration: Ability = {
	id: 93,
	name: 'Hydration',
	description: 'Cures status conditions in rain.',
	onTurnEnd: (ctx: AbilityContext): void => {
		if (ctx.battleContext.battleField.weather === Weather.RAIN && ctx.pokemon.status) {
			ctx.pokemon.status = undefined;
		}
	}
};

/**
 * Healer - 30% chance to cure adjacent ally's status in double battles.
 */
export const healer: Ability = {
	id: 131,
	name: 'Healer',
	description: '30% chance to cure adjacent ally status at turn end.',
	onTurnEnd: (_ctx: AbilityContext): void => {}
};

/**
 * Bad Dreams - Damages sleeping foes 1/8 HP at turn end.
 */
export const badDreams: Ability = {
	id: 123,
	name: 'Bad Dreams',
	description: 'Damages sleeping foes 1/8 max HP at turn end.',
	onTurnEnd: (ctx: AbilityContext): void => {
		const opponents = [...ctx.battleContext.oppSide].filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		opponents.forEach((opp) => {
			if (opp.status?.abr === 'SLP') {
				const damage = Math.floor(opp.currentStats.hp / 8);
				opp.currentHp = Math.max(opp.currentHp - damage, 0);
			}
		});
	}
};

// =============================================================================
// TURN START ABILITIES
// =============================================================================

/**
 * Slow Start - Halves Attack and Speed for the first 5 turns.
 * Uses volatile status to track turns since switch-in.
 */
export const slowStart: Ability = {
	id: 112,
	name: 'Slow Start',
	description: 'Halves Attack and Speed for 5 turns after entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.pokemon.volatiles.add(VolatileStatus.SLOW_START, 5);
	},
	onTurnEnd: (ctx: AbilityContext): void => {
		if (ctx.pokemon.volatiles.has(VolatileStatus.SLOW_START)) {
			const turns = ctx.pokemon.volatiles.getTurns(VolatileStatus.SLOW_START);
			if (turns > 0) {
				ctx.pokemon.volatiles.setTurns(VolatileStatus.SLOW_START, turns - 1);
			} else {
				ctx.pokemon.volatiles.remove(VolatileStatus.SLOW_START);
			}
		}
	},
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		if (ctx.pokemon.volatiles.has(VolatileStatus.SLOW_START)) {
			return Math.floor(attack / 2);
		}
		return attack;
	},
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.pokemon.volatiles.has(VolatileStatus.SLOW_START)) {
			return Math.floor(speed / 2);
		}
		return speed;
	}
};

/**
 * Truant - Can only use a move every other turn.
 */
export const truant: Ability = {
	id: 54,
	name: 'Truant',
	description: 'Can only use a move every other turn; loafs around otherwise.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.pokemon.volatiles.remove(VolatileStatus.TRUANT);
	},
	onBeforeMove: (ctx: AbilityContext): boolean => {
		if (ctx.pokemon.volatiles.has(VolatileStatus.TRUANT)) {
			ctx.pokemon.volatiles.remove(VolatileStatus.TRUANT);
			return false;
		} else {
			ctx.pokemon.volatiles.add(VolatileStatus.TRUANT, 0);
			return true;
		}
	}
};

/**
 * Stall - Always moves last.
 */
export const stall: Ability = {
	id: 100,
	name: 'Stall',
	description: 'Always moves last.',
	priority: -6
};

// =============================================================================
// STATUS IMMUNITY ABILITIES
// =============================================================================

/**
 * Immunity - Prevents poisoning.
 */
export const immunity: Ability = {
	id: 17,
	name: 'Immunity',
	description: 'Prevents the pokemon from being poisoned.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'PSN' || status === 'TOX') {
			return false;
		}
		return true;
	}
};

/**
 * Limber - Prevents paralysis.
 */
export const limber: Ability = {
	id: 7,
	name: 'Limber',
	description: 'Prevents the pokemon from being paralyzed.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'PAR') {
			return false;
		}
		return true;
	}
};

/**
 * Insomnia - Prevents sleep.
 */
export const insomnia: Ability = {
	id: 15,
	name: 'Insomnia',
	description: 'Prevents the pokemon from falling asleep.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'SLP') {
			return false;
		}
		return true;
	}
};

/**
 * Vital Spirit - Prevents sleep.
 */
export const vitalSpirit: Ability = {
	id: 72,
	name: 'Vital Spirit',
	description: 'Prevents the pokemon from falling asleep.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'SLP') {
			return false;
		}
		return true;
	}
};

/**
 * Oblivious - Prevents Infatuation and Taunt.
 */
export const oblivious: Ability = {
	id: 12,
	name: 'Oblivious',
	description: 'Prevents Infatuation and Taunt.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'infatuation' || status === 'taunt') {
			return false;
		}
		return true;
	}
};

/**
 * Own Tempo - Prevents confusion.
 */
export const ownTempo: Ability = {
	id: 20,
	name: 'Own Tempo',
	description: 'Prevents the pokemon from becoming confused.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'confused') {
			return false;
		}
		return true;
	}
};

/**
 * Magma Armor - Prevents freezing.
 */
export const magmaArmor: Ability = {
	id: 40,
	name: 'Magma Armor',
	description: 'Prevents the pokemon from being frozen.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'FRZ') {
			return false;
		}
		return true;
	}
};

/**
 * Water Veil - Prevents burn.
 */
export const waterVeil: Ability = {
	id: 41,
	name: 'Water Veil',
	description: 'Prevents the pokemon from being burned.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'BRN') {
			return false;
		}
		return true;
	}
};

/**
 * Comatose - Always drowsy, immune to other statuses.
 */
export const comatose: Ability = {
	id: 213,
	name: 'Comatose',
	description: 'Always considered asleep but can still attack. Immune to status.',
	onStatus: (_ctx: AbilityContext, _status: string): boolean => {
		return false;
	}
};

/**
 * Pastel Veil - Prevents poison for self and allies.
 */
export const pastelVeil: Ability = {
	id: 257,
	name: 'Pastel Veil',
	description: 'Protects the pokemon and allies from being poisoned.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'PSN' || status === 'TOX') {
			return false;
		}
		return true;
	}
};

/**
 * Sweet Veil - Prevents sleep for self and allies.
 */
export const sweetVeil: Ability = {
	id: 175,
	name: 'Sweet Veil',
	description: 'Prevents the pokemon and allies from falling asleep.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'SLP') {
			return false;
		}
		return true;
	}
};

/**
 * Aroma Veil - Prevents taunt, encore, torment, heal block, disable.
 */
export const aromaVeil: Ability = {
	id: 165,
	name: 'Aroma Veil',
	description: 'Protects allies from attacks that limit move choices.',
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		const blocked = ['taunt', 'encore', 'torment', 'disable', 'heal_block'];
		if (blocked.includes(status)) {
			return false;
		}
		return true;
	}
};

// =============================================================================
// STATUS BOOST ABILITIES
// =============================================================================

/**
 * Guts - 1.5x Attack when statused.
 */
export const guts: Ability = {
	id: 62,
	name: 'Guts',
	description: 'Boosts Attack by 1.5x when the pokemon has a status condition.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		if (ctx.pokemon.status) {
			return Math.floor(attack * 1.5);
		}
		return attack;
	}
};

/**
 * Quick Feet - 1.5x Speed when statused.
 */
export const quickFeet: Ability = {
	id: 95,
	name: 'Quick Feet',
	description: 'Boosts Speed by 1.5x when the pokemon has a status condition.',
	onModifySpe: (ctx: AbilityContext, speed: number): number => {
		if (ctx.pokemon.status) {
			return Math.floor(speed * 1.5);
		}
		return speed;
	}
};

/**
 * Marvel Scale - 1.5x Defense when statused.
 */
export const marvelScale: Ability = {
	id: 63,
	name: 'Marvel Scale',
	description: 'Boosts Defense by 1.5x when the pokemon has a status condition.',
	onModifyDef: (ctx: AbilityContext, defense: number): number => {
		if (ctx.pokemon.status) {
			return Math.floor(defense * 1.5);
		}
		return defense;
	}
};

/**
 * Toxic Boost - 1.5x Attack when poisoned.
 */
export const toxicBoost: Ability = {
	id: 137,
	name: 'Toxic Boost',
	description: 'Boosts Attack by 1.5x when the pokemon is poisoned.',
	onModifyAtk: (ctx: AbilityContext, attack: number): number => {
		const status = ctx.pokemon.status;
		if (status && (status.abr === 'PSN' || status.abr === 'TOX')) {
			return Math.floor(attack * 1.5);
		}
		return attack;
	}
};

/**
 * Flare Boost - 1.5x Special Attack when burned.
 */
export const flareBoost: Ability = {
	id: 138,
	name: 'Flare Boost',
	description: 'Boosts Special Attack by 1.5x when the pokemon is burned.',
	onModifySpA: (ctx: AbilityContext, spAtk: number): number => {
		const status = ctx.pokemon.status;
		if (status && status.abr === 'BRN') {
			return Math.floor(spAtk * 1.5);
		}
		return spAtk;
	}
};

/**
 * Natural Cure - Cures status when switching out.
 */
export const naturalCure: Ability = {
	id: 30,
	name: 'Natural Cure',
	description: 'Cures status conditions when switching out.',
	onSwitchIn: (_ctx: AbilityContext): void => {}
};

/**
 * Synchronize - Passes status to attacker.
 */
export const synchronize: Ability = {
	id: 28,
	name: 'Synchronize',
	description: 'Passes poison, paralysis, or burn to the pokemon that caused it.',
	onStatus: (ctx: AbilityContext, status: string): boolean => {
		if (ctx.target && !ctx.target.status) {
			if (status === 'PSN' || status === 'PAR' || status === 'BRN') {
				ctx.target.status = { abr: status } as any;
			}
		}
		return true;
	}
};

// =============================================================================
// PRIORITY MODIFIERS
// =============================================================================

/**
 * Prankster - Gives +1 priority to status moves.
 * Note: Actual priority check requires move category inspection in battle logic.
 */
export const prankster: Ability = {
	id: 158,
	name: 'Prankster',
	description: 'Gives +1 priority to status moves.',
	priority: 1
};

/**
 * Gale Wings - Gives +1 priority to Flying-type moves at full HP.
 * Note: Gen 7+ only works at full HP.
 */
export const galeWings: Ability = {
	id: 177,
	name: 'Gale Wings',
	description: 'Gives +1 priority to Flying-type moves when at full HP.',
	priority: 1
};

/**
 * Triage - Gives +3 priority to healing moves.
 */
export const triage: Ability = {
	id: 205,
	name: 'Triage',
	description: 'Gives +3 priority to healing moves.',
	priority: 3
};

/**
 * Queenly Majesty - Blocks priority moves from foes.
 */
export const queenlyMajesty: Ability = {
	id: 214,
	name: 'Queenly Majesty',
	description: 'Blocks priority moves from foes.',
	onTryHit: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

/**
 * Dazzling - Blocks priority moves from foes.
 */
export const dazzling: Ability = {
	id: 219,
	name: 'Dazzling',
	description: 'Blocks priority moves from foes.',
	onTryHit: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

// =============================================================================
// ADDITIONAL TURN-BASED ABILITIES
// =============================================================================

/**
 * Harvest - 50% chance (100% in sun) to restore used Berry at turn end.
 */
export const harvest: Ability = {
	id: 139,
	name: 'Harvest',
	description: '50% chance to restore used Berry at turn end (100% in sun).',
	onTurnEnd: (_ctx: AbilityContext): void => {}
};

/**
 * Pickup - May pick up an item after battle.
 */
export const pickup: Ability = {
	id: 53,
	name: 'Pickup',
	description: 'May pick up items after battle.'
};

/**
 * Aftermath - Deals 1/4 max HP to attacker if KOed by contact move.
 */
export const aftermath: Ability = {
	id: 106,
	name: 'Aftermath',
	description: 'Deals 1/4 max HP damage to attacker if KOed by contact move.',
	onFaint: (ctx: AbilityContext): void => {
		if (ctx.target && ctx.move?.category === 'physical') {
			const damage = Math.floor(ctx.pokemon.currentStats.hp / 4);
			ctx.target.currentHp = Math.max(ctx.target.currentHp - damage, 0);
		}
	}
};

/**
 * Innards Out - Deals damage equal to HP before fainting to attacker.
 */
export const innardsOut: Ability = {
	id: 215,
	name: 'Innards Out',
	description: 'Deals damage equal to HP before fainting to attacker.',
	onFaint: (ctx: AbilityContext): void => {
		if (ctx.target) {
			const damage = Math.floor(ctx.pokemon.currentStats.hp / 4);
			ctx.target.currentHp = Math.max(ctx.target.currentHp - damage, 0);
		}
	}
};

// =============================================================================
// EXPORT ALL TIER 4 ABILITIES
// =============================================================================

export const tier4TurnStatusAbilities: Ability[] = [
	// Turn End
	speedBoost,
	moody,
	poisonHeal,
	rainDish,
	iceBody,
	drySkin,
	shedSkin,
	hydration,
	healer,
	badDreams,
	// Turn Start / Movement
	slowStart,
	truant,
	stall,
	// Status Immunity
	immunity,
	limber,
	insomnia,
	vitalSpirit,
	oblivious,
	ownTempo,
	magmaArmor,
	waterVeil,
	comatose,
	pastelVeil,
	sweetVeil,
	aromaVeil,
	// Status Boost
	guts,
	quickFeet,
	marvelScale,
	toxicBoost,
	flareBoost,
	naturalCure,
	synchronize,
	// Priority
	prankster,
	galeWings,
	triage,
	queenlyMajesty,
	dazzling,
	// Additional
	harvest,
	pickup,
	aftermath,
	innardsOut
];
