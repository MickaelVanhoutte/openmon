import {PokemonInstance} from "./pokemon";

export class Pokedex {

    public entries: PokedexEntry[] = [];
    public ready = false;
    public size = 251;

    constructor() {

    }

    public importFromJson(json: any) {
        if (this.entries?.length === 0) {
            // @ts-ignore
            json.forEach((pokemon) => {
                this.entries.push(new PokedexEntry(
                    pokemon.id,
                    pokemon.name,
                    pokemon.types,
                    pokemon.abilities,
                    pokemon.moves,
                    pokemon.stats,
                    pokemon.height,
                    pokemon.weight,
                    pokemon.description,
                    pokemon.isLegendary,
                    pokemon.captureRate,
                    pokemon.baseXp,
                    pokemon.experienceGrowth,
                    pokemon.percentageMale,
                    pokemon.evolution,
                    pokemon.sprites
                ));
            });
            if (this.entries.length === this.size) {
                this.ready = true;
            }
        }
    }

    findById(id: number): PokedexSearchResult {
        if (!this.ready || id === undefined || id === null || id < 1 || id > this.size) {
            return new PokedexSearchResult(new UnknownMonster());
        }
        let entry = this.entries.find((entry) => entry.id === id);
        return entry?.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster());
    }

    findByName(name: string): PokedexSearchResult {
        if (!this.ready || name === undefined || name === null || name === "") {
            return new PokedexSearchResult(new UnknownMonster());
        }
        let entry = this.entries.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
        return entry?.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster());
    }
}


export class PokedexSearchResult {
    public result: PokedexEntry;
    public found: boolean = false;

    constructor(PokedexEntry: PokedexEntry) {
        this.result = PokedexEntry;
        this.found = PokedexEntry !== undefined;
    }
}

export class PokedexEntry {
    public id: number;
    public name: string;
    public types: string[];
    public abilities: string[];
    public moves: Move[];
    public stats: Stats;
    public height: number;
    public weight: number;
    public description: string;
    public isLegendary: boolean;
    public captureRate: number;
    public growthRateId: number;
    public baseXp: number;
    public experienceGrowth: number;
    public percentageMale: number;
    public evolution: Evolution[];
    public sprites?: {
        male: {
            front: SpriteGroup,
            back: SpriteGroup,
        },
        female: {
            front: SpriteGroup,
            back: SpriteGroup,
        }
    }

    constructor(
        id: number,
        name: string,
        types: string[],
        abilities: string[],
        moves: Move[],
        stats: Stats,
        height: number,
        weight: number,
        description: string,
        isLegendary: boolean,
        captureRate: number,
        experienceGrowth: number,
        baseXp: number,
        percentageMale: number,
        evolution: Evolution[],
        sprites?: {
            male: {
                front: SpriteGroup,
                back: SpriteGroup,
            },
            female: {
                front: SpriteGroup,
                back: SpriteGroup,
            }
        }
    ) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.abilities = abilities;
        this.moves = moves;
        this.stats = stats;
        this.height = height;
        this.weight = weight;
        this.description = description;
        this.isLegendary = isLegendary;
        this.captureRate = captureRate;
        this.experienceGrowth = experienceGrowth;
        this.baseXp = baseXp;
        this.percentageMale = percentageMale;
        this.evolution = evolution;
        this.sprites = sprites;
        switch (experienceGrowth) {
            case 600000:
                // erratic
                this.growthRateId = 5;
                break;
            case 800000:
                // fast
                this.growthRateId = 3;
                break;
            case 1000000:
                // medium fast
                this.growthRateId = 2;
                break;
            case 1059860:
                // medium slow
                this.growthRateId = 4;
                break;
            case 1250000:
                // slow
                this.growthRateId = 1;
                break;
            case 1640000:
                // fluctuating
                this.growthRateId = 6;
                break;
            default:
                this.growthRateId = 1;
                break;
        }
    }

    public instanciate(level: number){
        return new PokemonInstance(this, level);
    }
}

export class UnknownMonster extends PokedexEntry {

    constructor() {
        super(
            0,
            'Unknown',
            [],
            [],
            [],
            new Stats(),
            0,
            0,
            'Unknown',
            false,
            0,
            0,
            0,
            0,
            [],
        );
    }
}


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
}

export class Stats {
    public hp: number;
    public attack: number;
    public defense: number;
    public specialAttack: number;
    public specialDefense: number;
    public speed: number;
    public total: number;

    constructor(hp: number = 0, attack: number = 0, defense: number = 0, specialAttack: number = 0, specialDefense: number = 0, speed: number = 0, total?: number) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.specialAttack = specialAttack;
        this.specialDefense = specialDefense;
        this.speed = speed;
        if (total) {
            this.total = total;
        } else {
            this.total = this.hp + this.attack + this.defense + this.specialAttack + this.specialDefense + this.speed;
        }

    }
}

export class Evolution {
    public id: number;
    public level: number;

    constructor(nextId: number, level: number) {
        this.id = nextId;
        this.level = level;
    }
}

export class Sprites {
    public male: {
        front: SpriteGroup,
        back: SpriteGroup
    };
    public female: {
        front: SpriteGroup,
        back: SpriteGroup
    }

    constructor(
        male: {
            front: SpriteGroup,
            back: SpriteGroup
        },
        female: {
            front: SpriteGroup,
            back: SpriteGroup
        }
    ) {
        this.male = male;
        this.female = female
    }
}

export class SpriteGroup {
    frame1: string;
    frame2: string;
    shiny1: string;
    shiny2: string;

    constructor(frame1: string, frame2: string, shiny1: string, shiny2: string) {
        this.frame1 = frame1;
        this.frame2 = frame2;
        this.shiny1 = shiny1;
        this.shiny2 = shiny2;
    }
}


