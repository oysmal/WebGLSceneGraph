/**
 * Created by endre on 11.09.15.
 */

/**
 * Genearates a sphere..
 * Ported from the C++ version of Angel's Interactive Computer Graphics
 *
 * @param numSphereStacks {Number} number of circles stacked on top of each other
 * @param numSphereSlices {Number} number of slices each circle will be divided into.
 * @return {Object} an object containing the generated geometry
 */
function generateSphere(numSphereStacks, numSphereSlices) {

    let stackAngleStep = Math.PI/(numSphereStacks);
    let sliceAngleStep = (Math.PI*2)/numSphereSlices;

    let points = [];
    let normals = [];
    let texCoords = [];

    // Set radius to 0.5 to generate a sphere with diameter 1.0
    let radius = 0.5;

    for (let i=0; i<numSphereSlices; i++) {
        points.push(vec4(0.0, radius, 0.0, 1.0));
        points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep, radius));
        points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep, radius));

        texCoords.push(vec2(1, 0));
        texCoords.push(vec2((i+1)/numSphereStacks, 1/numSphereSlices));
        texCoords.push(vec2((i+0)/numSphereStacks, 1/numSphereSlices));

        for (let j=1; j<numSphereStacks-1; j++) {
            points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep*(j+0), radius));
            points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep*(j+0), radius));
            points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep*(j+1), radius));

            texCoords.push(vec2((i+0)/numSphereStacks, (j+0)/numSphereSlices));
            texCoords.push(vec2((i+1)/numSphereStacks, (j+0)/numSphereSlices));
            texCoords.push(vec2((i+1)/numSphereStacks, (j+1)/numSphereSlices));

            points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep*(j+0), radius));
            points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep*(j+1), radius));
            points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep*(j+1), radius));

            texCoords.push(vec2((i+0)/numSphereStacks, (j+0)/numSphereSlices));
            texCoords.push(vec2((i+1)/numSphereStacks, (j+1)/numSphereSlices));
            texCoords.push(vec2((i+0)/numSphereStacks, (j+1)/numSphereSlices));
        }

        points.push(vec4(0.0,-radius,0.0,1.0));
        points.push(getCoordinate((i+0)*sliceAngleStep, Math.PI-stackAngleStep, radius));
        points.push(getCoordinate((i+1)*sliceAngleStep, Math.PI-stackAngleStep, radius));

        texCoords.push(vec2(0, 0));
        texCoords.push(vec2((i+0)/numSphereStacks, 1 - 2/numSphereSlices));
        texCoords.push(vec2((i+1)/numSphereStacks, 1 - 2/numSphereSlices));
    }

    // Generate vertex normals
    for (let i = 0; i < points.length; ++i) {
        normals.push(normalize(vec3(points[i])));
    }

    //normals = generateSurfaceNormals(points);

    return {
        "numVertices": points.length,
        "points": points,
        "normals": normals,
        "texCoords": texCoords
    };
}

/**
 * Generates point on a spheres based on latitude and longitude
 * and a given radius.
 *
 * @param longitude {Number} angle in radians, valid from [0, 2*π)
 * @param latitude {Number} angle in radians, valid from [0, π]
 * @param radius {Number} the radius of the sphere point
 * @returns {vec4} a sphere point
 */
function getCoordinate(longitude, latitude, radius) {
    "use strict";

    let y = Math.cos(latitude);
    let x = Math.cos(longitude) * Math.sin(latitude);
    let z = Math.sin(longitude) * Math.sin(latitude);

    return vec4(scale(radius, vec3(x, y, z)), 1.0);
}