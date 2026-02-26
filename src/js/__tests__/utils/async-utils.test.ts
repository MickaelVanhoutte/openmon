import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay, waitFor } from '../../utils/async-utils';

describe('async-utils', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('delay', () => {
		it('resolves after the specified time', async () => {
			const p = delay(500);
			let resolved = false;
			p.then(() => {
				resolved = true;
			});

			expect(resolved).toBe(false);
			await vi.advanceTimersByTimeAsync(500);
			expect(resolved).toBe(true);
		});

		it('resolves immediately for 0ms', async () => {
			const p = delay(0);
			await vi.advanceTimersByTimeAsync(0);
			await expect(p).resolves.toBeUndefined();
		});
	});

	describe('waitFor', () => {
		it('resolves immediately when condition is already true', async () => {
			const p = waitFor(() => true);
			// Should resolve without needing to advance timers
			await vi.advanceTimersByTimeAsync(0);
			await expect(p).resolves.toBeUndefined();
		});

		it('resolves when condition becomes true after polling', async () => {
			let flag = false;
			const p = waitFor(() => flag);
			let resolved = false;
			p.then(() => {
				resolved = true;
			});

			await vi.advanceTimersByTimeAsync(50);
			expect(resolved).toBe(false);

			flag = true;
			await vi.advanceTimersByTimeAsync(50);
			expect(resolved).toBe(true);
		});

		it('uses custom polling interval', async () => {
			let flag = false;
			const p = waitFor(() => flag, 200);
			let resolved = false;
			p.then(() => {
				resolved = true;
			});

			// Default 50ms tick should not trigger
			await vi.advanceTimersByTimeAsync(100);
			expect(resolved).toBe(false);

			flag = true;
			await vi.advanceTimersByTimeAsync(200);
			expect(resolved).toBe(true);
		});
	});
});
