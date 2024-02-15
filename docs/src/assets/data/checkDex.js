import pokedex from './final/pokedexBW-animated2.json' assert {type: 'json'};
import fs from "fs";

/*
console.log(pokedex.length);

let idx = 0;

console.log(pokedex[idx]);
pokedex[2].moves.forEach((move) => {
    console.log(move.name, move.level );
});
*/
let movesImpl = [1, 2, 3, 4, 5, 6, 7, 11, 12, 14, 17, 19, 20, 21, 24];
let toImpl = {};

pokedex.forEach((pokemon) => {
    pokemon.moves.filter((move) => !movesImpl.includes(move.effect?.move_effect_id)).map((move) => {
        /*console.log(move.name, move.level);*/
        if (toImpl[move.effect?.move_effect_id + ' : ' + move.effect?.short_effect] === undefined) {
            toImpl[move.effect?.move_effect_id + ' : ' + move.effect?.short_effect] = [];
        }
        toImpl[move.effect?.move_effect_id + ' : ' + move.effect?.short_effect].push(pokemon.name);
    });
});


//console.log(toImpl);

/*Object.keys(toImpl).forEach((key) => {

    if(toImpl[key].length < 5) {
        console.log('---------------------');
        console.log(key);
    }
});*/

// sort toImpl by lengths
let sortable = [];
for (let key in toImpl) {
    sortable.push([key, toImpl[key]]);
}

sortable.sort((a, b) => {
    return b[1].length - a[1].length;
});
console.log(sortable.filter((item) => item[1].length >= 5).map((item) => item[0] + ' : ' + item[1].length)) ;


fs.writeFile("./moves-impl-order.json", JSON.stringify(sortable.map((item) => 'id : ' + item[0].split(':')[0] + ', nb poke : ' + item[1].length + ', effect : ' +  item[0].split(':')[1])), (error) => {
    // throwing the error
    // in case of a writing problem
    if (error) {
        // logging the error
        console.error(error);

        throw error;
    }
});
