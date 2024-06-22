import ids from './pokemon-ids.json' assert {type: 'json'};
import pokedex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};
import babar from 'babar';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
// to map of types, number of pokemons for this type 

let types = 
// ids.map(id => {
//     return pokedex.find(pokemon => pokemon.id === id);
// })
pokedex
.reduce((acc, pokemon) => {
    //console.log(pokemon.name?.english);

    let type = pokemon.types[0];
    if (acc[type]) {
        acc[type]++;
    } else {
        acc[type] = 1;
    }

    if (pokemon.types[1]) {
        type = pokemon.types[1];
        if (acc[type]) {
            acc[type]++;
        } else {
            acc[type] = 1;
        }
    }

    return acc;
}, {});


// sort by number of pokemons for this type

types = Object.entries(types).sort((a, b) => a[1] - b[1]);

console.log(ids?.length);

let screen = blessed.screen()
     , bar = contrib.bar(
        { label: 'Pokemons by type'
        , barWidth: 6
        , barSpacing: 8
        , xOffset: 0
        , maxHeight: 9})
     screen.append(bar) //must append before setting data
     bar.setData(
        { titles: types.map((type, idx) => type[0].substring(0, 6))
        , data: types.map(type => type[1])})
   screen.render()

// get every pokemons with higher sp.attack than attack
let spAttack = [];
let attack = [];
pokedex.map(pk => {
    if (pk?.stats.specialAttack > pk?.stats.attack) {
        spAttack.push(pk);
    }else {
        attack.push(pk);
    }
});
console.log(spAttack?.length, ids?.length - spAttack?.length);
//console.log(spAttack);


// every flying :
// let flying = ids.map(id => {
//     return pokedex.find(pokemon => pokemon.id === id);
// }).filter(pokemon => pokemon.type[0] === 'Flying' || pokemon.type[1] === 'Flying')
// .filter(pokemon => pokemon)
// .map(pokemon => pokemon.name?.english);

// console.log(flying);

// // every fighting :
// let fighting = ids.map(id => {
//     return pokedex.find(pokemon => pokemon.id === id);
// }).filter(pokemon => pokemon.type[0] === 'Fighting' || pokemon.type[1] === 'Fighting').map(pokemon => pokemon.name?.english);

// console.log(fighting);

// // every rock :
// let rock = ids.map(id => {
//     return pokedex.find(pokemon => pokemon.id === id);
// }).filter(pokemon => pokemon.type[0] === 'Rock' || pokemon.type[1] === 'Rock').map(pokemon => pokemon.name?.english);

// console.log(rock);


// min an max heights
// import dex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};

// let minHeight= 0;
// let maxHeight = 0;
// let heights=[];
// ids.map(id => {
//     return dex.find(pokemon => pokemon.regionalId === id);
// }).forEach(pokemon => {
//     heights.push(pokemon.height);
// });
// heights.sort((a, b) => a - b);

// console.log(heights);
// // log last 10 entries
// console.log(heights.slice(-10));