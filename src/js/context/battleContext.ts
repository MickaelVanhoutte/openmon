import {
	BattleEvents,
	BattleResult,
	BattleType,
	TurnHistory,
	TurnPhase,
	typeChart,
	type PokemonType
} from '../battle/battle-model';
import { Move, PokemonInstance } from '../pokemons/pokedex';
import { Player } from '../characters/player';
import { type Character } from '../characters/characters-model';
import type { Settings } from '../characters/settings';
import { ActionStack } from '../battle/actions/action-stack';
import { NPC } from '../characters/npc';
import { writable, type Writable } from 'svelte/store';
import {
	ActionType,
	type ActionV2Interface,
	type TargetSlot
} from '../battle/actions/actions-model';
import { EXPERIENCE_CHART } from '../pokemons/experience';
import { MasteryType } from '../characters/mastery-model';
import { Attack, Switch, UseItem } from '../battle/actions/actions-selectable';
import { EndTurnChecks, Message, WeatherDamage, XPWin } from '../battle/actions/actions-derived';
import { ItemsReferences } from '../items/items';
import { BattleField } from '../battle/battle-field';
import { AbilityTrigger } from '../battle/abilities/ability-types';
import { AbilityEngine } from '../battle/abilities/ability-engine';
import { ItemEngine } from '../battle/items/item-engine';
import type { ItemContext } from '../battle/items/item-engine';
import { HeldItemTrigger } from '../items/held-items-model';
import '../battle/items/held-items-effects'; // Side-effect: registers all item effects
import { container } from 'tsyringe';
import { BattleAI } from '../battle/battle-ai';

export class BattleContext {
	ITEMS = new ItemsReferences();
	battleField: BattleField = new BattleField();
	public abilityEngine: AbilityEngine;
	public itemEngine: ItemEngine;
	hazardsVersion: Writable<number> = writable(0);
	weatherVersion: Writable<number> = writable(0);

	turnPhases: Writable<TurnPhase> = writable(TurnPhase.UPKEEP);

	player: Player;
	opponent: PokemonInstance | Character;
	//playerPokemon: PokemonInstance;
	//opponentPokemon: PokemonInstance;

	playerSide: (PokemonInstance | undefined)[] = [];
	oppSide: (PokemonInstance | undefined)[] = [];
	actionIdx: number = 0;

	battleType: BattleType;
	settings: Settings;

	events: BattleEvents;

	escapeAttempts: number = 0;
	participants: Set<PokemonInstance> = new Set<PokemonInstance>();
	leveledUpMonsterIds: Set<number> = new Set();

	opponentTurnActions: ActionV2Interface[] = [];
	playerTurnActions: ActionV2Interface[] = [];
	actionStack: ActionStack = new ActionStack();
	turnCount: number = 0;
	turnHistory: TurnHistory[] = [];

	isPlayerTurn: Writable<boolean> = writable(true);
	currentAction: Writable<ActionV2Interface | undefined> = writable(undefined);
	currentMessage: Writable<string | undefined> = writable(undefined);

	public battleResult: BattleResult = new BattleResult(false);
	sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	private _actionCompleteResolve: (() => void) | undefined;

	waitForActionCompletion(fallbackMs: number): Promise<void> {
		return Promise.race([
			new Promise<void>((resolve) => {
				this._actionCompleteResolve = resolve;
			}),
			this.sleep(fallbackMs) as Promise<void>
		]);
	}

	signalActionComplete(): void {
		if (this._actionCompleteResolve) {
			this._actionCompleteResolve();
			this._actionCompleteResolve = undefined;
		}
	}

	private getActionDuration(actionType: ActionType): number {
		switch (actionType) {
			case ActionType.ATTACK:
				return 1600;
			case ActionType.SWITCH:
				return 2000;
			case ActionType.MESSAGE:
				return 1000;
			case ActionType.XP_WIN:
				return 500;
			case ActionType.LEVEL_UP:
				return 1000;
			case ActionType.PLAY_ANIMATION:
				return 2000;
			case ActionType.STAT_CHANGE:
				return 1500;
			case ActionType.WEATHER_CHANGE:
				return 1000;
			default:
				return 800;
		}
	}

	private hasCompletionSignal(action: ActionV2Interface): boolean {
		return 'needsCompletionSignal' in action && (action as any).needsCompletionSignal === true;
	}

	get isWild() {
		return this.opponent instanceof PokemonInstance;
	}

	battleBg: string = 'beaches';
	/** Types of the legendary opponent — populated only for legendary wild battles. */
	legendaryTypes: string[] = [];

	constructor(
		player: Player,
		opponent: PokemonInstance | Character,
		settings: Settings,
		battleType: BattleType = BattleType.SINGLE,
		battleBg: string = 'beaches'
	) {
		container.registerInstance('BattleField', this.battleField);
		this.player = player;

		this.opponent = opponent;
		this.settings = settings;
		this.events = new BattleEvents();
		this.battleType = battleType;
		this.battleBg = battleBg;
		if (battleBg === 'mountains' && opponent instanceof PokemonInstance) {
			this.legendaryTypes = opponent.types ?? [];
		}
		this.abilityEngine = new AbilityEngine();
		this.itemEngine = new ItemEngine();
		//this.playerPokemon = this.player.monsters.find(poke => !poke.fainted) || this.player.monsters[0];
		//this.opponentPokemon = opponent instanceof PokemonInstance ? opponent : (opponent as Player).monsters.find(poke => !poke.fainted) || (opponent as Player).monsters[0];
		let teamSize = 1;
		if (battleType === BattleType.DOUBLE && opponent instanceof NPC) {
			teamSize = 2;
		}

		this.playerSide = this.player.monsters.filter((poke) => !poke.fainted).slice(0, teamSize);

		if (opponent instanceof PokemonInstance) {
			this.oppSide = [opponent];
		} else {
			this.oppSide = (opponent as Player).monsters
				.filter((poke) => !poke.fainted)
				.slice(0, teamSize);
		}

		if (this.playerSide?.length !== teamSize || this.oppSide?.length !== teamSize) {
			throw new Error('Not enough pokemons to start the battle');
		}

		this.playerSide
			?.filter((poke): poke is PokemonInstance => !!poke && !poke.fainted)
			.forEach((poke) => this.participants.add(poke));
		this.prepareNewTurn();
	}

	setPlayerAction(action: ActionV2Interface) {
		this.playerTurnActions.push(action);

		const alivePokemon = this.playerSide?.filter((poke) => !!poke && !poke.fainted) || [];
		if (this.playerTurnActions.length < alivePokemon.length) {
			const nextAliveIdx = this.playerSide.findIndex(
				(poke, idx) => idx > this.actionIdx && !!poke && !poke.fainted
			);
			if (nextAliveIdx !== -1) {
				this.actionIdx = nextAliveIdx;
				this.currentMessage.set(`What should ${this.playerSide[this.actionIdx]?.name} do ?`);
			}
		}

		if (this.playerTurnActions.length === alivePokemon.length) {
			this.startTurn();
		}
	}

	cancelLastAction() {
		if (this.playerTurnActions.length > 0) {
			this.playerTurnActions.pop();
			const prevAliveIdx = this.playerSide
				.map((poke, idx) => ({ poke, idx }))
				.filter(({ poke, idx }) => idx < this.actionIdx && !!poke && !poke.fainted)
				.pop()?.idx;
			if (prevAliveIdx !== undefined) {
				this.actionIdx = prevAliveIdx;
			} else {
				this.actionIdx = this.playerSide.findIndex((poke) => !!poke && !poke.fainted);
			}
			this.currentMessage.set(`What should ${this.playerSide[this.actionIdx]?.name} do ?`);
		}
	}

	startTurn() {
		this.isPlayerTurn.set(false);
		this.actionIdx = this.playerSide.findIndex((poke) => !!poke && !poke.fainted);
		this.turnCount++;
		this.turnPhases.set(TurnPhase.UPKEEP);
		this.battleField.tickTurn();

		this.runAbilityEventForAll(AbilityTrigger.ON_TURN_START, 'all');

		this.oppSide
			.filter((poke) => !!poke && !poke.fainted)
			.forEach((poke) => {
				const oppAction = this.selectOpponentAction(poke);
				if (oppAction) {
					this.opponentTurnActions.push(oppAction);
				}
			});

		const actions = this.sortActions(this.playerTurnActions, this.opponentTurnActions);

		const firstActivePokemon = this.playerSide.find((p) => p && !p.fainted);
		if (firstActivePokemon) {
			this.addToStack(new WeatherDamage(firstActivePokemon));
		}

		this.oppSide
			.filter((poke) => !!poke && !poke.fainted)
			.forEach((poke) => {
				if (poke) {
					this.addToStack(new EndTurnChecks(poke));
				}
			});
		this.playerSide
			.filter((poke) => !!poke && !poke.fainted)
			.forEach((poke) => {
				if (poke) {
					this.addToStack(new EndTurnChecks(poke));
				}
			});

		actions.forEach((action) => {
			this.addToStack(action);
		});

		// this.turnHistory.push(new TurnHistory(this.turnCount, action.initiator, action.type, action.type === ActionType.ATTACK ?
		//     action.move?.name : undefined));
		// this.turnHistory.push(new TurnHistory(this.turnCount, this.opponent, opponentAction.type, action.type === ActionType.ATTACK ?
		//     opponentAction?.move?.name : undefined));
		this.playerTurnActions = [];
		this.opponentTurnActions = [];
		this.turnPhases.set(TurnPhase.MAIN);

		this.executeAction(this.actionStack.pop());
	}

	sortActions(
		playerActions: ActionV2Interface[],
		opponentActions: ActionV2Interface[]
	): ActionV2Interface[] {
		// rules :
		// - run first
		// - switch actions first, fastest first
		// - item first, player first
		// - attack, speed order
		const actions: ActionV2Interface[] = [];

		// Player can run only if wild
		const playerRun = playerActions.find((action) => action.type === ActionType.RUN);
		const playerSwitches = playerActions.filter((action) => action.type === ActionType.SWITCH);
		const playerItems = playerActions.filter((action) => action.type === ActionType.ITEM);
		const playerAttacks = playerActions.filter((action) => action.type === ActionType.ATTACK);

		// Opponent cannot run
		const opponentSwitches = opponentActions.filter((action) => action.type === ActionType.SWITCH);
		const opponentItems = opponentActions.filter((action) => action.type === ActionType.ITEM);
		const opponentAttacks = opponentActions.filter((action) => action.type === ActionType.ATTACK);

		let attacks = playerAttacks.concat(opponentAttacks);
		let switches = playerSwitches.concat(opponentSwitches);
		let items = playerItems.concat(opponentItems);

		switches = switches.sort((a, b) => {
			return a.initiator.battleStats.speed - b.initiator.battleStats.speed;
		});
		items = items.sort((a, b) => {
			return a.initiator.battleStats.speed - b.initiator.battleStats.speed;
		});
		attacks = attacks.sort((a, b) => {
			const priorityA = (a as Attack).move?.priority || 0;
			const priorityB = (b as Attack).move?.priority || 0;
			if (priorityA !== priorityB) {
				return priorityA - priorityB;
			}
			return a.initiator.battleStats.speed - b.initiator.battleStats.speed;
		});

		actions.push(...attacks);
		actions.push(...items);
		actions.push(...switches);
		if (playerRun !== undefined) {
			actions.push(playerRun);
		}

		return actions;
	}

	/**
	 * Action executions, recursive, until stack is empty
	 * @param action an action to execute
	 */
	public executeAction(action?: ActionV2Interface) {
		this.currentAction.set(action);
		if (action !== undefined) {
			if (action.type === ActionType.END_CHECKS) {
				this.turnPhases.set(TurnPhase.END);
			}
			action.execute(this);

			const sleepTime = this.getActionDuration(action.type);
			const waitPromise = this.hasCompletionSignal(action)
				? this.waitForActionCompletion(sleepTime)
				: this.sleep(sleepTime);

			waitPromise.then(() => {
				this.executeAction(this.actionStack?.pop());
			});
		} else if (!this.events.battleEnded) {
			// no more actions, reinit
			this.prepareNewTurn();
		}
	}

	/**
	 * Execute a single action sequentially (awaitable).
	 * Used for initial ability processing where we need to wait for each action.
	 */
	public async executeActionSequential(action?: ActionV2Interface): Promise<void> {
		if (!action) {
			return;
		}

		this.currentAction.set(action);
		action.execute(this);

		const sleepTime = this.getActionDuration(action.type);
		if (this.hasCompletionSignal(action)) {
			await this.waitForActionCompletion(sleepTime);
		} else {
			await this.sleep(sleepTime);
		}
	}

	private prepareNewTurn() {
		this.turnPhases.set(TurnPhase.UPKEEP);
		this.isPlayerTurn.set(true);
		this.actionIdx = this.playerSide.findIndex((poke) => !!poke && !poke.fainted);
		this.currentMessage.set(`What should ${this.playerSide[this.actionIdx]?.name} do?`);
	}

	public triggerInitialSwitchIn(): void {
		// Collect ALL active Pokemon from both sides (handles 1v1, 2v2, etc.)
		const playerActives = this.playerSide.filter((p): p is PokemonInstance => !!p && !p.fainted);
		const oppActives = this.oppSide.filter((p): p is PokemonInstance => !!p && !p.fainted);

		const activePokemon: { pokemon: PokemonInstance; isPlayer: boolean }[] = [];

		for (const pokemon of playerActives) {
			activePokemon.push({ pokemon, isPlayer: true });
		}

		for (const pokemon of oppActives) {
			activePokemon.push({ pokemon, isPlayer: false });
		}

		// Sort by speed - slowest first so fastest ends up on top of LIFO stack
		activePokemon.sort((a, b) => a.pokemon.battleStats.speed - b.pokemon.battleStats.speed);

		for (const { pokemon, isPlayer } of activePokemon) {
			// Target is first opponent on the other side
			const target = isPlayer ? oppActives[0] : playerActives[0];
			this.runAbilityEvent(AbilityTrigger.ON_SWITCH_IN, pokemon, target);
			this.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, pokemon, { opponent: target });
		}
	}

	public async processInitialAbilityActions(): Promise<void> {
		while (!this.actionStack.isEmpty()) {
			const action = this.actionStack.pop();
			await this.executeActionSequential(action);
		}
		this.prepareNewTurn();
	}

	public runAbilityEvent<T>(
		event: AbilityTrigger,
		pokemon: PokemonInstance,
		target?: PokemonInstance,
		...args: unknown[]
	): T | undefined {
		return this.abilityEngine.runEvent<T>(event, pokemon, this, target, ...args);
	}

	public runAbilityEventForAll(
		event: AbilityTrigger,
		side: 'ally' | 'opponent' | 'all',
		...args: unknown[]
	): void {
		let pokemons: PokemonInstance[] = [];
		if (side === 'ally') {
			pokemons = this.playerSide.filter((p): p is PokemonInstance => !!p && !p.fainted);
		} else if (side === 'opponent') {
			pokemons = this.oppSide.filter((p): p is PokemonInstance => !!p && !p.fainted);
		} else {
			pokemons = [...this.playerSide, ...this.oppSide].filter(
				(p): p is PokemonInstance => !!p && !p.fainted
			);
		}

		this.abilityEngine.runEventForAll(event, pokemons, this, undefined, ...args);
	}

	public runItemEvent<T>(
		trigger: HeldItemTrigger,
		pokemon: PokemonInstance,
		extraCtx: Partial<ItemContext> = {}
	): T | undefined {
		return this.itemEngine.runItemEvent<T>(trigger, {
			pokemon,
			battleCtx: this,
			...extraCtx
		});
	}

	public addToStack(action: ActionV2Interface) {
		this.actionStack.push(action);
	}

	public clearStack() {
		this.actionStack.clear();
	}

	public calculateTypeEffectiveness(type: string, types: string[]) {
		return (
			types?.reduce((acc, type2) => {
				const effectiveness = this.fromTypeChart(type, type2);
				return acc * effectiveness;
			}, 1) || 1
		);
	}

	private selectOpponentAction(poke?: PokemonInstance): ActionV2Interface | undefined {
		if (!poke || poke.fainted) return undefined;

		if (this.settings.difficulty === 'NORMAL') {
			// Random AI: pick a random move with a random valid target
			const move = poke.moves[Math.floor(Math.random() * poke.moves.length)];
			const found = this.getPossibleTargets(poke, move);
			if (found.selectOne) {
				const idx = Math.floor(Math.random() * found.slots.length);
				return new Attack(move, [found.slots[idx]], poke);
			}
			return new Attack(move, found.slots, poke);
		}

		// Smart AI: threat-scoring system
		return BattleAI.selectAction(poke, this, 'balanced');
	}

	public findBestPokemon(
		monsters: PokemonInstance[],
		playerPokemon?: PokemonInstance
	): PokemonInstance | undefined {
		// find a poke which have a type that is strong against playerPokemon
		return monsters.find((poke) => {
			return (
				!poke.fainted &&
				!this.oppSide.includes(poke) &&
				poke.types.some((type) => playerPokemon?.weaknesses.includes(type))
			);
		});
	}

	// TODO : could be in the remove HP action
	public checkFainted(target: PokemonInstance, initiator: PokemonInstance): ActionV2Interface[] {
		const actions: ActionV2Interface[] = [];
		if (isNaN(target.currentHp) || target.currentHp <= 0) {
			target.currentHp = 0;

			target.fainted = true;
			target.status = undefined;
			target.resetBattleStats();

			// remove target attack from stack
			this.actionStack.stack = this.actionStack.stack.filter((action: ActionV2Interface) => {
				return !(action.initiator === target);
			});

			// Redirect to another target if double and other side length > 1
			if (this.battleType === BattleType.DOUBLE) {
				const targetSide: 'player' | 'opponent' = this.playerSide.includes(target)
					? 'player'
					: 'opponent';
				const sideArray = targetSide === 'player' ? this.playerSide : this.oppSide;
				const targetIdx = sideArray.indexOf(target);

				this.actionStack.stack = this.actionStack.stack.filter((action: ActionV2Interface) => {
					if (action.type === ActionType.ATTACK) {
						const attack = action as Attack;
						const targetsThis = attack.target.some(
							(slot) => slot.side === targetSide && slot.index === targetIdx
						);
						if (targetsThis) {
							const newIdx = sideArray.findIndex(
								(poke, idx) => idx !== targetIdx && !!poke && !poke.fainted
							);
							if (newIdx !== -1) {
								attack.target = attack.target.map((slot) =>
									slot.side === targetSide && slot.index === targetIdx
										? { side: targetSide, index: newIdx }
										: slot
								);
								return true;
							}
							return false;
						}
					}
					return true;
				});
			}

			// .filter(action => {
			//     return !(action.type === ActionType.ATTACK && (action as Attack).target.includes(target));
			// });

			if (this.oppSide.includes(target)) {
				this.events.opponentPokemonFaint.set(target);
				const baseXp = EXPERIENCE_CHART.howMuchIGet(
					target,
					this.participants.size,
					!this.isWild,
					this.settings.xpShare
				);
				const xpBonus = this.player.getMasteryBonus(MasteryType.XP);
				const xp = Math.floor(baseXp * (1 + xpBonus / 100));

				// Grant trainer mastery XP
				this.player.playerMasteries.addExp(xp);

				const evBonus = this.player.getMasteryBonus(MasteryType.EV);

				if (this.settings.xpShare) {
					const nonParticipants = this.player.monsters.filter(
						(monster: PokemonInstance) => !this.participants.has(monster)
					);

					if (nonParticipants.length > 0) {
						const npXp = Math.floor(xp / 2);
						for (const nParticipant of nonParticipants) {
							if (!nParticipant.fainted) {
								let finalNpXp = npXp;
								if (nParticipant.heldItem?.name === 'Lucky Egg') {
									finalNpXp = Math.floor(npXp * 1.5);
								}
								actions.push(new XPWin(nParticipant, finalNpXp, evBonus));
							}
						}
						actions.push(
							new Message(`The others received ${npXp} experience via XP-Share!`, initiator)
						);
					}
				}

				for (const participant of this.participants) {
					if (!participant.fainted) {
						let finalXp = xp;
						if (participant.heldItem?.name === 'Lucky Egg') {
							finalXp = Math.floor(xp * 1.5);
						}
						actions.push(new XPWin(participant, finalXp, evBonus));
						actions.push(
							new Message(`${participant.name} gets ${finalXp} experience!`, participant)
						);
					}
				}
			} else {
				this.events.playerPokemonFaint.set(target);
			}

			actions.push(new Message(target.name + ' fainted!', initiator));
		}
		return actions;
	}

	public fromTypeChart(type1: string, type2: string): number {
		return typeChart[type1.toLowerCase() as PokemonType][type2.toLowerCase() as PokemonType];
	}

	public getPokemonSide(pokemon: PokemonInstance): 'ally' | 'opponent' {
		return this.playerSide.includes(pokemon) ? 'ally' : 'opponent';
	}

	public getPossibleTargets(
		initiator: PokemonInstance,
		move: Move
	): { slots: TargetSlot[]; displayTargets: PokemonInstance[]; selectOne: boolean } {
		let possibleTargets: PokemonInstance[] = [];
		let selectOne = false;

		if (initiator) {
			let currentSide = this.getPokemonSide(initiator) === 'ally' ? this.playerSide : this.oppSide;
			let opponentSide = this.getPokemonSide(initiator) === 'ally' ? this.oppSide : this.playerSide;
			currentSide = currentSide.filter((poke) => !!poke && !poke.fainted);
			opponentSide = opponentSide.filter((poke) => !!poke && !poke.fainted);

			if (move.target === 'all-opponents') {
				possibleTargets = opponentSide as PokemonInstance[];
			} else if (move.target === 'all-allies') {
				// no matching move for now TODO
				possibleTargets = currentSide as PokemonInstance[];
			} else if (move.target === 'user-and-allies') {
				possibleTargets = currentSide as PokemonInstance[];
			} else if (move.target === 'random-opponent') {
				const randomTarget = opponentSide[Math.floor(Math.random() * opponentSide.length)];
				possibleTargets = randomTarget ? [randomTarget as PokemonInstance] : [];
			} else if (move.target === 'all-other-pokemon') {
				possibleTargets = ([...opponentSide, ...currentSide] as PokemonInstance[]).filter(
					(p) => p !== initiator
				);
			} else if (move.target === 'ally') {
				possibleTargets = currentSide.filter((p) => p !== initiator) as PokemonInstance[];
			} else if (move.target === 'all-pokemon') {
				possibleTargets = [...opponentSide, ...currentSide] as PokemonInstance[];
			} else if (move.target === 'user') {
				possibleTargets = [initiator];
			} else if (move.target === 'specific-move') {
				if (move.name === 'curse') {
					if (initiator.types.includes('ghost')) {
						possibleTargets = opponentSide as PokemonInstance[];
						selectOne = true;
					} else {
						possibleTargets = [initiator];
					}
				} else {
					// else (mirror-coat, counter, etc.) -> depend on who hits the user
					// need to change at runtime
					possibleTargets = [initiator];
				}
			} else if (move.target === 'user-or-ally') {
				possibleTargets = currentSide as PokemonInstance[];
				selectOne = true;
			} else if (move.target === 'selected-pokemon') {
				possibleTargets = opponentSide as PokemonInstance[];
				selectOne = true;
			}
			//else no target (fields)
		}
		selectOne = selectOne && possibleTargets.length > 1;

		const slots: TargetSlot[] = possibleTargets.map((poke) => {
			const playerIdx = this.playerSide.indexOf(poke);
			if (playerIdx !== -1) {
				return { side: 'player' as const, index: playerIdx };
			}
			const oppIdx = this.oppSide.indexOf(poke);
			return { side: 'opponent' as const, index: oppIdx };
		});

		return { slots, displayTargets: possibleTargets, selectOne };
	}
}
