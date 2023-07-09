import vertShaderSrc from './phong.vert.js';
import fragShaderSrc from './phong.frag.js';

import Shader from './shader.js';
import { HalfEdgeDS } from './half-edge.js';

export default class Mesh {
  constructor(delta, type) {
    this.heds = new HalfEdgeDS();
    this.type = type;
    this.angle = 0;
    this.delta = delta;
    this.model = mat4.create();

    this.vertShd = null;
    this.fragShd = null;
    this.program = null;

    this.vaoLoc = -1;
    this.indicesLoc = -1;

    this.uModelLoc = -1;
    this.uViewLoc = -1;
    this.uProjectionLoc = -1;

    this.colorMap = [];
    this.colorMapLoc = -1;

    this.texColorMap = -1;
    this.uColorMap = -1;
  }

  async loadMeshV5(name) {
    const resp = await fetch(name);
    const text = await resp.text();
    const coords = [];
    const indices = [];

    const txtList = text.split('\n')
    txtList.forEach(value => {
      let elements = value.split(' ');
      if (elements[0] == 'v') {
        elements.shift();
        elements.push('1.0')
        if (name == 'armadillo.obj')
          coords.push(elements.map(x => parseFloat(x) * 3));
        else
          coords.push(elements);
      } else if (elements[0] == 'f') {
        elements.shift();
        elements = elements.map(x => x.split('//')[0])
        indices.push(elements)
      }
    });
    this.heds.build(coords.flat(), indices.flat());
  }

  async loadMeshV4() {
    const resp = await fetch('model.obj');
    const text = await resp.text();

    const txtList = text.split(/\s+/)
    const data = txtList.map(d => +d);

    const nv = data[0];
    const nt = data[1];

    const coords = [];
    const indices = [];

    for (let did = 2; did < data.length; did++) {
      if (did < 4 * nv + 2) {
        coords.push(data[did]);
      }
      else {
        indices.push(data[did]);
      }
    }
    this.heds.build(coords, indices);
  }

  createShader(gl) {
    this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);

    gl.useProgram(this.program);
  }

  createUniforms(gl) {
    this.uModelLoc = gl.getUniformLocation(this.program, "u_model");
    this.uViewLoc = gl.getUniformLocation(this.program, "u_view");
    this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection");
  }

  createVAO(gl) {
    const vbos = this.heds.getVBOs();

    const coordsAttributeLocation = gl.getAttribLocation(this.program, "position");
    const coordsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[0]));

    const scalarsAttributeLocation = gl.getAttribLocation(this.program, "color");
    const scalarsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[1]));

    const normalsAttributeLocation = gl.getAttribLocation(this.program, "normal");
    const normalsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[2]));
    
    this.vaoLoc = Shader.createVAO(gl,
      coordsAttributeLocation, coordsBuffer,
      scalarsAttributeLocation, scalarsBuffer,
      normalsAttributeLocation, normalsBuffer);


    this.indicesLoc = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3]));
  }

  createTex(gl) {
    this.uColorMap = gl.getUniformLocation(this.program, 'uColorMap');

    this.texColorMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texColorMap);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const texData = [
      213, 62, 79, 255,
      244, 109, 67, 255,
      253, 174, 97, 255,
      254, 224, 139, 255,
      230, 245, 152, 255,
      171, 221, 164, 255,
      102, 194, 165, 255,
      50, 136, 189, 255
    ].map(d => d / 255);

    const size = [8, 1];
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size[0], size[1], 0, gl.RGBA, gl.FLOAT, new Float32Array(texData));

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.uColorMap, 0);
  }

  init(gl, light) {
    this.createShader(gl);
    this.createUniforms(gl);
    this.heds.estrela(2);
    this.createVAO(gl);
    light.createUniforms(gl, this.program);

  }

  updateModelMatrix() {
    this.angle += 0.01;
    mat4.identity(this.model);

    if (this.type=="armadillo.obj"){
      mat4.rotateY(this.model, this.model, this.angle);
    }
    
    if (this.type=="bunny.obj"){
      mat4.rotateZ(this.model, this.model, this.angle);
    }

    mat4.translate(this.model, this.model, [this.delta, 0, 0]);
  }

  draw(gl, cam) {
    gl.frontFace(gl.CCW);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    
    gl.useProgram(this.program);

    this.updateModelMatrix();

    const model = this.model;
    const view = cam.getView();
    const proj = cam.getProj();

    gl.uniformMatrix4fv(this.uModelLoc, false, model);
    gl.uniformMatrix4fv(this.uViewLoc, false, view);
    gl.uniformMatrix4fv(this.uProjectionLoc, false, proj);

    gl.bindVertexArray(this.vaoLoc);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesLoc);

    gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0);

    gl.disable(gl.CULL_FACE);
  }
}