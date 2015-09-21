/*
Scenegraph node. Create a Node and set it as a parent to (or child of) other Nodes to create a transform hierarchy (SceneGraph). 

@parent If a Node is passed as an argument to the constructor (new Node(parent)), that Node will be set as the parent of the new Node. If not, parentMatrix it is set to null
 */
var SceneNode = function(parent){
	"use strict";

	this._localMatrix = mat4();
	this._propagationMatrix = this._localMatrix;	// The matrix used to update children
	this.worldMatrix = this._localMatrix;			// The matrix used for rendering this node

	this._parent = null;
	this.drawInfo = null;

	this._translation = mat4();
	this._thescale = mat4();
	this._rotation = mat4();
	this._rotationSelf = mat4();

	this._children = [];

	if(parent) {
		parent.addChild(this);
		this._parent = parent;
	}
};


/*
	These are static variables and functions in JavaScript (Notice the lack of "prototype"). 
	These methods are not meant to be called from outside SceneNode with the exception of "getDrawableNodes".
*/
SceneNode.drawableNodes = [];	// A list of nodes with drawable components

// Get the drawableNodes list.
SceneNode.getDrawableNodes = function() {
	"use strict";

	return SceneNode.drawableNodes;
};

// Add a drawable node to the list.
SceneNode.addDrawableNode = function(node) {
	"use strict";

	if(SceneNode.drawableNodes.indexOf(node) === -1) {
		SceneNode.drawableNodes.push(node);
	}
};

// Remove a drawable node from the list.
SceneNode.removeDrawableNode = function(node) {
	"use strict";

	var index = SceneNode.drawableNodes.indexOf(node);
	if(index !== -1) {
		SceneNode.drawableNodes.splice(index, 1);
	}
};


// Add drawinfo to the node the function is invoked on, thereby making it renderable (Adding it to the drawable list)
// @drawInfo an object containing information about buffers, uniforms and shader program.
SceneNode.prototype.addDrawable = function(drawInfo) {
	"use strict";

	if(drawInfo) {
		this.drawInfo = drawInfo;
	}

	// Add to list of drawables
	SceneNode.addDrawableNode(this);
};


// Add a child to the node the function is invoked on if it is not already a child of this node.
// @child The node to add as a child of this node.
SceneNode.prototype.addChild = function(child) {
	"use strict";

	if(child && this._children.indexOf(child) === -1) {
		this._children.push(child);
		child._parent = this;
	}
};


// Remove a child from the node the function is invoked on if it is a child of this node.
// @child The node to remove as a child of this node.
SceneNode.prototype.removeChild = function(child) {
	"use strict";

	if(child) {
		var index = this._children.indexOf(child);

		// Make sure child is in the children array
		if(index !== -1) {
			this._children.splice(index, 1);	// Modify array to remove one element starting at index.
			child._parent = null;	// Set the parent of child to be null.
		}
	}
};


// Updates the node's _propagationMatrix and _worldMatrix, and propagates the _propagationMatrix down the tree from the node. 
// Call this method on the root node to update the whole tree.
// 
// Note on _propagationMatrix:
// To ensure that the rotation of the node around itself does not contribute to its childrens rotation,
// we have to add the _rotateSelf multiplication after we update the _propagationMatrix. 
// 
// This is equivalent to the matrix notation: _propagationMatrix = Parent*LocalMatrix
// and _worldMatrix = Parent*LocalMatrix*RotateSelf
//
// From this you can see that we do not propagate the RotateSelf matrix down the tree.
//
// This last rotation happens in updateLocalOnlyTransforms(). 
// It is in this function we update the current node's worldMatrix.
// 
SceneNode.prototype.updateMatrices = function() {
	"use strict";

	this.updateLocalMatrix();	// Recalculate this node's localMatrix.

	// Do this if the node has a parent
	if(this._parent !== null) {

		// Multiply the localMatrix of this node with the propagationMatrix of its parent.
		this._propagationMatrix = mult(this._parent._propagationMatrix, this._localMatrix);
	} 
	// Do this if the node does not have a parent (is a root node)
	else {
		//Just set the _localMatrix as the _propagationMatrix since this node does not have a parent
		this._propagationMatrix = this._localMatrix;
	}

	// Update local only transforms (rotation around own axis) and put the result in _worldMatrix
	this.updateLocalOnlyTransforms();

	// Propagate the update downwards in the scene tree (the children will use this node's _propagationMatrix in the updateMatrices)
	for(var i = 0; i < this._children.length; i++) {

		this._children[i].updateMatrices();
	
	}
};

// Update the transforms affecting ONLY the node itself. In this case rotation around its own axis.
SceneNode.prototype.updateLocalOnlyTransforms = function() {
	"use strict";

	if(this._parent !== null) {
		this._localMatrix = mult(this._localMatrix, this._rotationSelf);
		this.worldMatrix = mult(this._parent._propagationMatrix, this._localMatrix);
	} else {
		this._localMatrix = mult(this._localMatrix, this._rotationSelf);
		this.worldMatrix = this._localMatrix;
	}
};

/**
 * Sets the current absolute scale
 * @param scale {vec3} a vector determining the scale in x, y, z directions
 */
SceneNode.prototype.setScale = function(scale) {
	"use strict";

	this._thescale = scalem(scale);
};

// Scale the node.
// @scale an array with 3 components, representing the scale along each axis. E.g. make the node twice as large: scale = [2,2,2].
SceneNode.prototype.scale = function(scale) {
	"use strict";

	if(scale) {
		this._thescale = mult(this._thescale, scalem(scale));
	}
};

SceneNode.prototype.setPosition = function(position) {
	"use strict";

	this._translation = translate(position);
};

// Translate the node.
// @translation an array with 3 components, representing the distance to translate along each axis.
SceneNode.prototype.translate = function(translation) {
	"use strict";

	if(translation) {
		this._translation = mult(this._translation, translate(translation));
	}
};

/**
 * Set actual orientation relative to it's parent.
 * @param angles {vec3} three euler angles in degrees
 */
SceneNode.prototype.setOrientation = function(angles) {
	"use strict";

	// Reset current orientation
	this._rotation = mat4(1);

	this.rotate(angles[0], [1,0,0]);
	this.rotate(angles[1], [0,1,0]);
	this.rotate(angles[2], [0,0,1]);
};

// Rotate the node relative to it's parent.
// @angle the angle to rotate (in degrees)
// @axis an array describing the axis to rotate around. E.g. [0,1,0] for y axis. This can also be e.g. [1,0.5,0] etc.
SceneNode.prototype.rotate = function(angle, axis) {
	"use strict";

	if(angle && axis) {
		this._rotation = mult(this._rotation, rotate(angle, axis));
	}
};

/**
 * Set actual self orientationS.
 * @param angles {vec3} three euler angles in degrees
 */
SceneNode.prototype.setOrientationSelf = function(angles) {
	"use strict";

	// Reset current self orientation
	this._rotationSelf = mat4(1);

	this.rotateSelf(angles[0], [1,0,0]);
	this.rotateSelf(angles[1], [0,1,0]);
	this.rotateSelf(angles[2], [0,0,1]);
};

// Rotate the node around itself.
// @angle the angle to rotate (in degrees)
// @axis an array describing the axis to rotate around. E.g. [0,1,0] for y axis. This can also be e.g. [1,0.5,0] etc.
SceneNode.prototype.rotateSelf = function(angle, axis) {
	"use strict";

	if(angle && axis) {
		this._rotationSelf = mult(this._rotationSelf, rotate(angle, axis));
	}
};


// Calculate the localMatrix by multiplying the scale, rotation and translation matrices.
// Remember that this translates relative to the parent node, so rotations done here will be rotations around the parent node.
SceneNode.prototype.updateLocalMatrix = function() {
	"use strict";

	this._localMatrix = mult(mat4(), this._thescale);
	this._localMatrix = mult(this._localMatrix, this._rotation);
	this._localMatrix = mult(this._localMatrix, this._translation);
};




