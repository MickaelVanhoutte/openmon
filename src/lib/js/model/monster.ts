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

    public currentStats: Stats;
    public currentHp: number = 0;
    public currentXp: number = 0;
    public xpToNextLevel: number = 0;
    public currentAbility: string;
    public level: number = 1;
    public moves: string[];

    public isShiny: boolean = false;

    public sprites: MonsterSprite;

    public position: Position;
    public currentImage?: HTMLImageElement;
    public currentImage2?: HTMLImageElement;

    public height: number = 0;
    public spriteScale: number = 1;

    public frames: Frames = {max: 2, val: 0, elapsed: 0}


    constructor(id: number, name: string, types: string[], abilities: string[], baseStats: Stats, evolution: Evolution,
                sprites: MonsterSprite, ability?: string, moves?: string[]) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.abilities = abilities;
        this.baseStats = baseStats;
        this.evolution = evolution;

        this.currentStats = this.baseStats;
        this.ivs = new Stats();
        this.evs = new Stats();
        this.currentAbility = ability || this.abilities[0];
        this.moves = moves || [];

        this.sprites = sprites;
        this.position = new Position(0, 0);
    }

    public levelUp() {
        let currentHp = this.currentStats.HP;
        this.level += 1;
        console.log(this.currentStats);
        this.currentStats.HP = Math.floor((2 * this.baseStats.HP + this.ivs.HP + Math.floor(this.evs.HP / 4)) * this.level / 100 + this.level + 10);
        this.currentStats.attack = Math.floor((2 * this.baseStats.attack + this.ivs.attack + Math.floor(this.evs.attack / 4)) * this.level / 100 + 5);
        this.currentStats.defense = Math.floor((2 * this.baseStats.defense + this.ivs.defense + Math.floor(this.evs.defense / 4)) * this.level / 100 + 5);
        this.currentStats.specialAttack = Math.floor((2 * this.baseStats.specialAttack + this.ivs.specialAttack + Math.floor(this.evs.specialAttack / 4)) * this.level / 100 + 5);
        this.currentStats.specialDefense = Math.floor((2 * this.baseStats.specialDefense + this.ivs.specialDefense + Math.floor(this.evs.specialDefense / 4)) * this.level / 100 + 5);
        this.currentStats.speed = Math.floor((2 * this.baseStats.speed + this.ivs.speed + Math.floor(this.evs.speed / 4)) * this.level / 100 + 5);
        console.log(this.currentStats);

        // heal added hp
        currentHp = this.currentStats.HP - currentHp;
        this.currentHp += currentHp;

        this.checkForNewMoves();
        this.checkForEvolutions();
    }

    public addXp(xp: number, evs?: Stats) {
        this.addEvs(evs);
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
            this.addXp(xpLeft);
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
            console.log(this.frames.elapsed, this.frames.val, type, imageToDisplay?.src);

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
        console.log(localStorage.getItem('pokedex'));
        const pokedex: Monster[] = localStorage.getItem('pokedex') && JSON.parse(localStorage.getItem('pokedex') || '[]') || [];
        const monster = pokedex.find((monster: Monster) => monster.id === this.id);
        if (monster) {
            Object.setPrototypeOf(monster, Monster.prototype)
            this.baseStats = monster.baseStats;
            // TODO update current stats;

            this.sprites = monster.sprites;
            this.currentImage = undefined;
            this.currentImage2 = undefined;
            this.spriteScale = monster.spriteScale;
            this.height = monster.height;

        }

    }

    private addEvs(evs: Stats | undefined) {
        if (evs) {
            let total = this.evs.HP + this.evs.attack + this.evs.defense + this.evs.specialAttack + this.evs.specialDefense + this.evs.speed;

            this.evs.HP += this.evs.HP !== 255 && total < 512 ? evs.HP : 0;
            this.evs.attack += this.evs.attack !== 255 && total < 512 ? evs.attack : 0;
            this.evs.defense += this.evs.defense !== 255 && total < 512 ? evs.defense : 0;
            this.evs.specialAttack += this.evs.specialAttack !== 255 && total < 512 ? evs.specialAttack : 0;
            this.evs.specialDefense += this.evs.specialDefense !== 255 && total < 512 ? evs.specialDefense : 0;
            this.evs.speed += this.evs.speed !== 255 && total < 512 ? evs.speed : 0;
        }
    }
}

export class Stats {
    public HP: number;
    public attack: number;
    public defense: number;
    public specialAttack: number;
    public specialDefense: number;
    public speed: number;

    constructor(HP?: number, attack?: number, defense?: number, specialAttack?: number, specialDefense?: number, speed?: number) {
        this.HP = HP || 0;
        this.attack = attack || 0;
        this.defense = defense || 0;
        this.specialAttack = specialAttack || 0;
        this.specialDefense = specialDefense || 0;
        this.speed = speed || 0;
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
