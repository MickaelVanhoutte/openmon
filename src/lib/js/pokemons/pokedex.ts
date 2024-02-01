import {PokemonSpriteDrawer} from "../sprites/drawers";
import {EXPERIENCE_CHART} from "./experience";

export class Pokedex {

    public entries: PokedexEntry[] = [];
    public ready = false;
    public size = 251;

    constructor(json: any) {
        this.importFromJson(json);
    }

    private importFromJson(json: any) {
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

    public instanciate(level: number) {
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


export class MoveInstance extends Move {
    public currentPp: number;

    constructor(name: string, type: string, category: 'physical' | 'special' | 'status', power: number, accuracy: number, pp: number, priority: number, /*target: string,*/ effect: MoveEffect, effectChance: number, description: string, level: number) {
        super(name, type, category, power, accuracy, pp, priority, /*target,*/ effect, effectChance, description, level);
        this.currentPp = pp;
    }
}

export class PokemonInstance extends PokedexEntry {

    public currentStats: Stats = new Stats();
    public currentHp: number = 1;
    public currentXp: number = 0;
    public xpToNextLevel: number = 0;
    public currentAbility: string = "";
    public level: number = 1;
    public evsToDistribute: number = 0;
    public fainted: boolean = false;
    public moves: MoveInstance[] = [];
    public ivs: Stats = new Stats();
    public evs: Stats = new Stats();
    public nature: string = ""; // TODO
    public gender: 'male' | 'female' | 'unknown';
    public heldItem: any = {}; // TODO

    public isShiny: boolean = false;

    private spriteDrawer: PokemonSpriteDrawer;

    get spriteScale(): number {
        return 1;
    }

    get totalEvs(): number {
        return this.evs.attack + this.evs.defense + this.evs.specialAttack + this.evs.specialDefense + this.evs.speed + this.evs.hp;
    }

    constructor(pokedexEntry: PokedexEntry, level?: number, fromInstance?: PokemonInstance) {
        super(pokedexEntry.id, pokedexEntry.name, pokedexEntry.types, pokedexEntry.abilities, pokedexEntry.moves, pokedexEntry.stats, pokedexEntry.height, pokedexEntry.weight, pokedexEntry.description, pokedexEntry.isLegendary, pokedexEntry.captureRate, pokedexEntry.experienceGrowth, pokedexEntry.baseXp, pokedexEntry.percentageMale, pokedexEntry.evolution, pokedexEntry.sprites);

        if (fromInstance) {

            // keep current if exists or random from new abilities
            this.currentAbility = pokedexEntry.abilities.includes(fromInstance.currentAbility) ?
                fromInstance.currentAbility :
                pokedexEntry.abilities[Math.floor(Math.random() * pokedexEntry.abilities.length)];
            // keep currentStats
            this.evs = fromInstance.evs;
            this.ivs = fromInstance.ivs;
            this.level = fromInstance.level;
            this.currentXp = fromInstance.currentXp;
            this.currentHp = fromInstance.currentHp;
            this.moves = fromInstance.moves;
            this.isShiny = fromInstance.isShiny;
            this.gender = fromInstance.gender;
            this.evsToDistribute = fromInstance.evsToDistribute;
            this.heldItem = fromInstance.heldItem;
            this.updateCurrentStats();
            console.log('fromInstance', this);
        } else {
            this.currentAbility = this.abilities[Math.floor(Math.random() * this.abilities.length)];
            this.evs = new Stats();
            this.ivs = new Stats(
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
                Math.floor(Math.random() * 32),
            );
            this.level = level || 5;
            this.currentXp = 0;
            this.updateCurrentStats();
            this.currentHp = this.currentStats.hp;
            this.moves = this.selectLatestMoves(pokedexEntry);
            // shiny chance is 1/2048
            this.isShiny = Math.floor(Math.random() * 2048) === 0;

            // random gender based on percentageMale attr
            this.gender = this.percentageMale ? (Math.random() * this.percentageMale <= this.percentageMale ? 'male' : 'female') : 'unknown';
            console.log('new', this);
        }

        this.spriteDrawer = new PokemonSpriteDrawer();
    }

    public draw(ctx: CanvasRenderingContext2D, type: 'front' | 'back', frameOffset: number = 0, xOffset: number = 0, yOffset: number = 0) {
        this.spriteDrawer.draw(ctx, this, type, true, frameOffset, xOffset, yOffset);
    }

    public selectMove(iaLvl: 'Random' | 'Easy', target?: PokemonInstance): MoveInstance {
        let random = Math.floor(Math.random() * this.moves.length);
        let move = this.moves[random];
        if (iaLvl === 'Easy' && !!target) {
            let matchTargetTypes = target?.types.length === 2 ?
                this.moves.find((move: Move) => move.type === target.types[0] && move.power > 0) :
                this.moves.find((move: Move) => (move.type === target.types[0] || move.type === target.types[1]) && move.power > 0);
            if (matchTargetTypes) {
                return move;
            }
        }
        return move;
    }

    private fromBaseStats(): Stats {
        return new Stats(
            Math.floor(((this.ivs.hp + this.stats.hp * 2 + this.evs.hp / 4) * this.level / 100 + 10 + this.level)),
            Math.floor(((this.ivs.attack + this.stats.attack * 2 + this.evs.attack / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.defense + this.stats.defense * 2 + this.evs.defense / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.specialAttack + this.stats.specialAttack * 2 + this.evs.specialAttack / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.specialDefense + this.stats.specialDefense * 2 + this.evs.specialDefense / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.speed + this.stats.speed * 2 + this.evs.speed / 4) * this.level / 100 + 5))
        )
    }

    public howMuchXpWon(opponent: PokemonInstance, participated: number = 1, fromTrainer: boolean = false): number {
        return EXPERIENCE_CHART.howMuchIGet(this, opponent, participated, fromTrainer, false);
    }

    public addXp(xp: number, evs: number) {
        this.evsToDistribute += this.totalEvs + evs <= 255 ? evs : (this.totalEvs + evs) - 255;
        if (this.level >= 100) {
            return;
        }
        let xpLeft = 0;
        if (this.xpToNextLevel < xp) {
            xpLeft = xp - this.xpToNextLevel;
            const xpToAddNow = xp - xpLeft;
            this.currentXp += xpToAddNow;
        } else {
            this.currentXp += xp;
        }

        if (this.currentXp >= this.xpToNextLevel) {
            this.levelUp();
        }
        if (xpLeft > 0) {
            this.addXp(xpLeft, 0);
        }
    }

    public addEvs(evs: Stats) {
        let total = this.totalEvs;

        this.evs.hp += this.evs.hp + evs.hp <= 255 && total + evs.hp < 512 ? evs.hp : 0;
        this.evs.attack += this.evs.attack + evs.attack <= 255 && total + evs.attack < 512 ? evs.attack : 0;
        this.evs.defense += this.evs.defense + evs.defense <= 255 && total + evs.defense < 512 ? evs.defense : 0;
        this.evs.specialAttack += this.evs.specialAttack + evs.specialAttack <= 255 && total + evs.specialAttack < 512 ? evs.specialAttack : 0;
        this.evs.specialDefense += this.evs.specialDefense + evs.specialDefense <= 255 && total + evs.specialDefense < 512 ? evs.specialDefense : 0;
        this.evs.speed += this.evs.speed + evs.speed <= 255 && total + evs.speed < 512 ? evs.speed : 0;
    }

    public levelUp() {
        if (this.level >= 100) {
            return;
        }
        let currentHp = this.currentStats.hp;
        this.level += 1;
        this.updateCurrentStats();

        // heal added hp
        currentHp = this.currentStats.hp - currentHp;
        this.currentHp += currentHp;
        this.currentXp = 0;

        // TODO
        //this.checkForNewMoves();
        //this.checkForEvolutions();
        this.xpToNextLevel = EXPERIENCE_CHART.howMuchINeed(this.level, this.experienceGrowth);
    }

    private checkForNewMoves() {
        let newMoves = this.moves.filter((move) => move.level === this.level);
    }

    // TODO
    /*    private checkForEvolutions() {
            let evolution = this.evolution?.find((evo) => evo.level === this.level);

            if (evolution) {
                this.evolve(evolution.id);
            }
        }*/

    private evolve(id: number, future: PokedexSearchResult) {
        if (future.found && future.result) {
            Object.assign(this, new PokemonInstance(future.result, this.level, this));
            this.checkForNewMoves();
        }
    }

    public updateCurrentStats() {
        this.currentStats = this.fromBaseStats();
    }

    private selectLatestMoves(pokedexEntry: PokedexEntry) {
        // get 4 last moves based on current level
        return pokedexEntry.moves.filter((move) => move.level <= this.level).slice(-4).map((move) => new MoveInstance(move.name, move.type, move.category, move.power, move.accuracy, move.pp, move.priority, move.effect, move.effectChance, move.description, move.level));
    }
}
