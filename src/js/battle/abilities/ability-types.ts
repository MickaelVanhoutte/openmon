import type { BattleContext } from '../../context/battleContext';
import { PokemonInstance, Move } from '../../pokemons/pokedex';

/**
 * Enum for ability trigger timings.
 * Follows the EffectTiming pattern but specialized for abilities.
 */
export enum AbilityTrigger {
	ON_SWITCH_IN = 'ON_SWITCH_IN',
	ON_SWITCH_OUT = 'ON_SWITCH_OUT',
	ON_BEFORE_MOVE = 'ON_BEFORE_MOVE',
	ON_AFTER_MOVE = 'ON_AFTER_MOVE',
	ON_DAMAGE_CALC = 'ON_DAMAGE_CALC',
	ON_CONTACT = 'ON_CONTACT',
	ON_TRY_HIT = 'ON_TRY_HIT',
	ON_TURN_END = 'ON_TURN_END',
	ON_TURN_START = 'ON_TURN_START',
	ON_FAINT = 'ON_FAINT',
	ON_STATUS = 'ON_STATUS',
	ON_STAT_CHANGE = 'ON_STAT_CHANGE'
}

/**
 * Context provided to ability hooks.
 */
export interface AbilityContext {
	/** The current battle context */
	battleContext: BattleContext;
	/** The pokemon that owns the ability */
	pokemon: PokemonInstance;
	/** The target of the move or action, if applicable */
	target?: PokemonInstance;
	/** The move being used, if applicable */
	move?: Move;
}

/**
 * Interface for Pokemon abilities.
 * Abilities use hooks to modify battle behavior.
 */
export interface Ability {
	/** Unique identifier for the ability */
	id: number;
	/** Name of the ability */
	name: string;
	/** Description of what the ability does */
	description: string;

	/** Triggered when the pokemon switches into battle */
	onSwitchIn?: (ctx: AbilityContext) => void;

	/** Triggered when the pokemon switches out of battle */
	onSwitchOut?: (ctx: AbilityContext) => void;

	/** Triggered before the pokemon uses a move. Return false to prevent the move. */
	onBeforeMove?: (ctx: AbilityContext) => boolean;

	/** Modify the pokemon's Attack stat */
	onModifyAtk?: (ctx: AbilityContext, attack: number) => number;

	/** Modify the pokemon's Defense stat */
	onModifyDef?: (ctx: AbilityContext, defense: number) => number;

	/** Modify the pokemon's Special Attack stat */
	onModifySpA?: (ctx: AbilityContext, spAtk: number) => number;

	/** Modify the pokemon's Special Defense stat */
	onModifySpD?: (ctx: AbilityContext, spDef: number) => number;

	/** Modify the pokemon's Speed stat */
	onModifySpe?: (ctx: AbilityContext, speed: number) => number;

	/** Modify damage dealt by the pokemon */
	onModifyDamage?: (ctx: AbilityContext, damage: number) => number;

	/** Modify damage received by the pokemon */
	onSourceModifyDamage?: (ctx: AbilityContext, damage: number) => number;

	/** Triggered when the pokemon is about to be hit by a move. Return false for immunity. */
	onTryHit?: (ctx: AbilityContext) => boolean;

	/** Triggered after the pokemon is hit by a damaging move */
	onDamagingHit?: (ctx: AbilityContext, damage: number) => void;

	/** Triggered after the pokemon successfully uses a move */
	onAfterMove?: (ctx: AbilityContext) => void;

	/** Triggered at the end of each turn */
	onTurnEnd?: (ctx: AbilityContext) => void;

	/** Triggered at the start of each turn */
	onTurnStart?: (ctx: AbilityContext) => void;

	/** Triggered when the pokemon faints */
	onFaint?: (ctx: AbilityContext) => void;

	/** Triggered when a status condition is about to be applied. Return false to prevent. */
	onStatus?: (ctx: AbilityContext, status: string) => boolean;

	/** Triggered when a stat stage is about to change. Return the modified change amount. */
	onStatChange?: (ctx: AbilityContext, stat: string, change: number) => number;

	/** List of abilities that suppress this one (e.g., Mold Breaker) */
	suppressedBy?: string[];

	/** Priority for ordering when multiple abilities trigger at the same time */
	priority?: number;
}
