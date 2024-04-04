import ids from './pokemon-ids.json' assert {type: 'json'};
import dex from '/Users/perso/workspace/perso/openmon/src/assets/data/final/beta/pokedex-animatedV3.json' assert {type: 'json'};

// sort dex by regionalId
let sortedDex = dex.sort((a, b) => a.regionalId - b.regionalId);
sortedDex.map(pokemon => pokemon.regionalId).forEach((id, index) => {
    console.log(id + ',')
});