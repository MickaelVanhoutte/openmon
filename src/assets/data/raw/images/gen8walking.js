import fs from "fs";

const sourcePath = '/Users/perso/workspace/perso/walking-gen8/Regular/';
const shinySourcePath = '/Users/perso/workspace/perso/walking-gen8/Shiny/';
const destPath = '/Users/perso/workspace/perso/walking/';

//foreach files in sourcePath
fs.readdir(sourcePath, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    files.forEach(file => {
        let number = file.split(' - ')[0];
        let newNumber = ("00" + number).slice(-3);

        if (fs.existsSync(sourcePath + file)) {
            fs.copyFileSync(sourcePath + file, destPath + newNumber + (file.includes('Galarian') ? 'G' : '') + (file.includes('ManyBattles') ? '*' : '') + '.png');
        } else {
            console.log('Missing ' + number);
        }
    });
});

fs.readdir(shinySourcePath, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    files.forEach(file => {
        let number = file.split(' - ')[0];
        let newNumber = ("00" + number).slice(-3);

        if (fs.existsSync(shinySourcePath + file)) {
            fs.copyFileSync(shinySourcePath + file, destPath + newNumber + (file.includes('Galarian') ? 'G' : '') + (file.includes('ManyBattles') ? '*' : '') + 's.png');
        } else {
            console.log('Missing ' + number);
        }
    });
});