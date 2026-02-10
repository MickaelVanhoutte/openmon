import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../battle/items/held-items-effects';
import { ItemEngine } from '../battle/items/item-engine';
import { HeldItemTrigger } from '../items/held-items-model';
import type { HeldItemData } from '../items/held-items-model';
import type { PokemonInstance } from '../pokemons/pokedex';
import type { Move } from '../pokemons/pokedex';
import type { ItemsReferences } from '../items/items';
import { Bag } from '../items/bag';
import { KnockOff } from '../pokemons/effects/moves/knock-off';

const CATEGORY_HELD = 40;

function heldItemData(overrides: Partial<HeldItemData> = {}): HeldItemData {
	return {
		id: 1,
		name: 'Test Item',
		description: '',
		power: 0,
		consumable: false,
		...overrides
	};
}

function mockPokemon(overrides: Record<string, unknown> = {}): PokemonInstance {
	const pokemon = {
		name: 'TestMon',
		currentHp: 100,
		maxHp: 100,
		currentStats: {
			hp: 100,
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		battleStats: {
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		heldItem: undefined as HeldItemData | undefined,
		choiceLockedMove: undefined as string | undefined,
		status: undefined as Record<string, unknown> | undefined,
		fainted: false,
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

function createMockItemsRefs(heldItems: HeldItemData[]): ItemsReferences {
	const heldMap = new Map<number, HeldItemData>();
	const refs: Record<number, { categoryId: number }> = {};
	for (const item of heldItems) {
		heldMap.set(item.id, item);
		refs[item.id] = { categoryId: CATEGORY_HELD };
	}
	return {
		references: refs,
		ids: heldItems.map((i) => i.id),
		getItem: vi.fn((id: number) => refs[id]),
		getHeldItemById: vi.fn((id: number) => heldMap.get(id))
	} as unknown as ItemsReferences;
}

const LEFTOVERS = heldItemData({
	id: 4006,
	name: 'Leftovers',
	description: 'Restores 1/16 of max HP at the end of each turn.',
	power: 16,
	consumable: false
});

const CHOICE_BAND = heldItemData({
	id: 4001,
	name: 'Choice Band',
	description: 'Boosts Attack by 50% but locks the holder into one move.',
	power: 1.5,
	consumable: false
});

const CHOICE_SCARF = heldItemData({
	id: 4003,
	name: 'Choice Scarf',
	description: 'Boosts Speed by 50% but locks the holder into one move.',
	power: 1.5,
	consumable: false
});

const LIFE_ORB = heldItemData({
	id: 4004,
	name: 'Life Orb',
	description: 'Boosts move power by 30% but costs 10% HP per attack.',
	power: 1.3,
	consumable: false
});

const EXPERT_BELT = heldItemData({
	id: 4005,
	name: 'Expert Belt',
	description: 'Boosts super-effective moves by 20%.',
	power: 1.2,
	consumable: false
});

const FOCUS_SASH = heldItemData({
	id: 4007,
	name: 'Focus Sash',
	description: 'Survives a one-hit KO with 1 HP when at full health. Single use.',
	power: 1,
	consumable: true
});

const SITRUS_BERRY = heldItemData({
	id: 4013,
	name: 'Sitrus Berry',
	description: 'Restores 25% of max HP when HP drops below 50%.',
	power: 4,
	consumable: true
});

const LUM_BERRY = heldItemData({
	id: 4014,
	name: 'Lum Berry',
	description: 'Cures any status condition when afflicted. Single use.',
	power: 0,
	consumable: true
});

const RAWST_BERRY = heldItemData({
	id: 4015,
	name: 'Rawst Berry',
	description: 'Cures a burn when afflicted. Single use.',
	power: 0,
	consumable: true
});

const CHESTO_BERRY = heldItemData({
	id: 4016,
	name: 'Chesto Berry',
	description: 'Cures sleep when afflicted. Single use.',
	power: 0,
	consumable: true
});

describe('Held Items Integration', () => {
	let engine: ItemEngine;

	beforeEach(() => {
		engine = new ItemEngine();
	});

	describe('Bag Give/Take Integration', () => {
		let bag: Bag;
		let items: ItemsReferences;

		beforeEach(() => {
			bag = new Bag();
			items = createMockItemsRefs([LEFTOVERS, CHOICE_BAND]);
		});

		it('should set pokemon.heldItem when giving item from bag', () => {
			bag.heldItems[LEFTOVERS.id] = 2;
			const pokemon = mockPokemon();

			bag.giveHeldItem(LEFTOVERS.id, pokemon, items);

			expect(pokemon.heldItem).toBe(LEFTOVERS);
			expect(bag.heldItems[LEFTOVERS.id]).toBe(1);
		});

		it('should return item to bag when taking from pokemon', () => {
			const pokemon = mockPokemon({ heldItem: LEFTOVERS });

			bag.takeHeldItem(pokemon);

			expect(pokemon.heldItem).toBeUndefined();
			expect(bag.heldItems[LEFTOVERS.id]).toBe(1);
		});

		it('should swap existing item when giving new one', () => {
			bag.heldItems[CHOICE_BAND.id] = 1;
			const pokemon = mockPokemon({ heldItem: LEFTOVERS });

			bag.giveHeldItem(CHOICE_BAND.id, pokemon, items);

			expect(pokemon.heldItem).toBe(CHOICE_BAND);
			expect(bag.heldItems[LEFTOVERS.id]).toBe(1);
			expect(bag.heldItems[CHOICE_BAND.id]).toBeUndefined();
		});

		it('should preserve item counts across give and take cycle', () => {
			bag.heldItems[LEFTOVERS.id] = 3;
			const pokemon = mockPokemon();

			bag.giveHeldItem(LEFTOVERS.id, pokemon, items);
			expect(bag.heldItems[LEFTOVERS.id]).toBe(2);

			bag.takeHeldItem(pokemon);
			expect(bag.heldItems[LEFTOVERS.id]).toBe(3);
			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should throw when bag has no stock of the item', () => {
			const pokemon = mockPokemon();

			expect(() => bag.giveHeldItem(LEFTOVERS.id, pokemon, items)).toThrow('No Leftovers in bag');
		});

		it('should delete pocket entry when last item is given', () => {
			bag.heldItems[LEFTOVERS.id] = 1;
			const pokemon = mockPokemon();

			bag.giveHeldItem(LEFTOVERS.id, pokemon, items);

			expect(bag.heldItems[LEFTOVERS.id]).toBeUndefined();
		});
	});

	describe('Berry Consumption Flow', () => {
		it('should heal Sitrus Berry holder at <=50% HP and consume the berry', () => {
			const pokemon = mockPokemon({
				heldItem: { ...SITRUS_BERRY },
				currentHp: 40,
				currentStats: { hp: 100 }
			});

			engine.runItemEvent(HeldItemTrigger.ON_HP_CHANGED, { pokemon });

			expect(pokemon.currentHp).toBe(65);
			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should NOT heal Sitrus Berry holder above 50% HP', () => {
			const pokemon = mockPokemon({
				heldItem: { ...SITRUS_BERRY },
				currentHp: 60,
				currentStats: { hp: 100 }
			});

			engine.runItemEvent(HeldItemTrigger.ON_HP_CHANGED, { pokemon });

			expect(pokemon.currentHp).toBe(60);
		});

		it('should cure any status with Lum Berry and consume it', () => {
			const pokemon = mockPokemon({
				heldItem: { ...LUM_BERRY },
				status: { abr: 'BRN' }
			});

			engine.runItemEvent(HeldItemTrigger.ON_STATUS_INFLICTED, { pokemon });

			expect(pokemon.status).toBeUndefined();
			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should cure burn with Rawst Berry and consume it', () => {
			const pokemon = mockPokemon({
				heldItem: { ...RAWST_BERRY },
				status: { abr: 'BRN' }
			});

			engine.runItemEvent(HeldItemTrigger.ON_STATUS_INFLICTED, { pokemon });

			expect(pokemon.status).toBeUndefined();
			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should NOT cure sleep with Rawst Berry (preserved)', () => {
			const pokemon = mockPokemon({
				heldItem: { ...RAWST_BERRY },
				status: { abr: 'SLP' }
			});

			engine.runItemEvent(HeldItemTrigger.ON_STATUS_INFLICTED, { pokemon });

			expect(pokemon.status).toBeDefined();
			expect(pokemon.heldItem).toBeDefined();
			expect(pokemon.heldItem!.name).toBe('Rawst Berry');
		});

		it('should cure sleep with Chesto Berry and consume it', () => {
			const pokemon = mockPokemon({
				heldItem: { ...CHESTO_BERRY },
				status: { abr: 'SLP' }
			});

			engine.runItemEvent(HeldItemTrigger.ON_STATUS_INFLICTED, { pokemon });

			expect(pokemon.status).toBeUndefined();
			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should NOT cure burn with Chesto Berry (preserved)', () => {
			const pokemon = mockPokemon({
				heldItem: { ...CHESTO_BERRY },
				status: { abr: 'BRN' }
			});

			engine.runItemEvent(HeldItemTrigger.ON_STATUS_INFLICTED, { pokemon });

			expect(pokemon.status).toBeDefined();
			expect(pokemon.heldItem).toBeDefined();
			expect(pokemon.heldItem!.name).toBe('Chesto Berry');
		});
	});

	describe('Choice Item Locking', () => {
		it('should set choiceLockedMove on first move selection with Choice Band', () => {
			const pokemon = mockPokemon({ heldItem: { ...CHOICE_BAND } });
			const move = mockMove({ name: 'Tackle' });

			engine.runItemEvent(HeldItemTrigger.ON_MOVE_SELECTED, { pokemon, move });

			expect(pokemon.choiceLockedMove).toBe('Tackle');
		});

		it('should not overwrite existing choiceLockedMove', () => {
			const pokemon = mockPokemon({
				heldItem: { ...CHOICE_BAND },
				choiceLockedMove: 'Tackle'
			});
			const move = mockMove({ name: 'Earthquake' });

			engine.runItemEvent(HeldItemTrigger.ON_MOVE_SELECTED, { pokemon, move });

			expect(pokemon.choiceLockedMove).toBe('Tackle');
		});

		it('should clear choiceLockedMove on switch (field reset)', () => {
			const pokemon = mockPokemon({
				heldItem: { ...CHOICE_BAND },
				choiceLockedMove: 'Tackle'
			});

			pokemon.choiceLockedMove = undefined;

			expect(pokemon.choiceLockedMove).toBeUndefined();
		});

		it('should boost speed by 1.5x with Choice Scarf via engine', () => {
			const pokemon = mockPokemon({ heldItem: { ...CHOICE_SCARF } });

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_SPEED, {
				pokemon,
				statValue: 100
			});

			expect(result).toBe(150);
		});
	});

	describe('Focus Sash + Survival', () => {
		it('should survive lethal hit from full HP', () => {
			const pokemon = mockPokemon({
				heldItem: { ...FOCUS_SASH },
				currentHp: 100,
				currentStats: { hp: 100 }
			});

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_DAMAGE, {
				pokemon,
				damage: 150
			});

			expect(result).toBe(99);
		});

		it('should be consumed after activation', () => {
			const pokemon = mockPokemon({
				heldItem: { ...FOCUS_SASH },
				currentHp: 100,
				currentStats: { hp: 100 }
			});

			engine.runItemEvent(HeldItemTrigger.ON_MODIFY_DAMAGE, {
				pokemon,
				damage: 150
			});

			expect(pokemon.heldItem).toBeUndefined();
		});

		it('should NOT activate when not at full HP', () => {
			const pokemon = mockPokemon({
				heldItem: { ...FOCUS_SASH },
				currentHp: 50,
				currentStats: { hp: 100 }
			});

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_DAMAGE, {
				pokemon,
				damage: 80
			});

			expect(result).toBe(80);
		});
	});

	describe('Knock Off + Item Removal', () => {
		it('should remove opponent held item', () => {
			const target = mockPokemon({
				name: 'Opponent',
				heldItem: { ...LEFTOVERS }
			});
			const user = mockPokemon({ name: 'Attacker' });

			const knockOff = new KnockOff();
			const result = knockOff.apply([target], user);

			expect(target.heldItem).toBeUndefined();
			expect(result.message).toContain('dropped its item');
		});

		it('should do nothing when opponent has no item', () => {
			const target = mockPokemon({ name: 'Opponent' });
			const user = mockPokemon({ name: 'Attacker' });

			const knockOff = new KnockOff();
			const result = knockOff.apply([target], user);

			expect(target.heldItem).toBeUndefined();
			expect(result.message).toBeUndefined();
		});
	});

	describe('Stat Modifiers End-to-End', () => {
		it('should boost damage by 1.3x with Life Orb via engine', () => {
			const pokemon = mockPokemon({ heldItem: { ...LIFE_ORB } });

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_DAMAGE, {
				pokemon,
				damage: 100
			});

			expect(result).toBe(130);
		});

		it('should deal 10% HP recoil with Life Orb on after hit', () => {
			const pokemon = mockPokemon({
				heldItem: { ...LIFE_ORB },
				currentHp: 100,
				currentStats: { hp: 100 }
			});

			engine.runItemEvent(HeldItemTrigger.ON_AFTER_HIT, { pokemon });

			expect(pokemon.currentHp).toBe(90);
		});

		it('should boost super-effective damage by 1.2x with Expert Belt', () => {
			const pokemon = mockPokemon({ heldItem: { ...EXPERT_BELT } });

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_DAMAGE, {
				pokemon,
				damage: 100,
				effectiveness: 2
			});

			expect(result).toBe(120);
		});

		it('should NOT boost neutral damage with Expert Belt', () => {
			const pokemon = mockPokemon({ heldItem: { ...EXPERT_BELT } });

			const result = engine.runItemEvent<number>(HeldItemTrigger.ON_MODIFY_DAMAGE, {
				pokemon,
				damage: 100,
				effectiveness: 1
			});

			expect(result).toBe(100);
		});

		it('should heal 1/16 HP with Leftovers on turn end', () => {
			const pokemon = mockPokemon({
				heldItem: { ...LEFTOVERS },
				currentHp: 80,
				currentStats: { hp: 160 }
			});

			engine.runItemEvent(HeldItemTrigger.ON_TURN_END, { pokemon });

			expect(pokemon.currentHp).toBe(90);
		});
	});

	describe('Save/Load Compatibility', () => {
		it('should serialize and deserialize pokemon with heldItem', () => {
			const pokemon = mockPokemon({ heldItem: { ...LEFTOVERS } });

			const serialized = JSON.stringify(pokemon);
			const deserialized = JSON.parse(serialized);

			expect(deserialized.heldItem).toBeDefined();
			expect(deserialized.heldItem.name).toBe('Leftovers');
			expect(deserialized.heldItem.id).toBe(4006);
			expect(deserialized.heldItem.consumable).toBe(false);
		});

		it('should serialize and deserialize pokemon without heldItem', () => {
			const pokemon = mockPokemon();

			const serialized = JSON.stringify(pokemon);
			const deserialized = JSON.parse(serialized);

			expect(deserialized.heldItem).toBeUndefined();
		});

		it('should preserve full heldItem data through round-trip', () => {
			const pokemon = mockPokemon({ heldItem: { ...FOCUS_SASH } });

			const roundTripped = JSON.parse(JSON.stringify(pokemon));

			expect(roundTripped.heldItem.name).toBe('Focus Sash');
			expect(roundTripped.heldItem.consumable).toBe(true);
			expect(roundTripped.heldItem.power).toBe(1);
			expect(roundTripped.heldItem.description).toBe(
				'Survives a one-hit KO with 1 HP when at full health. Single use.'
			);
		});
	});
});
