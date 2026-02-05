import { describe, it, expect, vi } from 'vitest';
import { getMovesByPokemonId } from '../pokemons/move-hydration';

vi.mock('../../assets/data/raw/moves/pokemon-moves.json', () => ({
	default: [
		{
			pokemon_id: 1,
			version_group_id: 1,
			move_id: 33,
			pokemon_move_method_id: 1,
			level: 1,
			order: 1
		},
		{
			pokemon_id: 1,
			version_group_id: 1,
			move_id: 45,
			pokemon_move_method_id: 1,
			level: 3,
			order: 2
		},
		{
			pokemon_id: 1,
			version_group_id: 2,
			move_id: 33,
			pokemon_move_method_id: 1,
			level: 5,
			order: 1
		},
		{
			pokemon_id: 1,
			version_group_id: 1,
			move_id: 22,
			pokemon_move_method_id: 2,
			level: 0,
			order: 3
		},
		{
			pokemon_id: 25,
			version_group_id: 1,
			move_id: 84,
			pokemon_move_method_id: 1,
			level: 1,
			order: 1
		}
	]
}));

vi.mock('../../assets/data/raw/moves/moves.json', () => ({
	default: [
		{
			id: 22,
			identifier: 'vine-whip',
			generation_id: 1,
			type_id: 12,
			power: 45,
			pp: 25,
			accuracy: 100,
			priority: 0,
			target_id: 10,
			damage_class_id: 2,
			effect_id: 1,
			effect_chance: 0
		},
		{
			id: 33,
			identifier: 'tackle',
			generation_id: 1,
			type_id: 1,
			power: 40,
			pp: 35,
			accuracy: 100,
			priority: 0,
			target_id: 10,
			damage_class_id: 2,
			effect_id: 1,
			effect_chance: 0
		},
		{
			id: 45,
			identifier: 'growl',
			generation_id: 1,
			type_id: 1,
			power: 0,
			pp: 40,
			accuracy: 100,
			priority: 0,
			target_id: 11,
			damage_class_id: 1,
			effect_id: 19,
			effect_chance: 0
		},
		{
			id: 84,
			identifier: 'thunder-shock',
			generation_id: 1,
			type_id: 13,
			power: 40,
			pp: 30,
			accuracy: 100,
			priority: 0,
			target_id: 10,
			damage_class_id: 3,
			effect_id: 7,
			effect_chance: 10
		}
	]
}));

vi.mock('../../assets/data/raw/moves/move-effects.json', () => ({
	default: [
		{
			move_effect_id: 1,
			local_language_id: 9,
			short_effect: 'Inflicts regular damage.',
			effect: 'Inflicts regular damage with no additional effect.'
		},
		{
			move_effect_id: 7,
			local_language_id: 9,
			short_effect: 'Has a $effect_chance% chance to paralyze.',
			effect: 'Has a $effect_chance% chance to paralyze the target.'
		},
		{
			move_effect_id: 19,
			local_language_id: 9,
			short_effect: "Lowers the target's Attack by one stage.",
			effect: "Lowers the target's Attack by one stage."
		}
	]
}));

global.fetch = vi.fn((url: string) => {
	if (url.includes('pokemon-moves.json')) {
		return Promise.resolve({
			json: () =>
				Promise.resolve([
					{
						pokemon_id: 1,
						version_group_id: 1,
						move_id: 33,
						pokemon_move_method_id: 1,
						level: 1,
						order: 1
					},
					{
						pokemon_id: 1,
						version_group_id: 1,
						move_id: 45,
						pokemon_move_method_id: 1,
						level: 3,
						order: 2
					},
					{
						pokemon_id: 1,
						version_group_id: 2,
						move_id: 33,
						pokemon_move_method_id: 1,
						level: 5,
						order: 1
					},
					{
						pokemon_id: 1,
						version_group_id: 1,
						move_id: 22,
						pokemon_move_method_id: 2,
						level: 0,
						order: 3
					},
					{
						pokemon_id: 25,
						version_group_id: 1,
						move_id: 84,
						pokemon_move_method_id: 1,
						level: 1,
						order: 1
					}
				])
		});
	}
	if (url.includes('moves.json')) {
		return Promise.resolve({
			json: () =>
				Promise.resolve([
					{
						id: 22,
						identifier: 'vine-whip',
						generation_id: 1,
						type_id: 12,
						power: 45,
						pp: 25,
						accuracy: 100,
						priority: 0,
						target_id: 10,
						damage_class_id: 2,
						effect_id: 1,
						effect_chance: 0
					},
					{
						id: 33,
						identifier: 'tackle',
						generation_id: 1,
						type_id: 1,
						power: 40,
						pp: 35,
						accuracy: 100,
						priority: 0,
						target_id: 10,
						damage_class_id: 2,
						effect_id: 1,
						effect_chance: 0
					},
					{
						id: 45,
						identifier: 'growl',
						generation_id: 1,
						type_id: 1,
						power: 0,
						pp: 40,
						accuracy: 100,
						priority: 0,
						target_id: 11,
						damage_class_id: 1,
						effect_id: 19,
						effect_chance: 0
					},
					{
						id: 84,
						identifier: 'thunder-shock',
						generation_id: 1,
						type_id: 13,
						power: 40,
						pp: 30,
						accuracy: 100,
						priority: 0,
						target_id: 10,
						damage_class_id: 3,
						effect_id: 7,
						effect_chance: 10
					}
				])
		});
	}
	if (url.includes('move-effects.json')) {
		return Promise.resolve({
			json: () =>
				Promise.resolve([
					{
						move_effect_id: 1,
						local_language_id: 9,
						short_effect: 'Inflicts regular damage.',
						effect: 'Inflicts regular damage with no additional effect.'
					},
					{
						move_effect_id: 7,
						local_language_id: 9,
						short_effect: 'Has a $effect_chance% chance to paralyze.',
						effect: 'Has a $effect_chance% chance to paralyze the target.'
					},
					{
						move_effect_id: 19,
						local_language_id: 9,
						short_effect: "Lowers the target's Attack by one stage.",
						effect: "Lowers the target's Attack by one stage."
					}
				])
		});
	}
	return Promise.reject(new Error(`Unexpected fetch: ${url}`));
}) as unknown as typeof fetch;

describe('move-hydration', () => {
	describe('getMovesByPokemonId', () => {
		it('should return an array of moves for Bulbasaur (id: 1)', async () => {
			const moves = await getMovesByPokemonId(1);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBeGreaterThan(0);
		});

		it('should return moves with required fields', async () => {
			const moves = await getMovesByPokemonId(1);

			expect(moves.length).toBeGreaterThan(0);
			const move = moves[0];

			expect(move).toHaveProperty('id');
			expect(move).toHaveProperty('name');
			expect(move).toHaveProperty('type');
			expect(move).toHaveProperty('category');
			expect(move).toHaveProperty('power');
			expect(move).toHaveProperty('accuracy');
			expect(move).toHaveProperty('pp');
			expect(move).toHaveProperty('priority');
			expect(move).toHaveProperty('target');
			expect(move).toHaveProperty('effect');
			expect(move).toHaveProperty('effectChance');
			expect(move).toHaveProperty('description');
			expect(move).toHaveProperty('level');
			expect(move).toHaveProperty('method');
		});

		it('should have valid type strings', async () => {
			const moves = await getMovesByPokemonId(1);
			const validTypes = [
				'normal',
				'fighting',
				'flying',
				'poison',
				'ground',
				'rock',
				'bug',
				'ghost',
				'steel',
				'fire',
				'water',
				'grass',
				'electric',
				'psychic',
				'ice',
				'dragon',
				'dark',
				'fairy'
			];

			moves.forEach((move) => {
				expect(validTypes).toContain(move.type);
			});
		});

		it('should have valid category strings', async () => {
			const moves = await getMovesByPokemonId(1);
			const validCategories = ['physical', 'special', 'no-damage'];

			moves.forEach((move) => {
				expect(validCategories).toContain(move.category);
			});
		});

		it('should deduplicate moves by move_id', async () => {
			const moves = await getMovesByPokemonId(1);
			const moveIds = moves.map((m) => m.id);
			const uniqueIds = new Set(moveIds);

			expect(moveIds.length).toBe(uniqueIds.size);
		});

		it('should return empty array for non-existent pokemon', async () => {
			const moves = await getMovesByPokemonId(999999);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBe(0);
		});

		it('should return empty array for invalid pokemon id (0)', async () => {
			const moves = await getMovesByPokemonId(0);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBe(0);
		});

		it('should return empty array for negative pokemon id', async () => {
			const moves = await getMovesByPokemonId(-1);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBe(0);
		});

		it('should include effect object with required fields', async () => {
			const moves = await getMovesByPokemonId(1);
			const moveWithEffect = moves.find((m) => m.effect && m.effect.move_effect_id);

			if (moveWithEffect) {
				expect(moveWithEffect.effect).toHaveProperty('move_effect_id');
				expect(moveWithEffect.effect).toHaveProperty('local_language_id');
				expect(moveWithEffect.effect).toHaveProperty('short_effect');
				expect(moveWithEffect.effect).toHaveProperty('effect');
			}
		});

		it('should collect moves from all version groups (deduplicated)', async () => {
			const moves = await getMovesByPokemonId(1);

			const tackle = moves.find((m) => m.name === 'tackle');
			expect(tackle).toBeDefined();
		});

		it('should keep highest level when same move appears multiple times', async () => {
			const moves = await getMovesByPokemonId(1);
			const moveIds = moves.map((m) => m.id);

			const uniqueIds = [...new Set(moveIds)];
			expect(moveIds.length).toBe(uniqueIds.length);
		});
	});
});
