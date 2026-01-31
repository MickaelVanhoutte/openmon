import { EXPERIENCE_CHART } from '../pokemons/experience';
import noviceData from '../../assets/data/final/beta/masteries-initiate.json';
import expertData from '../../assets/data/final/beta/masteries-expert.json';

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
		group: MasteryGroup
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

	CUT = 'cut',
	FLY = 'fly',
	SURF = 'surf',
	STRENGTH = 'strength',
	ROCK_SMASH = 'rockSmash'
}

export enum MasteryGroup {
	NOVICE = 'novice',
	EXPERT = 'expert'
}

export class MasteriesBonuses {
	[key: string]: number;
	catch: number = 0;
	xp: number = 0;
	ev: number = 0;
	shiny: number = 0;
	critical: number = 0;
	stab: number = 0;
	nonStab: number = 0;
	accuracy: number = 0; // TODO
	effectiveness: number = 0; // TODO
	resistance: number = 0; // TODO
	comboJauge: number = 0;
	comboDamage: number = 0;
	heal: number = 0; // TODO
	autoHeal: number = 0; // TODO
	dotChance: number = 0; // TODO
	dotDamage: number = 0; // TODO
	wSun: number = 0; // TODO
	wRain: number = 0; // TODO
	wSand: number = 0; // TODO
	wHail: number = 0; // TODO
	wTurnAlly: number = 0; // TODO
	wTurnOpponent: number = 0; // TODO
	confuse: number = 0; // TODO
	attract: number = 0; // TODO

	cut: number = 0; // TODO
	fly: number = 0; // TODO
	surf: number = 0; // TODO
	strength: number = 0; // TODO
	rockSmash: number = 0; // TODO

	constructor(
		catchN: number = 0,
		xp: number = 0,
		ev: number = 0,
		shiny: number = 0,
		critical: number = 0,
		stab: number = 0,
		nonStab: number = 0,
		accuracy: number = 0,
		effectiveness: number = 0,
		resistance: number = 0,
		comboJauge: number = 0,
		comboDamage: number = 0,
		heal: number = 0,
		autoHeal: number = 0,
		dotChance: number = 0,
		dotDamage: number = 0,
		wSun: number = 0,
		wRain: number = 0,
		wSand: number = 0,
		wHail: number = 0,
		wTurnAlly: number = 0,
		wTurnOpponent: number = 0,
		confuse: number = 0,
		attract: number = 0,
		cut: number = 0,
		fly: number = 0,
		surf: number = 0,
		strength: number = 0,
		rockSmash: number = 0
	) {
		this.catch = catchN;
		this.xp = xp;
		this.ev = ev;
		this.shiny = shiny;
		this.critical = critical;
		this.stab = stab;
		this.nonStab = nonStab;
		this.accuracy = accuracy;
		this.effectiveness = effectiveness;
		this.resistance = resistance;
		this.comboJauge = comboJauge;
		this.comboDamage = comboDamage;
		this.heal = heal;
		this.autoHeal = autoHeal;
		this.dotChance = dotChance;
		this.dotDamage = dotDamage;
		this.wSun = wSun;
		this.wRain = wRain;
		this.wSand = wSand;
		this.wHail = wHail;
		this.wTurnAlly = wTurnAlly;
		this.wTurnOpponent = wTurnOpponent;
		this.confuse = confuse;
		this.attract = attract;
		this.cut = cut;
		this.fly = fly;
		this.surf = surf;
		this.strength = strength;
		this.rockSmash = rockSmash;
	}

	public enableMastery(type: MasteryType, value: number) {
		this[type] += value;
	}

	public getMastery(type: MasteryType): number {
		return this[type];
	}
}

export class PlayerMasteries {
	novice: Mastery[] = [];
	expert: Mastery[] = [];
	bonuses: MasteriesBonuses = new MasteriesBonuses();

	level: number = 1;
	points: number = 20;
	exp: number = 0;
	xpToNextLevel: number = 0;

	constructor() {
		this.novice = noviceData.map(
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
					m.group as MasteryGroup
				)
		);
		this.expert = expertData.map(
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
					m.group as MasteryGroup
				)
		);
		this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, 1) * 2;
	}

	static fromInstance(playerMasteries?: PlayerMasteries): PlayerMasteries {
		let newInstance = new PlayerMasteries();
		if (playerMasteries) {
			newInstance.novice = playerMasteries.novice.map(
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
						m.group as MasteryGroup
					)
			);
			newInstance.expert = playerMasteries.expert.map(
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
						m.group as MasteryGroup
					)
			);
			newInstance.bonuses = new MasteriesBonuses(
				playerMasteries.bonuses.catch,
				playerMasteries.bonuses.xp,
				playerMasteries.bonuses.ev,
				playerMasteries.bonuses.shiny,
				playerMasteries.bonuses.critical,
				playerMasteries.bonuses.stab,
				playerMasteries.bonuses.nonStab,
				playerMasteries.bonuses.accuracy,
				playerMasteries.bonuses.effectiveness,
				playerMasteries.bonuses.resistance,
				playerMasteries.bonuses.comboJauge,
				playerMasteries.bonuses.comboDamage,
				playerMasteries.bonuses.heal,
				playerMasteries.bonuses.autoHeal,
				playerMasteries.bonuses.dotChance,
				playerMasteries.bonuses.dotDamage,
				playerMasteries.bonuses.wSun,
				playerMasteries.bonuses.wRain,
				playerMasteries.bonuses.wSand,
				playerMasteries.bonuses.wHail,
				playerMasteries.bonuses.wTurnAlly,
				playerMasteries.bonuses.wTurnOpponent,
				playerMasteries.bonuses.confuse,
				playerMasteries.bonuses.attract,
				playerMasteries.bonuses.cut,
				playerMasteries.bonuses.fly,
				playerMasteries.bonuses.surf,
				playerMasteries.bonuses.strength,
				playerMasteries.bonuses.rockSmash
			);
			newInstance.level = playerMasteries.level;
			newInstance.points = playerMasteries.points;
			newInstance.exp = playerMasteries.exp;
			newInstance.xpToNextLevel = playerMasteries.xpToNextLevel;
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

	levelUp() {
		this.points++;
		this.exp = 0;
		this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, 1) * 2;
	}

	setMastery(mastery: Mastery) {
		this.bonuses.enableMastery(mastery.type, mastery.value);
		let node =
			mastery.group == MasteryGroup.NOVICE
				? this.novice.find((m) => m.q == mastery.q && m.r == mastery.r)
				: this.expert.find((m) => m.q == mastery.q && m.r == mastery.r);

		if (node && !node.set && this.points >= node.cost) {
			node.set = true;
			node.settable = false;
			this.points -= node.cost;
		}
	}
}
