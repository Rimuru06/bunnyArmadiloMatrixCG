export default class Camera {
  constructor(gl) {
    this.eye = vec3.fromValues(10.0, 10.0, 10.0);
    this.at  = vec3.fromValues(0.0, 0.0, 0.0);
    this.up  = vec3.fromValues(0.0, 1.0, 0.0);
    this.angle = 0.0;

    this.fovy = Math.PI / 2;
    this.aspect = gl.canvas.width / gl.canvas.height;

    this.left = -10.5;
    this.right = 10.5;
    this.top = 10.5;
    this.bottom = -10.5;

    this.near = 0;
    this.far = 1;

    this.view = mat4.create();
    this.proj = mat4.create();
  }

  getView() {
    return this.view;
  }

  getProj() {
    return this.proj;
  }

  updateViewMatrix() {
    mat4.identity(this.view);
    this.eye = vec3.fromValues(25.0 * Math.sin(this.angle), 12.0, 25.0 * Math.cos(this.angle));
    mat4.lookAt(this.view, this.eye, this.at, this.up);
    this.angle += 0.0125;
  }

  updateProjectionMatrix(type = '') {
    mat4.identity( this.proj );

    if (type === 'ortho') {
      mat4.ortho(this.proj, this.left * 1024/768, this.right * 1024/768, this.bottom , this.top, this.near, this.far);
    } else {
      mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);
    }
  }

  updateCam() {
    this.updateViewMatrix();
    this.updateProjectionMatrix(window.ortho ? 'ortho' : '');
  }

  getPosition(){
    return this.eye;
  }
}