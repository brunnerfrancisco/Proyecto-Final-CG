import { mat4, vec4 } from "/libs/gl-matrix/index.js";
import { getFileContentsAsText, loadImage } from "/libs/utils.js";
import { FpsCamera, FpsCameraControls, Geometry, Material, SceneLight, Program, SceneObject } from "/libs/gl-engine/index.js";
import { parse } from "/libs/gl-engine/parsers/obj-parser.js";

main();

async function main() {
	var angulo_viejo_rotacion = 0
	var automaticCamera = false
	var lastDrawTime = 0 

	// #️⃣ Configuracion base de WebGL;
	const canvas = document.getElementById("webgl-canvas")
	const gl = canvas.getContext("webgl2")
	gl.clearColor(0, 0, 0, 1)
	gl.enable(gl.DEPTH_TEST)
	
	// #️⃣ Creamos las camaras y sus controles
	var camera = new FpsCamera()
	var CameraControls = new FpsCameraControls(camera, canvas)
	camera.setPosition(0.0, 1.0, 30.0)

	//Texturas
	const torreTextureColor = gl.createTexture()

	const plazaTextureColor = gl.createTexture()

	const maderaTextureColor = gl.createTexture()

	const edificioATextureColor = gl.createTexture()

	const edificioBTextureColor = gl.createTexture()

	armarTextura(torreTextureColor, await loadImage("/textures/rust.jpg"))

	armarTextura(plazaTextureColor, await loadImage("/textures/cesped.jpg"))

	armarTextura(maderaTextureColor, await loadImage("/textures/madera.jpg"))

	armarTextura(edificioATextureColor, await loadImage("/textures/edificioa.jpg"))
	
	armarTextura(edificioBTextureColor, await loadImage("/textures/edificiob.jpg"))

	// Cargamos los obj
	const torreGeometryData = await parse("/models/torre_nuevo.obj")
	const plazaGeometryData = await parse("/models/plaza_nuevo.obj")
	const edificioaGeometryData = await parse("/models/edificioa_nuevo.obj")
	const edificiobGeometryData = await parse("/models/edificiob_nuevo.obj")
	const edificiocGeometryData = await parse("/models/edificioc_nuevo.obj")
	const bancosGeometryData = await parse("/models/banco_nuevo.obj")
	const faroGeometryData = await parse("/models/faro.obj")
	const dirigibleGeometryData = await parse("/models/dirigible_nuevo.obj")

	// Cargamos los Shaders
	const textureVertexShaderSource = await getFileContentsAsText("/shaders/texture.vs.glsl")
	const textureFragmentShaderSource = await getFileContentsAsText("/shaders/texture.fs.glsl")

	const objectsVertexShaderSource = await getFileContentsAsText("/shaders/shaderB.vs.glsl")
	const objectsFragmentShaderSource = await getFileContentsAsText("/shaders/shaderB.fs.glsl")

	// #️⃣ Programas
	const programTexture = new Program(gl, textureVertexShaderSource, textureFragmentShaderSource)
	const programObjects = new Program(gl, objectsVertexShaderSource, objectsFragmentShaderSource)

	// Geometrias
	const torreGeometry = new Geometry(gl, torreGeometryData)
	const plazaGeometry = new Geometry(gl, plazaGeometryData)
	const edificioaGeometry = new Geometry(gl, edificioaGeometryData)
	const edificiobGeometry = new Geometry(gl, edificiobGeometryData)
	const edificiocGeometry = new Geometry(gl, edificiocGeometryData)
	const bancosGeometry = new Geometry(gl, bancosGeometryData)
	const faroGeometry = new Geometry(gl, faroGeometryData)
	const dirigibleGeometry = new Geometry(gl, dirigibleGeometryData)

	// Materiales
	const torreMaterial = new Material(programTexture, true, true, { ka: [0.30, 0.30, 0.30], kd: [1.0, 0.0, 0.0], ks: [0.4, 0.4, 0.4], sigma: 50, CoefEspec:0.5, texture0: 0 })
	const plazaMaterial = new Material(programTexture, true, true, { ka: [0.30, 0.30, 0.30], kd: [1.0, 0.0, 0.0], ks: [0.4, 0.4, 0.4], sigma: 50, CoefEspec:0.5, texture0: 0 })
	const edificioaMaterial = new Material(programTexture, true, true, { texture0: 0 })
	const edificiobMaterial = new Material(programTexture, true, true, { texture0: 0 })
	const edificiocMaterial = new Material(programObjects, true, false, { texture0: 0 })
	const farolesMaterial = new Material(programObjects, true, false, { texture0: 0 })
	const bancosMaterial = new Material(programTexture, true, true, { texture0: 0 })
	const dirigibleMaterial = new Material(programObjects, true, false, { texture0: 0 })

	// #️⃣ Descripcion de los objetos de la escena:
	const torreObjeto = new SceneObject(gl, torreGeometry, torreMaterial, [torreTextureColor])
	torreObjeto.setPosition(0.0, 0.0, 0.0)
	torreObjeto.updateModelMatrix()

	const plazaObjeto = new SceneObject(gl, plazaGeometry, plazaMaterial, [plazaTextureColor])
	plazaObjeto.setPosition(0.0, 0.0, 30.0)
	plazaObjeto.updateModelMatrix()
	
	const dirigibleObjeto = new SceneObject(gl, dirigibleGeometry, dirigibleMaterial, [plazaTextureColor])
	dirigibleObjeto.rotateY(-90)
	dirigibleObjeto.setPosition(0.0, 25.0, 30.0)
	dirigibleObjeto.updateModelMatrix()

	const sceneObjects = [torreObjeto, plazaObjeto , dirigibleObjeto ]
	
	const edificios = []
	const faroles = []
	const bancos = []

	CrearEdificios()
	CrearFaroles()
	CrearBancos()

	// Seteamos la luz SceneLight(position,color,spot_direction,spot_cutoff,model)
	const light = new SceneLight([0.0, 100.0, 30.0, 0.0], [1.0, 1.0, 1.0], [0.0, -1.0, 0.0, 0.0], -1.0, null)

	var sceneLights = [light]

	gl.enable(gl.CULL_FACE)

	requestAnimationFrame(render)
	
	function render(now) {
		//Comandos de la camara.
		CameraControls.move()
		// Limpiamos buffers de color y profundidad del canvas antes de empezar a dibujar los objetos de la escena
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		
		drawSceneAsUsual()
		
		lastDrawTime = now
		requestAnimationFrame(render)
	}

	var lala=true

	function drawSceneAsUsual() {
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)


		// Dibujamos los objetos de la escena;
		for (let object of sceneObjects) {
			
			
			if (object.material.program==programTexture){
				mat4.multiply(object.modelViewMatrix, camera.viewMatrix, object.modelMatrix)
				mat4.invert(object.normalMatrix, object.modelViewMatrix)
				mat4.transpose(object.normalMatrix, object.normalMatrix)

				// Seteamos el programa a usar;
				object.material.program.use()

				// Actualizamos los uniforms a usar ( provenientes de la camara, el objeto, material y fuentes de luz )
				object.material.program.setUniformValue("viewMatrix", camera.viewMatrix)
				object.material.program.setUniformValue("projectionMatrix", camera.projectionMatrix)
				object.material.program.setUniformValue("modelMatrix", object.modelMatrix)
				object.material.program.setUniformValue("modelViewMatrix", object.modelViewMatrix)
				object.material.program.setUniformValue("normalMatrix", object.normalMatrix)
				
				for (let name in object.material.properties) {
					const value = object.material.properties[name]
					object.material.program.setUniformValue("material." + name, value)
					
				}
				
				if (object.material.affectedByLight) {
					let i = 0
					for (let light of sceneLights) {
						let lightPosEye = vec4.create();
						vec4.transformMat4(lightPosEye, light.position, camera.viewMatrix);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].position", lightPosEye);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].color", light.color);
						let spotDirEye = vec4.create();
						vec4.transformMat4(spotDirEye, light.spot_direction, camera.viewMatrix);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].spot_direction", spotDirEye);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].spot_cutoff", light.spot_cutoff);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].linear_attenuation", light.linear_attenuation);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].quadratic_attenuation", light.quadratic_attenuation);
						i++;
					}
				}
				// Seteamos info de su geometria
				object.vertexArray.bind()

				//info de texturas
				
				if (object.material.textured) {
					let i;
					for (i = 0; i < object.textures.length; i++) {
						gl.activeTexture(gl.TEXTURE0 + i)
						gl.bindTexture(gl.TEXTURE_2D, object.textures[i])
					}
				}
			}else{
				mat4.multiply(object.modelViewMatrix, camera.viewMatrix, object.modelMatrix);
				mat4.invert(object.normalMatrix, object.modelViewMatrix);
				mat4.transpose(object.normalMatrix, object.normalMatrix);
				// Seteamos el programa a usar;
				object.material.program.use();

				// Actualizamos los uniforms a usar ( provenientes de la camara, el objeto, material y fuentes de luz )
				object.material.program.setUniformValue("viewMatrix", camera.viewMatrix);
				object.material.program.setUniformValue("projectionMatrix", camera.projectionMatrix);
				object.material.program.setUniformValue("modelMatrix", object.modelMatrix);
				object.material.program.setUniformValue("modelViewMatrix", object.modelViewMatrix);
				object.material.program.setUniformValue("normalMatrix", object.normalMatrix);
				for (let name in object.material.properties) {
					const value = object.material.properties[name];
					object.material.program.setUniformValue("material." + name, value);
				}
				if (object.material.affectedByLight) {
					let i = 0;
					for (let light of sceneLights) {
						let lightPosEye = vec4.create();
						vec4.transformMat4(lightPosEye, light.position, camera.viewMatrix);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].position", lightPosEye);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].color", light.color);
						let spotDirEye = vec4.create();
						vec4.transformMat4(spotDirEye, light.spot_direction, camera.viewMatrix);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].spot_direction", spotDirEye);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].spot_cutoff", light.spot_cutoff);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].linear_attenuation", light.linear_attenuation);
						object.material.program.setUniformValue("allLights[" + i.toString() + "].quadratic_attenuation", light.quadratic_attenuation);
						i++;
					};
					object.material.program.setUniformValue("numLights", i);
				}

				// Seteamos info de su geometria
				object.vertexArray.bind();
				//info de texturas
				
				if (object.material.textured) {
					let i;/* 
					if (object.material.program == shadowProgram || object.material.program == shadowCookTorranceProgram || object.material.program == varianteBProgram) {
						for (i = 0; i < object.textures.length; i++) {
							gl.activeTexture(gl.TEXTURE1 + i);
							gl.bindTexture(gl.TEXTURE_2D, object.textures[i]);
						}
					}
					else { */
						for (i = 0; i < object.textures.length; i++) {
							gl.activeTexture(gl.TEXTURE0 + i);
							gl.bindTexture(gl.TEXTURE_2D, object.textures[i]);
						}
					//}
				} 
			}
			// Lo dibujamos
			gl.drawElements(object.drawMode, object.indexBuffer.size, object.indexBuffer.dataType, 0)
		}
	}

	function armarTextura(texture, image) {
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
		gl.generateMipmap(gl.TEXTURE_2D)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
		gl.bindTexture(gl.TEXTURE_2D, null)
	}

	function CrearEdificios() {
        //Edificios tipo A.
		for (var i = 0; i < 24; i=i+3)
        edificios[i] = new SceneObject(gl, edificioaGeometry, edificioaMaterial, [edificioATextureColor])
        //Edificios tipo B.
		for (var i = 1; i < 24; i=i+3)
        edificios[i] = new SceneObject(gl, edificiobGeometry, edificiobMaterial, [edificioBTextureColor])
        //Edificios tipo C.
		for (var i = 2; i < 24; i=i+3)
        edificios[i] = new SceneObject(gl, edificiocGeometry, edificiocMaterial, [plazaTextureColor])

        // Seccion D (9 edificios).
		edificios[0].rotateY(90);
		edificios[0].setPosition(-15, 0.0, 15);
        edificios[0].updateModelMatrix(); 
		edificios[1].rotateY(90);
		edificios[1].setPosition(-15, 0, 10);
		edificios[1].updateModelMatrix();
		edificios[2].rotateY(90);
		edificios[2].setPosition(-15, 0, 0);
		edificios[2].updateModelMatrix();
		edificios[3].rotateY(90);
		edificios[3].setPosition(-15, 0, 45);
        edificios[3].updateModelMatrix();
		edificios[4].rotateY(90);
		edificios[4].setPosition(-15, 0, 40);
		edificios[4].updateModelMatrix();
		edificios[5].rotateY(90);
		edificios[5].setPosition(-15, 0, 30);
		edificios[5].updateModelMatrix();
		edificios[6].rotateY(90);
		edificios[6].setPosition(-15, 0, 75);
		edificios[6].updateModelMatrix(); 
		edificios[7].rotateY(90);
		edificios[7].setPosition(-15, 0, 70);
		edificios[7].updateModelMatrix();
		edificios[8].rotateY(90);
		edificios[8].setPosition(-15, 0, 60);
		edificios[8].updateModelMatrix();
		 
		// Seccion A (9 edificios).
		edificios[9].setPosition(15, 0.0, -15);
		edificios[9].rotateY(-90);
        edificios[9].updateModelMatrix(); 
		edificios[10].setPosition(15, 0, -10);
		edificios[10].rotateY(-90);
		edificios[10].updateModelMatrix();
		edificios[11].setPosition(15, 0, 0);
		edificios[11].rotateY(-90);
		edificios[11].updateModelMatrix();
		edificios[12].setPosition(15, 0, 15);
		edificios[12].rotateY(-90);
        edificios[12].updateModelMatrix();
		edificios[13].setPosition(15, 0, 20);
		edificios[13].rotateY(-90);
		edificios[13].updateModelMatrix();
		edificios[14].setPosition(15, 0, 30);
		edificios[14].rotateY(-90);
        edificios[14].updateModelMatrix();
		edificios[15].setPosition(15, 0, 45);
		edificios[15].rotateY(-90);
        edificios[15].updateModelMatrix(); 
		edificios[16].setPosition(15, 0, 50);
		edificios[16].rotateY(-90);
        edificios[16].updateModelMatrix();
		edificios[17].setPosition(15, 0, 60);
		edificios[17].rotateY(-90);
		edificios[17].updateModelMatrix();
		
		// Seccion W (5 edificios).
		
		edificios[18].setPosition(-15,0.0,-15);
        edificios[18].updateModelMatrix(); 
		edificios[19].setPosition(-10,0.0,-15);
		edificios[19].updateModelMatrix();
		edificios[20].setPosition(0,0.0,-15);
		edificios[20].updateModelMatrix();

		// Seccion S (3 edificios).
		
		edificios[21].setPosition(15,0.0,75);
		edificios[21].rotateY(180);
        edificios[21].updateModelMatrix(); 
		edificios[22].setPosition(10,0.0,75);
		edificios[22].rotateY(180);
		edificios[22].updateModelMatrix();
		edificios[23].setPosition(0,0.0,75);
		edificios[23].rotateY(180);
		edificios[23].updateModelMatrix();
		

        for (let i = 0; i < 24; i++) {
			sceneObjects.push(edificios[i]);
		}
    }
	
	
    // Creacion de faroles.
    function CrearFaroles() {
		for (var i = 0; i < 12; i++)
            faroles[i] = new SceneObject(gl, faroGeometry, farolesMaterial, [plazaTextureColor])

        faroles[ 0].setPosition(-9.5, 0, -9.5)
		faroles[ 0].updateModelMatrix()
        faroles[ 1].setPosition(-9.5, 0, 10.25)
		faroles[ 1].updateModelMatrix()
        faroles[ 2].setPosition(-9.5, 0, 30)
		faroles[ 2].updateModelMatrix()
        faroles[ 3].setPosition(-9.5, 0, 49.75)
        faroles[ 3].updateModelMatrix()
        faroles[ 4].setPosition(-9.5, 0, 69.5)
		faroles[ 4].updateModelMatrix()

		faroles[ 5].setPosition(0.0, 0, -9.5)
		faroles[ 5].updateModelMatrix()
		faroles[ 6].setPosition(0.0, 0, 69.5)
		faroles[ 6].updateModelMatrix()
		
		faroles[ 7].setPosition(9.5, 0, -9.5)
		faroles[ 7].updateModelMatrix()
		faroles[ 8].setPosition(9.5, 0, 10.25)
        faroles[ 8].updateModelMatrix()
        faroles[ 9].setPosition(9.5, 0, 30)
        faroles[ 9].updateModelMatrix()
        faroles[10].setPosition(9.5, 0, 49.75)
        faroles[10].updateModelMatrix()
        faroles[11].setPosition(9.5, 0, 69.5)
        faroles[11].updateModelMatrix()
        
        
        for (let i = 0; i < 12; i++) {
			sceneObjects.push(faroles[i]);
		}
        
	}
	
    // Creacion de bancos.
    function CrearBancos() {
		for (var i = 0; i < 9; i++)
            bancos[i] = new SceneObject(gl, bancosGeometry, bancosMaterial, [maderaTextureColor])

        // Seccion W (3 bancos). 
		bancos[0].rotateY(90)
		bancos[0].setPosition(-8, 0.0, 0.0)
		bancos[0].updateModelMatrix()
		bancos[1].rotateY(90)
		bancos[1].setPosition(-8, 0.0, 19.75)
		bancos[1].updateModelMatrix()
		bancos[2].rotateY(90)
		bancos[2].setPosition(-8, 0.0, 39.5)
        bancos[2].updateModelMatrix()
		bancos[3].rotateY(90)
		bancos[3].setPosition(-8, 0.0, 59.25)
		bancos[3].updateModelMatrix()
		
		bancos[4].rotateY(-90)
		bancos[4].setPosition(8, 0.0, 0.0)
		bancos[4].updateModelMatrix()
		bancos[5].rotateY(-90)
        bancos[5].setPosition(8, 0.0, 19.75)
        bancos[5].updateModelMatrix()
		bancos[6].rotateY(-90)
		bancos[6].setPosition(8, 0.0, 39.5)
        bancos[6].updateModelMatrix()
		bancos[7].rotateY(-90)
		bancos[7].setPosition(8, 0.0, 59.25)
		bancos[7].updateModelMatrix()
		
		bancos[8].rotateY(180)
		bancos[8].setPosition(0.0, 0.0, 65)
        bancos[8].updateModelMatrix()
        
        for (let i = 0; i < 9; i++) {
			sceneObjects.push(bancos[i]);
		}
        
	}

	/**************************************************************************************************** */
	
	// Configuracion de Listeners
	const rotartorre = document.getElementById("range_torre")
	rotartorre.addEventListener("input", rotar_torre)

	const rotardirigible = document.getElementById("range_dirigible")
	rotardirigible.addEventListener("input", rotar_dirigible)

	const rotarorbita = document.getElementById("range_orbita")
	rotarorbita.addEventListener("input", rotar_orbita)

	const phiCamara = document.getElementById("range_phi")
	phiCamara.addEventListener("input", change_phi)

	const zoomCamara = document.getElementById("range_zoom")
	zoomCamara.addEventListener("input", zoom)

	const thetaCamara = document.getElementById("range_theta")
	thetaCamara.addEventListener("input", theta)

	const selectedCamera = document.getElementById("camara_seleccionada")
	selectedCamera.addEventListener("input", selectCamera)

	function rotar_orbita() {
		let angulo = parseFloat(rotarorbita.value);
		dirigibleModelMatrix = mat4.create()
		// Y los aplicamos sobre su matriz de modelo
		mat4.rotateY(dirigibleModelMatrix, dirigibleModelMatrix, angulo * Math.PI / 180)
		mat4.translate(dirigibleModelMatrix, dirigibleModelMatrix, [10.0, 10.0, 0.0])

	}
	
	function rotar_dirigible() {

		// actualización del ángulo actual ya que éste cambió al valor del slider
		let angulo_nuevo = parseFloat(rotardirigible.value);
		let i = angulo_viejo_rotacion;
		if (angulo_viejo_rotacion < angulo_nuevo) {
			// el ángulo nuevo es mayor, entonces se rota en sentido antihorario
			while (i <= angulo_nuevo) {
				// ya que el slider no recorre todos los valores entre dos estados, se fuerza a que lo haga para obtener un recorrido suave
				mat4.rotateX(dirigibleModelMatrix, dirigibleModelMatrix, 1 * Math.PI / 180);
				i++;
			}
		}
		if (angulo_viejo_rotacion > angulo_nuevo) {
			// el ángulo nuevo es menor, entonces se rota en sentido horario
			while (i >= angulo_nuevo) {
				// ya que el slider no recorre todos los valores entre dos estados, se fuerza a que lo haga para obtener un recorrido suave
				mat4.rotateX(dirigibleModelMatrix, dirigibleModelMatrix, -1 * Math.PI / 180);
				i--;
			}
		}
		// actualización del ángulo actual ya que éste cambió al valor del slider
		angulo_viejo_rotacion = angulo_nuevo;

	}


	function rotar_torre() {
		let angulo = parseFloat(rotartorre.value);
		towerModelMatrix = mat4.create()
		// Y los aplicamos sobre su matriz de modelo
		mat4.rotateY(towerModelMatrix, towerModelMatrix, angulo * Math.PI / 180)
	}

	function change_phi() {
		let phiValue = parseFloat(phiCamara.value)
		camera.phi = (phiValue * Math.PI / 180)
	}

	function zoom() {
		let radius = parseFloat(zoomCamara.value)
		camera.radius = radius
	}

	function theta() {
		let thetaValue = parseFloat(thetaCamara.value)
		camera.theta = (thetaValue * Math.PI / 180)
	}

	function selectCamera() {
		if (selectedCamera.value == 1) {
			automaticCamera = true
		}
		else {
			automaticCamera = false
		}
	}

}




