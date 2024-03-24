import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};
import pokedex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};

// ids.forEach((id, index) => {
//     let number = ("00" + id).slice(-3);
//     let folder = '/Users/perso/workspace/perso/bw-animated/';

//     let front = folder + number + '.gif';
//     let frontS = folder + number + 's.gif';
//     let back = folder + number + 'b.gif';
//     let backS = folder + number + 'sb.gif';

//     let newNumber = ("00" + (index + 1)).slice(-3);

//     if (fs.existsSync(front) && fs.existsSync(frontS) && fs.existsSync(back) && fs.existsSync(backS)) {
//         //console.log('Copying ' + number + '...')
//         fs.copyFileSync(front, '../../../monsters/animated/' + newNumber + '.gif');
//         fs.copyFileSync(frontS, '../../../monsters/animated/' + newNumber + 's.gif');
//         fs.copyFileSync(back, '../../..//monsters/animated/' + newNumber + 'b.gif');
//         fs.copyFileSync(backS, '../../../monsters/animated/' + newNumber + 'bs.gif');
//     }else{
//         console.log('Missing ' + number);
//     }
// });

pokedex.forEach((pokemon, index) => {
    let name = pokemon.name;
    if(name.includes('♀')){
        name = name.replace('♀', '_f');
    }else if(name.includes('♂')){
        name = name.replace('♂', '_m');
    }
    let newNumber = ("00" + (index + 1)).slice(-3);
    console.log(name);
    let front = '/Users/perso/workspace/perso/showdown/sprites/ani/' + name + '.gif';
    let frontS = '/Users/perso/workspace/perso/showdown/sprites/ani-shiny/' + name + '.gif';
    let back = '/Users/perso/workspace/perso/showdown/sprites/ani-back/' + name + '.gif';
    let backS = '/Users/perso/workspace/perso/showdown/sprites/ani-back-shiny/' + name + '.gif';

    if (fs.existsSync(front) && fs.existsSync(frontS) && fs.existsSync(back) && fs.existsSync(backS)) {
        //console.log('Copying ' + number + '...')
        fs.copyFileSync(front, '../../../monsters/animated/' + newNumber + '.gif');
        fs.copyFileSync(frontS, '../../../monsters/animated/' + newNumber + 's.gif');
        fs.copyFileSync(back, '../../..//monsters/animated/' + newNumber + 'b.gif');
        fs.copyFileSync(backS, '../../../monsters/animated/' + newNumber + 'sb.gif');
    }else{
        console.log('Missing ' + newNumber);
    }

});