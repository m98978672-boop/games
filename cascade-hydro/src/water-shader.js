// ============================================================================
//  ФОТОРЕАЛИСТИЧНЫЕ ШЕЙДЕРЫ БАССЕЙНА, ЖИВОЙ ВОДЫ, ПЕРЕЛИВОВ И 32 ТИПОВ ЗДАНИЙ v0.3
//  - Альпийские ледники/снежники с таянием, бегущие тени облаков, страты пород и dFdx/dFdy рельеф
//  - 3-октавная гидрооптика воды (рябь + ветровая зыбь бьефа + каустика Вороного + Бугер—Ламберт)
//  - Анимированный шейдер 3D-перелива воды через гребень плотин и лотки водосбросов!
//  - Архитектурный мега-атлас (64 паттерна × 432 оттенка) для 32 типов зданий и заводов
// ============================================================================

import * as THREE from 'three';
import { createWaterDetailTexture } from './textures.js';

export { createWaterDetailTexture };

/** 1. Материал рельефа долины (0.8 / 5 / 10 км) со снежниками, тенями облаков, стратами скал и бетоном */
export function createValleyTerrainMaterial(detailTex, concreteMap = null) {
  const uniforms = {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
    uSunColor: { value: new THREE.Color(0xfff4dc) },
    uSkyColor: { value: new THREE.Color(0x6da8e8) },
    uFogColor: { value: new THREE.Color(0xa8cae8) },
    uFogDensity: { value: 0.00012 },
    uShowContours: { value: 0.0 },
    uSnowLine: { value: 122.0 },
    uMeltOffset: { value: 0.0 },
    uElevScale: { value: 2.35 },
    uHorizScale: { value: 6.51 },
    uMapHalf: { value: 2500.0 },
    uDetailTex: { value: detailTex },
    uConcreteTex: { value: concreteMap || detailTex },
    uHasConcreteTex: { value: concreteMap ? 1.0 : 0.0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    extensions: { derivatives: true },
    vertexShader: /* glsl */ `
      attribute vec4 aTerrainMeta; // x = soil, y = concrete, z = wetness, w = waterDepth
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec4 vMeta;

      void main() {
        vMeta = aTerrainMeta;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyColor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform float uShowContours;
      uniform float uSnowLine;
      uniform float uMeltOffset;
      uniform float uElevScale;
      uniform float uHorizScale;
      uniform float uMapHalf;
      uniform sampler2D uDetailTex;
      uniform sampler2D uConcreteTex;
      uniform float uHasConcreteTex;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec4 vMeta;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm3(vec2 p) {
        float v = 0.0;
        v += 0.52 * vnoise(p);
        v += 0.31 * vnoise(p * 2.13 + vec2(7.3, 3.1));
        v += 0.17 * vnoise(p * 4.47 - vec2(2.9, 9.4));
        return v;
      }

      void main() {
        vec3 Ngeom = normalize(vNormalW);
        float slope = 1.0 - clamp(Ngeom.y, 0.0, 1.0);
        float soil = vMeta.x;
        float concrete = vMeta.y;
        float wetness = clamp(vMeta.z, 0.0, 1.0);
        float subDepth = max(0.0, vMeta.w);

        float camDist = length(cameraPosition - vWorldPos);
        float invScale = 1.0 / max(1.0, pow(uHorizScale, 0.55));
        vec2 uvMacro = vWorldPos.xz * (0.024 * invScale);
        vec2 uvMid   = vWorldPos.xz * (0.14 * invScale);
        vec2 uvFine  = vWorldPos.xz * (0.72 * invScale);

        float nMacro = fbm3(uvMacro);
        float nMid   = fbm3(uvMid);
        float nFine  = vnoise(uvFine);

        // --- 1. Слоистые породы (розовый гранит, серый гнейс, базальт, кварцевые жилы, лишайник) ---
        vec3 triW = pow(abs(Ngeom), vec3(4.0));
        triW /= max(0.001, triW.x + triW.y + triW.z);

        float strataY = vWorldPos.y * (0.52 / max(1.0, uElevScale * 0.7)) + nMacro * 3.8;
        float strata = sin(strataY * 3.1) * 0.5 + 0.5;
        float strataSharp = smoothstep(0.22, 0.78, strata);
        float triGrain = fbm3(vWorldPos.zy * 0.28 * invScale) * triW.x
                       + fbm3(vWorldPos.xz * 0.28 * invScale) * triW.y
                       + fbm3(vWorldPos.xy * 0.28 * invScale) * triW.z;
        float fissure = smoothstep(0.70, 0.90, abs(triGrain * 2.0 - 1.0));

        vec3 graniteWarm = vec3(0.49, 0.44, 0.40);
        vec3 gneissCool  = vec3(0.30, 0.33, 0.38);
        vec3 basaltDark  = vec3(0.20, 0.22, 0.26);
        vec3 rockCol = mix(gneissCool, graniteWarm, strataSharp);
        rockCol = mix(rockCol, basaltDark, smoothstep(0.62, 0.92, nMacro) * 0.45);
        rockCol *= (0.80 + 0.38 * triGrain);
        rockCol *= (1.0 - fissure * 0.36);

        float lichenMask = smoothstep(0.58, 0.80, nMid) * (1.0 - smoothstep(0.30, 0.62, slope));
        rockCol = mix(rockCol, vec3(0.40, 0.49, 0.31), lichenMask * 0.52);

        // --- 2. Пойменные луга, клевер, агро-поля, песчаные косы и донная галька ---
        vec3 lushGrass   = vec3(0.20, 0.43, 0.17);
        vec3 cloverGrass = vec3(0.29, 0.51, 0.21);
        vec3 alpineHerb  = vec3(0.43, 0.47, 0.24);
        vec3 goldenCrop  = vec3(0.56, 0.50, 0.23);

        float altNorm = vWorldPos.y / max(1.0, uElevScale);
        float meadowAlt = smoothstep(14.0, 44.0, altNorm);
        vec3 grassCol = mix(lushGrass, cloverGrass, smoothstep(0.32, 0.70, nMacro));
        grassCol = mix(grassCol, alpineHerb, meadowAlt * 0.68);

        // Возделанные полосы сельхозполей на восточных террасах Агродолины
        float agroZone = smoothstep(60.0 * uHorizScale, 150.0 * uHorizScale, vWorldPos.x)
                       * (1.0 - smoothstep(140.0 * uHorizScale, 280.0 * uHorizScale, abs(vWorldPos.z - 80.0 * uHorizScale)))
                       * (1.0 - smoothstep(0.08, 0.22, slope));
        float cropStripe = step(0.5, fract((vWorldPos.x + vWorldPos.z * 0.4) * 0.045 * invScale));
        grassCol = mix(grassCol, mix(cloverGrass * 1.08, goldenCrop, cropStripe), agroZone * 0.62);
        grassCol += (nFine - 0.5) * 0.06;

        vec3 clayLoam = mix(vec3(0.43, 0.32, 0.21), vec3(0.55, 0.43, 0.29), nMid);
        float cobblePattern = smoothstep(0.34, 0.74, vnoise(vWorldPos.xz * 2.2 * invScale));
        vec3 riverGravel = mix(vec3(0.39, 0.37, 0.33), vec3(0.59, 0.55, 0.48), cobblePattern);
        vec3 sandyShoal  = vec3(0.66, 0.60, 0.46);

        float rockMask = clamp(smoothstep(0.33, 0.57, slope) + (1.0 - smoothstep(0.30, 1.35, soil)), 0.0, 1.0);
        float bareCutMask = clamp(smoothstep(0.18, 0.40, slope) * (1.0 - rockMask), 0.0, 1.0);
        float gravelMask = clamp(smoothstep(0.15, 0.72, wetness) * (1.0 - smoothstep(0.42, 0.70, slope)), 0.0, 1.0);
        float shoalMask  = clamp((1.0 - smoothstep(0.0, 2.2, altNorm - 11.0)) * (1.0 - slope * 3.0) * wetness, 0.0, 0.65);

        vec3 naturalCol = mix(grassCol, clayLoam, bareCutMask * 0.78);
        naturalCol = mix(naturalCol, riverGravel, gravelMask * 0.85);
        naturalCol = mix(naturalCol, sandyShoal, shoalMask);
        naturalCol = mix(naturalCol, rockCol, rockMask);

        // --- 3. Альпийские снежники и голубоватый глетчерный фирн на вершинах (тают днём!) ---
        float dynSnowLine = uSnowLine + uMeltOffset + (nMacro - 0.5) * 18.0 * max(1.0, uElevScale * 0.6);
        float snowMask = smoothstep(dynSnowLine - 8.0, dynSnowLine + 14.0, vWorldPos.y)
                       * (1.0 - smoothstep(0.52, 0.82, slope));
        vec3 snowPure = mix(vec3(0.84, 0.91, 0.98), vec3(0.97, 0.98, 1.0), nMid);
        naturalCol = mix(naturalCol, snowPure, snowMask);

        // --- 4. Гидротехнический бетон плотин и облицованных каналов ---
        float concMask = smoothstep(0.05, 0.34, concrete);
        vec3 concSample = vec3(0.68, 0.71, 0.75);
        if (uHasConcreteTex > 0.5 && concMask > 0.01) {
          vec3 cx = texture2D(uConcreteTex, vWorldPos.zy * 0.11).rgb;
          vec3 cy = texture2D(uConcreteTex, vWorldPos.xz * 0.11).rgb;
          vec3 cz = texture2D(uConcreteTex, vWorldPos.xy * 0.11).rgb;
          concSample = cx * triW.x + cy * triW.y + cz * triW.z;
        }
        float algaeZone = wetness * (1.0 - smoothstep(1.2, 4.5, subDepth)) * concMask;
        concSample = mix(concSample, vec3(0.24, 0.35, 0.24), algaeZone * 0.46);

        vec3 col = mix(naturalCol, concSample, concMask);
        float wetDarken = mix(1.0, 0.58, wetness * (1.0 - concMask * 0.32) * (1.0 - snowMask));
        col *= wetDarken;

        // --- 5. Экранный микрорельеф нормалей (dFdx/dFdy) ---
        float bumpFade = 1.0 - smoothstep(120.0 * uHorizScale, 420.0 * uHorizScale, camDist);
        float microHeight = mix(nFine * 0.42 + nMid * 0.58, triGrain * 0.72 + strataSharp * 0.28, rockMask);
        microHeight = mix(microHeight, cobblePattern, gravelMask * 0.65);

        vec3 dPosX = dFdx(vWorldPos);
        vec3 dPosY = dFdy(vWorldPos);
        float dHx = dFdx(microHeight) * bumpFade;
        float dHy = dFdy(microHeight) * bumpFade;

        vec3 r1 = cross(dPosY, Ngeom);
        vec3 r2 = cross(Ngeom, dPosX);
        float det = dot(dPosX, r1);
        vec3 surfGrad = sign(det) * (dHx * r1 + dHy * r2);
        float bumpStrength = mix(0.28, 0.58, rockMask);
        vec3 N = normalize(abs(det) > 1e-7 ? (abs(det) * Ngeom - bumpStrength * surfGrad) : Ngeom);

        // --- 6. Освещение + бегущие тени кучевых облаков по долине ---
        vec2 cloudUv = vWorldPos.xz * (0.0018 / max(1.0, uHorizScale * 0.35)) + vec2(uTime * 0.0065, uTime * 0.0038);
        float cloudNoise = fbm3(cloudUv);
        float cloudShadow = 1.0 - smoothstep(0.54, 0.78, cloudNoise) * 0.28;

        float NdotL = max(0.0, dot(N, uSunDir)) * cloudShadow;
        float hemi = 0.5 + 0.5 * N.y;
        float cavityAO = mix(0.84, 1.06, clamp(microHeight, 0.0, 1.0));
        vec3 bounceLight = vec3(0.24, 0.21, 0.16) * (1.0 - N.y) * 0.24;
        vec3 lighting = (uSunColor * (NdotL * 0.96) + uSkyColor * (0.29 + 0.30 * hemi) + bounceLight) * cavityAO;

        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 H = normalize(uSunDir + V);
        float wetSpec = pow(max(0.0, dot(N, H)), 56.0) * (wetness * 0.44 + snowMask * 0.30) * cloudShadow;
        vec3 litCol = col * lighting + uSunColor * wetSpec;

        // Адаптивные геодезические изолинии высот (масштабируются под 0.8 / 5 / 10 км!)
        if (uShowContours > 0.5) {
          float minorStep = 2.0 * uElevScale;
          float majorStep = 10.0 * uElevScale;
          float minor = abs(fract(vWorldPos.y / minorStep) - 0.5);
          float major = abs(fract(vWorldPos.y / majorStep) - 0.5);
          float lineMinor = 1.0 - smoothstep(0.014, 0.044, minor);
          float lineMajor = 1.0 - smoothstep(0.011, 0.032, major);
          litCol = mix(litCol, vec3(0.95, 0.86, 0.42), lineMinor * 0.32);
          litCol = mix(litCol, vec3(1.0, 0.97, 0.74), lineMajor * 0.72);
        }

        float fogF = 1.0 - exp(-pow(camDist * uFogDensity, 1.62));
        float edgeRatio = max(abs(vWorldPos.x), abs(vWorldPos.z)) / max(100.0, uMapHalf);
        float edgeMist = smoothstep(0.91, 1.00, edgeRatio) * 0.62;
        litCol = mix(litCol, uFogColor, clamp(max(fogF * 0.88, edgeMist), 0.0, 0.94));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `,
  });
}

/** 2. Улучшенный шейдер живой воды (6-гармониковая рябь + зыбь водохранилища + каустика Вороного + Френель Шлика) */
export function createRealisticWaterMaterial(detailTex) {
  const uniforms = {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
    uSunColor: { value: new THREE.Color(0xfff5e0) },
    uSkyZenith: { value: new THREE.Color(0x2864ad) },
    uSkyHorizon: { value: new THREE.Color(0xa6cde8) },
    uFogColor: { value: new THREE.Color(0xa8cae8) },
    uFogDensity: { value: 0.00012 },
    uHorizScale: { value: 6.51 },
    uElevScale: { value: 2.35 },
    uMapHalf: { value: 2500.0 },
    uDetailTex: { value: detailTex },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uHorizScale;
      uniform float uElevScale;

      attribute vec4 aHydro1;
      attribute vec4 aHydro2;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;
      varying float vWaveCrest;

      void main() {
        vHydro1 = aHydro1;
        vHydro2 = aHydro2;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);

        float depth = aHydro1.x;
        vec2 vel = aHydro1.yz;
        float speed = length(vel);
        float vort = aHydro2.y;

        // 3D-геометрическое движение волн Герстнера + стоячие буруны горных перекатов (с мягким демпфированием у кромки берега!)
        float optDepth = depth / max(1.0, pow(uElevScale, 0.58));
        float shoreDamp = smoothstep(0.05, 0.55, optDepth) * step(0.05, aHydro2.w);
        float wScale = 1.0 / max(1.0, pow(uHorizScale, 0.56));

        vec2 p = worldPos.xz * wScale;
        float w1 = sin(dot(p, vec2(0.115, 0.082)) - uTime * 2.05);
        float w2 = sin(dot(p, vec2(-0.086, 0.128)) - uTime * 1.62 + 1.4);

        vec2 flowDir = speed > 0.03 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 crossDir = vec2(-flowDir.y, flowDir.x);
        float along = dot(p, flowDir);
        float across = dot(p, crossDir);
        float riffle = sin(along * 0.29 - uTime * (2.9 + min(speed, 12.0) * 0.52))
                     * cos(across * 0.21 + uTime * 1.15 + vort * 0.35);

        float waveAmp = (0.045 + clamp(speed * 0.022, 0.0, 0.20)) * pow(uElevScale, 0.55) * shoreDamp;
        float dy = (w1 * 0.42 + w2 * 0.33 + riffle * (0.25 + clamp(speed * 0.08, 0.0, 0.55))) * waveAmp;

        worldPos.y += dy;
        worldPos.xz += flowDir * (riffle * waveAmp * 0.22);

        vWaveCrest = clamp((w1 * 0.4 + w2 * 0.35 + riffle * 0.5) * 0.5 + 0.5, 0.0, 1.0) * shoreDamp;
        vWorldPos = worldPos.xyz;

        vec3 baseMacroN = normalize(mat3(modelMatrix) * normal);
        vec3 waveTilt = vec3(
          -(w1 * 0.032 - w2 * 0.024 + riffle * flowDir.x * 0.045) * shoreDamp,
          0.0,
          -(w1 * 0.024 + w2 * 0.032 + riffle * flowDir.y * 0.045) * shoreDamp
        );
        vMacroNormal = normalize(baseMacroN + waveTilt);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyZenith;
      uniform vec3 uSkyHorizon;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform float uHorizScale;
      uniform float uElevScale;
      uniform float uMapHalf;
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;
      varying float vWaveCrest;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.51, 567.89));
        p += dot(p, p + 33.41);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        float depth = vHydro1.x;
        if (depth <= 0.010 || vHydro2.w < 0.05) discard;

        vec2 vel = vHydro1.yz;
        float speed = length(vel);
        float foamVal = clamp(vHydro1.w, 0.0, 1.0);
        float sediment = clamp(vHydro2.x, 0.0, 1.4);
        float vort = vHydro2.y;
        float isConcreteBed = clamp(vHydro2.z, 0.0, 1.0);

        vec3 V = normalize(cameraPosition - vWorldPos);
        float dist = length(cameraPosition - vWorldPos);
        float uvScale = 1.0 / max(1.0, pow(uHorizScale, 0.62));
        float optDepth = depth / max(1.0, pow(uElevScale, 0.68));

        // --- 1. 3-октавная адвекция волн: крупная ветровая зыбь бьефа + речная струя + микро-рябь ---
        vec2 flowDir = speed > 0.02 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 flowStep = vel * (0.048 * uvScale);
        float cycle = 1.24;
        float p0 = fract(uTime / cycle);
        float p1 = fract(uTime / cycle + 0.5);
        float blend = abs(2.0 * p0 - 1.0);

        vec2 swellUv = vWorldPos.xz * (0.026 * uvScale) + vec2(uTime * 0.016, -uTime * 0.012);
        vec4 swellSample = texture2D(uDetailTex, swellUv);
        vec2 crossSwellUv = vWorldPos.xz * (0.041 * uvScale) + vec2(-uTime * 0.013, uTime * 0.019);
        vec4 crossSwell = texture2D(uDetailTex, crossSwellUv);

        // Вихревое закручивание Кармана вокруг устоев, камней и поворотов русла
        float swirlAng = clamp(vort, -2.5, 2.5) * 0.22 * sin(uTime * 1.9 + vWorldPos.x * 0.02);
        float cs = cos(swirlAng);
        float sn = sin(swirlAng);
        vec2 swirledXZ = vec2(vWorldPos.x * cs - vWorldPos.z * sn, vWorldPos.x * sn + vWorldPos.z * cs);

        vec2 baseUv = swirledXZ * (0.086 * uvScale);
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = swirledXZ * (0.28 * uvScale) + vec2(vort * 0.08, -vort * 0.08);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.85));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.85) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float distFade = 1.0 - smoothstep(280.0 * uHorizScale, 980.0 * uHorizScale, dist) * 0.58;
        float chopAmp = (0.24 + clamp(speed * 0.058 + froude * 0.16, 0.0, 0.58)) * distFade;

        vec2 dN = (
          (swellSample.xy * 2.0 - 1.0) * 0.34 +
          (crossSwell.xy * 2.0 - 1.0) * 0.26 +
          (waveSample.xy * 2.0 - 1.0) * 0.66 +
          (fineSample.xy * 2.0 - 1.0) * 0.46
        ) * chopAmp;
        vec3 N = normalize(vec3(vMacroNormal.x + dN.x, vMacroNormal.y, vMacroNormal.z + dN.y));

        // --- 2. Преломление подводного русла по закону Снеллиуса (n = 1.333) + двойная каустика Вороного ---
        float daySun = max(0.14, clamp(uSunDir.y + 0.18, 0.0, 1.0));
        vec2 refrXZ = vWorldPos.xz - N.xz * min(optDepth, 4.2) * (0.58 / max(0.25, uvScale));

        float cobbleA = vnoise(refrXZ * 2.4 * uvScale);
        float cobbleB = vnoise(refrXZ * 6.2 * uvScale);
        vec3 gravelBed = mix(vec3(0.40, 0.37, 0.30), vec3(0.62, 0.57, 0.47), cobbleA * 0.65 + cobbleB * 0.35);

        float slabJoint = clamp(step(0.95, fract(refrXZ.x * 0.24 * uvScale)) + step(0.95, fract(refrXZ.y * 0.24 * uvScale)), 0.0, 1.0);
        vec3 concBed = vec3(0.56, 0.60, 0.64) - slabJoint * 0.14 + (cobbleB - 0.5) * 0.08;
        vec3 bedAlbedo = mix(gravelBed, concBed, isConcreteBed);

        vec2 cUv1 = refrXZ * (0.095 * uvScale) + vec2(uTime * 0.036, uTime * 0.025);
        vec2 cUv2 = refrXZ * (0.145 * uvScale) - vec2(uTime * 0.029, -uTime * 0.032);
        float caust = (texture2D(uDetailTex, cUv1).b + texture2D(uDetailTex, cUv2).b) * 0.88 * exp(-optDepth * 0.27) * daySun;
        vec3 sunlitBed = bedAlbedo * (0.36 + 0.86 * daySun) + uSunColor * caust * 0.58;

        // --- 3. Закон Бугера — Ламберта — Бера (кристальная отмель -> бирюза горной реки -> сапфир водохранилища) ---
        float viewCos = max(0.28, abs(dot(N, V)));
        float opticalPath = optDepth / viewCos;

        vec3 sigmaPure = vec3(0.42, 0.088, 0.058);
        vec3 transmittance = exp(-sigmaPure * opticalPath);

        vec3 shallowTurquoise = vec3(0.032, 0.38, 0.42);
        vec3 deepSapphire     = vec3(0.012, 0.11, 0.24);
        vec3 pureScatter = mix(shallowTurquoise, deepSapphire, smoothstep(1.2, 13.5, optDepth)) * (0.30 + 0.85 * daySun);
        vec3 mudScatter = vec3(0.49, 0.36, 0.21) * (0.30 + 0.75 * daySun);
        float mudMask = clamp(sediment * 0.70, 0.0, 0.88);
        vec3 inScatter = mix(pureScatter, mudScatter, mudMask);

        vec3 effTrans = transmittance * (1.0 - mudMask * 0.88);
        vec3 underwaterRadiance = sunlitBed * effTrans + inScatter * (1.0 - effTrans);

        // Подповерхностное изумрудное свечение гребней 3D-волн на солнце (SSS)
        float sss = (pow(clamp(dot(V, -uSunDir + N * 0.65), 0.0, 1.0), 3.0) + vWaveCrest * 0.38) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.045, 0.38, 0.36) * sss * max(0.0, uSunDir.y);

        // --- 4. Точный закон Френеля Шлика (R0 = 0.0204 для пресной воды n = 1.333) и алмазные искры бликов ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = clamp(0.0204 + 0.92 * pow(1.0 - NdotV, 4.8), 0.0204, 0.89);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.22, R.y) * 0.24;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.72)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 480.0) * 3.2;
        float specGlitter = pow(max(0.0, dot(N, H)), 58.0) * 0.36;
        float sparkle = smoothstep(0.76, 0.96, vnoise(vWorldPos.xz * (1.35 * uvScale) + vec2(uTime * 1.9, -uTime * 1.5)))
                      * pow(max(0.0, dot(N, H)), 22.0) * 0.75 * distFade;
        vec3 sunSpec = uSunColor * (specCore + specGlitter + sparkle) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. Продольные струи живого течения, буруны порогов и дышащий прибой у берегов ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(
          dot(vWorldPos.xz, flowDir) * (0.078 * uvScale) - uTime * (0.34 + speed * 0.068 * uvScale),
          dot(vWorldPos.xz, orthoDir) * (0.21 * uvScale)
        );
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.62
                          + texture2D(uDetailTex, anisoUv * 2.35 + vec2(0.31, -uTime * 0.14)).a * 0.38;

        // Тонкие бегущие нити течения вдоль русла реки и каналов
        float currentStreak = smoothstep(0.58, 0.88, lacePattern) * clamp(speed * 0.16, 0.0, 0.42);
        // Дышащий накат волны на отмели и галечные берега
        float shoreLap = (0.55 + 0.45 * sin(optDepth * 24.0 - uTime * 3.2)) * (1.0 - smoothstep(0.012, 0.26, optDepth));
        float shoreMeniscus = shoreLap * clamp(0.18 + speed * 0.24, 0.18, 0.78);
        float whitecap = smoothstep(0.74, 0.98, vWaveCrest) * clamp(speed * 0.14 + froude * 0.25, 0.0, 0.55);

        float totalFoamDrive = clamp(foamVal * 1.28 + shoreMeniscus + currentStreak + whitecap + clamp(froude - 0.98, 0.0, 0.78) * 0.65, 0.0, 1.0);
        float foamMask = smoothstep(0.34 - totalFoamDrive * 0.29, 0.73 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.62);
        vec3 foamColor = vec3(0.96, 0.985, 1.0) * (0.38 + 0.66 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.70);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        float edgeRatioW = max(abs(vWorldPos.x), abs(vWorldPos.z)) / max(100.0, uMapHalf);
        float edgeMistW = smoothstep(0.92, 1.00, edgeRatioW) * 0.55;
        finalCol = mix(finalCol, uFogColor, clamp(max(distFog * 0.88, edgeMistW), 0.0, 0.92));

        float edgeAlpha = smoothstep(0.008, 0.062, optDepth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `,
  });
}

/**
 * 3. Шейдер 3D-анимации перелива воды через гребень плотин и лотки водосбросов!
 * Рисует изогнутые параболические ленты падающей воды с быстрым течением и аэрацией в белую пену.
 */
export function createOverflowWaterMaterial(overflowTex) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uSunFactor: { value: 1.0 },
      uOverflowTex: { value: overflowTex },
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uFogDensity: { value: 0.00012 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        vec3 p = position;
        // Живое пульсирующее колебание падающей водной пелены перелива
        float flutter = sin(uv.x * 13.0 + uTime * 9.5) * cos(uv.y * 8.5 - uTime * 12.0) * 0.035 * uv.y;
        p.x += flutter;
        p.y += flutter * 0.45;
        #ifdef USE_INSTANCING
          vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
        #else
          vec4 wp = modelMatrix * vec4(p, 1.0);
        #endif
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSunFactor;
      uniform sampler2D uOverflowTex;
      uniform vec3 uFogColor;
      uniform float uFogDensity;

      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        // Вода разгоняется под действием гравитации g при падении сверху вниз (vUv.y: 0 -> 1)
        vec2 uvFast = vec2(vUv.x * 1.4, vUv.y * 1.6 - uTime * 2.85);
        vec2 uvFine = vec2(vUv.x * 2.7 + 0.33, vUv.y * 2.4 - uTime * 4.10);

        vec4 s1 = texture2D(uOverflowTex, uvFast);
        vec4 s2 = texture2D(uOverflowTex, uvFine);

        // На гребне (vUv.y ~ 0) вода изумрудно-голубая, к основанию аэрируется в кипящую белую пену!
        float aeration = smoothstep(0.08, 0.88, vUv.y);
        vec3 crestAqua = vec3(0.16, 0.62, 0.76);
        vec3 whiteFoam = vec3(0.95, 0.985, 1.0);
        vec3 col = mix(crestAqua, whiteFoam, clamp(aeration * 0.68 + (s1.r * 0.5 + s2.r * 0.5) * 0.45, 0.0, 1.0));
        col *= (0.42 + 0.64 * uSunFactor);

        // Мягкие края струи слева/справа и плавный вход в нижний бьеф
        float sideFade = smoothstep(0.0, 0.14, vUv.x) * (1.0 - smoothstep(0.86, 1.0, vUv.x));
        float tipFade = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.90, 1.0, vUv.y));
        float alpha = clamp((s1.a * 0.58 + s2.a * 0.48) * sideFade * tipFade * 1.18, 0.0, 0.94);

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        col = mix(col, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/** 4. Архитектурный шейдер 32 типов зданий и промкорпусов с Мега-Атласом 64 текстур × 432 оттенков */
export function createCityFacadeMaterial(roofTex = null, facadeAtlas = null) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.4).normalize() },
      uSunColor: { value: new THREE.Color(0xfff4dc) },
      uSkyColor: { value: new THREE.Color(0x7fb3e8) },
      uNightFactor: { value: 0.0 },
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uFogDensity: { value: 0.00012 },
      uRoofTex: { value: roofTex },
      uHasRoofTex: { value: roofTex ? 1.0 : 0.0 },
      uFacadeAtlas: { value: facadeAtlas || roofTex },
      uHasAtlas: { value: facadeAtlas ? 1.0 : 0.0 },
    },
    vertexShader: /* glsl */ `
      attribute float aPowered;
      attribute float aStyleId;
      attribute float aBuildProg;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;
      varying float vStyleId;
      varying float vBuildProg;

      void main() {
        vLocalPos = position;
        vPowered = aPowered;
        vStyleId = aStyleId;
        vBuildProg = aBuildProg;
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(0.75);
        #endif
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyColor;
      uniform float uNightFactor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform sampler2D uRoofTex;
      uniform float uHasRoofTex;
      uniform sampler2D uFacadeAtlas;
      uniform float uHasAtlas;

      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;
      varying float vStyleId;
      varying float vBuildProg;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.2);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float NdotL = max(0.0, dot(N, uSunDir));
        vec3 baseAlbedo = vColor;

        // Выборка тайла из 8×8 Мега-атласа фасадов по индексу стиля здания (64 фактуры!)
        if (uHasAtlas > 0.5 && N.y <= 0.55) {
          float tileIdx = mod(floor(vStyleId + 0.5), 64.0);
          vec2 tileOrigin = vec2(mod(tileIdx, 8.0), floor(tileIdx / 8.0)) / 8.0;
          float uWall = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 localTileUv = fract(vec2(uWall * 0.14, vWorldPos.y * 0.14)) * (0.84 / 8.0) + (0.08 / 8.0);
          vec3 atlasTex = texture2D(uFacadeAtlas, tileOrigin + localTileUv).rgb;
          baseAlbedo = mix(baseAlbedo, baseAlbedo * (0.62 + 0.72 * atlasTex), 0.65);
        }

        if (N.y > 0.55) {
          float roofEdge = max(abs(vLocalPos.x), abs(vLocalPos.z));
          float parapet = smoothstep(0.41, 0.46, roofEdge);
          vec3 roofGrain = uHasRoofTex > 0.5 ? texture2D(uRoofTex, vWorldPos.xz * 0.25).rgb : vec3(0.55);
          baseAlbedo = mix(roofGrain * mix(vec3(0.68), vColor, 0.42), vColor * 0.88, parapet);
        } else {
          float plinth = 1.0 - smoothstep(0.05, 0.11, vLocalPos.y);
          float cornice = smoothstep(0.93, 0.96, vLocalPos.y);
          float cornerTrim = smoothstep(0.42, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z)));
          float floorBand = step(0.91, fract(vWorldPos.y * 0.34));
          baseAlbedo *= (1.0 - plinth * 0.24 - floorBand * 0.08 + cornice * 0.12 + cornerTrim * 0.08);
        }

        vec3 litWall = baseAlbedo * (uSunColor * NdotL * 0.88 + uSkyColor * (0.30 + 0.26 * max(0.0, N.y)));

        // Реальная поэтапная стройка здания (vBuildProg < 0.96): монолитный каркас этажей и защитная сетка наверху!
        float cladLine = vBuildProg < 0.96 ? clamp((vBuildProg - 0.08) / 0.86, 0.08, 1.02) : 2.0;
        bool isRawFrame = (vBuildProg < 0.96) && (vLocalPos.y > cladLine * 0.72);
        if (isRawFrame) {
          float slabBand = step(0.82, fract(vWorldPos.y * 0.34));
          float colBand = step(0.84, fract((abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x) * 0.28));
          vec3 rawConc = mix(vec3(0.55, 0.58, 0.61), vec3(0.72, 0.75, 0.78), max(slabBand, colBand));
          float safetyNet = smoothstep(0.76, 0.96, vLocalPos.y) * (0.5 + 0.5 * step(0.5, fract(vWorldPos.y * 0.9)));
          rawConc = mix(rawConc, vec3(0.95, 0.48, 0.12), safetyNet * 0.65);
          litWall = rawConc * (uSunColor * NdotL * 0.85 + uSkyColor * 0.34);
        }

        // Детализированные окна с переплётами (только на уже остеклённых этажах, кроме глухих силосов/градирен 13, 19)
        bool hasWindows = !isRawFrame && abs(vStyleId - 13.0) > 0.4 && abs(vStyleId - 19.0) > 0.4;
        if (hasWindows && abs(N.y) < 0.45) {
          float uCoord = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 winGrid = vec2(uCoord * 0.52, vWorldPos.y * 0.34);
          vec2 cell = floor(winGrid);
          vec2 f = fract(winGrid);

          float inWin = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.80);
          inWin *= step(0.09, vLocalPos.y) * step(vLocalPos.y, 0.93);
          inWin *= (1.0 - smoothstep(0.43, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z))));

          if (inWin > 0.5) {
            float frame = 1.0 - (step(0.23, f.x) * step(f.x, 0.77) * step(0.27, f.y) * step(f.y, 0.75));
            float mullion = 1.0 - smoothstep(0.0, 0.035, abs(f.x - 0.5));
            float frameMask = clamp(frame + mullion * 0.65, 0.0, 1.0);

            float rnd = hash21(cell + vStyleId * 3.1);
            float tintRnd = hash21(cell + 19.7);
            vec3 dayGlass = mix(vec3(0.13, 0.24, 0.36), uSkyColor * 0.94, 0.40 + f.y * 0.28);

            float readyLight = vBuildProg >= 0.95 ? 1.0 : 0.0;
            float onProb = vPowered > 0.5 ? 0.78 : 0.06;
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor * readyLight;
            // Для ЦОД ИИ (style 20,21) — бирюзовые серверные стойки, для остальных — тёплые лампы!
            vec3 nightHue = (abs(vStyleId - 20.0) < 1.2)
              ? vec3(0.25, 0.92, 1.0)
              : mix(vec3(1.0, 0.81, 0.44), vec3(0.72, 0.91, 1.0), step(0.76, tintRnd));
            vec3 paneCol = mix(dayGlass, nightHue * (vPowered > 0.5 ? 1.40 : 0.42), windowLit);
            litWall = mix(paneCol, vec3(0.16, 0.19, 0.23), frameMask * 0.75);
          }
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        litWall = mix(litWall, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litWall, 1.0);
      }
    `,
  });
}

/**
 * 5. Шейдер бескрайней водной глади и густого тумана ЗА ПРЕДЕЛАМИ КАРТЫ:
 * окружает долину со всех сторон живой водой с волнами Френеля и мягко растворяет горизонт в дымке!
 */
export function createOuterSeaFogMaterial(detailTex) {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime: { value: 0 },
      uMapHalf: { value: 2500.0 },
      uHorizScale: { value: 6.51 },
      uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
      uSunColor: { value: new THREE.Color(0xfff5e0) },
      uSkyZenith: { value: new THREE.Color(0x2864ad) },
      uSkyHorizon: { value: new THREE.Color(0xa6cde8) },
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uFogDensity: { value: 0.00012 },
      uDetailTex: { value: detailTex },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uMapHalf;
      uniform float uHorizScale;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyZenith;
      uniform vec3 uSkyHorizon;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;

      void main() {
        float boxDist = max(abs(vWorldPos.x), abs(vWorldPos.z));
        // Внутри самой карты работает основной 2D SWE меш — вырезаем внутренний квадрат без Z-fighting!
        if (boxDist < uMapHalf * 0.994) discard;

        float uvScale = 0.018 / max(1.0, pow(uHorizScale, 0.55));
        vec2 uv1 = vWorldPos.xz * uvScale + vec2(uTime * 0.018, uTime * 0.012);
        vec2 uv2 = vWorldPos.xz * (uvScale * 2.35) - vec2(uTime * 0.014, -uTime * 0.021);
        vec4 w1 = texture2D(uDetailTex, uv1);
        vec4 w2 = texture2D(uDetailTex, uv2);

        vec2 slope = (w1.rg - 0.5) * 0.34 + (w2.rg - 0.5) * 0.22;
        vec3 N = normalize(vec3(slope.x, 1.0, slope.y));
        vec3 V = normalize(cameraPosition - vWorldPos);

        float cosTheta = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = 0.024 + 0.976 * pow(1.0 - cosTheta, 5.0);

        vec3 R = reflect(-V, N);
        float skyMix = pow(clamp(1.0 - max(0.0, R.y), 0.0, 1.0), 2.1);
        vec3 skyRefl = mix(uSkyZenith, uSkyHorizon, skyMix);

        float dayLum = clamp(uSunDir.y * 2.2 + 0.18, 0.08, 1.0);
        vec3 deepSea = vec3(0.025, 0.135, 0.215) * (0.35 + 0.75 * dayLum);
        vec3 H = normalize(uSunDir + V);
        float spec = pow(max(0.0, dot(N, H)), 180.0) * 1.45;

        // Мягкая береговая пена вдоль кромки карты
        float shoreBand = 1.0 - smoothstep(uMapHalf * 0.994, uMapHalf * 1.055, boxDist);
        float surfLace = smoothstep(0.42, 0.78, (w1.a * 0.6 + w2.a * 0.4) + shoreBand * 0.45) * shoreBand;

        vec3 seaCol = mix(deepSea, skyRefl, clamp(fresnel * 0.92, 0.0, 0.95)) + uSunColor * spec;
        seaCol = mix(seaCol, vec3(0.92, 0.96, 1.0) * (0.35 + 0.65 * dayLum), surfLace * 0.55);

        // Густой атмосферный туман вдали за картой — плавно сливает воду с небом до самого горизонта!
        float camDist = length(cameraPosition - vWorldPos);
        float outDist = max(0.0, boxDist - uMapHalf);
        float radialFog = smoothstep(0.0, uMapHalf * 2.4, outDist);
        float viewFog = 1.0 - exp(-pow(camDist * uFogDensity * 1.35, 1.55));
        float totalFog = clamp(max(radialFog, viewFog), 0.0, 1.0);

        vec3 finalCol = mix(seaCol, uFogColor, totalFog);
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
  });
}

/** 6. Кольцо мягкого объёмного тумана вдоль горизонта вокруг бассейна */
export function createHorizonMistMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uOpacity: { value: 0.72 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uFogColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        // Густой туман у водной поверхности (vUv.y ~ 0), плавно тающий вверх в небо (vUv.y -> 1)
        float alpha = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 2.2) * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `,
  });
}

/**
 * 7. Шейдер междугородних автомагистралей, железобетонных мостов и строящегося дорожного полотна!
 * aRoadKind: 0.0 = асфальтовая трасса с разметкой, 1.0 = бетонный пролёт моста, 2.0 = щебёночная подушка на этапе укладки, 3.0 = городская улица
 */
export function createHighwayRoadMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: {
      uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
      uSunColor: { value: new THREE.Color(0xfff4dc) },
      uSkyColor: { value: new THREE.Color(0x7fb3e8) },
      uNightFactor: { value: 0.0 },
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uFogDensity: { value: 0.00012 },
    },
    vertexShader: /* glsl */ `
      attribute float aRoadKind;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vRoadKind;

      void main() {
        vUv = uv;
        vRoadKind = aRoadKind;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyColor;
      uniform float uNightFactor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vRoadKind;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.2);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float NdotL = max(0.12, dot(N, uSunDir));
        float grain = hash21(floor(vWorldPos.xz * 2.2)) * 0.08 - 0.04;

        float across = abs(vUv.x - 0.5) * 2.0; // 0 в центре трассы -> 1 на краю обочины
        vec3 col;

        if (vRoadKind > 1.5 && vRoadKind < 2.5) {
          // 2.0 — отсыпанная щебёночно-песчаная подушка строящегося участка трассы
          vec3 gravelCore = vec3(0.68, 0.58, 0.42) + grain * 1.4;
          vec3 earthEdge = vec3(0.50, 0.39, 0.25);
          float rut = 1.0 - smoothstep(0.0, 0.14, abs(across - 0.42)) * 0.16;
          col = mix(gravelCore * rut, earthEdge, smoothstep(0.72, 1.0, across));
        } else {
          // 0.0 (шоссе), 1.0 (мостовой пролёт), 3.0 (городской проспект)
          bool isBridge = (vRoadKind > 0.5 && vRoadKind < 1.5);
          vec3 asphalt = isBridge
            ? (vec3(0.28, 0.31, 0.35) + grain * 0.7)
            : (vec3(0.20, 0.22, 0.25) + grain);

          // Деформационные швы моста или текстура колеи накатанного асфальта
          if (isBridge) {
            float joint = step(0.96, fract(vUv.y * 0.055));
            asphalt -= joint * 0.07;
          } else {
            float tireTrack = smoothstep(0.0, 0.16, abs(across - 0.40));
            asphalt *= (0.92 + 0.08 * tireTrack);
          }

          // Обочина: бетонный бордюр на мосту или аккуратная гравийная бровка на земле
          vec3 shoulderCol = isBridge ? vec3(0.74, 0.78, 0.82) : vec3(0.56, 0.53, 0.46);
          float shoulderMask = smoothstep(0.80, 0.86, across);
          col = mix(asphalt, shoulderCol, shoulderMask);

          // Чёткая дорожная разметка: прерывистая осевая и сплошные краевые полосы безопасности
          float centerDash = (1.0 - smoothstep(0.0, 0.042, across)) * step(0.42, fract(vUv.y * 0.085));
          float edgeLine = (1.0 - smoothstep(0.0, 0.032, abs(across - 0.76)));
          vec3 paintCol = vec3(0.95, 0.96, 0.94);
          vec3 centerCol = isBridge ? vec3(0.98, 0.84, 0.32) : paintCol;
          col = mix(col, paintCol, edgeLine * 0.82);
          col = mix(col, centerCol, centerDash * 0.90);
        }

        vec3 lit = col * (uSunColor * NdotL * 0.88 + uSkyColor * 0.34);

        // Тёплая подсветка фонарей на мостах и городских улицах ночью
        if (uNightFactor > 0.05 && (abs(vRoadKind - 1.0) < 0.4 || vRoadKind > 2.5)) {
          float lampPool = pow(0.5 + 0.5 * cos(vUv.y * 0.22), 4.0) * (1.0 - across * 0.5);
          lit += vec3(1.0, 0.82, 0.46) * lampPool * uNightFactor * 0.32;
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        lit = mix(lit, uFogColor, clamp(fogF, 0.0, 0.88));

        gl_FragColor = vec4(lit, 1.0);
      }
    `,
  });
}


