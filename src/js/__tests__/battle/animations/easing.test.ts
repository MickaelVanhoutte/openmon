import { describe, it, expect, vi, beforeEach } from 'vitest';
import { easingFunctions, getEasing, registerCustomEasings } from '$js/battle/animations/easing';

vi.mock('gsap', () => ({
	default: {
		registerEase: vi.fn()
	}
}));

describe('Easing Functions', () => {
	describe('ballistic', () => {
		it('should return 0 at x=0', () => {
			expect(easingFunctions.ballistic(0)).toBe(0);
		});

		it('should return 0 at x=1', () => {
			expect(easingFunctions.ballistic(1)).toBe(0);
		});

		it('should peak at x=0.5 with value 1', () => {
			expect(easingFunctions.ballistic(0.5)).toBe(1);
		});
	});

	describe('ballisticUp', () => {
		it('should return 0 at x=0', () => {
			expect(easingFunctions.ballisticUp(0)).toBe(0);
		});

		it('should peak around x=0.666', () => {
			const peak = easingFunctions.ballisticUp(2 / 3);
			expect(peak).toBeCloseTo(1.333, 2);
		});

		it('should return 1 at x=1', () => {
			expect(easingFunctions.ballisticUp(1)).toBe(1);
		});
	});

	describe('quadUp (ease-out)', () => {
		it('should return 0 at x=0', () => {
			expect(easingFunctions.quadUp(0)).toBe(0);
		});

		it('should return 1 at x=1', () => {
			expect(easingFunctions.quadUp(1)).toBe(1);
		});

		it('should be faster at start (concave up)', () => {
			expect(easingFunctions.quadUp(0.5)).toBeCloseTo(0.75, 2);
		});
	});

	describe('quadDown (ease-in)', () => {
		it('should return 0 at x=0', () => {
			expect(easingFunctions.quadDown(0)).toBe(0);
		});

		it('should return 1 at x=1', () => {
			expect(easingFunctions.quadDown(1)).toBe(1);
		});

		it('should be slower at start (convex)', () => {
			expect(easingFunctions.quadDown(0.5)).toBe(0.25);
		});
	});

	describe('swing', () => {
		it('should return 0 at x=0', () => {
			expect(easingFunctions.swing(0)).toBe(0);
		});

		it('should return 1 at x=1', () => {
			expect(easingFunctions.swing(1)).toBeCloseTo(1, 5);
		});

		it('should return 0.5 at midpoint', () => {
			expect(easingFunctions.swing(0.5)).toBeCloseTo(0.5, 5);
		});
	});

	describe('getEasing', () => {
		it('should return linear function for linear type', () => {
			const linear = getEasing('linear');
			expect(linear(0.5)).toBe(0.5);
		});

		it('should return correct easing function for known type', () => {
			const ballistic = getEasing('ballistic');
			expect(ballistic(0.5)).toBe(1);
		});

		it('should return linear for unknown type', () => {
			const unknown = getEasing('unknown' as never);
			expect(unknown(0.5)).toBe(0.5);
		});
	});

	describe('registerCustomEasings', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should register all easing functions with gsap', async () => {
			const gsap = await import('gsap');
			registerCustomEasings();

			expect(gsap.default.registerEase).toHaveBeenCalledTimes(6);
			expect(gsap.default.registerEase).toHaveBeenCalledWith('ballistic', expect.any(Function));
			expect(gsap.default.registerEase).toHaveBeenCalledWith('quadUp', expect.any(Function));
		});
	});
});
