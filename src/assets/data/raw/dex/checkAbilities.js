
import pokedex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};
import abilityJson from '../../final/beta/abilities.json' assert {type: 'json'};

//collect all abilities from pokedex
let abilities = pokedex.reduce((acc, pokemon) => {
    if(pokemon.abilities){
        pokemon.abilities.forEach(ability => {
            if(acc[ability]){
                acc[ability]++;
            }else {
                acc[ability] = 1;
            }
        });
    }
    return acc;
}, {});

//sort by number of pokemons for this ability
abilities = Object.entries(abilities).sort((a, b) => b[1] - a[1]);

console.log(abilities.length);

abilities.forEach(ability => {
    console.log(ability[0], ability[1], abilityJson.find(a => ability[0] === a.names)?.description);
});