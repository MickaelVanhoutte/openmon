import {Player} from "../characters/player";


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
    a: {
        pressed: false
    },
    b: {
        pressed: false
    }
}

export function resetKeys() {
    keys.down.pressed = false;
    keys.up.pressed = false;
    keys.right.pressed = false;
    keys.left.pressed = false;
    keys.a.pressed = false;
    keys.b.pressed = false;
}

//export let lastKey: string = '';

export let lastKey = {
    key: ''
};

export class ABButtons {
    a: boolean;
    b: boolean;
    buttonA: HTMLButtonElement;
    buttonB: HTMLButtonElement;
    container: HTMLElement;
    onChange: (a: boolean, b: boolean) => void;
    aKeyboardListener = (e: KeyboardEvent) => {
        if (e.key === "a") {
            this.a = true;
            this.buttonA.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
            this.onChange(this.a, this.b);
        }
    }
    bKeyboardListener = (e: KeyboardEvent) => {
        if (e.key === "b") {
            this.b = true;
            this.buttonB.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
            this.onChange(this.a, this.b);
        }
    }
    aKeyboardUpListener = (e: KeyboardEvent) => {
        if (e.key === "a") {
            this.a = false;
            this.buttonA.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
            this.onChange(this.a, this.b);
        }
    }
    bKeyboardUpListener = (e: KeyboardEvent) => {
        if (e.key === "b") {
            this.b = false;
            this.buttonB.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
            this.onChange(this.a, this.b);
        }
    }

    constructor(container: HTMLElement ,onChange: (a: boolean, b: boolean) => void) {
        this.a = false;
        this.b = false;
        this.onChange = onChange;

        this.container = document.createElement("div");
        this.container.style.position = "fixed";
        this.container.style.bottom = "5dvh";
        this.container.style.right = "3dvw";
        this.container.style.width = "110px";
        this.container.style.height = "100px";

        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.justifyContent = "space-between";
        this.container.style.alignItems = "center";
        this.container.style.zIndex = "8";

        let buttonA = document.createElement("button");
        buttonA.style.fontFamily= "pokemon, serif";
        buttonA.style.padding = '12px 16px';
        buttonA.style.backgroundColor = "rgba(44, 56, 69, 0.95)";
        buttonA.style.border = "1px solid black";
        buttonA.style.borderRadius = "50%";
        buttonA.style.cursor = "pointer";
        buttonA.style.outline = "none";
        buttonA.style.fontSize = "20px";
        buttonA.style.color = "white";
        buttonA.style.fontWeight = "bold";
        buttonA.style.marginLeft = "50%";
        buttonA.textContent = "A";
        if(!buttonA.ontouchstart) {
            buttonA.addEventListener("mousedown", () => {
                this.a = true;
                buttonA.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
                this.onChange(this.a, this.b);
            });
            buttonA.addEventListener("mouseup", () => {
                this.a = false;
                buttonA.style.backgroundColor = "rgba(44, 56, 69, 0.95)";
                this.onChange(this.a, this.b);
            });
        }else {
            buttonA.addEventListener("touchstart", () => {
                this.a = true;
                buttonA.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
                this.onChange(this.a, this.b);
            });

            buttonA.addEventListener("touchend", () => {
                this.a = false;
                buttonA.style.backgroundColor = "rgba(44, 56, 69, 0.95)";
                this.onChange(this.a, this.b);
            });
        }


        this.buttonA = buttonA;
        this.container.appendChild(buttonA);

        let buttonB = document.createElement("button");
        buttonB.style.fontFamily= "pokemon, serif";
        buttonB.style.padding = '12px 16px';
        buttonB.style.backgroundColor = "rgba(44, 56, 69, 0.95)";
        buttonB.style.border = "1px solid black";
        buttonB.style.borderRadius = "50%";
        buttonB.style.cursor = "pointer";
        buttonB.style.outline = "none";
        buttonB.style.fontSize = "20px";
        buttonB.style.color = "white";
        buttonB.style.fontWeight = "bold";
        buttonB.style.marginRight = "50%";
        buttonB.textContent = "B";

        if(!buttonB.ontouchstart) {
            buttonB.addEventListener("mousedown", () => {
                this.b = true;
                buttonB.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
                this.onChange(this.a, this.b);
            });
            buttonB.addEventListener("mouseup", () => {
                this.b = false;
                buttonB.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
                this.onChange(this.a, this.b);
            });
        }else {
            buttonB.addEventListener("touchstart", () => {
                this.b = true;
                buttonB.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
                this.onChange(this.a, this.b);
            });

            buttonB.addEventListener("touchend", () => {
                this.b = false;
                buttonB.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
                this.onChange(this.a, this.b);
            });
        }

        this.buttonB = buttonB;
        this.container.appendChild(buttonB);

        //clear container
        container.innerHTML = "";
        container.appendChild(this.container);

        document.addEventListener("keydown", this.aKeyboardListener);
        document.addEventListener("keydown", this.bKeyboardListener);
        document.addEventListener("keyup", this.aKeyboardUpListener);
        document.addEventListener("keyup", this.bKeyboardUpListener);
    }

    destroy() {
        this.container.remove();

        document.removeEventListener("keydown", this.aKeyboardListener);
        document.removeEventListener("keydown", this.bKeyboardListener);
        document.removeEventListener("keyup", this.aKeyboardUpListener);
        document.removeEventListener("keyup", this.bKeyboardUpListener);
    }

}


