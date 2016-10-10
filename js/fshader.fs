precision mediump float;

uniform vec4 Color;

varying float factor;
varying vec3 fNormal;
varying vec2 fTexCoord;
varying vec4 fWorldPosition;

uniform highp mat4 ViewMatrix;

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;

uniform sampler2D texture;
uniform bool usingLight;
uniform vec4 light; // if light.w is 0 it is a directional light, if it is 1 it is a point light

void main()
{
    vec3 ambient = vec3(0.1, 0.1, 0.1);

    vec3 normal = normalize(fNormal);

    float directional = 1.0;

    if (usingLight) {
        vec3 lightDir = vec3(0.0);

        if (light.w == 0.0) {
            lightDir = normalize(light.xyz);
        } else {
            vec4 worldLightPosition = vec4(light.xyz, 1.0);

            vec4 pointToLight = ViewMatrix*(worldLightPosition - fWorldPosition);

            //float lightDistance = length(pointToLight.xyz);

            lightDir = normalize(pointToLight.xyz);
        }

        directional = max(dot(lightDir, normal), 0.0);
    }

    vec3 diffuse = directional * diffuse * texture2D(texture, fTexCoord).rgb;

    // TODO: add specular

    gl_FragColor = vec4(ambient + diffuse, 1.0);

    //gl_FragColor = texture2D(texture, fTexCoord);

    // Visualize the normals as color
    //gl_FragColor = vec4(vec3(0.5*normalize(fNormal) + 0.5), 1.0);
}