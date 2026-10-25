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

         // склон: чем круче, тем больше камня
         float slope = 1.0 - clamp(vWNormal.y, 0.0, 1.0);
         vec4 w = vSplat;
         w.z += smoothstep(0.22, 0.62, slope) * 1.6;   // камень на обрывах
         w.w += smoothstep(0.4, 0.9, slope) * 0.25;
         float wsum = max(w.x + w.y + w.z + w.w, 0.0001);
         w /= wsum;

         vec3 mixTex = cGrass * w.x + cSand * w.y + cRock * w.z + cDirt * w.w;

         // цвет биома — основа; текстура даёт яркость (рельеф) и оттенок
         vec3 base = diffuseColor.rgb;
         float baseLum = dot(base, vec3(0.299, 0.587, 0.114));
         float texLum = dot(mixTex, vec3(0.299, 0.587, 0.114));

         // относительная яркость текстуры вокруг её среднего (0.55), сжатая в безопасный диапазон
         float rel = texLum / 0.55;
         // текстура должна читаться под ногами: контраст и вклад выше,
         // но без выкручивания в белое/чёрное
         rel = clamp(mix(1.0, rel, 2.35), 0.34, 1.95);

         // оттенок текстуры подмешиваем лишь частично, чтобы не сбить палитру биома
         vec3 hueTex = mixTex / max(texLum, 0.03);
         vec3 hue = mix(vec3(1.0), hueTex, 0.58);

         // крупная пятнистость: трава и песок «дышат» пятнами
         float macroMod = mix(0.9, 1.1, macro);

         diffuseColor.rgb = base * rel * hue * macroMod;

         // псевдо-рельеф: высокочастотная карта чуть подсвечивает грани
         float hi = texture2D(uGrass, uvA * 3.1).r - 0.5;
         diffuseColor.rgb *= 1.0 + hi * 0.3;

         // мокрый песок у воды темнее и холоднее
         float wet = 1.0 - smoothstep(0.25, 1.1, vWPos.y);
         diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.62, 0.66, 0.7), wet);
        `
      );

    material.userData.shader = shader;
  };

  // пересобирать шейдер при смене материала не нужно, но кэш ключей обязателен
  material.customProgramCacheKey = () => 'lastshore-terrain-v1';
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
