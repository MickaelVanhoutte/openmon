import type { BattleContext } from '../../context/battleContext';
import { PokemonInstance } from '../../pokemons/pokedex';
import { AbilityTrigger, type AbilityContext, type Ability } from './ability-types';
import { getAbility } from './ability-registry';
import { Message } from '../actions/actions-derived';

const SUPPRESSOR_ABILITIES = ['mold-breaker', 'teravolt', 'turboblaze'];

type HookName =
	| 'onSwitchIn'
	| 'onBeforeMove'
	| 'onAfterMove'
	| 'onModifyAtk'
	| 'onModifyDef'
	| 'onModifySpA'
	| 'onModifySpD'
	| 'onModifySpe'
	| 'onModifyDamage'
	| 'onSourceModifyDamage'
	| 'onTryHit'
	| 'onDamagingHit'
	| 'onTurnEnd'
	| 'onTurnStart'
	| 'onFaint'
	| 'onStatus'
	| 'onStatChange';

const TRIGGER_TO_HOOK: Record<AbilityTrigger, HookName> = {
	[AbilityTrigger.ON_SWITCH_IN]: 'onSwitchIn',
	[AbilityTrigger.ON_BEFORE_MOVE]: 'onBeforeMove',
	[AbilityTrigger.ON_AFTER_MOVE]: 'onAfterMove',
	[AbilityTrigger.ON_DAMAGE_CALC]: 'onModifyAtk',
	[AbilityTrigger.ON_CONTACT]: 'onDamagingHit',
	[AbilityTrigger.ON_TURN_END]: 'onTurnEnd',
	[AbilityTrigger.ON_TURN_START]: 'onTurnStart',
	[AbilityTrigger.ON_FAINT]: 'onFaint',
	[AbilityTrigger.ON_STATUS]: 'onStatus',
	[AbilityTrigger.ON_STAT_CHANGE]: 'onStatChange'
};

function toKebabCase(str: string): string {
	if (!str) {
		return '';
	}
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

export class AbilityEngine {
	runEvent<T>(
		eventName: AbilityTrigger,
		pokemon: PokemonInstance,
		ctx: BattleContext,
		target?: PokemonInstance,
		...args: unknown[]
	): T | undefined {
		if (!pokemon.currentAbility) {
			return undefined;
		}

		const ability = getAbility(pokemon.currentAbility);
		if (!ability) {
			return undefined;
		}

		if (this.isSuppressed(ability, target)) {
			return undefined;
		}

		const hookName = this.triggerToHook(eventName);
		const hook = ability[hookName];
		if (typeof hook !== 'function') {
			return undefined;
		}

		const abilityCtx: AbilityContext = {
			battleContext: ctx,
			pokemon,
			target
		};

		ctx.addToStack(new Message(`${pokemon.name}'s ${ability.name}!`, pokemon));

		return (hook as (ctx: AbilityContext, ...args: unknown[]) => T)(abilityCtx, ...args);
	}

	runEventForAll<T>(
		eventName: AbilityTrigger,
		pokemons: PokemonInstance[],
		ctx: BattleContext,
		target?: PokemonInstance,
		...args: unknown[]
	): Map<PokemonInstance, T | undefined> {
		const results = new Map<PokemonInstance, T | undefined>();
		const sorted = this.sortBySpeed(pokemons);

		for (const pokemon of sorted) {
			const result = this.runEvent<T>(eventName, pokemon, ctx, target, ...args);
			results.set(pokemon, result);
		}

		return results;
	}

	sortBySpeed(pokemons: PokemonInstance[]): PokemonInstance[] {
		return [...pokemons].sort((a, b) => b.battleStats.speed - a.battleStats.speed);
	}

	private triggerToHook(trigger: AbilityTrigger): HookName {
		return TRIGGER_TO_HOOK[trigger];
	}

	private isSuppressed(_ability: Ability, attacker?: PokemonInstance): boolean {
		if (!attacker?.currentAbility) {
			return false;
		}

		const attackerAbilityKey = toKebabCase(attacker.currentAbility);
		return SUPPRESSOR_ABILITIES.includes(attackerAbilityKey);
	}
}

export const ABILITY_ENGINE = new AbilityEngine();
