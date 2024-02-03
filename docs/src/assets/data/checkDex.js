import pokedex from './final/pokedex.json' assert {type: "json"};

console.log(pokedex.length);

let idx = 0;

console.log(pokedex[idx]);
pokedex[2].moves.forEach((move) => {
    console.log(move.name, move.level );
});
