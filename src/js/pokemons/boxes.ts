import {PokemonInstance} from "./pokedex";

export class BoxSelection {
    public zone: 'party' | 'box';
    public box?: number;
    public index: number;
    public selected?: PokemonInstance;
    public moving = false;

    constructor(zone: 'party' | 'box', index: number, box?: number, selected?: PokemonInstance) {
        this.zone = zone;
        this.box = box;
        this.index = index;
        this.selected = selected;
    }
}

export class PokemonBox {
    public name: string;
    public values: Array<PokemonInstance | undefined>;

    constructor(name: string, values: Array<PokemonInstance | undefined>) {
        this.name = name;
        this.values = values;
    }

    private firstSpot() {
        return this.values.indexOf(this.values.find(pkmn => pkmn === null || pkmn === undefined));
    }

    public add(pkmn: PokemonInstance) {
        let spot = this.firstSpot();
        if (spot !== -1) {
            this.values[spot] = pkmn;
        }
    }

    public move(index1: number, index2: number) {
        //exchange
        let val1 = Object.assign({}, this.values[index1]);
        this.values[index1] = Object.assign({}, this.values[index2]);
        this.values[index2] = val1;
    }

    public isFull() {
        return this.values.every(val => val instanceof PokemonInstance);
    }
}
