/*
Scenegraph node. Create a Node and set it as a parent to (or child of) other Nodes 
to create a transform hierarchy (SceneGraph). 
@param parent: If a Node is passed as an argument to the constructor (new Node(parent)), 
that Node will be set as the parent of the new Node. If not, _parent it is set to null
 */
var SceneNode = function(parent){
	"use strict";

	// The Model matrix for this node (Translation, Rotation, Scale)
	this._localMatrix = mat4(1);
	this.worldMatrix = this._localMatrix;	// The matrix used for rendering this node and updating children

	this._parent = null;
	this.drawInfo = null;

	this._position = [0,0,0];
	this._scale = [1,1,1];
	this._rotation = [0,0,0];

	this._children = [];

	if(parent) {
		parent.addChild(this);
		this._parent = parent;
	}
};


/*
	These are static variables and functions in JavaScript 
	(Notice the lack of "prototype"). 
	These methods are not meant to be called from outside 
	SceneNode with the exception of "getDrawableNodes".
*/
SceneNode.drawableNodes = [];	// A list of nodes with drawable components

// Get the drawableNodes list.
SceneNode.getDrawableNodes = function() {
	"use strict";

	return SceneNode.drawableNodes;
};

// Add a drawable node to the list.
// @param node: node to add to drawable list
SceneNode.addDrawableNode = function(node) {
	"use strict";

	if(SceneNode.drawableNodes.indexOf(node) === -1) {
		SceneNode.drawableNodes.push(node);
	}
};

// Remove a drawable node from the list.
// @param node: node to remove from drawable list
SceneNode.removeDrawableNode = function(node) {
	"use strict";

	var index = SceneNode.drawableNodes.indexOf(node);
	if(index !== -1) {
		SceneNode.drawableNodes.splice(index, 1);
	}
};


/* Add drawinfo to the node the function is invoked on, 
thereby making it renderable (It will add itself to the drawable list).
@param drawInfo: an object containing information about buffers, uniforms and shader program. */
SceneNode.prototype.addDrawable = function(drawInfo) {
	"use strict";

	if(drawInfo) {
		this.drawInfo = drawInfo;
	}

	// Add to list of drawables
	SceneNode.addDrawableNode(this);
};


/* Add a child to the node the function is invoked 
on if it is not already a child of this node.
@param child: The node to add as a child of this node. 
*/
SceneNode.prototype.addChild = function(child) {
	"use strict";

	if(child && this._children.indexOf(child) === -1) {
		this._children.push(child);
		child._parent = this;
	}
};


/* Remove a child from the node the function is invoked 
on if it is a child of this node.
@param child: The node to remove as a child of this node. 
*/
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


/* Updates the node's _worldMatrix, and propagates the _worldMatrix down the tree from the node. 
 * Call this method on the root node to update the whole tree.
 */ 
SceneNode.prototype.updateMatrices = function() {
	"use strict";

	this.updateLocalMatrix();	// Recalculate this node's localMatrix.

	// Do this if the node has a parent
	if(this._parent !== null) {

		// Multiply the localMatrix of this node with the _worldMatrix of its parent.
		this._worldMatrix = mult(this._parent._worldMatrix, this._localMatrix);
	} 
	// Do this if the node does not have a parent (is a root node)
	else {
		//Just set the _localMatrix as the _worldMatrix since this node does not have a parent
		this._worldMatrix = this._localMatrix;
	}

	// Propagate the update downwards in the scene tree 
	//(the children will use this node's _worldMatrix in the updateMatrices)
	for(var i = 0; i < this._children.length; i++) {

		this._children[i].updateMatrices();
	
	}
};

/**
 * Sets the current absolute scale
 * @param scale {vec3}: a vector determining the scale in x, y, z directions
 */
SceneNode.prototype.setScale = function(scale) {
	"use strict";

	this._scale = scale;
};

// Scale the node.
// @param scale: an array with 3 components, representing the scale along each axis. 
//E.g. make the node twice as large: scale = [2,2,2].
SceneNode.prototype.scale = function(scale) {
	"use strict";

	if(scale) {
		this._scale = mult(this._scale, scale);
	}
};

/**
 * Set position according relative to the parent's position
 * @param position: a new position
 */
SceneNode.prototype.setPosition = function(position) {
	"use strict";

	if(position) {
		this._position = position;
	}
};

// Translate the node.
// @param translation: an array with 3 components, representing the distance to translate along each axis.
SceneNode.prototype.translate = function(translation) {
	"use strict";

	if(translation) {
		this._position = add(this._position, translation);
	}
};

/**
 * Set actual orientation relative to it's parent.
 * @param angles {vec3}: three euler angles in degrees
 */
SceneNode.prototype.setOrientation = function(angles) {
	"use strict";

	// Reset current orientation
	if(angles) {
		this._rotation = angles;
	}
};

/**
 * Rotate the node relative to it's parent.
 * @param angles {vec3}: three euler angles in degrees
 */
SceneNode.prototype.rotate = function(angles) {
	"use strict";

	if(angles) { 
		this._rotation = add(this._rotation, angles);
	}
};


/* Calculate the localMatrix by multiplying the translation, rotation and scale matrices. 
 * Use the MV.js library to create matrices.
 */
SceneNode.prototype.updateLocalMatrix = function() {
	"use strict";

	// Reset _localMatrix
	this._localMatrix = mat4(1);

	// Recalculate _localMatrix
	this._localMatrix = mult(this._localMatrix, translate(this._position));
	this._localMatrix = mult(this._localMatrix, rotateX(this._rotation[0]));
	this._localMatrix = mult(this._localMatrix, rotateY(this._rotation[1]));
	this._localMatrix = mult(this._localMatrix, rotateZ(this._rotation[2]));
	this._localMatrix = mult(this._localMatrix, scalem(this._scale));

};




