import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

ids.forEach((id) => {
    let number = ("00" + id).slice(-3);
    let folder = '/Users/perso/workspace/perso/bw-animated/';

    let front = folder + number + '.gif';
    let frontS = folder + number + 's.gif';
    let back = folder + number + 'b.gif';
    let backS = folder + number + 'sb.gif';

    if (fs.existsSync(front) && fs.existsSync(frontS) && fs.existsSync(back) && fs.existsSync(backS)) {
        //console.log('Copying ' + number + '...')
        fs.copyFileSync(front, '../../../monsters/animated/' + number + '.gif');
        fs.copyFileSync(frontS, '../../../monsters/animated/' + number + 's.gif');
        fs.copyFileSync(back, '../../..//monsters/animated/' + number + 'b.gif');
        fs.copyFileSync(backS, '../../../monsters/animated/' + number + 'bs.gif');
    }else{
        console.log('Missing ' + number);
    }
});