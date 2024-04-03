import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

ids.forEach((id, index) => {
    let number = ("00" + id).slice(-3);
    let folder = '/Users/perso/workspace/perso/Pokemon/assets/images/' + number;
    let normalFile = folder + '.png';
    let galarFile = folder + '-Galar.png';
    let alolanFile = folder + '-Alola.png';
    let hisuiFile = folder + '-Hisui.png';

    let newNumber = ("00" + (index + 1)).slice(-3);

    if (fs.existsSync(hisuiFile) && number !== '215' && number !== '724') {
        fs.copyFileSync(hisuiFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png');
    }else if (fs.existsSync(galarFile)  && number !== '199') {
        fs.copyFileSync(galarFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png');
    } else if (fs.existsSync(alolanFile)) {
        fs.copyFileSync(alolanFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png');
    } else if (fs.existsSync(normalFile)) {
        fs.copyFileSync(normalFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png');
    } else {
        console.log('Missing ' + number);
    }
});