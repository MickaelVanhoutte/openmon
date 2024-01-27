export class Monster {

    public id: string;
    public name: string;
    public types: string[];
    public abilities: string[];
    public baseStats: BaseStats;
    public evolution: Evolution;

    public currentStats;
    public ivs: BaseStats;
    public evs: BaseStats;
    public currentAbility: string;
    public moves: string[];

    public sprites: {
        front: any,
        back: any,
        shiny: any
    }
    public front: any;
    public back: any;
    public shiny: any;

    constructor(id: string, name: string, types: string[], abilities: string[], baseStats: BaseStats, evolution: Evolution,
                sprites: MonsterSprite, ability?: string, moves?: string[]) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.abilities = abilities;
        this.baseStats = baseStats;
        this.evolution = evolution;

        this.currentStats = this.baseStats;
        this.ivs = new BaseStats();
        this.evs = new BaseStats();
        this.currentAbility = ability || this.abilities[0];
        this.moves = moves || [];

        this.sprites = sprites;
    }

}

export class BaseStats {
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
    public front: any;
    public back: any;
    public shiny: any;

    constructor(front: any, back: any, shiny: any) {
        this.front = front;
        this.back = back;
        this.shiny = shiny;
    }
}
