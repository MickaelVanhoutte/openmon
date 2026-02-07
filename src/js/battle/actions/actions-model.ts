import { Move, PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';

export enum ActionType {
	ATTACK = 'Attack',
	SWITCH = 'Switch-Order',
	ITEM = 'Item',
	RUN = 'Run',

	MESSAGE = 'Message',
	SWITCH_EFFECT = 'Switch-Effect',
	APPLY_EFFECT = 'Apply-Effect',
	REMOVE_HP = 'Remove-HP',
	COMBO_BOOST = 'Combo-Boost',
	XP_WIN = 'XP-Win',
	LEVEL_UP = 'Level-Up',
	PLAY_ANIMATION = 'Play-Animation',
	SLEEP = 'Sleep',
	STAT_CHANGE = 'Stat-Change',
	WEATHER_CHANGE = 'Weather-Change',

	END_CHECKS = 'End-Checks',
	END_BATTLE = 'End-Battle'
}

export interface ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;
	move?: Move;

	execute(ctx: BattleContext): void;
}

export type TargetSlot = { side: 'player' | 'opponent'; index: number };
