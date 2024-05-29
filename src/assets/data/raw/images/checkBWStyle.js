import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};
import dex from '../../final/beta/pokedex-animatedV3.json' assert {type: 'json'};

/*
Missing: 
zorua hisui
sandswrew alola
vulpix alola
ninetales alola
ratata alola
rapidash alola
electrode hisui
growlithe hisui
arcanine hisui
marowak alola
sliggoo galar
zapdos galar
moltres galar

dartrix
 decidueye
 delphox
 phantump
 sinistea
 polteageist
 fletchinder
 aurorus
 golisopod
 hawlucha
 sizzlipede
 centiskorch
 salandit
 salazzle
 helioptile
 heliolisk
 dreepy
 drakloak
 tapubulu
 tapufini

*/

ids.forEach((id, index) => {
    let dexEntry = dex.find(entry => entry.regionalId === id);
    let name = dexEntry?.name.toLocaleLowerCase().replace('♀', 'f').replace('♂', 'm').replace('-', '').replace(' ', '');

    let folder = '/Users/perso/Documents/gen5ani/play.pokemonshowdown.com/sprites/gen5ani/';
    let backfolder = '/Users/perso/Documents/gen5ani/play.pokemonshowdown.com/sprites/gen5ani-back/';
    let shinyfolder = '/Users/perso/Documents/gen5ani/play.pokemonshowdown.com/sprites/gen5ani-shiny/';
    let shinyBackfolder = '/Users/perso/Documents/gen5ani/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/';

    let normalFile = folder + name + '.gif';
    let galarFile = folder + name + '-galar.gif';
    let alolanFile = folder + name + '-alola.gif';
    let hisuiFile = folder + name + '-hisui.gif';

    let normalFileBack = backfolder + name + '.gif';
    let galarFileBack = backfolder + name + '-galar.gif';
    let alolanFileBack = backfolder + name + '-alola.gif';
    let hisuiFileBack = backfolder + name + '-hisui.gif';

    let normalFileShiny = shinyfolder + name + '.gif';
    let galarFileShiny = shinyfolder + name + '-galar.gif';
    let alolanFileShiny = shinyfolder + name + '-alola.gif';
    let hisuiFileShiny = shinyfolder + name + '-hisui.gif';

    let normalFileShinyBack = shinyBackfolder + name + '.gif';
    let galarFileShinyBack = shinyBackfolder + name + '-galar.gif';
    let alolanFileShinyBack = shinyBackfolder + name + '-alola.gif';
    let hisuiFileShinyBack = shinyBackfolder + name + '-hisui.gif';

    let number = ("00" + id).slice(-3);
    let newNumber = ("00" + (index + 1)).slice(-3);

    try {
        if (fs.existsSync(hisuiFile) && number !== '215' && number !== '724') {
            fs.copyFileSync(hisuiFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + '.gif');
            fs.copyFileSync(hisuiFileBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'b.gif');
            fs.copyFileSync(hisuiFileShiny, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 's.gif');
            fs.copyFileSync(hisuiFileShinyBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'sb.gif');
        } else if (fs.existsSync(galarFile)) {
            fs.copyFileSync(galarFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + '.gif');
            fs.copyFileSync(galarFileBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'b.gif');
            fs.copyFileSync(galarFileShiny, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 's.gif');
            fs.copyFileSync(galarFileShinyBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'sb.gif');
        } else if (fs.existsSync(alolanFile)) {
            fs.copyFileSync(alolanFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + '.gif');
            fs.copyFileSync(alolanFileBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'b.gif');
            fs.copyFileSync(alolanFileShiny, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 's.gif');
            fs.copyFileSync(alolanFileShinyBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'sb.gif');
        } else if (fs.existsSync(normalFile)) {
            fs.copyFileSync(normalFile, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + '.gif');
            fs.copyFileSync(normalFileBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'b.gif');
            fs.copyFileSync(normalFileShiny, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 's.gif');
            fs.copyFileSync(normalFileShinyBack, '/Users/perso/workspace/perso/openmon/src/assets/monsters/animatedBW/' + newNumber + 'sb.gif');
        } else {
            console.log('Missing ' + number);
        }
    } catch (e) {
        //
    }
});
