import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

ids.forEach((id, index) => {
    let number = ("00" + id).slice(-3);
    let folder = '/Users/perso/workspace/perso/Pokemon/assets/images/'+ number;
    let normalFile = folder + '.png';

    let newNumber = ("00" + (index + 1)).slice(-3);

    if(fs.existsSync(normalFile)) {
        fs.copyFileSync(normalFile, '../../../monsters/pokedex/' + newNumber + '.png');
    }else{
        console.log('Missing ' + number);
    }
});