attribute vec4 vPosition;
attribute vec3 vNormal;
attribute vec2 vTexCoord;

uniform mat4 ProjectionMatrix;
uniform mat4 ViewMatrix;
uniform mat4 WorldMatrix;
uniform mat3 NormalMatrix;

varying float factor;
varying vec3 fNormal;
varying vec2 fTexCoord;
varying vec4 fWorldPosition;

void main()
{
    factor = vPosition.x;
    fNormal = NormalMatrix * vNormal;
    fTexCoord = vTexCoord;

    vec4 worldPosition = WorldMatrix*vPosition;
    fWorldPosition = worldPosition;
    gl_Position = ProjectionMatrix * ViewMatrix * worldPosition;
}