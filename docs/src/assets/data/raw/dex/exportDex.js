import pokedex from '../../gen1-2.json' assert {type: 'json'};
import pokedex2 from './pokedex.json' assert {type: 'json'};
import pokeWithXp from './poke-withXp.json' assert {type: 'json'};
import pokeWithCatchRate from './pokemons-catch.json' assert {type: 'json'};
import moveAssociations from '../../final/move-associations-bw.json' assert {type: 'json'};
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

const ids = [
    10, 11, 12, 13, 14, 15, 16, 17, 18, 25, 26, 29, 30, 31, 32, 33, 34, 41, 42, 169, 58, 59, 60, 61, 62, 92, 93, 94, 95, 208, 104, 105, 111, 112, 464, 114, 115, 465, 124, 125, 466, 126, 467, 123, 212, 129, 130, 132, 133, 134, 135, 136, 700, 196
    , 197, 470, 471, 137, 233, 196, 197, 140, 141, 142, 143, 147, 148, 149, 179, 180, 181, 215, 461, 298, 183, 184, 207, 228, 229, 472, 246, 247, 248, 273,
    274, 275, 280, 281, 282, 293, 294, 295, 475, 303, 304, 305, 306, 307, 308, 318, 319, 328, 329, 330, 353, 354, 363, 364, 365, 374, 375, 376, 403, 404, 405, 443, 444, 445, 447, 448, 540, 541, 542, 546, 547, 559, 560, 570, 571, 607, 608, 609, 613, 614, 636, 637, 459, 460,
    214, 595, 596, 241, 300, 301, 90, 91, 345, 346,347,348, 227,35,36,39,40,43,44,45,66,67,68,278,279,396,397,398, 532, 533, 534,
    // starters
    4, 5, 6, 653, 654, 655,
    258, 259, 260, 393, 394, 395,
    252, 253, 254, 495, 496, 497,
    // legendaries
    145, 249, 251, 647, 494,
]
function exportPokemons() {


    // pokedex
    let moveAssFromJson = moveAssociations;
    let pokedexFromJson = pokedex//.filter(p => ids.includes(Number(p.pokedex_number)))//.slice(0, 252);
    let pokemon2FromJson = pokedex2;
    let pokedexArray = [];



    pokedexFromJson.forEach((pokemon) => {
        let moves = moveAssFromJson.filter((move) => Number.parseInt(move.pokemon_id) === pokemon.pokedex_number) || [];

        let secondSource = pokemon2FromJson.find((p) => p.id === pokemon.pokedex_number);
        let thirdSource = pokeWithXp.find((p) => p.id === pokemon.pokedex_number);
        let fourthSource = pokeWithCatchRate.pokemon.find((p) => p.id === pokemon.pokedex_number);

        if (secondSource && thirdSource && fourthSource) {
            let evolutions = secondSource.evolution?.next?.length ? secondSource.evolution?.next?.filter(evo => evo[0] <= 251).map((evo) => {
                if (evo[1]?.includes('Level')) {
                    return {
                        id: parseInt(evo[0]),
                        level: Number.parseInt(evo[1]?.replace('Level ', '') || '40'),
                        method: 'level'
                    }
                } else {
                    return {
                        id: parseInt(evo[0]),
                        level: null,
                        method: evo[1]
                    }
                }
            }) : [];

            let pokedexNumber = pokemon.pokedex_number < 10 ? `00${pokemon.pokedex_number}` : pokemon.pokedex_number < 100 ? `0${pokemon.pokedex_number}` : pokemon.pokedex_number;
            pokedexArray.push({
                id: pokemon.pokedex_number,
                name: pokemon.name,
                types: secondSource.type.map((type) => type.toLowerCase()),
                abilities: secondSource.profile.ability.map((ability) => ability[0]),
                baseXp: thirdSource.base_experience,
                moves: moves.map((move) => {
                    return {
                        id: move.move.id,
                        name: move.move.name,
                        type: move.move.type,
                        category: move.move.category,
                        power: move.move.power,
                        accuracy: move.move.accuracy,
                        pp: move.move.pp,
                        priority: move.move.priority,
                        effect: move.move.effect,
                        effectChance: move.move.effectChance,
                        description: move.move.description,
                        level: Number.parseInt(move.level),
                    }
                }),
                stats: {
                    hp: secondSource.base.HP,
                    attack: secondSource.base.attack,
                    defense: secondSource.base.defense,
                    specialAttack: secondSource.base.spAttack,
                    specialDefense: secondSource.base.spDefense,
                    speed: secondSource.base.speed,
                    total: secondSource.base.HP + secondSource.base.attack + secondSource.base.defense + secondSource.base.spAttack + secondSource.base.spDefense + secondSource.base.speed,
                },
                height: Number(secondSource.profile.height.split(' ')[0]),
                weight: Number(secondSource.profile.weight.split(' ')[0]),
                description: secondSource.description,
                isLegendary: pokemon.is_legendary,
                captureRate: fourthSource.catchRate,
                experienceGrowth: pokemon.experience_growth,
                percentageMale: pokemon.percentage_male,
                evolution: evolutions,
                sprites: {
                    male: {
                        front: {
                            frame1: `src/assets/monsters/bw-animated/${pokedexNumber}.gif`,
                            shiny1: `src/assets/monsters/bw-animated/${pokedexNumber}s.gif`,
                        },
                        back: {
                            frame1: `src/assets/monsters/bw-animated/${pokedexNumber}b.gif`,
                            shiny1: `src/assets/monsters/bw-animated/${pokedexNumber}sb.gif`,
                        },
                    }
                }
            });
        } else {
            console.log('missing ' + pokemon.pokedex_number);
        }
    });

    console.log(pokedexArray.length);
    console.log(pokedexArray[132]);

    fs.writeFile("./pokedex-animatedV3.json", JSON.stringify(pokedexArray), (error) => {
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
