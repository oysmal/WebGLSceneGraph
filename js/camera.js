/**
 * Created by endre on 06.09.15.
 */



/**
 * Simple camera that listens to the key board and mouse.
 * @param keyboardState an THREEx.keyboardState object, monitors keyboard input
 * @constructor
 */
function Camera(keyboardState) {
    "use strict";

    this.keyboardState = keyboardState;

    this.position = vec3(0,0,0);
    this.forwardDirection = vec3(0,0,1);
    this.upDirection = vec3(0,1,0);

    this.viewMatrix = lookAt(this.position, add(this.position, this.forwardDirection), this.upDirection);

    // The speed the camera moves with when position is changed.
    this.speed = 1;

    // Revolutions per second
    this.rollSpeed = 0.25;

    // mouseSensitivity is a way of controlling how sensitive the system is when moving mouse.
    this.mouseSensitivity = 0.5;

    // Properties mostly concerned with mouse movement
    this.mouse = {
        initialized: false,

        // Previous mouse position
        lastX: -1,
        lastY: -1,

        // The difference from previous to current position
        deltaX: 0,
        deltaY: 0,

        // Have we used the deltaX and deltaY?
        consumedUpdate: false
    };

    document.addEventListener('mousemove', this._onMouseMove.bind(this));
}

/**
 * Moves the current position and adjusts orientation. Called in the main loop.
 * @param deltaTimestampMillis {Number} number of milliseconds since last draw
 */
Camera.prototype.update = function(deltaTimestampMillis) {
    "use strict";

    this._updatePosition(deltaTimestampMillis);
    this._updateOrientation(deltaTimestampMillis);

    // Create the view matrix
    this.viewMatrix = lookAt(this.position, add(this.position, this.forwardDirection), this.upDirection);
};

/**
 * Updates the current position
 * @param deltaTimestampMillis
 * @private
 */
Camera.prototype._updatePosition = function(deltaTimestampMillis) {
    "use strict";

    let seconds = deltaTimestampMillis / 1000;

    //  How far should we move in the forward direction?
    let forwardStep = scale(this.speed*seconds, this.forwardDirection);

    // TODO: Handle movement along the vertical direction
    // TODO: Handle movement along the horizontal direction

    // Handle keyboard inputs, only forward is handled for now
    if (this.keyboardState.pressed('up')) {
        this.position = add(this.position, forwardStep);
    } else if (this.keyboardState.pressed('down')) {
        this.position = add(this.position, negate(forwardStep));
    }

    // To move horizontal, we can use the generated viewMatrix' first vector (the n-vector).
    // Similarly, to move vertical, we can use the generated viewMatrix' second vector (the u-vector)
};

/**
 * Updates orientations (the forwardDirection and upDirection)
 * @param deltaTimestampMillis
 * @private
 */
Camera.prototype._updateOrientation = function(deltaTimestampMillis) {
    "use strict";

    // Lets handle the mouse.deltaX and mouse.deltaY as degrees, use mouseSensitivity
    // as a way of controlling how much the system should react to orientation change.

    // TODO: Handle roll

    let deltaSeconds = deltaTimestampMillis / 1000;

    let yawAngle = 0;
    let pitchAngle = 0;

    if (!this.mouse.consumedUpdate) {
        yawAngle = -1 * this.mouseSensitivity * this.mouse.deltaX;
        pitchAngle = -1 * this.mouseSensitivity * this.mouse.deltaY;
        this.mouse.consumedUpdate = true;
    }

    // Rotate so and so degrees about the upDirection
    let yawRotation = rotate(yawAngle, this.upDirection);
    let pitchRotation = rotate(pitchAngle, cross(this.forwardDirection, this.upDirection));

    let yawThenPitchRot = mult(pitchRotation, yawRotation);

    // If we want to update the up direction (eg. roll) we should handle
    // that independently, triggered by eg. a key press. It may be sensible to
    // roll about the forwardDirection?

    // Finally update the forward direction and (posssibly) the up directions
    this.setForwardDirection(vec3(
        dot(vec3(yawThenPitchRot[0]), this.forwardDirection),
        dot(vec3(yawThenPitchRot[1]), this.forwardDirection),
        dot(vec3(yawThenPitchRot[2]), this.forwardDirection)
    ));
};

/**
 * Set the current position
 * @param position {(vec3|vec4)} a an array with at lest 3 numeric elements
 */
Camera.prototype.setPosition = function(position) {
    "use strict";

    this.position = vec3(position);
};

/**
 * Set the current forward direction the camera is supposed to move
 * @param {(vec3|vec4)} forwardDirection
 */
Camera.prototype.setForwardDirection = function(forwardDirection) {
    "use strict";

    this.forwardDirection = normalize(vec3(forwardDirection));
};

/**
 * Set the current up direction of the camera.
 * @param {(vec3|vec4)} upDirection
 */
Camera.prototype.setUpDirection = function(upDirection) {
    "use strict";

    this.upDirection = normalize(vec3(upDirection));
};

/**
 * Get the current view matrix-
 * @returns {mat4} a 4x4 view matrix
 */
Camera.prototype.getViewMatrix = function() {
    "use strict";

    return this.viewMatrix;
};

/**
 * Handles updates of mouse positions. only called when mouse actually moves.
 * @param event
 * @private
 */
Camera.prototype._onMouseMove = function(event) {
    "use strict";

    let newX = event.clientX;
    let newY = event.clientY;

    if (this.mouse.initialized) {
        this.mouse.deltaX = newX - this.mouse.lastX;
        this.mouse.deltaY = newY - this.mouse.lastY;
    } else {
        this.mouse.initialized = true;
    }

    this.mouse.lastX = newX;
    this.mouse.lastY = newY;

    // This is a new update
    this.mouse.consumedUpdate = false;
};