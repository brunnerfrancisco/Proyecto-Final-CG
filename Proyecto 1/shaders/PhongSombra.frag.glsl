#version 300 es

precision highp float;
//precision mediump sampler2D;
precision mediump sampler2DShadow;

//uniform sampler2D shadowMap;

uniform sampler2DShadow shadowMap;

struct Material {
    vec3 Ka;    // Surface ambient reflectivity
    vec3 Kd;    // Surface diffuse reflectivity
    vec3 Ks;	// Surface specular reflectivity
    float brillo; // coef. especular
};

struct Light {
    vec3 color;     // Light intensity
    vec3 position;  // Light position
};

uniform Light light;
uniform Material material;


//in vec2 fTexCoor;
in vec3 vLE;
in vec3 vV;
in vec3 vN;

in vec4 shadowCoor;

out vec4 fragColor;

void main() {

//const float offset = 0.004;

	float dist = length(vLE);
	// Utilizaremos un factor de atenuación para la intensidad de la luz respecto
	// a la distancia a los objetos a ser iluminados.
	float fatt = 1.0 / (0.3 + 0.007 * dist + 0.0008 * dist * dist);

	vec3 L = normalize(vLE);
	vec3 V = normalize(vV);
	vec3 N = normalize(vN);
	vec3 H = normalize(L + V);
	//vec3 R = reflect(-L, N);

	float LdotN = max(dot(L, N), 0.0);
    //float RdotV = max(dot(R, V), 0.0);
    float HdotN = max(dot(H, N), 0.0);
	
	// Calc término difuso + especular de Phong
	float dif		= LdotN;

	 float specPhong = 0.0;
	
	if (LdotN > 0.0) {
			specPhong = pow(HdotN, material.brillo);
	}

	//vec4 colorTex = texture(imagen, fTexCoor);

	vec3 ambiente  =  material.Ka * 0.5 ;
	vec3 difuso    =   material.Kd * dif;
	vec3 especular =  material.Ks * specPhong;

// visibility + bias
//vec4 offsetVec = vec4(0.0, 0.0, offset * shadowCoor.w, 0.0);
	
//float visibility = textureProj(shadowMap, shadowCoor - offsetVec);
	
	//float visibility = textureProj(shadowMap, shadowCoor);

	// The sum of the comparisons with nearby texels
float sum = 0.0;
// Sum contributions from texels around ShadowCoord
sum += textureProjOffset(shadowMap, shadowCoor, ivec2(-1,-1));
sum += textureProjOffset(shadowMap, shadowCoor, ivec2(-1,1));
sum += textureProjOffset(shadowMap, shadowCoor, ivec2(1,1));
sum += textureProjOffset(shadowMap, shadowCoor, ivec2(1,-1));
float visibility = sum * 0.25;

	fragColor = vec4(ambiente + visibility * (light.color *  fatt *(difuso + especular)), 1.0);
	
}
