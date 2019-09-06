import { mat4, vec3, quat } from "/libs/gl-matrix/index.js"
import { toCartesian, toRadians, limitToRange } from "/libs/utils.js"

const DEFAULT_RADIUS = 45                // distancia al origen
const DEFAULT_THETA  = toRadians(0)   // angulo horizontal alrededor del eje y (partiendo del eje z positivo, en sentido anti-horario)
const DEFAULT_PHI    = toRadians(60)    // angulo vertical desde el eje y positivo

export class Camera {

    constructor() {
        this.sphericalPosition = { radius: DEFAULT_RADIUS, theta: DEFAULT_THETA, phi: DEFAULT_PHI }
        this.target = [0,0,0]
        this.up     = [0, 1, 0]
        this.fov    = toRadians(45)
        this.aspect = 1
        this.near   = 0.1
        this.far    = 1000

        this.onPositionChange = () => {} // funcion que se ejecuta ante cada cambio en la posicion de la camara (por defecto una "funcion vacia" o no-op)

        this.viewMatrix = mat4.create()
        this.projectionMatrix = mat4.create()

        this.updateViewMatrix()
        this.updateProjectionMatrix()
    }

    // Setters & Getters

    setTarget(value) {
        this.target = value
        //let { x, y, z } = toCartesian(this.sphericalPosition)
        //let r = vec3.distance(this.target,[x,y,z])
        //this.radius = r
        this.updateViewMatrix()
    }

    getForward(){
        let q = quat.create()
        mat4.getRotation(q,this.viewMatrix)
        let forward = vec3.fromValues(0,0,1);
        vec3.transformQuat(forward,forward,q)
        return forward
    }

    set radius(value) {
        this.sphericalPosition.radius = limitToRange(value, this.near, this.far) // radius: [near, far]
        this.updateViewMatrix()
        this.onPositionChange(this.sphericalPosition)
    }
    get radius() {
        return this.sphericalPosition.radius
    }

    set theta(value) {
        this.sphericalPosition.theta = ( value === Math.PI * 2 ) ? value : ( value + Math.PI * 2 ) % ( Math.PI * 2 ) // theta: [0, 360]
        this.updateViewMatrix()
        this.onPositionChange(this.sphericalPosition)
    }
    get theta() {
        return this.sphericalPosition.theta
    }

    set phi(value) {
        this.sphericalPosition.phi = limitToRange(value, 0.01, Math.PI) // phi: [0.1, 180]
        this.updateViewMatrix()
        this.onPositionChange(this.sphericalPosition)
    }
    get phi() {
        return this.sphericalPosition.phi
    }

    setFov(value) {
        this.fov = value
        this.updateProjectionMatrix()
    }
    getFov() {
        return this.fov
    }

    // Actualizacion de matrices

    updateViewMatrix() {
        const { x, y, z } = toCartesian(this.sphericalPosition)
        mat4.lookAt(this.viewMatrix, [x+this.target[0], y+this.target[1], z+this.target[2]], this.target, this.up)
    }

    updateProjectionMatrix() {
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far)
    }

    /* 📝 Movimientos de camara
     Dolly in|out - Acerca|aleja a la camara de su objetivo (equivale a disminuir|aumentar el radio)
     Arco horizontal|vertical - Mueve a la camara alrededor de su objetivo en forma circular (equivale a modificar los valores de theta|phi)
     */

    dolly(value) {
        this.radius = this.radius - value
    }

    arcVertically(value) {
        this.phi = this.phi - value
    }

    arcHorizontally(value) {
        this.theta = this.theta + value
    }

    reset() {
        this.sphericalPosition = { radius: DEFAULT_RADIUS, theta: DEFAULT_THETA, phi: DEFAULT_PHI }
        this.onPositionChange(this.sphericalPosition)
        this.updateViewMatrix()
    }
}
