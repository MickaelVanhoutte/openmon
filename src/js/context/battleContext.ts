import { BattleEvents, BattleResult, TurnHistory, TurnPhase, typeChart } from "../battle/battle-model";
import { Move, PokemonInstance } from "../pokemons/pokedex";
import { Player } from "../characters/player";
import { type Character } from "../characters/characters-model";
import type { Settings } from "../characters/settings";
import { ActionStack } from "../battle/actions/action-stack";
import { NPC } from "../characters/npc";
import { writable, type Writable } from "svelte/store";
import { ActionType, type ActionV2Interface } from "../battle/actions/actions-model";
import { EXPERIENCE_CHART } from "../pokemons/experience";
import { Attack, Switch, UseItem } from "../battle/actions/actions-selectable";
import { EndTurnChecks, Message, PlayAnimation, XPWin } from "../battle/actions/actions-derived";
import { ItemsReferences } from "../items/items";

export class BattleContext {

    ITEMS = new ItemsReferences();

    turnPhases: Writable<TurnPhase> = writable(TurnPhase.UPKEEP);

    player: Player;
    opponent: PokemonInstance | Character;
    playerPokemon: PokemonInstance;
    opponentPokemon: PokemonInstance;

    settings: Settings;

    events: BattleEvents;

    escapeAttempts: number = 0;
    participants: Set<PokemonInstance> = new Set<PokemonInstance>();

    actionStack: ActionStack = new ActionStack();
    turnCount: number = 0;
    turnHistory: TurnHistory[] = [];

    isPlayerTurn: Writable<boolean> = writable(true);
    currentAction: Writable<ActionV2Interface | undefined> = writable(undefined);
    currentMessage: Writable<String | undefined> = writable(undefined);

    public battleResult: BattleResult = new BattleResult(false);
    sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    get isWild() {
        return this.opponent instanceof PokemonInstance;
    }

    constructor(player: Player, opponent: PokemonInstance | Character, settings: Settings) {
        this.player = player;
        this.opponent = opponent;
        this.settings = settings;
        this.events = new BattleEvents();

        this.playerPokemon = this.player.monsters.find(poke => !poke.fainted) || this.player.monsters[0];
        this.opponentPokemon = opponent instanceof PokemonInstance ? opponent : (opponent as Player).monsters.find(poke => !poke.fainted) || (opponent as Player).monsters[0];

        this.participants.add(this.playerPokemon);
        this.prepareNewTurn();
    }

    startTurn(action: ActionV2Interface) {
        this.isPlayerTurn.set(false);
        this.turnCount++;
        this.turnPhases.set(TurnPhase.UPKEEP);

        let opponentAction = this.selectOpponentAction();

        // who's the fastest ?
        let playerSpeed = this.playerPokemon.battleStats.speed;
        let opponentSpeed = this.opponentPokemon.battleStats.speed;

        // end turn actions
        this.addToStack(new EndTurnChecks(this.opponentPokemon));
        this.addToStack(new EndTurnChecks(this.playerPokemon));

        if (action.type === ActionType.ITEM || action.type === ActionType.RUN) {
            this.addToStack(opponentAction);
            // we pop from list, player starts first
            this.addToStack(action);
        } else if (playerSpeed > opponentSpeed) {
            this.addToStack(opponentAction);
            this.addToStack(action);
        } else if (playerSpeed < opponentSpeed) {
            this.addToStack(action);
            this.addToStack(opponentAction);
        } else {
            // random order
            let random = Math.random() >= 0.5;
            if (random) {
                this.addToStack(opponentAction);
                this.addToStack(action);
            } else {
                this.addToStack(action);
                this.addToStack(opponentAction);
            }
        }
        this.turnHistory.push(new TurnHistory(this.turnCount, action.initiator, action.type, action.type === ActionType.ATTACK ?
            action.move?.name : undefined));
        this.turnHistory.push(new TurnHistory(this.turnCount, this.opponent, opponentAction.type, action.type === ActionType.ATTACK ?
            opponentAction?.move?.name : undefined));

        this.turnPhases.set(TurnPhase.MAIN);

        this.executeAction(this.actionStack.pop());
    }

    /**
     * Action executions, recursive, until stack is empty
     * @param action an action to execute
     */
    private executeAction(action?: ActionV2Interface) {
        this.currentAction.set(action);
        console.log('DEBUG, stack : ', this.actionStack.stack);
        if (action !== undefined) {

            if (action.type === ActionType.END_CHECKS) {
                this.turnPhases.set(TurnPhase.END);
            }

            //console.log('executing ' + action?.type, action);
            action.execute(this);

            // TODO wait for input ? (or settings, auto/manual)
            this.sleep(action instanceof PlayAnimation ? 1600 : 800).then(
                () => {
                    this.executeAction(this.actionStack?.pop());
                }
            );
        } else if (!this.events.battleEnded) {
            // no more actions, reinit
            this.prepareNewTurn();
        }
    }

    private prepareNewTurn() {
        this.turnPhases.set(TurnPhase.UPKEEP);
        this.isPlayerTurn.set(true);
        this.currentMessage.set(`What should ${this.playerPokemon.name} do ?`);
    }

    public addToStack(action: ActionV2Interface) {
        this.actionStack.push(action);
    }

    public clearStack() {
        this.actionStack.clear();
    }

    // TODO : Should be in NPC (trainer extends NPC ?) class
    private selectOpponentAction(): ActionV2Interface {
        let random = Math.floor(Math.random() * this.opponentPokemon.moves.length);
        let move = this.opponentPokemon.moves[random];
        let action: ActionV2Interface;

        if (this.settings.difficulty === 'NORMAL') {
            action = new Attack(move, 'ally', this.opponentPokemon);
        } else {

            let previousTurn = this.turnHistory.findLast((turn: TurnHistory) => turn.turn < this.turnCount && turn.initiator === this.opponentPokemon && turn.actionType === 'Attack');
            if (previousTurn) {
                //let previousMove = previousTurn.move;
                // need more infos on the move (is it a stat boost...) TODO
            }


            let matchTargetTypes = this.playerPokemon?.types.length === 2 ?
                this.opponentPokemon.moves.find((move: Move) => move.type === this.playerPokemon.types[0] && move.power > 0) :
                this.opponentPokemon.moves.find((move: Move) => (move.type === this.playerPokemon.types[0] || move.type === this.playerPokemon.types[1]) && move.power > 0);


            if (this.opponent instanceof NPC) {
                // is there a better poke to switch in based on types chart ?
                let bestPoke = this.findBestPokemon(this.opponent.monsters, this.playerPokemon)
                if (this.isWeakAgainst(this.opponentPokemon, this.playerPokemon) && bestPoke) {
                    action = new Switch(bestPoke, this.opponent);
                } else if (this.opponentPokemon.currentHp < this.opponentPokemon.stats.hp / 4 && this.havePotions(this.opponent)) {
                    // else if low hp && bag contains potions
                    let itemId = this.opponent.bag.getPocketByCategory(27)?.[0];
                    action = new UseItem(itemId, this.opponentPokemon, this.opponentPokemon, this.opponent);
                }
                // select the best move
                if (matchTargetTypes && matchTargetTypes.power > 0) {
                    action = new Attack(matchTargetTypes, 'ally', this.opponentPokemon);
                } else {
                    action = new Attack(move, 'ally', this.opponentPokemon);
                }

            } else {
                // select the best move
                if (matchTargetTypes && matchTargetTypes.power > 0) {
                    action = new Attack(matchTargetTypes, 'ally', this.opponentPokemon);
                } else {
                    action = new Attack(move, 'ally', this.opponentPokemon);
                }

            }
        }
        //console.log('opponent action', action);
        return action;
    }

    public findBestPokemon(monsters: PokemonInstance[], playerPokemon: PokemonInstance): PokemonInstance | undefined {
        // find a poke which have a type that is strong against playerPokemon
        return monsters.find(poke => {
            !poke.fainted &&
                poke.types.some(type => playerPokemon.weaknesses.includes(type));
        });
    }

    private havePotions(opponent: NPC) {
        return Object.keys(opponent.bag?.potions)?.length > 0 && Object.values(opponent.bag?.potions)?.length > 0;
    }

    private isWeakAgainst(opponentPokemon: PokemonInstance, playerPokemon: PokemonInstance) {
        return opponentPokemon.weaknesses.some(type => playerPokemon.types.includes(type));
    }

    // TODO : could be in the remove HP action
    public checkFainted(target: PokemonInstance, initiator: PokemonInstance): ActionV2Interface[] {
        let actions: ActionV2Interface[] = [];
        if (target.currentHp <= 0) {
            target.currentHp = 0;

            target.fainted = true;
            target.status = undefined;
            target.resetBattleStats();

            //console.log(target.name + ' fainted!', initiator);

            // remove target attack from stack
            this.actionStack.stack = this.actionStack.stack.filter((action: ActionV2Interface) => {
                return !(action.initiator === target);
            });

            if (target === this.opponentPokemon) {
                this.events.opponentPokemonFaint.set(target);
                let xp = EXPERIENCE_CHART.howMuchIGet(this.playerPokemon, target, this.participants.size, !this.isWild, this.settings.xpShare);

                if (this.settings.xpShare) {
                    let nonParticipants = this.player.monsters.filter((monster: PokemonInstance) => !this.participants.has(monster));

                    if (nonParticipants.length > 0) {
                        let npXp = Math.floor(xp / 2);
                        for (let nParticipant of nonParticipants) {
                            if (!nParticipant.fainted) {
                                actions.push(new XPWin(nParticipant, npXp));
                            }
                        }
                        actions.push(new Message(`The others received ${npXp} experience via XP-Share!`, initiator));
                    }
                }

                for (let participant of this.participants) {
                    if (!participant.fainted) {
                        actions.push(new XPWin(participant, xp));
                        actions.push(new Message(`${participant.name} gets ${xp} experience!`, participant));
                    }
                }

            } else {
                this.events.playerPokemonFaint.set(this.playerPokemon);
            }

            actions.push(new Message(target.name + ' fainted!', initiator));
        }
        return actions;
    }

    public fromTypeChart(type1: string, type2: string): number {
        //@ts-ignore
        return typeChart[type1.toLowerCase()][type2.toLowerCase()] as number;
    }

}