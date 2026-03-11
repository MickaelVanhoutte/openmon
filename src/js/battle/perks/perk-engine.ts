/**
 * Perk Engine — Executes perk effects during battle.
 * Perks are player-only conditional effects unlocked via class talent trees.
 */

import type { PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import type { Player } from '../../characters/player';
import { PerkTrigger, type ActivePerk } from '../../characters/perks';

export interface PerkContext {
	ctx: BattleContext;
	player: Player;
	pokemon?: PokemonInstance;
	target?: PokemonInstance;
	damage?: number;
	isCrit?: boolean;
	isSuperEffective?: boolean;
	excessDamage?: number;
}

export type PerkHandler = (perk: ActivePerk, perkCtx: PerkContext) => PerkResult | void;

export interface PerkResult {
	damageModifier?: number;
	healAmount?: number;
	comboGauge?: number;
	message?: string;
	preventFaint?: boolean;
	modifiedDamage?: number;
	catchRateBonus?: number;
	xpMultiplier?: number;
	skipWeatherDamage?: boolean;
}

/** Registry of perk handler functions, keyed by perk ID */
const PERK_HANDLERS: Record<string, PerkHandler> = {};

export function registerPerkHandler(perkId: string, handler: PerkHandler): void {
	PERK_HANDLERS[perkId] = handler;
}

export class PerkEngine {
	/**
	 * Run all active perks matching a trigger.
	 * Returns merged results from all triggered perks.
	 */
	runPerks(
		trigger: PerkTrigger,
		activePerks: ActivePerk[],
		perkCtx: PerkContext
	): PerkResult {
		const merged: PerkResult = {};

		for (const perk of activePerks) {
			if (perk.definition.trigger !== trigger) continue;

			const handler = PERK_HANDLERS[perk.definition.id];
			if (!handler) continue;

			const result = handler(perk, perkCtx);
			if (!result) continue;

			// Merge results
			if (result.damageModifier !== undefined) {
				merged.damageModifier = (merged.damageModifier ?? 0) + result.damageModifier;
			}
			if (result.healAmount !== undefined) {
				merged.healAmount = (merged.healAmount ?? 0) + result.healAmount;
			}
			if (result.comboGauge !== undefined) {
				merged.comboGauge = (merged.comboGauge ?? 0) + result.comboGauge;
			}
			if (result.message) {
				merged.message = result.message;
			}
			if (result.preventFaint) {
				merged.preventFaint = true;
			}
			if (result.modifiedDamage !== undefined) {
				merged.modifiedDamage = result.modifiedDamage;
			}
			if (result.catchRateBonus !== undefined) {
				merged.catchRateBonus = (merged.catchRateBonus ?? 0) + result.catchRateBonus;
			}
			if (result.xpMultiplier !== undefined) {
				merged.xpMultiplier = (merged.xpMultiplier ?? 1) * result.xpMultiplier;
			}
			if (result.skipWeatherDamage) {
				merged.skipWeatherDamage = true;
			}
		}

		return merged;
	}

	/**
	 * Check if any PASSIVE perk matches a specific perk ID.
	 * Convenience for code that needs to check a specific perk inline.
	 */
	hasPassivePerk(activePerks: ActivePerk[], perkId: string): boolean {
		return activePerks.some(
			(p) => p.definition.id === perkId && p.definition.trigger === PerkTrigger.PASSIVE
		);
	}
}
