import { mat4 } from "/libs/gl-matrix/index.js";
import { getFileContentsAsText, createShaderProgram, createVertexBuffer, createIndexBuffer, addAttributeToBoundVertexArray } from "/libs/utils.js";
import { SphericalCamera, SphericalCameraMouseControls } from "/libs/gl-engine/index.js";
import { parse } from "/libs/gl-engine/parsers/obj-parser.js";

main();

async function main() {
    var angulo_viejo_rotacion = 0
    var automaticCamera = false

    const towerEiffelData = await parse("/models/torre.obj");
    const pisoData = await parse("/models/piso.obj");
    const esferaData = await parse("/models/esfera.obj");
    const dirigibleData = await parse("/models/dirigible.obj");

    const towerVertexShaderSource = await getFileContentsAsText("/shaders/basic.vs.glsl");
    const towerFragmentShaderSource = await getFileContentsAsText("/shaders/basic.fs.glsl");

    // #️⃣ Configuracion base de WebGL;
	const canvas = document.getElementById("webgl-canvas");
    const gl = canvas.getContext("webgl2");
    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.DEPTH_TEST)
    
    //Prueba de obtencion de modulo
    const rotartorre = document.getElementById("range_torre")
    rotartorre.addEventListener("input",rotar_torre)

    const rotardirigible = document.getElementById("range_dirigible")
    rotardirigible.addEventListener("input",rotar_dirigible)

    const rotarorbita = document.getElementById("range_orbita")
    rotarorbita.addEventListener("input",rotar_orbita)

    const phiCamara = document.getElementById("range_phi")
    phiCamara.addEventListener("input",change_phi)

    const zoomCamara = document.getElementById("range_zoom")
    zoomCamara.addEventListener("input",zoom)
    
    const thetaCamara = document.getElementById("range_theta")
    thetaCamara.addEventListener("input",theta)

    const selectedCamera = document.getElementById("camara_seleccionada")
    selectedCamera.addEventListener("input",selectCamera)

    // #️⃣ Creamos las camaras y sus controles
    //********************************************************************** 
    var camera = new SphericalCamera()
    var CameraControls = new SphericalCameraMouseControls(camera, canvas)
    camera.radius= 30;
    
    //camera = new FpsCamera();
    //CameraControls = new FpsCameraControls(camera, canvas);
    //********************************************************************** 
    
    // #️⃣ Elijo como predeterminada la camara fpss
    //********************************************************************** 
    //camera = camerafps;
	//CameraControls = controlesfps;


    // #️⃣ Creamos el programa de shaders y obtenemos la ubicacion de sus variables

    const program = createShaderProgram(gl, towerVertexShaderSource, towerFragmentShaderSource)

    const modelMatrixLocation      = gl.getUniformLocation(program, "modelMatrix")
    const viewMatrixLocation       = gl.getUniformLocation(program, "viewMatrix")
    const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix")
    const colorLocation            = gl.getUniformLocation(program, "color")

    const vertexPositionLocation = gl.getAttribLocation(program, "vertexPosition")

        // #️⃣ Descripcion de los objetos de la escena: seteamos su color, 
        //      inicializamos sus matrices, almacenamos su geometria en buffers, etc
    const towerColor = [ 0.205, 0.127, 0.050 ]
    const pisoColor = [ 0.0, 0.343, 0.057 ]
    const esferaColor = [ 0, 0.66, 1 ]
    const dirigibleColor = [ 0.5, 0.5, 0.5 ]

    var towerModelMatrix = mat4.create()
    var pisoModelMatrix = mat4.create()
    var esferaModelMatrix = mat4.create()
    var dirigibleModelMatrix = mat4.create()

    const towerVertexPositionBuffer = createVertexBuffer(gl, towerEiffelData.vertexPositions)
    const pisoVertexPositionBuffer = createVertexBuffer(gl, pisoData.vertexPositions)
    const esferaVertexPositionBuffer = createVertexBuffer(gl, esferaData.vertexPositions)
    const dirigibleVertexPositionBuffer = createVertexBuffer(gl, dirigibleData.vertexPositions)
  

    const towerIndexBuffer   = createIndexBuffer(gl, towerEiffelData.indexLines)
    const towerIndexSize     = towerEiffelData.indexLines.length
    const towerDrawMode      = gl.LINES
    const towerIndexDataType = gl.UNSIGNED_SHORT

    const dirigibleIndexBuffer   = createIndexBuffer(gl, dirigibleData.indexTriangles)
    const dirigibleIndexSize     = dirigibleData.indexTriangles.length
    const dirigibleDrawMode      = gl.TRIANGLES
    const dirigibleIndexDataType = gl.UNSIGNED_SHORT
    

    //para pintar los triangulos
    //const towerIndexBuffer   = createIndexBuffer(gl, towerEiffelData.indexTriangles)
    //const towerIndexSize = towerEiffelData.indexTriangles.length
    //const towerDrawMode      = gl.TRIANGLES
    //const towerIndexDataType = gl.UNSIGNED_SHORT

    const pisoIndexBuffer   = createIndexBuffer(gl, pisoData.indexTriangles)
    const pisoIndexSize = pisoData.indexTriangles.length
    const pisoDrawMode      = gl.TRIANGLES
    const pisoIndexDataType = gl.UNSIGNED_SHORT

    const esferaIndexBuffer   = createIndexBuffer(gl, esferaData.indexTriangles)
    const esferaIndexSize = esferaData.indexTriangles.length
    const esferaDrawMode      = gl.TRIANGLES
    const esferaIndexDataType = gl.UNSIGNED_SHORT

    const towerVertexArray = gl.createVertexArray()
    gl.bindVertexArray(towerVertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, towerVertexPositionBuffer, 3)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, towerIndexBuffer)
    gl.bindVertexArray(null)

    const pisoVertexArray = gl.createVertexArray()
    gl.bindVertexArray(pisoVertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, pisoVertexPositionBuffer, 3)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pisoIndexBuffer)
    gl.bindVertexArray(null)

    const esferaVertexArray = gl.createVertexArray()
    gl.bindVertexArray(esferaVertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, esferaVertexPositionBuffer, 3)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, esferaIndexBuffer)
    gl.bindVertexArray(null)

    const dirigibleVertexArray = gl.createVertexArray()
    gl.bindVertexArray(dirigibleVertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, dirigibleVertexPositionBuffer, 3)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dirigibleIndexBuffer)
    gl.bindVertexArray(null)

    // #️⃣ Posicion inicial de cada objeto

    mat4.fromTranslation(towerModelMatrix, [ 0.0, 0.0, 0.0])
    mat4.fromTranslation(pisoModelMatrix, [ 0.0, 0.0, 0.0])
    mat4.scale(pisoModelMatrix,pisoModelMatrix, [ 50.0, 50.0, 50.0 ])
    mat4.fromTranslation(esferaModelMatrix, [ 0.0, 0.0, 0.0])
    mat4.scale(esferaModelMatrix,esferaModelMatrix, [ 50.0, 50.0, 50.0 ])
    mat4.fromTranslation(dirigibleModelMatrix, [ 10.0, 10.0, 0.0])
   
   

    // #️⃣ Establecemos el programa de shaders a usar

    gl.useProgram(program)

    /* 📝
     Tener en cuenta que se esta pudiendo setear el programa afuera del render-loop
     solo porque vamos a estar usando el mismo para todos los objetos de la escena
     */

    // #️⃣ Seteamos los valores de los uniforms que sabemos que permaneceran constantes

    gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix)

    /* 📝
     Solo se pueden setear si se tiene algun programa en uso (via gl.useProgram...)
     */

    // #️⃣ Iniciamos el render-loop 🎬
    const rotationSpeed = 45    // 30º por segundo (acordarse de pasar a radianes antes de usar)
    let lastDrawTime = 0        // tiempo en el que se dibujo el ultimo frame
    requestAnimationFrame(render)

    function render(now) {
        //Comandos de la camara.
      //   CameraControls.move();

        // Limpiamos buffers de color y profundidad del canvas antes de empezar a dibujar los objetos de la escena
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Actualizamos los uniforms comunes a todos los objetos de la escena
        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix)

       
        // 🎨 Dibujando la torre

        // Seteamos valores de uniforms especificos al objeto
        gl.uniformMatrix4fv(modelMatrixLocation, false, towerModelMatrix)
        gl.uniform3fv(colorLocation, towerColor)

        // Seteamos info de su geometria
        gl.bindVertexArray(towerVertexArray)

        // Lo dibujamos
        gl.drawElements(towerDrawMode, towerIndexSize, towerIndexDataType, 0)


        // 🎨 Dibujando el piso
        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix)
        // Seteamos valores de uniforms especificos al objeto
        gl.uniformMatrix4fv(modelMatrixLocation, false, pisoModelMatrix)
        gl.uniform3fv(colorLocation, pisoColor)

        // Seteamos info de su geometria
        gl.bindVertexArray(pisoVertexArray)

        // Lo dibujamos
        gl.drawElements(pisoDrawMode, pisoIndexSize, pisoIndexDataType, 0)


        // 🎨 Dibujando la esfera
        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix)
        // Seteamos valores de uniforms especificos al objeto
        gl.uniformMatrix4fv(modelMatrixLocation, false, esferaModelMatrix)
        gl.uniform3fv(colorLocation, esferaColor)

        // Seteamos info de su geometria
        gl.bindVertexArray(esferaVertexArray)

        // Lo dibujamos
        gl.drawElements(esferaDrawMode, esferaIndexSize, esferaIndexDataType, 0)
    
        // 🎨 Dibujando el dirigible
        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix)

        // Seteamos valores de uniforms especificos al objeto
        gl.uniformMatrix4fv(modelMatrixLocation, false, dirigibleModelMatrix)
        gl.uniform3fv(colorLocation, dirigibleColor)

        // Seteamos info de su geometria
        gl.bindVertexArray(dirigibleVertexArray)

        // Lo dibujamos
        gl.drawElements(dirigibleDrawMode, dirigibleIndexSize, dirigibleIndexDataType, 0)

        if(automaticCamera){
            // Seteo los valores para hacer que la torre gire sobre su propio eje.
            now *= 0.001                            // milisegundos -> segundos
            const timeDelta = now - lastDrawTime    // tiempo entre este frame y el anterior
            
            let new_angle = timeDelta * rotationSpeed;

            camera.arcHorizontally(new_angle * Math.PI / 180)

        }
        lastDrawTime = now;
        requestAnimationFrame(render)
    }

   
    function rotar_dirigible() {

	// actualización del ángulo actual ya que éste cambió al valor del slider
            let angulo_nuevo = parseFloat(rotardirigible.value);
            let i = angulo_viejo_rotacion;
            if ( angulo_viejo_rotacion < angulo_nuevo ) {
                // el ángulo nuevo es mayor, entonces se rota en sentido antihorario
                while ( i <= angulo_nuevo ) {
                    // ya que el slider no recorre todos los valores entre dos estados, se fuerza a que lo haga para obtener un recorrido suave
                    mat4.rotateX(dirigibleModelMatrix,dirigibleModelMatrix,1*Math.PI/180);
                    i++;
                }
            }
            if ( angulo_viejo_rotacion > angulo_nuevo ) {
                // el ángulo nuevo es menor, entonces se rota en sentido horario
                while ( i >= angulo_nuevo ) {
                    // ya que el slider no recorre todos los valores entre dos estados, se fuerza a que lo haga para obtener un recorrido suave
                    mat4.rotateX(dirigibleModelMatrix,dirigibleModelMatrix,-1*Math.PI/180);
                    i--;
                }
            }
            // actualización del ángulo actual ya que éste cambió al valor del slider
            angulo_viejo_rotacion = angulo_nuevo;

    }

    function rotar_orbita() {
        let angulo = parseFloat(rotarorbita.value);
        dirigibleModelMatrix = mat4.create()
        // Y los aplicamos sobre su matriz de modelo
        mat4.rotateY(dirigibleModelMatrix, dirigibleModelMatrix, angulo * Math.PI / 180 )
        mat4.translate(dirigibleModelMatrix,dirigibleModelMatrix, [ 10.0, 10.0, 0.0])
        
    }

    function rotar_torre() {
        let angulo = parseFloat(rotartorre.value);
        towerModelMatrix = mat4.create()
        // Y los aplicamos sobre su matriz de modelo
        mat4.rotateY(towerModelMatrix, towerModelMatrix, angulo * Math.PI / 180 )
    }

    function change_phi() {
        let phiValue = parseFloat(phiCamara.value)
        camera.phi = ( phiValue * Math.PI / 180 )
    }

    function zoom(){
        let radius = parseFloat(zoomCamara.value)
        camera.radius = radius
    }

    function theta(){
        let thetaValue = parseFloat(thetaCamara.value)
        camera.theta = ( thetaValue * Math.PI / 180 )
    }

    function selectCamera(){
        if(selectedCamera.value == 1){
            automaticCamera = true
        }
        else{
            automaticCamera = false
        }
    }
}


