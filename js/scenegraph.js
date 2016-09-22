/*
Scenegraph node. Create a Node and set it as a parent to (or child of) other Nodes 
to create a transform hierarchy (SceneGraph). 
@param parent: If a Node is passed as an argument to the constructor (new Node(parent)), 
that Node will be set as the parent of the new Node. If not, _parent it is set to null
 */
class SceneNode {

	constructor(parent) {
		this.parent = parent;

		// The Model matrix for this node (Translation, Rotation, Scale)
		this._localMatrix = mat4(1);
		this.worldMatrix = this._localMatrix;	// The matrix used for rendering this node and updating children

		this._parent = null;
		this.drawInfo = null;

		this._position = [0, 0, 0];
		this._scale = [1, 1, 1];
		this._rotation = [0, 0, 0];

		this._children = [];

		if (parent) {
			parent.addChild(this);
			this._parent = parent;
		}
	}



	// Get the drawableNodes list.
	static getDrawableNodes() {
		return SceneNode.drawableNodes;
	};

	// Add a drawable node to the list.
	// @param node: node to add to drawable list
	static addDrawableNode(node) {
		if (SceneNode.drawableNodes.indexOf(node) === -1) {
			SceneNode.drawableNodes.push(node);
		}
	};

	// Remove a drawable node from the list.
	// @param node: node to remove from drawable list
	static removeDrawableNode(node) {
		let index = SceneNode.drawableNodes.indexOf(node);
		if (index !== -1) {
			SceneNode.drawableNodes.splice(index, 1);
		}
	};


	/* Add drawinfo to the node the function is invoked on, 
	thereby making it renderable (It will add itself to the drawable list).
	@param drawInfo: an object containing information about buffers, uniforms and shader program. */
	addDrawable(drawInfo) {
		if (drawInfo) {
			this.drawInfo = drawInfo;
		}

		// Add to list of drawables
		SceneNode.addDrawableNode(this);
	};


	/* Add a child to the node the function is invoked 
	on if it is not already a child of this node.
	@param child: The node to add as a child of this node. 
	*/
	addChild(child) {
		if (child && this._children.indexOf(child) === -1) {
			this._children.push(child);
			child._parent = this;
		}
	};


	/* Remove a child from the node the function is invoked 
	on if it is a child of this node.
	@param child: The node to remove as a child of this node. 
	*/
	removeChild(child) {
		if (child) {
			let index = this._children.indexOf(child);

			// Make sure child is in the children array
			if (index !== -1) {
				this._children.splice(index, 1);	// Modify array to remove one element starting at index.
				child._parent = null;	// Set the parent of child to be null.
			}
		}
	};


	/* Updates the node's _worldMatrix, and propagates the _worldMatrix down the tree from the node. 
	 * Call this method on the root node to update the whole tree.
	 */
	updateMatrices() {
		this.updateLocalMatrix();	// Recalculate this node's localMatrix.

		// Do this if the node has a parent
		if (this._parent !== null) {

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
		/*for (let i = 0; i < this._children.length; i++) {
	
			this._children[i].updateMatrices();
		}*/

		this._children.map((child) => {
			child.updateMatrices();
		});
	};

	/**
	 * Sets the current absolute scale
	 * @param scale {vec3}: a vector determining the scale in x, y, z directions
	 */
	setScale(scale) {
		this._scale = scale;
	};

	// Scale the node.
	// @param scale: an array with 3 components, representing the scale along each axis. 
	//E.g. make the node twice as large: scale = [2,2,2].
	scale(scale) {
		if (scale) {
			this._scale = mult(this._scale, scale);
		}
	};

	/**
	 * Set position according relative to the parent's position
	 * @param position: a new position
	 */
	setPosition(position) {
		if (position) {
			this._position = position;
		}
	};

	// Translate the node.
	// @param translation: an array with 3 components, representing the distance to translate along each axis.
	translate(translation) {
		if (translation) {
			this._position = add(this._position, translation);
		}
	};

	/**
	 * Set actual orientation relative to it's parent.
	 * @param angles {vec3}: three euler angles in degrees
	 */
	setOrientation(angles) {
		// Reset current orientation
		if (angles) {
			this._rotation = angles;
		}
	};

	/**
	 * Rotate the node relative to it's parent.
	 * @param angles {vec3}: three euler angles in degrees
	 */
	rotate(angles) {
		if (angles) {
			this._rotation = add(this._rotation, angles);
		}
	};


	/* Calculate the localMatrix by multiplying the translation, rotation and scale matrices. 
	 * Use the MV.js library to create matrices.
	 */
	updateLocalMatrix() {
		// Reset _localMatrix
		this._localMatrix = mat4(1);

		// Recalculate _localMatrix
		this._localMatrix = mult(this._localMatrix, translate(this._position));
		this._localMatrix = mult(this._localMatrix, rotateX(this._rotation[0]));
		this._localMatrix = mult(this._localMatrix, rotateY(this._rotation[1]));
		this._localMatrix = mult(this._localMatrix, rotateZ(this._rotation[2]));
		this._localMatrix = mult(this._localMatrix, scalem(this._scale));

	};

}; // End of class declaration



/*
	These are static variables in JavaScript 6. They are added to the class
	identifier after the class declaration. They must be accessed by 
*/
SceneNode.drawableNodes = [];	// A list of nodes with drawable components