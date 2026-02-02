import { Position } from '../../mapping/positions';
import {
	Objective,
	ObjectiveState,
	QUESTS,
	Quest,
	QuestState,
	Flags
} from '../../scripting/quests';
import { Notifications } from '../../scripting/notifications';
import { MenuType } from '../overworldContext';

/**
 * QuestManager - Handles all quest-related logic including state, objectives, and tracking
 */
export class QuestManager {
	questStates: QuestState[] = [];
	quests: Quest[] = [];
	currentQuest?: Quest;
	flags: Flags;
	private notifications: Notifications;
	onObjectiveComplete?: () => void;

	constructor(savedQuestStates: QuestState[], savedFlags: Flags, notifications: Notifications) {
		this.questStates = savedQuestStates;
		this.flags = savedFlags;
		this.notifications = notifications;

		// Initialize quests from saved state
		const lastCompleted = this.questStates
			.filter((q) => q.completed)
			.sort((a, b) => a.id - b.id)
			.pop();

		this.quests = QUESTS.map((q) => {
			const questState = this.questStates.find((qs) => qs.id === q.id);
			return new Quest(
				q.id,
				q.name,
				q.description,
				q.objectives.map(
					(o) =>
						new Objective(
							o.id,
							o.description,
							questState?.objectives.find((questObj) => questObj.id === o.id)?.completed || false
						)
				),
				q.area,
				q.leaveMessage,
				questState?.completed || false
			);
		});

		if (lastCompleted) {
			this.currentQuest = this.quests.find((q) => q.id === lastCompleted.id + 1) || this.quests[0];
		} else {
			this.currentQuest = this.quests[0];
		}
	}

	validateObjective(questId: number, objectiveId: number): void {
		const quest = this.quests.find((q) => q.id === questId);
		const objective = quest?.objectives.find((o) => o.id === objectiveId);

		if (objective) {
			objective.complete();
			const questState = this.questStates.find((qs) => qs.id === questId);

			if (questState) {
				const obj = questState.objectives.find((o) => o.id === objectiveId);
				if (obj) {
					obj.completed = true;
					this.notifications.notify(`Objective completed: ${objective.description}`);
					this.onObjectiveComplete?.();

					if (quest && questState.objectives.every((o) => o.completed)) {
						questState.completed = true;
						this.notifications.notify(`Quest completed: ${quest.name}`);

						this.currentQuest = this.quests.find((q) => q.id === questId + 1) || undefined;
						if (this.currentQuest) {
							this.notifications.notify(`New quest: ${this.currentQuest.name}`);
						}
					}
				}
			} else if (quest) {
				this.questStates.push(
					new QuestState(
						questId,
						false,
						quest.objectives.map((o) => new ObjectiveState(o.id, o.completed))
					)
				);
			}
		}
	}

	isMenuAvailable(menuKey: MenuType): boolean {
		switch (menuKey) {
			case MenuType.POKEMON_LIST:
			case MenuType.BOX:
				return this.questStates.find((q) => q.id === 0)?.objectives[0].completed || false;
			case MenuType.POKEDEX:
				return this.questStates.find((q) => q.id === 0)?.objectives[1].completed || false;
			case MenuType.TRAINER:
				return this.questStates.find((q) => q.id === 0)?.objectives[2].completed || false;
			case MenuType.BAG:
				return this.questStates.find((q) => q.id === 0)?.objectives[3].completed || false;
			default:
				return false;
		}
	}

	hasQuestLimit(futurePosition: Position): boolean {
		return (
			!!this.currentQuest &&
			!!this.currentQuest.area &&
			this.isOutsideQuestBounds(futurePosition, this.currentQuest.area)
		);
	}

	isOutsideQuestBounds(
		futurePosition: Position,
		area: { start: Position; end: Position }
	): boolean {
		return (
			futurePosition.x < area.start.x ||
			futurePosition.x > area.end.x ||
			futurePosition.y < area.start.y ||
			futurePosition.y > area.end.y
		);
	}

	notifyCurrentQuest(): void {
		if (this.currentQuest) {
			this.notifications.notify('Current quest: ' + this.currentQuest.name);
		}
	}

	getQuestStates(): QuestState[] {
		return this.questStates;
	}

	getFlags(): Flags {
		return this.flags;
	}
}
