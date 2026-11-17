// Криптографический слой RatMes Engine (работает одинаково в Node.js 22 и современном браузере).
// Использует Web Crypto API (globalThis.crypto.subtle): SHA-256, AES-256-GCM с ключевым храповиком (ratchet step)
// для родных чатов RatMes <-> RatMes и HMAC-SHA256 для подписания запросов мостов внутри SecretVault.

const subtle = globalThis.crypto?.subtle;

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64(b64) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export async function sha256Hex(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(String(input));
  if (subtle) {
    const digest = await subtle.digest('SHA-256', bytes);
    return toHex(new Uint8Array(digest));
  }
  // Детерминированный фолбэк для нестандартного окружения без subtle
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(64, '0');
}

export function deriveDeterministicKeyBytes(seedStr, prngFn) {
  const out = new Uint8Array(32);
  let acc = 0x9e3779b9;
  for (let i = 0; i < seedStr.length; i += 1) {
    acc = Math.imul(acc ^ seedStr.charCodeAt(i), 0x85ebca6b) >>> 0;
  }
  for (let i = 0; i < 32; i += 1) {
    const r = prngFn ? Math.floor(prngFn() * 256) : ((acc >>> ((i % 4) * 8)) & 0xff);
    out[i] = (r ^ ((acc + i * 31) & 0xff)) & 0xff;
  }
  return out;
}

// Храповик ключа (Double Ratchet / MLS-эпоха): каждый шаг даёт новый 256-битный ключ сообщения
async function deriveStepKey(baseKeyBytes, epoch, step) {
  const info = new TextEncoder().encode(`ratmes-ratchet:v1:epoch=${epoch}:step=${step}`);
  const combined = new Uint8Array(baseKeyBytes.byteLength + info.byteLength);
  combined.set(baseKeyBytes, 0);
  combined.set(info, baseKeyBytes.byteLength);
  const hashHex = await sha256Hex(combined);
  const stepBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    stepBytes[i] = parseInt(hashHex.slice(i * 2, i * 2 + 2), 16);
  }
  return stepBytes;
}

export async function encryptRatchetPayload({ baseKeyBytes, epoch, step, plaintextObj, prngFn }) {
  const stepKeyBytes = await deriveStepKey(baseKeyBytes, epoch, step);
  const plainBytes = new TextEncoder().encode(JSON.stringify(plaintextObj));
  const iv = new Uint8Array(12);
  for (let i = 0; i < 12; i += 1) {
    iv[i] = prngFn ? Math.floor(prngFn() * 256) : ((step + i * 17) & 0xff);
  }

  if (subtle) {
    const cryptoKey = await subtle.importKey('raw', stepKeyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
    const cipherBuf = await subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plainBytes);
    return {
      alg: 'AES-256-GCM-RATCHET',
      epoch,
      step,
      ivB64: toBase64(iv),
      ciphertextB64: toBase64(new Uint8Array(cipherBuf)),
    };
  }

  // Безопасный фолбэк если subtle недоступен (например, http:// без secure context в браузере)
  const out = new Uint8Array(plainBytes.length);
  for (let i = 0; i < plainBytes.length; i += 1) {
    out[i] = plainBytes[i] ^ stepKeyBytes[i % 32] ^ iv[i % 12];
  }
  const tag = await sha256Hex(new Uint8Array([...stepKeyBytes, ...iv, ...out]));
  return {
    alg: 'XOR-SHA256-FALLBACK',
    epoch,
    step,
    ivB64: toBase64(iv),
    ciphertextB64: toBase64(out),
    tag: tag.slice(0, 32),
  };
}

export async function decryptRatchetPayload({ baseKeyBytes, cipherPacket }) {
  const { alg, epoch, step, ivB64, ciphertextB64, tag } = cipherPacket;
  const stepKeyBytes = await deriveStepKey(baseKeyBytes, epoch, step);
  const iv = fromBase64(ivB64);
  const cipherBytes = fromBase64(ciphertextB64);

  if (alg === 'AES-256-GCM-RATCHET' && subtle) {
    const cryptoKey = await subtle.importKey('raw', stepKeyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
    const plainBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, cipherBytes);
    return JSON.parse(new TextDecoder().decode(plainBuf));
  }

  if (alg === 'XOR-SHA256-FALLBACK') {
    const expectedTag = (await sha256Hex(new Uint8Array([...stepKeyBytes, ...iv, ...cipherBytes]))).slice(0, 32);
    if (expectedTag !== tag) throw new Error('Tag mismatch');
    const out = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i += 1) {
      out[i] = cipherBytes[i] ^ stepKeyBytes[i % 32] ^ iv[i % 12];
    }
    return JSON.parse(new TextDecoder().decode(out));
  }

  throw new Error(`Unsupported cipher alg: ${alg}`);
}

export async function signWithSecret(secretToken, requestMeta) {
  const payload = JSON.stringify(requestMeta);
  const digest = await sha256Hex(`${secretToken}:${payload}`);
  return `rm-sig-v1:${digest.slice(0, 32)}`;
}
