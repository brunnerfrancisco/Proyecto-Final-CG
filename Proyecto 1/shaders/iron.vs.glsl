#version 300 es

precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelViewMatrix;

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec2 vertexTextureCoordinates;

out vec3 fragmentPosition;
out vec3 fragmentNormal;
out vec2 fragmentTextureCoordinates;

out vec3 vVE;
out vec3 vNE;
out vec4 viewSpace;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1);

    fragmentPosition = vec3(viewMatrix * modelMatrix * vec4(vertexPosition, 1));
    fragmentNormal = vec3(normalMatrix * vec4(vertexNormal, 0));
    fragmentTextureCoordinates = vertexTextureCoordinates;
    vNE = normalize(vec3(normalMatrix * vec4 (vertexNormal,0.0)));
    vec3 posVertexOjo = vec3(modelViewMatrix * vec4 (vertexPosition,1.0));
    vVE = posVertexOjo;
    viewSpace = viewMatrix * modelMatrix * vec4(vertexPosition,1.0);
}