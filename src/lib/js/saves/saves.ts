import {Character} from "../player/player";
import {OpenMap} from "../mapping/maps";

export class Save {

    public name: string;
    public player: Character;
    public map: OpenMap;
    public date: Date;

    constructor(player: Character, map: OpenMap) {
        this.name = player.name;
        this.player = player;
        this.map = map;
        this.date = new Date();
    }

    public setPrototypes(): Save {
        Object.setPrototypeOf(this.date, Date.prototype);
        Object.setPrototypeOf(this.player, Character.prototype);
        this.player.setPrototypes();
        Object.setPrototypeOf(this.map, OpenMap.prototype);
        this.map.setPrototypes();
        return this;
    }
}

export class SaveContext {
    public save?: Save;
    public fresh: boolean;
    public saves: Save[] = [];

    constructor(saves: Save[], fresh: boolean = false, save?: Save) {
        this.saves = saves;
        this.fresh = fresh;
        this.save = save;
    }
}

export class SelectedSave {
    public player: Character;
    public map: OpenMap;

    constructor(player: Character, map: OpenMap) {
        this.player = player;
        this.map = map;
    }
}
