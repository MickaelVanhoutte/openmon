import { gsap } from 'gsap';

export function animateEntry(target: HTMLImageElement, source: 'ally' | 'opponent') {
    gsap.timeline().fromTo(target,
        {
            x: source === 'ally' ? -300 : window.innerWidth + 100,
            filter: source === 'ally' ? 'brightness(5)' : 'brightness(0)',
            borderRadius: source === 'ally' ? '50%' : '0%',
        },
        {
            x: source === 'ally' ? window.innerWidth * .025 : window.innerWidth * .55,
            borderRadius: 0,
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
            transform: 'scale(.3)',
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
        case 'blaze-kick':
        case 'low-sweep':
        case 'darkest-lariat':
        case 'triple-axel':
        case 'thunderous-kick':
        case 'axe-kick':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['foot']);
            break;
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
        case 'drain-punch':
        case 'shadow-punch':
        case 'sky-uppercut':
        case 'close-combat':
        case 'sucker-punch':
        case 'poison-jab':
        case 'power-up-punch':

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
        case 'plasma-fists':
        case 'rage-fist':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['rightchop']);
            break;
        case 'pound':
        case 'tackle':
        case 'body-slam':
        case 'heavy-slam':
        case 'take-down':
        case 'headbutt':
        case 'double-edge':
        case 'strength':
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
        case 'u-turn':
        case 'dragon-rush':
        case 'giga-impact':
        case 'power-whip':
        case 'dragon-hammer':
        case 'brutal-swing':
        case 'smack-down':
        case 'flame-charge':
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
            animateContact(move, source, target, initiator, scene, [fx[0]], ['impact']);
            break;
        case 'scratch':
        case 'cut':
        case 'slash':
        case 'fury-swipes':
        case 'false-swipe':
        case 'fury-cutter':
        case 'night-slash':
        case 'x-scissor':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['rightslash']);
            break;
        case 'metal-claw':
        case 'shadow-claw':
        case 'dragon-claw':
        case 'crush-claw':
        case 'hone-claws':
            animateContact(move, source, target, initiator, scene, [fx[0]], ['rightclaw']);
            break;
        case 'bite':
        case 'crunch':
        case 'fire-fang':
        case 'ice-fang':
        case 'thunder-fang':
        case 'poison-fang':
        case 'bug-bite':
        case 'psychic-fang':
            animateContact(move, source, target, initiator, scene, fx, ['topbite', 'bottombite']);
            break;


        // from initiator
        // electrik
        case 'thunder-shock':
            case 'spark':
        case 'electro-ball':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'thunder-sprite', 6, 192);
            break;
        // fire
        case 'ember':
            animateSpriteFrom(move, source, target, initiator, scene, spriteFx, 'fire-sprite', 8, 192);
            break;

        // back and forth

        // distance moves

        default:
            console.log('No animation for this move');
            break;
    }
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
    spriteSize: number) {
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
        scale: .3,
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
            scale: 1.2,
            delay: 0,
        }, 'fx+=.1')
    // animate sprite
    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.to(spriteFx, {
            opacity: .5,
            scale: 0.1 + i * .2,
            duration: .1,
            ease: 'elastic.inOut',
        },).set(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            scale: 0.2 + i * .1,
            opacity: 1,
            duration: .3,
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

export function animateSpriteDistance(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    spriteFx: HTMLDivElement,
    fxImage: string,
    spriteN: number,
    spriteSize: number) {
    let tl = gsap.timeline();

    tl.set(spriteFx, {
        background: 'url(src/assets/battle/fx/' + fxImage + '.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 50%',
        backgroundSize: 'cover',
        width: spriteSize + 'px',
        height: spriteSize + 'px',
        left: source === 'ally' ? target.getBoundingClientRect().left + target.getBoundingClientRect().width / 4 :
            target.getBoundingClientRect().left + target.getBoundingClientRect().width * 3 / 4,
        top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 4,
        opacity: 1,
        visibility: 'visible',
        delay: .1,
        duration: .2
    }, 'fx')
    for (let i = 1; i < spriteN; i++) {
        const xPos = -i * spriteSize;
        tl.to(spriteFx, {
            opacity: .5,
            scale: .7,
            duration: .05,
            ease: 'elastic.inOut',
        }).to(spriteFx, {
            backgroundPosition: `${xPos}px 50%`,
            ease: 'steps(1)',
            opacity: 1,
            scale: 1,
            duration: .2,
            delay: 0,
        });
    }
    tl.set(spriteFx, {
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
    fxImage: string[]) {
    gsap.timeline()
        .to(
            initiator,
            {
                x: source === 'ally' ?
                    target.getBoundingClientRect().left - initiator.getBoundingClientRect().width :
                    target.getBoundingClientRect().right - initiator.getBoundingClientRect().width,
                y: target.getBoundingClientRect().top - initiator.getBoundingClientRect().height / 2,
                duration: .4
            }
        )
        .set(fx[0], {
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
            duration: .4
        }, 'fx')
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
            duration: .4
        }, 'fx')
        .to(fx[1], {
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
        .to(target, {
            skew: source === 'ally' ? '20deg' : '-20deg',
            duration: .2,
            delay: .1
        })
        .set(target, {
            filter: 'invert(1)',
            delay: .2,
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
                x: source === 'ally' ? window.innerWidth * .025 : window.innerWidth * .55,
                y: 0,
                duration: .3,
                delay: .1
            }
        ).play();
}