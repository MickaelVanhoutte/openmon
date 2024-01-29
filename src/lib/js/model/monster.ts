import {Frames, Position} from "./sprites";

export class Monster {

    public id: number;
    public name: string;
    public types: string[];
    public abilities: string[];
    public baseStats: Stats;
    public ivs: Stats;
    public evs: Stats;
    public evolution: Evolution;

    public currentStats: Stats = new Stats();
    public currentHp: number = 1;
    public currentXp: number = 0;
    public xpToNextLevel: number = 0;
    public currentAbility: string;
    public level: number = 5;
    public evsToDistribute: number = 0;
    public fainted: boolean;
    public moves: Move[];

    public isShiny: boolean = false;

    // Display
    public sprites: MonsterSprite;
    public position: Position;
    public currentImage?: HTMLImageElement;
    public currentImage2?: HTMLImageElement;
    public height: number = 0;
    public spriteScale: number = 1;
    public frames: Frames = {max: 2, val: 0, elapsed: 0}

    get totalEvs(): number {
        return this.evs.attack + this.evs.defense + this.evs.specialAttack + this.evs.specialDefense + this.evs.speed + this.evs.HP;
    }

    constructor(id: number, name: string, types: string[], abilities: string[], baseStats: Stats, evolution: Evolution,
                sprites: MonsterSprite, ability?: string, moves?: Move[],
                ivs: Stats = new Stats(1, 1, 1, 1, 1, 1),
                evs: Stats = new Stats(0, 0, 0, 0, 0, 0)) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.abilities = abilities;
        this.baseStats = baseStats;
        this.evolution = evolution;
        this.fainted = false;

        this.ivs = ivs;
        this.evs = evs;

        this.updateCurrentStats();
        this.currentHp = this.currentStats.HP;

        this.currentAbility = ability || this.abilities[0];
        this.moves = moves || [];

        this.sprites = sprites;
        this.position = new Position(0, 0);
    }

    public selectMove(iaLvl: 'Random' | 'Easy', target?: Monster): Move {
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

    public levelUp() {
        let currentHp = this.currentStats.HP;
        this.level += 1;
        console.log('from:', this.currentStats);
        this.updateCurrentStats();
        console.log('to:', this.currentStats);

        // heal added hp
        currentHp = this.currentStats.HP - currentHp;
        this.currentHp += currentHp;
        this.currentXp = 0;

        this.checkForNewMoves();
        this.checkForEvolutions();
    }

    public addXp(xp: number, evs: number) {
        this.evsToDistribute += this.totalEvs + evs <= 255 ? evs : (this.totalEvs + evs) - 255;
        if (this.level >= 100) {
            return;
        }
        const xpLeft = 0;
        if (this.xpToNextLevel < xp) {
            const xpLeft = xp - this.xpToNextLevel;
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

    draw(ctx: CanvasRenderingContext2D, type: 'front' | 'back' | 'shiny' = 'front') {
        if (this.isShiny) {
            type = 'shiny';
            // TODO handle img
        }

        if (!this.currentImage) {
            this.currentImage = new Image();
            this.currentImage.src = this.sprites[type];
        }

        if (!this.currentImage2) {
            this.currentImage2 = new Image();
            this.currentImage2.src = this.sprites.front2;
        }

        if (this.frames.elapsed >= 100) {
            this.frames.elapsed = 0;
        }

        let ready = (type === 'front' && this.currentImage.complete && this.currentImage2?.complete) ||
            (type !== 'front' && this.currentImage.complete)

        let imageToDisplay =
            type !== 'front' ? this.currentImage : this.frames.elapsed < 50 ? this.currentImage : this.currentImage2;

        if (ready) {
            this.frames.elapsed++;

            ctx.drawImage(imageToDisplay,
                0,
                0,
                this.sprites.width,
                this.sprites.height,
                this.position.x,
                this.position.y,
                this.sprites.width * this.spriteScale * 2.5,
                this.sprites.height * this.spriteScale * 2.5);
        }
    }

    private checkForNewMoves() {
        // TODO
    }

    private checkForEvolutions() {
        if (this.evolution && this.level >= this.evolution.level) {
            this.evolve();
        }
    }

    public evolve() {
        this.id++;
        const pokedex: Monster[] = localStorage.getItem('pokedex') && JSON.parse(localStorage.getItem('pokedex') || '[]') || [];
        const monster = pokedex.find((monster: Monster) => monster.id === this.id);
        if (monster) {
            Object.setPrototypeOf(monster, Monster.prototype)
            this.baseStats = monster.baseStats;
            this.updateCurrentStats();

            this.sprites = monster.sprites;
            this.currentImage = undefined;
            this.currentImage2 = undefined;
            this.spriteScale = monster.spriteScale;
            this.height = monster.height;

        }
    }

    public updateCurrentStats() {
        this.currentStats = this.fromBaseStats();
    }


    private addEvs(evs: Stats | undefined) {
        if (evs) {
            let total = this.totalEvs;

            this.evs.HP += this.evs.HP + evs.HP <= 255 && total + evs.HP < 512 ? evs.HP : 0;
            this.evs.attack += this.evs.attack + evs.attack <= 255 && total + evs.attack < 512 ? evs.attack : 0;
            this.evs.defense += this.evs.defense + evs.defense <= 255 && total + evs.defense < 512 ? evs.defense : 0;
            this.evs.specialAttack += this.evs.specialAttack + evs.specialAttack <= 255 && total + evs.specialAttack < 512 ? evs.specialAttack : 0;
            this.evs.specialDefense += this.evs.specialDefense + evs.specialDefense <= 255 && total + evs.specialDefense < 512 ? evs.specialDefense : 0;
            this.evs.speed += this.evs.speed + evs.speed <= 255 && total + evs.speed < 512 ? evs.speed : 0;
        }
    }

    private fromBaseStats(): Stats {
        return new Stats(
            Math.floor(((this.ivs.HP + this.baseStats.HP * 2 + this.evs.HP / 4) * this.level / 100 + 10 + this.level)),
            Math.floor(((this.ivs.attack + this.baseStats.attack * 2 + this.evs.attack / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.defense + this.baseStats.defense * 2 + this.evs.defense / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.specialAttack + this.baseStats.specialAttack * 2 + this.evs.specialAttack / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.specialDefense + this.baseStats.specialDefense * 2 + this.evs.specialDefense / 4) * this.level / 100 + 5)),
            Math.floor(((this.ivs.speed + this.baseStats.speed * 2 + this.evs.speed / 4) * this.level / 100 + 5))
        )
    }
}

export class Stats {
    public HP: number;
    public attack: number;
    public defense: number;
    public specialAttack: number;
    public specialDefense: number;
    public speed: number;

    constructor(HP: number = 0, attack: number = 0, defense: number = 0, specialAttack: number = 0, specialDefense: number = 0, speed: number = 0) {
        this.HP = HP;
        this.attack = attack;
        this.defense = defense;
        this.specialAttack = specialAttack;
        this.specialDefense = specialDefense;
        this.speed = speed;
    }
}

export class Evolution {
    public nextId: string;
    public level: number;

    constructor(nextId: string, level: number) {
        this.nextId = nextId;
        this.level = level;
    }
}

export class MonsterSprite {
    public front: string;
    public front2: string;
    public back: string;
    public shiny: string;
    public width: number = 80;
    public height: number = 80;

    constructor(front: string, front2: string, back: string, shiny: string) {
        this.front = front;
        this.front2 = front2;
        this.back = back;
        this.shiny = shiny;
    }
}

export class Move {
    public name: string;
    public type: string;
    public category: 'Physical' | 'Special' | 'Status';
    public power: number;
    public accuracy: number;
    public pp: number;
    public priority: number;
    /*public target: string;*/
    public effect: string;
    public effectChance: number;
    public description: string;

    constructor(name: string, type: string, category: 'Physical' | 'Special' | 'Status', power: number, accuracy: number, pp: number, priority: number, /*target: string,*/ effect: string, effectChance: number, description: string) {
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
    }
}
