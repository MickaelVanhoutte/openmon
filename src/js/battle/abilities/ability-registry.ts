import abilitiesJson from '../../../assets/data/final/beta/abilities.json';
import type { Ability } from './ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';

// Import all tier ability implementations
import { tier1PassiveStatAbilities } from './tiers/tier1-passive-stats';
import { tier2OnSwitchAbilities } from './tiers/tier2-on-switch';
import { tier3DamageContactAbilities } from './tiers/tier3-damage-contact';
import { tier4TurnStatusAbilities } from './tiers/tier4-turn-status';
import { tier5SuppressionAbilities } from './tiers/tier5-suppression';
import { tier6ComplexAbilities } from './tiers/tier6-complex';

/**
 * Internal map for ability lookups.
 * Keyed by normalized kebab-case name.
 */
const abilityMap: Record<string, Ability> = {};

/**
 * Normalizes a string to kebab-case.
 * e.g., "Huge Power" -> "huge-power"
 */
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

/**
 * Initializes the ability registry from JSON data,
 * then merges in hook implementations from tier files.
 */
function initRegistry(): void {
	// First, load base ability data from JSON (id, name, description)
	abilitiesJson.forEach((data: any) => {
		const key = toKebabCase(data.names);
		abilityMap[key] = {
			id: data.id,
			name: data.names,
			description: data.description
		};
	});

	// Merge in hook implementations from all tier files
	const allImplementations: Ability[] = [
		...tier1PassiveStatAbilities,
		...tier2OnSwitchAbilities,
		...tier3DamageContactAbilities,
		...tier4TurnStatusAbilities,
		...tier5SuppressionAbilities,
		...tier6ComplexAbilities
	];

	for (const impl of allImplementations) {
		const key = toKebabCase(impl.name);
		if (abilityMap[key]) {
			// Merge hooks into existing ability entry
			abilityMap[key] = { ...abilityMap[key], ...impl };
		} else {
			// Ability not in JSON, add it directly
			abilityMap[key] = impl;
		}
	}
}

// Initialize on module load
initRegistry();

/**
 * Retrieves an ability by its name.
 * Handles normalization (case-insensitive, kebab-case).
 *
 * @param name The name of the ability to retrieve
 * @returns The Ability object or undefined if not found
 */
export function getAbility(name: string): Ability | undefined {
	if (!name) {
		return undefined;
	}

	const key = toKebabCase(name);
	const ability = abilityMap[key];

	if (!ability) {
		console.warn(`Unknown ability: ${name}`);
	}

	return ability;
}

/**
 * Helper to check if a pokemon has a specific ability.
 *
 * @param pokemon The pokemon instance to check
 * @param abilityName The name of the ability to check for
 * @returns True if the pokemon has the ability
 */
export function hasAbility(pokemon: PokemonInstance, abilityName: string): boolean {
	if (!pokemon || !pokemon.currentAbility || !abilityName) {
		return false;
	}

	return toKebabCase(pokemon.currentAbility) === toKebabCase(abilityName);
}
