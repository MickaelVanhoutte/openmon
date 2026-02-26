import { describe, it, expect } from 'vitest';
import { MoveManager, type MoveOwner } from '../../pokemons/helpers/move-manager';
import { MoveInstance } from '../../pokemons/pokedex';
import type { PokedexEntry, Move } from '../../pokemons/pokedex';

function makeMove(overrides: Partial<MoveInstance> = {}): MoveInstance {
	return new MoveInstance(
		overrides.id ?? 1,
		overrides.name ?? 'Tackle',
		overrides.type ?? 'normal',
		(overrides.category as any) ?? 'physical',
		overrides.power ?? 40,
		overrides.accuracy ?? 100,
		overrides.pp ?? 35,
		overrides.priority ?? 0,
		'selected-pokemon',
		{ id: 1 } as any,
		0,
		'',
		overrides.level ?? 1
	);
}

function createOwner(overrides: Partial<MoveOwner> = {}): MoveOwner {
	return {
		moves: [makeMove()],
		level: 50,
		...overrides
	};
}

describe('MoveManager', () => {
	describe('selectMove (Random)', () => {
		it('returns a move from the owner moves', () => {
			const moves = [makeMove({ name: 'Tackle' }), makeMove({ id: 2, name: 'Scratch' })];
			const owner = createOwner({ moves });
			const mgr = new MoveManager(owner);
			const selected = mgr.selectMove('Random');
			expect(moves).toContain(selected);
		});

		it('returns the only move when single move available', () => {
			const move = makeMove({ name: 'Tackle' });
			const owner = createOwner({ moves: [move] });
			const mgr = new MoveManager(owner);
			expect(mgr.selectMove('Random')).toBe(move);
		});
	});

	describe('selectMove (Easy)', () => {
		it('returns a move when target has matching type', () => {
			const moves = [
				makeMove({ name: 'Tackle', type: 'normal', power: 40 }),
				makeMove({ id: 2, name: 'Thunderbolt', type: 'electric', power: 90 })
			];
			const owner = createOwner({ moves });
			const mgr = new MoveManager(owner);
			const selected = mgr.selectMove('Easy', { types: ['electric', 'flying'] });
			expect(moves).toContain(selected);
		});

		it('falls back to random when no type match', () => {
			const moves = [makeMove({ name: 'Tackle', type: 'normal', power: 40 })];
			const owner = createOwner({ moves });
			const mgr = new MoveManager(owner);
			const selected = mgr.selectMove('Easy', { types: ['fire'] });
			expect(selected).toBe(moves[0]);
		});

		it('returns a move even with single-type target', () => {
			const moves = [
				makeMove({ name: 'Tackle', type: 'normal', power: 40 }),
				makeMove({ id: 2, name: 'Flamethrower', type: 'fire', power: 90 })
			];
			const owner = createOwner({ moves });
			const mgr = new MoveManager(owner);
			const selected = mgr.selectMove('Easy', { types: ['fire'] });
			expect(moves).toContain(selected);
		});
	});

	describe('selectLatestMoves', () => {
		it('returns up to 4 most recent moves for current level', () => {
			const entryMoves: Move[] = [
				{ id: 1, name: 'Tackle', type: 'normal', category: 'physical', power: 40, accuracy: 100, pp: 35, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 1, method: 1 },
				{ id: 2, name: 'Growl', type: 'normal', category: 'no-damage', power: 0, accuracy: 100, pp: 40, priority: 0, target: 'all-opponents', effect: { id: 1 }, effectChance: 0, description: '', level: 5, method: 1 },
				{ id: 3, name: 'Ember', type: 'fire', category: 'special', power: 40, accuracy: 100, pp: 25, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 10, method: 1 },
				{ id: 4, name: 'Smokescreen', type: 'normal', category: 'no-damage', power: 0, accuracy: 100, pp: 20, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 15, method: 1 },
				{ id: 5, name: 'Flamethrower', type: 'fire', category: 'special', power: 90, accuracy: 100, pp: 15, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 20, method: 1 }
			] as Move[];

			const entry = { moves: entryMoves } as PokedexEntry;
			const owner = createOwner({ level: 20 });
			const mgr = new MoveManager(owner);
			const result = mgr.selectLatestMoves(entry);

			expect(result).toHaveLength(4);
			expect(result[0].name).toBe('Growl');
			expect(result[3].name).toBe('Flamethrower');
			expect(result.every((m) => m instanceof MoveInstance)).toBe(true);
		});

		it('filters out moves above current level', () => {
			const entryMoves: Move[] = [
				{ id: 1, name: 'Tackle', type: 'normal', category: 'physical', power: 40, accuracy: 100, pp: 35, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 1, method: 1 },
				{ id: 2, name: 'Flamethrower', type: 'fire', category: 'special', power: 90, accuracy: 100, pp: 15, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 50, method: 1 }
			] as Move[];

			const entry = { moves: entryMoves } as PokedexEntry;
			const owner = createOwner({ level: 10 });
			const mgr = new MoveManager(owner);
			const result = mgr.selectLatestMoves(entry);

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Tackle');
		});

		it('excludes moves with non-levelup method', () => {
			const entryMoves: Move[] = [
				{ id: 1, name: 'Tackle', type: 'normal', category: 'physical', power: 40, accuracy: 100, pp: 35, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 1, method: 1 },
				{ id: 2, name: 'Ice Beam', type: 'ice', category: 'special', power: 90, accuracy: 100, pp: 10, priority: 0, target: 'selected-pokemon', effect: { id: 1 }, effectChance: 0, description: '', level: 1, method: 4 }
			] as Move[];

			const entry = { moves: entryMoves } as PokedexEntry;
			const owner = createOwner({ level: 50 });
			const mgr = new MoveManager(owner);
			const result = mgr.selectLatestMoves(entry);

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Tackle');
		});
	});
});
