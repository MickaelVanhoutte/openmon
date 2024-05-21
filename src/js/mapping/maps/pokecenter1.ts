import { NPC } from "../../characters/npc";
import { Script, Dialog, Message } from "../../scripting/scripts";
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
const npcs: NPC[] = [
    new NPC(991, "NPC1", 2, new Position(9, 4), 'down', 'MALE', undefined, undefined,

        new Script('onInteract2', [
            new Dialog([
                new Message('Welcome to the Pokecenter!'),
                new Message('We restore your tired Pokemon to full health.'),
                new Message('Would you like to rest your Pokemon?')
            ]),
            new Dialog([
                new Message('Ok, we\'ll need your Pokemon. Thank you for waiting.'),
                new Message('Here you go, your Pokemon are fully healed!'),
            ])

        ]),
        undefined
    ),
    new NPC(992, "NPC2", 2, new Position(3, 9), 'down', 'MALE', undefined, undefined,
        new Script('onInteract2', [
            new Dialog([
                new Message('I just received plenty of merchandise, want to take a look ?')
            ])
        ]),
        undefined
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
    []);
