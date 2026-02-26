import { describe, it, expect } from 'vitest';
import {
	ConfuseEffect,
	FlinchEffect,
	InfatuateEffect,
	LeechSeedEffect,
	NightmareEffect,
	CurseEffect,
	TauntEffect,
	EncoreEffect,
	VolatileStatus
} from '../../pokemons/effects/volatile-effects';
import { EffectTiming, EffectResult, EffectForTurn } from '../../pokemons/effects/types';

describe('VolatileEffect subclasses', () => {
	describe('ConfuseEffect', () => {
		it('has correct properties', () => {
			const e = new ConfuseEffect();
			expect(e.move_effect_id).toBe(77);
			expect(e.volatileType).toBe(VolatileStatus.CONFUSED);
			expect(e.defaultTurns).toBe(4);
		});
	});

	describe('FlinchEffect', () => {
		it('has correct properties', () => {
			const e = new FlinchEffect();
			expect(e.move_effect_id).toBe(32);
			expect(e.volatileType).toBe(VolatileStatus.FLINCH);
			expect(e.defaultTurns).toBe(0);
		});
	});

	describe('InfatuateEffect', () => {
		it('has correct properties', () => {
			const e = new InfatuateEffect();
			expect(e.move_effect_id).toBe(78);
			expect(e.volatileType).toBe(VolatileStatus.INFATUATION);
			expect(e.defaultTurns).toBe(0);
		});
	});

	describe('LeechSeedEffect', () => {
		it('has correct properties', () => {
			const e = new LeechSeedEffect();
			expect(e.move_effect_id).toBe(84);
			expect(e.volatileType).toBe(VolatileStatus.SEEDED);
			expect(e.defaultTurns).toBe(0);
		});
	});

	describe('NightmareEffect', () => {
		it('has correct properties', () => {
			const e = new NightmareEffect();
			expect(e.move_effect_id).toBe(108);
			expect(e.volatileType).toBe(VolatileStatus.NIGHTMARE);
			expect(e.defaultTurns).toBe(0);
		});
	});

	describe('CurseEffect', () => {
		it('has correct properties', () => {
			const e = new CurseEffect();
			expect(e.move_effect_id).toBe(110);
			expect(e.volatileType).toBe(VolatileStatus.CURSED);
			expect(e.defaultTurns).toBe(0);
		});
	});

	describe('TauntEffect', () => {
		it('has correct properties', () => {
			const e = new TauntEffect();
			expect(e.move_effect_id).toBe(169);
			expect(e.volatileType).toBe(VolatileStatus.TAUNT);
			expect(e.defaultTurns).toBe(3);
		});
	});

	describe('EncoreEffect', () => {
		it('has correct properties', () => {
			const e = new EncoreEffect();
			expect(e.move_effect_id).toBe(91);
			expect(e.volatileType).toBe(VolatileStatus.ENCORE);
			expect(e.defaultTurns).toBe(3);
		});
	});

	describe('base class behavior', () => {
		it('has default effect properties', () => {
			const e = new ConfuseEffect();
			expect(e.abr).toBe('');
			expect(e.duration).toBe(-1);
			expect(e.when).toBe(EffectTiming.AFTER_MOVE);
			expect(e.damages).toBe(0);
			expect(e.turnsPassed).toBe(0);
			expect(e.healed).toBe(false);
		});

		it('apply returns EffectResult', () => {
			const e = new ConfuseEffect();
			const result = e.apply([] as any);
			expect(result).toBeInstanceOf(EffectResult);
		});

		it('playEffect returns EffectForTurn', () => {
			const e = new ConfuseEffect();
			const result = e.playEffect({} as any);
			expect(result).toBeInstanceOf(EffectForTurn);
			expect(result.canPlay).toBe(true);
		});

		it('applyVolatile adds to target tracker', () => {
			const e = new TauntEffect();
			const tracker = { add: (type: any, turns: any) => {} };
			const mockAdd = vi.fn();
			tracker.add = mockAdd;
			const target = { volatiles: tracker } as any;
			e.applyVolatile(target);
			expect(mockAdd).toHaveBeenCalledWith(VolatileStatus.TAUNT, 3);
		});

		it('applyVolatile uses custom turns', () => {
			const e = new TauntEffect();
			const mockAdd = vi.fn();
			const target = { volatiles: { add: mockAdd } } as any;
			e.applyVolatile(target, 7);
			expect(mockAdd).toHaveBeenCalledWith(VolatileStatus.TAUNT, 7);
		});
	});
});

// Need vi for mocking
import { vi } from 'vitest';
