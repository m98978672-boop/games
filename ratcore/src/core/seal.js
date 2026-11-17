// RatCore ToolGuard — Барьер 1 (одноразовая печать) и Барьер 2 (AssetVault с FNV-1a)
// Реализация A-02 и кодов RC-101, RC-102, RC-105, RC-106.

import { fnv1a32TypedArray, fnv1a32String } from './math.js';

export class RatCoreError extends Error {
  constructor(code, message, hint = '', extra = null) {
    super(`[${code}] ${message}`);
    this.name = 'RatCoreError';
    this.code = code;
    this.hint = hint;
    this.autoFixHint = hint;
    this.extra = extra;
  }
}

// Фабрика изолированного контура ToolGuard на один инстанс движка.
// Приватный WeakMap и одноразовый claimMintAuthority недоступны извне.
export function createToolGuardVault() {
  const sealedMeshes = new WeakMap();
  const sealedTextures = new WeakMap();
  const meshStore = new Map();
  const textureStore = new Map();
  const auditLog = [];

  let mintClaimed = false;
  let nextMeshId = 1;
  let nextTexId = 1;

  function recordAudit(code, message, details = {}) {
    auditLog.push({
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  function hashMeshBuffers(buffers) {
    let h = fnv1a32TypedArray(buffers.positions);
    h = (h ^ fnv1a32TypedArray(buffers.indices)) >>> 0;
    if (buffers.normals) h = (h ^ fnv1a32TypedArray(buffers.normals)) >>> 0;
    if (buffers.uvs) h = (h ^ fnv1a32TypedArray(buffers.uvs)) >>> 0;
    if (buffers.colors) h = (h ^ fnv1a32TypedArray(buffers.colors)) >>> 0;
    return h >>> 0;
  }

  function hashTextureData(tex) {
    let h = fnv1a32TypedArray(tex.pixels);
    h = (h ^ fnv1a32String(`${tex.width}x${tex.height}`)) >>> 0;
    return h >>> 0;
  }

  // Барьер 1: одноразовый захват права выпускать печати (повторный вызов -> RC-105)
  function claimMintAuthority(ownerTag = 'toolkit') {
    if (mintClaimed) {
      recordAudit('RC-105', 'Повторная попытка захватить mintAuthority', { ownerTag });
      throw new RatCoreError(
        'RC-105',
        'Повторный захват mintAuthority запрещён (ToolGuard Barrier 1)',
        'Печать может захватить только официальный tools/toolkit.js один раз при инициализации движка.'
      );
    }
    mintClaimed = true;

    return Object.freeze({
      mintMesh({ buffers, bounds, triCount, provenance, validated = false }) {
        const id = `mesh_${String(nextMeshId++).padStart(5, '0')}`;
        const copyBuffers = {
          positions: new Float32Array(buffers.positions),
          indices: new Uint32Array(buffers.indices),
          normals: buffers.normals ? new Float32Array(buffers.normals) : null,
          uvs: buffers.uvs ? new Float32Array(buffers.uvs) : null,
          colors: buffers.colors ? new Uint32Array(buffers.colors) : null,
        };
        const contentHash = hashMeshBuffers(copyBuffers);
        const entry = {
          id,
          buffers: copyBuffers,
          bounds: Object.freeze({ ...bounds }),
          triCount,
          vertexCount: copyBuffers.positions.length / 3,
          contentHash,
          provenance: Object.freeze({ ...provenance }),
          validated: Boolean(validated),
        };
        meshStore.set(id, entry);

        // Барьер 2: непрозрачный замороженный хэндл без доступа к сырым буферам
        const handle = Object.freeze({
          __kind: 'RatCoreMeshHandle',
          id,
          triCount,
          vertexCount: entry.vertexCount,
          bounds: entry.bounds,
          validated: entry.validated,
          tool: provenance.tool,
        });
        sealedMeshes.set(handle, { id, contentHash });
        return handle;
      },

      mintTexture({ width, height, pixels, normals = null, damagedPixels = null, provenance }) {
        const id = `tex_${String(nextTexId++).padStart(5, '0')}`;
        const copy = {
          width,
          height,
          pixels: new Uint32Array(pixels),
          normals: normals ? new Uint32Array(normals) : null,
          damagedPixels: damagedPixels ? new Uint32Array(damagedPixels) : null,
        };
        const contentHash = hashTextureData(copy);
        const entry = {
          id,
          ...copy,
          contentHash,
          provenance: Object.freeze({ ...provenance }),
        };
        textureStore.set(id, entry);

        const handle = Object.freeze({
          __kind: 'RatCoreTextureHandle',
          id,
          width,
          height,
          hasNormals: Boolean(copy.normals),
          hasDamaged: Boolean(copy.damagedPixels),
          tool: provenance.tool,
        });
        sealedTextures.set(handle, { id, contentHash });
        return handle;
      },
    });
  }

  // Проверка и выдача буферов меша исключительно внутренним слоям движка
  function readSealedMesh(handle, caller = 'renderer') {
    const meta = handle && typeof handle === 'object' ? sealedMeshes.get(handle) : null;
    if (!meta) {
      recordAudit('RC-101', 'Попытка передать неподписанный/сырой меш в движок', { caller });
      throw new RatCoreError(
        'RC-101',
        'RAW_GEOMETRY_FORBIDDEN: меш создан в обход RatCore.tools.build.*',
        'Создавай меши только через engine.tools.build.primitive / extrude / loft / lathe / voxels / layer / fromRecipe.'
      );
    }
    const entry = meshStore.get(meta.id);
    if (!entry) {
      recordAudit('RC-106', 'Хэндл ссылается на отсутствующую запись AssetVault', { id: meta.id, caller });
      throw new RatCoreError('RC-106', 'Запись меша в AssetVault повреждена или удалена', 'Пересобери модель из рецепта через tools.build.fromRecipe.');
    }
    const liveHash = hashMeshBuffers(entry.buffers);
    if (liveHash !== meta.contentHash) {
      recordAudit('RC-106', 'Нарушена контрольная сумма буфера меша в AssetVault', { id: meta.id, caller });
      throw new RatCoreError('RC-106', 'TAMPER_DETECTED: контрольная сумма меша нарушена', 'Пересобери меш через tools.build.fromRecipe.');
    }
    return entry;
  }

  function readSealedTexture(handle, caller = 'renderer') {
    const meta = handle && typeof handle === 'object' ? sealedTextures.get(handle) : null;
    if (!meta) {
      recordAudit('RC-102', 'Попытка передать неподписанную/сырую текстуру в движок', { caller });
      throw new RatCoreError(
        'RC-102',
        'RAW_TEXTURE_FORBIDDEN: текстура создана в обход RatCore.tools.build.tex.*',
        'Создавай текстуры только через engine.tools.build.texGenerate.'
      );
    }
    const entry = textureStore.get(meta.id);
    if (!entry || hashTextureData(entry) !== meta.contentHash) {
      recordAudit('RC-106', 'Нарушена контрольная сумма текстуры в AssetVault', { id: meta.id, caller });
      throw new RatCoreError('RC-106', 'TAMPER_DETECTED: контрольная сумма текстуры нарушена', 'Пересобери текстуру через tools.build.texGenerate.');
    }
    return entry;
  }

  function isSealedMesh(handle) {
    return Boolean(handle && typeof handle === 'object' && sealedMeshes.has(handle));
  }

  function isSealedTexture(handle) {
    return Boolean(handle && typeof handle === 'object' && sealedTextures.has(handle));
  }

  function getStats() {
    return {
      meshes: meshStore.size,
      textures: textureStore.size,
      auditEvents: auditLog.length,
    };
  }

  function getAuditLog() {
    return auditLog.slice();
  }

  return Object.freeze({
    claimMintAuthority,
    readSealedMesh,
    readSealedTexture,
    isSealedMesh,
    isSealedTexture,
    recordAudit,
    getStats,
    getAuditLog,
  });
}
