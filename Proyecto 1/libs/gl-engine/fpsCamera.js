import { mat4, vec3, quat } from "/libs/gl-matrix/index.js"
import { toDegrees, toRadians, limitToRange } from "/libs/utils.js"


const DEFAULT_FORWARD  = [0,0,-1]  
const DEFAULT_RIGHT    = [1,0,0]
const DEFAULT_UP    = [0,1,0]

export class FpsCamera {

    constructor() {
        this.sphericalPosition = { radius: 45, theta: toRadians(0) , phi: toRadians(60) }
        this.position = [0,1,0]
        this.pitch = 0
        this.yaw = 0
        this.forward = [0, 0, -1]
        this.right = [1, 0, 0]
        this.up     = [0, 1, 0]
        this.fov    = toRadians(45)
        this.aspect = 1
        this.near   = 0.1
        this.far    = 100

        this.onPositionChange = () => {} // funcion que se ejecuta ante cada cambio en la posicion de la camara (por defecto una "funcion vacia" o no-op)

        this.viewMatrix = mat4.create()
        this.projectionMatrix = mat4.create()

        this.updateViewMatrix()
        this.updateProjectionMatrix()
    }

    // Setters & Getters

    setYaw(value) {
        this.yaw = ( value === Math.PI * 2 ) ? value : ( value + Math.PI * 2 ) % ( Math.PI * 2 ) // theta: [0, 360]
        this.updateViewMatrix()
    }
    getYaw() {
        return this.yaw
    }

    setPitch(value) {
        this.pitch = limitToRange(value, -Math.PI/2, Math.PI/2) // phi: [0.1, 180]
        this.updateViewMatrix()
    }
    getPitch() {
        return this.pitch
    }

    setPosition(x,y,z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.updateViewMatrix();
    }

    setFov(value) {
        this.fov = value
        this.updateProjectionMatrix()
    }
    getFov() {
        return this.fov
    }
    setTarget(target){
        //no-op, para que no se llene la consola de errores
    }
    // Actualizacion de matrices

    updateViewMatrix() {
        //creamos la matriz de rotacion Rx y rotamos los vectores up, right y forward en X
        let Rx = mat4.create();
        mat4.fromXRotation(Rx,this.pitch);
        //vec3.transformMat4(this.forward,DEFAULT_FORWARD,Rx)
        vec3.transformMat4(this.right,DEFAULT_RIGHT,Rx)
        vec3.transformMat4(this.up,DEFAULT_UP,Rx)
        //creamos la matriz de rotacion Ry y rotamos los vectores up, right y forward en Y
        let Ry = mat4.create();
        mat4.fromYRotation(Ry,this.yaw);
        //vec3.transformMat4(this.forward,this.forward,Ry) //no volamos
        vec3.transformMat4(this.forward,DEFAULT_FORWARD,Ry)
        vec3.transformMat4(this.right,this.right,Ry)
        vec3.transformMat4(this.up,this.up,Ry)
        //creamos la matrix de traslacion T
        let T = mat4.create();
        mat4.fromTranslation(T,this.position);
        //creamos la view matrix a partir de (T*(Ry*Rx))^-1
        let aux = mat4.create()
        mat4.mul(aux,Ry,Rx);
        mat4.mul(aux,T,aux);
        mat4.invert(aux,aux);
        this.viewMatrix = aux;

    }

    updateProjectionMatrix() {
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far)
    }

    /* 📝 Movimientos de camara
     Dolly in|out - Acerca|aleja a la camara de su objetivo (equivale a disminuir|aumentar el radio)
     Arco horizontal|vertical - Mueve a la camara alrededor de su objetivo en forma circular (equivale a modificar los valores de theta|phi)
     */

    moveForward(value) {
        //this.radius = this.radius - value
        this.position[0] += this.forward[0] * value
        //this.position[1] += this.forward[1] * value //si esto no lo ponemos, la camara es fps en lugar de freelook
        this.position[2] += this.forward[2] * value
        this.updateViewMatrix();
    }

    moveRight(value) {
        this.position[0] += this.right[0] * value
        this.position[1] += this.right[1] * value
        this.position[2] += this.right[2] * value
        this.updateViewMatrix();
    }

    arcVertically(value) {
        this.setPitch(this.pitch - value)
    }

    arcHorizontally(value) {
        this.setYaw(this.yaw + value)
    }

    reset() {
        this.sphericalPosition = { radius: DEFAULT_RADIUS, theta: DEFAULT_THETA, phi: DEFAULT_PHI }
        this.onPositionChange(this.sphericalPosition)
        this.updateViewMatrix()
    }
}
