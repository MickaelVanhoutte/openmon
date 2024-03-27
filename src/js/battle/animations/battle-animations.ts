import { gsap } from 'gsap';

export function animate(
    move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
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
            animateContact(move, source, target, initiator, scene, [fx[0]], 'foot');
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

            animateContact(move, source, target, initiator, scene, [fx[0]], 'fist');
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
            animateContact(move, source, target, initiator, scene, [fx[0]], 'rightchop');
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
        case 'wood-hammer':
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
            animateContact(move, source, target, initiator, scene, [fx[0]], 'impact');
            break;
        case 'scratch':
        case 'cut':
        case 'slash':
        case 'fury-swipes':
        case 'false-swipe':
        case 'fury-cutter':
        case 'night-slash':
        case 'x-scissor':
            animateContact(move, source, target, initiator, scene, [fx[0]], 'rightslash');
            break;
        case 'metal-claw':
        case 'shadow-claw':
        case 'dragon-claw':
        case 'crush-claw':
        case 'hone-claws':
            animateContact(move, source, target, initiator, scene, [fx[0]], 'rightclaw');
            break;
        case 'bite':
        case 'crunch':
        case 'fire-fang':
        case 'ice-fang':
        case 'thunder-fang':
        case 'poison-fang':
        case 'bug-bite':
        case 'psychic-fang':
            animateContact(move, source, target, initiator, scene, [fx[0]], 'topbite');
            break;


        // distance moves

        // from player

        // back and forth
        default:
            console.log('No animation for this move');
    }
}

function animateContact(move: string,
    source: 'ally' | 'opponent',
    target: HTMLImageElement,
    initiator: HTMLImageElement,
    scene: HTMLDivElement,
    fx: HTMLImageElement[],
    fxImage: string) {
    gsap.timeline()
        .to(
            initiator,
            {
                x: source === 'ally' ? target.getBoundingClientRect().left - initiator.getBoundingClientRect().width :
                    -target.getBoundingClientRect().right - initiator.getBoundingClientRect().width,
                duration: .5
            }
        )
        .set(fx, {
            attr: {
                src: 'src/assets/battle/fx/' + fxImage + '.png',
            },
            width: '7%',
            height: 'auto',
            left: target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2,
            top: target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2,
            opacity: 1,
            visibility: 'visible',
            delay: .5,
            duration: .3
        })
        .set(target, {
            filter: 'invert(1)',
            delay: .6,
            duration: .1,
        })
        .set(target, {
            filter: 'invert(0)',
            delay: .7,
            duration: 1,
        })
        .set(fx, {
            opacity: 0,
            visibility: 'hidden',
            delay: .8,
            duration: 1
        })
        .to(
            initiator,
            {
                x: 0,
                y: 0,
                duration: .4,
                delay: 1
            }
        ).play();
}