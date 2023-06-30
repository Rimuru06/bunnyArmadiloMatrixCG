import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Camera virtual
    this.cam = new Camera(gl);

    // Luz
    this.light = new Light(1);
    this.light2 = new Light(1.6);

    // Mesh
    this.mesh = new Mesh( 1.0);
    this.copy = new Mesh( -1.0);
  }

  async init(gl) {
    await this.mesh.loadMeshV5('stanford-bunny.obj');
    this.mesh.init(gl, this.light);
    
    await this.copy.loadMeshV5('stanford-armadillo.obj');
    this.copy.init(gl, this.light2);
  }

  draw(gl) {  
    this.cam.updateCam();
    this.light.updateLight();
    this.light2.updateLight();

    this.mesh.draw(gl, this.cam, this.light, 'right');
    this.copy.draw(gl, this.cam, this.light2, 'left');
  }
}

class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");

    this.gl = canvas.getContext("webgl2");
    this.setViewport();

    this.scene = new Scene(this.gl);
    this.scene.init(this.gl).then(() => {
      this.draw()
    });

    
  }

  setViewport() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio;
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  draw() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    this.scene.draw(this.gl);

    requestAnimationFrame(this.draw.bind(this));
  }
}

window.onload = () => {
  window.ortho = false
  const app = new Main();
}

document.addEventListener('keydown', function(e){
  if(e.key == 'p')
    window.ortho = !window.ortho;
})

