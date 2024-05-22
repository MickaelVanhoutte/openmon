import { NPC } from "../../characters/npc";
import { Script, Dialog, Message, HealAll, OpenShop } from "../../scripting/scripts";
import { Jonction } from "../collisions";
import { OpenMap } from "../maps";
import { Position } from "../positions";

const collisions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 14416, 0, 0, 14416, 0, 0, 0, 14416, 14416, 0, 0, 14416, 14416, 14416, 14416, 0, 0, 0,
    0, 14416, 0, 14416, 14416, 0, 14416, 14416, 14416, 0, 0, 14416, 14416, 14416, 0, 0, 0, 14416, 14416, 14416,
    14416, 0, 0, 0, 0, 0, 14416, 14416, 14416, 0, 0, 0, 14416, 14416, 0, 0, 0, 0, 0, 14416,
    14416, 0, 0, 0, 0, 0, 14416, 14416, 14416, 0, 0, 0, 14416, 14416, 0, 0, 0, 0, 0, 14416,
    14416, 0, 0, 0, 0, 0, 14416, 14416, 14416, 14416, 14416, 14416, 14416, 14416, 0, 0, 0, 0, 0, 14416,
    14416, 14416, 14416, 14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416,
    0, 14416, 14416, 14416, 14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416,
    0, 14416, 0, 0, 14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416,
    0, 0, 0, 0, 14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416, 14416, 0, 0, 14416,
    14416, 14416, 14416, 14416, 14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416, 14416, 0, 0, 14416,
    14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416,
    14416, 14416, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14416, 14416,
    0, 0, 14416, 14416, 14416, 14416, 14416, 14416, 14416, 0, 0, 14416, 14416, 14416, 14416, 14416, 14416, 14416, 14416, 0];

const shopItems: Record<string, number> = {
};
shopItems['4'] = 150;
shopItems['17'] = 150;
shopItems['33'] = 500;
shopItems['28'] = 1250;



const npcs: NPC[] = [
    new NPC(991, "NPC1", 2, new Position(9, 4), 'down', 'MALE', undefined, undefined,

        new Script('onInteract2', [
            new Dialog([
                new Message('Welcome to the Pokecenter!'),
                new Message('Would you like to rest your Pokemon?', 'healer', ['Sure', 'No, thanks']),
            ]),
            new HealAll(0),
            new Dialog([new Message('Feel free to come back anytime!', 'bye')])
        ], undefined,
            true),
        undefined,
        undefined,
        true
    ),
    new NPC(992, "NPC2", 2, new Position(3, 9), 'down', 'MALE', undefined, undefined,
        new Script('onInteract2', [
            new Dialog([
                new Message('I just received plenty of merchandise, want to take a look ?', 'shop', ['Sure', 'No, thanks'])
            ]),
            new OpenShop(shopItems, 0),
            new Dialog([new Message('Feel free to come back anytime!', 'bye')]) 
        ], undefined,
            true),
        undefined,
        undefined,
        true
    )
];

export const pokecenter1 = OpenMap.fromScratch(99, 'src/assets/maps/pokecenter2.png', 20, 14,
    collisions, [], [], [],
    new Position(9, 12),
    [3, 6], [
    new Jonction(1,
        0, [new Position(9, 13), new Position(10, 13)], new Position(86, 30)
    )
], 'src/assets/maps/pokecenter2-foreground.png', 39951, 14416, 40111, npcs,
    [], 'pokecenter');
