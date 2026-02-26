import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Notifications } from '../scripting/notifications';

describe('Notifications', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts with empty messages', () => {
		const n = new Notifications();
		expect(n.messages).toEqual([]);
	});

	it('adds a message on notify', () => {
		const n = new Notifications();
		n.notify('Hello');
		expect(n.messages).toEqual(['Hello']);
	});

	it('stacks multiple messages', () => {
		const n = new Notifications();
		n.notify('First');
		n.notify('Second');
		expect(n.messages).toEqual(['First', 'Second']);
	});

	it('removes messages after 5 seconds', () => {
		const n = new Notifications();
		n.notify('Temporary');
		expect(n.messages).toHaveLength(1);
		vi.advanceTimersByTime(5000);
		expect(n.messages).toHaveLength(0);
	});

	it('notifies observers on message add', () => {
		const n = new Notifications();
		const observer = vi.fn();
		n.subscribe(observer);
		n.notify('Test');
		expect(observer).toHaveBeenCalledWith(['Test']);
	});

	it('notifies observers on message remove', () => {
		const n = new Notifications();
		const observer = vi.fn();
		n.subscribe(observer);
		n.notify('Test');
		observer.mockClear();
		vi.advanceTimersByTime(5000);
		expect(observer).toHaveBeenCalledWith([]);
	});

	it('supports multiple observers', () => {
		const n = new Notifications();
		const obs1 = vi.fn();
		const obs2 = vi.fn();
		n.subscribe(obs1);
		n.subscribe(obs2);
		n.notify('Broadcast');
		expect(obs1).toHaveBeenCalledWith(['Broadcast']);
		expect(obs2).toHaveBeenCalledWith(['Broadcast']);
	});
});
