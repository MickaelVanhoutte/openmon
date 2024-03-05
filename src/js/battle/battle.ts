import "@abraham/reflection";
import type {Character} from "../characters/player";
import {Player} from "../characters/player";
import {PokemonInstance} from "../pokemons/pokedex";
import {BATTLE_STATE} from "../const";
import type {Settings} from "../characters/settings";
import type {Action} from "./actions";
import {Attack, BagObject, EndTurn, EndTurnChecks, Message, RunAway, SwitchAction, XPWin} from "./actions";
import {EXPERIENCE_CHART} from "../pokemons/experience";


export class BattleContext {
    public state?: BattleState;

    constructor(state?: BattleState) {
        this.state = state;
    }
}

export class BattleResult {
    public win: boolean;
    public caught: PokemonInstance | undefined;

    constructor(win: boolean, caught?: PokemonInstance) {
        this.win = win;
        this.caught = caught;
    }

}

export class ActionsContext {
    turnStack: Action[];
    player: Player;
    settings: Settings;
    cPlayerMons: PokemonInstance;
    opponent: Character | PokemonInstance;
    cOpponentMons: PokemonInstance;
    escapeAttempts: number = 0;
    participants: Set<PokemonInstance> = new Set<PokemonInstance>();
    currentMessage: string;
    isPlayerTurn: boolean = true;

    // Events
    public changePokemon: boolean = false;
    public opponentSwitch: boolean = false;

    public battleResult: BattleResult = new BattleResult(false);

    constructor(turnStack: Action[], player: Player, settings: Settings, cPlayerMons: PokemonInstance, opponent: Character | PokemonInstance, cOpponentMons: PokemonInstance) {
        this.turnStack = turnStack;
        this.player = player;
        this.settings = settings;
        this.cPlayerMons = cPlayerMons;
        this.opponent = opponent;
        this.cOpponentMons = cOpponentMons;
        this.participants.add(this.cPlayerMons);
        this.currentMessage = `What should ${this.cPlayerMons.name} do ?`;
    }

    get isWild(): boolean {
        return this.opponent instanceof PokemonInstance;
    }

    public addToStack(action: Action) {
        this.turnStack.push(action);
    }

    public clearStack() {
        this.turnStack = [];
    }

    public checkFainted(target: PokemonInstance, initiator: PokemonInstance) {
        if (target.currentHp <= 0) {
            target.currentHp = 0;
            target.fainted = true;
            target.status = undefined;
            target.resetBattleStats();

            // remove target attack from stack
            this.turnStack = this.turnStack.filter((action: Action) => {
                return !(action instanceof Attack && action.initiator === target);
            });

            if (target === this.cOpponentMons) {
                let xp = EXPERIENCE_CHART.howMuchIGet(initiator, target, this.participants.size, !this.isWild, this.settings.xpShare);

                if (this.settings.xpShare) {
                    let nonParticipants = this.player.monsters.filter((monster: PokemonInstance) => !this.participants.has(monster));

                    if(nonParticipants.length > 0) {
                        let npXp = Math.floor(xp / 2);
                        for (let nParticipant of nonParticipants) {
                            if (!nParticipant.fainted) {
                                this.addToStack(new XPWin(nParticipant, npXp));
                            }
                        }
                        this.addToStack(new Message(`The others received ${xp/2} experience via XP-Share!`, initiator));
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

    public onClose: (result: BattleResult) => void = () => {
    };

    public onPokemonChange: () => void = () => {
    };

    public forceChangePokemon: () => void = () => {
        this.changePokemon = true;
    };

}

export class BattleState {


    // for transition animation
    public starting = true;
    public ending = false;
    public pokemonsAppearing = false;

    public actCTx: ActionsContext;

    public onClose: (result: BattleResult) => void = () => {
    };

    public onPokemonChange: () => void = () => {
    };

    constructor(player: Player, opponent: Character | PokemonInstance, settings: Settings) {

        let opponentCurrentMonster = opponent instanceof PokemonInstance ? opponent as PokemonInstance : (opponent as Player).monsters[0];
        let playerCurrentMonster = player.monsters.find((monster: PokemonInstance) => !monster.fainted) || player.monsters[0];

        this.actCTx = new ActionsContext([], player, settings, playerCurrentMonster, opponent, opponentCurrentMonster);

        this.actCTx.onClose = (result: BattleResult) => {
            this.ending = true;
            this.onClose(result);
        };
        this.actCTx.onPokemonChange = () => {
            this.onPokemonChange();
        }

    }

    /**
     * Turn start
     * @param action the user selected action
     */
    public selectAction(action: Action) {
        this.actCTx.isPlayerTurn = false;

        // First action to be executed, either attack if faster (TODO: check priority moves) or switch, item, flee
        // Note actions are reversed since we pop actions out of the stack

        this.actCTx.addToStack(new EndTurn(action.initiator));

        this.actCTx.addToStack(new EndTurnChecks(this.actCTx.cOpponentMons));
        this.actCTx.addToStack(new EndTurnChecks(this.actCTx.cPlayerMons));

        if (action instanceof Attack && this.actCTx.cPlayerMons.battleStats.speed > this.actCTx.cOpponentMons.battleStats.speed
            || action instanceof RunAway
            || action instanceof SwitchAction
            || action instanceof BagObject) {
            this.selectOpponentAction();
            this.actCTx.addToStack(action);
        } else {
            this.actCTx.addToStack(action);
            this.selectOpponentAction();
        }

        this.executeAction(this.actCTx.turnStack?.pop());
    }

    sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    /**
     * Action executions, recursive, until stack is empty
     * @param action an action to execute
     */
    private executeAction(action?: Action) {
        if (action !== undefined) {

            console.log('executing ' + action?.name, action)

            action.execute(this.actCTx);

            // Update state for view
            BATTLE_STATE.set(new BattleContext(this));

            // TODO wait for input ? (or settings, auto/manual)
            this.sleep(1000).then(
                () => {
                    this.executeAction(this.actCTx.turnStack?.pop());
                }
            );
        }
    }

    private selectOpponentAction() {
        // TODO set IA from settings
        const move = this.actCTx.cOpponentMons.selectMove('Easy');
        this.actCTx.addToStack(new Attack(move, 'ally', this.actCTx.cOpponentMons));
    }
}

export class DamageResults {
    superEffective: boolean = false;
    notVeryEffective: boolean = false;
    immune: boolean = false;
    critical: boolean = false;
    effectSuccess: boolean = false;
    effectApplied: string = "";
    damages: number = 0;

    constructor() {
    }
}


export function fromTypeChart(type1: string, type2: string): number {
    // @ts-ignore
    return typeChart[type1.toLowerCase()][type2.toLowerCase()] as number;
}

export const typeChart = {
    "normal": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 0.5,
        "ghost": 0,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#a8a67c'
    },
    "fire": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 1,
        "grass": 2,
        "ice": 2,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 2,
        "rock": 0.5,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 2,
        "fairy": 1,
        color: '#e38643'
    },
    "water": {
        "normal": 1,
        "fire": 2,
        "water": 0.5,
        "electric": 1,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 2,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 2,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 1,
        "fairy": 1,
        color: '#728cc8',
    },
    "electric": {
        "normal": 1,
        "fire": 1,
        "water": 2,
        "electric": 0.5,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 0,
        "flying": 2,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 1,
        "fairy": 1,
        color: '#ecb240'
    },
    "grass": {
        "normal": 1,
        "fire": 0.5,
        "water": 2,
        "electric": 1,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 0.5,
        "ground": 2,
        "flying": 0.5,
        "psychic": 1,
        "bug": 0.5,
        "rock": 2,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#8ac262'
    },
    "ice": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 1,
        "grass": 2,
        "ice": 0.5,
        "fighting": 1,
        "poison": 1,
        "ground": 2,
        "flying": 2,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#a5d7d9'
    },
    "fighting": {
        "normal": 2,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 2,
        "fighting": 1,
        "poison": 0.5,
        "ground": 1,
        "flying": 0.5,
        "psychic": 0.5,
        "bug": 0.5,
        "rock": 2,
        "ghost": 0,
        "dragon": 1,
        "dark": 2,
        "steel": 2,
        "fairy": .5,
        color: '#d84123',
    },
    "poison": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 2,
        "ice": 1,
        "fighting": 1,
        "poison": 0.5,
        "ground": 0.5,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 0.5,
        "ghost": 0.5,
        "dragon": 1,
        "dark": 1,
        "steel": 0,
        "fairy": 2,
        color: '#8d4b9c'
    },
    "ground": {
        "normal": 1,
        "fire": 2,
        "water": 1,
        "electric": 2,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 2,
        "ground": 1,
        "flying": 0,
        "psychic": 1,
        "bug": 0.5,
        "rock": 2,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 2,
        "fairy": 1,
        color: '#b59f4b'
    },
    "flying": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 0.5,
        "grass": 2,
        "ice": 1,
        "fighting": 2,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 2,
        "rock": 0.5,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#a8d6d8'
    },
    "psychic": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 2,
        "poison": 2,
        "ground": 1,
        "flying": 1,
        "psychic": 0.5,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 1,
        "dark": 0,
        "steel": 0.5,
        "fairy": 1,
        color: '#e56289'
    },
    "bug": {
        "normal": 1,
        "fire": 0.5,
        "water": 1,
        "electric": 1,
        "grass": 2,
        "ice": 1,
        "fighting": 0.5,
        "poison": 0.5,
        "ground": 1,
        "flying": 0.5,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 0.5,
        "dragon": 1,
        "dark": 2,
        "steel": 0.5,
        "fairy": .5,
        color: '#d8de57'
    },
    "rock": {
        "normal": 1,
        "fire": 2,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 2,
        "fighting": 0.5,
        "poison": 1,
        "ground": 0.5,
        "flying": 2,
        "psychic": 1,
        "bug": 2,
        "rock": 1,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#b59f4d'
    },
    "ghost": {
        "normal": 0,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 2,
        "dragon": 1,
        "dark": 0.5,
        "steel": 0.5,
        "fairy": 1,
        color: '#944a98'
    },
    "dragon": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 1,
        "steel": 0.5,
        "fairy": 0,
        color: '#758bc6'
    },
    "dark": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 0.5,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 2,
        "dragon": 1,
        "dark": 0.5,
        "steel": 0.5,
        "fairy": .5,
        color: '#567783'
    },
    "steel": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 0.5,
        "grass": 1,
        "ice": 2,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 2,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 2,
        color: '#577884'
    },
    "fairy": {
        "normal": 1,
        "fire": .5,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 2,
        "poison": .5,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 2,
        "steel": .5,
        "color": '#ee99ac'
    }
}
