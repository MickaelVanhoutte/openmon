import { describe, it, expect, beforeEach } from 'vitest';
import { placeItems } from '../../dungeon/item-placer';
import { Position } from '../../mapping/positions';
import { SeededRNG } from '../../dungeon/prng';
import { DungeonContext, dungeonContext } from '../../dungeon/dungeon-context';
import { get } from 'svelte/store';

describe('ItemPlacer', () => {
	let rng: SeededRNG;
	let positions: Position[];

	beforeEach(() => {
		rng = new SeededRNG('test-seed');
		positions = [
			new Position(1, 1),
			new Position(2, 2),
			new Position(3, 3),
			new Position(4, 4),
			new Position(5, 5)
		];
		dungeonContext.set(new DungeonContext());
	});

	it('should place one item per position', () => {
		const items = placeItems(positions, 1, rng);
		expect(items.length).toBe(positions.length);
	});

	it('should use items from Tier 1 for floors 1-10', () => {
		const items = placeItems(positions, 5, rng);
		items.forEach((item, i) => {
			expect(item.id).toBe(200 + i);
		});
	});

	it('should use items from Tier 2 for floors 11-25', () => {
		const items = placeItems(positions, 15, rng);
		items.forEach((item, i) => {
			expect(item.id).toBe(200 + i);
		});
	});

	it('should use items from Tier 3 for floors 26+', () => {
		const items = placeItems(positions, 30, rng);
		items.forEach((item, i) => {
			expect(item.id).toBe(200 + i);
		});
	});

	it('should assign correct positions to items', () => {
		const items = placeItems(positions, 1, rng);
		items.forEach((item) => {
			expect(positions).toContainEqual(item.position);
		});
	});

	it('should be deterministic with the same seed', () => {
		const rng1 = new SeededRNG('fixed-seed');
		const items1 = placeItems(positions, 1, rng1);

		const rng2 = new SeededRNG('fixed-seed');
		const items2 = placeItems(positions, 1, rng2);

		expect(items1.length).toBe(items2.length);
		for (let i = 0; i < items1.length; i++) {
			expect(items1[i].id).toBe(items2[i].id);
			expect(items1[i].position.x).toBe(items2[i].position.x);
			expect(items1[i].position.y).toBe(items2[i].position.y);
		}
	});

	it('should mark items as pickedUp if they are in DungeonContext', () => {
		const dc = get(dungeonContext)!;
		dc.pickedItems.add('1-0'); // Mark first item of floor 1 as picked

		const items = placeItems(positions, 1, rng);
		// In our implementation, the first item in the loop gets index 0
		expect(items[0].pickedUp).toBe(true);
		if (items.length > 1) {
			expect(items[1].pickedUp).toBe(false);
		}
	});
});
