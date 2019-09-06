import { vec3 } from "/libs/gl-matrix/index.js";
export class FpsCameraControls {

    constructor(camera, registerZone) {
        this.dragFactor = 0.008  // sensibilidad del drag
        this.zoomFactor = 0.01   // sensibilidad del zoom
        this.middleDragging = false
        this.lastX = 0
        this.lastY = 0
        this.currentX = 0
        this.currentY = 0
        this.camera = camera
        this.registerZone = registerZone
        this.leftClicked = false
        this.leftDragging = false
        this.pickedObject = null
        this.moveLeft = false
        this.moveRight = false
        this.moveForward = false
        this.moveBackward = false

        this.registerZone.addEventListener("wheel", (event) => { this.zoom(event) }, { passive: true })
        this.registerZone.addEventListener("mousedown", (event) => { this.dragStart(event) })
        document.addEventListener("mousemove", (event) => { this.dragMove(event) })
        document.addEventListener("mouseup", (event) => { this.dragEnd(event) })

        document.addEventListener('keydown', (event) => { this.keydownHandler(event) });
        document.addEventListener('keyup', (event) => { this.keyupHandler(event) });
    }

    zoom(event) {
        if (this.pickedObject) {
            let changeZ = event.deltaY * this.zoomFactor / 4
            let aux = vec3.create();
            vec3.mul(aux, this.camera.forward, [changeZ, changeZ, changeZ]);
            vec3.add(this.pickedObject.position, this.pickedObject.position, aux);
            this.pickedObject.updateModelMatrix;
        } else {
            this.camera.setFov(this.camera.getFov() + (event.deltaY * this.zoomFactor) * Math.PI / 180);
        }
    }

    dragStart(event) {
        event.preventDefault()
        const leftClick = 1
        const middleClick = 2;
        this.actPos(event);
        if (event.which === middleClick) {
            this.middleDragging = true
        }
        if (event.which === leftClick) {
            this.leftClicked = true;
            this.leftDragging = true;
        }
    }

    dragMove(event) {
        this.actPos(event)
        const mouseChangeX = this.currentX - this.lastX;
        const mouseChangeY = -(this.currentY - this.lastY);
        if (this.middleDragging) {
            this.camera.arcHorizontally(- mouseChangeX * this.dragFactor)
            this.camera.arcVertically(mouseChangeY * this.dragFactor)
        }
        //if(this.leftDragging){
        if (this.pickedObject != null) {
            let attX = vec3.distance(this.pickedObject.position, this.camera.position) / (0.7 * this.registerZone.width / this.camera.fov); //variamos el movimiento con la distancia
            let attY = vec3.distance(this.pickedObject.position, this.camera.position) / (this.registerZone.height / this.camera.fov); //variamos el movimiento con la distancia
            const changeX = (mouseChangeX) * attX; //atenuamos el movimiento del mouse
            const changeY = -(mouseChangeY) * attY;
            let aux1 = vec3.create();
            vec3.mul(aux1, this.camera.right, [changeX, changeX, changeX]);
            let aux2 = vec3.create();
            vec3.mul(aux2, this.camera.up, [changeY, changeY, changeY]);
            let aux3 = vec3.create();
            vec3.add(aux3, aux2, aux1);
            vec3.add(aux3, aux3, this.pickedObject.position)
            this.pickedObject.position = aux3;
            this.pickedObject.updateModelMatrix();
        }
        //}
    }

    dragEnd(event) {
        this.middleDragging = false;
        this.lastX = this.currentX;
        this.lastY = this.currentY;
        if (event.which === 1) {
            this.leftDragging = false;
            this.pickedObject = null;
        }
    }

    actPos(event) {//Devuelve la posicion XY del canvas tomando el 0,0 como la esquina superior izquierda
        this.lastX = this.currentX;
        this.lastY = this.currentY;
        let rect = this.registerZone.getBoundingClientRect();
        this.currentX = event.clientX - rect.left;
        this.currentY = rect.bottom - event.clientY - rect.top;

    }

    keydownHandler(e) {//activa los movimientos segun la tecla apretada
        switch (e.keyCode) {
            case (32): {
            this.leftClicked = !this.pickedObject;
                this.leftDragging = this.pickedObject;
                if (this.pickedObject != null) { this.pickedObject = null; }
                break;
            } //spacebar
            case (65): { this.moveLeft = true; break; } //a
            case (68): { this.moveRight = true; break; } //d
            case (83): { this.moveBackward = true; break; } //s
            case (87): { this.moveForward = true; break; } //w
        }
    }
    keyupHandler(e) {//desactiva los movimientos segun la tecla soltada
        switch (e.keyCode) {
            case (65): { this.moveLeft = false; break; } //a
            case (68): { this.moveRight = false; break; } //d
            case (83): { this.moveBackward = false; break; } //s
            case (87): { this.moveForward = false; break; } //w
        }
    }
    move() {//movemos la camara
        let x = 0.0;
        let z = 0.0;
        if (this.moveRight) {
            x += 0.1;
        }
        if (this.moveLeft) {
            x += -0.1;
        }
        if (this.moveForward) {
            z += 0.1;
        }
        if (this.moveBackward) {
            z += -0.1;
        }
        this.camera.moveRight(x);
        this.camera.moveForward(z);

        if (this.pickedObject != null) {//si tenemos un objeto pickeado, lo arrastramos junto a la camara
            let aux1 = vec3.create();
            vec3.mul(aux1, this.camera.forward, [z, z, z]);

            let aux2 = vec3.create();
            vec3.mul(aux2, this.camera.right, [x, x, x]);

            let aux3 = vec3.create();
            vec3.add(aux3, aux2, aux1);
            vec3.add(aux3, aux3, this.pickedObject.position)
            this.pickedObject.position = aux3;
            this.pickedObject.updateModelMatrix();
        }
    }
}
