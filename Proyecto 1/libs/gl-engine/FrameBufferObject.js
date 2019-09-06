export class FrameBufferObject{

    constructor(context,fbWidth,fbHeight){
        this.gl = context;
        //Creamos el framebuffer
        // A mayor tamaño, mayor la info almacenada en las texturas/buffers creados, pero tambien mayor la penalizacion sobre el rendimiento
        this.frameBufferWidth = fbWidth;
        this.frameBufferHeight = fbHeight;

        // Creamos textura para almacenamiento de info de color de la escena
        this.colorTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.frameBufferWidth, this.frameBufferHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        // Creamos Render Buffer para almacenamiento de info de profundidad de la escena (dado que queremos poder habilitar el test de profundidad)
        this.depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.frameBufferWidth, this.frameBufferHeight);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

        // Unimos la textura y buffer creados en un Frame Buffer, asociando la textura a su salida de color y al buffer a su salida de profundidad
        this.frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.colorTexture, 0);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthRenderBuffer);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Y chequeamos que el Frame Buffer se haya configurado correctamente
        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) console.warn("Configuracion de Frame Buffer incompleta.");
    }

	readPixel(x,y){
		var p = new Uint8Array(4);
		this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, p);
		return p;
	}

	activate(){ 
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    }
	deactivate(){ 
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
	clear(){
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 
	}

}
    
