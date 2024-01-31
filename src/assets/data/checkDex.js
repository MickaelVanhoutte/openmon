import pokedex from './final/pokedex.json' assert {type: "json"};

console.log(pokedex.length);

let idx = 36;

console.log(pokedex[250]);
pokedex[250].moves.forEach((move) => {
    console.log(pokedex[250].name, move.name, move.accuracy, move.effectChance);
});
