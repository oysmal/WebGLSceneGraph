"use strict";

var gl;

window.onload = function init() {
    var canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Use this object to listen for key inputs
    var keyboardState = new THREEx.KeyboardState();

    // The camera object control's the position and orientation of the... camera
    var camera = new Camera(keyboardState);

    // Create the root SceneNode of the scene graph.
    var scene = new SceneNode(null);
    console.log(scene);

    //
    // Set up our models
    //

    camera.setPosition(vec3(0, 5, -3));
    camera.forwardDirection = subtract(vec3(0,0,0), camera.position);

    //var Projection = ortho(-10, 10, -10, 10, -10, 10);
    var Projection = perspective(60, canvas.width/canvas.height, 0.01, 1000);
    var View = camera.getViewMatrix();


    //Create the sphere and add it to the scene graph
    var sphereData = generateSphere(16, 16);
    var sphereNode1 = new SceneNode(scene);	// scene as parent
    sphereNode1.scale([0.5,0.5,0.5]); // Make it half the size of sphereNode1

    // Create another sphereNode using the same data, and set it as a child of the first sphere
    var sphereNode2 = new SceneNode(sphereNode1);
    sphereNode2.translate([6,0,0]); // Translate relative to sphereNode 1.
    sphereNode2.scale([0.5,0.5,0.5]); // Make it half the size of sphereNode1


    // Create another sphereNode using the same data, and set it as a child of the second sphere
    var sphereNode3 = new SceneNode(sphereNode2);
    sphereNode3.translate([3,0,0]); // Translate relative to sphereNode 2.
    sphereNode3.scale([0.5,0.5,0.5]); // Make it half the size of sphereNode2

    //
    //  Configure WebGL
    //

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    var ModelViewProjectionLocation = gl.getUniformLocation(program, "ModelViewProjection");
    var ColorLocation = gl.getUniformLocation(program, "Color");
    var WorldMatLocation = gl.getUniformLocation(program, "WorldMatrix");

    /* Load the data into the GPU in 2 separate buffers*/

    var buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(sphereData.points)), gl.STATIC_DRAW);

    var buffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(sphereData.points)), gl.STATIC_DRAW);
    
    var buffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(sphereData.points)), gl.STATIC_DRAW);


    //
    // Add drawinfo to the SceneNodes
    //
    sphereNode1.addDrawable({
    	bufferInfo: {
        	buffer: buffer1,
        	numVertices: sphereData.numVertices
		},
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(1, 0, 0, 1)
        },
        programInfo: {
        	program: program,
            worldMatLocation: WorldMatLocation,
            colorLocation: ColorLocation
        }
    });

    sphereNode2.addDrawable({
    	bufferInfo: {
        	buffer: buffer2,
        	numVertices: sphereData.numVertices
		},
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(0, 1, 0, 1)
        },
        programInfo: {
        	program: program,
            worldMatLocation: WorldMatLocation,
            colorLocation: ColorLocation
        }
    });

    sphereNode3.addDrawable({
    	bufferInfo: {
        	buffer: buffer3,
        	numVertices: sphereData.numVertices
		},
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(0, 0, 1, 1)
        },
        programInfo: {
        	program: program,
            worldMatLocation: WorldMatLocation,
            colorLocation: ColorLocation
        }
    });

    


    //
    // Set up and start the render loop
    //

    var prevTimestamp = 0;

    window.requestAnimationFrame(function step(timestamp) {
        var deltaTimestamp = timestamp - prevTimestamp;
        prevTimestamp = timestamp;

        var seconds = timestamp/1000;
        var diffSeconds = deltaTimestamp/1000;

        camera.update(deltaTimestamp);
        View = camera.getViewMatrix();
        var MVP = mult(Projection, View);


        sphereNode1.rotateSelf((3600/60*diffSeconds), [0,1,0]);
        sphereNode2.rotateSelf((36000/60*diffSeconds), [0,1,0]);
        sphereNode3.rotateSelf((36000   /60*diffSeconds), [0,1,0]);
        sphereNode2.rotate((3600/60*diffSeconds), [0,1,0]);
        sphereNode3.rotate((3600/60*diffSeconds*4), [0,1,0]);

        // Load the MVP matrix into the scene and update all nodes.
        //scene.localMatrix = MVP;
        scene.updateWorldMatrix();

        console.log(SceneNode.getDrawableNodes().length);

        render(SceneNode.getDrawableNodes(), ModelViewProjectionLocation, ColorLocation, WorldMatLocation, MVP);

        window.requestAnimationFrame(step);
    });


}

function render(drawableObjects, mvpLocation, colorLocation, worldMatLocation, MVP) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(mvpLocation, false, flatten(MVP));

    drawableObjects.forEach(function(object) {
  //       gl.useProgram(object.drawInfo.programInfo.program);
		// gl.bindBuffer(gl.ARRAY_BUFFER, object.drawInfo.bufferInfo.buffer);
		// var vPosition = gl.getAttribLocation(object.drawInfo.programInfo.program, "vPosition");
  //   	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  //  		gl.enableVertexAttribArray(vPosition);

  //       gl.uniformMatrix4fv(worldMatLocation, false, flatten(object.worldMatrix));      // Pass the world matrix of the current object to the shader.
  //       gl.uniform4fv(colorLocation, new Float32Array(object.drawInfo.uniformInfo.color));
  //       gl.drawArrays(gl.TRIANGLES, 0, object.drawInfo.bufferInfo.numVertices);

        renderDrawable(object);
    });
}
