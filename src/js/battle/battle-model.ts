import "@abraham/reflection";
import { Move, PokemonInstance, Stats } from "../pokemons/pokedex";
import { container } from "tsyringe";
import { MoveEffectApplier } from "../pokemons/move-effects";
import type { Character } from "../characters/characters-model";
import { writable, type Writable } from "svelte/store";

export enum TurnPhase {
    UPKEEP = 'UPKEEP',
    MAIN = 'MAIN',
    END = 'END'
}

export enum BattleType {
    SINGLE,
    DOUBLE,
    //HORDE
}

export class BattleAnimation {
    move: Move;
    target: PokemonInstance;
    initiator: PokemonInstance;

    constructor(move: Move, target: PokemonInstance, initiator: PokemonInstance) {
        this.move = move;
        this.target = target;
        this.initiator = initiator;
    }

}

export class BattleEvents {
    starting: Writable<boolean> = writable(false);
    ending: Writable<boolean> = writable(false);
    end: Writable<BattleResult | undefined> = writable(undefined);
    battleEnded: boolean = false;

    pokemonChange: Writable<PokemonInstance | undefined> = writable(undefined);
    playerPokemonFaint: Writable<PokemonInstance | undefined> = writable(undefined);
    opponentPokemonFaint: Writable<PokemonInstance | undefined> = writable(undefined);
    runnaway: Writable<boolean> = writable(false);

    animateAttack: Writable<BattleAnimation | undefined> = writable(undefined);

    levelUp: Writable<{pokemon: PokemonInstance, oldStats?: Stats, newStats?: Stats} | undefined> = writable(undefined);
}

export class TurnHistory {
    turn: number;
    initiator: PokemonInstance | Character;
    actionType: string;
    move?: string;

    constructor(turn: number, initiator: PokemonInstance | Character, actionType: string, move?: string) {
        this.turn = turn;
        this.initiator = initiator;
        this.actionType = actionType;
        this.move = move;
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
        color: 'rgb(148, 155, 163)'
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
        color: 'rgb(241,163,98)'
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
        color: 'rgb(95, 144, 210)',
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
        color: 'rgb(239, 212, 89)'
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
        color: 'rgb(122,187,101)'
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
        color: 'rgb(138, 205, 193)'
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
        color: 'rgb(191, 74, 108)',
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
        color: 'rgb(162, 110, 196)'
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
        color: 'rgb(205, 126, 78)'
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
        color: 'rgb(149, 170, 219)'
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
        color: 'rgb(233, 122, 125)'
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
        color: 'rgb(156, 193, 73)'
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
        color: 'rgb(196, 185, 146)'
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
        color: 'rgb(86, 105, 170)'
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
        color: 'rgb(47, 108, 190)'
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
        color: 'rgb(88, 83, 100)'
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
        color: 'rgb(102, 142, 161)'
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
        "color": 'rgb(224, 149, 226)'
    }
}

export const MOVE_EFFECT_APPLIER = container.resolve(MoveEffectApplier);