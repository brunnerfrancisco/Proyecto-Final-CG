// Funciones Auxiliares

export function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {

    // Shaders de vertices y fragmentos
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    // Programa de shaders
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Chequeamos que el programa se haya creado con exito
    const linkedSuccessfully = gl.getProgramParameter(program, gl.LINK_STATUS)

    if ( ! linkedSuccessfully ) {
        // Obtenemos el log generado al intentar crear el program y lo mostramos
        const programLog = gl.getProgramInfoLog(program)
        console.group("Shaders Program Log")
        console.log(programLog)
        console.groupEnd()
    }

    return program
}

export function createShader(gl, type, sourceCode) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, sourceCode)
    gl.compileShader(shader)

    // Chequeamos que el shader haya compilado con exito
    const compiledSuccessfully = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

    if ( ! compiledSuccessfully ) {
        // Obtenemos el log generado por el compilador de shaders y lo mostramos
        const shaderLog = gl.getShaderInfoLog(shader)
        console.group(type === gl.VERTEX_SHADER ? "Vertex Shader Logs" : "Fragment Shader Logs")
        console.log(shaderLog)
        console.groupEnd()
    }

    return shader
}

export function createVertexBuffer(gl, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return buffer
}

export function createIndexBuffer(gl, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    return buffer
}

export function addAttributeToBoundVertexArray(gl, attributeLocation, attributeBuffer, attributeSize) {
    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer)
    gl.vertexAttribPointer(attributeLocation, attributeSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.enableVertexAttribArray(attributeLocation)
}

export function toSpherical({ x, y, z }) {
    const radius = Math.sqrt(x * x + y * y + z * z) // distancia al origen
    const theta  = Math.atan(x / z)                 // angulo horizontal alrededor del eje y (partiendo del eje z positivo, en sentido anti-horario)
    const phi    = Math.acos(y / radius)            // angulo vertical desde el eje y positivo

    return { radius, theta, phi }
}

export function toCartesian({ radius, theta, phi }) {
    const x = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.cos(theta)

    return { x, y, z }
}

export function toDegrees(radians) {
    return radians * 180 / Math.PI
}

export function toRadians(degrees) {
    return degrees * Math.PI / 180
}

export function limitToRange(value, min, max) {
    return Math.max(Math.min(value, max), min)
}

export async function getFileContentsAsText(url) {
    const response = await fetch(url)
    const text     = await response.text()

    return text
}
