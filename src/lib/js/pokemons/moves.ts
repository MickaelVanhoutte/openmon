import {PokemonInstance} from "./pokemon";

export class Move {
    public name: string;
    public type: string;
    public category: 'physical' | 'special' | 'status';
    public power: number;
    public accuracy: number;
    public pp: number;
    public priority: number;
    /*public target: string;*/
    public effect: MoveEffect;
    public effectChance: number;
    public description: string;
    public level: number;

    constructor(name: string, type: string, category: 'physical' | 'special' | 'status', power: number, accuracy: number, pp: number, priority: number, /*target: string,*/ effect: MoveEffect, effectChance: number, description: string, level: number) {
        this.name = name;
        this.type = type;
        this.category = category;
        this.power = power;
        this.accuracy = accuracy;
        this.pp = pp;
        this.priority = priority;
        /*this.target = target;*/
        this.effect = effect;
        this.effectChance = effectChance;
        this.description = description;
        this.level = level;
    }
}

export class MoveEffect {
    move_effect_id: number;
    local_language_id: number;
    short_effect: string;
    effect: string;

    constructor(move_effect_id: number, local_language_id: number, short_effect: string, effect: string) {
        this.move_effect_id = move_effect_id;
        this.local_language_id = local_language_id;
        this.short_effect = short_effect;
        this.effect = effect;
    }

    public apply(target: PokemonInstance[]) {
        // Effect chance is applied earlier since info is on the move

    }
}

export class MoveInstance extends Move {
    public currentPp: number;

    constructor(name: string, type: string, category: 'physical' | 'special' | 'status', power: number, accuracy: number, pp: number, priority: number, /*target: string,*/ effect: MoveEffect, effectChance: number, description: string, level: number) {
        super(name, type, category, power, accuracy, pp, priority, /*target,*/ effect, effectChance, description, level);
        this.currentPp = pp;
    }
}

