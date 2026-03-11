import { EXPERIENCE_CHART } from '../pokemons/experience';
import { type ActivePerk, getPerkDefinition } from './perks';

export class Mastery {
	q: number;
	r: number;
	cost: number;
	title: string;
	description: string;
	color: string;
	set: boolean;
	first: boolean;
	settable: boolean;
	type: MasteryType;
	value: number;
	group: MasteryGroup;
	/** For PERK-type nodes, the perk ID this node unlocks */
	perkId?: string;
	/** Column label for tree display (e.g. "Fury", "Power") */
	column: string;

	constructor(
		q: number,
		r: number,
		cost: number,
		title: string,
		description: string,
		color: string,
		set: boolean,
		first: boolean,
		settable: boolean,
		type: MasteryType,
		value: number,
		group: MasteryGroup,
		perkId?: string,
		column?: string
	) {
		this.q = q;
		this.r = r;
		this.cost = cost;
		this.title = title;
		this.description = description;
		this.color = color;
		this.set = set;
		this.first = first;
		this.settable = settable;
		this.type = type;
		this.value = value;
		this.group = group;
		this.perkId = perkId;
		this.column = column ?? '';
	}
}

export enum MasteryType {
	START = 'start',
	CATCH = 'catch',
	XP = 'xp',
	EV = 'ev',
	SHINY = 'shiny',
	CRITICAL = 'critical',
	STAB = 'stab',
	NON_STAB = 'nonStab',
	ACCURACY = 'accuracy',
	EFFECTIVENESS = 'effectiveness',
	RESISTANCE = 'resistance',
	COMBO_JAUGE = 'comboJauge',
	COMBO_DAMAGE = 'comboDamage',
	HEAL = 'heal',
	AUTO_HEAL = 'autoHeal',
	DOT_CHANCE = 'dotChance',
	DOT_DAMAGE = 'dotDamage',
	WEATHER_SUN = 'wSun',
	WEATHER_RAIN = 'wRain',
	WEATHER_SAND = 'wSand',
	WEATHER_HAIL = 'wHail',
	WEATHER_TURN_ALLY = 'wTurnAlly',
	WEATHER_TURN_OPPONENT = 'wTurnOpp',
	CONFUSE = 'confuse',
	ATTRACT = 'attract',
	PERK = 'perk'
}

export enum MasteryGroup {
	NOVICE = 'novice',
	EXPERT = 'expert'
}

export enum ClassRank {
	APPRENTICE = 1,
	ADEPT = 2,
	EXPERT = 3,
	MASTER = 4,
	GRANDMASTER = 5
}

export const CLASS_RANK_THRESHOLDS: Record<ClassRank, number> = {
	[ClassRank.APPRENTICE]: 1,
	[ClassRank.ADEPT]: 10,
	[ClassRank.EXPERT]: 25,
	[ClassRank.MASTER]: 40,
	[ClassRank.GRANDMASTER]: 50
};

export const CLASS_RANK_LABELS: Record<ClassRank, string> = {
	[ClassRank.APPRENTICE]: 'Apprentice',
	[ClassRank.ADEPT]: 'Adept',
	[ClassRank.EXPERT]: 'Expert',
	[ClassRank.MASTER]: 'Master',
	[ClassRank.GRANDMASTER]: 'Grandmaster'
};

export class MasteriesBonuses {
	[key: string]: any;
	catch: number = 0;
	xp: number = 0;
	ev: number = 0;
	shiny: number = 0;
	critical: number = 0;
	stab: number = 0;
	nonStab: number = 0;
	accuracy: number = 0;
	effectiveness: number = 0;
	resistance: number = 0;
	comboJauge: number = 0;
	comboDamage: number = 0;
	heal: number = 0;
	autoHeal: number = 0;
	dotChance: number = 0;
	dotDamage: number = 0;
	wSun: number = 0;
	wRain: number = 0;
	wSand: number = 0;
	wHail: number = 0;
	wTurnAlly: number = 0;
	wTurnOpp: number = 0;
	confuse: number = 0;
	attract: number = 0;

	constructor(data?: Partial<MasteriesBonuses>) {
		if (data) {
			this.catch = data.catch ?? 0;
			this.xp = data.xp ?? 0;
			this.ev = data.ev ?? 0;
			this.shiny = data.shiny ?? 0;
			this.critical = data.critical ?? 0;
			this.stab = data.stab ?? 0;
			this.nonStab = data.nonStab ?? 0;
			this.accuracy = data.accuracy ?? 0;
			this.effectiveness = data.effectiveness ?? 0;
			this.resistance = data.resistance ?? 0;
			this.comboJauge = data.comboJauge ?? 0;
			this.comboDamage = data.comboDamage ?? 0;
			this.heal = data.heal ?? 0;
			this.autoHeal = data.autoHeal ?? 0;
			this.dotChance = data.dotChance ?? 0;
			this.dotDamage = data.dotDamage ?? 0;
			this.wSun = data.wSun ?? 0;
			this.wRain = data.wRain ?? 0;
			this.wSand = data.wSand ?? 0;
			this.wHail = data.wHail ?? 0;
			this.wTurnAlly = data.wTurnAlly ?? 0;
			this.wTurnOpp = data.wTurnOpp ?? 0;
			this.confuse = data.confuse ?? 0;
			this.attract = data.attract ?? 0;
		}
	}

	public enableMastery(type: MasteryType, value: number) {
		if (type === MasteryType.PERK || type === MasteryType.START) return;
		this[type] += value;
	}

	public getMastery(type: MasteryType): number {
		if (type === MasteryType.PERK || type === MasteryType.START) return 0;
		return this[type] ?? 0;
	}
}

export interface MasteryNodeData {
	q: number;
	r: number;
	cost: number;
	title: string;
	description?: string;
	color: string;
	set: boolean;
	first: boolean;
	settable: boolean;
	type: string;
	value: number;
	group: string;
	perkId?: string;
	column?: string;
}

function parseMasteryData(data: MasteryNodeData[]): Mastery[] {
	return data.map(
		(m) =>
			new Mastery(
				m.q,
				m.r,
				m.cost,
				m.title,
				m.description || '',
				m.color,
				m.set,
				m.first,
				m.settable,
				m.type as MasteryType,
				m.value,
				m.group as MasteryGroup,
				m.perkId,
				m.column
			)
	);
}

/** Registry of class-specific tree data, populated by trainer-class.ts */
const classTreeRegistry: Record<string, { novice: MasteryNodeData[]; expert: MasteryNodeData[] }> = {};

export function registerClassTrees(
	classId: string,
	novice: MasteryNodeData[],
	expert: MasteryNodeData[]
): void {
	classTreeRegistry[classId] = { novice, expert };
}

export function getRegisteredClassTrees(classId: string) {
	return classTreeRegistry[classId];
}

export class PlayerMasteries {
	novice: Mastery[] = [];
	expert: Mastery[] = [];
	bonuses: MasteriesBonuses = new MasteriesBonuses();
	activePerks: ActivePerk[] = [];
	classId: string = 'ace-trainer';
	classRank: ClassRank = ClassRank.APPRENTICE;

	level: number = 1;
	points: number = 20;
	exp: number = 0;
	xpToNextLevel: number = 0;

	/** Accumulated bonus points from milestones (tracked to avoid double-granting on reload) */
	lastMilestoneLevel: number = 0;

	constructor(classId: string = 'ace-trainer') {
		this.classId = classId;
		this.loadClassTrees(classId);
		this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, 1) * 2;
	}

	loadClassTrees(classId: string): void {
		const trees = getRegisteredClassTrees(classId);
		if (trees) {
			this.novice = parseMasteryData(trees.novice);
			this.expert = parseMasteryData(trees.expert);
		} else {
			this.novice = [];
			this.expert = [];
		}
	}

	static fromInstance(playerMasteries?: PlayerMasteries): PlayerMasteries {
		const classId = playerMasteries?.classId || 'ace-trainer';
		const newInstance = new PlayerMasteries(classId);

		if (playerMasteries) {
			// Restore tree state (preserve set/settable from save)
			newInstance.novice = parseMasteryData(
				playerMasteries.novice as unknown as MasteryNodeData[]
			);
			newInstance.expert = parseMasteryData(
				playerMasteries.expert as unknown as MasteryNodeData[]
			);

			newInstance.bonuses = new MasteriesBonuses(playerMasteries.bonuses);
			newInstance.level = playerMasteries.level;
			newInstance.points = playerMasteries.points;
			newInstance.exp = playerMasteries.exp;
			newInstance.xpToNextLevel = playerMasteries.xpToNextLevel;
			newInstance.classRank = playerMasteries.classRank || ClassRank.APPRENTICE;
			newInstance.lastMilestoneLevel = playerMasteries.lastMilestoneLevel || 0;

			// Restore active perks
			newInstance.activePerks = (playerMasteries.activePerks || []).map((p) => ({
				definition: p.definition,
				state: p.state || {}
			}));
		}
		return newInstance;
	}

	addExp(exp: number) {
		let leftover = 0;
		this.exp += exp;
		if (this.exp >= this.xpToNextLevel) {
			leftover = this.exp - this.xpToNextLevel;
			this.level++;
			this.levelUp();
			if (leftover > 0) {
				this.addExp(leftover);
			}
		}
	}

	/**
	 * Level up: grant points + check milestones + check rank progression.
	 * Returns the new ClassRank if a rank-up occurred, undefined otherwise.
	 */
	levelUp(): ClassRank | undefined {
		// Base: +1 point per level
		this.points++;
		this.exp = 0;
		this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, 1) * 2;

		// Milestone bonuses
		if (this.level % 5 === 0) {
			this.points += 2; // +2 every 5 levels
		}
		if (this.level % 10 === 0) {
			this.points += 3; // +3 every 10 levels (stacks with the +2)
		}

		// Check rank progression
		return this.checkRankUp();
	}

	checkRankUp(): ClassRank | undefined {
		const ranks = [
			ClassRank.GRANDMASTER,
			ClassRank.MASTER,
			ClassRank.EXPERT,
			ClassRank.ADEPT,
			ClassRank.APPRENTICE
		];

		for (const rank of ranks) {
			if (this.level >= CLASS_RANK_THRESHOLDS[rank] && this.classRank < rank) {
				const oldRank = this.classRank;
				this.classRank = rank;
				this.applyRankUpRewards(rank);
				return rank;
			}
		}
		return undefined;
	}

	private applyRankUpRewards(rank: ClassRank): void {
		switch (rank) {
			case ClassRank.ADEPT:
				this.points += 5;
				break;
			case ClassRank.EXPERT:
				this.points += 10;
				break;
			case ClassRank.MASTER:
				this.points += 10;
				break;
			case ClassRank.GRANDMASTER:
				this.points += 15;
				// Double all class bonuses at Grandmaster
				this.doubleClassBonuses();
				break;
		}
	}

	private doubleClassBonuses(): void {
		// Import is circular-safe since we only read bonuses data
		// The actual class bonus values are applied at creation time,
		// so we double whatever bonuses exist
		const keys: (keyof MasteriesBonuses)[] = [
			'catch', 'xp', 'ev', 'shiny', 'critical', 'stab', 'nonStab',
			'accuracy', 'effectiveness', 'resistance', 'comboJauge', 'comboDamage',
			'heal', 'autoHeal', 'dotChance', 'dotDamage',
			'wSun', 'wRain', 'wSand', 'wHail', 'wTurnAlly', 'wTurnOpp',
			'confuse', 'attract'
		];
		for (const key of keys) {
			if (typeof this.bonuses[key] === 'number') {
				(this.bonuses as any)[key] = this.bonuses[key] * 2;
			}
		}
	}

	isExpertUnlocked(): boolean {
		return this.classRank >= ClassRank.ADEPT;
	}

	isCapstoneUnlocked(): boolean {
		return this.classRank >= ClassRank.MASTER;
	}

	getRankLabel(): string {
		return CLASS_RANK_LABELS[this.classRank];
	}

	setMastery(mastery: Mastery) {
		const node =
			mastery.group === MasteryGroup.NOVICE
				? this.novice.find((m) => m.q === mastery.q && m.r === mastery.r)
				: this.expert.find((m) => m.q === mastery.q && m.r === mastery.r);

		if (node && !node.set && this.points >= node.cost) {
			node.set = true;
			node.settable = false;
			this.points -= node.cost;

			// Handle perk nodes vs stat nodes
			if (mastery.type === MasteryType.PERK && mastery.perkId) {
				const perkDef = getPerkDefinition(mastery.perkId);
				if (perkDef) {
					this.activePerks.push({
						definition: perkDef,
						state: {}
					});
				}
			} else {
				this.bonuses.enableMastery(mastery.type, mastery.value);
			}
		}
	}

	hasPerk(perkId: string): boolean {
		return this.activePerks.some((p) => p.definition.id === perkId);
	}

	getPerkState(perkId: string): Record<string, number | boolean> | undefined {
		return this.activePerks.find((p) => p.definition.id === perkId)?.state;
	}

	getActivePerksForTrigger(trigger: string): ActivePerk[] {
		return this.activePerks.filter((p) => p.definition.trigger === trigger);
	}
}
