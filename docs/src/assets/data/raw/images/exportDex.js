import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

ids.forEach((id) => {
    let number = ("00" + id).slice(-3);
    let folder = '/Users/perso/workspace/perso/Pokemon/assets/images/'+ number;
    let normalFile = folder + '.png';

    if(fs.existsSync(normalFile)) {
        fs.copyFileSync(normalFile, '../../../monsters/pokedex/' + number + '.png');
    }else{
        console.log('Missing ' + number);
    }
});