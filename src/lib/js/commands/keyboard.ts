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
        this.container.style.bottom = "1dvh";
        this.container.style.right = "1dvw";
        this.container.style.width = "130px";
        this.container.style.height = "110px";

        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.justifyContent = "space-between";
        this.container.style.alignItems = "center";
        this.container.style.padding = "5px";
        this.container.style.zIndex = "7";

        let buttonA = document.createElement("button");
        buttonA.style.width = "50px";
        buttonA.style.height = "50px";
        buttonA.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
        buttonA.style.border = "1px solid black";
        buttonA.style.borderRadius = "40%";
        buttonA.style.cursor = "pointer";
        buttonA.style.outline = "none";
        buttonA.style.fontSize = "20px";
        buttonA.style.color = "white";
        buttonA.style.fontWeight = "bold";
        buttonA.style.marginLeft = "50%";
        buttonA.textContent = "A";
        buttonA.addEventListener("mousedown", () => {
            this.a = true;
            buttonA.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
            this.onChange(this.a, this.b);
        });
        buttonA.addEventListener("touchstart", () => {
            this.a = true;
            buttonA.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
            this.onChange(this.a, this.b);
        });
        buttonA.addEventListener("mouseup", () => {
            this.a = false;
            buttonA.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
            this.onChange(this.a, this.b);
        });
        buttonA.addEventListener("touchend", () => {
            this.a = false;
            buttonA.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
            this.onChange(this.a, this.b);
        });

        this.buttonA = buttonA;
        this.container.appendChild(buttonA);

        let buttonB = document.createElement("button");
        buttonB.style.width = "50px";
        buttonB.style.height = "50px";
        buttonB.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
        buttonB.style.border = "1px solid black";
        buttonB.style.borderRadius = "40%";
        buttonB.style.cursor = "pointer";
        buttonB.style.outline = "none";
        buttonB.style.fontSize = "20px";
        buttonB.style.color = "white";
        buttonB.style.fontWeight = "bold";
        buttonB.style.marginRight = "50%";
        buttonB.textContent = "B";
        buttonB.addEventListener("mousedown", () => {
            this.b = true;
            buttonB.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
            this.onChange(this.a, this.b);
        });
        buttonB.addEventListener("touchstart", () => {
            this.b = true;
            buttonB.style.backgroundColor = "rgba(224, 248, 248, 0.64)";
            this.onChange(this.a, this.b);
        });
        buttonB.addEventListener("mouseup", () => {
            this.b = false;
            buttonB.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
            this.onChange(this.a, this.b);
        });
        buttonB.addEventListener("touchend", () => {
            this.b = false;
            buttonB.style.backgroundColor = "rgba(84, 80, 108, 0.64)";
            this.onChange(this.a, this.b);
        });
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


