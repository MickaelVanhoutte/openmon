import moves from "./moves.json" assert {type: "json"};

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

const movesCat = {
    2: 'physical',
    3: 'special',
    1: 'status'
}

let cat = 2;
let type = 12;

let movesFromJson = moves;
//|| move.damage_class_id === 1
movesFromJson.filter((move) => move.type_id === type && (move.damage_class_id === cat))
.sort((a, b) => a.identifier.localeCompare(b.identifier))
.forEach((move) => {
    console.log(move.id, move.identifier, (move.power || '/' ), move.pp, (move.accuracy || '/'));
});