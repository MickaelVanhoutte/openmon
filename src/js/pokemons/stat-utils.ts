/**
 * Stat stage multiplier utilities for Pokemon battle calculations.
 * Based on Gen 3-5 mechanics.
 */

/**
 * Calculate the multiplier for a stat stage (-6 to +6)
 * Positive stages: (2 + stage) / 2
 * Negative stages: 2 / (2 - stage)
 *
 * @param stage - The stat stage value from -6 to +6
 * @returns The multiplier to apply to the base stat
 */
export function getStatStageMultiplier(stage: number): number {
	return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

/**
 * Calculate the multiplier for accuracy/evasion stages (-6 to +6)
 * Uses 3-based formula instead of 2-based (different from other stats)
 * Positive stages: (3 + stage) / 3
 * Negative stages: 3 / (3 - stage)
 *
 * @param stage - The accuracy/evasion stage value from -6 to +6
 * @returns The multiplier to apply to accuracy/evasion
 */
export function getAccuracyEvasionMultiplier(stage: number): number {
	return stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage);
}
