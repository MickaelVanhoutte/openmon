import {Character} from "../player/player";


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

export function resetKeys(){
    keys.down.pressed = false;
    keys.up.pressed = false;
    keys.right.pressed = false;
    keys.left.pressed = false;
}

//export let lastKey: string = '';

export let lastKey ={
    key: ''
};


