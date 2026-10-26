// ============================================================
//  Материал местности: смешивание 4 текстур по весам (splat).
//  Веса считаются при генерации: песок / трава / камень / земля.
//  Плюс мокрый песок у воды и крупная пятнистость против «плитки».
// ============================================================

import * as THREE from 'three';

export function createTerrainMaterial(textures) {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGrass = { value: textures.grass };
    shader.uniforms.uSand = { value: textures.sand };
    shader.uniforms.uRock = { value: textures.rock };
    shader.uniforms.uDirt = { value: textures.dirt };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute vec4 splat;
         varying vec4 vSplat;
         varying vec3 vWPos;
         varying vec3 vWNormal;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vSplat = splat;
         vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vWNormal = normalize(mat3(modelMatrix) * objectNormal);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform sampler2D uGrass;
         uniform sampler2D uSand;
         uniform sampler2D uRock;
         uniform sampler2D uDirt;
         varying vec4 vSplat;
         varying vec3 vWPos;
         varying vec3 vWNormal;

         // лёгкое искажение координат — текстура не выглядит «плиткой»
         vec2 warpUV(vec2 uv, float scale) {
           float n = texture2D(uGrass, uv * 0.07 * scale).r;
           float m = texture2D(uGrass, uv * 0.031 * scale + 0.37).r;
           return uv + vec2(n - 0.5, m - 0.5) * 0.55;
         }`
      )
      .replace(
        '#include <map_fragment>',
        `
         vec2 uvNear = vWPos.xz * 0.9;
         vec2 uvFar = vWPos.xz * 0.085;
         vec2 uvA = warpUV(uvNear, 1.0);
         vec2 uvB = warpUV(uvFar, 2.0);

         vec3 cGrass = texture2D(uGrass, uvA).rgb;
         vec3 cSand = texture2D(uSand, uvA * 1.15).rgb;
         vec3 cRock = texture2D(uRock, uvA * 0.85).rgb;
         vec3 cDirt = texture2D(uDirt, uvA * 1.1).rgb;

         // крупный рисунок: рельефные пятна одного масштаба
         float macro = texture2D(uGrass, uvB).r;
         // второй, более мелкий рисунок — пятна голой земли, мха и сухой травы
         float macro2 = texture2D(uDirt, uvB * 2.9 + vec2(0.21, 0.63)).r;
         float macro3 = texture2D(uRock, uvB * 6.1 - vec2(0.44, 0.17)).r;

         // склон: чем круче, тем больше камня
         float slope = 1.0 - clamp(vWNormal.y, 0.0, 1.0);
         vec4 w = vSplat;
         w.z += smoothstep(0.22, 0.62, slope) * 1.6;   // камень на обрывах
         w.w += smoothstep(0.4, 0.9, slope) * 0.25;
         float wsum = max(w.x + w.y + w.z + w.w, 0.0001);
         w /= wsum;

         // пятна земли прямо в траве: утоптанные прогалины и проплешины
         float bare = smoothstep(0.56, 0.84, macro2 * 0.7 + macro3 * 0.45);
         w.w += bare * w.x * 1.25;
         // мох в сырых низинах — свой оттенок, а не «трава темнее»
         float moss = smoothstep(0.58, 0.82, macro3) * w.x;
         float wsum2 = max(w.x + w.y + w.z + w.w, 0.0001);
         w /= wsum2;

         vec3 cMoss = vec3(0.30, 0.42, 0.20);
         vec3 mixTex = cGrass * w.x * (1.0 - bare * 0.55) * (1.0 - moss * 0.5)
                     + cSand * w.y
                     + cRock * w.z
                     + cDirt * w.w
                     + cMoss * moss * 0.5;

         // цвет биома — основа; текстура даёт яркость (рельеф) и оттенок
         vec3 base = diffuseColor.rgb;
         float baseLum = dot(base, vec3(0.299, 0.587, 0.114));
         float texLum = dot(mixTex, vec3(0.299, 0.587, 0.114));

         // относительная яркость текстуры вокруг её среднего (0.55), сжатая в безопасный диапазон
         float rel = texLum / 0.55;
         // текстура должна читаться под ногами: контраст и вклад выше,
         // но без выкручивания в белое/чёрное
         rel = clamp(mix(1.0, rel, 1.5), 0.5, 1.62);

         // оттенок текстуры подмешиваем лишь частично, чтобы не сбить палитру биома
         vec3 hueTex = mixTex / max(texLum, 0.03);
         // оттенок текстуры подмешиваем умеренно: цвет биома (разные оттенки
         // травы) должен читаться, а не растворяться в одной карте
         vec3 hue = mix(vec3(1.0), hueTex, 0.34);

         // крупная пятнистость: трава и песок «дышат» пятнами
         float macroMod = mix(0.86, 1.14, macro);

         diffuseColor.rgb = base * rel * hue * macroMod;

         // псевдо-рельеф: высокочастотная карта чуть подсвечивает грани
         float hi = texture2D(uGrass, uvA * 3.1).r - 0.5;
         diffuseColor.rgb *= 1.0 + hi * 0.3;
         // мелкая галька и комочки: под ногами видно «зерно» земли
         float peb = texture2D(uRock, uvA * 4.3 + vec2(0.13, 0.71)).r;
         float gravel = smoothstep(0.62, 0.82, peb) * (1.0 - w.x * 0.4);
         diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.22 + vec3(0.04, 0.035, 0.025), gravel * 0.5);
         // --- трава из разных оттенков: крупные пятна прямо под ногами ---
         float tFresh = texture2D(uGrass, uvA * 0.19 + vec2(0.31, 0.07)).g;
         float tDry   = texture2D(uDirt,  uvA * 0.13 + vec2(0.70, 0.44)).r;
         float tLush  = texture2D(uGrass, uvA * 0.31 - vec2(0.12, 0.55)).b;
         float tDark  = texture2D(uDirt,  uvA * 0.07 + vec2(0.05, 0.91)).g;

         float patchDry  = smoothstep(0.42, 0.72, tDry * 0.65 + tLush * 0.35);
         float patchLush = smoothstep(0.44, 0.76, tFresh * 0.7 + (1.0 - tDry) * 0.3);
         float patchDark = smoothstep(0.50, 0.82, tDark * 0.8 + tFresh * 0.25);

         // крупные пятна по «далёкой» карте: луг, выгоревшая трава, тень
         float farDry = smoothstep(0.40, 0.70, texture2D(uDirt, uvB * 0.35 + vec2(0.61, 0.13)).r);
         float farLush = smoothstep(0.42, 0.72, texture2D(uGrass, uvB * 0.31 - vec2(0.22, 0.48)).g);

         vec3 grassTint = vec3(1.0);
         grassTint = mix(grassTint, vec3(1.62, 1.34, 0.70), patchDry * w.x * 1.5);    // сухая, жёлтая
         grassTint = mix(grassTint, vec3(0.72, 1.42, 0.68), patchLush * w.x * 1.35);  // свежая, зелёная
         grassTint = mix(grassTint, vec3(0.52, 0.82, 0.56), patchDark * w.x * 1.2);   // тёмная, тенистая
         grassTint = mix(grassTint, vec3(1.35, 1.30, 0.86), farDry * w.x * 0.95);     // выгоревший луг
         grassTint = mix(grassTint, vec3(0.86, 1.18, 0.74), farLush * w.x * 0.8);     // сочная зелень
         diffuseColor.rgb *= grassTint;

         // выгоревшая на солнце трава — тёплый оттенок пятнами
         diffuseColor.rgb *= mix(vec3(1.0), vec3(1.07, 1.0, 0.86), smoothstep(0.55, 0.85, macro3) * w.x);

         // мокрый песок у воды темнее и холоднее
         float wet = 1.0 - smoothstep(0.25, 1.1, vWPos.y);
         diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.62, 0.66, 0.7), wet);
        `
      );

    material.userData.shader = shader;
  };

  // пересобирать шейдер при смене материала не нужно, но кэш ключей обязателен
  material.customProgramCacheKey = () => 'lastshore-terrain-v5';
  return material;
}

/** Материал растений: детальная карта + лёгкое покачивание на ветру */
function withRepeat(map, repeat) {
  if (!map || !repeat) return map;
  const clone = map.clone();
  clone.wrapS = clone.wrapT = THREE.RepeatWrapping;
  clone.repeat.set(repeat[0], repeat[1]);
  clone.needsUpdate = true;
  return clone;
}

export function createPlantMaterial(map, { sway = 0.035, name = 'plant', repeat = null } = {}) {
  const material = new THREE.MeshStandardMaterial({
    map: withRepeat(map, repeat),
    vertexColors: true,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });

  const uniforms = { uTime: { value: 0 }, uSway: { value: sway } };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uSway = uniforms.uSway;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         uniform float uSway;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         #ifdef USE_INSTANCING
           vec3 iPos = instanceMatrix[3].xyz;
         #else
           vec3 iPos = vec3(0.0);
         #endif
         float phase = iPos.x * 0.21 + iPos.z * 0.17;
         float wind = sin(uTime * 1.15 + phase) * 0.6 + sin(uTime * 2.3 + phase * 1.7) * 0.25;
         float h = max(transformed.y, 0.0);
         transformed.x += wind * uSway * h;
         transformed.z += wind * uSway * h * 0.6;`
      );

    material.userData.shader = shader;
  };

  material.customProgramCacheKey = () => 'lastshore-plant-' + name;
  material.userData.uniforms = uniforms;
  return material;
}

/** Материал для камней: карта без покачивания */
export function createStoneMaterial(map, { repeat = null } = {}) {
  const material = new THREE.MeshStandardMaterial({
    map: withRepeat(map, repeat),
    vertexColors: true,
    roughness: 0.85,
    metalness: 0,
    flatShading: true,
  });
  material.customProgramCacheKey = () => 'lastshore-stone-v1';
  return material;
}
