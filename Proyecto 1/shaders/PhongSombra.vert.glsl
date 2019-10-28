#version 300 es

struct Light {
    vec3 color;     // Light intensity
    vec3 position;  // Light position
};

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform mat4 lightViewMatrix;
uniform mat4 lightProjectionMatrix;

uniform Light light;


in vec3 vertexPosition;
in vec3 vertexNormal;


out vec4 shadowCoor;

out vec3 vLE;
out vec3 vV;
out vec3 vN;

const mat4 tMat = mat4(
 0.5, 0.0, 0.0, 0.0,
 0.0, 0.5, 0.0, 0.0,
 0.0, 0.0, 0.5, 0.0,
 0.5, 0.5, 0.5, 1.0
 );

void main() {
	// transf posición de los vértices de entrada del Esp.obj al Esp.ojo (vE)
	vec4 vE = modelViewMatrix * vec4(vertexPosition, 1.0);

		// transf posic. luz a espacio del ojo
	vec4 L = viewMatrix * vec4(light.position, 1);
	
	// Calc. vector luz en Espacio del ojo
	vLE    = L.xyz - vE.xyz;

	// Vector del vertice al ojo en Espacio del ojo	
	vV	   = -vE.xyz;

	vec4 N = normalize(normalMatrix * vec4(vertexNormal, 0.0)) ;
	vN = N.xyz;

	shadowCoor = tMat * lightProjectionMatrix * lightViewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
	
	gl_Position = projectionMatrix  * modelViewMatrix * vec4(vertexPosition, 1.0);
		
}
