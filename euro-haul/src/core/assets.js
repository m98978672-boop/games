// Библиотека реальных ассетов: HDR-среды (CC0, Poly Haven), будущие glTF-модели
// и PBR-текстуры. Всё загружается из assets/ по манифесту; если файлов нет —
// игра спокойно живёт на процедурных материалах (офлайн-режим и первый запуск).
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

const MANIFEST_URL = 'assets/manifest.json';

/** Есть ли в манифесте такая среда/текстура — без загрузки байтов. */
export class AssetLibrary {
  constructor(baseUrl = '') {
    this.base = baseUrl;
    this.manifest = null;
    this.ready = false;
    this.failed = false;
    this.cache = new Map();
    this.loading = new Map();
    this.stats = { loaded: 0, bytes: 0 };
    this.envIndex = {}; // «sky» → запись манифеста (без расширения)
  }

  /** Читает манифест. Отсутствие файла — не ошибка: работаем процедурно. */
  async loadManifest() {
    if (this.manifest) return this.manifest;
    try {
      const res = await fetch(this.base + MANIFEST_URL, { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      this.manifest = await res.json();
      // Манифест хранит имена файлов («sky.exr»), а в коде удобнее «sky»:
      // строим индекс один раз, чтобы не спотыкаться о расширение.
      this.envIndex = {};
      for (const [key, entry] of Object.entries(this.manifest.env || {})) {
        const base = (entry.file || key).split('/').pop().replace(/\.[a-z0-9]+$/i, '');
        this.envIndex[base] = entry;
      }
      this.ready = true;
    } catch {
      this.failed = true;
      this.manifest = { version: 1, env: {}, textures: {}, models: {} };
    }
    return this.manifest;
  }

  get envNames() {
    return Object.keys(this.envIndex || {});
  }

  hasEnv(name) {
    return !!this.envIndex?.[name];
  }

  /** HDR-панорама как текстура three (EXR, float). Кэшируется. */
  async loadEnv(name) {
    if (this.cache.has(name)) return this.cache.get(name);
    if (this.loading.has(name)) return this.loading.get(name);
    await this.loadManifest();
    const entry = this.envIndex?.[name];
    if (!entry) return null;
    const task = (async () => {
      try {
        const res = await fetch(this.base + 'assets/' + entry.file, { cache: 'force-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const buf = await res.arrayBuffer();
        const loader = new EXRLoader();
        loader.setDataType(THREE.FloatType);
        // EXRLoader.parse возвращает «сырые» данные кадра, текстуру собираем сами:
        // так работает и в браузере, и в Node-тестах без DOM.
        const data = loader.parse(buf);
        const tex = new THREE.DataTexture(
          data.data,
          data.width,
          data.height,
          data.format || THREE.RGBAFormat,
          data.type || THREE.FloatType
        );
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.flipY = data.flipY ?? true;
        tex.colorSpace = THREE.LinearSRGBColorSpace;
        tex.needsUpdate = true;
        tex.mapping = THREE.EquirectangularReflectionMapping;
        this.stats.loaded++;
        this.stats.bytes += buf.byteLength;
        this.cache.set(name, tex);
        return tex;
      } catch (err) {
        console.warn('ассет "' + name + '" недоступен:', err.message);
        this.cache.set(name, null);
        return null;
      } finally {
        this.loading.delete(name);
      }
    })();
    this.loading.set(name, task);
    return task;
  }

  /** Информация для экрана «Об игре»: что реально загружено. */
  describe() {
    if (!this.ready) return 'процедурные материалы';
    const env = this.envNames.length;
    return env ? `HDR-среды: ${env} (CC0)` : 'процедурные материалы';
  }
}
