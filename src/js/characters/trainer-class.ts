import { MasteryType, type MasteriesBonuses } from './mastery-model';
import classSpriteMapping from '../../assets/data/class-sprites.json';

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
	console.log(sex === 'MALE' ? mapping.male : mapping.female);
	return sex === 'MALE' ? mapping.male : mapping.female;
}

export function applyClassBonuses(bonuses: MasteriesBonuses, classId: string): void {
	const trainerClass = getTrainerClass(classId);
	if (!trainerClass) return;
	for (const [type, value] of Object.entries(trainerClass.bonuses)) {
		bonuses.enableMastery(type as MasteryType, value as number);
	}
}
