import { VertexArray } from "./VertexArray.js"
import { mat4, quat, glMatrix } from "/libs/gl-matrix/index.js"

export class SceneObject {
    constructor(gl, geometry, material, textures, geometryData = null, wireframe = false) {
        this.gl = gl
        this.material = material
        this.textures = textures
        this.indexBuffer = wireframe ? geometry.indexBuffers.lines : geometry.indexBuffers.triangles
        this.vertexArray = new VertexArray(gl, material.program, geometry.vertexBuffers, this.indexBuffer)
        this.drawMode = wireframe ? gl.LINES : gl.TRIANGLES
        this.geometryData = geometryData

        this.modelMatrix     = mat4.create()
        this.modelViewMatrix = mat4.create()
        this.normalMatrix    = mat4.create()

        this.position = [0, 0, 0]
        this.rotation = [0, 0, 0]
        this.rotQuat = quat.create();

        this.id = -1;
    }

    setPosition(x, y, z) {
        this.position = [x, y, z]
    }

    translateX(value) {
        this.position[0] += value
    }

    translateY(value) {
        this.position[1] += value
    }

    translateZ(value) {
        this.position[2] += value
    }

    getPosX(){
        return this.position[0];
    }

    getPosY(){
        return this.position[1];
    }

    getPosZ(){
        return this.position[2];
    }
    setRotation(x, y, z) { //angulos en grados
        this.rotateX(x-this.rotation[0])
        this.rotateY(y-this.rotation[1])
        this.rotateZ(z-this.rotation[2])
    }

    rotateX(value) { //angulo en grados
        quat.rotateX(this.rotQuat,this.rotQuat,glMatrix.toRadian(value))
        this.rotation[0] += value;
    }

    rotateY(value) { //angulo en grados
        quat.rotateY(this.rotQuat,this.rotQuat,glMatrix.toRadian(value))
        this.rotation[1] += value;
    }

    rotateZ(value) { //angulo en grados
        quat.rotateZ(this.rotQuat,this.rotQuat,glMatrix.toRadian(value))
        this.rotation[2] += value;
    }

    updateModelMatrix() {
        mat4.fromRotationTranslation(this.modelMatrix, this.rotQuat, this.position)
    }
    setId(value){
        this.id = value;
    }
    getId(){
        return this.id;
    }
}
