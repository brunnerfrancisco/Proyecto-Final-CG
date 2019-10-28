#version 300 es
#define MAX_LIGHTS 10

precision highp float;

uniform struct Light {
    vec3 color; // Light intensity
    vec4 position; // Light position in eye coordinates. If w==0.0, it is a directional light and [w,y,z] is the incident direction
    float linear_attenuation;
    float quadratic_attenuation;
} allLights[MAX_LIGHTS];

uniform int numLights;

uniform vec4 pointLightPosition;
uniform samplerCube lightShadowMap;
uniform vec2 shadowClipNearFar;

in vec3 vVE;
in vec3 vNE;
in vec2 fTexCoor;
in vec3 fPos;

out vec4 fragmentColor;

float calcSombras(Light light, vec3 N, vec3 V){
    float toReturn = 0.0;
    vec3 vLE = light.position.xyz + vVE;
    vec3 L = normalize(vLE);
    float dist = length(vLE);
    float LdotN = max(dot(L, N), 0.0);


    vec3 toLightNormal = normalize(pointLightPosition.xyz - fPos);
    float fromLightToFrag = (dist-shadowClipNearFar.x)/(shadowClipNearFar.y-shadowClipNearFar.x);
    float shadowMapValue = texture(lightShadowMap,-toLightNormal).r;
    if((shadowMapValue + 0.003)>= fromLightToFrag){
        toReturn += 0.4 * LdotN;
    }
    return toReturn;
}

vec3 calcLambert(Light light, vec3 diffuseColor, vec3 N){
    vec3 toReturn = vec3(0.0);
    if(length(light.color) > 0.0){//si la luz no esta apagada  
        vec3 vLE = light.position.xyz + vVE;
        float dist = length(vLE);
        vec3 L = normalize(vLE);

        float dotLN = dot(L,N);

        float attenuation = 1.0/(1.0 + dist * light.linear_attenuation + dist*dist * light.quadratic_attenuation );  
        vec3 diffuse = diffuseColor * max(dotLN, 0.0);

        toReturn = attenuation * light.color * diffuse;
                   
    }
    return toReturn;
}

void main () {
    vec3 V = normalize(vVE);
    vec3 N = normalize(vNE);

    vec3 color = vec3(0.5,0.5,0.5);

    vec3 outputColor = vec3(0.0);
    outputColor +=calcSombras(allLights[0],N,V) * calcLambert(allLights[0],color,N);
    for(int i = 0; i < numLights; i++){
        outputColor += calcLambert(allLights[i],color,N);
    }

    fragmentColor = vec4(outputColor, 1);

}
