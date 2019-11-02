#version 300 es
#define MAX_LIGHTS 10

precision highp float;

uniform struct Light {
    vec3 color; // Light intensity
    vec4 position; // Light position in eye coordinates. If w==0.0, it is a directional light and [w,y,z] is the incident direction
    vec4 spot_direction; //spot direction in eye coordinates
    float spot_cutoff; //cosine of the angle, point lights have a spot_cutoff set to -1.0
};

struct Material {
    vec3 ka;
    vec3 kd;
    vec3 ks;
    float sigma;
    float CoefEspec;
    sampler2D texture0; //diffuse texture
    //sampler2D texture1; //specular texture
};

uniform Light allLights[MAX_LIGHTS];
uniform int numLights;
uniform Material material;
const vec3 fogColor=vec3(0.7,0.7,0.7);
const float fogDensity=10.0;

in vec3 fragmentPosition;
in vec3 fragmentNormal;
in vec2 fragmentTextureCoordinates;
in vec4 viewSpace;

in vec3 vVE;
in vec3 vNE;

out vec4 fragmentColor;

float difOrenNayarSpot(vec3 L, vec3 N, vec3 V){
        
        vec3 H=normalize(L+V);
        vec3 R=normalize(reflect(-L,N));
        
        float cosI=max(dot(L,N),0.0);
        float cosR=max(dot(R,N),0.0);
        float cosH=max(dot(H,N),0.0);
        float titaH=acos(cosH);
        float titaI=acos(cosI);
        float titaR=acos(cosR);
        float fiI=acos(L.x/(cosI-90.0));
        float fiR=acos(R.x/(cosR-90.0));
        
        float A = 1.0-((0.5*pow(material.sigma,2.0))/(pow(material.sigma,2.0)+0.33));
        float B = (0.45/pow(material.sigma,2.0))/(pow(material.sigma,2.0)+0.09);
        float alpha=cosR;
        float beta=cosI;
        if (cosR<cosI){
            alpha=cosI;
            beta=cosR;
        }
        float cosenoFi=cos(fiI-fiR);
        
        return (A+B*max(0.0,cosenoFi)*sin(alpha)*tan(beta));        
}

vec3 calculoTotalSpot(Light luz, vec3 diffuseColor, vec3 specularColor, vec3 N, vec3 V){
        if(length(luz.color)>0.0){
            vec3 L = vec3(0.0);
            if(luz.position.w<1.0){
                L=normalize(-vec3(luz.spot_direction));
            }
            else {
                L=normalize(vec3(luz.position)-vVE);
            }
            vec3 H=normalize(L+V);
            float diffuseSpot=0.0;
            float specularSpot=0.0;
            float LN=max(dot(L,N),0.0);
            vec3 R = normalize(reflect(-L,N));            
            vec3 S=normalize(vec3(luz.spot_direction));
            if(dot(S,-L)> luz.spot_cutoff ){
                diffuseSpot=difOrenNayarSpot(L,N,V);
                specularSpot = LN*pow(max(dot(-R,V),0.0),material.CoefEspec);
                    if (dot(L,N) < 0.0){
                        specularSpot = 0.0;
                 } 
            }
            return /*material1.ka */+diffuseColor* diffuseSpot* luz.color*material.kd/3.14 + specularColor* luz.color*material.ks*specularSpot;
        }
        else
        return vec3(0.0,0.0,0.0);   
}

void main () {
    vec3 N = normalize(vNE);
    vec3 V = normalize(vVE);

    //range-based fog
    float fogFactor=0.0;
    float dist=0.0;
    dist=length(viewSpace);
    //neblina lineal
    fogFactor = (80.0-dist)/(10.0);
    fogFactor = clamp(fogFactor,0.0,1.0);


    vec3 diffuseColorFromTexture = texture(material.texture0,fragmentTextureCoordinates).rgb;
    vec3 specularColorFromTexture = texture(material.texture0,fragmentTextureCoordinates).rgb;

    vec3 outputColor = vec3(0.0);
    for(int i = 0; i < numLights; i++){
        outputColor += calculoTotalSpot(allLights[i],diffuseColorFromTexture,specularColorFromTexture,N,V);
    }

    vec3 ambient = diffuseColorFromTexture * 0.1;

    fragmentColor = vec4(ambient + outputColor, 1);
}