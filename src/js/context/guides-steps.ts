export const GUIDES_STEPS = {
    JOYSTICK:  {
        content: 'Touch the screen to use the Joystick.',
        order: 0,
    },
    KEYBOARD_ARROWS: {
        content: 'If on desktop, use keyboard arrows ◄ ► ▲ ▼ to move.',
        order: 1,
    },
    KEYBOARD_AB: {
        content: "Use buttons or keyboard 'A'/'Enter' to interact with the game, B to cancel.",
        order: 2,
    },
    EVS: {
        target: '.edit',// replaced
        title: 'Effort values (EVs)',
        content: 'Use this setting button to edit the EVs of your Pokémon.',
        order: 3
    },
    EVS_EDIT: {
        target: '.edit',// replaced
        title: 'Effort values (EVs)',
        content: "Use buttons '+' (+1), '++' (+10) or '-' (-1), '--' (-10) to assign your Pokémon's EVs.",
        order: 4
    }
}