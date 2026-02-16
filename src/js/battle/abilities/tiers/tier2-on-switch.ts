import type { Ability, AbilityContext } from '../ability-types';
import { Weather, Terrain } from '../../battle-field';
import { applyWeather } from '../../../pokemons/effects/weather-effects';
import { VolatileStatus } from '../../../pokemons/volatile-status';
import { Message } from '../../actions/actions-derived';
import { PlayStatChange, PlayWeatherChange } from '../../actions/actions-derived';

// =============================================================================
// STAT-LOWERING ON-SWITCH ABILITIES
// =============================================================================

export const intimidate: Ability = {
	id: 22,
	name: 'Intimidate',
	description: "Lowers opposing Pokemon's Attack by one stage when it enters battle.",
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.changeBattleStats('attack', -1);
			ctx.battleContext.addToStack(new PlayStatChange(opponent, 'attack', -1, ctx.pokemon));
			ctx.battleContext.addToStack(new Message(`${opponent.name}'s Attack fell!`, ctx.pokemon));
		}
		return true;
	}
};

// =============================================================================
// WEATHER SETTING ABILITIES
// =============================================================================

export const drizzle: Ability = {
	id: 2,
	name: 'Drizzle',
	description: 'Summons rain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		applyWeather(ctx.battleContext.battleField, Weather.RAIN, 5, ctx.pokemon);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.RAIN, ctx.pokemon));
		ctx.battleContext.addToStack(new Message('It started to rain!', ctx.pokemon));
		return true;
	}
};

export const drought: Ability = {
	id: 70,
	name: 'Drought',
	description: 'Summons harsh sunlight when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		applyWeather(ctx.battleContext.battleField, Weather.SUN, 5, ctx.pokemon);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.SUN, ctx.pokemon));
		ctx.battleContext.addToStack(new Message('The sunlight turned harsh!', ctx.pokemon));
		return true;
	}
};

export const sandStream: Ability = {
	id: 45,
	name: 'Sand Stream',
	description: 'Summons a sandstorm when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		applyWeather(ctx.battleContext.battleField, Weather.SAND, 5, ctx.pokemon);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.SAND, ctx.pokemon));
		ctx.battleContext.addToStack(new Message('A sandstorm kicked up!', ctx.pokemon));
		return true;
	}
};

export const snowWarning: Ability = {
	id: 117,
	name: 'Snow Warning',
	description: 'Summons hail when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		applyWeather(ctx.battleContext.battleField, Weather.HAIL, 5, ctx.pokemon);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.HAIL, ctx.pokemon));
		ctx.battleContext.addToStack(new Message('It started to hail!', ctx.pokemon));
		return true;
	}
};

// Primal weather setters
export const primordialSea: Ability = {
	id: 189,
	name: 'Primordial Sea',
	description: 'Summons heavy rain that cannot be replaced.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		applyWeather(ctx.battleContext.battleField, Weather.RAIN, 5, ctx.pokemon);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.RAIN, ctx.pokemon));
		ctx.battleContext.addToStack(new Message('A heavy rain began to fall!', ctx.pokemon));
		return true;
	}
};

export const desolateLand: Ability = {
	id: 190,
	name: 'Desolate Land',
	description: 'Summons extremely harsh sunlight that cannot be replaced.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		applyWeather(ctx.battleContext.battleField, Weather.SUN, 5, ctx.pokemon);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.SUN, ctx.pokemon));
		ctx.battleContext.addToStack(new Message('The sunlight turned extremely harsh!', ctx.pokemon));
		return true;
	}
};

export const deltaStream: Ability = {
	id: 191,
	name: 'Delta Stream',
	description: 'Summons strong winds that weaken Flying-type weaknesses.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setWeather(Weather.STRONG_WINDS, 0);
		ctx.battleContext.addToStack(
			new Message('A mysterious air current is protecting Flying-type Pokemon!', ctx.pokemon)
		);
		return true;
	}
};

// =============================================================================
// TERRAIN SETTING ABILITIES
// =============================================================================

export const electricSurge: Ability = {
	id: 226,
	name: 'Electric Surge',
	description: 'Summons Electric Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setTerrain(Terrain.ELECTRIC);
		ctx.battleContext.addToStack(
			new Message('An electric current ran across the battlefield!', ctx.pokemon)
		);
		return true;
	}
};

export const grassySurge: Ability = {
	id: 229,
	name: 'Grassy Surge',
	description: 'Summons Grassy Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setTerrain(Terrain.GRASSY);
		ctx.battleContext.addToStack(new Message('Grass grew to cover the battlefield!', ctx.pokemon));
		return true;
	}
};

export const psychicSurge: Ability = {
	id: 227,
	name: 'Psychic Surge',
	description: 'Summons Psychic Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setTerrain(Terrain.PSYCHIC);
		ctx.battleContext.addToStack(new Message('The battlefield got weird!', ctx.pokemon));
		return true;
	}
};

export const mistySurge: Ability = {
	id: 228,
	name: 'Misty Surge',
	description: 'Summons Misty Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setTerrain(Terrain.MISTY);
		ctx.battleContext.addToStack(new Message('Mist swirled around the battlefield!', ctx.pokemon));
		return true;
	}
};

// =============================================================================
// ABILITY-COPYING ABILITIES
// =============================================================================

// =============================================================================
// STAT-BOOSTING ON-SWITCH ABILITIES
// =============================================================================

export const download: Ability = {
	id: 88,
	name: 'Download',
	description: "Boosts Attack or Sp. Atk based on opposing Pokemon's weaker defense.",
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		if (opponents.length === 0) {
			return;
		}

		let totalDef = 0;
		let totalSpDef = 0;
		for (const opponent of opponents) {
			totalDef += opponent.battleStats.defense;
			totalSpDef += opponent.battleStats.specialDefense;
		}

		if (totalDef < totalSpDef) {
			ctx.pokemon.changeBattleStats('attack', 1);
		} else {
			ctx.pokemon.changeBattleStats('specialAttack', 1);
		}
		return true;
	}
};

export const intrepidSword: Ability = {
	id: 264,
	name: 'Intrepid Sword',
	description: 'Boosts Attack by one stage when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.pokemon.changeBattleStats('attack', 1);
		return true;
	}
};

export const dauntlessShield: Ability = {
	id: 265,
	name: 'Dauntless Shield',
	description: 'Boosts Defense by one stage when entering battle.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.pokemon.changeBattleStats('defense', 1);
		return true;
	}
};

// =============================================================================
// VOLATILE STATUS SETTING ABILITIES
// =============================================================================

export const unnerve: Ability = {
	id: 127,
	name: 'Unnerve',
	description: 'Prevents opposing Pokemon from using held Berries.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.volatiles.add(VolatileStatus.UNNERVED);
		}
		return true;
	}
};

// =============================================================================
// INFORMATION/REVEAL ABILITIES
// =============================================================================

export const frisk: Ability = {
	id: 119,
	name: 'Frisk',
	description: "Reveals an opposing Pokemon's held item on switch-in.",
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		let foundItem = false;
		for (const opponent of opponents) {
			if (opponent.heldItem) {
				ctx.battleContext.addToStack(
					new Message(
						`${ctx.pokemon.name} frisked ${opponent.name} and found its ${opponent.heldItem.name}!`,
						ctx.pokemon
					)
				);
				foundItem = true;
			}
		}
		if (foundItem) {
			return true;
		}
	}
};

export const anticipation: Ability = {
	id: 107,
	name: 'Anticipation',
	description: 'Shudders when entering if any opponent has a super-effective or OHKO move.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		const OHKO_MOVES = ['guillotine', 'horn-drill', 'fissure', 'sheer-cold'];

		for (const opponent of opponents) {
			for (const move of opponent.moves) {
				if (OHKO_MOVES.includes(move.name.toLowerCase())) {
					ctx.battleContext.addToStack(new Message(`${ctx.pokemon.name} shuddered!`, ctx.pokemon));
					return true;
				}

				const effectiveness = ctx.battleContext.calculateTypeEffectiveness(
					move.type,
					ctx.pokemon.types
				);
				if (effectiveness > 1) {
					ctx.battleContext.addToStack(new Message(`${ctx.pokemon.name} shuddered!`, ctx.pokemon));
					return true;
				}
			}
		}
	}
};

export const forewarn: Ability = {
	id: 108,
	name: 'Forewarn',
	description: "Reveals the opponent's strongest move on switch-in.",
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);

		let strongestMove: { move: string; power: number } | undefined;

		for (const opponent of opponents) {
			for (const move of opponent.moves) {
				if (move.power > 0) {
					if (!strongestMove || move.power > strongestMove.power) {
						strongestMove = { move: move.name, power: move.power };
					}
				}
			}
		}

		if (strongestMove) {
			ctx.battleContext.addToStack(
				new Message(
					`${ctx.pokemon.name}'s Forewarn alerted it to ${strongestMove.move}!`,
					ctx.pokemon
				)
			);
			return true;
		}
	}
};

// =============================================================================
// WEATHER SUPPRESSION ABILITIES
// =============================================================================

export const airLock: Ability = {
	id: 76,
	name: 'Air Lock',
	description: 'Negates all weather effects.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setWeather(Weather.NONE);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.NONE, ctx.pokemon));
		return true;
	}
};

export const cloudNine: Ability = {
	id: 13,
	name: 'Cloud Nine',
	description: 'Negates all weather effects.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.setWeather(Weather.NONE);
		ctx.battleContext.addToStack(new PlayWeatherChange(Weather.NONE, ctx.pokemon));
		return true;
	}
};

// =============================================================================
// ABILITY SUPPRESSION ABILITIES
// =============================================================================

// =============================================================================
// INTIMIDATION/PRESSURE ABILITIES
// =============================================================================

export const pressure: Ability = {
	id: 46,
	name: 'Pressure',
	description: "Raises the opponent's PP usage.",
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.addToStack(
			new Message(`${ctx.pokemon.name} is exerting its Pressure!`, ctx.pokemon)
		);
		// TODO: PP deduction needs battle action loop integration
		// When opponent uses a move targeting this Pokemon, deduct 2 PP instead of 1
		// Currently, PP deduction is not implemented in the battle system
		return true;
	}
};

// =============================================================================
// MOLD BREAKER FAMILY (Ability-Ignoring)
// =============================================================================

// =============================================================================
// ADDITIONAL ON-SWITCH ABILITIES
// =============================================================================

export const screenCleaner: Ability = {
	id: 251,
	name: 'Screen Cleaner',
	description: 'Removes Light Screen and Reflect from both sides on switch-in.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		ctx.battleContext.battleField.allySide.screens.clear();
		ctx.battleContext.battleField.enemySide.screens.clear();
		return true;
	}
};

export const asOneIce: Ability = {
	id: 267,
	name: 'As One (Ice)',
	description: 'Combines Unnerve and Chilling Neigh.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		// Unnerve effect
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.volatiles.add(VolatileStatus.UNNERVED);
		}
		return true;
	}
};

export const asOneShadow: Ability = {
	id: 268,
	name: 'As One (Shadow)',
	description: 'Combines Unnerve and Grim Neigh.',
	onSwitchIn: (ctx: AbilityContext): boolean | void => {
		// Unnerve effect
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.volatiles.add(VolatileStatus.UNNERVED);
		}
		return true;
	}
};

export const curiousMedicine: Ability = {
	id: 261,
	name: 'Curious Medicine',
	description: "Resets allies' stat changes on switch-in.",
	onSwitchIn: (ctx: AbilityContext): void => {
		const allies = ctx.battleContext.playerSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted && p !== ctx.pokemon
		);
		for (const ally of allies) {
			ally.resetBattleStats();
		}
	}
};

export const pastelVeil: Ability = {
	id: 257,
	name: 'Pastel Veil',
	description: 'Cures allies of Poison on switch-in and prevents Poison.',
	onSwitchIn: (ctx: AbilityContext): void => {
		const allies = ctx.battleContext.playerSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const ally of allies) {
			if (ally.status?.abr === 'PSN' || ally.status?.abr === 'TOX') {
				ally.status = undefined;
			}
		}
	},
	onStatus: (_ctx: AbilityContext, status: string): boolean => {
		if (status === 'PSN' || status === 'TOX') {
			return false;
		}
		return true;
	}
};

export const fairyAura: Ability = {
	id: 187,
	name: 'Fairy Aura',
	description: 'Boosts Fairy-type moves for all Pokemon on the field.',
	onSwitchIn: (ctx: AbilityContext): boolean => {
		ctx.battleContext.addToStack(
			new Message(`${ctx.pokemon.name}'s Fairy Aura is radiating!`, ctx.pokemon)
		);
		return true;
	},
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (!ctx.move || ctx.move.type !== 'fairy') {
			return damage;
		}
		const allPokemon = [
			...ctx.battleContext.playerSide.filter((p): p is NonNullable<typeof p> => !!p && !p.fainted),
			...ctx.battleContext.oppSide.filter((p): p is NonNullable<typeof p> => !!p && !p.fainted)
		];
		const hasAuraBreak = allPokemon.some((p) => p.currentAbility === 'Aura Break');
		const multiplier = hasAuraBreak ? 0.75 : 1.33;
		return Math.floor(damage * multiplier);
	}
};

export const darkAura: Ability = {
	id: 186,
	name: 'Dark Aura',
	description: 'Boosts Dark-type moves for all Pokemon on the field.',
	onSwitchIn: (ctx: AbilityContext): boolean => {
		ctx.battleContext.addToStack(
			new Message(`${ctx.pokemon.name}'s Dark Aura is radiating!`, ctx.pokemon)
		);
		return true;
	},
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (!ctx.move || ctx.move.type !== 'dark') {
			return damage;
		}
		const allPokemon = [
			...ctx.battleContext.playerSide.filter((p): p is NonNullable<typeof p> => !!p && !p.fainted),
			...ctx.battleContext.oppSide.filter((p): p is NonNullable<typeof p> => !!p && !p.fainted)
		];
		const hasAuraBreak = allPokemon.some((p) => p.currentAbility === 'Aura Break');
		const multiplier = hasAuraBreak ? 0.75 : 1.33;
		return Math.floor(damage * multiplier);
	}
};

export const auraBreak: Ability = {
	id: 188,
	name: 'Aura Break',
	description: 'Reverses the effects of Fairy Aura and Dark Aura.',
	onSwitchIn: (ctx: AbilityContext): boolean => {
		ctx.battleContext.addToStack(
			new Message(`${ctx.pokemon.name} broke the mold with Aura Break!`, ctx.pokemon)
		);
		return true;
	}
};

// =============================================================================
// EXPORT ALL TIER 2 ABILITIES
// =============================================================================

export const tier2OnSwitchAbilities: Ability[] = [
	// Stat-lowering
	intimidate,
	// Weather setting
	drizzle,
	drought,
	sandStream,
	snowWarning,
	primordialSea,
	desolateLand,
	deltaStream,
	// Terrain setting
	electricSurge,
	grassySurge,
	psychicSurge,
	mistySurge,
	// Stat boosting
	download,
	intrepidSword,
	dauntlessShield,
	// Volatile status
	unnerve,
	// Information
	frisk,
	anticipation,
	forewarn,
	// Weather suppression
	airLock,
	cloudNine,
	// Intimidation
	pressure,
	// Additional
	screenCleaner,
	asOneIce,
	asOneShadow,
	curiousMedicine,
	pastelVeil,
	fairyAura,
	darkAura,
	auraBreak
];
