function onSliderFovy(slider, labelId) {
	let fovy = parseFloat(slider.value);
	camera.setFovy(fovy);
	writeValue(labelId, fovy);
	render(now);
}

function cambioCamaraNormal(){ // me va faltar importar en el index.html todos los constructores.
	camera = new Camera()
	CameraControls = new CameraMouseControls(camera, canvas)
	render(now)       
}

function cambioCamarafps(){ // me va faltar importar en el index.html todos los constructores.
	camera = new FpsCamera();
	CameraControls = new FpsCameraControls(camera, canvas);
	CameraControls.move()
	render(now)
}


