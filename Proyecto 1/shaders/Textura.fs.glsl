#version 300 es
#define MAX_LIGHTS 50
//Shader de fragmentos
//Una textura siempre iluminada
#define EPSILON 0.00001
precision highp float;

struct Material {
    sampler2D texture0;
};

uniform Material material;
in vec2 fTexCoor;

out vec4 fragmentColor;

void main () {

    vec3 fragColorFromTexture = texture(material.texture0,fTexCoor).rgb;

    fragmentColor = vec4(fragColorFromTexture, 1);

}
