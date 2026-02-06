import type { Position } from '../mapping/positions';

export enum FlagEntry {
	RUNNING_SHOES_UNLOCKED,
	COMBO_MOVES_UNLOCKED
}

export class Flags {
	flags: Map<FlagEntry, boolean>;

	constructor(flags?: Map<FlagEntry, boolean>) {
		if (flags) {
			this.flags = flags;
			Object.setPrototypeOf(this.flags, Map.prototype);
		} else {
			this.flags = new Map();
			Object.values(FlagEntry).forEach((f) => {
				this.flags.set(<FlagEntry>f, false);
			});
		}
	}

	setFlag(flag: FlagEntry, value: boolean) {
		this.flags.set(flag, value);
	}

	getFlag(flag: FlagEntry): boolean {
		return this.flags.get(flag) || false;
	}
}

export class ObjectiveState {
	id: number;
	completed: boolean;

	constructor(id: number, completed: boolean) {
		this.id = id;
		this.completed = completed;
	}
}

export class Objective {
	id: number;
	description: string;
	completed: boolean;

	constructor(id: number, description: string, completed: boolean = false) {
		this.id = id;
		this.description = description;
		this.completed = completed;
	}

	complete() {
		this.completed = true;
	}
}

export class Quest {
	id: number;
	name: string;
	description: string;
	objectives: Objective[];
	completed: boolean;
	area?: { start: Position; end: Position };
	leaveMessage: string;

	constructor(
		id: number,
		name: string,
		description: string,
		objectives: Objective[],
		area?: { start: Position; end: Position },
		leaveMessage: string = "I shouldn't leave",
		completed: boolean = false
	) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.objectives = objectives;
		this.area = area;
		this.leaveMessage = leaveMessage;
		this.completed = completed;
	}

	toState(): QuestState {
		return new QuestState(
			this.id,
			this.completed,
			this.objectives.map((o) => new ObjectiveState(o.id, o.completed))
		);
	}
}

export class QuestState {
	id: number;
	completed: boolean;
	objectives: ObjectiveState[];

	constructor(id: number, completed: boolean, objectives: ObjectiveState[]) {
		this.id = id;
		this.completed = completed;
		this.objectives = objectives;
	}
}

export const QUESTS = [
	new Quest(
		0,
		'A fresh start',
		'You remember being a trainer, find out what happened to you',
		[
			new Objective(0, 'Find your Pokemon'),
			new Objective(1, 'Find your Pokedex'),
			new Objective(2, 'Find your Trainer Card'),
			new Objective(3, 'Find your Bag'),
			new Objective(4, 'Find your Running Shoes')
			// new Objective(5, "Discover what happened here"),
		],
		{ start: { x: 121, y: 79 }, end: { x: 146, y: 103 } },
		'I should find my stuff before leaving'
	),
	new Quest(1, 'The first step', 'Reach the village in the forest', [
		new Objective(0, 'Reach the village in the forest'),
		new Objective(1, 'Talk to the villagers')
	])
];
