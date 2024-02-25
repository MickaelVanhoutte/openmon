import fs from "fs";

for(let i = 1; i <= 251; i++){
    let id = ("00" + i).slice(-3);
    let folder = './walking/'+ id;
    let normalFile = folder + '.png';
    let shinyFile = folder + 's.png';

    if(fs.existsSync(normalFile)) {
        fs.copyFileSync(normalFile, '../monsters/walking/' + id + '.png');
        fs.copyFileSync(shinyFile, '../monsters/walking/' + id + 's.png');
    }
}
