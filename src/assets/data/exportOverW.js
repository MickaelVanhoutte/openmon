import fs from "fs";

for(let i = 1; i <= 251; i++){
    let id = ("000" + i).slice(-4);
    let folder = './sprite/'+ id + '/';
    let normalFile = folder + 'Walk-Anim.png';
    let shinyFile = folder + '/0000/0001/Walk-Anim.png';

    let newid = ("00" + i).slice(-3);
    if(fs.existsSync(normalFile)) {
        fs.copyFileSync(normalFile, '../monsters/walking/' + newid + '.png');
        fs.copyFileSync(shinyFile, '../monsters/walking/' + newid + 's.png');
    }
}
