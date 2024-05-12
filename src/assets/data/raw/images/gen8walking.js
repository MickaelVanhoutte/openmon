import fs from "fs";

//const sourcePath = '/Users/perso/workspace/perso/walking-gen8/Regular/';
//const shinySourcePath = '/Users/perso/workspace/perso/walking-gen8/Shiny/';

//const sourcePath = '/Users/perso/workspace/perso/walking-all/'
//const destPath = '/Users/perso/workspace/perso/walking2/';

import ids from '../dex/pokemon-ids.json' assert {type: 'json'};

// ids.forEach((id, index) => {
//     let number = ("00" + id).slice(-3);
//     let newNumber = ("00" + (index + 1)).slice(-3);

//     let file2 = sourcePath + id + "_2.png";
//     let file2s = sourcePath + id + "s_2.png";
//     let file1 = sourcePath + id + "_1.png";
//     let file1s = sourcePath + id + "s_1.png";
//     let file = sourcePath + number + ".png";
//     let files = sourcePath + number + "s.png";

//     if (fs.existsSync(file2)) {
//         fs.copyFileSync(file2, destPath + newNumber + '.png');
//         fs.copyFileSync(file2s, destPath + newNumber + 's.png');
//     } else if (fs.existsSync(file1)) {
//         fs.copyFileSync(file1, destPath + newNumber + '.png');
//         fs.copyFileSync(file1s, destPath + newNumber + 's.png');
//     } else {
//         fs.copyFileSync(file, destPath + newNumber + '.png');
//         fs.copyFileSync(files, destPath + newNumber + 's.png');
//     }
// });


import imageSize from 'image-size';
const sourcePath = '/Users/perso/workspace/perso/openmon/src/assets/monsters/walking'
fs.readdir(sourcePath, (err, files) => {
    files.forEach(file => {
        if (file.includes('.png')) {
            let dimensions = imageSize(sourcePath + '/' + file);
            if (dimensions.width !== 256 || dimensions.height !== 256) {
                console.log(file + ' ' + dimensions.width + 'x' + dimensions.height);
            }
        }
    });
});





//foreach files in sourcePath
// fs.readdir(sourcePath, (err, files) => {
//     if (err) {
//         console.error(err);
//         return;
//     }

//     files.forEach(file => {
//         let number = file.split(' - ')[0];
//         let newNumber = ("00" + number).slice(-3);

//         if (fs.existsSync(sourcePath + file)) {
//             console.log('copying ' + sourcePath + file + ' to ' + destPath + newNumber + (file.includes('Galarian') ? 'G' : '') + (file.includes('ManyBattles') ? '*' : '') + '.png')
//             fs.copyFileSync(sourcePath + file, destPath + newNumber + (file.includes('Galarian') ? 'G' : '') + (file.includes('ManyBattles') ? '*' : '') + '.png');
//         } else {
//             console.log('Missing ' + number);
//         }
//     });
// });

// fs.readdir(shinySourcePath, (err, files) => {
//     if (err) {
//         console.error(err);
//         return;
//     }

//     files.forEach(file => {
//         let number = file.split(' - ')[0];
//         let newNumber = ("00" + number).slice(-3);

//         if (fs.existsSync(shinySourcePath + file)) {
//             fs.copyFileSync(shinySourcePath + file, destPath + newNumber + (file.includes('Galarian') ? 'G' : '') + (file.includes('ManyBattles') ? '*' : '') + 's.png');
//         } else {
//             console.log('Missing ' + number);
//         }
//     });
// });