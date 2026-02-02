import { describe, it, expect, beforeEach } from 'vitest';
import { PokemonBox, BoxSelection } from '../pokemons/boxes';

describe('PokemonBox', () => {
	let box: PokemonBox;

	beforeEach(() => {
		box = new PokemonBox('Test Box', new Array(20).fill(undefined));
	});

	describe('constructor', () => {
		it('should create a box with name and values', () => {
			expect(box.name).toBe('Test Box');
			expect(box.values).toHaveLength(20);
		});
	});

	describe('isFull', () => {
		it('should return false when box has empty slots', () => {
			expect(box.isFull()).toBe(false);
		});
	});
});

describe('BoxSelection', () => {
	describe('constructor', () => {
		it('should create selection for party zone', () => {
			const selection = new BoxSelection('party', 2, undefined, undefined);

			expect(selection.zone).toBe('party');
			expect(selection.index).toBe(2);
			expect(selection.box).toBeUndefined();
			expect(selection.moving).toBe(false);
		});

		it('should create selection for box zone', () => {
			const selection = new BoxSelection('box', 5, 1, undefined);

			expect(selection.zone).toBe('box');
			expect(selection.index).toBe(5);
			expect(selection.box).toBe(1);
			expect(selection.moving).toBe(false);
		});

		it('should have moving default to false', () => {
			const selection = new BoxSelection('box', 0, 0, undefined);

			expect(selection.moving).toBe(false);
		});
	});
});
