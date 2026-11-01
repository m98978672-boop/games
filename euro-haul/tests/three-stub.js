// Тестовая обёртка three.js: всё настоящее, кроме WebGL-рендерера (в Node нет GPU).
export * from '../node_modules/three/build/three.module.js';

export class WebGLRenderer {
  constructor(opts = {}) {
    this.domElement = opts.canvas || document.createElement('canvas');
    this.shadowMap = { enabled: false };
    this.capabilities = { isWebGL2: true, maxTextureSize: 4096 };
    this.info = { render: { calls: 0, triangles: 0 } };
    this.outputColorSpace = '';
    this.toneMapping = 0;
    this.toneMappingExposure = 1;
    this.calls = 0;
  }
  setPixelRatio() {}
  setSize() {}
  setClearColor() {}
  render() {
    this.calls++;
  }
  compile() {}
  dispose() {}
  getContext() {
    return {};
  }
}
