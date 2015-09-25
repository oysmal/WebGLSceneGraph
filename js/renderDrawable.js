

// Render a specific type of drawable. If anything changes from the "scenenode.addDrawable(...)" example in "scenegraphexample.js", this will have to be changed to reflect this.
// TODO: Create a more flexible solution for rendering drawables. JSON format for example?
var renderDrawable = function(drawable) {
    "use strict";

    var programInfo = drawable.drawInfo.programInfo;
    var attributeLocations = programInfo.attributeLocations;
    var uniformLocations = programInfo.uniformLocations;

    var bufferInfo = drawable.drawInfo.bufferInfo;
    var uniformInfo = drawable.drawInfo.uniformInfo;

    gl.useProgram(programInfo.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
    gl.vertexAttribPointer(attributeLocations.vPosition, 4, gl.FLOAT, false, 0, 0);
   	gl.enableVertexAttribArray(attributeLocations.vPosition);

    gl.uniformMatrix4fv(uniformLocations.worldMatrix, false, flatten(drawable._worldMatrix));      // Pass the world matrix of the current object to the shader.
    gl.uniform4fv(uniformLocations.color, new Float32Array(uniformInfo.color));
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numVertices);
};