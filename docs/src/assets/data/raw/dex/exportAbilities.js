import names from './ability-names.json' assert { type: 'json' };
import flavor from './abilities-flavor.json' assert { type: 'json' };
import fs from 'fs';

let merged = [];

names
	.filter((name) => name.local_language_id === 9)
	.forEach((name) => {
		let merge = {
			id: name.ability_id,
			names: name.name,
			description: flavor.find((f) => f.ability_id === name.ability_id && f.local_language_id === 9)
				?.short_effect
		};
		merged.push(merge);
	});

console.log(merged);

fs.writeFile('./abilities.json', JSON.stringify(merged), (error) => {
	// throwing the error
	// in case of a writing problem
	if (error) {
		// logging the error
		console.error(error);

		throw error;
	}
});
