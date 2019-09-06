export class FrameBuffer {
    constructor(gl, [width, height], depthBufferEnabled = true, filtering = gl.LINEAR, wrapping = gl.CLAMP_TO_EDGE) {
        this.gl = gl
        this.width = width
        this.height = height
        this.frameBuffer = gl.createFramebuffer()

        this.bind()

        this.colorTexture = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapping)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapping)
        gl.bindTexture(gl.TEXTURE_2D, null)

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0)

        if (depthBufferEnabled) {
            this.depthRenderBuffer = gl.createRenderbuffer()
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBuffer)
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
            gl.bindRenderbuffer(gl.RENDERBUFFER, null)

            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderBuffer)
        }

        this.unbind()

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) console.warn("Configuracion de Frame Buffer incompleta.")
    }

    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer)
    }

    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    }
}
