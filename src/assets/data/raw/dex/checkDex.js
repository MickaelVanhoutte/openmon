/*
010 // chenipan
011
012
013 // aspicot
014
015
016 // Roucool
017
018
025 // Pikachu
026
029 // Nidoran♀
030
031
032
033
034
041 // Nosferapti
042 
169 // nostenfer
058 // Caninos
059
60  // Poliwag
61  // Poliwhirl
62  // Poliwrath
092 // Fantominus
093
094
095 // Onix
208 
104 // Osselait
105
111 // Rhinocorne
112 // Rhinoféros
464 // Rhinastoc
114 // Saquedeneu
115 // Kangourex
465 // Bouldeneu
125 // Electek
466 // Elekable
126 // Magmar
467 // Maganon
123 // Insécateur
124 // Lippoutou
212 
129 // Magicarpe
130
132 // metamorph
133 // evoli
134
135
136
196
197
470
471
137 // Porygon
233 // Porygon2
140 // Kabuto
141
142 // Ptera
143 // Ronflex
147 // Minidraco
148
149
179 // Wattouat
180
181
298 // Azurill
183 // Marill
184
207 // Scorplane
472 // Scorvol
215 // Farfuret
461 // Weavile
228 // Malosse
229
246 // Embrylex
247
248
273 // Grainipiot
274
275
280 // Tarsal
281
282
293 // Chuchmur
294
295
475 // Gallame
303 // Mysdibule
304 // Galekid
305
306
307 // Meditikka
308 // Charmina
318 // Carvanha
319
328 // Trapinch
329
330
353 // Polichombr
354
363 // Spheal
364
365
374 // Terhal
375
376
403 // Lixy
404
405
443 // Griknot
444
445
447 // Riolu
448
459 // Snover
460
540 // Sewaddle
541
542
546 // Cottonee
547
559 // Scraggy
560
570 // Zorua (Hisuian)
571
607 // Litwick
608
609
613 // Cubchoo
614
636 // Larvesta
637
*/

// to json array of ids : 

const ids = [
    532, 533, 534,
    396,397,398, 
    246, 247, 248,

    278,279,
    298, 183, 184,
    16, 17, 18,
    43,44,45,
    60, 61, 62,
    123, 212,
    393, 394, 395,
    214,


    10, 11, 12,
    13, 14, 15,
    114, 465,
    273, 274, 275,
    540, 541, 542,
    546, 547,
    595, 596,
    252, 253, 254,

    133, 134, 135, 136, 196, 197, 470, 471, 700, 
    92, 93, 94,
    653, 654, 655,

    95, 208,
    104, 105, 
    111, 112, 464,
    142,
 207, 472,
 304, 305, 306, 
 66,67,68,
 41, 42, 169,
 35,36,
 293, 294, 295,

 363, 364, 365,
 613, 614,
 459, 460,
 215, 461,
124,
447, 448,
227,


 328,329, 330,
 403, 404, 405,
 258, 259, 260,
 495, 496, 497,
 
 
 129, 130,
140, 141,
318, 319,
90, 91,
147, 148, 149,
143, 


25, 26, 
29, 30, 31, 32, 33, 34,
115,
132, 
179, 180, 181,
241,
300, 301, 
39,40,

137, 233,
125, 466,
353, 354, 

58, 59,
228, 229,
607, 608, 609,
126, 467,
636, 637, 
4, 5, 6,



443, 444, 445,
345, 346,
347,348,
551, 552, 553,
559, 560,
    
303,
307, 308, 
374, 375, 376,
570, 571,  
280, 281, 282,  475,
       
       
        
     
    145, 249, 251, 647, 494
]

import pokedex from './pokedex.json' assert {type: 'json'};

// to map of types, number of pokemons for this type 

let types = ids.map(id => {
    return pokedex.find(pokemon => pokemon.id === id);
}).reduce((acc, pokemon) => {
    console.log(pokemon.name?.english);
    let type = pokemon.type[0];
    if (acc[type]) {
        acc[type]++;
    } else {
        acc[type] = 1;
    }

    if (pokemon.type[1]) {
        type = pokemon.type[1];
        if (acc[type]) {
            acc[type]++;
        } else {
            acc[type] = 1;
        }
    }

    return acc;
}, {});


// sort by number of pokemons for this type

types = Object.entries(types).sort((a, b) => a[1] - b[1]);

console.log(ids?.length);
console.log(types);


// every flying :
let flying = ids.map(id => {
    return pokedex.find(pokemon => pokemon.id === id);
}).filter(pokemon => pokemon.type[0] === 'Flying' || pokemon.type[1] === 'Flying')
.filter(pokemon => pokemon)
.map(pokemon => pokemon.name?.english);

console.log(flying);

// every fighting :
let fighting = ids.map(id => {
    return pokedex.find(pokemon => pokemon.id === id);
}).filter(pokemon => pokemon.type[0] === 'Fighting' || pokemon.type[1] === 'Fighting').map(pokemon => pokemon.name?.english);

console.log(fighting);

// every rock :
let rock = ids.map(id => {
    return pokedex.find(pokemon => pokemon.id === id);
}).filter(pokemon => pokemon.type[0] === 'Rock' || pokemon.type[1] === 'Rock').map(pokemon => pokemon.name?.english);

console.log(rock);