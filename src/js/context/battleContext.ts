import { BattleEvents, BattleResult, BattleType, TurnHistory, TurnPhase, typeChart } from "../battle/battle-model";
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

    opponentTurnActions: ActionV2Interface[] = [];
    playerTurnActions: ActionV2Interface[] = [];
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

    constructor(player: Player, opponent: PokemonInstance | Character, settings: Settings, battleType: BattleType = BattleType.SINGLE) {
        this.player = player;
        this.opponent = opponent;
        this.settings = settings;
        this.events = new BattleEvents();
        this.battleType = battleType;
        //this.playerPokemon = this.player.monsters.find(poke => !poke.fainted) || this.player.monsters[0];
        //this.opponentPokemon = opponent instanceof PokemonInstance ? opponent : (opponent as Player).monsters.find(poke => !poke.fainted) || (opponent as Player).monsters[0];
        let teamSize = 1;
        if(battleType === BattleType.DOUBLE && opponent instanceof NPC) {
            teamSize = 2;   
        }

        this.playerSide = this.player.monsters.filter(poke => !poke.fainted).slice(0, teamSize);

        if(opponent instanceof PokemonInstance) {
            this.oppSide = [opponent];
        }else {
            this.oppSide = (opponent as Player).monsters.filter(poke => !poke.fainted).slice(0, teamSize);
        }
        console.log('DEBUG, player side : ', this.playerSide);
        console.log('DEBUG, opp side : ', this.oppSide);

        if(this.playerSide?.length !== teamSize || this.oppSide?.length !== teamSize) {
            throw new Error('Not enough pokemons to start the battle');
        }

        this.playerSide?.filter(poke => !!poke && !poke.fainted).forEach(poke => this.participants.add(poke));
        this.prepareNewTurn();
    }

    setPlayerAction(action: ActionV2Interface) {
        this.playerTurnActions.push(action);
        
        if(this.actionIdx !== this.playerSide.length - 1) {
            this.actionIdx++;
            this.currentMessage.set(`What should ${this.playerSide[this.actionIdx]?.name} do ?`);
        }

        if(this.playerTurnActions.length === this.playerSide.length) {
            this.startTurn();
        }
    }

    cancelLastAction(){
        if(this.playerTurnActions.length > 0) {
            this.playerTurnActions.pop();
            this.actionIdx--;
            this.currentMessage.set(`What should ${this.playerSide[this.actionIdx]?.name} do ?`);
        }
    }

    startTurn(){
        this.isPlayerTurn.set(false);
        this.actionIdx = 0;
        this.turnCount++;
        this.turnPhases.set(TurnPhase.UPKEEP);

        this.oppSide.filter(poke => !!poke && !poke.fainted).forEach(poke => {
            let oppAction = this.selectOpponentAction(poke);
            this.opponentTurnActions.push(oppAction);
        });

        let actions = this.sortActions(this.playerTurnActions, this.opponentTurnActions);
        
        this.oppSide.filter(poke => !!poke && !poke.fainted).forEach(poke => {
            this.addToStack(new EndTurnChecks(poke));
        });
        this.playerSide.filter(poke => !!poke && !poke.fainted).forEach(poke => {
            this.addToStack(new EndTurnChecks(poke));
        });

        actions.forEach(action => {
            this.addToStack(action);
        });

        // this.turnHistory.push(new TurnHistory(this.turnCount, action.initiator, action.type, action.type === ActionType.ATTACK ?
        //     action.move?.name : undefined));
        // this.turnHistory.push(new TurnHistory(this.turnCount, this.opponent, opponentAction.type, action.type === ActionType.ATTACK ?
        //     opponentAction?.move?.name : undefined));
        this.playerTurnActions = [];
        this.opponentTurnActions = [];
        this.turnPhases.set(TurnPhase.MAIN);

        console.log('DEBUG, stack : ', this.actionStack.stack);

        this.executeAction(this.actionStack.pop());
    }

    sortActions(playerActions: ActionV2Interface[], opponentActions: ActionV2Interface[]): ActionV2Interface[] {
        // rules : 
        // - run first
        // - switch actions first, fastest first
        // - item first, player first
        // - attack, speed order
        let actions: ActionV2Interface[] = [];

        // Player can run only if wild
        let playerRun = playerActions.find(action => action.type === ActionType.RUN);
        let playerSwitches = playerActions.filter(action => action.type === ActionType.SWITCH);
        let playerItems = playerActions.filter(action => action.type === ActionType.ITEM);
        let playerAttacks = playerActions.filter(action => action.type === ActionType.ATTACK);

        // Opponent cannot run
        let opponentSwitches = opponentActions.filter(action => action.type === ActionType.SWITCH);
        let opponentItems = opponentActions.filter(action => action.type === ActionType.ITEM);
        let opponentAttacks = opponentActions.filter(action => action.type === ActionType.ATTACK);

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
            return a.initiator.battleStats.speed - b.initiator.battleStats.speed;
        });

    
        actions.push(...attacks);
        actions.push(...items);
        actions.push(...switches);
        if(playerRun !== undefined){
            actions.push(playerRun);
        }

        return actions;
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
            action.execute(this);

            // TODO wait for input ? (or settings, auto/manual)
            let sleepTime = 800;
            switch (action.type) {
                case ActionType.ATTACK:
                    sleepTime = 1600;
                    break;
                case ActionType.SWITCH:
                    sleepTime = 2000;
                    break;
                case ActionType.MESSAGE:
                    sleepTime = 1000;
                    break;
                case ActionType.XP_WIN:
                    sleepTime = 500;
                    break;
                case ActionType.LEVEL_UP:
                    sleepTime = 1000;
                    break;
                case ActionType.PLAY_ANIMATION:
                    sleepTime = 2000;
                    break;
                default:
                    break;
            }

            this.sleep(sleepTime).then(
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
        this.currentMessage.set(`What should ${this.playerSide[this.actionIdx]?.name} you do ?`);
    }

    public addToStack(action: ActionV2Interface) {
        this.actionStack.push(action);
    }

    public clearStack() {
        this.actionStack.clear();
    }

    // TODO : Should be in NPC (trainer extends NPC ?) class
    private selectOpponentAction(poke: PokemonInstance): ActionV2Interface {
        // TODO : targets calculation
        let random = Math.floor(Math.random() * poke.moves.length);
        let move = poke.moves[random];
        let action: ActionV2Interface;

        if (this.settings.difficulty === 'NORMAL') {
            // random ally pokemon
            let randomAlly = this.playerSide.filter(poke => !!poke && !poke.fainted);
            if(randomAlly?.length > 0){
                action = new Attack(move, randomAlly[0], poke);
            }
        } else {

            let previousTurn = this.turnHistory.findLast((turn: TurnHistory) => turn.turn < this.turnCount && turn.initiator === poke && turn.actionType === 'Attack');
            if (previousTurn) {
                //let previousMove = previousTurn.move;
                // need more infos on the move (is it a stat boost...) TODO
            }

            // find a move that is strong against a pokemon from playerSide
            // check first 
            let target = this.playerSide[0];

            let matchTargetTypes = target?.types.length === 2 ?
                poke.moves.find((move: Move) => move.type === target?.types[0] && move.power > 0) :
                poke.moves.find((move: Move) => (move.type === target?.types[0] || move.type === target?.types[1]) && move.power > 0);

            if(!matchTargetTypes && this.playerSide.length > 1) {
                target = this.playerSide[1];
                matchTargetTypes = target?.types.length === 2 ?
                poke.moves.find((move: Move) => move.type === target?.types[0] && move.power > 0) :
                poke.moves.find((move: Move) => (move.type === target?.types[0] || move.type === target?.types[1]) && move.power > 0);
            }

            if(target){
                if (this.opponent instanceof NPC) {
                    // is there a better poke to switch in based on types chart ?
                    let bestPoke = this.findBestPokemon(this.opponent.monsters, target)
                    if (this.isWeakAgainst(poke, target) && bestPoke) {
                        action = new Switch(poke, bestPoke, this.opponent);
                    } else if (poke.currentHp < poke.stats.hp / 4 && this.havePotions(this.opponent)) {
                        // else if low hp && bag contains potions
                        let itemId = this.opponent.bag.getPocketByCategory(27)?.[0];
                        action = new UseItem(itemId, poke, poke, this.opponent);
                    }
                    // select the best move
                    if (matchTargetTypes && matchTargetTypes.power > 0) {
                        action = new Attack(matchTargetTypes, [target], poke);
                    } else {
                        action = new Attack(move, [target], poke);
                    }

                } else {
                    // select the best move
                    if (matchTargetTypes && matchTargetTypes.power > 0) {
                        action = new Attack(matchTargetTypes, [target], poke);
                    } else {
                        action = new Attack(move, [target], poke);
                    }

                }
            }
        }
        return action;
    }

    public findBestPokemon(monsters: PokemonInstance[], playerPokemon?: PokemonInstance): PokemonInstance | undefined {
        // find a poke which have a type that is strong against playerPokemon
        return monsters.find(poke => {
            !poke.fainted &&
            !this.oppSide.includes(poke) &&
                poke.types.some(type => playerPokemon?.weaknesses.includes(type));
        });
    }

    private havePotions(opponent: NPC) {
        return Object.keys(opponent.bag?.potions)?.length > 0 && Object.values(opponent.bag?.potions)?.length > 0;
    }

    private isWeakAgainst(opponentPokemon: PokemonInstance, playerPokemon?: PokemonInstance) {
        return opponentPokemon.weaknesses.some(type => playerPokemon?.types.includes(type));
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

            // Redirect to another target if double and other side length > 1
            if(this.battleType === BattleType.DOUBLE){
                let actionsWithTarget  = this.actionStack.stack.filter((action: ActionV2Interface) => {
                    return !(action.type === ActionType.ATTACK && (action as Attack).target.includes(target));
                });
                actionsWithTarget.forEach(action => {
                    if(action.type === ActionType.ATTACK) {
                        let attack = action as Attack;
                        let targetSide = this.getPokemonSide(target) === 'ally' ? this.playerSide : this.oppSide;

                        if(attack.target.includes(target)) {
                            let newTarget = targetSide.find(poke => !!poke && poke !== target);
                            if(newTarget) {
                                attack.target = [newTarget];
                            }else{
                                // remove from stack
                                this.actionStack.stack = this.actionStack.stack.filter(action => action !== attack)
                            }
                        }
                    }
                });
            }
            
            // .filter(action => {
            //     return !(action.type === ActionType.ATTACK && (action as Attack).target.includes(target));
            // });

            if (this.oppSide.includes(target)) {
                this.events.opponentPokemonFaint.set(target);
                let xp = EXPERIENCE_CHART.howMuchIGet(target, this.participants.size, !this.isWild, this.settings.xpShare);

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
                this.events.playerPokemonFaint.set(target);
            }

            actions.push(new Message(target.name + ' fainted!', initiator));
        }
        return actions;
    }

    public fromTypeChart(type1: string, type2: string): number {
        //@ts-ignore
        return typeChart[type1.toLowerCase()][type2.toLowerCase()] as number;
    }

    public getPokemonSide(pokemon: PokemonInstance): 'ally' | 'opponent' {
        return this.playerSide.includes(pokemon) ? 'ally' : 'opponent';
    }

}