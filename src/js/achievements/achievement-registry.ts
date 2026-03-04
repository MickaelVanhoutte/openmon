import { AchievementCategory, type AchievementDefinition } from './achievement-definitions';

export const ACHIEVEMENTS: AchievementDefinition[] = [
	// =====================
	// === CAPTURE ===
	// =====================
	{
		id: 'pokemon_caught',
		name: 'Pokemon Collector',
		description: 'Catch {threshold} Pokemon total',
		category: AchievementCategory.CAPTURE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 5, label: 'Bronze', reward: { items: [{ itemId: 4, quantity: 5 }] } },
			{ tier: 2, threshold: 15, label: 'Silver', reward: { items: [{ itemId: 3, quantity: 8 }] } },
			{
				tier: 3, threshold: 30, label: 'Gold',
				reward: { items: [{ itemId: 2, quantity: 10 }], pokemon: [{ pokedexId: 50, level: 15 }] }
			},
			{
				tier: 4, threshold: 75, label: 'Platinum',
				reward: { items: [{ itemId: 1, quantity: 2 }, { itemId: 2, quantity: 15 }], pokemon: [{ pokedexId: 214, level: 30 }] }
			}
		],
		getProgress: (stats) => stats.totalCaught
	},
	{
		id: 'legendary_caught',
		name: 'Legend Hunter',
		description: 'Catch {threshold} legendary Pokemon',
		category: AchievementCategory.CAPTURE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 1, label: 'Bronze', reward: { items: [{ itemId: 2, quantity: 5 }] } },
			{
				tier: 2, threshold: 3, label: 'Silver',
				reward: { items: [{ itemId: 2, quantity: 10 }, { itemId: 4007, quantity: 1 }], masteryPoints: 1 }
			},
			{
				tier: 3, threshold: 5, label: 'Gold',
				reward: { items: [{ itemId: 1, quantity: 3 }, { itemId: 4025, quantity: 1 }], masteryPoints: 3 }
			}
		],
		getProgress: (stats) => stats.legendariesCaught
	},
	{
		id: 'shiny_caught',
		name: 'Shiny Hunter',
		description: 'Catch {threshold} shiny Pokemon',
		category: AchievementCategory.CAPTURE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 1, label: 'Bronze', reward: { items: [{ itemId: 2, quantity: 5 }, { itemId: 25, quantity: 3 }] } },
			{
				tier: 2, threshold: 3, label: 'Silver',
				reward: { items: [{ itemId: 1, quantity: 1 }, { itemId: 4022, quantity: 1 }] }
			},
			{
				tier: 3, threshold: 5, label: 'Gold',
				reward: { items: [{ itemId: 1, quantity: 3 }], pokemon: [{ pokedexId: 50, level: 30 }], masteryPoints: 3 }
			}
		],
		getProgress: (stats) => stats.shiniesCaught
	},

	// =====================
	// === BATTLE ===
	// =====================
	{
		id: 'wild_kos',
		name: 'Wild Warrior',
		description: 'Defeat {threshold} wild Pokemon',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 10, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 30, label: 'Silver', reward: { items: [{ itemId: 26, quantity: 5 }, { itemId: 4, quantity: 5 }] } },
			{
				tier: 3, threshold: 75, label: 'Gold',
				reward: { items: [{ itemId: 25, quantity: 8 }, { itemId: 3, quantity: 10 }] }
			},
			{
				tier: 4, threshold: 150, label: 'Platinum',
				reward: { items: [{ itemId: 24, quantity: 5 }, { itemId: 4005, quantity: 1 }], pokemon: [{ pokedexId: 141, level: 25 }] }
			}
		],
		getProgress: (stats) => stats.wildKOs
	},
	{
		id: 'trainers_beaten',
		name: 'Trainer Crusher',
		description: 'Defeat {threshold} trainers',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 5, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }, { itemId: 28, quantity: 1 }] } },
			{
				tier: 2, threshold: 15, label: 'Silver',
				reward: { items: [{ itemId: 25, quantity: 5 }, { itemId: 28, quantity: 3 }] }
			},
			{
				tier: 3, threshold: 30, label: 'Gold',
				reward: { items: [{ itemId: 24, quantity: 3 }, { itemId: 29, quantity: 2 }, { itemId: 4001, quantity: 1 }], masteryPoints: 1 }
			},
			{
				tier: 4, threshold: 50, label: 'Platinum',
				reward: { items: [{ itemId: 23, quantity: 5 }, { itemId: 4003, quantity: 1 }], pokemon: [{ pokedexId: 221, level: 30 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.trainersBeaten
	},
	{
		id: 'battles_won',
		name: 'Undefeated',
		description: 'Win {threshold} battles',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 10, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 50, label: 'Silver', reward: { items: [{ itemId: 25, quantity: 5 }, { itemId: 28, quantity: 3 }] } },
			{
				tier: 3, threshold: 100, label: 'Gold',
				reward: { items: [{ itemId: 23, quantity: 5 }, { itemId: 4006, quantity: 1 }], pokemon: [{ pokedexId: 224, level: 25 }] }
			}
		],
		getProgress: (stats) => stats.battlesWon
	},
	{
		id: 'critical_hits',
		name: 'Sniper',
		description: 'Land {threshold} critical hits',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 10, label: 'Bronze', reward: { items: [{ itemId: 26, quantity: 3 }] } },
			{ tier: 2, threshold: 50, label: 'Silver', reward: { items: [{ itemId: 25, quantity: 5 }, { itemId: 3, quantity: 5 }] } },
			{
				tier: 3, threshold: 150, label: 'Gold',
				reward: { items: [{ itemId: 4005, quantity: 1 }, { itemId: 24, quantity: 3 }], masteryPoints: 1 }
			}
		],
		getProgress: (stats) => stats.criticalHitsLanded
	},
	{
		id: 'super_effective',
		name: 'Type Master',
		description: 'Land {threshold} super effective hits',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 20, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 75, label: 'Silver', reward: { items: [{ itemId: 26, quantity: 8 }, { itemId: 3, quantity: 5 }] } },
			{
				tier: 3, threshold: 200, label: 'Gold',
				reward: { items: [{ itemId: 4001, quantity: 1 }, { itemId: 29, quantity: 2 }], masteryPoints: 1 }
			}
		],
		getProgress: (stats) => stats.superEffectiveHits
	},
	{
		id: 'combos_used',
		name: 'Combo King',
		description: 'Use {threshold} combo moves',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 5, label: 'Bronze', reward: { items: [{ itemId: 26, quantity: 5 }] } },
			{ tier: 2, threshold: 20, label: 'Silver', reward: { items: [{ itemId: 25, quantity: 5 }, { itemId: 2, quantity: 5 }] } },
			{
				tier: 3, threshold: 50, label: 'Gold',
				reward: { items: [{ itemId: 4002, quantity: 1 }], pokemon: [{ pokedexId: 141, level: 30 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.combosUsed
	},
	{
		id: 'bosses_defeated',
		name: 'Boss Slayer',
		description: 'Defeat {threshold} dungeon bosses',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 1, label: 'Bronze', reward: { items: [{ itemId: 25, quantity: 3 }, { itemId: 28, quantity: 2 }] } },
			{ tier: 2, threshold: 5, label: 'Silver', reward: { items: [{ itemId: 24, quantity: 3 }, { itemId: 2, quantity: 5 }] } },
			{
				tier: 3, threshold: 10, label: 'Gold',
				reward: { items: [{ itemId: 1, quantity: 1 }, { itemId: 29, quantity: 3 }, { itemId: 4007, quantity: 1 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.bossesDefeated
	},
	{
		id: 'total_damage',
		name: 'Damage Dealer',
		description: 'Deal {threshold} total damage',
		category: AchievementCategory.BATTLE,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 1000, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 10000, label: 'Silver', reward: { items: [{ itemId: 25, quantity: 5 }, { itemId: 4, quantity: 10 }] } },
			{
				tier: 3, threshold: 50000, label: 'Gold',
				reward: { items: [{ itemId: 4004, quantity: 1 }, { itemId: 23, quantity: 3 }], masteryPoints: 1 }
			},
			{
				tier: 4, threshold: 200000, label: 'Platinum',
				reward: { items: [{ itemId: 4001, quantity: 1 }, { itemId: 4002, quantity: 1 }], pokemon: [{ pokedexId: 208, level: 35 }], masteryPoints: 3 }
			}
		],
		getProgress: (stats) => stats.totalDamageDealt
	},

	// =====================
	// === PROGRESSION ===
	// =====================
	{
		id: 'highest_level',
		name: 'Power Trainer',
		description: 'Raise a Pokemon to level {threshold}',
		category: AchievementCategory.PROGRESSION,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 20, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 40, label: 'Silver', reward: { items: [{ itemId: 26, quantity: 5 }, { itemId: 4022, quantity: 1 }] } },
			{
				tier: 3, threshold: 60, label: 'Gold',
				reward: { items: [{ itemId: 25, quantity: 8 }], pokemon: [{ pokedexId: 154, level: 20 }], masteryPoints: 1 }
			},
			{
				tier: 4, threshold: 80, label: 'Platinum',
				reward: { items: [{ itemId: 24, quantity: 5 }, { itemId: 4004, quantity: 1 }], masteryPoints: 2 }
			},
			{
				tier: 5, threshold: 100, label: 'Diamond',
				reward: { items: [{ itemId: 1, quantity: 3 }, { itemId: 4006, quantity: 1 }], pokemon: [{ pokedexId: 208, level: 40 }], masteryPoints: 5 }
			}
		],
		getProgress: (stats) => stats.highestLevel
	},
	{
		id: 'evolutions',
		name: 'Evolutionary Expert',
		description: 'Trigger {threshold} evolutions',
		category: AchievementCategory.PROGRESSION,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 1, label: 'Bronze', reward: { items: [{ itemId: 28, quantity: 2 }] } },
			{ tier: 2, threshold: 5, label: 'Silver', reward: { items: [{ itemId: 28, quantity: 5 }, { itemId: 3, quantity: 5 }] } },
			{
				tier: 3, threshold: 15, label: 'Gold',
				reward: { items: [{ itemId: 29, quantity: 3 }, { itemId: 4007, quantity: 1 }], pokemon: [{ pokedexId: 50, level: 25 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.evolutionsTriggered
	},
	{
		id: 'total_levelups',
		name: 'Grind Master',
		description: 'Level up Pokemon {threshold} times total',
		category: AchievementCategory.PROGRESSION,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 10, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 50, label: 'Silver', reward: { items: [{ itemId: 26, quantity: 8 }, { itemId: 28, quantity: 3 }] } },
			{
				tier: 3, threshold: 150, label: 'Gold',
				reward: { items: [{ itemId: 24, quantity: 5 }, { itemId: 4022, quantity: 1 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.totalLevelUps
	},
	{
		id: 'full_team',
		name: 'Squad Goals',
		description: 'Have {threshold} Pokemon in your team',
		category: AchievementCategory.PROGRESSION,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 3, label: 'Bronze', reward: { items: [{ itemId: 4, quantity: 5 }, { itemId: 17, quantity: 3 }] } },
			{
				tier: 2, threshold: 6, label: 'Gold',
				reward: { items: [{ itemId: 3, quantity: 10 }, { itemId: 25, quantity: 5 }], pokemon: [{ pokedexId: 4, level: 15 }] }
			}
		],
		getProgress: (_stats, ctx) => ctx?.player.monsters.length ?? 0
	},

	// =====================
	// === ECONOMY ===
	// =====================
	{
		id: 'money_earned',
		name: 'Rich Trainer',
		description: 'Earn {threshold}$ total',
		category: AchievementCategory.ECONOMY,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 5000, label: 'Bronze', reward: { items: [{ itemId: 4, quantity: 5 }] } },
			{ tier: 2, threshold: 20000, label: 'Silver', reward: { items: [{ itemId: 3, quantity: 8 }, { itemId: 26, quantity: 5 }] } },
			{
				tier: 3, threshold: 50000, label: 'Gold',
				reward: { items: [{ itemId: 2, quantity: 10 }, { itemId: 4002, quantity: 1 }], masteryPoints: 1 }
			},
			{
				tier: 4, threshold: 100000, label: 'Platinum',
				reward: { items: [{ itemId: 1, quantity: 2 }, { itemId: 4004, quantity: 1 }], pokemon: [{ pokedexId: 4, level: 20 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.totalMoneyEarned
	},
	{
		id: 'items_used',
		name: 'Pharmacist',
		description: 'Use {threshold} items',
		category: AchievementCategory.ECONOMY,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 10, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 30, label: 'Silver', reward: { items: [{ itemId: 26, quantity: 5 }, { itemId: 28, quantity: 3 }] } },
			{
				tier: 3, threshold: 60, label: 'Gold',
				reward: { items: [{ itemId: 23, quantity: 5 }, { itemId: 29, quantity: 3 }, { itemId: 4006, quantity: 1 }] }
			}
		],
		getProgress: (stats) => stats.itemsUsed
	},

	// =====================
	// === EXPLORATION ===
	// =====================
	{
		id: 'dungeon_floors',
		name: 'Dungeon Crawler',
		description: 'Clear {threshold} dungeon floors',
		category: AchievementCategory.EXPLORATION,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 5, label: 'Bronze', reward: { items: [{ itemId: 17, quantity: 5 }, { itemId: 28, quantity: 1 }] } },
			{ tier: 2, threshold: 15, label: 'Silver', reward: { items: [{ itemId: 25, quantity: 5 }, { itemId: 28, quantity: 3 }] } },
			{
				tier: 3, threshold: 30, label: 'Gold',
				reward: { items: [{ itemId: 24, quantity: 5 }, { itemId: 29, quantity: 3 }], pokemon: [{ pokedexId: 214, level: 25 }] }
			},
			{
				tier: 4, threshold: 50, label: 'Platinum',
				reward: { items: [{ itemId: 23, quantity: 10 }, { itemId: 1, quantity: 2 }, { itemId: 4025, quantity: 1 }], masteryPoints: 3 }
			}
		],
		getProgress: (stats) => stats.dungeonFloorsCleared
	},
	{
		id: 'biomes_explored',
		name: 'World Explorer',
		description: 'Reach biome {threshold}',
		category: AchievementCategory.EXPLORATION,
		icon: '/src/assets/menus/pokeball.png',
		tiers: [
			{ tier: 1, threshold: 2, label: 'Bronze', reward: { items: [{ itemId: 4, quantity: 10 }, { itemId: 17, quantity: 5 }] } },
			{ tier: 2, threshold: 3, label: 'Silver', reward: { items: [{ itemId: 3, quantity: 10 }, { itemId: 25, quantity: 5 }] } },
			{
				tier: 3, threshold: 4, label: 'Gold',
				reward: { items: [{ itemId: 2, quantity: 10 }, { itemId: 29, quantity: 2 }], masteryPoints: 1 }
			},
			{
				tier: 4, threshold: 5, label: 'Platinum',
				reward: { items: [{ itemId: 1, quantity: 2 }, { itemId: 4003, quantity: 1 }], pokemon: [{ pokedexId: 224, level: 30 }], masteryPoints: 2 }
			}
		],
		getProgress: (stats) => stats.biomesVisited
	},

	// =====================
	// === COLLECTION ===
	// =====================
	{
		id: 'unique_pokemon',
		name: "Gotta Catch 'Em All",
		description: 'Register {threshold} unique Pokemon in your Pokedex',
		category: AchievementCategory.COLLECTION,
		icon: '/src/assets/menus/pokedex.png',
		tiers: [
			{ tier: 1, threshold: 10, label: 'Bronze', reward: { items: [{ itemId: 4, quantity: 5 }, { itemId: 3, quantity: 3 }] } },
			{ tier: 2, threshold: 30, label: 'Silver', reward: { items: [{ itemId: 3, quantity: 10 }, { itemId: 2, quantity: 3 }] } },
			{
				tier: 3, threshold: 60, label: 'Gold',
				reward: { items: [{ itemId: 2, quantity: 10 }, { itemId: 4022, quantity: 1 }], masteryPoints: 1 }
			},
			{
				tier: 4, threshold: 100, label: 'Platinum',
				reward: { items: [{ itemId: 1, quantity: 3 }, { itemId: 4004, quantity: 1 }], masteryPoints: 3 }
			}
		],
		getProgress: (_stats, ctx) => ctx?.POKEDEX.getCaught()?.length ?? 0
	},
	{
		id: 'pokedex_viewed',
		name: 'Pokemon Researcher',
		description: 'View {threshold} Pokemon in the Pokedex',
		category: AchievementCategory.COLLECTION,
		icon: '/src/assets/menus/pokedex.png',
		tiers: [
			{ tier: 1, threshold: 20, label: 'Bronze', reward: { items: [{ itemId: 4, quantity: 5 }] } },
			{ tier: 2, threshold: 50, label: 'Silver', reward: { items: [{ itemId: 3, quantity: 8 }, { itemId: 4, quantity: 10 }] } },
			{
				tier: 3, threshold: 100, label: 'Gold',
				reward: { items: [{ itemId: 2, quantity: 10 }, { itemId: 1, quantity: 1 }], pokemon: [{ pokedexId: 154, level: 15 }], masteryPoints: 2 }
			}
		],
		getProgress: (_stats, ctx) => ctx?.POKEDEX.getViewed()?.length ?? 0
	}
];
