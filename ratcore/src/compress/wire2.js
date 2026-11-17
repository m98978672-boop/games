// RatCore Compress — Бинарный транспортный протокол ratcore-wire/2 (Уровень 11, F-121..F-125, A-81..A-84)
// 24-байтный фрейм RCW2 + CRC32, FastCDC контент-дедупликация, XOR-FEC восстановление и AIMD Backpressure (<= 256 КБ RAM).

import { crc32, rleCompress, rleDecompress, lzCompress, lzDecompress } from './codec.js';
import { fnv1a32Bytes } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';

export const RCW2_MAGIC = 0x52435732; // 'RCW2'
export const RCW2_HEADER_BYTES = 24;

export const RCW2_CODEC = Object.freeze({
  RAW: 0,
  RLE: 1,
  LZ: 2,
  LZ_DICT: 3,
});

export const RCW2_CHANNEL = Object.freeze({
  P0_CONTROL: 0,
  P1_WORLD: 1,
  P2_AI_SYNC: 2,
  P3_BULK: 3,
});

// F-125: Автовыбор кодека с контролем выгоды (не сжимаем в минус!)
export function selectBestCompressed(rawBytes, { codec = 'auto', preferFast = false } = {}) {
  const src = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes);
  if (codec === 'raw' || src.length < 24) {
    return { codecId: RCW2_CODEC.RAW, payload: src };
  }
  if (codec === 'rle') {
    const c = rleCompress(src);
    return c.length < src.length ? { codecId: RCW2_CODEC.RLE, payload: c } : { codecId: RCW2_CODEC.RAW, payload: src };
  }
  if (codec === 'lz') {
    const c = lzCompress(src, { useDict: false });
    return c.length < src.length ? { codecId: RCW2_CODEC.LZ, payload: c } : { codecId: RCW2_CODEC.RAW, payload: src };
  }
  if (codec === 'lz-dict') {
    const c = lzCompress(src, { useDict: true });
    return c.length < src.length ? { codecId: RCW2_CODEC.LZ_DICT, payload: c } : { codecId: RCW2_CODEC.RAW, payload: src };
  }

  // auto: сравниваем кандидатов и берём самый компактный
  const candidates = [{ codecId: RCW2_CODEC.RAW, payload: src }];
  candidates.push({ codecId: RCW2_CODEC.RLE, payload: rleCompress(src) });
  if (!preferFast) {
    candidates.push({ codecId: RCW2_CODEC.LZ_DICT, payload: lzCompress(src, { useDict: true }) });
  }
  candidates.sort((a, b) => a.payload.length - b.payload.length);
  return candidates[0];
}

// Упаковка в 24-байтный бинарный фрейм RCW2 + CRC32
// [0..3] magic 'RCW2' | [4] version=2 | [5] codecId | [6] channel(P0..P3) | [7] flags
// [8..11] seq | [12..15] rawLen | [16..19] payloadLen | [20..23] crc32(raw)
export function encodeWire2Frame(data, { seq = 0, channel = RCW2_CHANNEL.P1_WORLD, flags = 0, codec = 'auto', preferFast = false } = {}) {
  const raw = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : (data instanceof Uint8Array ? data : new TextEncoder().encode(JSON.stringify(data)));

  const { codecId, payload } = selectBestCompressed(raw, { codec, preferFast });
  const checksum = crc32(raw);

  const frame = new Uint8Array(RCW2_HEADER_BYTES + payload.length);
  const dv = new DataView(frame.buffer);
  dv.setUint32(0, RCW2_MAGIC, false);
  dv.setUint8(4, 2);
  dv.setUint8(5, codecId);
  dv.setUint8(6, channel & 0x3);
  dv.setUint8(7, flags & 0xff);
  dv.setUint32(8, seq >>> 0, true);
  dv.setUint32(12, raw.length >>> 0, true);
  dv.setUint32(16, payload.length >>> 0, true);
  dv.setUint32(20, checksum >>> 0, true);
  frame.set(payload, RCW2_HEADER_BYTES);

  return {
    frame,
    rawBytes: raw.length,
    wireBytes: frame.length,
    codecId,
    ratio: raw.length > 0 ? Number((frame.length / raw.length).toFixed(4)) : 1,
    savedPct: raw.length > 0 ? Number(((1 - frame.length / raw.length) * 100).toFixed(1)) : 0,
    crc32: checksum,
  };
}

export function decodeWire2Frame(frameBytes, { asJson = false, asText = false } = {}) {
  const u8 = frameBytes instanceof Uint8Array ? frameBytes : new Uint8Array(frameBytes);
  if (u8.length < RCW2_HEADER_BYTES) {
    throw new RatCoreError('RC-701', 'Слишком короткий фрейм ratcore-wire/2', 'Убедись, что передан полный буфер >= 24 байт.');
  }
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const magic = dv.getUint32(0, false);
  if (magic !== RCW2_MAGIC) {
    throw new RatCoreError('RC-701', `Неверная сигнатура фрейма RCW2 (0x${magic.toString(16)})`, 'Используй encodeWire2Frame для кодирования.');
  }
  const version = dv.getUint8(4);
  const codecId = dv.getUint8(5);
  const channel = dv.getUint8(6);
  const flags = dv.getUint8(7);
  const seq = dv.getUint32(8, true);
  const rawLen = dv.getUint32(12, true);
  const payloadLen = dv.getUint32(16, true);
  const expectedCrc = dv.getUint32(20, true);

  if (u8.length < RCW2_HEADER_BYTES + payloadLen) {
    throw new RatCoreError('RC-702', 'Обрезанный фрейм RCW2', 'Дождись завершения потоковой доставки чанков.');
  }

  const payload = u8.subarray(RCW2_HEADER_BYTES, RCW2_HEADER_BYTES + payloadLen);
  let raw;
  if (codecId === RCW2_CODEC.RAW) raw = payload.slice();
  else if (codecId === RCW2_CODEC.RLE) raw = rleDecompress(payload);
  else if (codecId === RCW2_CODEC.LZ) raw = lzDecompress(payload, { useDict: false });
  else if (codecId === RCW2_CODEC.LZ_DICT) raw = lzDecompress(payload, { useDict: true });
  else throw new RatCoreError('RC-703', `Неизвестный кодек RCW2: ${codecId}`, 'Поддерживаются 0..3.');

  const actualCrc = crc32(raw);
  if (actualCrc !== expectedCrc || raw.length !== rawLen) {
    throw new RatCoreError('RC-704', 'Контрольная сумма CRC32 фрейма RCW2 не совпала (данные повреждены)', 'Восстанови пакет через xorFecRecover или переотправь по resumeBitmap.');
  }

  let value = raw;
  if (asJson) value = JSON.parse(new TextDecoder().decode(raw));
  else if (asText) value = new TextDecoder().decode(raw);

  return { version, codecId, channel, flags, seq, rawLen, payloadLen, crc32: actualCrc, data: value };
}

// F-121 / A-81: FastCDC контент-дедупликация (Gear-хеш нарезка, повторная синхронизация шлёт только новые куски)
const GEAR_TABLE = (() => {
  const g = new Uint32Array(256);
  let s = 0x9e3779b9;
  for (let i = 0; i < 256; i++) {
    s = (Math.imul(s ^ (s >>> 15), 0x85ebca6b) + 0xc2b2ae35) >>> 0;
    g[i] = s;
  }
  return g;
})();

export function fastCdcSplit(bytes, { minSize = 256, avgSize = 1024, maxSize = 4096 } = {}) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const maskBits = Math.max(4, Math.round(Math.log2(avgSize)));
  const mask = ((1 << maskBits) - 1) >>> 0;
  const chunks = [];
  let start = 0;

  while (start < u8.length) {
    const remaining = u8.length - start;
    if (remaining <= minSize) {
      const slice = u8.subarray(start, u8.length);
      chunks.push({ offset: start, length: slice.length, hash: fnv1a32Bytes(slice), bytes: slice });
      break;
    }
    let fp = 0;
    const limit = Math.min(u8.length, start + maxSize);
    let pos = start + minSize;
    while (pos < limit) {
      fp = ((fp << 1) + GEAR_TABLE[u8[pos]]) >>> 0;
      if ((fp & mask) === 0) break;
      pos++;
    }
    const slice = u8.subarray(start, pos);
    chunks.push({ offset: start, length: slice.length, hash: fnv1a32Bytes(slice), bytes: slice });
    start = pos;
  }
  return chunks;
}

export function diffFastCdcChunks(chunks, knownHashesSet) {
  const known = knownHashesSet instanceof Set ? knownHashesSet : new Set(knownHashesSet || []);
  const manifest = [];
  const toSend = [];
  let totalBytes = 0;
  let sendBytes = 0;

  for (const ch of chunks) {
    totalBytes += ch.length;
    manifest.push({ hash: ch.hash, length: ch.length });
    if (!known.has(ch.hash)) {
      toSend.push(ch);
      sendBytes += ch.length;
      known.add(ch.hash);
    }
  }
  return {
    manifest,
    toSend,
    totalChunks: chunks.length,
    sentChunks: toSend.length,
    totalBytes,
    sendBytes,
    dedupSavedPct: totalBytes > 0 ? Number(((1 - sendBytes / totalBytes) * 100).toFixed(1)) : 0,
  };
}

// F-124 / A-83: XOR-FEC — 1 пакет чётности на группу K пакетов восстанавливает любую одиночную потерю без переповтора
export function xorFecParity(packets) {
  let maxLen = 0;
  for (const p of packets) if (p.length > maxLen) maxLen = p.length;
  const parity = new Uint8Array(maxLen);
  for (const p of packets) {
    for (let i = 0; i < p.length; i++) parity[i] ^= p[i];
  }
  return parity;
}

export function xorFecRecover(receivedPacketsOrNull, parity, expectedMissingLen) {
  let missingIdx = -1;
  for (let i = 0; i < receivedPacketsOrNull.length; i++) {
    if (receivedPacketsOrNull[i] == null) {
      if (missingIdx !== -1) {
        throw new RatCoreError('RC-705', 'XOR-FEC восстанавливает не более 1 потерянного пакета в группе', 'Запроси повтор по resumeBitmap.');
      }
      missingIdx = i;
    }
  }
  if (missingIdx === -1) return null;
  const recovered = parity.slice();
  for (let i = 0; i < receivedPacketsOrNull.length; i++) {
    if (i === missingIdx) continue;
    const p = receivedPacketsOrNull[i];
    for (let j = 0; j < p.length; j++) recovered[j] ^= p[j];
  }
  return { index: missingIdx, packet: expectedMissingLen ? recovered.subarray(0, expectedMissingLen) : recovered };
}

// F-123: Потоковое окно <= 256 КБ RAM с AIMD Backpressure и resumeBitmap
export class Wire2StreamWindow {
  constructor({ maxWindowBytes = 256 * 1024, initialCwnd = 32 * 1024 } = {}) {
    this.maxWindowBytes = maxWindowBytes;
    this.cwndBytes = Math.min(initialCwnd, maxWindowBytes);
    this.inFlightBytes = 0;
    this.acked = new Set();
    this.lossEvents = 0;
  }

  canSend(bytes) {
    return this.inFlightBytes + bytes <= Math.min(this.cwndBytes, this.maxWindowBytes);
  }

  onSend(seq, bytes) {
    this.inFlightBytes += bytes;
    return { seq, inFlightBytes: this.inFlightBytes, cwndBytes: this.cwndBytes };
  }

  onAck(seq, bytes) {
    this.acked.add(seq);
    this.inFlightBytes = Math.max(0, this.inFlightBytes - bytes);
    // Additive Increase
    this.cwndBytes = Math.min(this.maxWindowBytes, this.cwndBytes + 4096);
  }

  onLoss(bytes) {
    this.lossEvents++;
    this.inFlightBytes = Math.max(0, this.inFlightBytes - bytes);
    // Multiplicative Decrease
    this.cwndBytes = Math.max(4096, Math.floor(this.cwndBytes * 0.5));
  }

  buildResumeBitmap(totalSeqs) {
    const bits = new Uint8Array(Math.ceil(totalSeqs / 8));
    for (let s = 0; s < totalSeqs; s++) {
      if (this.acked.has(s)) bits[s >>> 3] |= (1 << (s & 7));
    }
    return bits;
  }
}
