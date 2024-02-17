import {AItem, Pokeball} from "./items";
import {HealingItem, ReviveItem} from "./items";
import {ITEMS} from "../const";

export class Bag {
    // Map<id, quantity>
    balls = new Map<number, number>();
    potions = new Map<number, number>();

    constructor(bag?: Bag) {
        if (bag) {
            this.balls = new Map(bag.balls);
            this.balls.forEach((value, key) => {
                Object.setPrototypeOf(this.balls.get(key), Pokeball.prototype);
            });
            this.potions = new Map(bag.potions);
            this.potions.forEach((value, key) => {
                if (value === 27) {
                    Object.setPrototypeOf(this.potions.get(key), HealingItem.prototype);
                } else {
                    Object.setPrototypeOf(this.potions.get(key), ReviveItem.prototype);
                }
            });
        }
    }

    addItems(id: number, quantity: number) {
        switch (id) {
            case 34:
                this.balls.set(id, (this.balls.get(id) || 0) + quantity);
                break;
            case 27:
            case 29:
                this.potions.set(id, (this.potions.get(id) || 0) + quantity);
                break;
            default:
                break;
        }
    }

    getItem(id: number): AItem | undefined {
        switch (id) {
            case 34:
                let ball = this.balls.get(id);
                if (ball && ball > 0) {
                    this.balls.set(id, ball - 1);
                    return ITEMS.get(id)?.instanciate();
                }
                break;
            case 27:
                let potion = this.potions.get(id);
                if (potion && potion > 0) {
                    this.potions.set(id, potion - 1);
                    return ITEMS.get(id)?.instanciate();
                }
                break;
            case 29:
                let revive = this.potions.get(id);
                if (revive && revive > 0) {
                    this.potions.set(id, revive - 1);
                    return ITEMS.get(id)?.instanciate();
                }
                break;
            default:
                break;
        }
        throw new Error("No item of this type");
    }
}
