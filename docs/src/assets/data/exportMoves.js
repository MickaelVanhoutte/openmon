import fs from "fs";
import moves from "./moves.json" assert {type: "json"};
import moveEffects from "./move-effects.json" assert {type: "json"};
import movesAssFromJson from "./pokemon-moves.json" assert {type: "json"};


const typeById = {
    1: 'normal',
    2: 'fighting',
    3: 'flying',
    4: 'poison',
    5: 'ground',
    6: 'rock',
    7: 'bug',
    8: 'ghost',
    9: 'steel',
    10: 'fire',
    11: 'water',
    12: 'grass',
    13: 'electric',
    14: 'psychic',
    15: 'ice',
    16: 'dragon',
    17: 'dark',
    18: 'dragon'
}

function exportMoves() {

    let movesFromJson = moves;
    // moves.json
    /*{
        "id": 10013,
        "identifier": "shadow-half",
        "generation_id": 3,
        "type_id": 10002,
        "power": "",
        "pp": "",
        "accuracy": 100,
        "priority": 0,
        "target_id": 12,
        "damage_class_id": 3,
        "effect_id": 10003,
        "effect_chance": "",
        "contest_type_id": "",
        "contest_effect_id": "",
        "super_contest_effect_id": ""
    },*/

    let moveEffectsFromJson = moveEffects;
    // move-effects.json
    /*{
        "move_effect_id": 1,
        "local_language_id": 9,
        "short_effect": "Inflicts regular damage with no additional effect.",
        "effect": "Inflicts [regular damage]{mechanic:regular-damage}."
    },*/

    let movesAssociation = movesAssFromJson;
    // Moves associations
    /* {
         "pokemon_id":"1",
         "version_group_id":"1",
         "move_id":"33",
         "pokemon_move_method_id":"1",
         "level":"1",
         "order":"1"
     }*/

    console.log('writing move associations');

    let movesAssociationArray = [];

    movesAssociation
        //pokemon_move_method_id === 1 : by lvl up,  version_group_id === 7 : fire red
        .filter((move) => Number.parseInt(move.pokemon_move_method_id) === 1 && move.version_group_id === '11' && move.pokemon_id <= 251)
        .forEach((move) => {

            let moveFound = movesFromJson.find((m) => m.id === Number.parseInt(move.move_id));
            let moveEffectFound = moveEffectsFromJson.find((m) => m.move_effect_id === moveFound.effect_id);

            if (moveFound && typeById[moveFound.type_id] && moveEffectFound) {
                console.log(moveFound.damage_class_id === 1 ? 'no-damage' : moveFound.damage_class_id === 2 ? 'physical' : 'special')
                movesAssociationArray.push({
                    pokemon_id: move.pokemon_id,
                    move: {
                        id: moveFound.id,
                        name: moveFound.identifier,
                        type: typeById[moveFound.type_id],
                        category: moveFound.damage_class_id === 1 ? 'no-damage' : moveFound.damage_class_id === 2 ? 'physical' : 'special',
                        power: moveFound.power,
                        accuracy: moveFound.accuracy,
                        pp: moveFound.pp,
                        priority: moveFound.priority,
                        /*target: string,*/ // TODO
                        effect: moveEffectFound,
                        effectChance: moveFound.effect_chance === '' ? 100 : moveFound.effect_chance,
                        description: moveEffectFound.short_effect
                    },
                    level: move.level
                });
            }
        });

    console.log(movesAssociationArray.length);

    fs.writeFile("./move-associations-bw.json", JSON.stringify(movesAssociationArray), (error) => {
        // throwing the error
        // in case of a writing problem
        if (error) {
            // logging the error
            console.error(error);

            throw error;
        }
    });
}

exportMoves();
