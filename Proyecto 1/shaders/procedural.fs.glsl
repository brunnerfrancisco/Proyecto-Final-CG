#version 300 es
#define MAX_LIGHTS 50
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
    float shininess;
    vec2 resolution;
};

uniform int numLights;
uniform Material material;

in vec2 fTexCoor;
in vec3 vVE;
in vec3 vNE;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ),
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ),
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

float lines(vec2 pos, float b){
    float scale = 10.0;
    pos *= scale;
    return smoothstep(0.0,
                    0.5+b*0.5,
                    abs((sin(pos.x*3.1415)+b*2.0))*0.5);
}

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




out vec4 fragmentColor;

void main(void){
    vec2 st = fTexCoor/material.resolution;
    st.y *= material.resolution.y/material.resolution.x;

    vec2 pos = st.yx*vec2(10.0,3.0);

    float pattern = pos.x;

    // Add noise
    pos = rotate2d( noise(pos) ) * pos;

    // Draw lines
    pattern = lines(pos,0.5);
    
    vec3 color = vec3(pattern)*material.kd; //madera
    vec3 outputColor = vec3(0.0);

    vec3 N = normalize(vNE);
    vec3 V = normalize(vVE);

    for(int i = 0; i < numLights; i++){
        outputColor += calcPhong(allLights[i],color,color,N,V);
    }

    fragmentColor = vec4(material.kd*0.2 + outputColor,1.0);
}