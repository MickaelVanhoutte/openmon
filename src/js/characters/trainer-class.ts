import {
	MasteryType,
	ClassRank,
	type MasteriesBonuses,
	type MasteryNodeData,
	registerClassTrees
} from './mastery-model';
import classSpriteMapping from '../../assets/data/class-sprites.json';

// Expert tree data imports (class-specific)
import expertBerserker from '../../assets/data/final/beta/masteries-expert-berserker.json';
import expertMedic from '../../assets/data/final/beta/masteries-expert-medic.json';
import expertGuardian from '../../assets/data/final/beta/masteries-expert-guardian.json';
import expertExplorer from '../../assets/data/final/beta/masteries-expert-explorer.json';
import expertWeatherMaster from '../../assets/data/final/beta/masteries-expert-weather-master.json';
import expertStrategist from '../../assets/data/final/beta/masteries-expert-strategist.json';
import expertBreeder from '../../assets/data/final/beta/masteries-expert-breeder.json';
import expertAceTrainer from '../../assets/data/final/beta/masteries-expert-ace-trainer.json';

const EXPERT_TREES: Record<string, MasteryNodeData[]> = {
	berserker: expertBerserker as MasteryNodeData[],
	medic: expertMedic as MasteryNodeData[],
	guardian: expertGuardian as MasteryNodeData[],
	explorer: expertExplorer as MasteryNodeData[],
	'weather-master': expertWeatherMaster as MasteryNodeData[],
	strategist: expertStrategist as MasteryNodeData[],
	breeder: expertBreeder as MasteryNodeData[],
	'ace-trainer': expertAceTrainer as MasteryNodeData[]
};

// ─── Trainer Class Data ─────────────────────────────────────────────────────

export interface TrainerClassData {
	id: string;
	name: string;
	description: string;
	bonuses: Partial<Record<MasteryType, number>>;
}

export const TRAINER_CLASSES: TrainerClassData[] = [
	{
		id: 'ace-trainer',
		name: 'Ace Trainer',
		description: 'A well-rounded trainer. Balanced bonuses to XP and STAB damage.',
		bonuses: {
			[MasteryType.XP]: 5,
			[MasteryType.STAB]: 5
		}
	},
	{
		id: 'breeder',
		name: 'Breeder',
		description: 'Focused on raising strong Pokemon. Better EV gains and catch rates.',
		bonuses: {
			[MasteryType.EV]: 10,
			[MasteryType.CATCH]: 10
		}
	},
	{
		id: 'weather-master',
		name: 'Weather Master',
		description: 'Harnesses the power of weather. Weather lasts longer.',
		bonuses: {
			[MasteryType.WEATHER_TURN_ALLY]: 1,
			[MasteryType.WEATHER_SUN]: 5,
			[MasteryType.WEATHER_RAIN]: 5
		}
	},
	{
		id: 'strategist',
		name: 'Strategist',
		description: 'Fights with cunning. Better combos and status effectiveness.',
		bonuses: {
			[MasteryType.COMBO_JAUGE]: 5,
			[MasteryType.DOT_DAMAGE]: 5,
			[MasteryType.CONFUSE]: 5
		}
	},
	{
		id: 'medic',
		name: 'Medic',
		description: 'Keeps the team healthy. Enhanced healing abilities.',
		bonuses: {
			[MasteryType.HEAL]: 10,
			[MasteryType.AUTO_HEAL]: 5
		}
	},
	{
		id: 'berserker',
		name: 'Berserker',
		description: 'Fights with reckless abandon. Higher critical hits and super-effective damage.',
		bonuses: {
			[MasteryType.CRITICAL]: 10,
			[MasteryType.EFFECTIVENESS]: 5
		}
	},
	{
		id: 'guardian',
		name: 'Guardian',
		description: 'A defensive specialist. Resists super-effective hits and heals more.',
		bonuses: {
			[MasteryType.RESISTANCE]: 10,
			[MasteryType.HEAL]: 5
		}
	},
	{
		id: 'explorer',
		name: 'Explorer',
		description: 'Always seeking new Pokemon. Better XP, catch rates, and shiny luck.',
		bonuses: {
			[MasteryType.XP]: 8,
			[MasteryType.CATCH]: 5,
			[MasteryType.SHINY]: 5
		}
	}
];

export function getTrainerClass(id: string): TrainerClassData | undefined {
	return TRAINER_CLASSES.find((c) => c.id === id);
}

export function getClassSpriteId(classId: string, sex: 'MALE' | 'FEMALE'): number {
	const mapping = (classSpriteMapping as Record<string, { male: number; female: number }>)[classId];
	if (!mapping) return sex === 'MALE' ? 1 : 2;
	return sex === 'MALE' ? mapping.male : mapping.female;
}

export function applyClassBonuses(bonuses: MasteriesBonuses, classId: string): void {
	const trainerClass = getTrainerClass(classId);
	if (!trainerClass) return;
	for (const [type, value] of Object.entries(trainerClass.bonuses)) {
		bonuses.enableMastery(type as MasteryType, value as number);
	}
}

// ─── Class Rank Rewards ─────────────────────────────────────────────────────

export interface ClassRankReward {
	masteryPoints: number;
	title?: string;
	itemId?: string;
	pokemonId?: number;
	pokemonLevel?: number;
}

export const CLASS_RANK_REWARDS: Record<string, Record<ClassRank, ClassRankReward>> = {
	berserker: {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'scope-lens' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 246, pokemonLevel: 25 }, // Larvitar
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Warlord' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'choice-band' }
	},
	medic: {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'leftovers' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 113, pokemonLevel: 25 }, // Chansey
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Lifebringer' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'shell-bell' }
	},
	guardian: {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'rocky-helmet' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 410, pokemonLevel: 25 }, // Shieldon
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Bulwark' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'assault-vest' }
	},
	explorer: {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'amulet-coin' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 359, pokemonLevel: 25 }, // Absol
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Pathfinder' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'lucky-egg' }
	},
	'weather-master': {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'heat-rock' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 351, pokemonLevel: 25 }, // Castform
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Stormcaller' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'damp-rock' }
	},
	strategist: {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'metronome' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 280, pokemonLevel: 25 }, // Ralts
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Architect' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'wide-lens' }
	},
	breeder: {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'exp-share' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 133, pokemonLevel: 15 }, // Eevee
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Caretaker' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'destiny-knot' }
	},
	'ace-trainer': {
		[ClassRank.APPRENTICE]: { masteryPoints: 0 },
		[ClassRank.ADEPT]: { masteryPoints: 5, itemId: 'silk-scarf' },
		[ClassRank.EXPERT]: { masteryPoints: 10, pokemonId: 447, pokemonLevel: 25 }, // Riolu
		[ClassRank.MASTER]: { masteryPoints: 10, title: 'Champion' },
		[ClassRank.GRANDMASTER]: { masteryPoints: 15, itemId: 'life-orb' }
	}
};

export function getClassRankReward(classId: string, rank: ClassRank): ClassRankReward | undefined {
	return CLASS_RANK_REWARDS[classId]?.[rank];
}

export function getClassTitle(classId: string, rank: ClassRank): string | undefined {
	// Walk backwards through ranks to find the highest title earned
	const ranks = [ClassRank.GRANDMASTER, ClassRank.MASTER, ClassRank.EXPERT, ClassRank.ADEPT, ClassRank.APPRENTICE];
	for (const r of ranks) {
		if (r <= rank) {
			const reward = CLASS_RANK_REWARDS[classId]?.[r];
			if (reward?.title) return reward.title;
		}
	}
	return undefined;
}

// ─── Class-Specific Novice Trees ────────────────────────────────────────────

interface NoviceNodeTemplate {
	type: MasteryType;
	value: number;
	title: string;
	description: string;
	color: string;
}

interface NoviceColumnTemplate {
	label: string;
	nodes: NoviceNodeTemplate[];
}

function buildNoviceTree(columns: NoviceColumnTemplate[]): MasteryNodeData[] {
	const tree: MasteryNodeData[] = [];

	columns.forEach((col, colIdx) => {
		col.nodes.forEach((node, rowIdx) => {
			const isStart = colIdx === 0 && rowIdx === 0;
			tree.push({
				q: colIdx,
				r: rowIdx,
				column: col.label,
				cost: isStart ? 0 : 1,
				title: isStart ? '' : node.title,
				description: isStart ? '' : node.description,
				color: isStart ? 'white' : node.color,
				set: isStart,
				first: isStart,
				settable: false,
				type: isStart ? 'start' : node.type,
				value: isStart ? 0 : node.value,
				group: 'novice'
			});
		});
	});

	return tree;
}

// Color constants for mastery types
const C = {
	crit: '#F4D35E',
	stab: '#BBF1E4',
	nonStab: '#BADDD6',
	xp: '#F7F6CF',
	catch: '#F7F6CF',
	ev: '#F7F6CF',
	shiny: '#E8D5F5',
	heal: '#baffc9',
	res: '#D5E5E2',
	eff: '#FFFFBA',
	acc: '#FDEFAB',
	combo: '#FF968A',
	dot: '#CBAACB',
	weather: '#40E0D0',
	confuse: '#D9E5E3',
	attract: '#FBC2C2',
	autoHeal: '#baffc9'
};

const NOVICE_TREES: Record<string, NoviceColumnTemplate[]> = {
	berserker: [
		{ label: 'Fury', nodes: [
			{ type: MasteryType.CRITICAL, value: 3, title: 'Crit +3%', description: 'Increase critical hit chance by 3%', color: C.crit },
			{ type: MasteryType.CRITICAL, value: 3, title: 'Crit +3%', description: 'Increase critical hit chance by 3%', color: C.crit },
			{ type: MasteryType.CRITICAL, value: 2, title: 'Crit +2%', description: 'Increase critical hit chance by 2%', color: C.crit },
			{ type: MasteryType.CRITICAL, value: 2, title: 'Crit +2%', description: 'Increase critical hit chance by 2%', color: C.crit }
		]},
		{ label: 'Power', nodes: [
			{ type: MasteryType.STAB, value: 5, title: 'STAB +5%', description: 'Increase STAB damage by 5%', color: C.stab },
			{ type: MasteryType.STAB, value: 5, title: 'STAB +5%', description: 'Increase STAB damage by 5%', color: C.stab },
			{ type: MasteryType.STAB, value: 3, title: 'STAB +3%', description: 'Increase STAB damage by 3%', color: C.stab },
			{ type: MasteryType.EFFECTIVENESS, value: 5, title: 'Eff +5%', description: 'Increase move side effect chances by 5%', color: C.eff }
		]},
		{ label: 'Carnage', nodes: [
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.EFFECTIVENESS, value: 5, title: 'Eff +5%', description: 'Increase move side effect chances by 5%', color: C.eff },
			{ type: MasteryType.EFFECTIVENESS, value: 3, title: 'Eff +3%', description: 'Increase move side effect chances by 3%', color: C.eff }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny }
		]}
	],
	medic: [
		{ label: 'Healing', nodes: [
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal }
		]},
		{ label: 'Sustain', nodes: [
			{ type: MasteryType.AUTO_HEAL, value: 1, title: 'Auto Heal', description: 'Auto-heal 10% HP after each battle', color: C.autoHeal },
			{ type: MasteryType.RESISTANCE, value: 5, title: 'Res +5%', description: 'Reduce opponent move effect chances by 5%', color: C.res },
			{ type: MasteryType.AUTO_HEAL, value: 1, title: 'Auto Heal', description: 'Auto-heal 10% HP after each battle', color: C.autoHeal },
			{ type: MasteryType.RESISTANCE, value: 5, title: 'Res +5%', description: 'Reduce opponent move effect chances by 5%', color: C.res }
		]},
		{ label: 'Support', nodes: [
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.RESISTANCE, value: 3, title: 'Res +3%', description: 'Reduce opponent move effect chances by 3%', color: C.res },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny }
		]}
	],
	guardian: [
		{ label: 'Fortitude', nodes: [
			{ type: MasteryType.RESISTANCE, value: 5, title: 'Res +5%', description: 'Reduce opponent move effect chances by 5%', color: C.res },
			{ type: MasteryType.RESISTANCE, value: 5, title: 'Res +5%', description: 'Reduce opponent move effect chances by 5%', color: C.res },
			{ type: MasteryType.RESISTANCE, value: 5, title: 'Res +5%', description: 'Reduce opponent move effect chances by 5%', color: C.res },
			{ type: MasteryType.RESISTANCE, value: 3, title: 'Res +3%', description: 'Reduce opponent move effect chances by 3%', color: C.res }
		]},
		{ label: 'Recovery', nodes: [
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal },
			{ type: MasteryType.HEAL, value: 5, title: 'Heal +5%', description: 'Increase healing effectiveness by 5%', color: C.heal }
		]},
		{ label: 'Precision', nodes: [
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc },
			{ type: MasteryType.RESISTANCE, value: 3, title: 'Res +3%', description: 'Reduce opponent move effect chances by 3%', color: C.res },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.ACCURACY, value: 3, title: 'Acc +3%', description: 'Increase move accuracy by 3%', color: C.acc }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny }
		]}
	],
	explorer: [
		{ label: 'Discovery', nodes: [
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch }
		]},
		{ label: 'Fortune', nodes: [
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny }
		]},
		{ label: 'Growth', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.EV, value: 1, title: 'EV +1', description: 'Increase EV gain by 1', color: C.ev },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc }
		]}
	],
	'weather-master': [
		{ label: 'Sun & Rain', nodes: [
			{ type: MasteryType.WEATHER_SUN, value: 1, title: 'Sun +1', description: 'Increase sun weather effect', color: C.weather },
			{ type: MasteryType.WEATHER_RAIN, value: 1, title: 'Rain +1', description: 'Increase rain weather effect', color: C.weather },
			{ type: MasteryType.WEATHER_SUN, value: 1, title: 'Sun +1', description: 'Increase sun weather effect', color: C.weather },
			{ type: MasteryType.WEATHER_RAIN, value: 1, title: 'Rain +1', description: 'Increase rain weather effect', color: C.weather }
		]},
		{ label: 'Sand & Hail', nodes: [
			{ type: MasteryType.WEATHER_SAND, value: 1, title: 'Sand +1', description: 'Increase sandstorm weather effect', color: C.weather },
			{ type: MasteryType.WEATHER_HAIL, value: 1, title: 'Hail +1', description: 'Increase hail weather effect', color: C.weather },
			{ type: MasteryType.WEATHER_TURN_OPPONENT, value: -1, title: 'W.Turn -1', description: 'Opponent weather moves last 1 turn less', color: C.weather }
		]},
		{ label: 'Mastery', nodes: [
			{ type: MasteryType.WEATHER_TURN_ALLY, value: 1, title: 'W.Turn +1', description: 'Your weather moves last 1 turn longer', color: C.weather },
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc },
			{ type: MasteryType.WEATHER_TURN_ALLY, value: 1, title: 'W.Turn +1', description: 'Your weather moves last 1 turn longer', color: C.weather },
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo }
		]}
	],
	strategist: [
		{ label: 'Combos', nodes: [
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo },
			{ type: MasteryType.COMBO_DAMAGE, value: 10, title: 'Combo Dmg +10%', description: 'Increase combo attack damage by 10%', color: C.combo }
		]},
		{ label: 'Affliction', nodes: [
			{ type: MasteryType.DOT_CHANCE, value: 5, title: 'DoT +5%', description: 'Increase burn/poison infliction chance by 5%', color: C.dot },
			{ type: MasteryType.DOT_DAMAGE, value: 2, title: 'DoT Dmg +2%', description: 'Increase burn/poison damage by 2%', color: C.dot },
			{ type: MasteryType.DOT_DAMAGE, value: 2, title: 'DoT Dmg +2%', description: 'Increase burn/poison damage by 2%', color: C.dot },
			{ type: MasteryType.DOT_CHANCE, value: 5, title: 'DoT +5%', description: 'Increase burn/poison infliction chance by 5%', color: C.dot }
		]},
		{ label: 'Control', nodes: [
			{ type: MasteryType.CONFUSE, value: 5, title: 'Confuse +5%', description: 'Increase confusion infliction chance', color: C.confuse },
			{ type: MasteryType.CONFUSE, value: 5, title: 'Confuse +5%', description: 'Increase confusion infliction chance', color: C.confuse },
			{ type: MasteryType.ATTRACT, value: 1, title: 'Attract', description: 'Increase attraction infliction chance', color: C.attract },
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny }
		]}
	],
	breeder: [
		{ label: 'Catching', nodes: [
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch }
		]},
		{ label: 'Training', nodes: [
			{ type: MasteryType.EV, value: 2, title: 'EV +2', description: 'Increase EV gain by 2', color: C.ev },
			{ type: MasteryType.EV, value: 2, title: 'EV +2', description: 'Increase EV gain by 2', color: C.ev },
			{ type: MasteryType.EV, value: 2, title: 'EV +2', description: 'Increase EV gain by 2', color: C.ev },
			{ type: MasteryType.EV, value: 2, title: 'EV +2', description: 'Increase EV gain by 2', color: C.ev }
		]},
		{ label: 'Growth', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.EV, value: 2, title: 'EV +2', description: 'Increase EV gain by 2', color: C.ev },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo }
		]}
	],
	'ace-trainer': [
		{ label: 'Mastery', nodes: [
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.XP, value: 5, title: 'XP +5%', description: 'Increase experience gain by 5%', color: C.xp },
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc }
		]},
		{ label: 'Offense', nodes: [
			{ type: MasteryType.STAB, value: 5, title: 'STAB +5%', description: 'Increase STAB damage by 5%', color: C.stab },
			{ type: MasteryType.NON_STAB, value: 5, title: 'Non-STAB +5%', description: 'Increase non-STAB damage by 5%', color: C.nonStab },
			{ type: MasteryType.STAB, value: 5, title: 'STAB +5%', description: 'Increase STAB damage by 5%', color: C.stab },
			{ type: MasteryType.STAB, value: 3, title: 'STAB +3%', description: 'Increase STAB damage by 3%', color: C.stab }
		]},
		{ label: 'Tactics', nodes: [
			{ type: MasteryType.EFFECTIVENESS, value: 5, title: 'Eff +5%', description: 'Increase move side effect chances by 5%', color: C.eff },
			{ type: MasteryType.NON_STAB, value: 5, title: 'Non-STAB +5%', description: 'Increase non-STAB damage by 5%', color: C.nonStab },
			{ type: MasteryType.EFFECTIVENESS, value: 5, title: 'Eff +5%', description: 'Increase move side effect chances by 5%', color: C.eff },
			{ type: MasteryType.COMBO_JAUGE, value: 5, title: 'Combo +5%', description: 'Increase combo gauge gain by 5%', color: C.combo }
		]},
		{ label: 'Utility', nodes: [
			{ type: MasteryType.ACCURACY, value: 5, title: 'Acc +5%', description: 'Increase move accuracy by 5%', color: C.acc },
			{ type: MasteryType.CATCH, value: 5, title: 'Catch +5%', description: 'Increase pokeball catch rate by 5%', color: C.catch },
			{ type: MasteryType.SHINY, value: 5, title: 'Shiny +5%', description: 'Increase shiny encounter rate by 5%', color: C.shiny }
		]}
	]
};

// ─── Register All Class Trees ───────────────────────────────────────────────

/**
 * Initialize and register all class-specific trees.
 * Expert trees will be loaded from JSON in Phase 2 — for now they're empty.
 */
export function initClassTrees(): void {
	for (const classId of Object.keys(NOVICE_TREES)) {
		const novice = buildNoviceTree(NOVICE_TREES[classId]);
		const expert = EXPERT_TREES[classId] || [];
		registerClassTrees(classId, novice, expert);
	}
}

// Auto-initialize on module load
initClassTrees();
