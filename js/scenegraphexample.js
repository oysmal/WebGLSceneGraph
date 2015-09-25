
var gl;

window.onload = function init() {
    "use strict";

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

    //
    // Set up our models
    //

    camera.setPosition(vec3(0, 5, 10));
    camera.forwardDirection = subtract(vec3(0,0,-1), camera.position);

    var Projection = perspective(60, canvas.width/canvas.height, 0.01, 1000);
    var View = camera.getViewMatrix();


    // SCENE GRAPH CODE

    //Create the sphere and add it to the scene graph
    var sphereData1 = generateSphere(16, 16);
    var sphereNode1 = new SceneNode(scene);	// scene as parent
    sphereNode1.scale([0.5,0.5,0.5]); // Make it half the size of sphereNode1

    // Create a non-drawable node rotating all its children around the node's point
    // in space (in this case the origo since we do not translate it). This will let us controll 
    // the oribit speed instead of it following the rotation of the parent (the sun).
    var orbitNode = new SceneNode(scene); 

    // Create another sphereNode using the same data, and set it as a child of the orbitNode
    // so it will orbit around the orbitNode's position (0,0,0).
    var sphereData2 = generateSphere(16, 16);
    var sphereNode2 = new SceneNode(orbitNode);
    sphereNode2.translate([5,0,0]); // Translate relative to sphereNode 1.
    sphereNode2.scale([0.25,0.25,0.25]); // Make it half the size of sphereNode1

    
    //
    //  Configure WebGL
    //

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    var ViewProjectionLocation = gl.getUniformLocation(program, "ViewProjection");
    var ColorLocation = gl.getUniformLocation(program, "Color");
    var WorldMatLocation = gl.getUniformLocation(program, "WorldMatrix");

    var vPositionLocation = gl.getAttribLocation(program, "vPosition");

    var programInfo = {
        program: program,
        attributeLocations: {
            vPosition: vPositionLocation
        },
        uniformLocations: {
            viewProjectionMatrix: ViewProjectionLocation,
            worldMatrix: WorldMatLocation,
            color: ColorLocation
        }
    };

    /* Load the data into the GPU in 2 separate buffers.
     * Avoid creation of unnecessary buffers (containing exactly the same data). */

    var buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(sphereData1.points)), gl.STATIC_DRAW);

    var sphere1BufferInfo = {
        buffer: buffer1,
        numVertices: sphereData1.numVertices
    };

    var buffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(sphereData2.points)), gl.STATIC_DRAW);


    var sphere2BufferInfo = {
        buffer: buffer2,
        numVertices: sphereData2.numVertices
    };

    //
    // Add drawinfo to the SceneNodes
    //

    sphereNode1.addDrawable({
    	bufferInfo: sphere1BufferInfo,
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(0, 1, 1, 1)
        },
        programInfo: programInfo
    });

    sphereNode2.addDrawable({
    	bufferInfo: sphere2BufferInfo,
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(0, 1, 0, 1)
        },
        programInfo: programInfo
    });


    //
    // Set up and start the render loop
    //

    var prevTimestamp = 0;

    function step(timestamp) {
        var deltaTimestamp = timestamp - prevTimestamp;
        prevTimestamp = timestamp;

        var seconds = timestamp/1000;
        var diffSeconds = deltaTimestamp/1000;

        camera.update(deltaTimestamp);
        View = camera.getViewMatrix();
        var ViewProjection = mult(Projection, View);


        // Rotate sphereNode1 around itself
        sphereNode1.rotate([0,3600/60*diffSeconds,0]);

        // Rotate the orbitNode around itself. This will propagate to all its children(sphereNode2)
        // so they will orbit the orbitNode. 
        orbitNode.rotate([0,3600/60*diffSeconds,0]);

        // Rotate sphereNode2 around itself
        sphereNode2.rotate([0,3600/60*diffSeconds,0]);

        // Update the world matrices of the entire scene graph (Since we are starting at the root node).
        scene.updateMatrices();

        render(SceneNode.getDrawableNodes(), ViewProjectionLocation, ViewProjection);

        // Ask the the browser to draw when it's convenient
        window.requestAnimationFrame(step);
    }

    // Ask the the browser to draw when it's convenient
    window.requestAnimationFrame(step);
};

function render(drawableObjects, viewProjectionLocation, ViewProjection) {
    "use strict";

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(viewProjectionLocation, false, flatten(ViewProjection));

    drawableObjects.forEach(function(object) {
        renderDrawable(object); // Render a drawable.
    });
}
