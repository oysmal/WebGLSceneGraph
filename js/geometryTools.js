/**
 * Created by endre on 11.09.15.
 */

/**
 * Generate surface normals
 *
 * @param triangleVertices an array of 3 or 4 dimensional vectors, must have length that is a multiple of 3.
 * @return {vec3[]} surface normals
 */
function generateSurfaceNormals(triangleVertices) {
    "use strict";

    // TODO: Move into a utility library
    // TODO: Make a version fitted to indexed vertices
    // TODO: Make a version for generating vertex normals

    if (triangleVertices.length % 3 !== 0) {
        console.log("Length of triangleVertices is not a multiple of 3, it is not possible generate complete surface normals");
    }

    let numFaces = Math.floor(triangleVertices.length / 3);

    let surfaceNormals = [];

    for (let i = 0; i < numFaces; ++i) {
        // We need three points to generate a surface.
        let vertex_a = triangleVertices[3*i + 0];
        let vertex_b = triangleVertices[3*i + 1];
        let vertex_c = triangleVertices[3*i + 2];

        let vec_ab = subtract(vertex_b, vertex_a);
        let vec_ac = subtract(vertex_c, vertex_a);

        let normal_vector = normalize(cross(vec_ab, vec_ac));

        surfaceNormals.push(normal_vector);
        surfaceNormals.push(normal_vector);
        surfaceNormals.push(normal_vector);
    }

    return surfaceNormals;
}