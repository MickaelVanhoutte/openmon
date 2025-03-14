/**
 * Options for the joystick
 * @typedef {Object} JoystickOptions
 * @property {number} maxRange - Maximum range of the joystick dot (number of pixels)
 * @property {number} level - Number of level of the joystick (eg 10 would return integers between -10 and 10)
 * @property {number} radius - Radius of the joystick container (number of pixels)
 * @property {number} joystickRadius - Radius of the joystick inner dot (number of pixels)
 * @property {number} opacity - Opacity of the joystick
 * @property {string} containerClass - Class for the joystick container for adding additional styles (outer container)
 * @property {string} controllerClass - Class for the joystick controller for adding additional styles (inner container)
 * @property {string} joystickClass - Class for the joystick dot for adding additional styles
 * @property {boolean} leftToRight - Left to right adjustment (x position from left)
 * @property {boolean} bottomToUp - Bottom to up adjustment (y position from bottom)
 * @property {string} x - x position of the joystick controller on screen (equal to left/right of css)
 * @property {string} y - y position of the joystick controller on screen (equal to bottom/top of css)
 * @property {boolean} distortion - if true, the joystick will be distorted when the dot is moved to the edge of the joystick
 * @property {boolean} dynamicPositionTarget - Shows the joystick when the user touch/click on the screen at the position where it was clicked/touched
 * @property {HTMLElement} dynamicPositionTarget - If dynamicPosition true, uses this target to set the event listener on (if not provided use document)
 * @property {string|number} mouseClickButton - click button to show the joystick (if not provided, shows on all clicks)(Values: ALL, LEFT, MIDDLE, RIGHT, or button numbers (-1 to 4. -1 for all))
 * @property {boolean} hideContextMenu - if true, hides the context menu on right click
 */

/**
 * Joystick onMove Callback
 * @typedef {Object} JoystickOnMove
 * @property {number} x - x position of the joystick relative to the center of it
 * @property {number} y - y position of the joystick relative to the center of it
 * @property {number} leveledX - x position scaled and rounded to be a step between -level to level (level comes from options)
 * @property {number} leveledY - y position scaled and rounded to be a step between -level to level (level comes from options)
 * @property {number} angle - angle of the line between center of the joystick and position of the dot in radians
 * @property {number} distance - distance of the dot from the center joystick
 */

const JOYSTICK_WINDOW_IDENTIFIER = "__joysticks_identifiers__";
const JOYSTICK_WINDOW_ACTIVE = "__active_joysticks__";
export const MOUSE_CLICK_BUTTONS = {
    ALL: -1,
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};

/**
 * A JavaScript library for creating a virtual joystick.
 * @author Cyrus Mobini
 * @version 1.0.12
 * @docs https://github.com/cyrus2281/joystick-controller#readme
 */
export class JoystickController {
    /**
     * Default transition for the joystick
     * @type {string}
     * @private
     */

    /**
     * Default options for the joystick
     * @type {JoystickOptions}
     * @private
     */

    /**
     * Joystick onMove Callback
     * @type {(coordinates: JoystickOnMove) => void}
     */

    /**
     * x position of the joystick
     * @type {number}
     */

    /**
     * y position of the joystick
     * @type {number}
     */

    /**
     * x position of the joystick scaled to be between -level and +level
     * @type {number}
     */

    /**
     * y position of the joystick scaled to be between -level and +level
     * @type {number}
     */

    /**
     * angle of the joystick in radians
     * @type {number}
     */

    /**
     * distance of the joystick from center
     * @type {number}
     */

    /**
     * Style for the joystick
     * @private
     * @type {HTMLDivElement}
     */

    /**
     * ID for the joystick.
     *
     * You can access HTML Elements using a prefix and this ID.
     *
     * Container: .joystick-container-{id}
     *
     * Controller: .joystick-controller-{id}
     *
     * Joystick: .joystick-{id}
     * @type {string}
     */

    /**
     * Container for the joystick
     * @private
     * @type {HTMLDivElement}
     */

    /**
     * Controller for the joystick
     * @private
     * @type {HTMLDivElement}
     */

    /**
     * Joystick
     * @private
     * @type {HTMLDivElement}
     */

    /**
     * x center of the joystick
     * @private
     * @type {number}
     */

    /**
     * y center of the joystick
     * @private
     * @type {number}
     */

    /**
     * Is the joystick move started
     * @private
     * @type {boolean}
     */

    /**
     * Identifier for the joystick for dynamic positioning
     * @private
     * @type {number|string|null}
     */

    /**
     * Mouse button to listen on
     * @private
     * @type {number|string}
     */

    /**
     * @param {JoystickOptions} options - Options for the joystick
     * @param {(coordinates: JoystickOnMove) => void} onMove - Joystick onMove Callback
     */
    constructor(options, onMove) {
        this.JOYSTICK_TRANSITION = "border-radius 0.2s ease-in-out";
        this.options = {
            maxRange: 100,
            level: 10,
            radius: 50,
            joystickRadius: 30,
            opacity: 0.8,
            leftToRight: true,
            bottomToUp: true,
            containerClass: "",
            controllerClass: "",
            joystickClass: "",
            x: "50%",
            y: "50%",
            distortion: false,
            dynamicPosition: false,
            dynamicPositionTarget: null
        };
        this.onMove = void 0;
        this.x = 0;
        this.y = 0;
        this.leveledX = 0;
        this.leveledY = 0;
        this.angle = 0;
        this.distance = 0;
        this.style = void 0;
        this.id = void 0;
        this.container = void 0;
        this.controller = void 0;
        this.joystick = void 0;
        this.centerX = void 0;
        this.centerY = void 0;
        this.started = void 0;
        this.identifier = null;
        this.mouseButton = -1;
        this.addEventListeners = () => {
            const mcb = this.options.mouseClickButton;
            if (typeof mcb === "string" && Object.keys(MOUSE_CLICK_BUTTONS).includes(mcb) || typeof mcb === "number" && mcb < 6 && mcb > -2) {
                this.mouseButton = typeof mcb === "string" ? MOUSE_CLICK_BUTTONS[mcb] : mcb;
            }
            if (this.options.dynamicPosition) {
                const target = this.options.dynamicPositionTarget || document;
                // mouse events Listeners
                target.addEventListener("mousedown", this.dynamicPositioningMouse);
                document.addEventListener("mouseup", this.removeDynamicPositioning);
                // touch events Listeners
                target.addEventListener("touchstart", this.dynamicPositioningTouch);
                document.addEventListener("touchmove", this.onTouchEvent, {
                    passive: false
                });
                document.addEventListener("touchend", this.removeDynamicPositioning);
                if (this.options.hideContextMenu) {
                    target.addEventListener("contextmenu", e => e.preventDefault());
                    this.joystick.addEventListener("contextmenu", e => e.preventDefault());
                }
            } else {
                // touch events Listeners
                this.joystick.addEventListener("touchstart", this.onStartEvent);
                this.joystick.addEventListener("touchmove", this.onTouchEvent);
                this.joystick.addEventListener("touchend", this.onStopEvent);
                // mouse events Listeners
                this.joystick.addEventListener("mousedown", this.onStartEvent);
                if (this.options.hideContextMenu) {
                    this.container.addEventListener("contextmenu", e => e.preventDefault());
                    this.joystick.addEventListener("contextmenu", e => e.preventDefault());
                }
            }
            // window resize listener
            window.addEventListener("resize", this.recenterJoystick);
        };
        this.dynamicPositioningMouse = e => {
            if (this.identifier !== null) return;
            if (this.mouseButton !== -1 && e.button !== this.mouseButton) return;
            const identifier = e.x + "-" + e.y;
            if (window[JOYSTICK_WINDOW_IDENTIFIER].has(identifier)) return;
            this.identifier = identifier;
            window[JOYSTICK_WINDOW_IDENTIFIER].add(this.identifier);
            const x = e.clientX;
            const y = e.clientY;
            this.container.style.left = x + "px";
            this.container.style.top = y + "px";
            this.container.style.bottom = "unset";
            this.container.style.right = "unset";
            document.body.appendChild(this.container);
            this.recenterJoystick();
            this.onStartEvent(e, false);
        };
        this.dynamicPositioningTouch = event => {
            // event.preventDefault();
            if (this.identifier !== null) return;
            const identifier = event.changedTouches[0].identifier;
            if (window[JOYSTICK_WINDOW_IDENTIFIER].has(identifier)) return;
            this.identifier = identifier;
            window[JOYSTICK_WINDOW_IDENTIFIER].add(identifier);
            // Current touch (for multi-touch)
            let touch;
            for (let i = 0; i < event.touches.length; i++) {
                const tc = event.touches.item(i);
                if (this.identifier === tc.identifier) {
                    touch = tc;
                    break;
                }
            }
            if (!touch) return;
            const x = touch.clientX;
            const y = touch.clientY;
            this.container.style.left = x + "px";
            this.container.style.top = y + "px";
            this.container.style.bottom = "unset";
            this.container.style.right = "unset";
            document.body.appendChild(this.container);
            this.recenterJoystick();
            this.onStartEvent(event, false);
        };
        this.removeDynamicPositioning = e => {
            if (this.identifier === null) return;
            if (e.type === "touchend") {
                const identifier = e.changedTouches[0].identifier;
                if (this.identifier !== identifier) return;
            } else if (this.mouseButton !== -1 && e.button !== this.mouseButton) return;
            window[JOYSTICK_WINDOW_IDENTIFIER].delete(this.identifier);
            this.identifier = null;
            this.onStopEvent(e);
            this.container.remove();
        };
        this.updateCoordinates = (x, y) => {
            //console.log('update');
            // distance from center
            this.distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2)).toFixed(4);
            // angle from center in Radians
            this.angle = Math.atan2(y - this.centerY, x - this.centerX).toFixed(4);
            // considering max range
            const adjustedDistance = this.distance > this.options.maxRange ? this.options.maxRange : this.distance;
            // x offset from center
            this.x = Math.round(Math.cos(this.angle) * adjustedDistance);
            // y offset from center
            this.y = -Math.round(Math.sin(this.angle) * adjustedDistance);
            // Scaling x and y to be between -level and +level
            this.leveledX = Math.round(this.x / this.options.maxRange * this.options.level);
            this.leveledY = Math.round(this.y / this.options.maxRange * this.options.level);
            // setting position of stick
            this.joystick.style.left = this.options.radius + this.x + "px";
            this.joystick.style.bottom = this.options.radius + this.y + "px";
            // distort joystick
            this.options.distortion && this.distortJoystick();
            // Triggering Event
            let unsub = setInterval(
                () => {
                    if (this.onMove && x !== this.x && y !== this.y) {
                        this.onMove({
                            x: this.x,
                            y: this.y,
                            leveledX: this.leveledX,
                            leveledY: this.leveledY,
                            distance: this.distance,
                            angle: this.angle
                        });
                    }else {
                        clearInterval(unsub);
                    }
                }, 100);

        };
        this.resetCoordinates = () => {
            this.x = 0;
            this.y = 0;
            this.leveledX = 0;
            this.leveledY = 0;
            this.angle = 0;
            this.distance = 0;
            // reset position of stick
            this.joystick.style.left = this.options.radius + "px";
            this.joystick.style.bottom = this.options.radius + "px";
            // reset joystick distortion
            this.options.distortion && this.distortJoystick();
            // Triggering Event
            this.onMove && this.onMove({
                x: this.x,
                y: this.y,
                leveledX: this.leveledX,
                leveledY: this.leveledY,
                distance: this.distance,
                angle: this.angle
            });
        };
        this.distortJoystick = () => {
            if (this.distance > this.options.maxRange * 0.7) {
                // distorting joystick
                this.joystick.style.borderRadius = "70% 80% 70% 15%";
                this.joystick.style.transform = `translate(-50%, 50%) rotate(${+this.angle + Math.PI / 4}rad)`;
            } else {
                // resting to default
                this.joystick.style.borderRadius = "50%";
                this.joystick.style.transform = `translate(-50%, 50%) rotate(${Math.PI / 4}rad})`;
            }
        };
        this.onStartEvent = (event, addIdentifier = true) => {
            if (event.type === "mousedown") {
                if (this.mouseButton !== -1 && event.button !== this.mouseButton) return;
                window.addEventListener("mousemove", this.onMouseEvent);
                window.addEventListener("mouseup", this.onStopEvent);
            } else if (addIdentifier) {
                const identifier = event.changedTouches[0].identifier;
                this.identifier = identifier;
            }
            this.started = true;
            // style adjustment
            this.joystick.style.transition = this.JOYSTICK_TRANSITION;
            this.joystick.style.cursor = "grabbing";
        };
        this.onStopEvent = event => {
            if (event.type === "mouseup") {
                if (this.mouseButton !== -1 && event.button !== this.mouseButton) return;
                window.removeEventListener("mousemove", this.onMouseEvent);
                window.removeEventListener("mouseup", this.onStopEvent);
            } else {
                this.identifier = null;
            }
            this.started = false;
            // style adjustment
            this.joystick.style.transition = "all 0.2s ease-in-out";
            this.joystick.style.cursor = "grab";
            // reset values
            this.resetCoordinates();
        };
        this.onTouchEvent = event => {
            // Current touch (for multi-touch)
            let touch;
            for (let i = 0; i < event.touches.length; i++) {
                const tc = event.touches.item(i);
                if (this.identifier === tc.identifier) {
                    touch = tc;
                    break;
                }
            }
            if (!touch) return;
            event.preventDefault();
            // position of touch
            const x = touch.clientX;
            const y = touch.clientY;
            // update coordinates
            //console.log('update');
            this.updateCoordinates(x, y);
        };
        this.onMouseEvent = event => {
            if (!this.started) return;
            event.preventDefault();
            // position of mouse
            const x = event.clientX;
            const y = event.clientY;
            // distance from center
            this.updateCoordinates(x, y);
        };
        this.recenterJoystick = () => {
            // update the center coordinates
            this.centerX = this.controller.getBoundingClientRect().left + this.options.radius;
            this.centerY = this.controller.getBoundingClientRect().top + this.options.radius;
        };
        this.options = Object.assign(this.options, options);
        this.onMove = onMove;
        this.validate();
        this.init();
    }

    /**
     * Validates options or status of window for joysticks
     * @private
     */
    validate() {
        if (window[JOYSTICK_WINDOW_ACTIVE] && window[JOYSTICK_WINDOW_ACTIVE].length > 0 && window[JOYSTICK_WINDOW_ACTIVE].some(j => j.options.dynamicPosition && (j.options.dynamicPositionTarget || document) === (this.options.dynamicPositionTarget || document))) {
            console.error("Multiple dynamicPosition should be used with different target elements (dynamicPositionTarget) to prevent event collision.");
        }
    }

    /**
     * Setting up the joystick
     * @private
     */
    init() {
        // Adding identifier array to window
        if (!window[JOYSTICK_WINDOW_IDENTIFIER]) {
            window[JOYSTICK_WINDOW_IDENTIFIER] = new Set();
        }
        // ID
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Adding to active joysticks
        window[JOYSTICK_WINDOW_ACTIVE] = Object.assign(window[JOYSTICK_WINDOW_ACTIVE] || [], [this]);

        // Styles
        this.style = document.createElement("style");
        this.style.setAttribute("id", "style-" + this.id);
        this.style.innerHTML = `
        .joystick-container-${this.id} {
            box-sizing: border-box;
            position: fixed;
            outline: none;
            ${this.options.leftToRight ? "left" : "right"}: ${this.options.x};
            ${this.options.bottomToUp ? "bottom" : "top"}: ${this.options.y};
            transform: translate(${this.options.dynamicPosition || this.options.leftToRight ? "-50%" : "50%"}, ${this.options.dynamicPosition || !this.options.bottomToUp ? "-50%" : "50%"});
        }
    
        .joystick-controller-${this.id} {
            box-sizing: border-box;
            outline: none;
            opacity: ${this.options.opacity};
            width: ${this.options.radius * 2}px;
            height: ${this.options.radius * 2}px;
            border-radius: 50%;
            position: relative;
            outline: 2px solid #4c4c4c77;
            background: radial-gradient(circle,#ebebeb55, #5c5c5c55);
        }
    
        .joystick-${this.id} {
            box-sizing: border-box;
            outline: none;
            position: absolute;
            cursor: grab;
            width: ${this.options.joystickRadius * 2}px;
            height: ${this.options.joystickRadius * 2}px;
            z-index: 1;
            border-radius: 50%;
            left: 50%;
            bottom: 50%;
            transform: translate(-50%, 50%);
            background: radial-gradient(#000c, #3e3f46aa);
            transition: ${this.JOYSTICK_TRANSITION};
        }
        `;

        // Container
        this.container = document.createElement("div");
        this.container.setAttribute("id", "joystick-container-" + this.id);
        this.container.setAttribute("class", "joystick-container-" + this.id + " " + this.options.containerClass);

        // Controller
        this.controller = document.createElement("div");
        this.controller.setAttribute("id", "joystick-controller-" + this.id);
        this.controller.setAttribute("class", "joystick-controller-" + this.id + " " + this.options.controllerClass);

        // Stick
        this.joystick = document.createElement("div");
        this.joystick.setAttribute("id", "joystick-" + this.id);
        this.joystick.setAttribute("class", "joystick-" + this.id + " " + this.options.joystickClass);

        // Append to Body
        this.controller.appendChild(this.joystick);
        this.container.appendChild(this.controller);
        document.head.appendChild(this.style);
        !this.options.dynamicPosition && document.body.appendChild(this.container);
        // Add Event Listeners
        this.addEventListeners();
        // center of joystick
        this.recenterJoystick();
        // Resting Coordinates
        this.resetCoordinates();
    }
    /**
     * To remove the joystick from the DOM and clear all the listeners
     */
    destroy() {
        // removing event listeners
        if (this.options.dynamicPosition) {
            const target = this.options.dynamicPositionTarget || document;
            // mouse events Listeners
            target.removeEventListener("mousedown", this.dynamicPositioningMouse);
            document.removeEventListener("mouseup", this.removeDynamicPositioning);
            // touch events Listeners
            target.removeEventListener("touchstart", this.dynamicPositioningTouch);
            document.removeEventListener("touchmove", this.onTouchEvent, {
                passive: false
            });
            document.removeEventListener("touchend", this.removeDynamicPositioning);
        } else {
            // touch events Listeners
            this.joystick.removeEventListener("touchstart", this.onStartEvent);
            this.joystick.removeEventListener("touchmove", this.onTouchEvent);
            this.joystick.removeEventListener("touchend", this.onStopEvent);
            // mouse events Listeners
            this.joystick.removeEventListener("mousedown", this.onStartEvent);
        }
        window.removeEventListener("resize", this.recenterJoystick);

        // removing elements
        this.style.remove();
        this.container.remove();

        // removing from active joysticks
        if (Array.isArray(window[JOYSTICK_WINDOW_ACTIVE])) window[JOYSTICK_WINDOW_ACTIVE] = window[JOYSTICK_WINDOW_ACTIVE].filter(joystick => joystick !== this);
    }
}
export default JoystickController;