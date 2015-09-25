/**
 * Created by endre on 10.09.15.
 */

function generateCube() {

    var points = [];
    var colors = [];
    var texCoords = [];

    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    var faces = [
        [1, 0, 3, 2],
        [2, 3, 7, 6],
        [3, 0, 4, 7],
        [6, 5, 1, 2],
        [4, 5, 6, 7],
        [5, 4, 0, 1]
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    for (var f = 0; f < faces.length; ++f) {
        var a = faces[f][0];
        var b = faces[f][1];
        var c = faces[f][2];
        var d = faces[f][3];

        var indices = [a, b, c, a, c, d];

        for (var i = 0; i < indices.length; ++i) {
            points.push(vertices[indices[i]]);
            //colors.push( vertexColors[indices[i]] );

            // for solid colored faces use
            colors.push(vertexColors[a]);
        }

        texCoords.push(vec2(0, 0));
        texCoords.push(vec2(1, 0));
        texCoords.push(vec2(1, 1));
        texCoords.push(vec2(0, 0));
        texCoords.push(vec2(1, 1));
        texCoords.push(vec2(0, 1));
    }

    var surfaceNormals = generateSurfaceNormals(points);

    return {
        "numVertices": points.length,
        "points": points,
        "colors": colors,
        "normals": surfaceNormals,
        "texCoords": texCoords
    };
}