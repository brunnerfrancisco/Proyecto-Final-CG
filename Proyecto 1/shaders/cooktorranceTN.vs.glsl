#version 300 es
//Shader de vertices para implementar Cook Torrance con normal mapping

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec2 vertexTextureCoordinates;
in vec3 vertexTangent;

out vec3 vVE;
out vec3 vNE;
out vec2 fTexCoor;
out mat3 TBNMatrix;

void main () {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1);

    vNE = (normalMatrix * vec4(vertexNormal, 0)).xyz;
    vVE = -(modelViewMatrix * vec4(vertexPosition,1.0)).xyz;
    
    fTexCoor = vertexTextureCoordinates;

    //armamos la matrix TBN a partir del vector normal N, el tangente T y el bitangenteB (calculado a partir del N y el T)
    vec3 N = vec3(normalMatrix * vec4(vertexNormal, 0));
    vec3 T = vec3(normalMatrix * vec4(vertexTangent, 0));
    vec3 B = cross(N, T);
    TBNMatrix = mat3(T, B, N);

}
