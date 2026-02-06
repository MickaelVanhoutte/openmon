import fs from 'fs';
import pokemons from '/Users/perso/workspace/perso/openmon/src/assets/data/final/beta/pokedex-animatedV3.json' assert { type: 'json' };

let missing = [];

pokemons.forEach((pokemon, index) => {
	let regionalId = ('00' + pokemon.regionalId).slice(-3);
	let newId = ('00' + pokemon.id).slice(-3);
	let folder = '/Users/perso/workspace/perso/walking/' + regionalId;
	let normalFile = folder + '.png';
	let shinyFile = folder + 's.png';

	// hisui
	let hisuiFile = folder + 'h.png';
	let hisuiShinyFile = folder + 'hs.png';
	//galar
	let galarFile = folder + 'G.png';
	let galarShinyFile = folder + 'Gs.png';

	let alolanFile = folder + 'A.png';
	let alolanShinyFile = folder + 'As.png';

	if (pokemon.region === 'hisuian' && fs.existsSync(hisuiFile)) {
		fs.copyFileSync(
			hisuiFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + '.png'
		);
		if (fs.existsSync(hisuiShinyFile)) {
			console.log('copied ' + pokemon.name + ' - ' + hisuiShinyFile);
			fs.copyFileSync(
				hisuiShinyFile,
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
			);
		} else {
			fs.copyFileSync(
				hisuiFile,
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
			);
		}
	} else if (pokemon.region === 'galarian' && fs.existsSync(galarFile)) {
		console.log('copied ' + pokemon.name + ' - ' + galarFile);
		fs.copyFileSync(
			galarFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + '.png'
		);
		if (fs.existsSync(galarShinyFile)) {
			fs.copyFileSync(
				galarShinyFile,
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
			);
		} else {
			fs.copyFileSync(
				galarFile,
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
			);
		}
	} else if (pokemon.region === 'alolan' && fs.existsSync(alolanFile)) {
		fs.copyFileSync(
			alolanFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + '.png'
		);
		console.log('copied ' + pokemon.name + ' - ' + alolanShinyFile);
		fs.copyFileSync(
			alolanShinyFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
		);

		if (fs.existsSync(alolanShinyFile)) {
			fs.copyFileSync(
				alolanShinyFile,
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
			);
		} else {
			fs.copyFileSync(
				alolanFile,
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
			);
		}
	} else if (fs.existsSync(normalFile) && fs.existsSync(shinyFile)) {
		console.log('copied ' + pokemon.name + ' - ' + normalFile);
		fs.copyFileSync(
			normalFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + '.png'
		);
		fs.copyFileSync(
			shinyFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/walking/' + newId + 's.png'
		);
	} else {
		console.log('Missing :' + regionalId + ' ' + pokemon.name);
		missing.push(regionalId + ' - ' + pokemon.name);
	}
});

missing.forEach((miss) => {
	console.log(miss);
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
