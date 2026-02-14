import { vi } from 'vitest';

// Mock fetch globally
const originalFetch = global.fetch;
global.fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
	const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;

	if (urlString.startsWith('./') || !urlString.startsWith('http')) {
		return Promise.resolve({
			ok: true,
			json: () => Promise.resolve({}),
			text: () => Promise.resolve(''),
			blob: () => Promise.resolve(new Blob()),
			arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
			formData: () => Promise.resolve(new FormData())
		} as Response);
	}
	return originalFetch
		? originalFetch(url, init)
		: Promise.reject(new Error('Fetch not available'));
});

// Mock howler
vi.mock('howler', () => ({
	Howl: vi.fn(() => ({
		play: vi.fn(),
		stop: vi.fn(),
		volume: vi.fn(),
		unload: vi.fn(),
		on: vi.fn()
	})),
	Howler: {
		volume: vi.fn()
	}
}));

// Mock CanvasRenderingContext2D if not already available in jsdom
if (typeof window !== 'undefined' && !window.CanvasRenderingContext2D) {
	window.CanvasRenderingContext2D = vi.fn() as any;
}

// Mock gsap
vi.mock('gsap', () => {
	const mockTimeline = {
		to: vi.fn().mockReturnThis(),
		add: vi.fn().mockReturnThis(),
		then: vi.fn().mockImplementation((cb: any) => {
			cb?.();
			return Promise.resolve();
		}),
		kill: vi.fn()
	};

	const gsapMock = {
		timeline: vi.fn(() => mockTimeline),
		to: vi.fn().mockImplementation((target: any, options: any) => {
			if (options?.onComplete) {
				setTimeout(() => options.onComplete(), 0);
			}
			return mockTimeline;
		}),
		set: vi.fn(),
		registerEase: vi.fn()
	};

	return {
		default: gsapMock,
		gsap: gsapMock
	};
});
