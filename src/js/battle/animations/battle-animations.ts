import { gsap } from 'gsap';

export function animateEntry(target: HTMLImageElement, source: 'ally' | 'opponent') {
    console.log(source, target.getBoundingClientRect().width);
    gsap.timeline().fromTo(target,
        {
            left: source === 'ally' ? -target.getBoundingClientRect().width : window.innerWidth,
            filter: source === 'ally' ? 'brightness(5)' : 'brightness(0)',
        },
        {
            left: source === 'ally' ?
                window.innerWidth * 0.25 - target.getBoundingClientRect().width / 2
                : window.innerWidth * 0.75 - target.getBoundingClientRect().width / 2,
            duration: 2,
        }).to(target, {
            filter: 'brightness(1)',
            duration: 1,
        }).play();
}

export function animateFaint(target: HTMLImageElement) {
    gsap.timeline()
        .to(target, {
            filter: 'brightness(0)',
            y: window.innerHeight,
            duration: 1,
            delay: 2
        })
        .play();
}

export function animateRun(target: HTMLImageElement) {
    gsap.timeline()
        .to(target, {
            filter: 'brightness(5)',
            transform: 'scale(.1)',
            duration: .8,
            delay: .3
        })
        .to(target, {
            x: -window.innerWidth / 2,
            duration: 1,
            delay: 0
        })
        .play();
}

// testing
export function animateMoveTest(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLImageElement,
    spriteFx: HTMLDivElement,
    fx: HTMLImageElement[]) {

    //animateContact(move, source, target, initiator, scene, [fx[0]], ['foot']);
    //animateContact(move, source, target, initiator, scene, [fx[0]], ['fist']);
    //animateContact(move, source, target, initiator, scene, [fx[0]], ['leftchop']); // todo, animate as sprite
    //animateContact(move, source, target, initiator, scene, [fx[0]], ['impact']);
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'shadowball-sprite', 6, 192);
    //animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'ice-sprite', 6, 192);
    //animateContactSprite(move, source, target, initiator, scene, spriteFx, 'crunch-sprite', 6, 192, .4, 2);
    //animateContactSprite(move, source, target, initiator, scene, spriteFx, 'slash-sprite', 6, 192,1, 1); // todo improve slash sprite
    //animateContactSprite(move, source, target, initiator, scene, spriteFx, 'claws-sprite', 5, 192,.8, 1); // todo fix claws sprite
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'fire-sprite', 8, 192);
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'poison-sprite', 9, 192);
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'rock-sprite', 7, 192);
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'shadowball-sprite', 6, 192);
    //animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'thunderball-sprite', 6, 192);
    //animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'thunder-sprite', 6, 192);
    //animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'vines-sprite', 6, 192);
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'water-sprite', 8, 192);
    //animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'wind-sprite', 8, 192);
}

export function animateMove(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLImageElement,
    spriteFx: HTMLDivElement,
    fx: HTMLImageElement[]) {

    switch (move) {

        // contact moves
        case 'stomp':
        case 'low-kick':
        case 'double-kick':
        case 'jump-kick':
        case 'mega-kick':
        case 'rolling-kick':
        case 'high-jump-kick':
        case 'triple-kick':
        case 'blaze-kick': // TODO element
        case 'low-sweep':
        case 'darkest-lariat':
        case 'triple-axel': // TODO element
        case 'thunderous-kick': // TODO element
        case 'axe-kick':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['foot']);
            break;
        case 'comet-punch':
        case 'mega-punch':
        case 'fire-punch': // TODO element
        case 'ice-punch': // TODO element
        case 'thunder-punch': // TODO element
        case 'dizzy-punch':
        case 'mach-punch':
        case 'dynamic-punch':
        case 'focus-punch':
        case 'bullet-punch':
        case 'drain-punch':
        case 'shadow-punch': // TODO element
        case 'sky-uppercut':
        case 'close-combat':
        case 'sucker-punch':
        case 'poison-jab': // TODO element
        case 'power-up-punch':
        case 'plasma-fists': // TODO element
        case 'force-palm':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['fist']);
            break;
        case 'karate-chop':
        case 'cross-chop':
        case 'rock-smash':
        case 'brick-break':
        case 'knock-off':
        case 'arm-thrust':
        case 'dual-chop':
        case 'throat-chop':
        case 'rage-fist':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['rightchop']);
            break;
        case 'pound':
        case 'tackle':
        case 'slam':
        case 'trash':
        case 'rage':
        case 'strength':
        case 'body-slam':
        case 'heavy-slam':
        case 'take-down':
        case 'headbutt':
        case 'double-edge':
        case 'quick-attack':
        case 'extreme-speed':
        case 'return':
        case 'facade':
        case 'poison-tail': // TODO element
        case 'aqua-tail': // TODO element
        case 'iron-tail':
        case 'dragon-tail':
        case 'volt-tackle': // TODO element
        case 'wood-hammer': // TODO element
        case 'hammer-arm':
        case 'ice-hammer':
        case 'dragon-rush':
        case 'giga-impact':
        case 'power-whip':
        case 'dragon-hammer':
        case 'brutal-swing':
        case 'smack-down':
        case 'flame-charge': // TODO element
        case 'acrobatics':
        case 'final-gambit':
        case 'volt-switch':
        case 'struggle':
        case 'struggle-bug':
        case 'wild-charge':
        case 'horn-attack':
        case 'horn-drill':
        case 'horn-leech':
        case 'tail-slap':
        case 'play-rough':
        case 'body-press':
        case 'revenge':
        case 'covet':
        case 'wing-attack':
        case 'outrage':
        case 'bolt-strike':// TODO element
        case 'fusion-bolt':// TODO element
        case 'aura-wheel': // TODO element
        case 'pay-day': // TODO coins fall
        case 'bide': // TODO angry first turns
        case 'skull-bash': // TODO only 2nd turn
        case 'zen-headbutt':
        case 'rollout':
        case 'head-smash':
        case 'iron-head':
        case 'aqua-jet': // TODO element
            animateContact(move, source, target, initiator, scene, [fx[0]], ['impact']);
        case 'double-slap':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['impact'], 2);
            break;
        case 'scratch':
        case 'cut':
        case 'slash':
        case 'fury-swipes': // todo repeat
        case 'false-swipe':
        case 'fury-cutter':
        case 'night-slash':
        case 'x-scissor':
        case 'vice-grip':
        case 'guillotine':
        case 'cross-poison':
        case 'psycho-cut':
            animateContactSprite(move, source, target, initiator, scene, spriteFx, 'slash-sprite', 6, 192, 1, 1);
            break;
        case 'metal-claw':
        case 'shadow-claw':
        case 'dragon-claw':
        case 'crush-claw':
        case 'hone-claws':
            animateContactSprite(move, source, target, initiator, scene, spriteFx, 'claws-sprite', 5, 192, 1, 1);
            break;
        case 'bite':
        case 'crunch':
        case 'fire-fang': // TODO element
        case 'ice-fang': // TODO element
        case 'thunder-fang': // TODO element
        case 'poison-fang': // TODO element
        case 'bug-bite':
        case 'psychic-fang':
        case 'hyper-fang':
        case 'super-fang':
            animateContactSprite(move, source, target, initiator, scene, spriteFx, 'crunch-sprite', 6, 192, .4, 1);
            break;


        // from initiator
        // electrik
        case 'thunder-shock':
        case 'thunderbolt':
        case 'thunder':
        case 'electro-web': // todo add web sprite
        case 'nuzzle':
        case 'overdrive':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'thunder-sprite', 6, 192);
        case 'spark':
        case 'zap-cannon':
        case 'shock-wave':
        case 'discharge':
        case 'charge-beam':
        case 'electro-ball':
        case 'electrify':
        case 'eerie-impulse':
        case 'bolt-beak':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'thunderball-sprite', 6, 192);
            break;
        // fire
        case 'ember':
        case 'flamethrower':
        case 'flare-blitz':
        case 'flame-wheel':
        case 'v-create':
        case 'heat-wave':
        case 'lava-plume':
        case 'fire-blast':
        case 'incinerate':
        case 'mystical-fire':
        case 'searing-shot':
        case 'fire-spin':
        case 'inferno':
        case 'burn-up':
        case 'overheat':
        case 'fiery-dance':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'fire-sprite', 8, 192);

            break;
        // ice
        case 'ice-beam': // TODO From, change sprite
        case 'hyper-beam': // TODO From, change sprite
        case 'blizzard':
        case 'freeze-dry':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'ice-sprite', 6, 192);
            break;
        // wind
        case 'razor-wind':
        case 'whirlwind': // TODO make target move away
        case 'sonic-boom':
        case 'swift':
        case 'twister':
        case 'aerial-ace':
        case 'air-slash':
        case 'hurricane':
        case 'air-cutter':
        case 'aeroblast':
        case 'gust':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'wind-sprite', 8, 192);
            break
        // beams
        case 'dazzling-gleam':
        case 'moonblast':
        case 'vacuum-wave':
        case 'aura-sphere':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'lightball-sprite', 8, 192);
            break;
        // shadow balls
        case 'shadow-ball':
        case 'dark-pulse':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'shadowball-sprite', 8, 192);
            break;
        // grass
        case 'leech-seed':
        case 'vine-whip':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'vines-sprite', 6, 192);
            break;
        case 'leafage':
        case 'magical-leaf':
        case 'leaf-blade':
        case 'razor-leaf':
        case 'leaf-storm':
        case 'leaf-tornado':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'leaf-sprite', 6, 192);
            break;
        // poison
        case 'venoshock':
        case 'sludge-wave':
        case 'sludge-bomb':
        case 'acid':
        case 'smog':
        case 'clear-smog':
        case 'belch':
        case 'poison-powder':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'poison-sprite', 9, 192);
            break;
        case 'toxic':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'poison-sprite', 9, 192);
            break;
        case 'rock-slide':
        case 'rock-throw':
        case 'stone-edge':
        case 'rock-tomb':
        case 'rock-blast':
        case 'ancient-power':
        case 'power-gem':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'rock-sprite', 7, 192);
            break;
        case 'waterfall':
        case 'whirlpool':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'water-sprite', 8, 192);
            break;
        case 'hydro-pump':
        case 'surf':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'water-sprite', 8, 192);
            break;

        // buffs
        case 'nasty-plot':
        case 'dragon-dance':
        case 'bulk-up':
        case 'cotton-guard':
        case 'harden':
        case 'focus-energy':
        case 'double-team':
        case 'defense-curl':
        case 'minimize':
        case 'stockpile':
        case 'growth':
        case 'howl':
        case 'belly-drum':
        case 'swords-dance':
        case 'conversion':
        case 'conversion-2':
        case 'acupressure':
        case 'work-up':
        case 'acid-armor':
        case 'coil':
        case 'agility':
        case 'amnesia':
        case 'calm-mind':
        case 'iron-defense':
        case 'withdraw':
            animateSpriteDistance(move, source, initiator, initiator, scene, spriteFx, 'buff-sprite', 6, 192);
            break;
        case 'swagger':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'buff-sprite', 6, 192);
            break;

        // debuffs
        case 'fake-tears':
        case 'feather-dance':
        case 'cotton-spore':
        case 'growl':
        case 'smokescreen':
        case 'scary-face':
        case 'tail-whip':
        case 'leer':
        case 'screech':
        case 'sweet-scent':
        case 'metal-sound':
            animateSpriteDistance(move, source, target, initiator, scene, spriteFx, 'debuff-sprite', 6, 192);
            break;

        default:
            console.log('No animation for this move');
            break;
    }
}

function animateEffects() {
    // TODO 
    // confusion, para...
}


function animateSpriteFrom(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number = 192) {
    let tl = gsap.timeline();

    // from initiator
    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        left: source === 'ally' ?
            initiator.getBoundingClientRect().right - initiator.getBoundingClientRect().width / 3 :
            initiator.getBoundingClientRect().left + initiator.getBoundingClientRect().width / 3 - spriteSize,
        top: initiator.getBoundingClientRect().top + initiator.getBoundingClientRect().height / 2 - spriteSize / 2,
        opacity: 1,
        height: spriteSize + 'px',
        width: spriteSize + 'px',
        scale: .8,
        visibility: 'visible',
        duration: .1,
    }, 'fx')
        .to(scene, {
            opacity: .4,
            duration: 1.4,
        }, 'fx')
        // to target
        .to(spriteFx, {
            left: source === 'ally' ?
                target.getBoundingClientRect().right - target.getBoundingClientRect().width / 2 - spriteSize / 2 :
                target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 - spriteSize / 2,
            top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 3 - spriteSize / 2,
            duration: 1.4,
            scale: .8,
            delay: 0,
        }, 'fx+=.1')
    // animate sprite
    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.to(spriteFx, {
            opacity: .5,
            //scale: 0.1 + i * .2,
            duration: .05,
            ease: 'elastic.inOut',
        },).set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            //scale: 0.2 + i * .1,
            opacity: 1,
            duration: 1.5 / spriteN,
        }, 'fx+=' + (.1 + .3 * i)
        );
    }
    // end
    tl.set(target, {
        filter: 'invert(1)',
        duration: .2,
    }).set(target, {
        filter: 'invert(0)',
        delay: .1,
    }).set(spriteFx, {
        opacity: 0,
        visibility: 'hidden',
        delay: .1,
    }).set(scene, {
        opacity: .85,
    })
    tl.play();
}

function animateSpriteDistance(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number = 192) {
    let tl = gsap.timeline();

    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 50%',
        backgroundSize: 'cover',
        width: spriteSize + 'px',
        height: spriteSize + 'px',
        left: target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 - (192 * .8 / 2),
        bottom: source === 'ally' ? '35%' : '15%',
        opacity: 1,
        visibility: 'visible',
        scale: .8,
        duration: .2
    }, 'fx')
    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.to(spriteFx, {
            opacity: .5,
            //scale: 0.1 + i * .2,
            duration: .05,
            ease: 'elastic.inOut',
        },).set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            //scale: 0.2 + i * .1,
            opacity: 1,
            duration: 1.5 / spriteN,
        }, 'fx+=' + (.1 + .3 * i)
        );
    }
    tl.set(target, {
        filter: 'invert(1)',
        delay: .2,
        duration: .2,
    }).set(target, {
        filter: 'invert(0)',
        delay: .1,
    }).set(spriteFx, {
        opacity: 0,
        visibility: 'hidden',
        delay: .1,
    })
    tl.play();
}

function animateContact(move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    fx: HTMLImageElement[],
    fxImage: string[],
    repeat: number = 1) {
    let tl = gsap.timeline();
    tl.to(
        initiator,
        {
            left: source === 'ally' ?
                target.getBoundingClientRect().left - initiator.getBoundingClientRect().width * 2 / 3 :
                target.getBoundingClientRect().right - initiator.getBoundingClientRect().width * 2 / 3,
            bottom: source === 'ally' ? '35%' : '15%',
            duration: .4
        }
    );
    for (let i = 0; i < repeat; i++) {
        tl.set(fx[0], {
            attr: {
                src: 'src/assets/battle/fx/' + fxImage[0] + '.png',
            },
            width: '7%',
            height: 'auto',
            left: source === 'ally' ? target.getBoundingClientRect().left + target.getBoundingClientRect().width / 4 :
                target.getBoundingClientRect().left + target.getBoundingClientRect().width * 3 / 4,
            top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 4,
            opacity: 1,
            visibility: 'visible',
            delay: .1,
            duration: .4 / repeat
        }, 'fx' + i)
            .set(fx[1], {
                attr: {
                    src: 'src/assets/battle/fx/' + fxImage[1] + '.png',
                },
                width: '7%',
                height: 'auto',
                left: source === 'ally' ? target.getBoundingClientRect().left + target.getBoundingClientRect().width / 4 :
                    target.getBoundingClientRect().left + target.getBoundingClientRect().width * 3 / 4,
                top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 4 + 35,
                opacity: 1,
                visibility: 'visible',
                delay: .1,
                duration: .4 / repeat
            }, 'fx' + i);
    }

    tl.to(fx[1], {
        top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 4 + 20,
        duration: .1,
        delay: .1
    })
        .to(fx[1], {
            top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 4 + 35,
            duration: .1,
            delay: .1
        })
        .to(fx[1], {
            top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 4 + 20,
            duration: .1,
            delay: .1
        })
        .set(target, {
            filter: 'invert(1)',
            delay: .1,
            duration: .2,
        })
        .set(target, {
            filter: 'invert(0)',
            delay: .1,
        })
        .set(fx, {
            opacity: 0,
            visibility: 'hidden',
            delay: .1,
        })
        .to(
            initiator,
            {
                left: source === 'ally' ?
                    window.innerWidth * 0.25 - target.getBoundingClientRect().width / 2
                    : window.innerWidth * 0.75 - target.getBoundingClientRect().width / 2,
                bottom: source === 'ally' ? '15%' : '35%',
                duration: .3,
                delay: .1
            }
        ).play();
}

function animateContactSprite(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number,
    scale: number,
    repeat: number) {
    console.log(repeat);
    let tl = gsap.timeline();
    tl.to(
        initiator,
        {
            left: source === 'ally' ?
                target.getBoundingClientRect().left - initiator.getBoundingClientRect().width * 2 / 3 :
                target.getBoundingClientRect().right - initiator.getBoundingClientRect().width * 2 / 3,
            bottom: source === 'ally' ? '35%' : '15%',
            duration: .4
        }
    ).set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 50%',
        backgroundSize: 'cover',
        width: spriteSize + 'px',
        height: spriteSize + 'px',
        left: source === 'ally' ? target.getBoundingClientRect().left : target.getBoundingClientRect().right - (192 * scale),
        bottom: initiator.getBoundingClientRect().top - (192 * .8 / 2),
        scale: scale,
        opacity: 1,
        visibility: 'visible',
        delay: .1,
        duration: .2
    }, 'fx')
    for (let i = 0; i < repeat; i++) {
        for (let j = 1; j < spriteN; j++) {
            const xPos = -j * spriteSize;
            tl.to(spriteFx, {
                backgroundPosition: `${xPos}px 50%`,
                ease: 'steps(1)',
                duration: 1.5 / (spriteN * repeat),
            }
            );
        }
    }
    tl.set(target, {
        filter: 'invert(1)',
        delay: .2,
        duration: .2,
    }).set(target, {
        filter: 'invert(0)',
        delay: .1,
    }).set(spriteFx, {
        opacity: 0,
        visibility: 'hidden',
        delay: .1,
    }).to(
        initiator,
        {
            left: source === 'ally' ?
                window.innerWidth * 0.25 - target.getBoundingClientRect().width / 2
                : window.innerWidth * 0.75 - target.getBoundingClientRect().width / 2,
            bottom: source === 'ally' ? '15%' : '35%',
            duration: .3,
            delay: .1
        }
    ).play();
}