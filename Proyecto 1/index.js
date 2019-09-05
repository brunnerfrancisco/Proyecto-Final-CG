import { mat4 } from "/libs/gl-matrix/index.js";
import { getFileContentsAsText, createShaderProgram, createVertexBuffer, createIndexBuffer, addAttributeToBoundVertexArray } from "/libs/utils.js";
import { Camera } from "/libs/gl-engine/Camera.js";
import { CameraMouseControls } from "/libs/gl-engine/CameraMouseControls.js";
import { parse } from "/libs/gl-engine/parsers/obj-parser.js";

main();

async function main() {
    const towerEiffelData = await parse("/models/towerEiffel.obj");

    const towerVertexShaderSource = await getFileContentsAsText("/shaders/basic.vs.glsl");
	const towerFragmentShaderSource = await getFileContentsAsText("/shaders/basic.fs.glsl");

    // #️⃣ Configuracion base de WebGL;
	const canvas = document.getElementById("webgl-canvas");
    const gl = canvas.getContext("webgl2");
    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.DEPTH_TEST)
    
    // #️⃣ Creamos la camara y sus controles

    const camera = new Camera()
    const cameraMouseControls = new CameraMouseControls(camera, canvas)

    // #️⃣ Creamos el programa de shaders y obtenemos la ubicacion de sus variables

    const program = createShaderProgram(gl, towerVertexShaderSource, towerFragmentShaderSource)

    const modelMatrixLocation      = gl.getUniformLocation(program, "modelMatrix")
    const viewMatrixLocation       = gl.getUniformLocation(program, "viewMatrix")
    const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix")
    const colorLocation            = gl.getUniformLocation(program, "color")

    const vertexPositionLocation = gl.getAttribLocation(program, "vertexPosition")

        // #️⃣ Descripcion de los objetos de la escena: seteamos su color, 
        //      inicializamos sus matrices, almacenamos su geometria en buffers, etc
    const towerColor = [1, 1, 1]
    const towerModelMatrix = mat4.create()

    const towerVertexPositionBuffer = createVertexBuffer(gl, towerEiffelData.vertexPositions)

    //const towerIndexBuffer   = createIndexBuffer(gl, towerEiffelData.indexLines)
    //const towerIndexSize     = towerEiffelData.indexLines.length
    const towerIndexDataType = gl.UNSIGNED_SHORT
    //const towerDrawMode      = gl.LINES

    //para pintar los triangulos
    const towerIndexBuffer   = createIndexBuffer(gl, towerEiffelData.indexTriangles)
    const towerIndexSize = towerEiffelData.indexTriangles.length
    const towerDrawMode      = gl.TRIANGLES

    const towerVertexArray = gl.createVertexArray()
    gl.bindVertexArray(towerVertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, towerVertexPositionBuffer, 3)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, towerIndexBuffer)
    gl.bindVertexArray(null)

    // #️⃣ Posicion inicial de cada objeto
    mat4.fromTranslation(towerModelMatrix, [ 0.0, 0.0, 0.0])

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

    requestAnimationFrame(render)

    function render() {
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

        // Solicitamos el proximo frame
        requestAnimationFrame(render)
    }

}