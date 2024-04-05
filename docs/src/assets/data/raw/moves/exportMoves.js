import fs from "fs";
import moves from "./moves.json" assert {type: "json"};
import moveEffects from "./move-effects.json" assert {type: "json"};
import movesAssFromJson from "./pokemon-moves.json" assert {type: "json"};
import pokemonIds from "../dex/pokemon-ids.json" assert {type: "json"};


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
  18: 'fairy'
}

const targets = [
  {
    "id": 1,
    "identifier": "specific-move"
  },
  {
    "id": 2,
    "identifier": "selected-pokemon-me-first"
  },
  {
    "id": 3,
    "identifier": "ally"
  },
  {
    "id": 4,
    "identifier": "users-field"
  },
  {
    "id": 5,
    "identifier": "user-or-ally"
  },
  {
    "id": 6,
    "identifier": "opponents-field"
  },
  {
    "id": 7,
    "identifier": "user"
  },
  {
    "id": 8,
    "identifier": "random-opponent"
  },
  {
    "id": 9,
    "identifier": "all-other-pokemon"
  },
  {
    "id": 10,
    "identifier": "selected-pokemon"
  },
  {
    "id": 11,
    "identifier": "all-opponents"
  },
  {
    "id": 12,
    "identifier": "entire-field"
  },
  {
    "id": 13,
    "identifier": "user-and-allies"
  },
  {
    "id": 14,
    "identifier": "all-pokemon"
  },
  {
    "id": 15,
    "identifier": "all-allies"
  },
  {
    "id": 16,
    "identifier": "fainting-pokemon"
  }
];

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

  const moveIdMapping = {
    549: 10237,
    570: 10238,
    571: 10239,
    705: 10241,
    706: 10242,
    58: 10229,
    59: 10230,
    100: 10231,
    101: 10232,
    27: 10101,
    28: 10102,
    37: 10103,
    38: 10104,
    105: 10115,
    79: 10164,
    80: 10165,

    144: 10169,
    145: 10170,
    146: 10171,
    199: 10172,
    222: 10173,
    19: 10091,
    20: 10092,
    26: 10100,
    52: 10161,
    77: 10162,
    78: 10163,
  }

  console.log('writing move associations');

  let movesAssociationArray = [];

  pokemonIds.forEach((id) => {
    let pokemonMoves = movesAssociation.filter((move) => Number.parseInt(move.pokemon_id) === (moveIdMapping[id] || id))
      .filter((move) => Number.parseInt(move.pokemon_move_method_id) === 1 && (Number(move.version_group_id) >= 20));

      console.log(id, pokemonMoves.length);

      pokemonMoves.forEach((move) => {
        let moveFound = movesFromJson.find((m) => m.id === Number.parseInt(move.move_id));
        let moveEffectFound = moveEffectsFromJson.find((m) => m.move_effect_id === moveFound.effect_id);
        //console.log(moveFound);

        if (typeById[moveFound.type_id] && moveEffectFound) {
          movesAssociationArray.push({
            pokemon_id: id,
            move: {
              id: moveFound.id,
              name: moveFound.identifier,
              type: typeById[moveFound.type_id],
              category: moveFound.damage_class_id === 1 ? 'no-damage' : moveFound.damage_class_id === 2 ? 'physical' : 'special',
              power: moveFound.power,
              accuracy: moveFound.accuracy,
              pp: moveFound.pp,
              priority: moveFound.priority,
              target: targets.find((t) => t.id === moveFound.target_id).identifier,
              effect: moveEffectFound,
              effectChance: moveFound.effect_chance === '' ? 100 : moveFound.effect_chance,
              description: moveEffectFound.short_effect
            },
            level: move.level
          });
        }
      });
    
    });

  // movesAssociation
  //   //pokemon_move_method_id === 1 : by lvl up,  version_group_id === 7 : fire red
  //   .filter((move) => Number.parseInt(move.pokemon_move_method_id) === 1 && (Number(move.version_group_id) >= 20) && pokemonIds.includes(Number(move.pokemon_id)))
  //   .forEach((move) => {

  //     let moveFound = movesFromJson.find((m) => m.id === Number.parseInt(move.move_id));
  //     let moveEffectFound = moveEffectsFromJson.find((m) => m.move_effect_id === moveFound.effect_id);

  //     if (moveFound && typeById[moveFound.type_id] && moveEffectFound) {
  //       console.log(moveFound.damage_class_id === 1 ? 'no-damage' : moveFound.damage_class_id === 2 ? 'physical' : 'special')
  //       movesAssociationArray.push({
  //         pokemon_id: move.pokemon_id,
  //         move: {
  //           id: moveFound.id,
  //           name: moveFound.identifier,
  //           type: typeById[moveFound.type_id],
  //           category: moveFound.damage_class_id === 1 ? 'no-damage' : moveFound.damage_class_id === 2 ? 'physical' : 'special',
  //           power: moveFound.power,
  //           accuracy: moveFound.accuracy,
  //           pp: moveFound.pp,
  //           priority: moveFound.priority,
  //           target: targets.find((t) => t.id === moveFound.target_id).identifier,
  //           effect: moveEffectFound,
  //           effectChance: moveFound.effect_chance === '' ? 100 : moveFound.effect_chance,
  //           description: moveEffectFound.short_effect
  //         },
  //         level: move.level
  //       });
  //     }
  //   });

  movesAssociationArray = movesAssociationArray.filter((move, index, self) => {
    return index === self.findIndex((t) => (
      t.pokemon_id === move.pokemon_id && t.move.id === move.move.id
    ));
  });
  console.log(movesAssociationArray.length);

  fs.writeFile("./move-associations.json", JSON.stringify(movesAssociationArray), (error) => {
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
