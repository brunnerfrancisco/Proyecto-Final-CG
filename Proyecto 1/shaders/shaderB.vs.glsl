#version 300 es

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelMatrix;

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec2 vertexTextureCoordinates;

out vec3 vVE;
out vec3 vNE;
out vec2 fTexCoor;
out vec3 fPos;


void main () {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1);

    fPos =  (modelMatrix * vec4(vertexPosition,1.0)).xyz;

    vNE = (normalMatrix * vec4(vertexNormal, 0)).xyz;
    vVE = -(modelViewMatrix * vec4(vertexPosition,1.0)).xyz;
    
    fTexCoor = vertexTextureCoordinates;

}
