import { gsap } from 'gsap';
import type { Move } from '../../pokemons/pokedex';

export function animateEntry(target: HTMLImageElement, source: 'ally' | 'opponent',idx: number = 0, partner: boolean = false, double: boolean = false): gsap.core.Timeline {
    return gsap.timeline().fromTo(target,
        {
            left: source === 'ally' ? -target.getBoundingClientRect().width : window.innerWidth,
            filter: source === 'ally' ? 'brightness(5)' : 'brightness(0)',
        },
        {
            left: source === 'ally' ?
                window.innerWidth * (partner ? 0.18 : (0.25 + (idx * 0.1) + (idx === 0 && double ? 0.1 : 0))) - target.getBoundingClientRect().width / 2 - (idx * window.innerWidth * 0.2)
                : window.innerWidth * (partner ? 0.68 : (0.75 - (idx * 0.12) - (idx === 0 && double ? 0.1 : 0))) - target.getBoundingClientRect().width / 2 + (idx *  window.innerWidth * 0.2),
            duration: 2,
        }).to(target, {
            filter: 'brightness(1)',
            duration: 1,
        }).play();
}

export function animateFaint(target: HTMLImageElement): gsap.core.Timeline {
    return gsap.timeline()
        .to(target, {
            filter: 'brightness(0)',
            y: window.innerHeight,
            duration: 1,
            delay: 2
        })
        .play();
}

export function animateRun(target: HTMLImageElement, source: 'ally' | 'opponent'): gsap.core.Timeline { // todo handle for opponent
    return gsap.timeline()
        .to(target, {
            filter: 'brightness(5)',
            transform: 'scale(.1)',
            duration: .8,
            delay: .3
        })
        .to(target, {
            x: source === 'ally' ? -window.innerWidth / 2 : window.innerWidth / 2,
            duration: 1,
            delay: 0
        })
        .play();
}

export function animateMove(
    move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLImageElement,
    spriteFx: HTMLDivElement,
    fx: HTMLImageElement[]): gsap.core.Timeline | Promise<gsap.core.Timeline> {

        const initialPos = {
            bottom: initiator.style.bottom,
            left: initiator.getBoundingClientRect().left,
        }

        //return animateBeam(move, source, target, initiator, scene, spriteFx);
    switch (move.name) {

        // contact moves
        case 'stomp':
        case 'low-kick':
        case 'double-kick':
        case 'jump-kick':
        case 'mega-kick':
        case 'rolling-kick':
        case 'high-jump-kick':
        case 'triple-kick':
        case 'blaze-kick':
        case 'low-sweep':
        case 'darkest-lariat':
        case 'triple-axel':
        case 'thunderous-kick':
        case 'axe-kick':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'foot-sprite', 5, 192, 1, 1);
        case 'comet-punch':
        case 'mega-punch':
        case 'fire-punch':
        case 'ice-punch':
        case 'thunder-punch':
        case 'dizzy-punch':
        case 'mach-punch':
        case 'dynamic-punch':
        case 'focus-punch':
        case 'bullet-punch':
        case 'shadow-punch':
        case 'sky-uppercut':
        case 'close-combat':
        case 'sucker-punch':
        case 'poison-jab':
        case 'power-up-punch':
        case 'plasma-fists':
        case 'force-palm':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'fist-sprite', 5, 192, 1, 1);
        case 'karate-chop':
        case 'cross-chop':
        case 'rock-smash':
        case 'brick-break':
        case 'knock-off':
        case 'arm-thrust':
        case 'dual-chop':
        case 'throat-chop':
        case 'rage-fist':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'chop-sprite', 4, 192, 1, 1);
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
        case 'poison-tail':
        case 'aqua-tail':
        case 'iron-tail':
        case 'dragon-tail':
        case 'volt-tackle':
        case 'wood-hammer':
        case 'hammer-arm':
        case 'ice-hammer':
        case 'dragon-rush':
        case 'giga-impact':
        case 'power-whip':
        case 'dragon-hammer':
        case 'brutal-swing':
        case 'smack-down':
        case 'flame-charge':
        case 'acrobatics':
        case 'final-gambit':
        case 'struggle':
        case 'struggle-bug':
        case 'wild-charge':
        case 'horn-attack':
        case 'horn-drill':
        case 'tail-slap':
        case 'play-rough':
        case 'body-press':
        case 'revenge':
        case 'covet':
        case 'wing-attack':
        case 'outrage':
        case 'bolt-strike':
        case 'fusion-bolt':
        case 'aura-wheel':
        case 'pay-day': // TODO coins fall
        case 'bide': // TODO angry first turns
        case 'skull-bash': // TODO only 2nd turn
        case 'zen-headbutt':
        case 'rollout':
        case 'head-smash':
        case 'iron-head':
        case 'aqua-jet':
        case 'superpower':
        case 'steel-wing':
        case 'beat-up':
        case 'power-trip':
        case 'flare-blitz':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'impact-sprite', 4, 192, 1, 1);
        case 'double-slap':
        case 'double-hit':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'impact-sprite', 4, 192, 1, 2);
        case 'scratch':
        case 'cut':
        case 'slash':
        case 'false-swipe':
        case 'fury-cutter':
        case 'night-slash':
        case 'x-scissor':
        case 'vice-grip':
        case 'guillotine':
        case 'cross-poison':
        case 'psycho-cut':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'slash-sprite', 5, 192, 1, 1);
        case 'fury-swipes':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'slash-sprite', 5, 192, 1, 2);
        case 'metal-claw':
        case 'shadow-claw':
        case 'dragon-claw':
        case 'crush-claw':
        case 'hone-claws':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'claws-sprite', 8, 192, 1, 1);
        case 'bite':
        case 'crunch':
        case 'fire-fang':
        case 'ice-fang':
        case 'thunder-fang':
        case 'poison-fang':
        case 'bug-bite':
        case 'psychic-fang':
        case 'hyper-fang':
        case 'super-fang':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'crunch-sprite', 6, 192, .6, 2);
        // from initiator
        // electrik
        case 'thunder-shock':
        case 'thunderbolt':
        case 'thunder':
        case 'electro-web': // todo add web sprite
        case 'nuzzle':
        case 'overdrive':
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'thunder-sprite', 6, 192);
        case 'spark':
        case 'zap-cannon':
        case 'shock-wave':
        case 'discharge':
        case 'charge-beam':
        case 'electro-ball':
        case 'electrify':
        case 'eerie-impulse':
        case 'bolt-beak':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'thunderball-sprite', 6, 192);
        // fire
        case 'ember':
        case 'flamethrower':
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
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'fire-sprite', 8, 192);
        // ice
        case 'ice-beam': // TODO From, change sprite
        case 'hyper-beam': // TODO From, change sprite
        case 'blizzard':
        case 'freeze-dry':
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'ice-sprite', 6, 192);
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
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'wind-sprite', 8, 192);
        // beams
        case 'dazzling-gleam':
        case 'moonblast':
        case 'vacuum-wave':
        case 'aura-sphere':
        case 'energy-ball':
        case 'weather-ball':
        case 'focus-blast':
        case 'gyro-ball':
        case 'bug-buzz':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'lightball-sprite', 8, 192, true);
        // shadow balls
        case 'shadow-ball':
        case 'dark-pulse':
        case 'foul-play':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'shadowball-sprite', 8, 192);
        // grass
        case 'leech-seed':
        case 'vine-whip':
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'vines-sprite', 6, 192);
        case 'leafage':
        case 'magical-leaf':
        case 'leaf-blade':
        case 'razor-leaf':
        case 'leaf-storm':
        case 'leaf-tornado':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'leaf-sprite', 6, 192);
        // poison
        case 'venoshock':
        case 'sludge-wave':
        case 'sludge-bomb':
        case 'acid':
        case 'smog':
        case 'clear-smog':
        case 'belch':
        case 'poison-powder':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'poison-sprite', 9, 192);
        case 'toxic':
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'poison-sprite', 9, 192);
        case 'rock-slide':
        case 'rock-throw':
        case 'stone-edge':
        case 'rock-tomb':
        case 'rock-blast':
        case 'ancient-power':
        case 'power-gem':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'rock-sprite', 7, 192);
        case 'waterfall':
        case 'whirlpool':
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'water-sprite', 8, 192);
        case 'hydro-pump':
        case 'surf':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'water-sprite', 8, 192);

        case 'water-gun':
        case 'bubble':
        case 'bubble-beam':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'waterdrop-sprite', 3, 192);

        case 'dragon-breath':
        case 'dragon-pulse':
        case 'solar-beam':
        case 'aurora-beam':
        case 'frost-breath':
        case 'laser-focus':
        case 'psybeam':
        case 'flash-cannon':
        case 'tri-attack':
        case 'psyshock':
            return animateBeam(move, source, target, initiator, scene, spriteFx);

        case 'pin-missile':
        case 'fell-stinger':
        case 'megahorn':
        case 'peck':
        case 'drill-peck':
        case 'pluck':
        case 'drill-run':
        case 'fury-attack':
            return animateThrow(move, source, target, initiator, scene, spriteFx, 'sting', 1, 192);
        case 'ice-shard':
        case 'icicle-spear':
        case 'icicle-crash':
        case 'poison-sting':
            return animateThrow(move, source, target, initiator, scene, spriteFx, 'shard', 1, 192);

        case 'leech-life':
        case 'draining-kiss':
        case 'absorb':
        case 'mega-drain':
        case 'giga-drain':
        case 'parabolic-charge':
        case 'strength-sap':
        case 'oblivion-wing':
            return animateSpriteFromTarget(move, source, target, initiator, scene, spriteFx, 'drain-sprite', 8)
                .then(() => animateSpriteSelf(move, source, target, initiator, scene, spriteFx, 'heal-sprite', 7));

        case 'drain-punch':
        case 'horn-leech':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'fist-sprite', 5, 192, 1, 1)
                .then(() => animateSpriteFromTarget(move, source, target, initiator, scene, spriteFx, 'drain-sprite', 8)
                    .then(() => animateSpriteSelf(move, source, target, initiator, scene, spriteFx, 'heal-sprite', 7)));

        case 'baton-pass':
            return animateRun(initiator, source);
        case 'u-turn':
        case 'volt-switch':
            return animateSpriteDash(move, source, target, initiator,initialPos, scene, spriteFx, 'impact-sprite', 4, 192, 1, 1)
                .then(() => animateRun(initiator, source));

        // heal 
        case 'recover':
        case 'moonlight':
        case 'synthesis':
        case 'milk-drink':
        case 'soft-boiled':
        case 'slack-off':
        case 'roost':
        case 'heal-order':
        case 'morning-sun':
        case 'heal-bell':
            return animateSpriteSelf(move, source, target, initiator, scene, spriteFx, 'heal-sprite', 7);

        case 'heal-pulse':
            return animateSpriteToTarget(move, source, target, initiator, scene, spriteFx, 'heal-sprite', 7);

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
        case 'quiver-dance':
            return animateSpriteOnTarget(move, source, initiator, initiator, scene, spriteFx, 'buff-sprite', 6, 192);
        case 'swagger':
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'buff-sprite', 6, 192);
        // then confusion

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
            return animateSpriteOnTarget(move, source, target, initiator, scene, spriteFx, 'debuff-sprite', 6, 192);

        default:
            console.log('No animation for this move');
            return gsap.timeline().play();
    }
}

function animateEffects() {
    // TODO 
    // confusion, para...
}

function animateThrow(move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    repeat: number = 1,
    spriteSize: number = 192): gsap.core.Timeline {
    let tl = gsap.timeline();

    for (let i = 0; i < repeat; i++) {
        tl.set(spriteFx, {
            background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
            left: source === 'ally' ?
                initiator.getBoundingClientRect().right - spriteSize / 2 :
                initiator.getBoundingClientRect().left + spriteSize / 2,
            //bottom: source === 'ally' ? 'calc(25% - ' + spriteSize / 2 + 'px)' : 'calc(45% + ' + spriteSize / 2 + 'px)',
            bottom: '50%',
            opacity: 1,
            height: spriteSize + 'px',
            width: spriteSize + 'px',
            scale: source === 'ally' ? 1 : -1,
            visibility: 'visible',
            duration: .2
        })
            .to(spriteFx, {
                left: source === 'ally' ?
                    target.getBoundingClientRect().right - target.getBoundingClientRect().width / 2 - spriteSize / 2 :
                    target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 + spriteSize / 2,
                bottom: '50%',//source === 'ally' ? 'calc(45% - ' + spriteSize / 2 + 'px)' : 'calc(25% + ' + spriteSize / 2 + 'px)',
                duration: Math.min(.5, 1.5 / repeat),
                delay: 0,
            }).set(target, {
                filter: 'invert(1)',
                duration: .2,
            }).set(target, {
                filter: 'invert(0)',
                delay: .1,
            });

        let afterEffect = getAfterEffect(move);

        if (afterEffect !== undefined) {
            tl.set(spriteFx, {
                background: 'url(src/assets/battle/fx/elements/'+afterEffect+'.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'cover',
                width: spriteSize + 'px',
                height: spriteSize + 'px',
                left: target.getBoundingClientRect().right - target.getBoundingClientRect().width / 2 - (192 / 2),
                bottom: '50%',//source === 'ally' ? '35%' : '15%',
                scale: 1,
                opacity: 1,
                visibility: 'visible',
                duration: .4
            }, 'element')
        }

        tl.set(spriteFx, {
            opacity: 0,
            visibility: 'hidden',
            delay: .1,
        })
    }


    return tl.play();
}

function animateSpriteFromTarget(
    move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number = 192): gsap.core.Timeline {
    let tl = gsap.timeline();

    let angle = getHueAngle(move);

    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 50%',
        backgroundSize: 'cover',
        width: spriteSize + 'px',
        height: spriteSize + 'px',
        left: target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 - (192 / 2),
        //bottom: '50%',//source === 'ally' ? '35%' : '15%',
        top: initiator.getBoundingClientRect().bottom - initiator.getBoundingClientRect().height / 2 - 192 / 2,
        filter: 'hue-rotate(' + angle + 'deg)',
        opacity: 1,
        visibility: 'visible',
        scale: 1,
        duration: .1
    }, 'fx');

    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            duration: 1 / spriteN,
        }, 'fx+=' + (.1 + (1 / spriteN) * i)
        );
    }
    tl.set(target, {
        filter: 'invert(1)',
        delay: .2,
        duration: .2,
    }).set(target, {
        filter: 'invert(0)',
        delay: .1,
    })
        .to(spriteFx, {
            left: target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 - (spriteSize / 2),
            //bottom: '50%',//source === 'ally' ? '15%' : '35%',
            top: target.getBoundingClientRect().bottom - target.getBoundingClientRect().height / 2 - 192 / 2,
            ease: 'expo.in',
            duration: .5,
        })
        .set(spriteFx, {
            opacity: 0,
            visibility: 'hidden',
            delay: .1,
        })

    return tl.play();
}

function animateBeam(
    move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    spriteSize: number = 192): gsap.core.Timeline {
    let tl = gsap.timeline();

    let angle = getHueAngle(move);

    tl
        .to(scene, {
            opacity: .3,
            duration: 1.4,
        }, 'fx')
        .set(spriteFx, {
            background: 'url(src/assets/battle/fx/beam.png)',
            left: source === 'ally' ?
                initiator.getBoundingClientRect().right - (spriteSize / 2) :
                initiator.getBoundingClientRect().left + spriteSize / 2,
            //top: initiator.getBoundingClientRect().bottom - initiator.getBoundingClientRect().height / 2 - 192 / 2,
            bottom: source === 'ally' ? 'calc(40% - ' + spriteSize / 2 + 'px)' : 'calc(45% + ' + spriteSize / 2 + 'px)' ,
            //bottom: '50%',
            opacity: 1,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 0,
            rotate: -10,
            height: spriteSize,
            width: 20,
            filter: 'hue-rotate(' + angle + 'deg)',
            scale: source === 'ally' ? 1 : -1,
            visibility: 'visible',
            duration: .2,
        }, 'fx')
        .to(spriteFx, {
            width: '80dvw',
            left: source === 'ally' ? initiator.getBoundingClientRect().right : 'calc(' + initiator.getBoundingClientRect().left + '-' + spriteFx.getBoundingClientRect().width + ')',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 0,
            ease: 'bounce.in',
            duration: .9,
            delay: .1,
        }, 'fx').set(target, {
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
            opacity: 1,
        })

    return tl.play();
}

function animateSpriteSelf(move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number = 192): gsap.core.Timeline {
    let tl = gsap.timeline();

    let angle = getHueAngle(move);

    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        left: initiator.getBoundingClientRect().left + initiator.getBoundingClientRect().width / 2 - spriteSize / 2,
        top: initiator.getBoundingClientRect().top - spriteSize / 3,
        opacity: 1,
        filter: 'hue-rotate(' + angle + 'deg)',
        height: spriteSize + 'px',
        width: spriteSize + 'px',
        scale: 1,
        visibility: 'visible',
        duration: .1,
    }, 'fx')
        .to(scene, {
            opacity: .4,
            duration: 1.4,
        }, 'fx')

    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            duration: 1 / spriteN,
        }, 'fx+=' + (.1 + (1 / spriteN) * i)
        );
    }
    // end
    tl.set(initiator, {
        filter: 'brightness(3)',
        duration: .2,
    })
        .set(initiator, {
            filter: 'brightness(1)',
            delay: .1,
        }).set(spriteFx, {
            opacity: 0,
            visibility: 'hidden',
            delay: .1,
        })
        .set(scene, {
            opacity: .85,
        })

    return tl.play();
}

function animateSpriteToTarget(
    move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number = 192,
    colorize: boolean = false): gsap.core.Timeline {
    let tl = gsap.timeline();

    let angle = colorize ? getHueAngle(move) : 0;

    // from initiator
    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        left: source === 'ally' ?
            initiator.getBoundingClientRect().right - spriteSize / 2 :
            initiator.getBoundingClientRect().left + spriteSize / 2,
        bottom: source === 'ally' ? 'calc(40% - ' + spriteSize / 2 + 'px)' : 'calc(45% + ' + spriteSize / 2 + 'px)' ,
        opacity: 1,
        filter: 'hue-rotate(' + angle + 'deg)',
        height: spriteSize + 'px',
        width: spriteSize + 'px',
        scale: source === 'ally' ? 1 : -1,
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
            bottom: 'calc(45% - ' + spriteSize / 2 + 'px)',
            duration: 1.4,
            scale: .8,
            delay: 0,
        }, 'fx+=.1')
    // animate sprite
    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            duration: 1 / spriteN,
        }, 'fx+=' + (.1 + (1 / spriteN) * i)
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
    return tl.play();
}

function animateSpriteOnTarget(
    move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number = 192): gsap.core.Timeline {
    let tl = gsap.timeline();

    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 50%',
        backgroundSize: 'cover',
        width: spriteSize + 'px',
        height: spriteSize + 'px',
        left: target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 - (spriteSize / 2),
        bottom: 'calc(45% - ' + spriteSize / 2 + 'px)',
        //bottom: source === 'ally' ? '35%' : '15%',
        opacity: 1,
        visibility: 'visible',
        scale: 1,
        duration: .2
    }, 'fx')
    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            duration: 1 / spriteN,
        }, 'fx+=' + (.1 + (1 / spriteN) * i)
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
    return tl.play();
}

function animateSpriteDash(
    move: Move,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    initialPos: { bottom: string, left: number },
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number,
    scale: number,
    repeat: number): gsap.core.Timeline {
    let tl = gsap.timeline();
    tl.to(
        initiator,
        {
            left: source === 'ally' ?
                target.getBoundingClientRect().left - initiator.getBoundingClientRect().width * 2 / 3 :
                target.getBoundingClientRect().right - initiator.getBoundingClientRect().width * 2 / 3,
                bottom: target.getBoundingClientRect().y,
            //bottom: source === 'ally' ? '35%' : '15%',
           // bottom: '50%',
            duration: .4
        }
    ).set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 50%',
        backgroundSize: 'cover',
        width: spriteSize + 'px',
        height: spriteSize + 'px',
        left: target.getBoundingClientRect().right - target.getBoundingClientRect().width / 2 - (192 * scale / 2),
        bottom: source === 'ally' ? '35%' : '15%',
        //bottom: '50%',
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
                duration: spriteN >= 6 ? (1.5 / (spriteN * repeat)) : .2,
            }
            );
        }
    }
    tl.set(target, {
        filter: 'invert(1)',

        duration: .2,
    }).set(target, {
        filter: 'invert(0)',
        delay: .1,
    });

    let afterEffect = getAfterEffect(move);

    if (afterEffect !== undefined) {
        tl.set(spriteFx, {
            background: 'url(src/assets/battle/fx/elements/'+afterEffect+'.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0 0',
            backgroundSize: 'cover',
            width: spriteSize + 'px',
            height: spriteSize + 'px',
            left: target.getBoundingClientRect().right - target.getBoundingClientRect().width / 2 - (192 * scale / 2),
            bottom: source === 'ally' ? '35%' : '15%',
            //bottom: '50%',
            scale: 1,
            opacity: 1,
            visibility: 'visible',
            duration: .4
        }, 'element')
    }

    tl.set(spriteFx, {
        opacity: 0,
        visibility: 'hidden',
    }, 'element+=.4').to(
        initiator,
        {
            left: initialPos.left,
            bottom: initialPos.bottom,
            //bottom: source === 'ally' ? '15%' : '35%',
           // bottom: '50%',
            duration: .3,
            delay: .1
        }
    )
    return tl.play();
}

function getAfterEffect(move: Move) {
    let afterEffect = undefined;
    switch (move.type) {
        case 'water':
            afterEffect = 'water';
            break;
        case 'fire':
            afterEffect = 'burn';
            break;
        case 'electric':
            afterEffect = 'static';
            break;
        case 'ice':
            afterEffect = 'ice';
            break;
        case 'poison':
            afterEffect = 'poison';
            break;
        case 'rock':
            afterEffect = 'rock';
            break;
        case 'grass':
            afterEffect = 'grass';
            break;
        default:
            afterEffect = undefined;
            break;
    }
    console.log(move.type, afterEffect);
    return afterEffect;
}

function getHueAngle(move: Move) {
    let angle = 0;
    switch (move.type) {
        case 'fire':
            angle = -55;
            break;
        case 'water':
            angle = 155;
            break;
        case 'grass':
            angle = 45;
            break;
        case 'bug':
            angle = 60;
            break;
        case 'dragon':
            angle = 190;
            break;
        case 'psychic':
            angle = 220;
            break;
        case 'ice':
            angle = 115;
            break;
        default:
            angle = 0;
            break;
    }
    return angle;
}