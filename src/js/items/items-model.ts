import type { PokemonInstance } from '../pokemons/pokedex';
import type { BattleContext } from '../context/battleContext';

export class UseItemAction {
	item: number;
	target?: PokemonInstance;

	constructor(item: number, target?: PokemonInstance) {
		this.item = item;
		this.target = target;
	}
}

export class ItemUsageResult {
	public success: boolean;

	constructor(success: boolean) {
		this.success = success;
	}
}

export abstract class AItem {
	id: number;
	categoryId: number;
	name: string;
	description: string;
	power: number;

	protected constructor(
		id: number,
		categoryId: number,
		name: string,
		description: string,
		power: number
	) {
		this.id = id;
		this.categoryId = categoryId;
		this.name = name;
		this.description = description;
		this.power = power;
	}

	abstract instanciate(instance?: AItem): AItem;

	abstract doesApply(
		target: PokemonInstance,
		current?: PokemonInstance,
		ctx?: BattleContext
	): boolean;

	abstract apply(target: PokemonInstance, current?: PokemonInstance): ItemUsageResult;
}
