import {AItem} from "./items";
import {ITEMS} from "../const";

export class Bag {
    // Map<id, quantity>
    public balls : Record<number, number> = {};
    public potions : Record<number, number> = {};
    public revives : Record<number, number> = {};

    constructor(bag?: Bag) {
        if (bag) {
            Object.keys(bag['balls']).forEach((key) => {
                // @ts-ignore
                this.balls[parseInt(key)] = parseInt(bag['balls'][key]);
            });
            Object.keys(bag['potions']).forEach((key) => {
                // @ts-ignore
                this.potions[parseInt(key)] = parseInt(bag['potions'][key]);
            });
            Object.keys(bag['revives']).forEach((key) => {
                // @ts-ignore
                this.revives[parseInt(key)] = parseInt(bag['revives'][key]);
            });
        }
    }

    addItems(id: number, quantity: number) {
        let categoryItem = ITEMS.getItem(id)?.categoryId;
        switch (categoryItem) {
            case 34:
                this.balls[id] = (this.balls[id] || 0) + quantity;
                break;
            case 27:
                this.potions[id] = (this.potions[id] || 0) + quantity;
                break;
            case 29:
                this.revives[id] = (this.revives[id] || 0) + quantity;
                break;
            default:
                break;
        }
    }

    getItem(id: number): AItem | undefined {
        switch (id) {
            case 34:
                let ball = this.balls[id];
                if (ball && ball > 0) {
                    this.balls[id] = ball - 1;
                    return ITEMS.getItem(id)?.instanciate();
                }
                break;
            case 27:
                let potion = this.potions[id];
                if (potion && potion > 0) {
                    this.potions[id] = potion - 1;
                    return ITEMS.getItem(id)?.instanciate();
                }
                break;
            case 29:
                let revive = this.revives[id];
                if (revive && revive > 0) {
                    this.revives[id] = revive - 1;
                    return ITEMS.getItem(id)?.instanciate();
                }
                break;
            default:
                break;
        }
        throw new Error("No item of this type");
    }
}
