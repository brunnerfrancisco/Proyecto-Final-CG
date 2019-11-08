#version 300 es
#define MAX_LIGHTS 50
//Shader de fragmentos que implementa iluminacion de phong
//Hasta 10 luces de tipo puntual, spot y direccional
//Una textura
#define EPSILON 0.00001
precision highp float;

uniform struct Light {
    vec3 color; // Light intensity
    vec4 position; // Light position in eye coordinates. If w==0.0, it is a directional light and [w,y,z] is the incident direction
    vec4 spot_direction; //spot direction in eye coordinates
    float spot_cutoff; //cosine of the angle, point lights have a spot_cutoff set to -1.0
    float linear_attenuation;
    float quadratic_attenuation;
} allLights[MAX_LIGHTS];

struct Material {
    vec3 kd;
    vec3 ks;
    float shininess;
    sampler2D texture0;
};

uniform int numLights;
uniform Material material;

in vec3 vVE;
in vec3 vNE;
in vec2 fTexCoor;

out vec4 fragmentColor;

vec3 calcPhong(Light light, vec3 diffuseColor, vec3 specularColor, vec3 N, vec3 V){
    vec3 toReturn = vec3(0.0);
    if(length(light.color) > 0.0){//si la luz no esta apagada
        vec3 vLE = vec3(0.0);
        float dist = 0.0;
        if(light.position.w < 0.00001){ //si es luz direccional
            vLE = -light.position.xyz;
        }else{ //no es luz direccional
            vLE = light.position.xyz + vVE;
            dist = length(vLE);
        }
        vec3 vSD = light.spot_direction.xyz;
        vec3 L = normalize(vLE);
        vec3 H = normalize(L + V);
        vec3 S = normalize(vSD);

        float dotLN = dot(L,N);
        float dotVN = dot(V,N);

        if((light.spot_cutoff != -1.0 && dot(S, -L) > light.spot_cutoff) //si es spot y esta dentro del cono
                ||  light.spot_cutoff == -1.0 //o si es puntual
                ||  light.position.w < 0.00001){ //o si es direccional
            float attenuation = 1.0/(1.0 + dist * light.linear_attenuation + dist*dist * light.quadratic_attenuation );  
            vec3 diffuse = diffuseColor * max(dotLN, 0.0);
            vec3 specular = vec3(0.0);
            if(dotLN > 0.0 && dotVN > 0.0){                    
                specular = specularColor * pow(max(dot(H,N),0.0),material.shininess);
            }
            toReturn = attenuation * light.color * (diffuse + specular);
        }             
    }
    return toReturn;
}

void main () {
    vec3 N = normalize(vNE);
    vec3 V = normalize(vVE);

    vec3 diffuseColor = material.kd;
    vec3 specularColor = material.ks;

    vec3 outputColor = vec3(0.0);
    for(int i = 0; i < numLights; i++){
        outputColor += calcPhong(allLights[i],diffuseColor,specularColor,N,V);
    }
    
    vec3 ambient = vec3(0.8);
    

    fragmentColor = vec4(ambient + outputColor, 1);

}
