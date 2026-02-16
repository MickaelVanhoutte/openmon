import { describe, it, expect, vi, beforeEach } from 'vitest';
import gsap from 'gsap';
import {
	AnimationEngine,
	TYPE_COLORS,
	TYPE_HUE_ANGLES,
	FALLBACK_TYPE_TO_EFFECT,
	type MoveContext,
	type PokemonSprite
} from '../battle/animations/animation-engine';

function createMockElement(): HTMLElement {
	const el = document.createElement('div');
	el.getBoundingClientRect = vi.fn(() => ({
		left: 100,
		top: 100,
		right: 200,
		bottom: 200,
		width: 100,
		height: 100,
		x: 100,
		y: 100,
		toJSON: () => ({})
	}));
	return el;
}

function createMockSprite(side: 'player' | 'opponent' = 'player', index = 0): PokemonSprite {
	return {
		slot: { side, index },
		element: createMockElement(),
		homePosition: { x: 0.3, y: 0.7, z: 0, scale: 1, opacity: 1 }
	};
}

function createContext(overrides: Partial<MoveContext> = {}): MoveContext {
	return {
		attacker: createMockSprite('player'),
		defender: createMockSprite('opponent'),
		moveName: 'unknown-move',
		moveCategory: 'physical',
		moveType: 'normal',
		...overrides
	};
}

describe('FALLBACK_TYPE_TO_EFFECT mapping', () => {
	it('covers all 18 pokemon types', () => {
		const allTypes = [
			'normal',
			'fire',
			'water',
			'electric',
			'grass',
			'ice',
			'fighting',
			'poison',
			'ground',
			'flying',
			'psychic',
			'bug',
			'rock',
			'ghost',
			'dragon',
			'dark',
			'steel',
			'fairy'
		];

		for (const type of allTypes) {
			expect(FALLBACK_TYPE_TO_EFFECT[type]).toBeDefined();
		}
	});

	it('maps fire to fire effect', () => {
		expect(FALLBACK_TYPE_TO_EFFECT.fire).toBe('fire');
	});

	it('maps water to water effect', () => {
		expect(FALLBACK_TYPE_TO_EFFECT.water).toBe('water');
	});

	it('maps electric to thunder effect', () => {
		expect(FALLBACK_TYPE_TO_EFFECT.electric).toBe('thunder');
	});

	it('maps normal to impact effect', () => {
		expect(FALLBACK_TYPE_TO_EFFECT.normal).toBe('impact');
	});

	it('maps ghost to shadowball effect', () => {
		expect(FALLBACK_TYPE_TO_EFFECT.ghost).toBe('shadowball');
	});
});

describe('TYPE_COLORS', () => {
	it('has entries for all 18 types', () => {
		expect(Object.keys(TYPE_COLORS)).toHaveLength(18);
	});

	it('water is blue-ish', () => {
		expect(TYPE_COLORS.water).toBe('#6890F0');
	});

	it('fire is orange-ish', () => {
		expect(TYPE_COLORS.fire).toBe('#F08030');
	});
});

describe('TYPE_HUE_ANGLES', () => {
	it('has entries for all 18 types', () => {
		expect(Object.keys(TYPE_HUE_ANGLES)).toHaveLength(18);
	});

	it('water hue is 200', () => {
		expect(TYPE_HUE_ANGLES.water).toBe(200);
	});

	it('fire hue is 0 (base)', () => {
		expect(TYPE_HUE_ANGLES.fire).toBe(0);
	});

	it('electric hue is 50', () => {
		expect(TYPE_HUE_ANGLES.electric).toBe(50);
	});
});

describe('AnimationEngine fallback animations', () => {
	let engine: AnimationEngine;
	let container: HTMLElement;

	beforeEach(() => {
		vi.mocked(gsap.timeline).mockImplementation(() => {
			const tl = {
				to: vi.fn().mockReturnThis(),
				add: vi.fn().mockImplementation((cb: unknown) => {
					if (typeof cb === 'function') {
						cb();
					}
					return tl;
				}),
				then: vi.fn().mockImplementation((cb: unknown) => {
					if (typeof cb === 'function') {
						(cb as () => void)();
					}
					return Promise.resolve();
				}),
				kill: vi.fn()
			};
			return tl as unknown as gsap.core.Timeline;
		});

		container = document.createElement('div');
		container.getBoundingClientRect = vi.fn(() => ({
			left: 0,
			top: 0,
			right: 800,
			bottom: 600,
			width: 800,
			height: 600,
			x: 0,
			y: 0,
			toJSON: () => ({})
		}));
		document.body.appendChild(container);
		engine = new AnimationEngine(container);
		engine.initialize();
	});

	it('uses fallback for unregistered move names', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'totally-unknown-move',
			moveCategory: 'special',
			moveType: 'water'
		});

		await engine.playMove(ctx);

		expect(showSpriteEffectSpy).toHaveBeenCalled();
		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('water');
	});

	it('special fallback uses water effect for water type', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'aqua-mystery',
			moveCategory: 'special',
			moveType: 'water'
		});

		await engine.playMove(ctx);

		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('water');
		expect(callArgs[2]).toEqual(
			expect.objectContaining({
				hueRotate: TYPE_HUE_ANGLES.water,
				tint: TYPE_COLORS.water
			})
		);
	});

	it('special fallback uses fire effect for fire type', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'flame-mystery',
			moveCategory: 'special',
			moveType: 'fire'
		});

		await engine.playMove(ctx);

		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('fire');
		expect(callArgs[2]).toEqual(
			expect.objectContaining({
				hueRotate: TYPE_HUE_ANGLES.fire,
				tint: TYPE_COLORS.fire
			})
		);
	});

	it('special fallback uses thunder effect for electric type', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'zap-mystery',
			moveCategory: 'special',
			moveType: 'electric'
		});

		await engine.playMove(ctx);

		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('thunder');
		expect(callArgs[2]).toEqual(
			expect.objectContaining({
				hueRotate: TYPE_HUE_ANGLES.electric,
				tint: TYPE_COLORS.electric
			})
		);
	});

	it('physical fallback shows type-colored effect on defender', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'ice-mystery-punch',
			moveCategory: 'physical',
			moveType: 'ice'
		});

		await engine.playMove(ctx);

		expect(showSpriteEffectSpy).toHaveBeenCalled();
		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('ice');
		expect(callArgs[2]).toEqual(
			expect.objectContaining({
				hueRotate: TYPE_HUE_ANGLES.ice,
				tint: TYPE_COLORS.ice
			})
		);
	});

	it('status fallback uses type color for flash and buff effect', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'poison-mystery-status',
			moveCategory: 'status',
			moveType: 'poison'
		});

		await engine.playMove(ctx);

		expect(showSpriteEffectSpy).toHaveBeenCalled();
		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('buff');
		expect(callArgs[2]).toEqual(
			expect.objectContaining({
				hueRotate: TYPE_HUE_ANGLES.poison,
				tint: TYPE_COLORS.poison
			})
		);
	});

	it('getTypeColor returns correct color for known types', () => {
		expect(engine.getTypeColor('water')).toBe('#6890F0');
		expect(engine.getTypeColor('fire')).toBe('#F08030');
		expect(engine.getTypeColor('electric')).toBe('#F8D030');
		expect(engine.getTypeColor('grass')).toBe('#78C850');
	});

	it('getTypeColor falls back to normal for unknown types', () => {
		expect(engine.getTypeColor('unknown')).toBe(TYPE_COLORS.normal);
	});

	it('getTypeHueAngle returns correct angle for known types', () => {
		expect(engine.getTypeHueAngle('water')).toBe(200);
		expect(engine.getTypeHueAngle('fire')).toBe(0);
		expect(engine.getTypeHueAngle('grass')).toBe(90);
	});

	it('getTypeHueAngle falls back to normal for unknown types', () => {
		expect(engine.getTypeHueAngle('unknown')).toBe(TYPE_HUE_ANGLES.normal);
	});

	it('fallback defaults to impact effect for unknown type strings', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const ctx = createContext({
			moveName: 'mystery-move',
			moveCategory: 'special',
			moveType: 'cosmic'
		});

		await engine.playMove(ctx);

		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('impact');
	});

	it('does not use fallback for registered moves', async () => {
		const customAnimation = vi.fn().mockResolvedValue(undefined);
		engine.registerMove('custom-move', customAnimation);

		const ctx = createContext({
			moveName: 'custom-move',
			moveCategory: 'special',
			moveType: 'fire'
		});

		await engine.playMove(ctx);

		expect(customAnimation).toHaveBeenCalledWith(engine, ctx);
	});

	it('physical fallback handles defender array', async () => {
		const showSpriteEffectSpy = vi.spyOn(engine, 'showSpriteEffect');
		const defender1 = createMockSprite('opponent', 0);
		const defender2 = createMockSprite('opponent', 1);

		const ctx = createContext({
			moveName: 'multi-mystery',
			moveCategory: 'physical',
			moveType: 'grass',
			defender: [defender1, defender2]
		});

		await engine.playMove(ctx);

		expect(showSpriteEffectSpy).toHaveBeenCalled();
		const callArgs = showSpriteEffectSpy.mock.calls[0];
		expect(callArgs[0]).toBe('leaf');
		expect(callArgs[1]).toBe(defender1);
	});
});
