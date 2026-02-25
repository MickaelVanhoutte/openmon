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
		statsChanges: {
			attack: 0,
			defense: 0,
			specialAttack: 0,
			specialDefense: 0,
			speed: 0,
			accuracy: 0
		},
		types: ['normal'],
		fainted: false,
		status: undefined as Record<string, unknown> | undefined,
		heldItem: { id: 1, name: 'Test Item', description: '', power: 0, consumable: false },
		changeBattleStats(stat: string, value: number) {
			const key = stat as keyof typeof pokemon.statsChanges;
			if (key in pokemon.statsChanges) {
				pokemon.statsChanges[key] = Math.min(6, Math.max(-6, pokemon.statsChanges[key] + value));
			}
		},
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

describe('New Held Item Effects', () => {
	describe('Rocky Helmet', () => {
		it('should deal 1/6 max HP to attacker on physical move', () => {
			const effect = getItemEffect('Rocky Helmet')!;
			expect(effect).toBeDefined();

			const defender = mockPokemon();
			const attacker = mockPokemon({ currentHp: 120, currentStats: { hp: 120 } });
			const move = mockMove({ category: 'physical' });
			const ctx: ItemContext = {
				pokemon: defender,
				opponent: attacker,
				damage: 40,
				move
			};

			const result = effect.onModifyDamage!(ctx);

			expect(result).toBe(40); // damage unchanged
			expect(attacker.currentHp).toBe(100); // 120 - floor(120/6) = 120 - 20 = 100
		});

		it('should not trigger on special moves', () => {
			const effect = getItemEffect('Rocky Helmet')!;
			const defender = mockPokemon();
			const attacker = mockPokemon({ currentHp: 120, currentStats: { hp: 120 } });
			const move = mockMove({ category: 'special' });
			const ctx: ItemContext = {
				pokemon: defender,
				opponent: attacker,
				damage: 40,
				move
			};

			effect.onModifyDamage!(ctx);

			expect(attacker.currentHp).toBe(120); // no damage
		});
	});

	describe('Black Sludge', () => {
		it('should heal 1/16 HP for Poison types', () => {
			const effect = getItemEffect('Black Sludge')!;
			expect(effect).toBeDefined();

			const pokemon = mockPokemon({
				types: ['poison'],
				currentHp: 80,
				currentStats: { hp: 160 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.currentHp).toBe(90); // 80 + floor(160/16) = 80 + 10 = 90
		});

		it('should damage 1/8 HP for non-Poison types', () => {
			const effect = getItemEffect('Black Sludge')!;
			const pokemon = mockPokemon({
				types: ['fire'],
				currentHp: 100,
				currentStats: { hp: 160 }
			});
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.currentHp).toBe(80); // 100 - floor(160/8) = 100 - 20 = 80
		});
	});

	describe('Weakness Policy', () => {
		it('should boost Atk and SpA +2 on super-effective hit', () => {
			const effect = getItemEffect('Weakness Policy')!;
			expect(effect).toBeDefined();

			const pokemon = mockPokemon();
			const attacker = mockPokemon();
			const ctx: ItemContext = {
				pokemon,
				opponent: attacker,
				damage: 80,
				effectiveness: 2
			};

			const result = effect.onModifyDamage!(ctx);

			expect(result).toBe(80); // damage unchanged
			expect(pokemon.statsChanges.attack).toBe(2);
			expect(pokemon.statsChanges.specialAttack).toBe(2);
		});

		it('should not trigger on neutral effectiveness', () => {
			const effect = getItemEffect('Weakness Policy')!;
			const pokemon = mockPokemon();
			const attacker = mockPokemon();
			const ctx: ItemContext = {
				pokemon,
				opponent: attacker,
				damage: 80,
				effectiveness: 1
			};

			effect.onModifyDamage!(ctx);

			expect(pokemon.statsChanges.attack).toBe(0);
			expect(pokemon.statsChanges.specialAttack).toBe(0);
		});
	});

	describe('Flame Orb', () => {
		it('should burn holder at turn end if no status', () => {
			const effect = getItemEffect('Flame Orb')!;
			expect(effect).toBeDefined();

			const pokemon = mockPokemon({ status: undefined });
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.status).toBeDefined();
			expect(pokemon.status!.abr).toBe('BRN');
		});

		it('should not burn if already has a status', () => {
			const effect = getItemEffect('Flame Orb')!;
			const existingStatus = { abr: 'PSN', move_effect_id: 3 };
			const pokemon = mockPokemon({ status: existingStatus });
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.status!.abr).toBe('PSN'); // unchanged
		});

		it('should not burn if fainted', () => {
			const effect = getItemEffect('Flame Orb')!;
			const pokemon = mockPokemon({ fainted: true, status: undefined });
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.status).toBeUndefined();
		});
	});

	describe('Toxic Orb', () => {
		it('should badly poison holder at turn end if no status', () => {
			const effect = getItemEffect('Toxic Orb')!;
			expect(effect).toBeDefined();

			const pokemon = mockPokemon({ status: undefined });
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.status).toBeDefined();
			expect(pokemon.status!.abr).toBe('PSN+');
		});

		it('should not poison if already has a status', () => {
			const effect = getItemEffect('Toxic Orb')!;
			const existingStatus = { abr: 'BRN', move_effect_id: 5 };
			const pokemon = mockPokemon({ status: existingStatus });
			const ctx: ItemContext = { pokemon };

			effect.onTurnEnd!(ctx);

			expect(pokemon.status!.abr).toBe('BRN'); // unchanged
		});
	});
});
