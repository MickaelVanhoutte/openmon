import fs from "fs";
import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

ids.forEach((id, index) => {
    let number = ("00" + id).slice(-3);
    let folder = '/Users/perso/workspace/perso/walking/'+ number;
    let normalFile = folder + '.png';
    let shinyFile = folder + 's.png';
    let newNumber = ("00" + (index + 1)).slice(-3);

    if(fs.existsSync(normalFile) && fs.existsSync(shinyFile)) {
        fs.copyFileSync(normalFile, '../../../monsters/walking/' + newNumber + '.png');
        fs.copyFileSync(shinyFile, '../../../monsters/walking/' + newNumber + 's.png');
    }else{
        console.log('Missing ' + number);
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
