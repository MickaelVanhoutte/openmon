import { describe, it, expect } from 'vitest';
import { MoveEffectApplier } from '../pokemons/effects/moves/move-effect-applier';
import { UnknownEffect } from '../pokemons/effects/moves/unknown-effect';
import { EffectResult, EffectForTurn, EffectTiming, type Effect } from '../pokemons/effects/types';
import { MoveEffect } from '../pokemons/pokedex';

function createMockEffect(id: number): Effect {
	return {
		move_effect_id: id,
		abr: `eff-${id}`,
		duration: -1,
		when: EffectTiming.AFTER_MOVE,
		damages: 0,
		turnsPassed: 0,
		healed: false,
		apply: () => new EffectResult(undefined, `Applied effect ${id}`),
		playEffect: () => new EffectForTurn(true)
	};
}

describe('MoveEffectApplier', () => {
	describe('findEffect', () => {
		it('should return direct match for registered effect ID', () => {
			const effect1 = createMockEffect(1);
			const effect2 = createMockEffect(50);
			const applier = new MoveEffectApplier([effect1, effect2]);

			const moveEffect = new MoveEffect(50, 9, '', '');
			const found = applier.findEffect(moveEffect);

			expect(found).toBe(effect2);
		});

		it('should route SIMPLE_DAMAGE_EFFECT_IDS (379) to RegularDamageEffect (id=1)', () => {
			const regularDamageEffect = createMockEffect(1);
			const applier = new MoveEffectApplier([regularDamageEffect]);

			const moveEffect = new MoveEffect(379, 9, '', '');
			const found = applier.findEffect(moveEffect);

			expect(found).toBe(regularDamageEffect);
			expect(found!.move_effect_id).toBe(1);
		});

		it('should return UnknownEffect for unregistered non-simple effect IDs', () => {
			const regularDamageEffect = createMockEffect(1);
			const applier = new MoveEffectApplier([regularDamageEffect]);

			const moveEffect = new MoveEffect(9999, 9, '', '');
			const found = applier.findEffect(moveEffect);

			expect(found).toBeInstanceOf(UnknownEffect);
		});

		it('should prefer direct match over simple damage routing', () => {
			const regularDamageEffect = createMockEffect(1);
			const directEffect = createMockEffect(379);
			const applier = new MoveEffectApplier([regularDamageEffect, directEffect]);

			const moveEffect = new MoveEffect(379, 9, '', '');
			const found = applier.findEffect(moveEffect);

			expect(found).toBe(directEffect);
			expect(found!.move_effect_id).toBe(379);
		});
	});

	describe('apply', () => {
		it('should use found effect to apply', () => {
			const effect1 = createMockEffect(1);
			const applier = new MoveEffectApplier([effect1]);

			const moveEffect = new MoveEffect(1, 9, '', '');
			const result = applier.apply(moveEffect, [], {} as any);

			expect(result.message).toBe('Applied effect 1');
		});

		it('should return UnknownEffect result for missing effect IDs', () => {
			const applier = new MoveEffectApplier([]);

			const moveEffect = new MoveEffect(9999, 9, '', '');
			const result = applier.apply(moveEffect, [], {} as any);

			expect(result.message).toBe('Effect not implemented yet...');
		});

		it('should route simple damage ID (379) to regular damage apply', () => {
			const regularDamageEffect = createMockEffect(1);
			const applier = new MoveEffectApplier([regularDamageEffect]);

			const moveEffect = new MoveEffect(379, 9, '', '');
			const result = applier.apply(moveEffect, [], {} as any);

			expect(result.message).toBe('Applied effect 1');
		});
	});
});
