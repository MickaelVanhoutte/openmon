import items from '../../items-all.json' assert { type: 'json' };
import proses from '../../items-prose.json' assert { type: 'json' };
import fs from 'fs';

let merged = [];
// healing,revive, balls
let handledTypes = [27, 29, 34];

items
	.filter((item) => handledTypes.includes(item.category_id))
	.forEach((item) => {
		let merge = {
			id: item.id,
			name: item.identifier,
			description: proses.find((p) => p.item_id === item.id && p.local_language_id === 9)
				?.short_effect
		};

		merged.push(merge);
	});

console.log(merged);

fs.writeFile('./items.json', JSON.stringify(merged), (error) => {
	// throwing the error
	// in case of a writing problem
	if (error) {
		// logging the error
		console.error(error);

		throw error;
	}
});
