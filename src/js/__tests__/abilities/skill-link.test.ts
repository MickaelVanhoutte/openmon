import { describe, it, expect, beforeEach } from 'vitest';
import { MultiHit } from '../../pokemons/effects/moves/multi-hit';
import type { PokemonInstance } from '../../pokemons/pokedex';

function mockUser(ability: string): PokemonInstance {
	return { currentAbility: ability } as PokemonInstance;
}

describe('Skill Link Ability - Multi-Hit Integration', () => {
	let multiHit: MultiHit;

	beforeEach(() => {
		multiHit = new MultiHit();
	});

	describe('with Skill Link ability', () => {
		it('should always return 5 hits when user has Skill Link', () => {
			const user = mockUser('Skill Link');
			for (let i = 0; i < 50; i++) {
				const result = multiHit.apply([], user);
				expect(result.hitCount).toBe(5);
				expect(result.message).toBe('Hit 5 times!');
			}
		});

		it('should handle lowercase/kebab-case ability name', () => {
			const user = mockUser('skill-link');
			const result = multiHit.apply([], user);
			expect(result.hitCount).toBe(5);
		});

		it('should handle mixed case with extra spaces', () => {
			const user = mockUser('SKILL  LINK');
			const result = multiHit.apply([], user);
			expect(result.hitCount).toBe(5);
		});
	});

	describe('without Skill Link ability', () => {
		it('should return variable hits (2-5) without Skill Link', () => {
			const user = mockUser('Overgrow');
			const hitCounts = new Set<number>();
			for (let i = 0; i < 200; i++) {
				const result = multiHit.apply([], user);
				expect(result.hitCount).toBeGreaterThanOrEqual(2);
				expect(result.hitCount).toBeLessThanOrEqual(5);
				hitCounts.add(result.hitCount!);
			}
			expect(hitCounts.size).toBeGreaterThan(1);
		});

		it('should return variable hits when user is undefined', () => {
			const hitCounts = new Set<number>();
			for (let i = 0; i < 200; i++) {
				const result = multiHit.apply([]);
				expect(result.hitCount).toBeGreaterThanOrEqual(2);
				expect(result.hitCount).toBeLessThanOrEqual(5);
				hitCounts.add(result.hitCount!);
			}
			expect(hitCounts.size).toBeGreaterThan(1);
		});

		it('should return variable hits when ability is empty string', () => {
			const user = mockUser('');
			const result = multiHit.apply([], user);
			expect(result.hitCount).toBeGreaterThanOrEqual(2);
			expect(result.hitCount).toBeLessThanOrEqual(5);
		});
	});

	describe('Skill Link ability stub metadata', () => {
		it('should have correct id, name, and description', async () => {
			const { skillLink } = await import('../../../js/battle/abilities/tiers/tier6-complex');
			expect(skillLink.id).toBe(92);
			expect(skillLink.name).toBe('Skill Link');
			expect(skillLink.description).toBe('Multi-hit moves always hit 5 times.');
		});
	});
});
