import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Camera virtual
    this.cam = new Camera(gl);

    // Luz
    this.white = new Light('w');
    this.yellow = new Light('y');

    // Mesh
    this.cuelo = new Mesh( 15.0, 'bunny.obj');
    this.tatu = new Mesh( 0.0, 'armadillo.obj');
  }

  async init(gl) {
    await this.cuelo.loadMeshV5('bunny.obj');
    await this.tatu.loadMeshV5('armadillo.obj');
    this.cuelo.init(gl, this.white);
    this.cuelo.init(gl, this.yellow);
    this.tatu.init(gl, this.white);
    this.tatu.init(gl, this.yellow);
  }

  draw(gl) {  
    this.cam.updateCam();
    this.white.updateLight();
    this.yellow.updateLight();

    this.cuelo.draw(gl, this.cam, 'right');
    this.tatu.draw(gl, this.cam, 'left');
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