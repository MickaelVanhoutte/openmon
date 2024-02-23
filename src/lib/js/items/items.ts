import type {PokemonInstance} from "../pokemons/pokedex";
import itemsJson from "../../../assets/data/final/usable-items.json";
import {ActionsContext} from "../battle/battle";
import {Character} from "../player/player";

export class ItemUsageResult {
    public success: boolean;

    constructor(success: boolean) {
        this.success = success;
    }
}

export abstract class AItem {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    power: number;

    protected constructor(id: number, categoryId: number, name: string, description: string, power: number) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.power = power;
    }

    abstract instanciate(instance?: AItem): AItem;

    abstract doesApply(target: PokemonInstance, current?: PokemonInstance, actCtx?: ActionsContext): boolean;

    abstract apply(target: PokemonInstance, current?: PokemonInstance): ItemUsageResult;
}


export class Pokeball extends AItem {

    constructor(id: number, categoryId: number, name: string, description: string, power: number) {
        super(id, categoryId, name, description, power);
    }

    instanciate(): AItem {
        return new Pokeball(this.id, this.categoryId, this.name, this.description, this.power);
    }

    doesApply(target: PokemonInstance, current?: PokemonInstance, actCtx?: ActionsContext): boolean {
        return !(!actCtx || actCtx.opponent instanceof Character);
    }

    apply(target: PokemonInstance, current: PokemonInstance): ItemUsageResult {
        if (current) {
            let currentHp = target.currentHp;
            let maxHp = target.currentStats.hp;
            let captureRate = target.captureRate;
            let bonus = this.power;
            let statusBonus = 1;
            if (target.status) {
                statusBonus = 1.5;
                // sleep/freeze
                if (target.status.move_effect_id === 2 || target.status.move_effect_id === 6) {
                    statusBonus = 2;
                }
            }

            let success = (( 1 + ( maxHp * 3 - currentHp * 2 ) * captureRate * this.power * statusBonus ) / ( maxHp * 3 )) / 256;

            console.log(success);
            return new ItemUsageResult(Math.random() < success);
        }


        throw new Error("Method not implemented.");
    }
}

export class HealingItem extends AItem {

    constructor(id: number, categoryId: number, name: string, description: string, power: number) {
        super(id, categoryId, name, description, power);
    }

    instanciate(): AItem {
        return new HealingItem(this.id, this.categoryId, this.name, this.description, this.power);
    }

    doesApply(target: PokemonInstance, current?: PokemonInstance, actCtx?: ActionsContext): boolean {
        return !(!target.fainted && target.currentHp === target.currentStats.hp);
    }

    apply(target: PokemonInstance): ItemUsageResult {
        if (target.currentHp === target.currentStats.hp) {
            throw new Error("This pokemon is already at full health");
        }
        target.heal(this.power === -1 ? target.currentStats.hp : this.power);
        return new ItemUsageResult(true);
    }
}

export class ReviveItem extends AItem {

    constructor(id: number, categoryId: number, name: string, description: string, power: number) {
        super(id, categoryId, name, description, power);
    }

    instanciate(): AItem {
        return new ReviveItem(this.id, this.categoryId, this.name, this.description, this.power);
    }

    doesApply(target: PokemonInstance, current?: PokemonInstance, actCtx?: ActionsContext): boolean {
        return target.fainted;
    }
    apply(target: PokemonInstance): ItemUsageResult {
        if (target.fainted) {
            target.revive(this.power === -1 ? target.currentStats.hp : Math.floor(target.currentStats.hp * this.power / 100));
            return new ItemUsageResult(true);
        } else {
            throw new Error("This item can only be used on fainted pokemon");
        }
    }
}

export class ItemsReferences {
    public static POKEBALL = 34;
    public static POTION = 27;
    public static REVIVE = 29;

    public references: Record<number, AItem> = {}

    constructor() {
        itemsJson.forEach((item: any) => {
            switch (item.categoryId) {
                case 34:
                    this.references[item.id] = new Pokeball(item.id, item.categoryId, item.name, item.description, item.power);
                    break;
                case 27:
                    this.references[item.id] = new HealingItem(item.id, item.categoryId, item.name, item.description, item.power);
                    break;
                case 29:
                    this.references[item.id] = new ReviveItem(item.id, item.categoryId, item.name, item.description, item.power);
                    break;
                default:
                    break;
            }
        });

    }

    public getItem(id: number): AItem | undefined {
        return this.references[id];
    }
}

