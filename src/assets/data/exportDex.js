import pokedex from './gen1-2.json' assert {type: 'json'};
import pokedex2 from './pokedex.json' assert {type: 'json'};
import pokeWithXp from './poke-withXp.json' assert {type: 'json'};
import pokeWithCatchRate from './pokemons-catch.json' assert {type: 'json'};
import moveAssociations from './final/move-associations-bw.json' assert {type: 'json'};
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


    // pokedex
    let moveAssFromJson = moveAssociations;
    let pokedexFromJson = pokedex.slice(0, 252);
    let pokemon2FromJson = pokedex2;
    let pokedexArray = [];



    pokedexFromJson.forEach((pokemon) => {
        let moves = moveAssFromJson.filter((move) => Number.parseInt(move.pokemon_id) === pokemon.pokedex_number) || [];

        let secondSource = pokemon2FromJson.find((p) => p.id === pokemon.pokedex_number);
        let thirdSource = pokeWithXp.find((p) => p.id === pokemon.pokedex_number);
        let fourthSource = pokeWithCatchRate.pokemon.find((p) => p.id === pokemon.pokedex_number);

        if (secondSource && thirdSource && fourthSource) {
            let evolutions = secondSource.evolution?.next?.length ? secondSource.evolution?.next?.filter(evo => evo[0] <= 251).map((evo) => {
                if(evo[1]?.includes('Level')){
                    return {
                        id: parseInt(evo[0]),
                        level:  Number.parseInt(evo[1]?.replace('Level ', '') || '40'),
                        method: 'level'
                    }
                }else{
                    return {
                        id: parseInt(evo[0]),
                        level:null,
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
                    }}),
                stats: {
                    hp: pokemon.hp,
                    attack: pokemon.attack,
                    defense: pokemon.defense,
                    specialAttack: pokemon.sp_attack,
                    specialDefense: pokemon.sp_defense,
                    speed: pokemon.speed,
                    total: pokemon.base_total,
                },
                height: pokemon.height_m,
                weight: pokemon.weight_kg,
                description: secondSource.description,
                isLegendary: pokemon.is_legendary,
                captureRate: fourthSource.catchRate,
                experienceGrowth: pokemon.experience_growth,
                percentageMale: pokemon.percentage_male,
                evolution: evolutions,
                sprites: {
                    male: {
                        front :{
                            frame1 : `src/assets/monsters/bw-animated/${pokedexNumber}.gif`,
                            shiny1 : `src/assets/monsters/bw-animated/${pokedexNumber}s.gif`,
                        },
                        back :{
                            frame1 : `src/assets/monsters/bw-animated/${pokedexNumber}b.gif`,
                            shiny1 : `src/assets/monsters/bw-animated/${pokedexNumber}sb.gif`,
                        },
                    }
                }
            });
        }else{
            console.log('missing ' + pokemon.pokedex_number);
        }
    });

    console.log(pokedexArray.length);
    console.log(pokedexArray[132]);

    fs.writeFile("./pokedexBW-animated2.json", JSON.stringify(pokedexArray), (error) => {
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
