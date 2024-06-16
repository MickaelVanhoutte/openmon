import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};
import pokedex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};


let miss =[];
pokedex.forEach((pokemon, index) => {
    let name = pokemon.name.replace(' ', '').replace('-', '').toLowerCase();
    if(name.includes('♀')){
        name = name.replace('♀', 'f');
    }else if(name.includes('♂')){
        name = name.replace('♂', 'm');
    }
    let newNumber = ("00" + (index + 1)).slice(-3);
    //console.log(name);
    let normalName = name + '.png';
    let galarName = name + '-galar.png';
    let alolanName = name + '-alola.png';
    let hisuiName = name + '-hisui.png';
    //console.log('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+normalName);


    if (fs.existsSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+hisuiName) && newNumber !== '091' && newNumber !== '003') {
        console.log('export hisuian' + newNumber + ' ' + hisuiName)
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/'+hisuiName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png');
    }else if (fs.existsSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+galarName) && newNumber != '171') {
        console.log('export galar' + newNumber + ' ' + galarName)
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/'+galarName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png');
    } else if (fs.existsSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+alolanName)  && newNumber !== '165') {
        console.log('export alolan' + newNumber + ' ' + alolanName)
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/'+alolanName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png');
    } else if (fs.existsSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+normalName)) {
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png');
        fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/'+normalName, '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png');
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