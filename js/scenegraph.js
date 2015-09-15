/*
Scenegraph node. Create a Node and set it as a parent to, or child of, other Nodes to create a transform hierarchy. 

@parent If a Node is passed as an argument to the constructor (new Node(parent)), that Node will be set as the parent of the new Node. If not, parentMatrix it is set to null
 */
var SceneNode = function(parent){
	this.localMatrix = mat4();
	this.worldMatrix = this.localMatrix;
	this.parent = null;
	this.drawInfo = null;

	this.translation = mat4();
	this.thescale = mat4();
	this.rotation = mat4();

	this.children = [];

	if(parent) {
		parent.addChild(this);
		this.parent = parent;
	}
};


SceneNode.drawableNodes = [];

SceneNode.getDrawableNodes = function() {	
	return SceneNode.drawableNodes;
};
SceneNode.addDrawableNode = function(node) {
	if(SceneNode.drawableNodes.indexOf(node) == -1) { 
		SceneNode.drawableNodes.push(node);
	}
};
SceneNode.removeDrawableNode = function(node) {
	var index = SceneNode.drawableNodes.indexOf(node);
	if(index != -1) {
		SceneNode.drawableNodes.splice(index, 1);
	}
};


// Add drawinfo to this node, thereby making it renderable
SceneNode.prototype.addDrawable = function(buffer_info, program_info, uniform_info) {
	if(buffer_info && program_info && uniform_info) {
		this.drawInfo = {
			uniformInfo: uniform_info,
			programInfo: program_info,
			bufferInfo: buffer_info
		};
		// Add to list of drawables
		SceneNode.addDrawableNode(this);
	}
} 


// Add drawinfo to this node, thereby making it renderable
SceneNode.prototype.addDrawable = function(drawInfo) {
	if(drawInfo) {
		this.drawInfo = drawInfo;
	}

	// Add to list of drawables
	SceneNode.addDrawableNode(this);
} 


SceneNode.prototype.addChild = function(child) {
	if(child && this.children.indexOf(child) == -1) {
		this.children.push(child);
		child.parent = this;
	}
}


SceneNode.prototype.removeChild = function(child) {
	if(child) {
		var index = this.children.indexOf(child);

		// Make sure child is in the children array
		if(index != -1) {
			this.children.splice(index, 1);	// Modify array to remove one element starting at index.
			child.parent = null;
		}
	}
};


// Updates this node's worldMatrix, and propagates the updates down the tree. Call this method on the root node.
SceneNode.prototype.updateWorldMatrix = function() {
	if(this.parent != null) {
		this.updateLocalMatrix();
		// Put final result in worldMatrix
		this.worldMatrix = mult(this.parent.worldMatrix, this.localMatrix);
	} else {
		this.worldMatrix = this.localMatrix;
	}

	// Propagate the update downwards in the scene tree
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].updateWorldMatrix();
	}
};


SceneNode.prototype.scale = function(scale) {
	if(scale) {
		console.log("Scale");
		this.thescale = mult(this.thescale, scalem(scale));
		this.updateLocalMatrix();
	}
};


SceneNode.prototype.translate = function(translation) {
	if(translation) {
		console.log("Translate");
		this.translation = mult(this.translation, translate(translation));
		this.updateLocalMatrix();
	}
};

SceneNode.prototype.rotate = function(angle, axis) {
	if(angle && axis) {
		console.log("Rotate");
		this.rotation = mult(this.rotation, rotate(angle, axis));
		this.updateLocalMatrix();
	}
};


SceneNode.prototype.updateLocalMatrix = function() {
	this.localMatrix = mult(mat4(), this.thescale);
	this.localMatrix = mult(this.localMatrix, this.rotation);
	this.localMatrix = mult(this.localMatrix, this.translation);
}



