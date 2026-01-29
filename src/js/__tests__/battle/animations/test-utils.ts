/**
 * Test utilities for animation testing.
 * Provides mocking for GSAP timelines and animation helpers.
 */

import { vi } from 'vitest';

/**
 * Mock GSAP timeline that tracks all animations.
 */
export interface MockTimeline {
	animations: MockAnimation[];
	to: (target: unknown, vars: Record<string, unknown>) => MockTimeline;
	fromTo: (
		target: unknown,
		fromVars: Record<string, unknown>,
		toVars: Record<string, unknown>
	) => MockTimeline;
	set: (target: unknown, vars: Record<string, unknown>) => MockTimeline;
	add: (child: unknown, position?: string | number) => MockTimeline;
	call: (callback: () => void, args?: unknown[], position?: string | number) => MockTimeline;
	play: () => MockTimeline;
	pause: () => MockTimeline;
	kill: () => void;
	then: (callback: () => void) => Promise<void>;
	totalDuration: () => number;
}

export interface MockAnimation {
	type: 'to' | 'fromTo' | 'set' | 'call';
	target: unknown;
	vars: Record<string, unknown>;
	fromVars?: Record<string, unknown>;
}

/**
 * Creates a mock GSAP timeline for testing.
 * Tracks all animation calls without actually animating.
 */
export function createMockTimeline(): MockTimeline {
	const animations: MockAnimation[] = [];

	const timeline: MockTimeline = {
		animations,

		to(target, vars) {
			animations.push({ type: 'to', target, vars });
			return timeline;
		},

		fromTo(target, fromVars, toVars) {
			animations.push({ type: 'fromTo', target, vars: toVars, fromVars });
			return timeline;
		},

		set(target, vars) {
			animations.push({ type: 'set', target, vars });
			return timeline;
		},

		add(child, _position) {
			// For nested timelines, we'd need more complex handling
			return timeline;
		},

		call(callback, _args, _position) {
			animations.push({ type: 'call', target: callback, vars: {} });
			return timeline;
		},

		play() {
			return timeline;
		},

		pause() {
			return timeline;
		},

		kill() {
			animations.length = 0;
		},

		then(callback) {
			// Immediately resolve for testing
			callback();
			return Promise.resolve();
		},

		totalDuration() {
			return animations.reduce((total, anim) => {
				const duration = (anim.vars.duration as number) || 0;
				return total + duration;
			}, 0);
		}
	};

	return timeline;
}

/**
 * Creates a mock GSAP module for vitest mocking.
 */
export function createMockGsap() {
	const timelines: MockTimeline[] = [];

	return {
		timeline: (config?: Record<string, unknown>) => {
			const tl = createMockTimeline();
			timelines.push(tl);
			return tl;
		},

		to: (target: unknown, vars: Record<string, unknown>) => {
			const tl = createMockTimeline();
			timelines.push(tl);
			tl.to(target, vars);
			return tl;
		},

		fromTo: (
			target: unknown,
			fromVars: Record<string, unknown>,
			toVars: Record<string, unknown>
		) => {
			const tl = createMockTimeline();
			tl.fromTo(target, fromVars, toVars);
			return tl;
		},

		set: (target: unknown, vars: Record<string, unknown>) => {
			const tl = createMockTimeline();
			tl.set(target, vars);
			return tl;
		},

		registerEase: vi.fn(),

		getTimelines: () => timelines,

		clearTimelines: () => {
			timelines.length = 0;
		}
	};
}

/**
 * Mock DOM element for testing sprite animations.
 */
export function createMockElement(id: string = 'mock-element'): HTMLElement {
	const element = document.createElement('div');
	element.id = id;
	element.style.cssText = 'position: absolute; left: 0; top: 0; width: 96px; height: 96px;';
	return element;
}

/**
 * Mock container element for battle scene.
 */
export function createMockContainer(width: number = 800, height: number = 600): HTMLElement {
	const container = document.createElement('div');
	container.className = 'wrapper';
	container.style.cssText = `position: relative; width: ${width}px; height: ${height}px;`;

	// Mock getBoundingClientRect for container sizing
	container.getBoundingClientRect = () => ({
		left: 0,
		top: 0,
		right: width,
		bottom: height,
		width,
		height,
		x: 0,
		y: 0,
		toJSON: () => ({})
	});

	return container;
}
