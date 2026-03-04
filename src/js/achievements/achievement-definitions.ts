import type { PlayerStats } from './player-stats';
import type { GameContext } from '../context/gameContext';

export enum AchievementCategory {
	CAPTURE = 'capture',
	BATTLE = 'battle',
	PROGRESSION = 'progression',
	ECONOMY = 'economy',
	EXPLORATION = 'exploration',
	COLLECTION = 'collection'
}

export interface AchievementReward {
	money?: number;
	items?: { itemId: number; quantity: number }[];
	masteryPoints?: number;
	pokemon?: { pokedexId: number; level: number }[];
}

export interface AchievementTier {
	tier: number;
	threshold: number;
	reward: AchievementReward;
	label: string;
}

export interface AchievementDefinition {
	id: string;
	name: string;
	description: string;
	category: AchievementCategory;
	icon: string;
	tiers: AchievementTier[];
	getProgress: (stats: PlayerStats, ctx?: GameContext) => number;
}
