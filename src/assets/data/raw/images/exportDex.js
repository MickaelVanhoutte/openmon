import fs from 'fs';
import pokedex from '../../final/beta/pokedex-animatedV3.json' assert { type: 'json' };

pokedex.forEach((pokemon, index) => {
	let number = ('00' + pokemon.regionalId).slice(-3);
	let folder = '/Users/perso/workspace/perso/Pokemon/assets/images/' + number;
	let normalFile = folder + '.png';
	let galarFile = folder + '-Galar.png';
	let alolanFile = folder + '-Alola.png';
	let hisuiFile = folder + '-Hisui.png';

	let newNumber = ('00' + (index + 1)).slice(-3);

	console.log('number', number, pokemon.region);

	if (pokemon.region === 'hisuian' && fs.existsSync(hisuiFile)) {
		fs.copyFileSync(
			hisuiFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png'
		);
	} else if (pokemon.region === 'galarian' && fs.existsSync(galarFile)) {
		fs.copyFileSync(
			galarFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png'
		);
	} else if (pokemon.region === 'alolan' && fs.existsSync(alolanFile)) {
		fs.copyFileSync(
			alolanFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png'
		);
	} else if (fs.existsSync(normalFile)) {
		fs.copyFileSync(
			normalFile,
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/pokedex/' + newNumber + '.png'
		);
	} else {
		console.log('Missing ' + number);
	}
});
