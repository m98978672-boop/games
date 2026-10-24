// Заглушка WebGLRenderer: позволяет прогнать всю логику игры в Node (jsdom).
export * from '../node_modules/three/build/three.module.js';

export class WebGLRenderer {
  constructor(opts = {}) {
    this.domElement = opts.canvas || null;
    this.shadowMap = { enabled: false, type: 0 };
    this.outputColorSpace = '';
    this.toneMapping = 0;
    this.toneMappingExposure = 1;
    this.renders = 0;
    this.pixelRatio = 1;
  }
  setPixelRatio(v) { this.pixelRatio = v; }
  setSize(w, h) { this.width = w; this.height = h; }
  setAnimationLoop(cb) { this.loop = cb; }
  render() { this.renders++; }
  getContext() { return {}; }
}
