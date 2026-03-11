/**
 * Perk System — Conditional/triggered effects unlocked via class-specific talent trees.
 * Unlike mastery bonuses (flat numeric bonuses), perks activate on specific battle events.
 */

export enum PerkTrigger {
	PASSIVE = 'passive',
	ON_CRIT = 'onCrit',
	ON_KO = 'onKo',
	ON_BATTLE_START = 'onBattleStart',
	ON_BATTLE_END = 'onBattleEnd',
	ON_LOW_HP = 'onLowHp',
	ON_TURN_END = 'onTurnEnd',
	ON_SWITCH_IN = 'onSwitchIn',
	ON_CATCH_ATTEMPT = 'onCatchAttempt',
	ON_XP_GAIN = 'onXpGain',
	ON_STATUS_INFLICTED = 'onStatusInflicted',
	ON_DAMAGE_DEALT = 'onDamageDealt',
	ON_FIRST_HIT = 'onFirstHit',
	ON_DUNGEON_ENTER = 'onDungeonEnter'
}

export interface PerkDefinition {
	id: string;
	name: string;
	description: string;
	trigger: PerkTrigger;
	classId: string;
	tier: 'expert' | 'capstone';
	params: Record<string, number | string | boolean>;
}

export interface ActivePerk {
	definition: PerkDefinition;
	/** Runtime state for perks that track something (e.g., fury buff active, second wind used) */
	state: Record<string, number | boolean>;
}

// ─── Berserker Perks ────────────────────────────────────────────────────────

const BERSERKER_PERKS: PerkDefinition[] = [
	{
		id: 'brs-fury',
		name: 'Fury',
		description: 'After landing a critical hit, your next attack deals +15% damage.',
		trigger: PerkTrigger.ON_CRIT,
		classId: 'berserker',
		tier: 'expert',
		params: { damageBonus: 15 }
	},
	{
		id: 'brs-reckless',
		name: 'Reckless',
		description: '+20% damage dealt, but +10% damage taken.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'berserker',
		tier: 'expert',
		params: { damageDealtBonus: 20, damageTakenPenalty: 10 }
	},
	{
		id: 'brs-overkill',
		name: 'Overkill',
		description: 'Excess KO damage is converted into combo gauge fill.',
		trigger: PerkTrigger.ON_KO,
		classId: 'berserker',
		tier: 'expert',
		params: { conversionRate: 20 }
	},
	{
		id: 'brs-bloodlust',
		name: 'Bloodlust',
		description: '+10% critical hit chance for 2 turns after knocking out a Pokemon.',
		trigger: PerkTrigger.ON_KO,
		classId: 'berserker',
		tier: 'expert',
		params: { critBonus: 10, duration: 2 }
	},
	{
		id: 'brs-berserk',
		name: 'Berserk Rage',
		description: 'When your Pokemon drops below 30% HP, it deals +25% damage.',
		trigger: PerkTrigger.ON_LOW_HP,
		classId: 'berserker',
		tier: 'expert',
		params: { hpThreshold: 30, damageBonus: 25 }
	},
	{
		id: 'brs-unstoppable',
		name: 'Unstoppable',
		description: 'Critical hits ignore resistance bonuses and defensive stat changes.',
		trigger: PerkTrigger.ON_CRIT,
		classId: 'berserker',
		tier: 'capstone',
		params: {}
	}
];

// ─── Medic Perks ────────────────────────────────────────────────────────────

const MEDIC_PERKS: PerkDefinition[] = [
	{
		id: 'med-triage',
		name: 'Triage',
		description: 'Pokemon below 25% HP receive double healing from all sources.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'medic',
		tier: 'expert',
		params: { hpThreshold: 25, healMultiplier: 2 }
	},
	{
		id: 'med-regen',
		name: 'Regeneration',
		description: 'Your active Pokemon heals 3% of max HP at the end of each turn.',
		trigger: PerkTrigger.ON_TURN_END,
		classId: 'medic',
		tier: 'expert',
		params: { healPercent: 3 }
	},
	{
		id: 'med-secondwind',
		name: 'Second Wind',
		description: 'Once per dungeon, auto-revive a fainted Pokemon at 25% HP when switching.',
		trigger: PerkTrigger.ON_SWITCH_IN,
		classId: 'medic',
		tier: 'expert',
		params: { revivePercent: 25 }
	},
	{
		id: 'med-cleanse',
		name: 'Cleanse',
		description: '15% chance to cure status conditions at the end of each turn.',
		trigger: PerkTrigger.ON_TURN_END,
		classId: 'medic',
		tier: 'expert',
		params: { cureChance: 15 }
	},
	{
		id: 'med-overheal',
		name: 'Overheal',
		description: 'Healing beyond max HP grants a temporary shield (up to 10% max HP).',
		trigger: PerkTrigger.PASSIVE,
		classId: 'medic',
		tier: 'expert',
		params: { shieldMaxPercent: 10 }
	},
	{
		id: 'med-miracle',
		name: 'Miracle',
		description: 'Once per battle, a Pokemon survives a fatal hit with 1 HP.',
		trigger: PerkTrigger.ON_LOW_HP,
		classId: 'medic',
		tier: 'capstone',
		params: {}
	}
];

// ─── Guardian Perks ─────────────────────────────────────────────────────────

const GUARDIAN_PERKS: PerkDefinition[] = [
	{
		id: 'grd-ironwall',
		name: 'Iron Wall',
		description: 'The first hit taken in battle deals 30% less damage.',
		trigger: PerkTrigger.ON_FIRST_HIT,
		classId: 'guardian',
		tier: 'expert',
		params: { damageReduction: 30 }
	},
	{
		id: 'grd-laststand',
		name: 'Last Stand',
		description: 'When your Pokemon drops below 20% HP, Def and SpDef increase by 50%.',
		trigger: PerkTrigger.ON_LOW_HP,
		classId: 'guardian',
		tier: 'expert',
		params: { hpThreshold: 20, defBoost: 50 }
	},
	{
		id: 'grd-teamshield',
		name: 'Team Shield',
		description: 'Entry hazard damage is reduced by 50% when switching Pokemon.',
		trigger: PerkTrigger.ON_SWITCH_IN,
		classId: 'guardian',
		tier: 'expert',
		params: { hazardReduction: 50 }
	},
	{
		id: 'grd-fortify',
		name: 'Fortify',
		description: '+1 Defense stage at the start of each battle.',
		trigger: PerkTrigger.ON_BATTLE_START,
		classId: 'guardian',
		tier: 'expert',
		params: { defStages: 1 }
	},
	{
		id: 'grd-absorb',
		name: 'Absorb Impact',
		description: 'Super-effective hits deal 10% less damage.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'guardian',
		tier: 'expert',
		params: { seReduction: 10 }
	},
	{
		id: 'grd-unbreakable',
		name: 'Unbreakable',
		description: 'Your Pokemon cannot be one-shot from full HP (survives with 1 HP).',
		trigger: PerkTrigger.ON_LOW_HP,
		classId: 'guardian',
		tier: 'capstone',
		params: {}
	}
];

// ─── Explorer Perks ─────────────────────────────────────────────────────────

const EXPLORER_PERKS: PerkDefinition[] = [
	{
		id: 'exp-scout',
		name: "Scout's Eye",
		description: 'See wild Pokemon type indicators before battle starts.',
		trigger: PerkTrigger.ON_BATTLE_START,
		classId: 'explorer',
		tier: 'expert',
		params: {}
	},
	{
		id: 'exp-lucky',
		name: 'Lucky Find',
		description: '10% chance to find a bonus item after winning a wild battle.',
		trigger: PerkTrigger.ON_BATTLE_END,
		classId: 'explorer',
		tier: 'expert',
		params: { dropChance: 10 }
	},
	{
		id: 'exp-escape',
		name: 'Quick Escape',
		description: 'You can always flee from wild battles (100% escape rate).',
		trigger: PerkTrigger.PASSIVE,
		classId: 'explorer',
		tier: 'expert',
		params: {}
	},
	{
		id: 'exp-tracker',
		name: 'Tracker',
		description: 'Shiny rate is doubled for Pokemon already registered in your Pokedex.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'explorer',
		tier: 'expert',
		params: { shinyMultiplier: 2 }
	},
	{
		id: 'exp-wanderer',
		name: 'Wanderer',
		description: '+15% XP gained in unexplored dungeon floors.',
		trigger: PerkTrigger.ON_XP_GAIN,
		classId: 'explorer',
		tier: 'expert',
		params: { xpBonus: 15 }
	},
	{
		id: 'exp-fortune',
		name: 'Fortune',
		description: 'Shiny rate tripled. Item drops guaranteed after boss fights.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'explorer',
		tier: 'capstone',
		params: { shinyMultiplier: 3 }
	}
];

// ─── Weather Master Perks ───────────────────────────────────────────────────

const WEATHER_MASTER_PERKS: PerkDefinition[] = [
	{
		id: 'wtm-stormsurge',
		name: 'Storm Surge',
		description: 'Weather matching your lead Pokemon type auto-activates for 3 turns at battle start.',
		trigger: PerkTrigger.ON_BATTLE_START,
		classId: 'weather-master',
		tier: 'expert',
		params: { duration: 3 }
	},
	{
		id: 'wtm-adapt',
		name: 'Adaptation',
		description: 'Your Pokemon take no weather chip damage (sandstorm/hail).',
		trigger: PerkTrigger.PASSIVE,
		classId: 'weather-master',
		tier: 'expert',
		params: {}
	},
	{
		id: 'wtm-tempest',
		name: 'Tempest',
		description: 'Weather chip damage to opponents is doubled.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'weather-master',
		tier: 'expert',
		params: { damageMultiplier: 2 }
	},
	{
		id: 'wtm-forecast',
		name: 'Forecast',
		description: 'Weather-boosted moves get an additional +10% damage.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'weather-master',
		tier: 'expert',
		params: { bonusDamage: 10 }
	},
	{
		id: 'wtm-climatecontrol',
		name: 'Climate Control',
		description: 'Opponent cannot change weather for 2 turns after you set it.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'weather-master',
		tier: 'expert',
		params: { lockTurns: 2 }
	},
	{
		id: 'wtm-cataclysm',
		name: 'Cataclysm',
		description: 'Weather auto-activates at battle start and lasts +3 extra turns.',
		trigger: PerkTrigger.ON_BATTLE_START,
		classId: 'weather-master',
		tier: 'capstone',
		params: { extraTurns: 3 }
	}
];

// ─── Strategist Perks ───────────────────────────────────────────────────────

const STRATEGIST_PERKS: PerkDefinition[] = [
	{
		id: 'str-mindgames',
		name: 'Mind Games',
		description: 'Status effects you inflict last 1 extra turn.',
		trigger: PerkTrigger.ON_STATUS_INFLICTED,
		classId: 'strategist',
		tier: 'expert',
		params: { extraTurns: 1 }
	},
	{
		id: 'str-chain',
		name: 'Chain Reaction',
		description: '20% chance that DoT damage also lowers the target speed by 1 stage.',
		trigger: PerkTrigger.ON_TURN_END,
		classId: 'strategist',
		tier: 'expert',
		params: { procChance: 20 }
	},
	{
		id: 'str-calculated',
		name: 'Calculated',
		description: 'Combo gauge does not decay between battles.',
		trigger: PerkTrigger.ON_BATTLE_END,
		classId: 'strategist',
		tier: 'expert',
		params: {}
	},
	{
		id: 'str-exploit',
		name: 'Exploit Weakness',
		description: 'Attacks against Pokemon with a status condition deal +10% damage.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'strategist',
		tier: 'expert',
		params: { damageBonus: 10 }
	},
	{
		id: 'str-setup',
		name: 'Setup',
		description: 'Start each battle with 15 combo gauge.',
		trigger: PerkTrigger.ON_BATTLE_START,
		classId: 'strategist',
		tier: 'expert',
		params: { startingCombo: 15 }
	},
	{
		id: 'str-mastermind',
		name: 'Mastermind',
		description: 'All status effect chances doubled. Combo moves deal +25% damage.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'strategist',
		tier: 'capstone',
		params: { statusChanceMultiplier: 2, comboDamageBonus: 25 }
	}
];

// ─── Breeder Perks ──────────────────────────────────────────────────────────

const BREEDER_PERKS: PerkDefinition[] = [
	{
		id: 'brd-prodigy',
		name: 'Prodigy',
		description: 'Pokemon gain 2x EVs from their first 5 battles after being caught.',
		trigger: PerkTrigger.ON_BATTLE_END,
		classId: 'breeder',
		tier: 'expert',
		params: { evMultiplier: 2, battleLimit: 5 }
	},
	{
		id: 'brd-affinity',
		name: 'Affinity',
		description: 'Catch rate +50% for Pokemon sharing a type with your lead.',
		trigger: PerkTrigger.ON_CATCH_ATTEMPT,
		classId: 'breeder',
		tier: 'expert',
		params: { catchBonus: 50 }
	},
	{
		id: 'brd-growth',
		name: 'Growth Spurt',
		description: 'Pokemon under level 20 gain 2x XP.',
		trigger: PerkTrigger.ON_XP_GAIN,
		classId: 'breeder',
		tier: 'expert',
		params: { levelThreshold: 20, xpMultiplier: 2 }
	},
	{
		id: 'brd-nurture',
		name: 'Nurture',
		description: 'After winning, benched party members gain 25% of battle XP.',
		trigger: PerkTrigger.ON_BATTLE_END,
		classId: 'breeder',
		tier: 'expert',
		params: { benchXpPercent: 25 }
	},
	{
		id: 'brd-bonding',
		name: 'Bonding',
		description: 'Lead Pokemon always gains full XP even when swapped out mid-battle.',
		trigger: PerkTrigger.ON_XP_GAIN,
		classId: 'breeder',
		tier: 'expert',
		params: {}
	},
	{
		id: 'brd-masterbreeder',
		name: 'Master Breeder',
		description: 'All caught Pokemon start with 3 perfect IVs. EV gain tripled.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'breeder',
		tier: 'capstone',
		params: { perfectIVs: 3, evMultiplier: 3 }
	}
];

// ─── Ace Trainer Perks ──────────────────────────────────────────────────────

const ACE_TRAINER_PERKS: PerkDefinition[] = [
	{
		id: 'ace-versatile',
		name: 'Versatile',
		description: 'Non-STAB moves get 50% of the STAB bonus.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'ace-trainer',
		tier: 'expert',
		params: { stabShare: 50 }
	},
	{
		id: 'ace-quickstudy',
		name: 'Quick Study',
		description: 'Super-effective attacks gain +1% permanent damage per type matchup (caps at +10%).',
		trigger: PerkTrigger.ON_DAMAGE_DEALT,
		classId: 'ace-trainer',
		tier: 'expert',
		params: { bonusPerMatchup: 1, maxBonus: 10 }
	},
	{
		id: 'ace-momentum',
		name: 'Momentum',
		description: 'Each consecutive win in a dungeon gives +3% XP. Resets on loss.',
		trigger: PerkTrigger.ON_BATTLE_END,
		classId: 'ace-trainer',
		tier: 'expert',
		params: { xpPerWin: 3 }
	},
	{
		id: 'ace-adaptive',
		name: 'Adaptive',
		description: 'Pokemon switched in get +1 Speed stage.',
		trigger: PerkTrigger.ON_SWITCH_IN,
		classId: 'ace-trainer',
		tier: 'expert',
		params: { speedStages: 1 }
	},
	{
		id: 'ace-focus',
		name: 'Focus',
		description: 'Moves with 80-95% accuracy become 100% accurate.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'ace-trainer',
		tier: 'expert',
		params: { accuracyFloor: 80, accuracyCeiling: 95 }
	},
	{
		id: 'ace-grandmaster',
		name: 'Grand Master',
		description: 'All mastery stat bonuses increased by 50%.',
		trigger: PerkTrigger.PASSIVE,
		classId: 'ace-trainer',
		tier: 'capstone',
		params: { bonusMultiplier: 50 }
	}
];

// ─── All Perks Registry ─────────────────────────────────────────────────────

export const ALL_PERKS: PerkDefinition[] = [
	...BERSERKER_PERKS,
	...MEDIC_PERKS,
	...GUARDIAN_PERKS,
	...EXPLORER_PERKS,
	...WEATHER_MASTER_PERKS,
	...STRATEGIST_PERKS,
	...BREEDER_PERKS,
	...ACE_TRAINER_PERKS
];

export const PERKS_BY_CLASS: Record<string, PerkDefinition[]> = {
	berserker: BERSERKER_PERKS,
	medic: MEDIC_PERKS,
	guardian: GUARDIAN_PERKS,
	explorer: EXPLORER_PERKS,
	'weather-master': WEATHER_MASTER_PERKS,
	strategist: STRATEGIST_PERKS,
	breeder: BREEDER_PERKS,
	'ace-trainer': ACE_TRAINER_PERKS
};

export function getPerkDefinition(perkId: string): PerkDefinition | undefined {
	return ALL_PERKS.find((p) => p.id === perkId);
}

export function getClassPerks(classId: string): PerkDefinition[] {
	return PERKS_BY_CLASS[classId] || [];
}

export function hasPerk(activePerks: ActivePerk[], perkId: string): boolean {
	return activePerks.some((p) => p.definition.id === perkId);
}

export function getPerkState(activePerks: ActivePerk[], perkId: string): Record<string, number | boolean> | undefined {
	return activePerks.find((p) => p.definition.id === perkId)?.state;
}
