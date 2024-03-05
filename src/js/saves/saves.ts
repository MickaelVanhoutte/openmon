import {Player} from "../characters/player";
import {OpenMap} from "../mapping/maps";
import {Settings} from "../characters/settings";
import {PokemonInstance} from "../pokemons/pokedex";
import {PokemonBox} from "../pokemons/boxes";



export class Save {

    public id: number;
    public name: string;
    public player: Player;
    public map: OpenMap;
    public settings: Settings;
    public date: Date;
    public pkmnBoxes: Array<PokemonBox>

    constructor(player: Player, map: OpenMap) {
        this.name = player.name;
        this.player = player;
        this.map = map;
        this.settings = new Settings();
        this.pkmnBoxes = this.initEmptyBoxes();
        this.date = new Date();
        this.id = this.date.getMilliseconds();
    }

    private initEmptyBoxes(): Array<PokemonBox> {
        let boxes = new Array<PokemonBox>(10);
        for (let i = 0; i < 10; i++) {
            boxes[i] = new PokemonBox('Box ' + i, new Array(36).fill(undefined));
        }
        return boxes;
    }

    public setPrototypes(): Save {
        this.date = new Date(this.date);
        Object.setPrototypeOf(this.player, Player.prototype);
        this.player.setPrototypes();
        Object.setPrototypeOf(this.map, OpenMap.prototype);
        this.map.setPrototypes();
        Object.setPrototypeOf(this.settings, Settings.prototype);
        Object.setPrototypeOf(this.pkmnBoxes, Array.prototype)
        this.pkmnBoxes.forEach((box) => {
            Object.setPrototypeOf(box, PokemonBox.prototype);
            box.values.forEach((pkmn) => {
                if (pkmn) {
                    Object.setPrototypeOf(pkmn, PokemonInstance.prototype)
                }
            })
        });
        return this;
    }
}

export class SaveContext {
    public saves: Save[] = [];
    public selected?: SelectedSave;
    public newGame = false;

    constructor(newGame?: boolean, selected?: SelectedSave) {
        // @ts-ignore
        this.saves = localStorage.getItem('saves') && JSON.parse(localStorage.getItem('saves')).map((save: any) => {
            Object.setPrototypeOf(save, Save.prototype);
            save.setPrototypes();
            return save;
        }) || [];
        this.newGame = newGame || false;
        this.selected = selected;
    }

    public requestNewGame() {
        Object.assign(this, new SaveContext(true, undefined));
        return this;
    }

    public selectSave(save: Save) {
        this.selected = new SelectedSave(save);
        Object.assign(this, new SaveContext(false, this.selected));
        return this;
    }

    public createSave(save: Save) {
        this.saves.push(save);
        this.selected = new SelectedSave(save);
        this.newGame = false;
        this.save();
        Object.assign(this, new SaveContext(false, this.selected));
        return this;
    }

    public deleteSave(save: Save) {
        this.saves = [...this.saves.filter(s => s.id !== save.id)];
        this.selected = undefined;
        this.save();
        Object.assign(this, new SaveContext(false, undefined));
        return this;
    }

    public updateSave(save: Save) {
        this.saves = [...this.saves.map(s => s.id === save.id ? save : s)];
        this.selected = new SelectedSave(save);
        this.save();
        Object.assign(this, new SaveContext(false, this.selected));
        return this;
    }

    private save() {
        localStorage.setItem('saves', JSON.stringify(this.saves));
    }
}

export class SelectedSave {
    public save: Save;

    get player() {
        return this.save.player;
    }

    get settings() {
        return this.save.settings;
    }

    get map() {
        return this.save.map;
    }

    get id() {
        return this.save.id;
    }

    get boxes() {
        return this.save.pkmnBoxes;
    }

    constructor(save: Save) {
        this.save = save;
    }
}

