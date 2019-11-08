#version 300 es
#define MAX_LIGHTS 10
#define PI 3.14159265358979323846

precision mediump float;

uniform vec4 pointLightPosition;
uniform samplerCube lightShadowMap;
uniform vec2 shadowClipNearFar;

uniform struct Light {
    vec3 color; // Light intensity
    vec4 position; // Light position in eye coordinates. If w==0.0, it is a directional light and [w,y,z] is the incident direction
    vec4 spot_direction; //spot direction in eye coordinates
    float spot_cutoff; //cosine of the angle, point lights have a spot_cutoff set to -1.0
    float linear_attenuation;
    float quadratic_attenuation;
} allLights[MAX_LIGHTS];

uniform int numLights;
in vec2 fTexCoor;
in vec3 fPos;
in vec3 vVE;
in vec3 vNE;
in mat3 TBNMatrix;
out vec4 fragColor;

struct Material {
    vec3 kd;
    vec3 ks;
    float m; //rugosidad de cook torrance
    float f0; //fresnel
    float sigma; //rugosidad de oren nayar

};
uniform Material material;

float orenNayarDiffuse(Light luz, float LdotV, float NdotL, float NdotV, float albedo){
    float s = LdotV - NdotL * NdotV;
    float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));

    float sigma2 = material.sigma * material.sigma;
    float A = 1.0 + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));
    float B = 0.45 * sigma2 / (sigma2 + 0.09);

  return albedo * max(0.0, NdotL) * (A + B * s / t) / PI;
}

float fresnelSchlick(float cosVH){//Aproximacion de schlick
    float fresnel = material.f0 + (1.0 - material.f0) * pow(1.0 - cosVH,5.0);
    return fresnel;
}

float D_beckman( float dotNH ){
    float m2 = pow(material.m,2.0);
    float dotNH2 = pow(dotNH,2.0);
    float dotNH4 = pow(dotNH2,2.0);
    float num = exp(-1.0*((1.0-dotNH2)/(m2*dotNH2)));
    float den = 4.0*m2*dotNH4;
    return num/den;
}

float calcularG( float dotNH,float dotNV,float dotVH,float dotNL ){
   	float Ge = (2.0*dotNH*dotNV)/dotVH;
    float Gs = (2.0*dotNH*dotNL)/dotVH;
    return min(1.0,min(Ge,Gs));
}
vec3 color_cook_torrance(Light light, vec3 diffuseColor, vec3 specularColor, vec3 N, vec3 V){
    vec3 toReturn = vec3(0.0,0.0,0.0);
    if(length(light.color) > 0.0){ //checkeo si la luz esta prendida
        vec3 vLE = light.position.xyz + vVE;
        float dist = length(vLE);

        vec3 vSD = light.spot_direction.xyz;
        vec3 L = normalize(vLE);
        vec3 H = normalize(L+V);
        vec3 S = normalize(vSD);

        float dotLN = dot(L,N); //cos theta i
        float dotVN = dot(V,N); //cos theta r
        float dotLV = dot(L,V);
        float dotHN = max(dot(H,N),0.0); //cos theta h
        float dotVH = max(dot(V,H),0.0);

        float specular = 0.0;
        if(dotLN > 0.0 && dotVN > 0.0){
            float F = fresnelSchlick(dotHN);
            float D = D_beckman(dotHN);
            float G = calcularG(dotHN,dotVN,dotVH,dotLN);
            specular = (F*D*G)/(4.0*dotVN*dotLN);
        }
        float diffuse = orenNayarDiffuse(light,dotLV,dotLN,dotVN,0.96-specular);
       // float diffuse = dotLN;
        float attenuation = 1.0/(1.0 + dist * light.linear_attenuation + dist*dist * light.quadratic_attenuation );
        toReturn = light.color * attenuation * dotLN * (diffuseColor * diffuse + specularColor * specular);

    }
    return toReturn;
}

void main(){
    vec3 V = normalize(vVE);
    vec3 N = normalize(vNE);

    vec3 diffuseColor = material.kd;
    vec3 specularColor = material.ks;

    vec3 outputColor = vec3(0.0);
    for(int i = 0; i < numLights; i++){
        outputColor += color_cook_torrance(allLights[i],diffuseColor,specularColor,N,V);
    }
    fragColor = vec4(pow(outputColor,vec3(1.0/2.2)), 1.0);
}
