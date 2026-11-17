// RatCore World — 64-битный ID грани (BigInt) и встроенное состояние износа (F-07, F-08)
// Битовая раскладка (64 бита):
//   [63..61] s (3 бита): сторона (0=верх, 1=восток, 2=запад, 3=север, 4=юг)
//   [60..45] i (16 бит, смещение +32768): координата X кубика
//   [44..29] j (16 бит, смещение +32768): координата Y кубика
//   [28..16] k (13 бит, смещение +4096):  высота Z/h кубика
//   [15..4]  t (12 бит): текстура/состояние (0..2047 целая, 2048..4094 битая, 4095 сломана)
//   [3..0]   n (4 бита): слой (0..15)

export const FACE_SIDE = Object.freeze({
  TOP: 0,
  EAST: 1,
  WEST: 2,
  NORTH: 3,
  SOUTH: 4,
});

export const FACE_BROKEN_TEX = 4095;
export const FACE_DAMAGE_OFFSET = 2048;

const BIAS_IJ = 32768;
const BIAS_K = 4096;

export function packFaceId({ s = 0, i = 0, j = 0, k = 0, t = 0, n = 0 }) {
  const sb = BigInt(s & 0x7);
  const ib = BigInt((i + BIAS_IJ) & 0xffff);
  const jb = BigInt((j + BIAS_IJ) & 0xffff);
  const kb = BigInt((k + BIAS_K) & 0x1fff);
  const tb = BigInt(t & 0xfff);
  const nb = BigInt(n & 0xf);
  return (sb << 61n) | (ib << 45n) | (jb << 29n) | (kb << 16n) | (tb << 4n) | nb;
}

export function unpackFaceId(faceId) {
  const v = BigInt(faceId);
  const s = Number((v >> 61n) & 0x7n);
  const i = Number((v >> 45n) & 0xffffn) - BIAS_IJ;
  const j = Number((v >> 29n) & 0xffffn) - BIAS_IJ;
  const k = Number((v >> 16n) & 0x1fffn) - BIAS_K;
  const t = Number((v >> 4n) & 0xfffn);
  const n = Number(v & 0xfn);
  const state = t === FACE_BROKEN_TEX ? 'broken' : (t >= FACE_DAMAGE_OFFSET ? 'damaged' : 'intact');
  const baseTex = state === 'broken' ? -1 : (t >= FACE_DAMAGE_OFFSET ? t - FACE_DAMAGE_OFFSET : t);
  return { s, i, j, k, t, n, state, baseTex };
}

export function damageFaceId(faceId) {
  const f = unpackFaceId(faceId);
  if (f.state === 'broken') return faceId;
  if (f.state === 'damaged') return packFaceId({ ...f, t: FACE_BROKEN_TEX });
  return packFaceId({ ...f, t: f.baseTex + FACE_DAMAGE_OFFSET });
}

export function breakFaceId(faceId) {
  const f = unpackFaceId(faceId);
  return packFaceId({ ...f, t: FACE_BROKEN_TEX });
}
