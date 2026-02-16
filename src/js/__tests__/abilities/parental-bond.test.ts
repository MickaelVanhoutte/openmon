import { describe, it, expect } from 'vitest';
import { parentalBond } from '../../battle/abilities/tiers/tier6-complex';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import { Move, MoveEffect, PokemonInstance } from '../../pokemons/pokedex';

function makeMoveEffect(effectId: number): MoveEffect {
	return new MoveEffect(effectId, 9, '', '');
}

function makeMove(overrides: Partial<Move> = {}): Move {
	return new Move(
		overrides.id ?? 1,
		overrides.name ?? 'tackle',
		overrides.type ?? 'normal',
		overrides.category ?? 'physical',
		overrides.power ?? 80,
		overrides.accuracy ?? 100,
		overrides.pp ?? 35,
		overrides.priority ?? 0,
		(overrides.target as any) ?? 'selected-pokemon',
		overrides.effect ?? makeMoveEffect(1),
		overrides.effectChance ?? 0,
		overrides.description ?? '',
		overrides.level ?? 1
	);
}

function makeCtx(move?: Move): AbilityContext {
	return {
		battleContext: {} as any,
		pokemon: {} as PokemonInstance,
		target: {} as PokemonInstance,
		move
	};
}

describe('Parental Bond Ability', () => {
	describe('metadata', () => {
		it('should have correct id, name, and description', () => {
			expect(parentalBond.id).toBe(185);
			expect(parentalBond.name).toBe('Parental Bond');
			expect(parentalBond.description).toBe('Attacks twice. The second hit deals 25% damage.');
		});

		it('should have onModifyDamage hook defined', () => {
			expect(parentalBond.onModifyDamage).toBeDefined();
			expect(typeof parentalBond.onModifyDamage).toBe('function');
		});
	});

	describe('damage modification', () => {
		it('should multiply damage by 1.25 for single-target physical moves', () => {
			const move = makeMove({ category: 'physical', target: 'selected-pokemon' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(125);
		});

		it('should multiply damage by 1.25 for single-target special moves', () => {
			const move = makeMove({ category: 'special', target: 'selected-pokemon' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 80);
			expect(result).toBe(100);
		});

		it('should floor the result for non-round damage values', () => {
			const move = makeMove({ category: 'physical' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 99);
			expect(result).toBe(Math.floor(99 * 1.25));
			expect(result).toBe(123);
		});

		it('should work with random-opponent target moves', () => {
			const move = makeMove({ target: 'random-opponent' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(125);
		});
	});

	describe('multi-hit move exclusion', () => {
		it('should NOT modify damage for multi-hit moves (effect_id 30)', () => {
			const move = makeMove({ effect: makeMoveEffect(30) });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(100);
		});

		it('should modify damage for non-multi-hit effect ids', () => {
			const move = makeMove({ effect: makeMoveEffect(29) });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(125);
		});
	});

	describe('spread move exclusion', () => {
		it('should NOT modify damage for all-opponents target', () => {
			const move = makeMove({ target: 'all-opponents' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(100);
		});

		it('should NOT modify damage for all-other-pokemon target', () => {
			const move = makeMove({ target: 'all-other-pokemon' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(100);
		});

		it('should NOT modify damage for all-pokemon target', () => {
			const move = makeMove({ target: 'all-pokemon' });
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(100);
		});
	});

	describe('edge cases', () => {
		it('should return damage unchanged when move is undefined', () => {
			const ctx = makeCtx(undefined);
			const result = parentalBond.onModifyDamage!(ctx, 100);
			expect(result).toBe(100);
		});

		it('should handle zero damage', () => {
			const move = makeMove();
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 0);
			expect(result).toBe(0);
		});

		it('should handle damage of 1 (minimum)', () => {
			const move = makeMove();
			const ctx = makeCtx(move);
			const result = parentalBond.onModifyDamage!(ctx, 1);
			expect(result).toBe(1);
		});
	});
});
