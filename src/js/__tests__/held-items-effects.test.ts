import { describe, it, expect } from 'vitest';
import '../battle/items/held-items-effects';
import { getItemEffect } from '../battle/items/item-registry';
import type { ItemContext } from '../battle/items/item-engine';
import type { PokemonInstance } from '../pokemons/pokedex';
import type { Move } from '../pokemons/pokedex';

function mockPokemon(overrides: Record<string, unknown> = {}): PokemonInstance {
	const pokemon = {
		currentHp: 100,
		currentStats: { hp: 100 },
		battleStats: {
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		heldItem: { id: 1, name: 'Test Item', description: '', power: 0, consumable: false },
		choiceLockedMove: undefined as string | undefined,
		status: undefined as Record<string, unknown> | undefined,
		evolution: [] as Record<string, unknown>[],
		consumeHeldItem(): void {
			(this as Record<string, unknown>).heldItem = undefined;
		},
		...overrides
	};
	return pokemon as unknown as PokemonInstance;
}

function mockMove(overrides: Record<string, unknown> = {}): Move {
	return {
		id: 1,
		name: 'Test Move',
		type: 'normal',
		category: 'physical',
		power: 80,
		accuracy: 100,
		pp: 10,
		priority: 0,
		target: 'selected-pokemon',
		...overrides
	} as unknown as Move;
}

function mockContext(overrides: Record<string, unknown> = {}): ItemContext {
	return {
		pokemon: mockPokemon(),
		...overrides
	} as ItemContext;
}

describe('Held Item Effects', () => {
	describe('Choice Band', () => {
		it('should return 1.5x ATK', () => {
			const effect = getItemEffect('Choice Band')!;
			const ctx = mockContext({ statValue: 100 });
			expect(effect.onModifyAtk!(ctx)).toBe(150);
		});

		it('should set choiceLockedMove on first move selection', () => {
			const effect = getItemEffect('Choice Band')!;
			const pokemon = mockPokemon();
			const move = mockMove({ name: 'Tackle' });
			const ctx: ItemContext = { pokemon, move };

			effect.onMoveSelected!(ctx);

			expect(pokemon.choiceLockedMove).toBe('Tackle');
		});

		it('should not overwrite existing choiceLockedMove', () => {
			const effect = getItemEffect('Choice Band')!;
			const pokemon = mockPokemon({ choiceLockedMove: 'Tackle' });
			const move = mockMove({ name: 'Earthquake' });
			const ctx: ItemContext = { pokemon, move };

			effect.onMoveSelected!(ctx);

			expect(pokemon.choiceLockedMove).toBe('Tackle');
		});
	});

	describe('Choice Specs', () => {
		it('should return 1.5x SPA', () => {
			const effect = getItemEffect('Choice Specs')!;
			const ctx = mockContext({ statValue: 100 });
			expect(effect.onModifySpa!(ctx)).toBe(150);
		});
	});

	describe('Choice Scarf', () => {
		it('should return 1.5x Speed', () => {
			const effect = getItemEffect('Choice Scarf')!;
			const ctx = mockContext({ statValue: 100 });
			expect(effect.onModifySpeed!(ctx)).toBe(150);
		});
	});

	describe('Life Orb', () => {
		it('should return 1.3x damage', () => {
			const effect = getItemEffect('Life Orb')!;
			const ctx = mockContext({ damage: 100 });
			expect(effect.onModifyDamage!(ctx)).toBe(130);
		});

		it('should deal 10% max HP recoil on after hit', () => {
			const effect = getItemEffect('Life Orb')!;
			const pokemon = mockPokemon({ currentHp: 100, currentStats: { hp: 100 } });
			const ctx: ItemContext = { pokemon };

			effect.onAfterHit!(ctx);

			expect(pokemon.currentHp).toBe(90);
		});

		it('should not reduce HP below 0', () => {
			const effect = getItemEffect('Life Orb')!;
			const pokemon = mockPokemon({ currentHp: 5, currentStats: { hp: 100 } });
			const ctx: ItemContext = { pokemon };

			effect.onAfterHit!(ctx);

			expect(pokemon.currentHp).toBe(0);
		});
	});

	describe('Expert Belt', () => {
		it('should return 1.2x damage when super effective', () => {
			const effect = getItemEffect('Expert Belt')!;
			const ctx = mockContext({ damage: 100, effectiveness: 2 });
			expect(effect.onModifyDamage!(ctx)).toBe(120);
		});

		it('should return original damage when not super effective', () => {
			const effect = getItemEffect('Expert Belt')!;
			const ctx = mockContext({ damage: 100, effectiveness: 1 });
			expect(effect.onModifyDamage!(ctx)).toBe(100);
		});

		it('should return original damage when effectiveness is undefined', () => {
			const effect = getItemEffect('Expert Belt')!;
			const ctx = mockContext({ damage: 100 });
			expect(effect.onModifyDamage!(ctx)).toBe(100);
		});
	});

	describe('Leftovers', () => {
		it('should heal 1/16 HP per turn', () => {
			const effect = getItemEffect('Leftovers')!;
			const pokemon = mockPokemon({
				currentHp: 80,
				currentStats: { hp: 160 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.currentHp).toBe(90);
		});

		it('should not heal above max HP', () => {
			const effect = getItemEffect('Leftovers')!;
			const pokemon = mockPokemon({
				currentHp: 98,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.currentHp).toBe(100);
		});
	});

	describe('Focus Sash', () => {
		it('should survive lethal hit from full HP', () => {
			const effect = getItemEffect('Focus Sash')!;
			const pokemon = mockPokemon({
				currentHp: 100,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon, damage: 150 };

			const result = effect.onModifyDamage!(ctx);

			expect(result).toBe(99);
		});

		it('should not activate on non-lethal hit', () => {
			const effect = getItemEffect('Focus Sash')!;
			const pokemon = mockPokemon({
				currentHp: 100,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon, damage: 50 };

			const result = effect.onModifyDamage!(ctx);

			expect(result).toBe(50);
		});

		it('should not activate when not at full HP', () => {
			const effect = getItemEffect('Focus Sash')!;
			const pokemon = mockPokemon({
				currentHp: 50,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon, damage: 80 };

			const result = effect.onModifyDamage!(ctx);

			expect(result).toBe(80);
		});
	});

	describe('Assault Vest', () => {
		it('should return 1.5x SpDef', () => {
			const effect = getItemEffect('Assault Vest')!;
			const ctx = mockContext({ statValue: 100 });
			expect(effect.onModifySpd!(ctx)).toBe(150);
		});
	});

	describe('Eviolite', () => {
		it('should return 1.5x Def for pokemon with evolutions', () => {
			const effect = getItemEffect('Eviolite')!;
			const pokemon = mockPokemon({
				evolution: [{ id: 2, level: 16, method: 'level-up' }]
			});
			const ctx: ItemContext = { pokemon, statValue: 100 };
			expect(effect.onModifyDef!(ctx)).toBe(150);
		});

		it('should return 1.5x SpDef for pokemon with evolutions', () => {
			const effect = getItemEffect('Eviolite')!;
			const pokemon = mockPokemon({
				evolution: [{ id: 2, level: 16, method: 'level-up' }]
			});
			const ctx: ItemContext = { pokemon, statValue: 100 };
			expect(effect.onModifySpd!(ctx)).toBe(150);
		});

		it('should not boost Def for fully evolved pokemon', () => {
			const effect = getItemEffect('Eviolite')!;
			const pokemon = mockPokemon({ evolution: [] });
			const ctx: ItemContext = { pokemon, statValue: 100 };
			expect(effect.onModifyDef!(ctx)).toBe(100);
		});

		it('should not boost SpDef for fully evolved pokemon', () => {
			const effect = getItemEffect('Eviolite')!;
			const pokemon = mockPokemon({ evolution: [] });
			const ctx: ItemContext = { pokemon, statValue: 100 };
			expect(effect.onModifySpd!(ctx)).toBe(100);
		});
	});

	describe('Mystic Water', () => {
		it('should boost Water move power by 1.2x', () => {
			const effect = getItemEffect('Mystic Water')!;
			const move = mockMove({ type: 'water' });
			const ctx = mockContext({ move, statValue: 100 });
			expect(effect.onModifyMovePower!(ctx)).toBe(120);
		});

		it('should not boost non-Water moves', () => {
			const effect = getItemEffect('Mystic Water')!;
			const move = mockMove({ type: 'fire' });
			const ctx = mockContext({ move, statValue: 100 });
			expect(effect.onModifyMovePower!(ctx)).toBe(100);
		});
	});

	describe('Charcoal', () => {
		it('should boost Fire move power by 1.2x', () => {
			const effect = getItemEffect('Charcoal')!;
			const move = mockMove({ type: 'fire' });
			const ctx = mockContext({ move, statValue: 100 });
			expect(effect.onModifyMovePower!(ctx)).toBe(120);
		});

		it('should not boost non-Fire moves', () => {
			const effect = getItemEffect('Charcoal')!;
			const move = mockMove({ type: 'water' });
			const ctx = mockContext({ move, statValue: 100 });
			expect(effect.onModifyMovePower!(ctx)).toBe(100);
		});
	});

	describe('Magnet', () => {
		it('should boost Electric move power by 1.2x', () => {
			const effect = getItemEffect('Magnet')!;
			const move = mockMove({ type: 'electric' });
			const ctx = mockContext({ move, statValue: 100 });
			expect(effect.onModifyMovePower!(ctx)).toBe(120);
		});

		it('should not boost non-Electric moves', () => {
			const effect = getItemEffect('Magnet')!;
			const move = mockMove({ type: 'normal' });
			const ctx = mockContext({ move, statValue: 100 });
			expect(effect.onModifyMovePower!(ctx)).toBe(100);
		});
	});

	describe('Sitrus Berry', () => {
		it('should heal 25% HP when below 50%', () => {
			const effect = getItemEffect('Sitrus Berry')!;
			const pokemon = mockPokemon({
				currentHp: 40,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onHpChanged!(ctx);

			expect(pokemon.currentHp).toBe(65);
		});

		it('should not heal when above 50% HP', () => {
			const effect = getItemEffect('Sitrus Berry')!;
			const pokemon = mockPokemon({
				currentHp: 60,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onHpChanged!(ctx);

			expect(pokemon.currentHp).toBe(60);
		});

		it('should heal at exactly 50% HP', () => {
			const effect = getItemEffect('Sitrus Berry')!;
			const pokemon = mockPokemon({
				currentHp: 50,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onHpChanged!(ctx);

			expect(pokemon.currentHp).toBe(75);
		});

		it('should not heal when fainted', () => {
			const effect = getItemEffect('Sitrus Berry')!;
			const pokemon = mockPokemon({
				currentHp: 0,
				currentStats: { hp: 100 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onHpChanged!(ctx);

			expect(pokemon.currentHp).toBe(0);
		});
	});

	describe('Lum Berry', () => {
		it('should clear any status and return true', () => {
			const effect = getItemEffect('Lum Berry')!;
			const pokemon = mockPokemon({
				status: { abr: 'BRN' }
			});
			const ctx: ItemContext = { pokemon };

			const result = effect.onStatusInflicted!(ctx);

			expect(result).toBe(true);
			expect(pokemon.status).toBeUndefined();
		});
	});

	describe('Rawst Berry', () => {
		it('should clear burn and return true', () => {
			const effect = getItemEffect('Rawst Berry')!;
			const pokemon = mockPokemon({
				status: { abr: 'BRN' }
			});
			const ctx: ItemContext = { pokemon };

			const result = effect.onStatusInflicted!(ctx);

			expect(result).toBe(true);
			expect(pokemon.status).toBeUndefined();
		});

		it('should not clear sleep and return false', () => {
			const effect = getItemEffect('Rawst Berry')!;
			const pokemon = mockPokemon({
				status: { abr: 'SLP' }
			});
			const ctx: ItemContext = { pokemon };

			const result = effect.onStatusInflicted!(ctx);

			expect(result).toBe(false);
			expect(pokemon.status).toBeDefined();
		});
	});

	describe('Chesto Berry', () => {
		it('should clear sleep and return true', () => {
			const effect = getItemEffect('Chesto Berry')!;
			const pokemon = mockPokemon({
				status: { abr: 'SLP' }
			});
			const ctx: ItemContext = { pokemon };

			const result = effect.onStatusInflicted!(ctx);

			expect(result).toBe(true);
			expect(pokemon.status).toBeUndefined();
		});

		it('should not clear burn and return false', () => {
			const effect = getItemEffect('Chesto Berry')!;
			const pokemon = mockPokemon({
				status: { abr: 'BRN' }
			});
			const ctx: ItemContext = { pokemon };

			const result = effect.onStatusInflicted!(ctx);

			expect(result).toBe(false);
			expect(pokemon.status).toBeDefined();
		});
	});
});
