import { Program } from "./Program.js"

export class Material {
    constructor(program, affectedByLight, textured, properties = {}) {
        this.program = program
        this.affectedByLight = affectedByLight
        this.textured = textured
        this.properties = properties
    }
}
