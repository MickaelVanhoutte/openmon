import fs from "fs";
import pokemons from '../dex/pokedex-animatedV3.json' assert {type: 'json'};

pokemons.forEach((pokemon, index) => {
    let regionalId = ("00" + pokemon.regionalId).slice(-3);
    let newId = ("00" + pokemon.id).slice(-3);
    let folder = '/Users/perso/workspace/perso/walking/' + regionalId;
    let normalFile = folder + '.png';
    let shinyFile = folder + 's.png';

    // hisui
    let hisuiFile = folder + 'h.png';
    let hisuiShinyFile = folder + 'hs.png';
    //galar
    let galarFile = folder + 'G.png';
    let galarShinyFile = folder + 'Gs.png';

    let alolanFile = folder + 'A.png';
    let alolanShinyFile = folder + 'As.png';

    if (fs.existsSync(hisuiFile)) {
        fs.copyFileSync(hisuiFile, '../../../monsters/walking/' + newId + '.png');
        if (fs.existsSync(hisuiShinyFile)) {
            console.log('copied ' + pokemon.name + ' - ' + hisuiShinyFile);
            fs.copyFileSync(hisuiShinyFile, '../../../monsters/walking/' + newId + 's.png');
        } else {
            fs.copyFileSync(hisuiFile, '../../../monsters/walking/' + newId + 's.png');
        }

    } else if (fs.existsSync(galarFile)) {
        console.log('copied ' + pokemon.name + ' - ' + galarFile);
        fs.copyFileSync(galarFile, '../../../monsters/walking/' + newId + '.png');
        if (fs.existsSync(galarShinyFile)) {
            fs.copyFileSync(galarShinyFile, '../../../monsters/walking/' + newId + 's.png');
        } else {
            fs.copyFileSync(galarFile, '../../../monsters/walking/' + newId + 's.png');
        }
    } else if (fs.existsSync(alolanFile) && fs.existsSync(alolanShinyFile)) {
        fs.copyFileSync(alolanFile, '../../../monsters/walking/' + newId + '.png');
        console.log('copied ' + pokemon.name + ' - ' + alolanShinyFile)
        fs.copyFileSync(alolanShinyFile, '../../../monsters/walking/' + newId + 's.png');
    } else if (fs.existsSync(normalFile) && fs.existsSync(shinyFile)) {
        console.log('copied ' + pokemon.name + ' - ' + normalFile)
        fs.copyFileSync(normalFile, '../../../monsters/walking/' + newId + '.png');
        fs.copyFileSync(shinyFile, '../../../monsters/walking/' + newId + 's.png');
    } else {
        console.log('Missing :' + regionalId + ' ' + pokemon.name);
    }
});

// for(let i = 1; i <= 251; i++){
//     let id = ("00" + i).slice(-3);
//     let folder = './walking/'+ id;
//     let normalFile = folder + '.png';
//     let shinyFile = folder + 's.png';

//     if(fs.existsSync(normalFile)) {
//         fs.copyFileSync(normalFile, '../monsters/walking/' + id + '.png');
//         fs.copyFileSync(shinyFile, '../monsters/walking/' + id + 's.png');
//     }
// }
