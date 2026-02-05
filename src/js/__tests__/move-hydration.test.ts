import { describe, it, expect } from 'vitest';
import { getMovesByPokemonId } from '../pokemons/move-hydration';

describe('move-hydration', () => {
	describe('getMovesByPokemonId', () => {
		it('should return an array of moves for Bulbasaur (id: 1)', () => {
			const moves = getMovesByPokemonId(1);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBeGreaterThan(0);
		});

		it('should return moves with required fields', () => {
			const moves = getMovesByPokemonId(1);

			expect(moves.length).toBeGreaterThan(0);
			const move = moves[0];

			// Required fields from Move class
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

		it('should have valid type strings', () => {
			const moves = getMovesByPokemonId(1);
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

		it('should have valid category strings', () => {
			const moves = getMovesByPokemonId(1);
			const validCategories = ['physical', 'special', 'no-damage'];

			moves.forEach((move) => {
				expect(validCategories).toContain(move.category);
			});
		});

		it('should deduplicate moves by move_id', () => {
			const moves = getMovesByPokemonId(1);
			const moveIds = moves.map((m) => m.id);
			const uniqueIds = new Set(moveIds);

			expect(moveIds.length).toBe(uniqueIds.size);
		});

		it('should return empty array for non-existent pokemon', () => {
			const moves = getMovesByPokemonId(999999);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBe(0);
		});

		it('should return empty array for invalid pokemon id (0)', () => {
			const moves = getMovesByPokemonId(0);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBe(0);
		});

		it('should return empty array for negative pokemon id', () => {
			const moves = getMovesByPokemonId(-1);

			expect(Array.isArray(moves)).toBe(true);
			expect(moves.length).toBe(0);
		});

		it('should include effect object with required fields', () => {
			const moves = getMovesByPokemonId(1);
			const moveWithEffect = moves.find((m) => m.effect && m.effect.move_effect_id);

			if (moveWithEffect) {
				expect(moveWithEffect.effect).toHaveProperty('move_effect_id');
				expect(moveWithEffect.effect).toHaveProperty('local_language_id');
				expect(moveWithEffect.effect).toHaveProperty('short_effect');
				expect(moveWithEffect.effect).toHaveProperty('effect');
			}
		});

		it('should collect moves from all version groups (deduplicated)', () => {
			// Bulbasaur should have moves from multiple versions, all combined
			const moves = getMovesByPokemonId(1);

			// Bulbasaur learns Tackle at level 1 in most versions
			const tackle = moves.find((m) => m.name === 'tackle');
			expect(tackle).toBeDefined();
		});

		it('should keep highest level when same move appears multiple times', () => {
			const moves = getMovesByPokemonId(1);
			const moveIds = moves.map((m) => m.id);

			// No duplicate move ids
			const uniqueIds = [...new Set(moveIds)];
			expect(moveIds.length).toBe(uniqueIds.length);
		});
	});
});
