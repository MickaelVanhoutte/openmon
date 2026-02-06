import type { Ability, AbilityContext } from '../ability-types';
import { Weather, Terrain } from '../../battle-field';
import { VolatileStatus } from '../../../pokemons/volatile-status';
import { Message } from '../../actions/actions-derived';

// =============================================================================
// STAT-LOWERING ON-SWITCH ABILITIES
// =============================================================================

export const intimidate: Ability = {
	id: 22,
	name: 'Intimidate',
	description: "Lowers opposing Pokemon's Attack by one stage when it enters battle.",
	onSwitchIn: (ctx: AbilityContext): void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.changeBattleStats('attack', -1);
			ctx.battleContext.addToStack(new Message(`${opponent.name}'s Attack fell!`, ctx.pokemon));
		}
	}
};

// =============================================================================
// WEATHER SETTING ABILITIES
// =============================================================================

export const drizzle: Ability = {
	id: 2,
	name: 'Drizzle',
	description: 'Summons rain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.RAIN);
		ctx.battleContext.weatherVersion.update((v) => v + 1);
		ctx.battleContext.addToStack(new Message('It started to rain!', ctx.pokemon));
	}
};

export const drought: Ability = {
	id: 70,
	name: 'Drought',
	description: 'Summons harsh sunlight when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.SUN);
		ctx.battleContext.weatherVersion.update((v) => v + 1);
		ctx.battleContext.addToStack(new Message('The sunlight turned harsh!', ctx.pokemon));
	}
};

export const sandStream: Ability = {
	id: 45,
	name: 'Sand Stream',
	description: 'Summons a sandstorm when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.SAND);
		ctx.battleContext.weatherVersion.update((v) => v + 1);
		ctx.battleContext.addToStack(new Message('A sandstorm kicked up!', ctx.pokemon));
	}
};

export const snowWarning: Ability = {
	id: 117,
	name: 'Snow Warning',
	description: 'Summons hail when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.HAIL);
		ctx.battleContext.weatherVersion.update((v) => v + 1);
		ctx.battleContext.addToStack(new Message('It started to hail!', ctx.pokemon));
	}
};

// Primal weather setters
export const primordialSea: Ability = {
	id: 189,
	name: 'Primordial Sea',
	description: 'Summons heavy rain that cannot be replaced.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.RAIN);
		ctx.battleContext.weatherVersion.update((v) => v + 1);
		ctx.battleContext.addToStack(new Message('A heavy rain began to fall!', ctx.pokemon));
	}
};

export const desolateLand: Ability = {
	id: 190,
	name: 'Desolate Land',
	description: 'Summons extremely harsh sunlight that cannot be replaced.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.SUN);
		ctx.battleContext.weatherVersion.update((v) => v + 1);
		ctx.battleContext.addToStack(new Message('The sunlight turned extremely harsh!', ctx.pokemon));
	}
};

export const deltaStream: Ability = {
	id: 191,
	name: 'Delta Stream',
	description: 'Summons strong winds that weaken Flying-type weaknesses.',
	onSwitchIn: (ctx: AbilityContext): void => {
		// Strong winds is a special weather; using clear as placeholder
		// In real implementation, would need a STRONG_WINDS weather type
		ctx.battleContext.addToStack(
			new Message('A mysterious air current is protecting Flying-type Pokémon!', ctx.pokemon)
		);
	}
};

// =============================================================================
// TERRAIN SETTING ABILITIES
// =============================================================================

export const electricSurge: Ability = {
	id: 226,
	name: 'Electric Surge',
	description: 'Summons Electric Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setTerrain(Terrain.ELECTRIC);
		ctx.battleContext.addToStack(
			new Message('An electric current ran across the battlefield!', ctx.pokemon)
		);
	}
};

export const grassySurge: Ability = {
	id: 229,
	name: 'Grassy Surge',
	description: 'Summons Grassy Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setTerrain(Terrain.GRASSY);
		ctx.battleContext.addToStack(new Message('Grass grew to cover the battlefield!', ctx.pokemon));
	}
};

export const psychicSurge: Ability = {
	id: 227,
	name: 'Psychic Surge',
	description: 'Summons Psychic Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setTerrain(Terrain.PSYCHIC);
		ctx.battleContext.addToStack(new Message('The battlefield got weird!', ctx.pokemon));
	}
};

export const mistySurge: Ability = {
	id: 228,
	name: 'Misty Surge',
	description: 'Summons Misty Terrain when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setTerrain(Terrain.MISTY);
		ctx.battleContext.addToStack(new Message('Mist swirled around the battlefield!', ctx.pokemon));
	}
};

// =============================================================================
// ABILITY-COPYING ABILITIES
// =============================================================================

export const trace: Ability = {
	id: 36,
	name: 'Trace',
	description: "Copies a random opposing Pokemon's Ability on switch-in.",
	onSwitchIn: (ctx: AbilityContext): void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		if (opponents.length > 0) {
			const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
			ctx.pokemon.currentAbility = randomOpponent.currentAbility;
		}
	}
};

// =============================================================================
// STAT-BOOSTING ON-SWITCH ABILITIES
// =============================================================================

export const download: Ability = {
	id: 88,
	name: 'Download',
	description: "Boosts Attack or Sp. Atk based on opposing Pokemon's weaker defense.",
	onSwitchIn: (ctx: AbilityContext): void => {
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
	}
};

export const intrepidSword: Ability = {
	id: 264,
	name: 'Intrepid Sword',
	description: 'Boosts Attack by one stage when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.pokemon.changeBattleStats('attack', 1);
	}
};

export const dauntlessShield: Ability = {
	id: 265,
	name: 'Dauntless Shield',
	description: 'Boosts Defense by one stage when entering battle.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.pokemon.changeBattleStats('defense', 1);
	}
};

// =============================================================================
// VOLATILE STATUS SETTING ABILITIES
// =============================================================================

export const unnerve: Ability = {
	id: 127,
	name: 'Unnerve',
	description: 'Prevents opposing Pokemon from using held Berries.',
	onSwitchIn: (ctx: AbilityContext): void => {
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.volatiles.add(VolatileStatus.UNNERVED);
		}
	}
};

// =============================================================================
// INFORMATION/REVEAL ABILITIES
// =============================================================================

export const frisk: Ability = {
	id: 119,
	name: 'Frisk',
	description: "Reveals an opposing Pokemon's held item on switch-in.",
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Would display message about opponent's held item
		// Actual reveal handled by battle message system
	}
};

export const anticipation: Ability = {
	id: 107,
	name: 'Anticipation',
	description: 'Shudders when entering if any opponent has a super-effective or OHKO move.',
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Would check opponent moves for super-effective or OHKO moves
		// Display message if dangerous move found
	}
};

export const forewarn: Ability = {
	id: 108,
	name: 'Forewarn',
	description: "Reveals the opponent's strongest move on switch-in.",
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Would find and display opponent's highest base power move
	}
};

// =============================================================================
// WEATHER SUPPRESSION ABILITIES
// =============================================================================

export const airLock: Ability = {
	id: 76,
	name: 'Air Lock',
	description: 'Negates all weather effects.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.NONE);
	}
};

export const cloudNine: Ability = {
	id: 13,
	name: 'Cloud Nine',
	description: 'Negates all weather effects.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.setWeather(Weather.NONE);
	}
};

// =============================================================================
// ABILITY SUPPRESSION ABILITIES
// =============================================================================

export const neutralizingGas: Ability = {
	id: 256,
	name: 'Neutralizing Gas',
	description: 'All other Abilities are suppressed while this Pokemon is on the field.',
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Sets a field-wide suppression flag
		// Would need integration with ability engine
	}
};

// =============================================================================
// INTIMIDATION/PRESSURE ABILITIES
// =============================================================================

export const pressure: Ability = {
	id: 46,
	name: 'Pressure',
	description: "Raises the opponent's PP usage.",
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Display message: "[Pokemon] is exerting pressure!"
		// PP doubling handled elsewhere
	}
};

// =============================================================================
// MOLD BREAKER FAMILY (Ability-Ignoring)
// =============================================================================

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

// =============================================================================
// ADDITIONAL ON-SWITCH ABILITIES
// =============================================================================

export const screenCleaner: Ability = {
	id: 251,
	name: 'Screen Cleaner',
	description: 'Removes Light Screen and Reflect from both sides on switch-in.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.battleContext.battleField.allySide.screens.clear();
		ctx.battleContext.battleField.enemySide.screens.clear();
	}
};

export const asOneIce: Ability = {
	id: 267,
	name: 'As One (Ice)',
	description: 'Combines Unnerve and Chilling Neigh.',
	onSwitchIn: (ctx: AbilityContext): void => {
		// Unnerve effect
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.volatiles.add(VolatileStatus.UNNERVED);
		}
	}
};

export const asOneShadow: Ability = {
	id: 268,
	name: 'As One (Shadow)',
	description: 'Combines Unnerve and Grim Neigh.',
	onSwitchIn: (ctx: AbilityContext): void => {
		// Unnerve effect
		const opponents = ctx.battleContext.oppSide.filter(
			(p): p is NonNullable<typeof p> => !!p && !p.fainted
		);
		for (const opponent of opponents) {
			opponent.volatiles.add(VolatileStatus.UNNERVED);
		}
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
	}
};

export const fairyAura: Ability = {
	id: 187,
	name: 'Fairy Aura',
	description: 'Boosts Fairy-type moves for all Pokemon on the field.',
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Sets a field aura flag - damage calc would check for this
	}
};

export const darkAura: Ability = {
	id: 186,
	name: 'Dark Aura',
	description: 'Boosts Dark-type moves for all Pokemon on the field.',
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Sets a field aura flag - damage calc would check for this
	}
};

export const auraBreak: Ability = {
	id: 188,
	name: 'Aura Break',
	description: 'Reverses the effects of Fairy Aura and Dark Aura.',
	onSwitchIn: (_ctx: AbilityContext): void => {
		// Reverses aura effects - damage calc would check for this
	}
};

export const slowStart: Ability = {
	id: 112,
	name: 'Slow Start',
	description: 'Halves Attack and Speed for the first five turns.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.pokemon.volatiles.add(VolatileStatus.SLOW_START, 5);
	}
};

export const truant: Ability = {
	id: 54,
	name: 'Truant',
	description: 'Can only use moves every other turn.',
	onSwitchIn: (ctx: AbilityContext): void => {
		ctx.pokemon.volatiles.add(VolatileStatus.TRUANT);
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
	// Ability copying
	trace,
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
	// Ability suppression
	neutralizingGas,
	// Intimidation
	pressure,
	// Mold breaker family
	moldBreaker,
	teravolt,
	turboblaze,
	// Additional
	screenCleaner,
	asOneIce,
	asOneShadow,
	curiousMedicine,
	pastelVeil,
	fairyAura,
	darkAura,
	auraBreak,
	slowStart,
	truant
];
