import type { PokemonInstance } from '../pokemons/pokedex';
import itemsJson from '../../assets/data/final/beta/usable-items.json';
import heldItemsJson from '../../assets/data/final/beta/held-items.json';
import { Player } from '../characters/player';
import { AItem, ItemUsageResult } from './items-model';
import type { BattleContext } from '../context/battleContext';
import type { HeldItemData } from '$js/items/held-items-model';

export class Pokeball extends AItem {
	constructor(id: number, categoryId: number, name: string, description: string, power: number) {
		super(id, categoryId, name, description, power);
	}

	instanciate(): AItem {
		return new Pokeball(this.id, this.categoryId, this.name, this.description, this.power);
	}

	doesApply(target: PokemonInstance, current?: PokemonInstance, ctx?: BattleContext): boolean {
		return !(!ctx || ctx.opponent instanceof Player);
	}

	apply(target: PokemonInstance): ItemUsageResult {
		if (target) {
			return new ItemUsageResult(Math.random() < getCaptureRate(target, this.power));
		}

		throw new Error('Missing target or current');
	}
}

export function getCaptureRate(target: PokemonInstance, power: number): number {
	const currentHp = target.currentHp;
	const maxHp = target.currentStats.hp;
	const captureRate = target.captureRate;

	let statusBonus = 1;
	if (target.status) {
		statusBonus = 1.5;
		// sleep/freeze
		if (target.status.move_effect_id === 2 || target.status.move_effect_id === 6) {
			statusBonus = 2;
		}
	}

	return (1 + (maxHp * 3 - currentHp * 2) * captureRate * power * statusBonus) / (maxHp * 3) / 256;
}

export class HealingItem extends AItem {
	constructor(id: number, categoryId: number, name: string, description: string, power: number) {
		super(id, categoryId, name, description, power);
	}

	instanciate(): AItem {
		return new HealingItem(this.id, this.categoryId, this.name, this.description, this.power);
	}

	doesApply(target: PokemonInstance, current?: PokemonInstance, ctx?: BattleContext): boolean {
		return !(!target.fainted && target.currentHp === target.currentStats.hp);
	}

	apply(target: PokemonInstance): ItemUsageResult {
		if (target.currentHp === target.currentStats.hp) {
			throw new Error('This pokemon is already at full health');
		}
		target.heal(this.power === -1 ? target.currentStats.hp : this.power);
		return new ItemUsageResult(true);
	}
}

export class ReviveItem extends AItem {
	constructor(id: number, categoryId: number, name: string, description: string, power: number) {
		super(id, categoryId, name, description, power);
	}

	instanciate(): AItem {
		return new ReviveItem(this.id, this.categoryId, this.name, this.description, this.power);
	}

	doesApply(target: PokemonInstance, current?: PokemonInstance, ctx?: BattleContext): boolean {
		return target.fainted;
	}
	apply(target: PokemonInstance): ItemUsageResult {
		if (target.fainted) {
			target.revive(
				this.power === -1
					? target.currentStats.hp
					: Math.floor((target.currentStats.hp * this.power) / 100)
			);
			return new ItemUsageResult(true);
		} else {
			throw new Error('This item can only be used on fainted pokemon');
		}
	}
}

export class ItemsReferences {
	public static POKEBALL = 34;
	public static POTION = 27;
	public static REVIVE = 29;
	public static HELD_ITEM = 40;

	public references: Record<number, AItem> = {};
	public ids: number[] = [];
	public heldItemsMap: Map<number, HeldItemData> = new Map();

	constructor() {
		itemsJson.forEach((item: any) => {
			this.ids.push(item.id);
			switch (item.categoryId) {
				case ItemsReferences.POKEBALL:
					this.references[item.id] = new Pokeball(
						item.id,
						item.categoryId,
						item.name,
						item.description,
						item.power
					);
					break;
				case ItemsReferences.POTION:
					this.references[item.id] = new HealingItem(
						item.id,
						item.categoryId,
						item.name,
						item.description,
						item.power
					);
					break;
				case ItemsReferences.REVIVE:
					this.references[item.id] = new ReviveItem(
						item.id,
						item.categoryId,
						item.name,
						item.description,
						item.power
					);
					break;
				default:
					break;
			}
		});

		(heldItemsJson as HeldItemData[]).forEach((item) => {
			this.heldItemsMap.set(item.id, item);
		});
	}

	public getItem(id: number): AItem | undefined {
		return this.references[id];
	}

	public getHeldItemById(id: number): HeldItemData | undefined {
		return this.heldItemsMap.get(id);
	}

	public getHeldItemByName(name: string): HeldItemData | undefined {
		for (const item of this.heldItemsMap.values()) {
			if (item.name === name) {
				return item;
			}
		}
		return undefined;
	}

	public getAllHeldItems(): HeldItemData[] {
		return Array.from(this.heldItemsMap.values());
	}
}
