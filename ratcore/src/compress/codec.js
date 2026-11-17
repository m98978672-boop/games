// RatCore Compress — Базовые кодеки (Уровни 1–9: CRC32, ZigZag/Varint, Delta, RLE, LZ-словарь ratcore-dict-v1)
// Формулы F-92..F-96, F-122; нулевые внешние зависимости, браузер + Node.js 22.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) {
    c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// F-92: ZigZag для знаковых целых (0 -> 0, -1 -> 1, 1 -> 2, -2 -> 3...)
export function zigzagEncode(n) {
  const v = n | 0;
  return ((v << 1) ^ (v >> 31)) >>> 0;
}

export function zigzagDecode(u) {
  const v = u >>> 0;
  return (v >>> 1) ^ -(v & 1);
}

// F-93: LEB128 Varint кодирование массива целых
export function encodeVarints(ints) {
  const out = [];
  for (let i = 0; i < ints.length; i++) {
    let v = zigzagEncode(ints[i]);
    while (v >= 0x80) {
      out.push((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    out.push(v);
  }
  return new Uint8Array(out);
}

export function decodeVarints(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = [];
  let i = 0;
  while (i < u8.length) {
    let shift = 0;
    let val = 0;
    while (i < u8.length) {
      const b = u8[i++];
      val |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    out.push(zigzagDecode(val >>> 0));
  }
  return new Int32Array(out);
}

// A-65: Delta-of-Delta кодирование рядов координат/тиков
export function encodeDeltaInt32(arr) {
  const out = new Int32Array(arr.length);
  let prev = 0;
  for (let i = 0; i < arr.length; i++) {
    out[i] = (arr[i] | 0) - prev;
    prev = arr[i] | 0;
  }
  return encodeVarints(out);
}

export function decodeDeltaInt32(bytes) {
  const deltas = decodeVarints(bytes);
  let acc = 0;
  for (let i = 0; i < deltas.length; i++) {
    acc += deltas[i];
    deltas[i] = acc;
  }
  return deltas;
}

// Компактный PackBits-подобный RLE (никогда не раздувает данные больше +1.6%)
export function rleCompress(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = [];
  let i = 0;
  while (i < u8.length) {
    let run = 1;
    while (i + run < u8.length && run < 128 && u8[i + run] === u8[i]) run++;
    if (run >= 3) {
      out.push(0x80 | (run - 1));
      out.push(u8[i]);
      i += run;
    } else {
      const start = i;
      let lit = 0;
      while (i < u8.length && lit < 128) {
        if (i + 2 < u8.length && u8[i] === u8[i + 1] && u8[i] === u8[i + 2]) break;
        i++;
        lit++;
      }
      out.push(lit - 1);
      for (let k = 0; k < lit; k++) out.push(u8[start + k]);
    }
  }
  return new Uint8Array(out);
}

export function rleDecompress(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = [];
  let i = 0;
  while (i < u8.length) {
    const hdr = u8[i++];
    if (hdr & 0x80) {
      const count = (hdr & 0x7f) + 1;
      const val = u8[i++];
      for (let k = 0; k < count; k++) out.push(val);
    } else {
      const count = hdr + 1;
      for (let k = 0; k < count && i < u8.length; k++) out.push(u8[i++]);
    }
  }
  return new Uint8Array(out);
}

// F-122: Предзагруженный общий словарь ratcore-dict-v1 (частые ключи мира/сущностей/инструментов)
const DICT_STR =
  '{"schema":"ratcore-save/1","entities":[,"nodes":[,"edges":[,"meshId":"mesh_","texture":' +
  '"x":,"y":,"h":,"yaw":,"scale":,"tag":"object","id":"ent_","kind":"road","from":"node_",' +
  '"to":"node_","length":,"costFactor":1,"bidirectional":true,"seed":,"tick":,"build.primitive",' +
  '"build.placeEntity","RatCore","pack:","RC-108","RC-101","ok":true,"data":,"error":null}';
export const RATCORE_DICT_V1 = new TextEncoder().encode(DICT_STR);

// Лёгкий LZ77 со скользящим окном + опциональный префикс словаря ratcore-dict-v1
// Формат токенов:
//   0xxxxxxx (0..127): литеральная серия длиной (b + 1)
//   1xxxxxxx: ссылка (len = ((b & 0x7f) + 3), dist = 2 байта LE в [1..65535])
export function lzCompress(bytes, { useDict = true } = {}) {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dict = useDict ? RATCORE_DICT_V1 : new Uint8Array(0);
  const dLen = dict.length;
  const total = dLen + src.length;
  const buf = new Uint8Array(total);
  if (dLen > 0) buf.set(dict, 0);
  buf.set(src, dLen);

  // Хеш-таблица 3-байтных префиксов для быстрого поиска O(N)
  const HASH_BITS = 13;
  const HASH_SIZE = 1 << HASH_BITS;
  const head = new Int32Array(HASH_SIZE).fill(-1);
  const prev = new Int32Array(total).fill(-1);
  const hash3 = (p) => (((buf[p] << 10) ^ (buf[p + 1] << 5) ^ buf[p + 2]) & (HASH_SIZE - 1));

  // Индексируем словарь
  for (let p = 0; p + 2 < dLen; p++) {
    const h = hash3(p);
    prev[p] = head[h];
    head[h] = p;
  }

  const out = [];
  let litBuf = [];
  const flushLit = () => {
    let off = 0;
    while (off < litBuf.length) {
      const chunk = Math.min(128, litBuf.length - off);
      out.push(chunk - 1);
      for (let k = 0; k < chunk; k++) out.push(litBuf[off + k]);
      off += chunk;
    }
    litBuf = [];
  };

  let p = dLen;
  while (p < total) {
    let bestLen = 0;
    let bestDist = 0;
    if (p + 2 < total) {
      const h = hash3(p);
      let cand = head[h];
      let probes = 0;
      const maxLen = Math.min(130, total - p);
      while (cand >= 0 && p - cand <= 65535 && probes < 24) {
        if (buf[cand] === buf[p] && buf[cand + 1] === buf[p + 1] && buf[cand + 2] === buf[p + 2]) {
          let l = 3;
          while (l < maxLen && buf[cand + l] === buf[p + l]) l++;
          if (l > bestLen) {
            bestLen = l;
            bestDist = p - cand;
            if (l === maxLen) break;
          }
        }
        cand = prev[cand];
        probes++;
      }
      prev[p] = head[h];
      head[h] = p;
    }

    if (bestLen >= 4) {
      flushLit();
      out.push(0x80 | (bestLen - 3));
      out.push(bestDist & 0xff, (bestDist >>> 8) & 0xff);
      for (let k = 1; k < bestLen && p + k + 2 < total; k++) {
        const hk = hash3(p + k);
        prev[p + k] = head[hk];
        head[hk] = p + k;
      }
      p += bestLen;
    } else {
      litBuf.push(buf[p]);
      p++;
    }
  }
  flushLit();
  return new Uint8Array(out);
}

export function lzDecompress(bytes, { useDict = true } = {}) {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dict = useDict ? RATCORE_DICT_V1 : new Uint8Array(0);
  const out = Array.from(dict);
  const dLen = dict.length;
  let i = 0;
  while (i < src.length) {
    const tag = src[i++];
    if (tag & 0x80) {
      const len = (tag & 0x7f) + 3;
      const dist = src[i] | (src[i + 1] << 8);
      i += 2;
      const start = out.length - dist;
      for (let k = 0; k < len; k++) out.push(out[start + k]);
    } else {
      const len = tag + 1;
      for (let k = 0; k < len && i < src.length; k++) out.push(src[i++]);
    }
  }
  return new Uint8Array(out.slice(dLen));
}
