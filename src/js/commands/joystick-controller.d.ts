export interface JoystickOptions {
	maxRange?: number;
	level?: number;
	radius?: number;
	joystickRadius?: number;
	opacity?: number;
	containerClass?: string;
	controllerClass?: string;
	joystickClass?: string;
	leftToRight?: boolean;
	bottomToUp?: boolean;
	x?: string;
	y?: string;
	distortion?: boolean;
	dynamicPosition?: boolean;
	dynamicPositionTarget?: HTMLElement | null;
	mouseClickButton?: string | number;
	hideContextMenu?: boolean;
}

export interface JoystickOnMove {
	x: number;
	y: number;
	leveledX: number;
	leveledY: number;
	angle: number;
	distance: number;
}

export const MOUSE_CLICK_BUTTONS: {
	ALL: -1;
	LEFT: 0;
	MIDDLE: 1;
	RIGHT: 2;
};

export class JoystickController {
	id: string;
	x: number;
	y: number;
	leveledX: number;
	leveledY: number;
	angle: number;
	distance: number;

	constructor(options: JoystickOptions, onMove?: (coordinates: JoystickOnMove) => void);
	destroy(): void;
}

export default JoystickController;
