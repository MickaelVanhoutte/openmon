import ids from './pokemon-ids.json' assert {type: 'json'};
import pokedex from './pokedex-patched.json' assert {type: 'json'};
import pokemonWithXp from './poke-withXp.json' assert {type: 'json'};
import pokemonSpecies from './species.json' assert {type: 'json'};
import moveAssociations from '/Users/perso/workspace/perso/openmon/src/assets/data/final/beta/move-associations.json' assert {type: 'json'};
import * as fs from "fs";

const typeById = {
    1: 'normal',
    2: 'fighting',
    3: 'flying',
    4: 'poison',
    5: 'ground',
    6: 'rock',
    7: 'bug',
    8: 'ghost',
    9: 'steel',
    10: 'fire',
    11: 'water',
    12: 'grass',
    13: 'electric',
    14: 'psychic',
    15: 'ice',
    16: 'dragon',
    17: 'dark',
    18: 'fairy'
}

function exportPokemons() {

    let pIds = ids.map(id => id.split('-')[0]).map(id => Number(id));
    let pokemons = pokedex.filter(p => pIds.includes(Number(p.id)));
    let moveAss = moveAssociations;
    let xp = pokemonWithXp;
    let species = pokemonSpecies;
    let result = [];

    ids.forEach((id, index) => {
        let type = id.split('-')[1] || 'normal';
        if(type === 'h'){
            type = 'hisuian';
        }else if(type === 'a'){
            type = 'alolan';
        }else if(type === 'g'){
            type = 'galarian';
        }
        let number = Number(id.split('-')[0]);

        
        let pokemon = pokemons.find((p) => Number.parseInt(p.id) === number);
        let moves = moveAss.filter((move) => Number.parseInt(move.pokemon_id) === pokemon.id) || [];
        let xpData = xp.find((p) => p.id === pokemon.id);
        let pokedexNumber = ("00" + pokemon.id).slice(-3);
        let newNumber = ("00" + (index + 1)).slice(-3);
        let speciesData = species.find((p) => p.id === pokemon.id);

        if(moves.length === 0){
            console.log('missing moves for ' + pokemon.id);
        }

        if (pokemon && xpData && speciesData) {
            let evolutions = pokemon.evolution?.next?.length ? pokemon.evolution?.next
            .filter(evo => pIds.indexOf(parseInt(evo[0])) !== -1)
            .map((evo) => {
                if (evo[1]?.includes('Level')) {
                    return {
                        id: pIds.indexOf(parseInt(evo[0])) + 1,
                        level: Number.parseInt(evo[1]?.replace('Level ', '') || '40'),
                        method: 'level'
                    }
                } else {
                    return {
                        id: pIds.indexOf(parseInt(evo[0])) + 1,
                        level: null,
                        method: evo[1]
                    }
                }
            }) : [];

            let entry = {
                id: Number(newNumber),
                regionalId: Number(pokedexNumber),
                region: type,
                name: pokemon.name.english,
                types: pokemon.type.map((type) => type.toLowerCase()),
                abilities: pokemon.profile.ability.map((ability) => ability[0]),
                baseXp: xpData.base_experience,
                moves: moves
                .sort((a, b) => Number.parseInt(a.level) - Number.parseInt(b.level))
                .map((move) => {
                    return {
                        id: move.move.id,
                        name: move.move.name,
                        type: move.move.type,
                        category: move.move.category,
                        power: move.move.power,
                        accuracy: move.move.accuracy,
                        pp: move.move.pp,
                        priority: move.move.priority,
                        target: move.move.target,
                        effect: move.move.effect,
                        effectChance: move.move.effectChance,
                        description: move.move.description,
                        level: Number.parseInt(move.level),
                        method: Number.parseInt(move.move.method)
                    }
                }),
                stats: {
                    hp: pokemon.base.HP,
                    attack: pokemon.base.attack,
                    defense: pokemon.base.defense,
                    specialAttack: pokemon.base.spAttack,
                    specialDefense: pokemon.base.spDefense,
                    speed: pokemon.base.speed,
                    total: pokemon.base.HP + pokemon.base.attack + pokemon.base.defense + pokemon.base.spAttack + pokemon.base.spDefense + pokemon.base.speed,
                },
                height: Number(pokemon.profile.height.split(' ')[0]),
                weight: Number(pokemon.profile.weight.split(' ')[0]),
                description: pokemon.description,
                isLegendary: speciesData.is_legendary || speciesData.is_mythical,
                captureRate: speciesData.capture_rate,
                growthRateId: speciesData.growth_rate_id,
                percentageMale: Number(pokemon.profile.gender.split(':')[0]),
                evolution: evolutions,
                sprites: {
                    male: {
                        front: {
                            frame1: `src/assets/monsters/animated/${''+ newNumber}.gif`,
                            shiny1: `src/assets/monsters/animated/${''+ newNumber}s.gif`,
                        },
                        back: {
                            frame1: `src/assets/monsters/animated/${''+ newNumber}b.gif`,
                            shiny1: `src/assets/monsters/animated/${''+ newNumber}sb.gif`,
                        },
                    }
                }
            }
            console.log(entry.name);
            result.push(entry);
        }else {
            console.log('missing ' + pokemon.id);
        }
    });

    // sort by types 
    // result = result.sort((a, b) => {
    //     return a.types[0].localeCompare(b.types[0]);
    // }
    // );

    // sort by regionalId except for the first 9 
    // result = result.sort((a, b) => {
    //     if (a.id <= 9 && b.id <= 9) {
    //         return 0;
    //     } else if (a.regionalId <= 9) {
    //         return -1;
    //     } else if (b.regionalId <= 9) {
    //         return 1;
    //     } else {
    //         return a.regionalId - b.regionalId;
    //     }
    // });

    
    fs.writeFile("./pokedex-animatedV3.json", JSON.stringify(result), (error) => {
        // throwing the error
        // in case of a writing problem
        if (error) {
            // logging the error
            console.error(error);

            throw error;
        }
    });

}

exportPokemons();