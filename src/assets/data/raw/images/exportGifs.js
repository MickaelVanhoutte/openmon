import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

ids.forEach((id, index) => {
    let number = ("00" + id).slice(-3);
    let folder = '/Users/perso/workspace/perso/bw-animated/';

    let front = folder + number + '.gif';
    let frontS = folder + number + 's.gif';
    let back = folder + number + 'b.gif';
    let backS = folder + number + 'sb.gif';

    let newNumber = ("00" + (index + 1)).slice(-3);

    if (fs.existsSync(front) && fs.existsSync(frontS) && fs.existsSync(back) && fs.existsSync(backS)) {
        //console.log('Copying ' + number + '...')
        fs.copyFileSync(front, '../../../monsters/animated/' + newNumber + '.gif');
        fs.copyFileSync(frontS, '../../../monsters/animated/' + newNumber + 's.gif');
        fs.copyFileSync(back, '../../..//monsters/animated/' + newNumber + 'b.gif');
        fs.copyFileSync(backS, '../../../monsters/animated/' + newNumber + 'bs.gif');
    }else{
        console.log('Missing ' + number);
    }
});