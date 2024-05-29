import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};
import dex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};

let total = 0;
ids.forEach((id, index) => {
    let dexEntry = dex.find(entry => entry.regionalId === id);
    let name = dexEntry?.name.toLocaleLowerCase().replace('♀', 'f').replace('♂', 'm').replace('-', '').replace(' ', '');
    let filePath = '/Users/perso/Documents/gen5ani/play.pokemonshowdown.com/sprites/gen5ani/' + name + '.gif';

    if (!fs.existsSync(filePath)) {
        console.log('Missing ' + name);
    } else {
        total++;
    }
});

console.log('Total: ' + total + '/ ' + dex.length);