import { describe, it, expect } from 'vitest';
import { OverworldItem } from '../../items/overworldItem';
import { Position } from '../../mapping/positions';

describe('OverworldItem', () => {
	it('creates with all properties', () => {
		const item = new OverworldItem('Potion', true, new Position(5, 5), 'potion.png');
		expect(item.name).toBe('Potion');
		expect(item.visible).toBe(true);
		expect(item.position.x).toBe(5);
		expect(item.spriteSrc).toBe('potion.png');
		expect(item.pickedUp).toBe(false);
	});

	describe('isBehindCounter', () => {
		it('always returns false', () => {
			const item = new OverworldItem('Item', true, new Position(0, 0), '');
			expect(item.isBehindCounter()).toBe(false);
		});
	});

	describe('isBlocking', () => {
		it('returns true when not picked up and visible', () => {
			const item = new OverworldItem('Item', true, new Position(0, 0), '');
			expect(item.isBlocking()).toBe(true);
		});

		it('returns false when picked up', () => {
			const item = new OverworldItem('Item', true, new Position(0, 0), '');
			item.pickedUp = true;
			expect(item.isBlocking()).toBe(false);
		});

		it('returns false when not visible', () => {
			const item = new OverworldItem('Item', false, new Position(0, 0), '');
			expect(item.isBlocking()).toBe(false);
		});
	});

	describe('interact', () => {
		it('marks as picked up on first interact', () => {
			const item = new OverworldItem('Item', true, new Position(0, 0), '');
			item.interact(new Position(0, 1), {} as any);
			expect(item.pickedUp).toBe(true);
		});

		it('returns scripts on first interact', () => {
			const scripts = [{ type: 'test' }] as any;
			const item = new OverworldItem('Item', true, new Position(0, 0), '', undefined, scripts);
			const result = item.interact(new Position(0, 1), {} as any);
			expect(result).toBe(scripts);
		});

		it('returns empty array when no scripts', () => {
			const item = new OverworldItem('Item', true, new Position(0, 0), '');
			const result = item.interact(new Position(0, 1), {} as any);
			expect(result).toEqual([]);
		});

		it('returns empty array on second interact', () => {
			const item = new OverworldItem('Item', true, new Position(0, 0), '', undefined, [{}] as any);
			item.interact(new Position(0, 1), {} as any);
			const result = item.interact(new Position(0, 1), {} as any);
			expect(result).toEqual([]);
		});
	});
});
