import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EffectPool } from '$js/battle/animations/effect-pool';

describe('EffectPool', () => {
	let effectPool: EffectPool;

	beforeEach(() => {
		effectPool = new EffectPool(5);
	});

	afterEach(() => {
		effectPool.clear();
	});

	describe('acquire', () => {
		it('should return element for known effect', () => {
			const element = effectPool.acquire('impact');

			expect(element).not.toBeNull();
			expect(element?.dataset.effectName).toBe('impact');
		});

		it('should return null for unknown effect', () => {
			const element = effectPool.acquire('nonexistent');

			expect(element).toBeNull();
		});

		it('should create element with correct styles', () => {
			const element = effectPool.acquire('fire');

			expect(element?.style.position).toBe('absolute');
			expect(element?.style.width).toBe('192px');
			expect(element?.style.height).toBe('192px');
		});

		it('should track element as active', () => {
			effectPool.acquire('impact');
			const stats = effectPool.getStats();

			expect(stats.active).toBe(1);
		});
	});

	describe('release', () => {
		it('should return element to pool', () => {
			const element = effectPool.acquire('impact')!;
			effectPool.release(element);

			const stats = effectPool.getStats();
			expect(stats.active).toBe(0);
			expect(stats.pooled).toBe(1);
		});

		it('should reuse released elements', () => {
			const element1 = effectPool.acquire('impact')!;
			effectPool.release(element1);

			const element2 = effectPool.acquire('impact');
			expect(element2).toBe(element1);
		});

		it('should hide released element', () => {
			const element = effectPool.acquire('impact')!;
			effectPool.release(element);

			expect(element.style.display).toBe('none');
		});

		it('should respect max pool size', () => {
			const elements: HTMLDivElement[] = [];
			for (let i = 0; i < 10; i++) {
				elements.push(effectPool.acquire('impact')!);
			}

			elements.forEach((el) => effectPool.release(el));

			const stats = effectPool.getStats();
			expect(stats.pooled).toBe(5);
		});

		it('should ignore elements not in active set', () => {
			const fakeElement = document.createElement('div');
			effectPool.release(fakeElement);

			const stats = effectPool.getStats();
			expect(stats.pooled).toBe(0);
		});
	});

	describe('clear', () => {
		it('should empty all pools', () => {
			effectPool.acquire('impact');
			effectPool.acquire('fire');

			effectPool.clear();

			const stats = effectPool.getStats();
			expect(stats.active).toBe(0);
			expect(stats.pooled).toBe(0);
		});
	});

	describe('getStats', () => {
		it('should track pooled and active counts', () => {
			const el1 = effectPool.acquire('impact')!;
			effectPool.acquire('fire');
			effectPool.release(el1);

			const stats = effectPool.getStats();
			expect(stats.active).toBe(1);
			expect(stats.pooled).toBe(1);
		});
	});

	describe('preload', () => {
		it('should not throw for known effects', () => {
			expect(() => effectPool.preload(['impact', 'fire'])).not.toThrow();
		});

		it('should not throw for unknown effects', () => {
			expect(() => effectPool.preload(['nonexistent'])).not.toThrow();
		});
	});
});
