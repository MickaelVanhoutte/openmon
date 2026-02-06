import { describe, it, expect, vi } from 'vitest';
import {
	getCaptureRate,
	Pokeball,
	HealingItem,
	ReviveItem,
	ItemsReferences
} from '../../items/items';
import { ItemUsageResult, UseItemAction } from '../../items/items-model';
import type { PokemonInstance } from '../../pokemons/pokedex';

function createMockPokemon(options: {
	currentHp?: number;
	maxHp?: number;
	captureRate?: number;
	fainted?: boolean;
	status?: { move_effect_id: number } | undefined;
}): PokemonInstance {
	const maxHp = options.maxHp ?? 100;
	return {
		currentHp: options.currentHp ?? maxHp,
		currentStats: { hp: maxHp },
		captureRate: options.captureRate ?? 45,
		fainted: options.fainted ?? false,
		status: options.status,
		heal: vi.fn(),
		revive: vi.fn()
	} as unknown as PokemonInstance;
}

describe('Items Module', () => {
	describe('ItemUsageResult', () => {
		it('should store success state', () => {
			const successResult = new ItemUsageResult(true);
			const failResult = new ItemUsageResult(false);

			expect(successResult.success).toBe(true);
			expect(failResult.success).toBe(false);
		});
	});

	describe('UseItemAction', () => {
		it('should store item id and target', () => {
			const target = createMockPokemon({});
			const action = new UseItemAction(1, target);

			expect(action.item).toBe(1);
			expect(action.target).toBe(target);
		});

		it('should allow creation without target', () => {
			const action = new UseItemAction(1);

			expect(action.item).toBe(1);
			expect(action.target).toBeUndefined();
		});
	});

	describe('getCaptureRate', () => {
		it('should return higher rate for low HP targets', () => {
			const fullHpPokemon = createMockPokemon({ currentHp: 100, maxHp: 100, captureRate: 45 });
			const lowHpPokemon = createMockPokemon({ currentHp: 10, maxHp: 100, captureRate: 45 });

			const fullHpRate = getCaptureRate(fullHpPokemon, 1);
			const lowHpRate = getCaptureRate(lowHpPokemon, 1);

			expect(lowHpRate).toBeGreaterThan(fullHpRate);
		});

		it('should return higher rate for higher pokeball power', () => {
			const pokemon = createMockPokemon({ currentHp: 50, maxHp: 100, captureRate: 45 });

			const normalBallRate = getCaptureRate(pokemon, 1);
			const greatBallRate = getCaptureRate(pokemon, 1.5);
			const ultraBallRate = getCaptureRate(pokemon, 2);

			expect(greatBallRate).toBeGreaterThan(normalBallRate);
			expect(ultraBallRate).toBeGreaterThan(greatBallRate);
		});

		it('should apply 1.5x status bonus for generic status', () => {
			const noStatusPokemon = createMockPokemon({
				currentHp: 50,
				maxHp: 100,
				captureRate: 45,
				status: undefined
			});
			const statusPokemon = createMockPokemon({
				currentHp: 50,
				maxHp: 100,
				captureRate: 45,
				status: { move_effect_id: 5 } // poison or paralysis
			});

			const noStatusRate = getCaptureRate(noStatusPokemon, 1);
			const statusRate = getCaptureRate(statusPokemon, 1);

			expect(statusRate).toBeGreaterThan(noStatusRate);
		});

		it('should apply 2x status bonus for sleep (move_effect_id: 2)', () => {
			const genericStatusPokemon = createMockPokemon({
				currentHp: 50,
				maxHp: 100,
				captureRate: 45,
				status: { move_effect_id: 5 }
			});
			const sleepPokemon = createMockPokemon({
				currentHp: 50,
				maxHp: 100,
				captureRate: 45,
				status: { move_effect_id: 2 } // sleep
			});

			const genericStatusRate = getCaptureRate(genericStatusPokemon, 1);
			const sleepRate = getCaptureRate(sleepPokemon, 1);

			expect(sleepRate).toBeGreaterThan(genericStatusRate);
		});

		it('should apply 2x status bonus for freeze (move_effect_id: 6)', () => {
			const genericStatusPokemon = createMockPokemon({
				currentHp: 50,
				maxHp: 100,
				captureRate: 45,
				status: { move_effect_id: 5 }
			});
			const freezePokemon = createMockPokemon({
				currentHp: 50,
				maxHp: 100,
				captureRate: 45,
				status: { move_effect_id: 6 } // freeze
			});

			const genericStatusRate = getCaptureRate(genericStatusPokemon, 1);
			const freezeRate = getCaptureRate(freezePokemon, 1);

			expect(freezeRate).toBeGreaterThan(genericStatusRate);
		});

		it('should return higher rate for Pokemon with higher capture rate', () => {
			const hardToCapture = createMockPokemon({ currentHp: 50, maxHp: 100, captureRate: 3 });
			const easyToCapture = createMockPokemon({ currentHp: 50, maxHp: 100, captureRate: 255 });

			const hardRate = getCaptureRate(hardToCapture, 1);
			const easyRate = getCaptureRate(easyToCapture, 1);

			expect(easyRate).toBeGreaterThan(hardRate);
		});
	});

	describe('Pokeball', () => {
		it('should instantiate a new Pokeball with same properties', () => {
			const pokeball = new Pokeball(1, 34, 'Poke Ball', 'A standard ball', 1);
			const instance = pokeball.instanciate();

			expect(instance).toBeInstanceOf(Pokeball);
			expect(instance.id).toBe(1);
			expect(instance.categoryId).toBe(34);
			expect(instance.name).toBe('Poke Ball');
			expect(instance.power).toBe(1);
		});

		it('should not apply without battle context', () => {
			const pokeball = new Pokeball(1, 34, 'Poke Ball', 'A standard ball', 1);
			const target = createMockPokemon({});

			expect(pokeball.doesApply(target, undefined, undefined)).toBe(false);
		});

		it('should throw error when apply called without target', () => {
			const pokeball = new Pokeball(1, 34, 'Poke Ball', 'A standard ball', 1);

			expect(() => pokeball.apply(null as unknown as PokemonInstance)).toThrow(
				'Missing target or current'
			);
		});

		it('should return ItemUsageResult when applied to target', () => {
			const pokeball = new Pokeball(1, 34, 'Poke Ball', 'A standard ball', 1);
			const target = createMockPokemon({ currentHp: 1, maxHp: 100, captureRate: 255 });

			const result = pokeball.apply(target);

			expect(result).toBeInstanceOf(ItemUsageResult);
			expect(typeof result.success).toBe('boolean');
		});
	});

	describe('HealingItem', () => {
		it('should instantiate a new HealingItem with same properties', () => {
			const potion = new HealingItem(2, 27, 'Potion', 'Heals 20 HP', 20);
			const instance = potion.instanciate();

			expect(instance).toBeInstanceOf(HealingItem);
			expect(instance.id).toBe(2);
			expect(instance.categoryId).toBe(27);
			expect(instance.name).toBe('Potion');
			expect(instance.power).toBe(20);
		});

		it('should apply to damaged Pokemon', () => {
			const potion = new HealingItem(2, 27, 'Potion', 'Heals 20 HP', 20);
			const damagedPokemon = createMockPokemon({ currentHp: 50, maxHp: 100, fainted: false });

			expect(potion.doesApply(damagedPokemon)).toBe(true);
		});

		it('should not apply to full HP Pokemon', () => {
			const potion = new HealingItem(2, 27, 'Potion', 'Heals 20 HP', 20);
			const fullHpPokemon = createMockPokemon({ currentHp: 100, maxHp: 100, fainted: false });

			expect(potion.doesApply(fullHpPokemon)).toBe(false);
		});

		it('should apply to fainted Pokemon (doesApply returns true)', () => {
			const potion = new HealingItem(2, 27, 'Potion', 'Heals 20 HP', 20);
			const faintedPokemon = createMockPokemon({ currentHp: 0, maxHp: 100, fainted: true });

			expect(potion.doesApply(faintedPokemon)).toBe(true);
		});

		it('should call heal with power value', () => {
			const potion = new HealingItem(2, 27, 'Potion', 'Heals 20 HP', 20);
			const pokemon = createMockPokemon({ currentHp: 50, maxHp: 100 });

			const result = potion.apply(pokemon);

			expect(pokemon.heal).toHaveBeenCalledWith(20);
			expect(result.success).toBe(true);
		});

		it('should heal full HP when power is -1', () => {
			const fullHeal = new HealingItem(3, 27, 'Full Restore', 'Fully heals', -1);
			const pokemon = createMockPokemon({ currentHp: 10, maxHp: 150 });

			fullHeal.apply(pokemon);

			expect(pokemon.heal).toHaveBeenCalledWith(150);
		});

		it('should throw error when applied to full HP Pokemon', () => {
			const potion = new HealingItem(2, 27, 'Potion', 'Heals 20 HP', 20);
			const fullHpPokemon = createMockPokemon({ currentHp: 100, maxHp: 100 });

			expect(() => potion.apply(fullHpPokemon)).toThrow('This pokemon is already at full health');
		});
	});

	describe('ReviveItem', () => {
		it('should instantiate a new ReviveItem with same properties', () => {
			const revive = new ReviveItem(4, 29, 'Revive', 'Revives fainted Pokemon', 50);
			const instance = revive.instanciate();

			expect(instance).toBeInstanceOf(ReviveItem);
			expect(instance.id).toBe(4);
			expect(instance.categoryId).toBe(29);
			expect(instance.name).toBe('Revive');
			expect(instance.power).toBe(50);
		});

		it('should only apply to fainted Pokemon', () => {
			const revive = new ReviveItem(4, 29, 'Revive', 'Revives fainted Pokemon', 50);
			const faintedPokemon = createMockPokemon({ fainted: true });
			const alivePokemon = createMockPokemon({ fainted: false });

			expect(revive.doesApply(faintedPokemon)).toBe(true);
			expect(revive.doesApply(alivePokemon)).toBe(false);
		});

		it('should revive with percentage of max HP', () => {
			const revive = new ReviveItem(4, 29, 'Revive', 'Revives to 50% HP', 50);
			const pokemon = createMockPokemon({ currentHp: 0, maxHp: 100, fainted: true });

			const result = revive.apply(pokemon);

			expect(pokemon.revive).toHaveBeenCalledWith(50);
			expect(result.success).toBe(true);
		});

		it('should revive with full HP when power is -1', () => {
			const maxRevive = new ReviveItem(5, 29, 'Max Revive', 'Revives to full HP', -1);
			const pokemon = createMockPokemon({ currentHp: 0, maxHp: 200, fainted: true });

			maxRevive.apply(pokemon);

			expect(pokemon.revive).toHaveBeenCalledWith(200);
		});

		it('should throw error when applied to non-fainted Pokemon', () => {
			const revive = new ReviveItem(4, 29, 'Revive', 'Revives fainted Pokemon', 50);
			const alivePokemon = createMockPokemon({ fainted: false });

			expect(() => revive.apply(alivePokemon)).toThrow(
				'This item can only be used on fainted pokemon'
			);
		});
	});

	describe('ItemsReferences', () => {
		it('should have category constants defined', () => {
			expect(ItemsReferences.POKEBALL).toBe(34);
			expect(ItemsReferences.POTION).toBe(27);
			expect(ItemsReferences.REVIVE).toBe(29);
		});

		it('should load items from JSON', () => {
			const refs = new ItemsReferences();

			expect(refs.ids.length).toBeGreaterThan(0);
			expect(Object.keys(refs.references).length).toBeGreaterThan(0);
		});

		it('should return undefined for non-existent item', () => {
			const refs = new ItemsReferences();

			expect(refs.getItem(-999)).toBeUndefined();
		});

		it('should return correct item type for pokeball category', () => {
			const refs = new ItemsReferences();
			const pokeballs = refs.ids.filter((id) => {
				const item = refs.getItem(id);
				return item?.categoryId === ItemsReferences.POKEBALL;
			});

			if (pokeballs.length > 0) {
				const pokeball = refs.getItem(pokeballs[0]);
				expect(pokeball).toBeInstanceOf(Pokeball);
			}
		});

		it('should return correct item type for potion category', () => {
			const refs = new ItemsReferences();
			const potions = refs.ids.filter((id) => {
				const item = refs.getItem(id);
				return item?.categoryId === ItemsReferences.POTION;
			});

			if (potions.length > 0) {
				const potion = refs.getItem(potions[0]);
				expect(potion).toBeInstanceOf(HealingItem);
			}
		});

		it('should return correct item type for revive category', () => {
			const refs = new ItemsReferences();
			const revives = refs.ids.filter((id) => {
				const item = refs.getItem(id);
				return item?.categoryId === ItemsReferences.REVIVE;
			});

			if (revives.length > 0) {
				const revive = refs.getItem(revives[0]);
				expect(revive).toBeInstanceOf(ReviveItem);
			}
		});
	});
});
