import fs from 'fs';
import ids from '../dex/pokemon-ids.json' assert { type: 'json' };
import dex from '../../final/beta/pokedex-animatedV3.json' assert { type: 'json' };

let missing = [];
let animated = [];
let realAnimated = [];

dex.forEach((dexEntry) => {
	let number = ('00' + dexEntry?.id).slice(-3);
	const basePath = '/Users/perso/workspace/perso/openmon/src/assets/monsters';

	if (!dexEntry) {
		console.log('Missing ' + id);
	}

	//overworld check
	let owFilePath = basePath + '/walking/' + number + '.png';
	let owSfilePath = basePath + '/walking/' + number + '.png';

	if (!fs.existsSync(owFilePath)) {
		missing.push(owFilePath);
	}
	if (!fs.existsSync(owSfilePath)) {
		missing.push(owFilePath);
	}

	// dex check
	let dexFilePath = basePath + '/pokedex/' + number + '.png';
	if (!fs.existsSync(dexFilePath)) {
		missing.push(dexFilePath);
	}

	// sprite check

	let spriteFilePath = basePath + '/static/' + number + '.png';
	let spriteBFilePath = basePath + '/static/' + number + 'b.png';
	let spriteSFilePath = basePath + '/static/' + number + 's.png';
	let spriteBSFilePath = basePath + '/static/' + number + 'sb.png';

	if (!fs.existsSync(spriteFilePath)) {
		missing.push(spriteFilePath);
	}
	if (!fs.existsSync(spriteBFilePath)) {
		missing.push(spriteBFilePath);
	}
	if (!fs.existsSync(spriteSFilePath)) {
		missing.push(spriteSFilePath);
	}
	if (!fs.existsSync(spriteBSFilePath)) {
		missing.push(spriteBSFilePath);
	}

	// animated check
	let animatedFilePath = basePath + '/animated/' + number + '.gif';
	let animatedSFilePath = basePath + '/animated/' + number + 's.gif';
	let animatedBFilePath = basePath + '/animated/' + number + 'b.gif';
	let animatedSBFilePath = basePath + '/animated/' + number + 'sb.gif';

	if (!fs.existsSync(animatedFilePath)) {
		animated.push(animatedFilePath);
	}
	if (!fs.existsSync(animatedSFilePath)) {
		animated.push(animatedSFilePath);
	}
	if (!fs.existsSync(animatedBFilePath)) {
		animated.push(animatedBFilePath);
	}
	if (!fs.existsSync(animatedSBFilePath)) {
		animated.push(animatedSBFilePath);
	}

	let name = dexEntry?.name
		.toLocaleLowerCase()
		.replace('♀', 'f')
		.replace('♂', 'm')
		.replace('-', '')
		.replace(' ', '');
	if (dexEntry?.region === 'hisuian') {
		name = name + '-hisui';
	} else if (dexEntry?.region === 'galarian') {
		name = name + '-galar';
	} else if (dexEntry?.region === 'alolan') {
		name = name + '-alola';
	}
	const path = '/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani';
	const spath =
		'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny';
	const bpath =
		'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back';
	const sbpath =
		'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny';

	let realAnimatedFilePath = path + '/' + name + '.gif';
	let realAnimatedSFilePath = spath + '/' + name + '.gif';
	let realAnimatedBFilePath = bpath + '/' + name + '.gif';
	let realAnimatedSBFilePath = sbpath + '/' + name + '.gif';

	if (!fs.existsSync(realAnimatedFilePath)) {
		realAnimated.push(realAnimatedFilePath);
	}
	if (!fs.existsSync(realAnimatedSFilePath)) {
		realAnimated.push(realAnimatedSFilePath);
	}
	if (!fs.existsSync(realAnimatedBFilePath)) {
		realAnimated.push(realAnimatedBFilePath);
	}
	if (!fs.existsSync(realAnimatedSBFilePath)) {
		realAnimated.push(realAnimatedSBFilePath);
	}
});

console.log('checking static files present');
console.log(missing.join('\n'));
console.log('Total: ' + missing.length + '/ ' + ids.length);

console.log('checking animated files present');
console.log(animated.join('\n'));
console.log('Total: ' + animated.length + '/ ' + ids.length);

console.log('checking real animated files present');
console.log(realAnimated.join('\n'));
console.log('Total: ' + realAnimated.length + '/ ' + ids.length);

// let total = 0;
// ids.forEach((id, index) => {
//     let dexEntry = dex.find(entry => entry.regionalId === id);
//     let name = dexEntry?.name.toLocaleLowerCase().replace('♀', 'f').replace('♂', 'm').replace('-', '').replace(' ', '');
//     let filePath = '/Users/perso/Documents/gen5ani/play.pokemonshowdown.com/sprites/gen5ani/' + name + '.gif';

//     if (!fs.existsSync(filePath)) {
//         console.log('Missing ' + name);
//     } else {
//         total++;
//     }
// });

// console.log('Total: ' + total + '/ ' + dex.length);
