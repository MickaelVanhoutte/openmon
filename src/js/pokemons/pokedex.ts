import { EXPERIENCE_CHART } from "./experience";
import type { Effect } from "./move-effects";
import pokedexJson from "../../assets/data/final/beta/pokedex-animatedV3.json";
import { typeChart } from "../battle/battle-model";

export class Nature {
    public id: number;
    public identifier: string;
    public decreasedStatId: string;
    public increasedStatId: string;

    constructor(id: number, identifier: string, decreasedStatId: string, increasedStatId: string) {
        this.id = id;
        this.identifier = identifier;
        this.decreasedStatId = decreasedStatId;
        this.increasedStatId = increasedStatId;
    }
}

export class SavedEntry {
    public id: number;
    public viewed: boolean;
    public caught: boolean;

    constructor(id: number, viewed: boolean, caught: boolean) {
        this.id = id;
        this.viewed = viewed;
        this.caught = caught;
    }
}

export const NATURES: Nature[] = [
    {
        "id": 1,
        "identifier": "hardy",
        "decreasedStatId": "attack",
        "increasedStatId": "attack"
    },
    {
        "id": 2,
        "identifier": "bold",
        "decreasedStatId": "attack",
        "increasedStatId": "defense"
    },
    {
        "id": 3,
        "identifier": "modest",
        "decreasedStatId": "attack",
        "increasedStatId": "specialAttack"
    },
    {
        "id": 4,
        "identifier": "calm",
        "decreasedStatId": "attack",
        "increasedStatId": "specialDefense"
    },
    {
        "id": 5,
        "identifier": "timid",
        "decreasedStatId": "attack",
        "increasedStatId": "speed"
    },
    {
        "id": 6,
        "identifier": "lonely",
        "decreasedStatId": "defense",
        "increasedStatId": "attack"
    },
    {
        "id": 7,
        "identifier": "docile",
        "decreasedStatId": "defense",
        "increasedStatId": "defense"
    },
    {
        "id": 8,
        "identifier": "mild",
        "decreasedStatId": "defense",
        "increasedStatId": "specialAttack"
    },
    {
        "id": 9,
        "identifier": "gentle",
        "decreasedStatId": "defense",
        "increasedStatId": "specialDefense"
    },
    {
        "id": 10,
        "identifier": "hasty",
        "decreasedStatId": "defense",
        "increasedStatId": "speed"
    },
    {
        "id": 11,
        "identifier": "adamant",
        "decreasedStatId": "specialAttack",
        "increasedStatId": "attack"
    },
    {
        "id": 12,
        "identifier": "impish",
        "decreasedStatId": "specialAttack",
        "increasedStatId": "defense"
    },
    {
        "id": 13,
        "identifier": "bashful",
        "decreasedStatId": "specialAttack",
        "increasedStatId": "specialAttack"
    },
    {
        "id": 14,
        "identifier": "careful",
        "decreasedStatId": "specialAttack",
        "increasedStatId": "specialDefense"
    },
    {
        "id": 15,
        "identifier": "rash",
        "decreasedStatId": "specialDefense",
        "increasedStatId": "specialAttack"
    },
    {
        "id": 16,
        "identifier": "jolly",
        "decreasedStatId": "specialAttack",
        "increasedStatId": "speed"
    },
    {
        "id": 17,
        "identifier": "naughty",
        "decreasedStatId": "specialDefense",
        "increasedStatId": "attack"
    },
    {
        "id": 18,
        "identifier": "lax",
        "decreasedStatId": "specialDefense",
        "increasedStatId": "defense"
    },
    {
        "id": 19,
        "identifier": "quirky",
        "decreasedStatId": "specialDefense",
        "increasedStatId": "specialDefense"
    },
    {
        "id": 20,
        "identifier": "naive",
        "decreasedStatId": "specialDefense",
        "increasedStatId": "speed"
    },
    {
        "id": 21,
        "identifier": "brave",
        "decreasedStatId": "speed",
        "increasedStatId": "attack"
    },
    {
        "id": 22,
        "identifier": "relaxed",
        "decreasedStatId": "speed",
        "increasedStatId": "defense"
    },
    {
        "id": 23,
        "identifier": "quiet",
        "decreasedStatId": "speed",
        "increasedStatId": "specialAttack"
    },
    {
        "id": 24,
        "identifier": "sassy",
        "decreasedStatId": "speed",
        "increasedStatId": "specialDefense"
    },
    {
        "id": 25,
        "identifier": "serious",
        "decreasedStatId": "speed",
        "increasedStatId": "speed"
    }
];

export class Pokedex {

    public entries: PokedexEntry[] = [];

    constructor(savedEntries: SavedEntry[] = []) {
        this.importFromJson(pokedexJson, savedEntries);
    }

    private importFromJson(json: any, savedEntries: SavedEntry[] = []) {
        if (this.entries?.length === 0) {
            // @ts-ignore
            json.forEach((pokemon) => {
                this.entries.push(new PokedexEntry(
                    pokemon.id,
                    pokemon.regionalId,
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
                    pokemon.growthRateId,
                    pokemon.baseXp,
                    pokemon.percentageMale,
                    pokemon.evolution,
                    pokemon.sprites,
                    savedEntries.find((entry) => entry.id === pokemon.id)?.viewed,
                    savedEntries.find((entry) => entry.id === pokemon.id)?.caught
                ));
            });
        }
    }

    findById(id: number): PokedexSearchResult {
        if (id === undefined || id === null || id < 1) {
            return new PokedexSearchResult(new UnknownMonster());
        }
        let entry = this.entries.find((entry) => entry.id === id);
        return entry?.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster());
    }

    findByName(name: string): PokedexSearchResult[] {
        if (name === undefined || name === null || name === "") {
            return [new PokedexSearchResult(new UnknownMonster())];
        }
        let entries = this.entries.filter((entry) => entry.name.toLowerCase().includes(name.toLowerCase()));
        return entries.map((entry) => entry.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster()));
    }

    setViewed(id: number) {
        let entry = this.entries.find((entry) => entry.id === id)
        if (entry) {
            entry.viewed = true;
        }
    }

    setCaught(id: number) {
        let entry = this.entries.find((entry) => entry.id === id)
        if (entry) {
            entry.caught = true;
            entry.viewed = true;
        }

    }

    exportForSave(): SavedEntry[] {
        return this.entries.map((entry) => {
            return new SavedEntry(entry.id, entry.viewed, entry.caught);
        });
    }

    getCaught(): PokedexEntry[] {
        return this.entries.filter((entry) => entry.caught);
    }

    getViewed(): PokedexEntry[] {
        return this.entries.filter((entry) => entry.viewed);
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
    public regionalId: number;
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
    public percentageMale: number;
    public evolution: Evolution[];
    public sprites?: Sprites;

    public viewed: boolean = false;
    public caught: boolean = false;

    constructor(
        id: number,
        regionalId: number,
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
        growthRateId: number,
        baseXp: number,
        percentageMale: number,
        evolution: Evolution[],
        sprites?: Sprites,
        viewed: boolean = false,
        caught: boolean = false
    ) {
        this.id = id;
        this.regionalId = regionalId;
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
        this.growthRateId = growthRateId;
        this.baseXp = baseXp;
        this.percentageMale = percentageMale;
        this.evolution = evolution;
        this.sprites = sprites;
        this.viewed = true//viewed;
        this.caught = caught;
    }

    get weaknesses(): string[] {
        return Object.entries(typeChart)
            .filter(([_key, value]) => {
                if (this.types?.length === 1) {
                    // @ts-ignore
                    return value[this.types[0]] > 1;
                } else {
                    // @ts-ignore
                    return value[this.types[0]] * value[this.types[1]] > 1
                }

            })
            .map(([key, _value]) => key);
    }

    get weaknessValue(): { type: string, value: number }[] {
        // @ts-ignore
        return Object.entries(typeChart)
            .filter(([_key, value]) => {
                if (this.types?.length === 1) {
                    // @ts-ignore
                    return value[this.types[0]] > 1;
                } else {
                    // @ts-ignore
                    return value[this.types[0]] * value[this.types[1]] > 1
                }

            })
            .map(([key, value]) => {
                if (this.types?.length === 1) {
                    // @ts-ignore
                    return { string: key, value: value[this.types[0]] };
                } else {
                    // @ts-ignore
                    return { string: key, value: value[this.types[0]] * value[this.types[1]] };
                }
            });
    }

    public instanciate(level: number, minIv = 0, forceShiny = false): PokemonInstance {
        // random nature
        let nature = NATURES[Math.floor(Math.random() * NATURES.length)];
        let shiny = forceShiny ? forceShiny : Math.floor(Math.random() * 2) === 0; // TODO set shiny chance
        let ivs = undefined;
        if (minIv > 0) {
            ivs = new Stats(this.getIvFromMin(minIv), this.getIvFromMin(minIv), this.getIvFromMin(minIv), this.getIvFromMin(minIv), this.getIvFromMin(minIv), this.getIvFromMin(minIv));
        }

        return new PokemonInstance(this, level, nature, shiny, ivs);
    }

    private getIvFromMin(min: number): number {
        return Math.floor(Math.random() * (32 - min) + min);
    }
}

export class UnknownMonster extends PokedexEntry {

    constructor() {
        super(
            0,
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
    public id: number;
    public name: string;
    public type: string;
    public category: 'physical' | 'special' | 'no-damage';
    public power: number;
    public accuracy: number;
    public pp: number;
    public priority: number;
    /*public target: string;*/
    public effect: MoveEffect;
    public effectChance: number;
    public description: string;
    public level: number;
    public method: number;

    constructor(id: number, name: string, type: string, category: 'physical' | 'special' | 'no-damage', power: number, accuracy: number, pp: number, priority: number, /*target: string,*/ effect: MoveEffect, effectChance: number, description: string, level: number, method: number = 1) {
        this.id = id;
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
        this.method = method;
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


export class Stats {
    public hp: number;
    public attack: number;
    public defense: number;
    public specialAttack: number;
    public specialDefense: number;
    public speed: number;
    public total: number;

    public accuracy: number;
    public evasion: number;

    constructor(hp: number = 0, attack: number = 0, defense: number = 0, specialAttack: number = 0, specialDefense: number = 0, speed: number = 0, evasion: number = 0, accuracy: number = 0, total?: number) {
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
        this.accuracy = accuracy;
        this.evasion = evasion;
    }
}

export class Evolution {
    public id: number;
    public level: number;
    public method: string;

    constructor(nextId: number, level: number, method: string) {
        this.id = nextId;
        this.level = level;
        this.method = method;
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
    frame2?: string;
    shiny1: string;
    shiny2?: string;

    constructor(frame1: string, shiny1: string, shiny2?: string, frame2?: string) {
        this.frame1 = frame1;
        this.frame2 = frame2;
        this.shiny1 = shiny1;
        this.shiny2 = shiny2;
    }
}

export class ComboMove extends Move {

    public pokemon2: PokemonInstance;
    public effects: MoveEffect[] = [];
    public effectsChances: number[] = [];
    public move1: MoveInstance;
    public move2: MoveInstance;

    constructor(move1: MoveInstance, move2: MoveInstance, pokemon2: PokemonInstance) {
        super(
            -1,
            `Combo ${move1.name} + ${move2.name}`,
            move1.type,
            move1.category,
            move1.power,
            100,
            move1.pp,
            move1.priority,
            move1.effect,
            move1.effectChance * 1.5 > 100 ? 100 : move1.effectChance * 1.5,
            `Combo`,
            move1.level
        )
        this.move1 = move1;
        this.move2 = move2;
        this.pokemon2 = pokemon2;
        this.effects.push(move1.effect);
        this.effects.push(move2.effect);
        // effectChance haves 50% bonus (max 100%)
        this.effectsChances.push(move1.effectChance * 1.5 > 100 ? 100 : move1.effectChance * 1.5);
        this.effectsChances.push(move2.effectChance * 1.5 > 100 ? 100 : move2.effectChance * 1.5);
    } 

}

export class MoveInstance extends Move {
    public currentPp: number;

    constructor(id: number, name: string, type: string, category: 'physical' | 'special' | 'no-damage', power: number, accuracy: number, pp: number, priority: number, /*target: string,*/ effect: MoveEffect, effectChance: number, description: string, level: number) {
        super(id, name, type, category, power, accuracy, pp, priority, /*target,*/ effect, effectChance, description, level);
        this.currentPp = pp;
    }
}

export class PokemonInstance extends PokedexEntry {

    public currentStats: Stats = new Stats();
    public statsChanges: Stats = new Stats();
    public currentHp: number = 1;
    public currentXp: number = 0;
    public xpToNextLevel: number = 0;
    public currentAbility: string = "";
    public level: number = 1;
    public evsToDistribute: number = 510;
    public fainted: boolean = false;
    public moves: MoveInstance[] = [];
    public ivs: Stats = new Stats();
    public evs: Stats = new Stats();
    public nature: Nature;
    public gender: 'male' | 'female' | 'unknown';
    public heldItem: any = {}; // TODO

    public isShiny: boolean = false;

    public status?: Effect;

    get spriteScale(): number {
        return 1;
    }

    get totalEvs(): number {
        return this.evs.attack + this.evs.defense + this.evs.specialAttack + this.evs.specialDefense + this.evs.speed + this.evs.hp;
    }

    /* get availableMoves(): Move[] {
         return POKEDEX.findById(this.id)?.result?.moves?.filter((move) => move.level <= this.level) || [];
     }*/

    get battleStats(): Stats {
        return new Stats(
            this.currentStats.hp,
            this.currentStats.attack * (this.statsChanges.attack >= 0 ? (2 + this.statsChanges.attack / 2) : (2 / (-2 + this.statsChanges.attack) * -1)),
            this.currentStats.defense * (this.statsChanges.defense >= 0 ? (2 + this.statsChanges.defense / 2) : (2 / (-2 + this.statsChanges.defense) * -1)),
            this.currentStats.specialAttack * (this.statsChanges.specialAttack >= 0 ? (2 + this.statsChanges.specialAttack / 2) : (2 / (-2 + this.statsChanges.specialAttack) * -1)),
            this.currentStats.specialDefense * (this.statsChanges.specialDefense >= 0 ? (2 + this.statsChanges.specialDefense / 2) : (2 / (-2 + this.statsChanges.specialDefense) * -1)),
            this.currentStats.speed * (this.statsChanges.speed >= 0 ? (2 + this.statsChanges.speed / 2) : (2 / (-2 + this.statsChanges.speed) * -1)),
            this.currentStats.evasion * (this.statsChanges.evasion >= 0 ? (3 + this.statsChanges.evasion / 3) : (3 / (-3 + this.statsChanges.evasion) * -1)),
            this.currentStats.accuracy * (this.statsChanges.accuracy >= 0 ? (3 + this.statsChanges.accuracy / 3) : (3 / (-3 + this.statsChanges.accuracy) * -1)),
        );
    }

    constructor(pokedexEntry: PokedexEntry, level: number, nature: Nature, shiny: boolean, ivs?: Stats, fromInstance?: PokemonInstance) {
        super(pokedexEntry.id, pokedexEntry.regionalId, pokedexEntry.name, pokedexEntry.types, pokedexEntry.abilities, pokedexEntry.moves, pokedexEntry.stats, pokedexEntry.height, pokedexEntry.weight, pokedexEntry.description, pokedexEntry.isLegendary, pokedexEntry.captureRate, pokedexEntry.growthRateId, pokedexEntry.baseXp, pokedexEntry.percentageMale, pokedexEntry.evolution, pokedexEntry.sprites);

        if (fromInstance) {

            // keep current if exists or random from new abilities
            this.currentAbility = pokedexEntry.abilities.includes(fromInstance.currentAbility) ?
                fromInstance.currentAbility :
                pokedexEntry.abilities[Math.floor(Math.random() * pokedexEntry.abilities.length)];
            // keep currentStats
            this.evs = fromInstance.evs;
            this.ivs = fromInstance.ivs;
            this.nature = fromInstance.nature;
            this.level = fromInstance.level;
            this.currentXp = fromInstance.currentXp;
            this.currentHp = fromInstance.currentHp;
            this.updateCurrentStats();
            this.moves = fromInstance.moves;
            this.isShiny = fromInstance.isShiny;
            this.gender = fromInstance.gender;
            this.evsToDistribute = fromInstance.evsToDistribute;
            this.heldItem = fromInstance.heldItem;
        } else {
            this.currentAbility = this.abilities[Math.floor(Math.random() * this.abilities.length)];
            this.evs = new Stats();
            this.ivs = ivs !== undefined ? ivs : new Stats(
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
            );
            this.level = level || 5;
            this.currentXp = 0;
            this.nature = nature;

            this.updateCurrentStats();
            this.currentHp = this.currentStats.hp;
            this.moves = this.selectLatestMoves(pokedexEntry);
            // shiny chance is 1/2048
            this.isShiny = shiny;//= Math.floor(Math.random() * 2048) === 0;

            // random gender based on percentageMale attr
            this.gender = this.percentageMale ? (Math.random() * this.percentageMale <= this.percentageMale ? 'male' : 'female') : 'unknown';
        }
    }

    public changeBattleStats(stat: 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed' | 'evasion' | 'accuracy', value: number) {
        this.statsChanges[stat] > -6 && this.statsChanges[stat] < 6 ? this.statsChanges[stat] += value : console.log(`${stat}cannot go ${value > 0 ? 'higher' : 'lower'}`);
    }

    public resetBattleStats() {
        this.statsChanges = new Stats();
    }

    public selectMove(iaLvl: 'Random' | 'Easy', target?: PokemonInstance): MoveInstance {
        let random = Math.floor(Math.random() * this.moves.length);
        let move = this.moves[random];
        if (iaLvl === 'Easy' && !!target) {
            let matchTargetTypes = target?.types.length === 2 ?
                this.moves.find((move: Move) => move.type === target.types[0] && move.power > 0) :
                this.moves.find((move: Move) => (move.type === target.types[0] || move.type === target.types[1]) && move.power > 0);
            if (matchTargetTypes && matchTargetTypes.power > 0) {
                return move;
            }
        }

        // TODO hard IA should include switching, using items, setup before attacking...
        return move;
    }

    private fromBaseStats(): Stats {
        return new Stats(
            Math.floor(((this.ivs.hp + this.stats.hp * 2 + this.evs.hp / 4) * this.level / 100 + 10 + this.level) * (this.nature.increasedStatId === 'hp' ? 1.1 : (this.nature.decreasedStatId === 'hp' ? 0.9 : 1))),
            Math.floor(((this.ivs.attack + this.stats.attack * 2 + this.evs.attack / 4) * this.level / 100 + 5) * (this.nature.increasedStatId === 'attack' ? 1.1 : (this.nature.decreasedStatId === 'attack' ? 0.9 : 1))),
            Math.floor(((this.ivs.defense + this.stats.defense * 2 + this.evs.defense / 4) * this.level / 100 + 5) * (this.nature.increasedStatId === 'defense' ? 1.1 : (this.nature.decreasedStatId === 'defense' ? 0.9 : 1))),
            Math.floor(((this.ivs.specialAttack + this.stats.specialAttack * 2 + this.evs.specialAttack / 4) * this.level / 100 + 5) * (this.nature.increasedStatId === 'specialAttack' ? 1.1 : (this.nature.decreasedStatId === 'specialAttack' ? 0.9 : 1))),
            Math.floor(((this.ivs.specialDefense + this.stats.specialDefense * 2 + this.evs.specialDefense / 4) * this.level / 100 + 5) * (this.nature.increasedStatId === 'specialDefense' ? 1.1 : (this.nature.decreasedStatId === 'specialDefense' ? 0.9 : 1))),
            Math.floor(((this.ivs.speed + this.stats.speed * 2 + this.evs.speed / 4) * this.level / 100 + 5) * (this.nature.increasedStatId === 'speed' ? 1.1 : (this.nature.decreasedStatId === 'speed' ? 0.9 : 1))),
        )
    }


    public canEvolve() {
        return this.evolution?.filter((evo) => evo.method === 'level' && evo.level <= this.level)?.length > 0;
    }

    public removeHp(hp: number) {
        this.currentHp -= hp;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.fainted = true;
        }
    }

    public heal(hp: number) {
        this.currentHp += hp;
        if (this.currentHp > this.currentStats.hp) {
            this.currentHp = this.currentStats.hp;
        }
    }

    fullHeal() {
        this.revive(this.currentStats.hp);
    }

    public revive(hp: number) {
        this.fainted = false;
        this.currentHp = hp;
    }

    public howMuchXpWon(opponent: PokemonInstance, participated: number = 1, fromTrainer: boolean = false, xpShare: boolean): number {
        return EXPERIENCE_CHART.howMuchIGet(this, opponent, participated, fromTrainer, xpShare);
    }

    public addXpResult(totalXp: number, evs: number): { levelup: boolean, xpLeft: number, newMove: string[] } {
        this.evsToDistribute += (this.totalEvs + evs <= 510) ? evs : (this.totalEvs + evs) - 510;
        if (this.level < 100) {
            let xpLeft = 0;
            if (this.xpToNextLevel < this.currentXp + totalXp) {
                xpLeft = totalXp - (this.xpToNextLevel - this.currentXp);
                const xpToAddNow = totalXp - xpLeft;
                this.currentXp += xpToAddNow;

                return {
                    levelup: true,
                    xpLeft: xpLeft,
                    newMove: []
                    //newMove: POKEDEX.findById(this.id).result?.moves.filter((move) => move.level === this.level + 1).map((move) => move.name) || []
                }
            } else {
                this.currentXp += totalXp;
            }
        }

        return {
            levelup: false,
            xpLeft: 0,
            newMove: []
        }
    }

    public addEv(ev: 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed', value: number) {
        let total = this.totalEvs;
        if (this.evsToDistribute >= value && this.evs[ev] + value <= 252 && this.evs[ev] + value > 0 && total + value <= 510) {
            let toAdd = this.evs[ev] + value <= 252 && total + value <= 510 ? value : 0;
            this.evs[ev] += toAdd
            this.evsToDistribute -= toAdd;
            this.updateCurrentStats();
        }
    }

    public levelUp(): {oldStats?: Stats, newStats?: Stats, moves?: Move[]} {
        if (this.level >= 100) {
            return {};
        }
        let oldStats = {...this.currentStats};

        let currentHp = this.currentStats.hp;
        this.level += 1;
        this.updateCurrentStats();
        let newStats = {...this.currentStats};

        // heal added hp
        currentHp = this.currentStats.hp - currentHp;
        this.currentHp += currentHp;
        this.currentXp = 0;

        return {oldStats, newStats, moves: this.checkForNewMoves()};

        // TODO
        //this.checkForNewMoves();
        //this.checkForEvolutions();
    }

    private checkForNewMoves(): Move[] {
        return this.moves.filter((move) => move.level === this.level);
    }

    evolve(future: PokedexSearchResult): PokemonInstance {
        if (future.found && future.result) {
            return new PokemonInstance(future.result, this.level, this.nature, this.isShiny, undefined, this);
            //this.checkForNewMoves();
        }
        return this
    }

    public updateCurrentStats() {
        this.currentStats = this.fromBaseStats();
        this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, this.growthRateId);
    }

    private selectLatestMoves(pokedexEntry: PokedexEntry) {
        // get 4 last moves based on current level
        return pokedexEntry.moves.filter((move) => move.level <= this.level && move.method === 1).slice(-4).map((move) => new MoveInstance(move.id, move.name, move.type, move.category, move.power, move.accuracy, move.pp, move.priority, move.effect, move.effectChance, move.description, move.level));
    }
}
