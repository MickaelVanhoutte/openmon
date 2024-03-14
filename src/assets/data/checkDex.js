/*
console.log(pokedex.length);

let idx = 0;

console.log(pokedex[idx]);
pokedex[2].moves.forEach((move) => {
    console.log(move.name, move.level );
});

let movesImpl = [1, 2, 3, 4, 5, 6, 7, 11, 12, 14, 17, 19, 20, 21, 24];
let toImpl = {};

pokedex.forEach((pokemon) => {
    pokemon.moves.filter((move) => !movesImpl.includes(move.effect?.move_effect_id)).map((move) => {
        if (toImpl[move.effect?.move_effect_id + ' : ' + move.effect?.short_effect] === undefined) {
            toImpl[move.effect?.move_effect_id + ' : ' + move.effect?.short_effect] = [];
        }
        toImpl[move.effect?.move_effect_id + ' : ' + move.effect?.short_effect].push(pokemon.name);
    });
});
*/

//console.log(toImpl);

/*Object.keys(toImpl).forEach((key) => {

    if(toImpl[key].length < 5) {
        console.log('---------------------');
        console.log(key);
    }
});*/

export const typeChart = {
    "normal": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 0.5,
        "ghost": 0,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#a8a67c'
    },
    "fire": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 1,
        "grass": 2,
        "ice": 2,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 2,
        "rock": 0.5,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 2,
        "fairy": 1,
        color: '#e38643'
    },
    "water": {
        "normal": 1,
        "fire": 2,
        "water": 0.5,
        "electric": 1,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 2,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 2,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 1,
        "fairy": 1,
        color: '#728cc8',
    },
    "electric": {
        "normal": 1,
        "fire": 1,
        "water": 2,
        "electric": 0.5,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 0,
        "flying": 2,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 1,
        "fairy": 1,
        color: '#ecb240'
    },
    "grass": {
        "normal": 1,
        "fire": 0.5,
        "water": 2,
        "electric": 1,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 0.5,
        "ground": 2,
        "flying": 0.5,
        "psychic": 1,
        "bug": 0.5,
        "rock": 2,
        "ghost": 1,
        "dragon": 0.5,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#8ac262'
    },
    "ice": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 1,
        "grass": 2,
        "ice": 0.5,
        "fighting": 1,
        "poison": 1,
        "ground": 2,
        "flying": 2,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#a5d7d9'
    },
    "fighting": {
        "normal": 2,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 2,
        "fighting": 1,
        "poison": 0.5,
        "ground": 1,
        "flying": 0.5,
        "psychic": 0.5,
        "bug": 0.5,
        "rock": 2,
        "ghost": 0,
        "dragon": 1,
        "dark": 2,
        "steel": 2,
        "fairy": .5,
        color: '#d84123',
    },
    "poison": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 2,
        "ice": 1,
        "fighting": 1,
        "poison": 0.5,
        "ground": 0.5,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 0.5,
        "ghost": 0.5,
        "dragon": 1,
        "dark": 1,
        "steel": 0,
        "fairy": 2,
        color: '#8d4b9c'
    },
    "ground": {
        "normal": 1,
        "fire": 2,
        "water": 1,
        "electric": 2,
        "grass": 0.5,
        "ice": 1,
        "fighting": 1,
        "poison": 2,
        "ground": 1,
        "flying": 0,
        "psychic": 1,
        "bug": 0.5,
        "rock": 2,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 2,
        "fairy": 1,
        color: '#b59f4b'
    },
    "flying": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 0.5,
        "grass": 2,
        "ice": 1,
        "fighting": 2,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 2,
        "rock": 0.5,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#a8d6d8'
    },
    "psychic": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 2,
        "poison": 2,
        "ground": 1,
        "flying": 1,
        "psychic": 0.5,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 1,
        "dark": 0,
        "steel": 0.5,
        "fairy": 1,
        color: '#e56289'
    },
    "bug": {
        "normal": 1,
        "fire": 0.5,
        "water": 1,
        "electric": 1,
        "grass": 2,
        "ice": 1,
        "fighting": 0.5,
        "poison": 0.5,
        "ground": 1,
        "flying": 0.5,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 0.5,
        "dragon": 1,
        "dark": 2,
        "steel": 0.5,
        "fairy": .5,
        color: '#d8de57'
    },
    "rock": {
        "normal": 1,
        "fire": 2,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 2,
        "fighting": 0.5,
        "poison": 1,
        "ground": 0.5,
        "flying": 2,
        "psychic": 1,
        "bug": 2,
        "rock": 1,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 1,
        color: '#b59f4d'
    },
    "ghost": {
        "normal": 0,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 2,
        "dragon": 1,
        "dark": 0.5,
        "steel": 0.5,
        "fairy": 1,
        color: '#944a98'
    },
    "dragon": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 1,
        "steel": 0.5,
        "fairy": 0,
        color: '#758bc6'
    },
    "dark": {
        "normal": 1,
        "fire": 1,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 0.5,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 2,
        "bug": 1,
        "rock": 1,
        "ghost": 2,
        "dragon": 1,
        "dark": 0.5,
        "steel": 0.5,
        "fairy": .5,
        color: '#567783'
    },
    "steel": {
        "normal": 1,
        "fire": 0.5,
        "water": 0.5,
        "electric": 0.5,
        "grass": 1,
        "ice": 2,
        "fighting": 1,
        "poison": 1,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 2,
        "ghost": 1,
        "dragon": 1,
        "dark": 1,
        "steel": 0.5,
        "fairy": 2,
        color: '#577884'
    },
    "fairy": {
        "normal": 1,
        "fire": .5,
        "water": 1,
        "electric": 1,
        "grass": 1,
        "ice": 1,
        "fighting": 2,
        "poison": .5,
        "ground": 1,
        "flying": 1,
        "psychic": 1,
        "bug": 1,
        "rock": 1,
        "ghost": 1,
        "dragon": 2,
        "dark": 2,
        "steel": .5,
        "color": '#ee99ac'
    }
}

let types = ['fire', 'rock']

let weaknesses = Object.entries(typeChart)
    .filter(([_key, value]) => {
        if (types?.length === 1) {
            return value[types[0]] > 1;
        } else {
            return value[types[0]] * value[types[1]] > 1
        }

    })
    .map(([key, _value]) => key);
console.log(weaknesses);

let weaknessValues =  Object.entries(typeChart)
    .filter(([_key, value]) => {
        if (types?.length === 1) {
            return value[types[0]] > 1;
        } else {
            return value[types[0]] * value[types[1]] > 1
        }

    })
    .map(([key, _value]) => {
        if (types?.length === 1) {
            return {string: key, value: _value[types[0]]};
        } else {
            return {string: key, value: _value[types[0]] * _value[types[1]]};
        }
    });

console.log(weaknessValues);