import fs from 'fs';
import ids from '../dex/pokemon-ids.json' assert { type: 'json' };
import pokedex from '../../final/beta/pokedex-animatedV3.json' assert { type: 'json' };
import ConvertAPI from 'convertapi';
import { exec } from 'child_process';

const convertapi = new ConvertAPI('3Ve7rH2sySilaj1X', {
	downloadTimeout: 1200,
	uploadTimeout: 1200
});

//import ConvertApi from 'convertapi-js'
//let convertApi = ConvertApi.auth('Qjn1pxBpnh6nfZed')

let miss = [];
let converted = [];
pokedex.forEach((pokemon, index) => {
	let name = pokemon.name.replace(' ', '').replace('-', '').toLowerCase();
	if (name.includes('♀')) {
		name = name.replace('♀', 'f');
	} else if (name.includes('♂')) {
		name = name.replace('♂', 'm');
	}
	let newNumber = ('00' + (index + 1)).slice(-3);
	//console.log(name);
	let normalName = name;
	let galarName = name + '-galar';
	let alolanName = name + '-alola';
	let hisuiName = name + '-hisui';
	//console.log('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/'+normalName);

	if (
		pokemon.region === 'hisuian' &&
		fs.existsSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				hisuiName +
				'.png'
		)
	) {
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				hisuiName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
				hisuiName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
				hisuiName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
				hisuiName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png'
		);
	} else if (
		pokemon.region === 'galarian' &&
		fs.existsSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				galarName +
				'.png'
		)
	) {
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				galarName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
				galarName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
				galarName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
				galarName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png'
		);
	} else if (
		pokemon.region === 'alolan' &&
		fs.existsSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				alolanName +
				'.png'
		)
	) {
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				alolanName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
				alolanName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
				alolanName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
				alolanName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png'
		);
	} else if (
		fs.existsSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				normalName +
				'.png'
		)
	) {
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
				normalName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
				normalName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
				normalName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.png'
		);
		fs.copyFileSync(
			'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
				normalName +
				'.png',
			'/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.png'
		);
	} else {
		miss.push(name);
	}

	if (pokemon.region === 'hisuian') {
		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					hisuiName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					hisuiName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
					hisuiName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
			converted.push(hisuiName);
		}
		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					hisuiName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					hisuiName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
					hisuiName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);

			converted.push(hisuiName + '-shiny');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' + hisuiName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					hisuiName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					hisuiName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
					hisuiName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);

			converted.push(hisuiName + '-back');

			// fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' + hisuiName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					hisuiName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					hisuiName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
					hisuiName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);

			converted.push(hisuiName + '-back-shiny');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' + hisuiName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.gif');
		}
	} else if (pokemon.region === 'galarian') {
		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					galarName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					galarName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
					galarName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);

			converted.push(galarName);
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' + galarName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					galarName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					galarName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
					galarName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);

			converted.push(galarName + '-shiny');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' + galarName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					galarName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					galarName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
					galarName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);
			converted.push(galarName + '-back');
			// fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' + galarName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					galarName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					galarName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
					galarName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);
			converted.push(galarName + '-back-shiny');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' + galarName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.gif');
		}
	} else if (pokemon.region === 'alolan') {
		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					alolanName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					alolanName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
					alolanName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
			converted.push(alolanName);
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' + alolanName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					alolanName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					alolanName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
					alolanName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);
			converted.push(alolanName + '-shiny');
			// fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' + alolanName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					alolanName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					alolanName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
					alolanName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);

			converted.push(alolanName + '-back');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' + alolanName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					alolanName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					alolanName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
					alolanName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);
			converted.push(alolanName + '-back-shiny');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' + alolanName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.gif');
		}
	} else {
		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					normalName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani/' +
					normalName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' +
					normalName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + '.gif'
			);
			converted.push(normalName);
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/' + normalName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + '.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					normalName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-shiny/' +
					normalName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' +
					normalName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 's.gif'
			);
			converted.push(normalName + '-shiny');
			// fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-shiny/' + normalName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 's.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					normalName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back/' +
					normalName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' +
					normalName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'b.gif'
			);

			converted.push(normalName + '-back');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back/' + normalName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'b.gif');
		}

		if (
			fs.existsSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					normalName +
					'.gif'
			)
		) {
			fs.copyFileSync(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5ani-back-shiny/' +
					normalName +
					'.gif',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);
		} else {
			convertAndSave(
				'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' +
					normalName +
					'.png',
				'/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/' + newNumber + 'sb.gif'
			);

			converted.push(normalName + '-back-shiny');
			//fs.copyFileSync('/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5-back-shiny/' + normalName + '.png', '/Users/perso/workspace/perso/openmon/src/assets/monsters/static/' + newNumber + 'sb.gif');
		}
	}

	// if (fs.existsSync(front) && fs.existsSync(frontS) && fs.existsSync(back) && fs.existsSync(backS)) {
	//     // TODO fix nidoran
	//     fs.copyFileSync(front, '../../../monsters/animated/' + newNumber + '.gif');
	//     fs.copyFileSync(frontS, '../../../monsters/animated/' + newNumber + 's.gif');
	//     fs.copyFileSync(back, '../../..//monsters/animated/' + newNumber + 'b.gif');
	//     fs.copyFileSync(backS, '../../../monsters/animated/' + newNumber + 'sb.gif');
	// }else{
	//     console.log('Missing ' + newNumber);
	// }
});
console.log('Missing:' + miss.length);
console.log(miss.join('\n'));

console.log('Converted:' + converted.length);
console.log(converted.join('\n'));

function convertAndSave(source, dest) {
	console.log('convertAndSave', source, dest);

	exec(
		"magick -dispose 2 '" + source + "' -trim -layers TrimBounds '" + dest + "'",
		(error, stdout, stderr) => {
			stderr && console.log(stderr);
		}
	);

	// convertapi.convert('gif', {
	//     Files: [source]
	// })
	//     .then(function (result) {
	//         return result.file.save(dest);
	//     })
	//     .catch(function (e) {
	//         console.error(e.toString());
	//     });
}
