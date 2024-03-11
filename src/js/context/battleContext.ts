import {BattleEvents, BattleResult, TurnHistory, typeChart} from "../battle/battle-model";
import {Move, PokemonInstance} from "../pokemons/pokedex";
import {type Character, Player} from "../characters/player";
import type {Settings} from "../characters/settings";
import {ActionStack} from "../battle/actions/action-stack";
import {NPC} from "../characters/npc";
import {writable, type Writable} from "svelte/store";
import {ActionType, type ActionV2Interface} from "../battle/actions/actions-model";
import {EXPERIENCE_CHART} from "../pokemons/experience";
import {Attack, Switch, UseItem} from "../battle/actions/actions-selectable";
import {EndTurnChecks, Message, XPWin} from "../battle/actions/actions-derived";

export class BattleContext {

    turnPhases = {
        upkeep: false,
        main: false,
        end: false,
    }

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

    constructor(player: Player, opponent: PokemonInstance | Character, settings: Settings, events: BattleEvents) {
        this.player = player;
        this.opponent = opponent;
        this.settings = settings;
        this.events = events;

        this.playerPokemon = this.player.monsters.find(poke => !poke.fainted) || this.player.monsters[0];
        this.opponentPokemon = opponent instanceof PokemonInstance ? opponent : (opponent as Player).monsters.find(poke => !poke.fainted) || (opponent as Player).monsters[0];

        this.participants.add(this.playerPokemon);
        this.prepareNewTurn();
    }

    startTurn(action: ActionV2Interface) {
        this.isPlayerTurn.set(false);
        this.turnCount++;
        this.turnPhases.upkeep = true;
        this.turnPhases.main = false;
        this.turnPhases.end = false;

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

        this.turnPhases.upkeep = false;
        this.turnPhases.main = true;

        this.executeAction(this.actionStack.pop());
    }

    /**
     * Action executions, recursive, until stack is empty
     * @param action an action to execute
     */
    private executeAction(action?: ActionV2Interface) {
        this.currentAction.set(action);
        if (action !== undefined) {

            if (!this.turnPhases.end && action.type === ActionType.END_CHECKS) {
                this.turnPhases.main = false;
                this.turnPhases.end = true;
            }

            console.log('executing ' + action?.type, action);
            console.log(this.playerPokemon.currentHp);
            action.execute(this);

            // TODO wait for input ? (or settings, auto/manual)
            this.sleep(1000).then(
                () => {
                    this.executeAction(this.actionStack?.pop());
                }
            );
        } else {
            // no more actions, reinit
            this.prepareNewTurn();
        }
    }

    private prepareNewTurn() {
        this.turnPhases.upkeep = false;
        this.turnPhases.main = false;
        this.turnPhases.end = false;
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

        if (this.settings.difficulty === 'NORMAL') {
            return new Attack(move, 'ally', this.opponentPokemon);
        } else {

            let previousTurn = this.turnHistory.findLast((turn: TurnHistory) => turn.turn < this.turnCount && turn.initiator === this.opponentPokemon && turn.actionType === 'Attack');
            if (previousTurn) {
                let move = previousTurn.move;
                // need more infos on the move (is it a stat boost...) TODO
            }


            let matchTargetTypes = this.playerPokemon?.types.length === 2 ?
                this.opponentPokemon.moves.find((move: Move) => move.type === this.playerPokemon.types[0] && move.power > 0) :
                this.opponentPokemon.moves.find((move: Move) => (move.type === this.playerPokemon.types[0] || move.type === this.playerPokemon.types[1]) && move.power > 0);


            if (this.opponent instanceof NPC) {
                // is there a better poke to switch in based on types chart ?
                let bestPoke = this.findBestPokemon(this.opponent.monsters, this.playerPokemon)
                if (this.isWeakAgainst(this.opponentPokemon, this.playerPokemon) && bestPoke) {
                    return new Switch(bestPoke, this.opponent);
                } else if (this.opponentPokemon.currentHp < this.opponentPokemon.stats.hp / 4 && this.havePotions(this.opponent)) {
                    // else if low hp && bag contains potions
                    let itemId = this.opponent.bag.getPocketByCategory(27)?.[0];
                    return new UseItem(itemId, this.opponentPokemon, this.opponentPokemon, this.opponent);
                }
                // select the best move
                if (matchTargetTypes && matchTargetTypes.power > 0) {
                    return new Attack(matchTargetTypes, 'ally', this.opponentPokemon);
                } else {
                    return new Attack(move, 'ally', this.opponentPokemon);
                }

            } else {
                // select the best move
                if (matchTargetTypes && matchTargetTypes.power > 0) {
                    return new Attack(matchTargetTypes, 'ally', this.opponentPokemon);
                } else {
                    return new Attack(move, 'ally', this.opponentPokemon);
                }

            }
        }
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
    public checkFainted(target: PokemonInstance, initiator: PokemonInstance) {
        if (target.currentHp <= 0) {
            target.currentHp = 0;
            target.fainted = true;
            target.status = undefined;
            target.resetBattleStats();

            // remove target attack from stack
            this.actionStack.stack = this.actionStack.stack.filter((action: ActionV2Interface) => {
                return !(action.type === ActionType.ATTACK && action.initiator === target);
            });

            if (target === this.opponentPokemon) {
                let xp = EXPERIENCE_CHART.howMuchIGet(initiator, target, this.participants.size, !this.isWild, this.settings.xpShare);

                if (this.settings.xpShare) {
                    let nonParticipants = this.player.monsters.filter((monster: PokemonInstance) => !this.participants.has(monster));

                    if (nonParticipants.length > 0) {
                        let npXp = Math.floor(xp / 2);
                        for (let nParticipant of nonParticipants) {
                            if (!nParticipant.fainted) {
                                this.addToStack(new XPWin(nParticipant, npXp));
                            }
                        }
                        this.addToStack(new Message(`The others received ${xp / 2} experience via XP-Share!`, initiator));
                    }
                }

                for (let participant of this.participants) {
                    if (!participant.fainted) {
                        this.addToStack(new XPWin(participant, xp));
                        this.addToStack(new Message(`${participant.name} gets ${xp} experience!`, participant));
                    }
                }

            }

            this.addToStack(new Message(target.name + ' fainted!', initiator));
        }
    }

    public fromTypeChart(type1: string, type2: string): number {
        //@ts-ignore
        return typeChart[type1.toLowerCase()][type2.toLowerCase()] as number;
    }

}