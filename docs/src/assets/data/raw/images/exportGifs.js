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
let miss =[];
pokedex.forEach((pokemon, index) => {
    let name = pokemon.name.replace(' ', '').replace('-', '').toLowerCase();
    if(name.includes('♀')){
        name = name.replace('♀', 'f');
    }else if(name.includes('♂')){
        name = name.replace('♂', 'm');
    }
    let newNumber = ("00" + (index + 1)).slice(-3);
    console.log(name);
    let normalName = name + '.gif';
    let galarName = name + '-galar.gif';
    let alolanName = name + '-alola.gif';
    let hisuiName = name + '-hisui.gif';
    console.log('/Users/perso/workspace/perso/showdown/sprites/ani/'+normalName);


    if (fs.existsSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+hisuiName) && newNumber !== '215' && newNumber !== '724') {
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-shiny/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back-shiny/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif');
    }else if (fs.existsSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+galarName)) {
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-shiny/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back-shiny/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif');
    } else if (fs.existsSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+alolanName)  && newNumber !== '165') {
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-shiny/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back-shiny/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif');
    } else if (fs.existsSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+normalName)) {
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-shiny/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/sprites/ani-back-shiny/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif');
    } else {
        miss.push(name);
        console.log('Missing ' + newNumber);
    }


    // if (fs.existsSync(front) && fs.existsSync(frontS) && fs.existsSync(back) && fs.existsSync(backS)) {
    //     // TODO fix nidoran
    //     fs.copyFileSync(front, '../../../monsters/animated/' + newNumber + '.gif');
    //     fs.copyFileSync(frontS, '../../../monsters/animated/' + newNumber + 's.gif');
    //     fs.copyFileSync(back, '../../..//monsters/animated/' + newNumber + 'b.gif');
    //     fs.copyFileSync(backS, '../../../monsters/animated/' + newNumber + 'sb.gif');
    // }else{
    //     console.log('Missing ' + newNumber);
    // }

});
console.log('Missing:' + miss.length);
console.log(miss);