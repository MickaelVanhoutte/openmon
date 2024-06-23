import originalMoves from '/Users/perso/workspace/perso/openmon/src/assets/data/raw/moves/pokemon-moves.json' assert {type: 'json'};
import patchedMoves from '/Users/perso/workspace/perso/openmon/src/assets/data/raw/moves/pokemon-moves-patched.json' assert {type: 'json'};
import originalDex from '/Users/perso/workspace/perso/openmon/src/assets/data/raw/dex/pokedex.json' assert {type: 'json'};
import patchedDex from '/Users/perso/workspace/perso/openmon/src/assets/data/raw/dex/pokedex-patched.json' assert {type: 'json'};
import finalDex from '/Users/perso/workspace/perso/openmon/src/assets/data/final/beta/pokedex-animatedV3.json' assert {type: 'json'};
import moves from '/Users/perso/workspace/perso/openmon/src/assets/data/raw/moves/moves.json' assert {type: 'json'};

const changes = [];

finalDex.forEach((pokemon) => {
    let originalPokemon = originalDex.find((p) => p.id === pokemon.regionalId);
    let patchedPokemon = patchedDex.find((p) => p.id === pokemon.regionalId);

    if (originalPokemon && patchedPokemon) {
        let OgTotalStats = getTotalStats(originalPokemon);
        let finalTotalStats = getTotalStats(patchedPokemon);
        let typesIfDifferent = getTypesIfDifferent(originalPokemon, patchedPokemon);
        let newMoves = getNewMoves(originalPokemon, patchedPokemon);
        if(OgTotalStats !== finalTotalStats 
            || typesIfDifferent || newMoves.length > 0
        ){
            changes.push({
                id: pokemon.id,
                name: patchedPokemon.name.french,
                totalStats: finalTotalStats,
                originalTotalStats: OgTotalStats,
                types: typesIfDifferent,
                moves: newMoves
            })
        }
    }
});

function getNewMoves(originalPokemon, patchedPokemon) {
   
    let result = [];

    let newMoves = patchedMoves.filter(move => Number.parseInt(move.pokemon_id) === patchedPokemon.id);
    let ogMoves = originalMoves.filter(move => Number.parseInt(move.pokemon_id) === patchedPokemon.id);


    if(newMoves.length === ogMoves.length){
        return [];
    }
    //console.log('found new moves for ' + patchedPokemon.name.english + ' ' + (newMoves.length - ogMoves.length) + ' new moves');
    result = newMoves.filter((move) => ogMoves.find(og => og.move_id === move.move_id) === undefined).map(m => {
        return {
            name : moves.find(move => move.id === Number.parseInt(m.move_id)).identifier,
            lvl : m.level
        };
    });

    return result;

}

function getTypesIfDifferent(originalPokemon, patchedPokemon) {
   if(originalPokemon.type.join('-') !== patchedPokemon.type.join('-')){
       return patchedPokemon.type;
   }
   return undefined;
}

function getTotalStats(pokemon) {
    let totalStats = 0;
    totalStats += pokemon.base.HP;
    totalStats += pokemon.base.attack;
    totalStats += pokemon.base.defense;
    totalStats += pokemon.base.spAttack;
    totalStats += pokemon.base.spDefense;
    totalStats += pokemon.base.speed;
    return totalStats;
}

changes.forEach((change) => {

    console.log('Changes for ' + change.name + ' :');

    if(change.totalStats !== change.originalTotalStats){
        console.log( "\t" + 'Base stats changed: +' + (change.totalStats - change.originalTotalStats) + '( '+  change.originalTotalStats +' -> ' + change.totalStats +' )');
    }

    if(change.types){
        console.log( "\t" + 'Type changes: ' + change.types);
    }
    if(change.moves.length > 0){
        change.moves.forEach((move) => {
            console.log( "\t" + 'New move: ' + move.name + ' at lvl ' + move.lvl);
        });
    }

    console.log('-------------------')
});