import type { BattleContext } from '../../context/battleContext';
import type { PokemonInstance } from '../../pokemons/pokedex';
import { Move } from '../../pokemons/pokedex';
import { HeldItemTrigger } from '../../items/held-items-model';
import { getItemEffect } from './item-registry';

export interface ItemContext {
	pokemon: PokemonInstance;
	opponent?: PokemonInstance;
	move?: Move;
	damage?: number;
	battleCtx?: BattleContext;
}

type ItemHookName =
	| 'onSwitchIn'
	| 'onModifyAtk'
	| 'onModifyDef'
	| 'onModifySpa'
	| 'onModifySpd'
	| 'onModifySpeed'
	| 'onModifyDamage'
	| 'onModifyMovePower'
	| 'onBeforeHit'
	| 'onAfterHit'
	| 'onTurnEnd'
	| 'onStatusInflicted'
	| 'onHpChanged'
	| 'onMoveSelected';

const TRIGGER_TO_HOOK: Record<HeldItemTrigger, ItemHookName> = {
	[HeldItemTrigger.ON_SWITCH_IN]: 'onSwitchIn',
	[HeldItemTrigger.ON_MODIFY_ATK]: 'onModifyAtk',
	[HeldItemTrigger.ON_MODIFY_DEF]: 'onModifyDef',
	[HeldItemTrigger.ON_MODIFY_SPA]: 'onModifySpa',
	[HeldItemTrigger.ON_MODIFY_SPD]: 'onModifySpd',
	[HeldItemTrigger.ON_MODIFY_SPEED]: 'onModifySpeed',
	[HeldItemTrigger.ON_MODIFY_DAMAGE]: 'onModifyDamage',
	[HeldItemTrigger.ON_MODIFY_MOVE_POWER]: 'onModifyMovePower',
	[HeldItemTrigger.ON_BEFORE_HIT]: 'onBeforeHit',
	[HeldItemTrigger.ON_AFTER_HIT]: 'onAfterHit',
	[HeldItemTrigger.ON_TURN_END]: 'onTurnEnd',
	[HeldItemTrigger.ON_STATUS_INFLICTED]: 'onStatusInflicted',
	[HeldItemTrigger.ON_HP_CHANGED]: 'onHpChanged',
	[HeldItemTrigger.ON_MOVE_SELECTED]: 'onMoveSelected'
};

export class ItemEngine {
	runItemEvent<T>(trigger: HeldItemTrigger, ctx: ItemContext): T | undefined {
		const { pokemon } = ctx;

		if (!pokemon.heldItem) {
			return undefined;
		}

		const effect = getItemEffect(pokemon.heldItem.name);
		if (!effect) {
			return undefined;
		}

		const hookName = TRIGGER_TO_HOOK[trigger];
		const hook = effect[hookName];
		if (typeof hook !== 'function') {
			return undefined;
		}

		const result = (hook as (ctx: ItemContext) => T).call(effect, ctx);

		// Auto-consume consumable items (berries) after effect fires
		if (pokemon.heldItem?.consumable) {
			pokemon.consumeHeldItem();
		}

		return result;
	}
}
