// Заглушка EXRLoader для jsdom-тестов: реальный разбор EXR в Node не нужен,
// важно, чтобы модуль подключался и возвращал объект-текстуру.
export class EXRLoader {
  constructor() {
    this.type = 'EXRLoader';
  }
  setDataType(type) {
    this.dataType = type;
    return this;
  }
  setPath() {
    return this;
  }
  parse() {
    return { isTexture: true, image: { width: 2, height: 1, data: new Float32Array(8) }, dispose() {} };
  }
  load(url, onLoad) {
    if (onLoad) onLoad(this.parse());
  }
}
