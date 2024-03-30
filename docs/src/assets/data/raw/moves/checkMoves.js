import movesAss from "./move-associations.json" assert {type: "json"};
import moves from "./moves.json" assert {type: "json"};
import fs from "fs";

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

const movesCat = {
    1: 'physical',
    2: 'special',
    3: 'status'
}

let movesFromJson = movesAss;
let uniqueMoves = new Set([]);

for (let i = 0; i < movesFromJson.length; i++) {
    uniqueMoves.add(movesFromJson[i].move.id);
}

console.log(uniqueMoves.size);

let movesUniq = [];
uniqueMoves = Array.from(uniqueMoves);
uniqueMoves.forEach((move) => {
    let m = moves.find((m) => m.id === move);
    movesUniq.push({ id: m.id, name: m.identifier, type: typeById[m.type_id], cat: movesCat[m.damage_class_id], impl : false });
});

// sort by type and cat

movesUniq = movesUniq.sort((a, b) => {
    if (a.type === b.type) {
        return a.cat.localeCompare(b.cat);
    }
    return a.type.localeCompare(b.type);
});


// get string content of file perso/openmon/src/js/battle/animations/battle-animations.ts

let path = "/Users/perso/workspace/perso/openmon/src/js/battle/animations/battle-animations.ts";
let content = fs.readFileSync(path, 'utf8');

// update movesUniq impl if move name is present in content

movesUniq.forEach((m) => {
    if (content.includes(m.name)) {
        m.impl = true;
    }
});


movesUniq.filter(move => !move.impl).forEach((m) => {
    console.log(m);
});
console.log('implemented : ', movesUniq.filter(move => move.impl).length);
console.log('todo : ', movesUniq.filter(move => !move.impl).length);