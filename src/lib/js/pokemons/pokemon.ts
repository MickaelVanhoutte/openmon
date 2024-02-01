import {PokedexEntry, PokedexSearchResult, Stats} from "./pokedex";
import {EXPERIENCE_CHART} from "./experience";
import {Move, MoveInstance} from "./moves";
import {PokemonSpriteDrawer} from "../sprites/drawers";


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

    public selectMove(iaLvl: 'Random' | 'Easy', target?: PokemonInstance): Move {
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
