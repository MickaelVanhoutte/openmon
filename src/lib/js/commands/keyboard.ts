export const keys = {
    up: {
        pressed: false
    },
    down: {
        pressed: false
    },
    left: {
        pressed: false
    },
    right: {
        pressed: false
    },
}

export let lastKey: string = '';


export function keyupListener() {
    return (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown' :
                keys.down.pressed = false;
                break;
            case 'ArrowUp' :
                keys.up.pressed = false;
                break;
            case 'ArrowRight' :
                keys.right.pressed = false;
                break;
            case 'ArrowLeft' :
                keys.left.pressed = false;
                break;
        }
    };
}


export function keydownListener() {
    return (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown' :
                lastKey = 'ArrowDown';
                keys.down.pressed = true;
                break;
            case 'ArrowUp' :
                lastKey = 'ArrowUp';
                keys.up.pressed = true;
                break;
            case 'ArrowRight' :
                lastKey = 'ArrowRight';
                keys.right.pressed = true;
                break;
            case 'ArrowLeft' :
                lastKey = 'ArrowLeft';
                keys.left.pressed = true;
                break;
        }
    };
}
