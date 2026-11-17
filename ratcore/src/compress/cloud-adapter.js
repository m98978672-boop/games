// RatCore Cloud Adapter — Офлайн-first синхронизация миров (RCW2 + FastCDC) и сообщений ИИ с облаком (Supabase REST / локальный буфер)
// Секреты никогда не зашиваются в код: URL и publishable-ключ передаются опционально при подключении.

import { encodeWire2Frame, decodeWire2Frame, fastCdcSplit, diffFastCdcChunks } from './wire2.js';

function bytesToBase64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export class RatCoreCloudSync {
  constructor({ restUrl = null, apiKey = null, fetchImpl = null } = {}) {
    this.restUrl = restUrl ? String(restUrl).replace(/\/+$/, '') : null;
    this.apiKey = apiKey || null;
    this.fetchImpl = fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    this.localStore = new Map();
    this.knownChunkHashes = new Set();
  }

  isRemoteConfigured() {
    return Boolean(this.restUrl && this.apiKey && this.fetchImpl);
  }

  // Упаковывает снимок в RCW2 + строит FastCDC-манифест (для дедупликации повторных отправок)
  packSnapshot(worldId, slotKey, snapshotObj) {
    const rawBytes = new TextEncoder().encode(JSON.stringify(snapshotObj));
    const cdcChunks = fastCdcSplit(rawBytes);
    const diff = diffFastCdcChunks(cdcChunks, this.knownChunkHashes);
    const wire = encodeWire2Frame(rawBytes, { codec: 'auto' });

    return {
      world_id: String(worldId),
      slot_key: String(slotKey || 'main'),
      wire_version: 2,
      codec_id: wire.codecId,
      raw_bytes: wire.rawBytes,
      wire_bytes: wire.wireBytes,
      crc32: wire.crc32,
      payload_b64: bytesToBase64(wire.frame),
      fastcdc_manifest: diff.manifest,
      metadata: {
        savedPct: wire.savedPct,
        dedupSavedPct: diff.dedupSavedPct,
        sentChunks: diff.sentChunks,
        totalChunks: diff.totalChunks,
      },
    };
  }

  unpackSnapshotRecord(record) {
    const frame = base64ToBytes(record.payload_b64);
    const decoded = decodeWire2Frame(frame, { asJson: true });
    return {
      worldId: record.world_id,
      slotKey: record.slot_key,
      crc32: decoded.crc32,
      rawBytes: decoded.rawLen,
      wireBytes: frame.length,
      snapshot: decoded.data,
    };
  }

  async pushSnapshot(worldId, slotKey, snapshotObj) {
    const rec = this.packSnapshot(worldId, slotKey, snapshotObj);
    const key = `${rec.world_id}:${rec.slot_key}`;
    this.localStore.set(key, rec);

    if (!this.isRemoteConfigured()) {
      return { ok: true, mode: 'local-cache', record: rec };
    }

    const res = await this.fetchImpl(`${this.restUrl}/rest/v1/ratcore_cloud_snapshots?on_conflict=world_id,slot_key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(rec),
    });
    if (!res.ok) {
      return { ok: false, mode: 'remote', status: res.status, cachedLocally: true };
    }
    return { ok: true, mode: 'remote', record: rec };
  }

  async pullSnapshot(worldId, slotKey = 'main') {
    const key = `${worldId}:${slotKey}`;
    if (this.isRemoteConfigured()) {
      const q = `world_id=eq.${encodeURIComponent(worldId)}&slot_key=eq.${encodeURIComponent(slotKey)}&limit=1`;
      const res = await this.fetchImpl(`${this.restUrl}/rest/v1/ratcore_cloud_snapshots?${q}`, {
        headers: { apikey: this.apiKey, Authorization: `Bearer ${this.apiKey}` },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows[0]) {
          this.localStore.set(key, rows[0]);
          return { ok: true, mode: 'remote', ...this.unpackSnapshotRecord(rows[0]) };
        }
      }
    }
    const local = this.localStore.get(key);
    if (!local) return { ok: false, mode: 'local-cache', reason: 'not-found' };
    return { ok: true, mode: 'local-cache', ...this.unpackSnapshotRecord(local) };
  }
}
