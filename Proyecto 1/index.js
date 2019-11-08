import { mat4, vec4 } from "/libs/gl-matrix/index.js";
import { getFileContentsAsText, loadImage, toRadians } from "/libs/utils.js";
import { FpsCamera, FpsCameraControls, Geometry, Material, SceneLight, Program, SceneObject } from "/libs/gl-engine/index.js";
import { parse } from "/libs/gl-engine/parsers/obj-parser.js";

main();

async function main() {
	var angulo_viejo_rotacion = 0
	var automaticCamera = false
	var lastDrawTime = 0 

	const colorAnt = [255/255, 132/255, 0/255];
	const colorLuz = [0.5*255/255,0.5*236/255,0.5*219/255];

	// #️⃣ Configuracion base de WebGL;
	const canvas = document.getElementById("webgl-canvas")
	const gl = canvas.getContext("webgl2")
	gl.clearColor(0, 0, 0, 1)
	gl.enable(gl.DEPTH_TEST)
	
	// #️⃣ Creamos las camaras y sus controles
	var camera = new FpsCamera()
	var CameraControls = new FpsCameraControls(camera, canvas)
	camera.setPosition(0.0, 1.8, 30.0)

	//Texturas
	const torreTextureColor = gl.createTexture()

	const faroTextureColor = gl.createTexture()

	const plazaTextureColor = gl.createTexture()

	const asfaltoTextureColor = gl.createTexture()

	const veredaTextureColor = gl.createTexture()

	const vereda2TextureColor = gl.createTexture()

	const maderaTextureColor = gl.createTexture()

	const edificioATextureColor = gl.createTexture()

	const edificioBTextureColor = gl.createTexture()

	const edificioPruebaTexture = gl.createTexture()

	const edificioPruebaTextureBlue = gl.createTexture()

	const edificioPruebaTextureNormal = gl.createTexture()

	const skyTexture = gl.createTexture()

	const focoTexture = gl.createTexture()

	armarTextura(torreTextureColor, await loadImage("/textures/iron.jpg"))
	armarTextura(faroTextureColor, await loadImage("/textures/iron.jpg"))

	armarTextura(plazaTextureColor, await loadImage("/textures/baldosas.jpg"))

	armarTextura(asfaltoTextureColor, await loadImage("/textures/asfalto.jpg"))

	armarTextura(veredaTextureColor, await loadImage("/textures/baldosas.jpg"))

	armarTextura(vereda2TextureColor, await loadImage("/textures/grass.jpg"))

	armarTextura(maderaTextureColor, await loadImage("/textures/madera.jpg"))

	armarTextura(edificioATextureColor, await loadImage("/textures/edificioa.jpg"))
	
	armarTextura(edificioBTextureColor, await loadImage("/textures/edificiob.jpg"))

	armarTextura(edificioPruebaTexture,await loadImage('/textures/houseSF.png'))

	armarTextura(edificioPruebaTextureBlue,await loadImage('/textures/houseSF_blue.png'))

	armarTextura(edificioPruebaTextureNormal,await loadImage('/textures/houseSF_NM.png'))
	
	armarTextura(skyTexture,await loadImage('/textures/noche.jpg'))

	armarTextura(focoTexture,await loadImage('/textures/glass.jpg'))

	// Cargamos los obj
	const torreGeometryData = await parse("/models/torre_nuevo.obj")
	const plazaGeometryData = await parse("/models/plano.obj")
	const asfaltoGeometryData = await parse("/models/plano6.obj")
	const veredaGeometryData = await parse("/models/plano7.obj")
	const vereda2GeometryData = await parse("/models/plano9.obj")

	const edificioaGeometryData = await parse("/models/edificioa_nuevo.obj")
	const edificiobGeometryData = await parse("/models/edificiob_nuevo.obj")
	const edificiocGeometryData = await parse("/models/edificioc_nuevo.obj")
	const bancosGeometryData = await parse("/models/banco_nuevo.obj")
	const faroGeometryData = await parse("/models/faro.obj")
	const dirigibleGeometryData = await parse("/models/dirigible_nuevo.obj")
	const skyGeometryData = await parse( "/models/dome.obj" )
	const edificioPruebaGeometryData = await parse( "/models/houseSF_nuevo.obj" )
	const focoGeometryData = await parse( "/models/focon.obj")

	// Cargamos los Shaders
	const textureVertexShaderSource = await getFileContentsAsText("/shaders/texture.vs.glsl")
	const textureFragmentShaderSource = await getFileContentsAsText("/shaders/texture.fs.glsl")

	const objectsVertexShaderSource = await getFileContentsAsText("/shaders/shaderB.vs.glsl")
	const objectsFragmentShaderSource = await getFileContentsAsText("/shaders/shaderB.fs.glsl")

	const proceduralVertexShaderSource = await getFileContentsAsText( "/shaders/procedural.vs.glsl" )
	const proceduralFragmentShaderSource = await getFileContentsAsText( "/shaders/procedural.fs.glsl" )
	
	const phongTVertexShaderSource = await getFileContentsAsText( '/shaders/phongT.vs.glsl' )
	const phongTFragmentShaderSource = await getFileContentsAsText( '/shaders/phongT.fs.glsl' )

	const phongMVertexShaderSource = await getFileContentsAsText( '/shaders/phongM.vs.glsl' )
	const phongMFragmentShaderSource = await getFileContentsAsText( '/shaders/phongM.fs.glsl' )

	const TexturaVertexShaderSource = await getFileContentsAsText( '/shaders/Textura.vs.glsl' )
	const TexturaFragmentShaderSource = await getFileContentsAsText( '/shaders/Textura.fs.glsl' )
	
	const cookTorranceTNVertexShaderSource = await getFileContentsAsText( '/shaders/cooktorranceTN.vs.glsl' )
	const cookTorranceTNFragmentShaderSource = await getFileContentsAsText( '/shaders/cooktorranceTN.fs.glsl' )
	
	const cookTorranceVertexShaderSource = await getFileContentsAsText( '/shaders/cooktorrance.vs.glsl' )
    const cookTorranceFragmentShaderSource = await getFileContentsAsText( '/shaders/cooktorrance.fs.glsl' )

	// #️⃣ Programas
	const programTexture = new Program(gl, textureVertexShaderSource, textureFragmentShaderSource)
	const programObjects = new Program(gl, objectsVertexShaderSource, objectsFragmentShaderSource)
	const proceduralProgram = new Program( gl, proceduralVertexShaderSource, proceduralFragmentShaderSource )
	const phongTProgram = new Program( gl, phongTVertexShaderSource, phongTFragmentShaderSource )
	const phongMProgram = new Program( gl, phongMVertexShaderSource, phongMFragmentShaderSource )
	const TexturaProgram = new Program( gl, TexturaVertexShaderSource, TexturaFragmentShaderSource )
	const cookTorranceTNProgram = new Program( gl, cookTorranceTNVertexShaderSource, cookTorranceTNFragmentShaderSource )
	const cookTorranceProgram = new Program( gl, cookTorranceVertexShaderSource, cookTorranceFragmentShaderSource )

	// Geometrias
	const torreGeometry = new Geometry(gl, torreGeometryData)
	const plazaGeometry = new Geometry(gl, plazaGeometryData)
	const asfaltoGeometry = new Geometry(gl, asfaltoGeometryData)
	const veredaGeometry = new Geometry(gl, veredaGeometryData)
	const vereda2Geometry = new Geometry(gl, vereda2GeometryData)
	const edificioaGeometry = new Geometry(gl, edificioaGeometryData)
	const edificiobGeometry = new Geometry(gl, edificiobGeometryData)
	const edificiocGeometry = new Geometry(gl, edificiocGeometryData)
	const bancosGeometry = new Geometry(gl, bancosGeometryData)
	const faroGeometry = new Geometry(gl, faroGeometryData)
	const dirigibleGeometry = new Geometry(gl, dirigibleGeometryData)
	const skyGeometry = new Geometry( gl, skyGeometryData )
	const edificioPruebaGeometry = new Geometry( gl, edificioPruebaGeometryData )
	const focoGeometry = new Geometry( gl, focoGeometryData )

	// Materiales
	const torreMaterial = new Material(cookTorranceProgram, true, false,
		{ kd: [0.39,0.14,0.14] ,ks: [0.39,0.14,0.14], m: 0.05, f0: 0.5, sigma: 0.1 })
	const plazaMaterial = new Material( phongTProgram, true, true, { texture0: 0, shininess: 0.0} )
	const asfaltoMaterial = new Material( phongTProgram, true, true, { texture0: 0, shininess: 0.0} )
	const veredaMaterial = new Material( phongTProgram, true, true, { texture0: 0, shininess: 0.0} )
	const vereda2Material = new Material( phongTProgram, true, true, { texture0: 0, shininess: 0.0} )
	const edificioaMaterial = new Material(phongTProgram, true, true, { texture0: 0 })
	const edificiobMaterial = new Material(phongTProgram, true, true, { texture0: 0 })
	const edificiocMaterial = new Material(phongTProgram, true, true, { texture0: 0 })
	const farolesMaterial = new Material(phongTProgram, true, true, 
		{ kd: [0.50754,0.50754,0.50754] ,ks: [0.508273,0.2,0.2], sigma: 51.2, CoefEspec:1.0, texture0: 0 })
	const skyMaterial = new Material( TexturaProgram, false, true, { texture0: 0} )
	const dirigibleMaterial = new Material(programObjects, true, false, { texture0: 0 })
	const woodpileMaterial = new Material( proceduralProgram, true, false, 
		{  kd: [0.52156862745,0.36862745098,0.25882352941], shininess: 1, resolution: [0.64,0.5]} )
	const edfificioPruebaMaterial = new Material(cookTorranceTNProgram, true, true,
		{ texture0: 0, texture1: 1, m: 0.3, f0: 0.99, sigma: 0.1 })

	const focoMaterial = new Material( phongMProgram, true, false, { ka: [1.0,1.0,1.0], kd: [0.5,0.5,0.5] ,ks: [0.5,0.5,0.5], shininess: 11.22} )

	// #️⃣ Descripcion de los objetos de la escena:
	const torreObjeto = new SceneObject(gl, torreGeometry, torreMaterial, [torreTextureColor])
	torreObjeto.setPosition(0.0, 0.0, 0.0)
	torreObjeto.updateModelMatrix()

	const plazaObjeto = new SceneObject(gl, plazaGeometry, plazaMaterial, [plazaTextureColor])
	plazaObjeto.setPosition(0.0, 0.0, 30.0)
	plazaObjeto.updateModelMatrix()

	const asfaltoObjeto = new SceneObject(gl, asfaltoGeometry, asfaltoMaterial, [asfaltoTextureColor])
	asfaltoObjeto.setPosition(0.0, 0.1, 30.0)
	asfaltoObjeto.updateModelMatrix()

	const veredaObjeto = new SceneObject(gl, veredaGeometry, veredaMaterial, [veredaTextureColor])
	veredaObjeto.setPosition(0.0, 0.12, 30.0)
	veredaObjeto.updateModelMatrix()
	const vereda2Objeto = new SceneObject(gl, vereda2Geometry, vereda2Material, [vereda2TextureColor])
	vereda2Objeto.setPosition(0.0, 0.123, 30.0)
	vereda2Objeto.updateModelMatrix()
	
	const dirigibleObjeto = new SceneObject(gl, dirigibleGeometry, dirigibleMaterial, [plazaTextureColor])
	dirigibleObjeto.rotateY(-90)
	dirigibleObjeto.setPosition(0.0, 25.0, 30.0)
	dirigibleObjeto.updateModelMatrix()

	const edificioPruebaObjeto = new SceneObject(gl, edificioPruebaGeometry, edfificioPruebaMaterial, 
		[edificioPruebaTexture, edificioPruebaTextureNormal])
	edificioPruebaObjeto.setPosition(0.0,0.0,15.0)
	edificioPruebaObjeto.rotateY(-90)
	edificioPruebaObjeto.updateModelMatrix()

	const sky = new SceneObject( gl, skyGeometry, skyMaterial, [skyTexture] )

	const sceneObjects = [torreObjeto, plazaObjeto, sky, asfaltoObjeto, veredaObjeto,vereda2Objeto /*edificioPruebaObjeto*/ ]
	
	const edificios = []
	const edificiosPositions = []
	const faroles = []
	const farolesPositions = []
	const bancos = []
	const bancosPositions = []
	const focos = []

	CrearEdificios()
	CrearFaroles()
	CrearBancos()

	// Seteamos la luz SceneLight(position,color,spot_direction,spot_cutoff,model)
	const lightDirectional = new SceneLight( [0.5, -1.0, -1.0, 0.0], [0.5*255/255,0.5*236/255,0.5*219/255], [0.5, -1.0, 0.0, 0.0], -1.0 )
	//lightDirectional.position = [0.0, -1.0, 0.0, 0.0]
    //lightDirectional.color = [0.01*210/255,0.01*223/255,0.01*255/255]
	var sceneLights = [lightDirectional]
	
	const lightFaroles=[]
	const lightFarolesPositions=[]

	CrearLucesFaroles()
	
	const sliderA1 = document.getElementById("sliderA1");
	
	sliderA1.addEventListener("input", updateFaroles);
	

	ambientenoche.addEventListener("click", async () => {
		
		armarTextura(skyTexture,await loadImage('/textures/noche.jpg'))
		for( let i = 0; i < 12 ; i++ ){
			lightFaroles[i].color = [255/255, 132/255, 0/255]
		} 
		lightDirectional.color = [0.5*255/255,0.5*236/255,0.5*219/255] //5400k
		lightDirectional.position = [0.0, -1.0, 0.0, 0.0]
    })
	ambienteatardecer.addEventListener("click", async () => {
		
		armarTextura(skyTexture,await loadImage('/textures/atardecer.jpg'))
		for( let i = 0; i < 12 ; i++ ){
			lightFaroles[i].color = [(0.5*255/255)/2,(0.5*177/255)/2,(0.5*110/255)/2]
		} 
		lightDirectional.color = [0.5*255/255,0.5*177/255,0.5*110/255] //3000k
        lightDirectional.position = [0.5, -0.1, -1.0, 0.0]  
    })
	ambientedia.addEventListener("click", async () => {
		
		armarTextura(skyTexture,await loadImage('/textures/soleado.jpg'))
		for( let i = 0; i < 12 ; i++ ){
			lightFaroles[i].color = [0/255,0/255,0/255]
		} 
		lightDirectional.color = [0.5*255/255,0.5*236/255,0.5*219/255] //9000k;
		lightDirectional.position = [0.5, -1.0, -1.0, 0.0]
    })
	

	//sceneLights.push(light_faroles[0])

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
					object.material.program.setUniformValue("numLights", i)
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
		// Seccion D (9 edificios). (90)
		edificiosPositions.push([-15, 0.0, 15])
        edificiosPositions.push([-15, 0.0, 10])
		edificiosPositions.push([-15, 0.0,  0])
		
		edificiosPositions.push([-15, 0.0, 45])
        edificiosPositions.push([-15, 0.0, 40])
		edificiosPositions.push([-15, 0.0, 30])
		
		edificiosPositions.push([-15, 0.0, 75])
		edificiosPositions.push([-15, 0.0, 70])
		edificiosPositions.push([-15, 0.0, 60])
		 
		// Seccion A (9 edificios).(-90)
		edificiosPositions.push([15, 0.0, -15])
		edificiosPositions.push([15, 0.0, -10])
		edificiosPositions.push([15, 0.0,   0])

		edificiosPositions.push([15, 0.0,  15])
		edificiosPositions.push([15, 0.0,  20])
		edificiosPositions.push([15, 0.0,  30])
		
		edificiosPositions.push([15, 0.0,  45])
		edificiosPositions.push([15, 0.0,  50])
		edificiosPositions.push([15, 0.0,  60])
		
		// Seccion W (5 edificios). (180)
		
		edificiosPositions.push([15, 0.0, 75])
		edificiosPositions.push([10, 0.0, 75])
		edificiosPositions.push([ 0, 0.0, 75])

		// Seccion S (3 edificios). (0)
		
		edificiosPositions.push([-15, 0.0, -15])
        edificiosPositions.push([-10, 0.0, -15])
		edificiosPositions.push([  0, 0.0, -15])


		for (var i = 0; i < 24; i=i+3){
			edificios[i] = new SceneObject(gl, edificioaGeometry, edificioaMaterial, [edificioATextureColor])
		
			edificios[i+1] = new SceneObject(gl, edificiobGeometry, edificiobMaterial, [edificioBTextureColor])
		
			edificios[i+2] = new SceneObject(gl, edificiocGeometry, edificiocMaterial, [edificioBTextureColor])

			if(i < 9){
				edificios[i].rotateY(90)
				edificios[i+1].rotateY(90)
				edificios[i+2].rotateY(90)
			}else if(i < 18){
				edificios[i].rotateY(-90)
				edificios[i+1].rotateY(-90)
				edificios[i+2].rotateY(-90)
			}else if(i < 21){
				edificios[i].rotateY(180)
				edificios[i+1].rotateY(180)
				edificios[i+2].rotateY(180)
			}

			var x,y,z
			x = edificiosPositions[i][0]
			y = edificiosPositions[i][1]
			z = edificiosPositions[i][2]
			edificios[i].setPosition(x,y,z)
			
			x = edificiosPositions[i+1][0]
			y = edificiosPositions[i+1][1]
			z = edificiosPositions[i+1][2]
			edificios[i+1].setPosition(x,y,z)
			
			x = edificiosPositions[i+2][0]
			y = edificiosPositions[i+2][1]
			z = edificiosPositions[i+2][2]
			edificios[i+2].setPosition(x,y,z)

			edificios[i].updateModelMatrix()
			edificios[i+1].updateModelMatrix()
			edificios[i+2].updateModelMatrix()
			
			sceneObjects.push(edificios[i])
			sceneObjects.push(edificios[i+1])
			sceneObjects.push(edificios[i+2])
		}
    }
	
	
    // Creacion de faroles.
    function CrearFaroles() {
		
		farolesPositions.push([-9.0, 0.123, -9.5 ])
		farolesPositions.push([-9.0, 0.123, 10.25])
		farolesPositions.push([-9.0, 0.123, 30   ])
		farolesPositions.push([-9.0, 0.123, 49.75])
		farolesPositions.push([-9.0, 0.123, 69.5 ])
		farolesPositions.push([ 0.0, 0.123, -9.5 ])
		farolesPositions.push([ 0.0, 0.123, 69.5 ])
		farolesPositions.push([ 9.0, 0.123, -9.5 ])
		farolesPositions.push([ 9.0, 0.123, 10.25])
		farolesPositions.push([ 9.0, 0.123, 30.0 ])
		farolesPositions.push([ 9.0, 0.123, 49.75])
		farolesPositions.push([ 9.0, 0.123, 69.5 ])
		
		for (var i = 0; i < 12; i++){
			faroles[i] = new SceneObject(gl, faroGeometry, farolesMaterial, [faroTextureColor])
			var x = farolesPositions[i][0]
			var y = farolesPositions[i][1]
			var z = farolesPositions[i][2]
			faroles[i].setPosition(x,y,z)
			faroles[i].updateModelMatrix()
			sceneObjects.push(faroles[i])
		}

		for (var i = 0; i < 12; i++){
			focos[i] = new SceneObject(gl, focoGeometry, focoMaterial, [focoTexture])
			var x = farolesPositions[i][0]
			var y = farolesPositions[i][1]
			var z = farolesPositions[i][2]
			focos[i].setPosition(x,y+2.1,z)
			focos[i].updateModelMatrix()
			sceneObjects.push(focos[i])
		}
		
	}
	
    // Creacion de bancos.
    function CrearBancos() {
		
		bancosPositions.push([-8, 0.0, 0.0])
		bancosPositions.push([-8, 0.0, 19.75])
		bancosPositions.push([-8, 0.0, 39.5])
		bancosPositions.push([-8, 0.0, 59.25])
		bancosPositions.push([8, 0.0, 0.0])
		bancosPositions.push([8, 0.0, 19.75])
		bancosPositions.push([8, 0.0, 39.5])
		bancosPositions.push([8, 0.0, 59.25])
		bancosPositions.push([0.0, 0.0, 65])
		

		for (var i = 0; i < 9; i++){
			bancos[i] = new SceneObject(gl, bancosGeometry, woodpileMaterial, [])
			if (i < 4){
				bancos[i].rotateY(90)
			}else if (i < 8){
				bancos[i].rotateY(-90)
			}else{
				bancos[i].rotateY(180)
			}
			var x = bancosPositions[i][0]
			var y = bancosPositions[i][1]
			var z = bancosPositions[i][2]
			bancos[i].setPosition(x,y,z)
			bancos[i].updateModelMatrix()
			sceneObjects.push(bancos[i])
		}
	}

	function CrearLucesFaroles(){
		
		lightFarolesPositions.push([-9.0, 2.2, -9.5 , 1.0])
		lightFarolesPositions.push([-9.0, 2.2, 10.25, 1.0])
		lightFarolesPositions.push([-9.0, 2.2, 30   , 1.0])
		lightFarolesPositions.push([-9.0, 2.2, 49.75, 1.0])
		lightFarolesPositions.push([-9.0, 2.2, 69.5 , 1.0])
		lightFarolesPositions.push([ 0.0, 2.2, -9.5 , 1.0])
		lightFarolesPositions.push([ 0.0, 2.2, 69.5 , 1.0])
		lightFarolesPositions.push([ 9.0, 2.2, -9.5 , 1.0])
		lightFarolesPositions.push([ 9.0, 2.2, 10.25, 1.0])
		lightFarolesPositions.push([ 9.0, 2.2, 30.0 , 1.0])
		lightFarolesPositions.push([ 9.0, 2.2, 49.75, 1.0])
		lightFarolesPositions.push([ 9.0, 2.2, 69.5 , 1.0])

		for( let i = 0; i < 12 ; i++ ){
			lightFaroles[i] = new SceneLight(lightFarolesPositions[i],[255/255, 132/255, 0/255],[0.0, 1.0, 0.0, 0.0],-1.0/* Math.cos(toRadians(175)) */,null)
			lightFaroles[i].linear_attenuation = 0.2
			lightFaroles[i].quadratic_attenuation = 0.2
			sceneLights.push(lightFaroles[i])
		} 
	}

	
	function updateFaroles() {
		for( let i = 0; i < 12 ; i++ ){
			lightFaroles[i].color = [parseFloat(sliderA1.value) * colorAnt[0], parseFloat(sliderA1.value) * colorAnt[1], parseFloat(sliderA1.value) * colorAnt[2]];
		} 
	}

	function updateDireccional() {
		lightDirectional.color = [parseFloat(sliderA2.value) * colorLuz[0], parseFloat(sliderA2.value) * colorLuz[1], parseFloat(sliderA2.value) * colorLuz[2]];
	}



	/**************************************************************************************************** */
	
	// Configuracion de Listeners
	/* 
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
 */
}




