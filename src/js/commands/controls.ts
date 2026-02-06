import { type Writable, writable } from 'svelte/store';

export enum KeyMap {
	A = 'A',
	B = 'B',
	Up = 'ArrowUp',
	Down = 'ArrowDown',
	Left = 'ArrowLeft',
	Right = 'ArrowRight'
}

export class Keys {
	a: Writable<boolean> = writable(false);
	b: Writable<boolean> = writable(false);
	up: Writable<boolean> = writable(false);
	down: Writable<boolean> = writable(false);
	left: Writable<boolean> = writable(false);
	right: Writable<boolean> = writable(false);

	private _upHeld = false;
	private _downHeld = false;
	private _leftHeld = false;
	private _rightHeld = false;

	constructor() {
		this.up.subscribe((v) => (this._upHeld = v));
		this.down.subscribe((v) => (this._downHeld = v));
		this.left.subscribe((v) => (this._leftHeld = v));
		this.right.subscribe((v) => (this._rightHeld = v));
	}

	getHeldDirection(): 'up' | 'down' | 'left' | 'right' | null {
		if (this._upHeld) {
			return 'up';
		}
		if (this._downHeld) {
			return 'down';
		}
		if (this._leftHeld) {
			return 'left';
		}
		if (this._rightHeld) {
			return 'right';
		}
		return null;
	}

	pressKey(key: KeyMap) {
		this.a.set(key === KeyMap.A);
		this.b.set(key === KeyMap.B);
		this.up.set(key === KeyMap.Up);
		this.down.set(key === KeyMap.Down);
		this.left.set(key === KeyMap.Left);
		this.right.set(key === KeyMap.Right);
	}

	unpressKey(key: KeyMap) {
		switch (key) {
			case KeyMap.A:
				this.a.set(false);
				break;
			case KeyMap.B:
				this.b.set(false);
				break;
			case KeyMap.Up:
				this.up.set(false);
				break;
			case KeyMap.Down:
				this.down.set(false);
				break;
			case KeyMap.Left:
				this.left.set(false);
				break;
			case KeyMap.Right:
				this.right.set(false);
				break;
		}
	}

	resetAll() {
		this.a.set(false);
		this.b.set(false);
		this.up.set(false);
		this.down.set(false);
		this.left.set(false);
		this.right.set(false);
	}
}

export const lastKey = {
	key: ''
};

export class ABButtons {
	a: boolean;
	b: boolean;

	aButtonValue: Writable<boolean> = writable(false);
	bButtonValue: Writable<boolean> = writable(false);

	buttonA: HTMLButtonElement;
	buttonB: HTMLButtonElement;
	container: HTMLElement;

	aKeyboardListener = (e: KeyboardEvent) => {
		if (e.key === 'a') {
			this.a = true;
			this.aButtonValue.set(true);
			this.buttonA.style.backgroundColor = 'rgba(224, 248, 248, 0.64)';
		}
	};
	bKeyboardListener = (e: KeyboardEvent) => {
		if (e.key === 'b') {
			this.b = true;
			this.bButtonValue.set(true);
			this.buttonB.style.backgroundColor = 'rgba(224, 248, 248, 0.64)';
		}
	};
	aKeyboardUpListener = (e: KeyboardEvent) => {
		if (e.key === 'a') {
			this.a = false;
			this.aButtonValue.set(false);
			this.buttonA.style.backgroundColor = 'rgba(84, 80, 108, 0.64)';
		}
	};
	bKeyboardUpListener = (e: KeyboardEvent) => {
		if (e.key === 'b') {
			this.b = false;
			this.bButtonValue.set(false);
			this.buttonB.style.backgroundColor = 'rgba(84, 80, 108, 0.64)';
		}
	};

	constructor(container: HTMLElement) {
		this.a = false;
		this.b = false;
		this.container = document.createElement('div');
		this.container.style.position = 'fixed';
		this.container.style.bottom = '5dvh';
		this.container.style.right = '3dvw';
		this.container.style.width = '110px';
		this.container.style.height = '100px';

		this.container.style.display = 'flex';
		this.container.style.flexDirection = 'column';
		this.container.style.justifyContent = 'space-between';
		this.container.style.alignItems = 'center';
		this.container.style.zIndex = '8';

		const buttonA = document.createElement('button');
		buttonA.style.fontFamily = 'pokemon, serif';
		buttonA.style.padding = '14px 20px';
		buttonA.style.backgroundColor = 'rgba(44, 56, 69, 0.95)';
		buttonA.style.border = '1px solid black';
		buttonA.style.borderRadius = '50%';
		buttonA.style.cursor = 'pointer';
		buttonA.style.outline = 'none';
		buttonA.style.fontSize = '26px';
		buttonA.style.color = 'white';
		buttonA.style.fontWeight = 'bold';
		buttonA.style.marginLeft = '50%';
		buttonA.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.5)';
		buttonA.textContent = 'A';
		if (!buttonA.ontouchstart) {
			buttonA.addEventListener('mousedown', () => {
				this.a = true;
				this.aButtonValue.set(true);
				buttonA.style.backgroundColor = 'rgba(224, 248, 248, 0.64)';
			});
			buttonA.addEventListener('mouseup', () => {
				this.a = false;
				this.aButtonValue.set(false);
				buttonA.style.backgroundColor = 'rgba(44, 56, 69, 0.95)';
			});
		} else {
			buttonA.addEventListener('touchstart', () => {
				this.a = true;
				this.aButtonValue.set(true);
				buttonA.style.backgroundColor = 'rgba(224, 248, 248, 0.64)';
			});

			buttonA.addEventListener('touchend', () => {
				this.a = false;
				this.aButtonValue.set(false);
				buttonA.style.backgroundColor = 'rgba(44, 56, 69, 0.95)';
			});
		}

		this.buttonA = buttonA;
		this.container.appendChild(buttonA);

		const buttonB = document.createElement('button');
		buttonB.style.fontFamily = 'pokemon, serif';
		buttonB.style.padding = '14px 20px';
		buttonB.style.backgroundColor = 'rgba(44, 56, 69, 0.95)';
		buttonB.style.border = '1px solid black';
		buttonB.style.borderRadius = '50%';
		buttonB.style.cursor = 'pointer';
		buttonB.style.outline = 'none';
		buttonB.style.fontSize = '26px';
		buttonB.style.color = 'white';
		buttonB.style.fontWeight = 'bold';
		buttonB.style.marginRight = '50%';
		buttonB.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.5)';
		buttonB.textContent = 'B';

		if (!buttonB.ontouchstart) {
			buttonB.addEventListener('mousedown', () => {
				this.b = true;
				this.bButtonValue.set(true);
				buttonB.style.backgroundColor = 'rgba(224, 248, 248, 0.64)';
			});
			buttonB.addEventListener('mouseup', () => {
				this.b = false;
				this.bButtonValue.set(false);
				buttonB.style.backgroundColor = 'rgba(84, 80, 108, 0.64)';
			});
		} else {
			buttonB.addEventListener('touchstart', () => {
				this.b = true;
				this.bButtonValue.set(true);
				buttonB.style.backgroundColor = 'rgba(224, 248, 248, 0.64)';
			});

			buttonB.addEventListener('touchend', () => {
				this.b = false;
				this.bButtonValue.set(false);
				buttonB.style.backgroundColor = 'rgba(84, 80, 108, 0.64)';
			});
		}

		this.buttonB = buttonB;
		this.container.appendChild(buttonB);

		//clear container
		container.innerHTML = '';
		container.appendChild(this.container);

		document.addEventListener('keydown', this.aKeyboardListener);
		document.addEventListener('keydown', this.bKeyboardListener);
		document.addEventListener('keyup', this.aKeyboardUpListener);
		document.addEventListener('keyup', this.bKeyboardUpListener);
	}

	destroy() {
		this.container.remove();

		document.removeEventListener('keydown', this.aKeyboardListener);
		document.removeEventListener('keydown', this.bKeyboardListener);
		document.removeEventListener('keyup', this.aKeyboardUpListener);
		document.removeEventListener('keyup', this.bKeyboardUpListener);
	}
}
