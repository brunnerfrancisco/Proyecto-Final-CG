export class SceneLight {
    constructor(position = [2, 2, 2, 1], color = [1, 1, 1], spot_direction = [0, -1, 0, 0], spot_cutoff = -1.0, model = null) {
        this.position = position //si w==0 es direccional
        this.color = color
        this.spot_direction = spot_direction
        this.spot_cutoff = spot_cutoff //si spot_cutoff==-1, es puntual
        this.model = model //si la luz esta conectada a algun modelo, por ejemplo una lampara
        this.default_spot_direction = spot_direction
        this.linear_attenuation = 0.0
        this.quadratic_attenuation = 0.0
    }

    setPosition(pos){
      this.position = pos;
    }
    setColor(color){
      this.color=color;
    }
    
}
