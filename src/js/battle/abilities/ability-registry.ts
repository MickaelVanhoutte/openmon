import abilitiesJson from '../../../assets/data/final/beta/abilities.json';
import type { Ability } from './ability-types';
import type { PokemonInstance } from '../../pokemons/pokedex';

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
 * Initializes the ability registry from JSON data.
 */
function initRegistry(): void {
	abilitiesJson.forEach((data: any) => {
		const key = toKebabCase(data.names);
		abilityMap[key] = {
			id: data.id,
			name: data.names,
			description: data.description
		};
	});
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
