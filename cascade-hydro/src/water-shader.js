// ============================================================================
//  ФОТОРЕАЛИСТИЧНЫЕ ШЕЙДЕРЫ ДОЛИНЫ, ВОДЫ И ГОРОДОВ «REAL-LIFE PBR OPTICS v2»
//  - Трипланарная текстура слоистого гранита, мха, луговых трав и речной гальки
//  - Микрорельеф нормалей (dFdx/dFdy bump-mapping) на скалах, гальке и бетоне!
//  - Опалубочный бетон плотин с рустами, стяжками и влажной ватерлинией водорослей
//  - Преломление Снеллиуса + двойная каустика Вороного + закон Бугера — Ламберта
//  - Фасады растущих городов с карнизами, пилястрами, витринами и ночными окнами
// ============================================================================

import * as THREE from 'three';
import { createWaterDetailTexture } from './textures.js';

export { createWaterDetailTexture };

/** Материал рельефа долины с трипланарными скалами, микрорельефом, лугами, галькой и опалубочным бетоном */
export function createValleyTerrainMaterial(detailTex, concreteMap = null) {
  const uniforms = {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
    uSunColor: { value: new THREE.Color(0xfff4dc) },
    uSkyColor: { value: new THREE.Color(0x6da8e8) },
    uFogColor: { value: new THREE.Color(0xa8cae8) },
    uFogDensity: { value: 0.00050 },
    uShowContours: { value: 0.0 },
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

      // Плавный билинейный шум без пиксельных квадратов!
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
        float detailFade = 1.0 - smoothstep(140.0, 480.0, camDist);

        // --- 1. Многослойный процедурный микрорельеф для трав, гальки и трещин гранита ---
        float macroPatch = fbm3(vWorldPos.xz * 0.032);
        float medDetail = fbm3(vWorldPos.xz * 0.28);
        float pebbleField = vnoise(vWorldPos.xz * 2.35) * 0.65 + vnoise(vWorldPos.xz * 5.2) * 0.35;

        // Трипланарные геологические пласты и трещины на крутых утёсах каньона!
        float cliffStrata = sin(vWorldPos.y * 1.65 + fbm3(vWorldPos.xz * 0.09) * 3.8) * 0.5 + 0.5;
        float cliffCracks = vnoise(vec2(vWorldPos.x + vWorldPos.z, vWorldPos.y * 1.9) * 0.85);
        float rockMask = clamp(smoothstep(0.30, 0.58, slope) + (1.0 - smoothstep(0.20, 0.85, soil)) * 0.76, 0.0, 1.0);

        // Собираем скалярное поле высоты микрорельефа для честного экранного bump-mapping
        float microHeight = mix(medDetail * 0.45 + pebbleField * wetness * 0.45, cliffStrata * 0.65 + cliffCracks * 0.55, rockMask);

        // --- 2. Богатые природные биомы долины ---
        vec3 valleyGrass = mix(vec3(0.21, 0.45, 0.17), vec3(0.32, 0.56, 0.22), macroPatch);
        // Цветущие луговые пятна клевера/разнотравья на солнечных полянах
        float wildflower = smoothstep(0.66, 0.82, fbm3(vWorldPos.xz * 0.14 + 12.0)) * (1.0 - slope * 2.0);
        valleyGrass = mix(valleyGrass, vec3(0.46, 0.58, 0.24), wildflower * 0.55);

        vec3 alpineMoss = mix(vec3(0.33, 0.46, 0.23), vec3(0.47, 0.52, 0.29), medDetail);
        float altMix = smoothstep(23.0, 48.0, vWorldPos.y);
        vec3 grassCol = mix(valleyGrass, alpineMoss, altMix) * (0.86 + medDetail * 0.28);

        // Суглинок, свежий срез грунта в откосах канала и речной галечник
        vec3 richLoam = mix(vec3(0.45, 0.33, 0.21), vec3(0.58, 0.44, 0.29), medDetail);
        float bareSoil = clamp(smoothstep(0.24, 0.52, slope) + (1.0 - smoothstep(0.38, 1.45, soil)) * 0.55, 0.0, 1.0);
        vec3 groundCol = mix(grassCol, richLoam, bareSoil * 0.76);

        vec3 cobbleCol = mix(vec3(0.49, 0.46, 0.39), vec3(0.67, 0.62, 0.52), pebbleField);
        float shoreBlend = clamp(wetness * 0.78 + smoothstep(0.01, 0.28, subDepth) * 0.60, 0.0, 0.92);
        groundCol = mix(groundCol, cobbleCol, shoreBlend);

        // Слоистый серый и тёплый кварцевый гранит ущелий со мхом на полках
        vec3 darkGranite = vec3(0.34, 0.35, 0.37);
        vec3 warmQuartz = vec3(0.55, 0.52, 0.48);
        vec3 graniteCol = mix(darkGranite, warmQuartz, cliffStrata * 0.65 + cliffCracks * 0.35);
        float ledgeMoss = (1.0 - smoothstep(0.18, 0.44, slope)) * rockMask * smoothstep(0.45, 0.75, medDetail);
        graniteCol = mix(graniteCol, vec3(0.29, 0.42, 0.22), ledgeMoss * 0.65);

        vec3 col = mix(groundCol, graniteCol, rockMask);

        // Снежные шапки и фирн в высокогорье с искристым тоном
        float snowLine = 54.0 + macroPatch * 6.0;
        float snowMask = smoothstep(snowLine, snowLine + 10.0, vWorldPos.y) * (1.0 - smoothstep(0.44, 0.74, slope));
        vec3 snowCol = mix(vec3(0.88, 0.93, 0.98), vec3(0.97, 0.99, 1.0), medDetail);
        col = mix(col, snowCol, snowMask);

        // --- 3. Архитектурный бетон плотин и облицованных каналов ---
        if (concrete > 0.05) {
          float concMask = clamp(concrete * 2.4, 0.0, 1.0);
          vec3 triW = pow(abs(Ngeom), vec3(4.0));
          triW /= max(0.001, triW.x + triW.y + triW.z);

          vec3 texXZ = texture2D(uConcreteTex, vWorldPos.xz * 0.11).rgb;
          vec3 texXY = texture2D(uConcreteTex, vWorldPos.xy * 0.11).rgb;
          vec3 texZY = texture2D(uConcreteTex, vWorldPos.zy * 0.11).rgb;
          vec3 triConc = texXZ * triW.y + texXY * triW.z + texZY * triW.x;

          float seamX = step(0.955, fract(vWorldPos.x * 0.25));
          float seamZ = step(0.955, fract(vWorldPos.z * 0.25));
          float seamY = step(0.935, fract(vWorldPos.y * 0.33));
          float joints = clamp(seamX + seamZ + seamY * 0.65, 0.0, 1.0);

          vec3 baseConc = uHasConcreteTex > 0.5 ? (triConc * 1.06) : vec3(0.71, 0.73, 0.75);
          vec3 concCol = baseConc - joints * 0.12;
          // Тёмно-изумрудная полоса водорослей/влаги у ватерлинии бетона
          concCol = mix(concCol, vec3(0.28, 0.35, 0.30), wetness * (1.0 - clamp(subDepth * 0.5, 0.0, 1.0)) * 0.38);

          col = mix(col, concCol, concMask);
          microHeight = mix(microHeight, (triConc.r - joints * 0.35) * 0.7, concMask);
        }

        // Физическое потемнение пористых пород от капиллярной влаги
        col *= mix(1.0, 0.63, wetness);

        // --- 4. Аналитическое возмущение нормали (Bump Mapping без дополнительных текстур!) ---
        vec3 dPosX = dFdx(vWorldPos);
        vec3 dPosY = dFdy(vWorldPos);
        float dHx = dFdx(microHeight) * detailFade;
        float dHy = dFdy(microHeight) * detailFade;
        vec3 r1 = cross(dPosY, Ngeom);
        vec3 r2 = cross(Ngeom, dPosX);
        float det = dot(dPosX, r1);
        vec3 surfGrad = sign(det) * (dHx * r1 + dHy * r2);
        float bumpStrength = mix(0.32, 0.62, rockMask);
        vec3 N = normalize(abs(det) > 1e-7 ? (abs(det) * Ngeom - bumpStrength * surfGrad) : Ngeom);

        // --- 5. Реалистичное освещение (Солнце + полусфера неба + тёплый отсвет земли + мокрый блик) ---
        float NdotL = max(0.0, dot(N, uSunDir));
        float hemi = 0.5 + 0.5 * N.y;
        float cavityAO = mix(0.84, 1.06, clamp(microHeight, 0.0, 1.0));
        vec3 bounceLight = vec3(0.24, 0.21, 0.16) * (1.0 - N.y) * 0.24;
        vec3 lighting = (uSunColor * (NdotL * 0.95) + uSkyColor * (0.28 + 0.30 * hemi) + bounceLight) * cavityAO;

        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 H = normalize(uSunDir + V);
        float wetSpec = pow(max(0.0, dot(N, H)), 56.0) * wetness * 0.42;
        vec3 litCol = col * lighting + uSunColor * wetSpec;

        // Геодезические изолинии высот (каждые 2 м и жирные каждые 10 м)
        if (uShowContours > 0.5) {
          float minor = abs(fract(vWorldPos.y * 0.5) - 0.5);
          float major = abs(fract(vWorldPos.y * 0.1) - 0.5);
          float lineMinor = 1.0 - smoothstep(0.014, 0.044, minor);
          float lineMajor = 1.0 - smoothstep(0.011, 0.032, major);
          litCol = mix(litCol, vec3(0.95, 0.86, 0.42), lineMinor * 0.32);
          litCol = mix(litCol, vec3(1.0, 0.97, 0.74), lineMajor * 0.72);
        }

        float fogF = 1.0 - exp(-pow(camDist * uFogDensity, 1.65));
        litCol = mix(litCol, uFogColor, clamp(fogF, 0.0, 0.84));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `,
  });
}

/** Фотореалистичный шейдер воды с каустикой Вороного, преломлением Снеллиуса и пеной */
export function createRealisticWaterMaterial(detailTex) {
  const uniforms = {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
    uSunColor: { value: new THREE.Color(0xfff5e0) },
    uSkyZenith: { value: new THREE.Color(0x2864ad) },
    uSkyHorizon: { value: new THREE.Color(0xa6cde8) },
    uFogColor: { value: new THREE.Color(0xa8cae8) },
    uFogDensity: { value: 0.00050 },
    uDetailTex: { value: detailTex },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      attribute vec4 aHydro1;
      attribute vec4 aHydro2;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;

      void main() {
        vHydro1 = aHydro1;
        vHydro2 = aHydro2;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vMacroNormal = normalize(mat3(modelMatrix) * normal);
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
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;

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

        // --- 1. Двухфазная адвекция волновых нормалей вдоль вектора течения (u, v) ---
        vec2 flowDir = speed > 0.02 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 flowStep = vel * 0.050;
        float cycle = 1.18;
        float p0 = fract(uTime / cycle);
        float p1 = fract(uTime / cycle + 0.5);
        float blend = abs(2.0 * p0 - 1.0);

        vec2 baseUv = vWorldPos.xz * 0.078;
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = vWorldPos.xz * 0.23 + vec2(vort * 0.075, -vort * 0.075);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.65));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.65) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float chopAmp = (0.18 + clamp(speed * 0.050 + froude * 0.13, 0.0, 0.48)) * (1.0 - smoothstep(190.0, 560.0, dist) * 0.65);

        vec2 dN = ((waveSample.xy * 2.0 - 1.0) * 0.68 + (fineSample.xy * 2.0 - 1.0) * 0.40) * chopAmp;
        vec3 N = normalize(vec3(vMacroNormal.x + dN.x, vMacroNormal.y, vMacroNormal.z + dN.y));

        // --- 2. Преломление подводного галечника и плит по закону Снеллиуса + каустика Вороного ---
        float daySun = max(0.14, clamp(uSunDir.y + 0.18, 0.0, 1.0));
        vec2 refrXZ = vWorldPos.xz - N.xz * min(depth, 4.0) * 0.54;

        float cobbleA = vnoise(refrXZ * 2.6);
        float cobbleB = vnoise(refrXZ * 6.4);
        vec3 gravelBed = mix(vec3(0.41, 0.38, 0.31), vec3(0.61, 0.56, 0.46), cobbleA * 0.65 + cobbleB * 0.35);

        float slabJoint = clamp(step(0.95, fract(refrXZ.x * 0.25)) + step(0.95, fract(refrXZ.y * 0.25)), 0.0, 1.0);
        vec3 concBed = vec3(0.56, 0.60, 0.63) - slabJoint * 0.14 + (cobbleB - 0.5) * 0.08;
        vec3 bedAlbedo = mix(gravelBed, concBed, isConcreteBed);

        vec2 cUv1 = refrXZ * 0.095 + vec2(uTime * 0.036, uTime * 0.025);
        vec2 cUv2 = refrXZ * 0.135 - vec2(uTime * 0.029, -uTime * 0.032);
        float caust = (texture2D(uDetailTex, cUv1).b + texture2D(uDetailTex, cUv2).b) * 0.82 * exp(-depth * 0.29) * daySun;
        vec3 sunlitBed = bedAlbedo * (0.36 + 0.86 * daySun) + uSunColor * caust * 0.52;

        // --- 3. Закон Бугера — Ламберта — Бера (кристальная отмель -> бирюза -> глубокий сапфир бьефа) ---
        float viewCos = max(0.30, abs(dot(N, V)));
        float opticalPath = depth / viewCos;

        vec3 sigmaPure = vec3(0.44, 0.092, 0.064);
        vec3 transmittance = exp(-sigmaPure * opticalPath);

        vec3 pureScatter = mix(vec3(0.035, 0.34, 0.37), vec3(0.015, 0.12, 0.23), smoothstep(1.4, 12.5, depth)) * (0.28 + 0.84 * daySun);
        vec3 mudScatter = vec3(0.50, 0.37, 0.21) * (0.30 + 0.75 * daySun);
        float mudMask = clamp(sediment * 0.72, 0.0, 0.88);
        vec3 inScatter = mix(pureScatter, mudScatter, mudMask);

        vec3 effTrans = transmittance * (1.0 - mudMask * 0.88);
        vec3 underwaterRadiance = sunlitBed * effTrans + inScatter * (1.0 - effTrans);

        // Подповерхностное бирюзовое свечение гребней волн на солнце
        float sss = pow(clamp(dot(V, -uSunDir + N * 0.6), 0.0, 1.0), 3.0) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.05, 0.33, 0.30) * sss * max(0.0, uSunDir.y);

        // --- 4. Отражения Френеля и солнечные искры ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = clamp(0.024 + 0.88 * pow(1.0 - NdotV, 4.6), 0.024, 0.87);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.20, R.y) * 0.26;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.74)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 420.0) * 2.8;
        float specSparkle = pow(max(0.0, dot(N, H)), 58.0) * 0.30;
        vec3 sunSpec = uSunColor * (specCore + specSparkle) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. Кружевная пена бурунов и водосбросов ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(dot(vWorldPos.xz, flowDir) * 0.072 - uTime * (0.26 + speed * 0.044),
                            dot(vWorldPos.xz, orthoDir) * 0.19);
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.64
                          + texture2D(uDetailTex, anisoUv * 2.15 + vec2(0.31, -uTime * 0.08)).a * 0.36;

        float shoreMeniscus = (1.0 - smoothstep(0.015, 0.18, depth)) * clamp(speed * 0.25, 0.10, 0.70);
        float totalFoamDrive = clamp(foamVal * 1.20 + shoreMeniscus + clamp(froude - 1.08, 0.0, 0.68) * 0.60, 0.0, 1.0);
        float foamMask = smoothstep(0.36 - totalFoamDrive * 0.30, 0.75 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.52);
        vec3 foamColor = vec3(0.96, 0.98, 1.0) * (0.36 + 0.68 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.7);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        finalCol = mix(finalCol, uFogColor, clamp(distFog, 0.0, 0.84));

        float edgeAlpha = smoothstep(0.010, 0.075, depth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `,
  });
}

/** Архитектурный шейдер растущих городских зданий с рустовкой, цоколем, карнизом и окнами */
export function createCityFacadeMaterial(roofTex = null) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.4).normalize() },
      uSunColor: { value: new THREE.Color(0xfff4dc) },
      uSkyColor: { value: new THREE.Color(0x7fb3e8) },
      uNightFactor: { value: 0.0 },
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uFogDensity: { value: 0.00050 },
      uRoofTex: { value: roofTex },
      uHasRoofTex: { value: roofTex ? 1.0 : 0.0 },
    },
    vertexShader: /* glsl */ `
      attribute float aPowered;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;

      void main() {
        vLocalPos = position;
        vPowered = aPowered;
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

      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.2);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float NdotL = max(0.0, dot(N, uSunDir));
        vec3 baseAlbedo = vColor;

        // Плоская кровля высоток с гравийной крошкой и бортиком парапета
        if (N.y > 0.55) {
          float roofEdge = max(abs(vLocalPos.x), abs(vLocalPos.z));
          float parapet = smoothstep(0.41, 0.46, roofEdge);
          vec3 roofGrain = uHasRoofTex > 0.5 ? texture2D(uRoofTex, vWorldPos.xz * 0.25).rgb : vec3(0.55);
          baseAlbedo = mix(roofGrain * 0.72, vColor * 0.88, parapet);
        } else {
          // Каменный цоколь первого этажа, угловые пилястры и межэтажные пояса
          float plinth = 1.0 - smoothstep(0.05, 0.11, vLocalPos.y);
          float cornice = smoothstep(0.93, 0.96, vLocalPos.y);
          float cornerTrim = smoothstep(0.42, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z)));
          float floorBand = step(0.91, fract(vWorldPos.y * 0.36));
          baseAlbedo *= (1.0 - plinth * 0.24 - floorBand * 0.08 + cornice * 0.12 + cornerTrim * 0.08);
        }

        vec3 litWall = baseAlbedo * (uSunColor * NdotL * 0.88 + uSkyColor * (0.30 + 0.26 * max(0.0, N.y)));

        // Детализированные окна с переплётами рам, дневным отражением неба и ночным светом
        if (abs(N.y) < 0.45) {
          float uCoord = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 winGrid = vec2(uCoord * 0.54, vWorldPos.y * 0.36);
          vec2 cell = floor(winGrid);
          vec2 f = fract(winGrid);

          float inWin = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.80);
          inWin *= step(0.09, vLocalPos.y) * step(vLocalPos.y, 0.93);
          inWin *= (1.0 - smoothstep(0.43, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z))));

          if (inWin > 0.5) {
            // Тёмный оконный переплёт / рама по контуру и импост по центру
            float frame = 1.0 - (step(0.23, f.x) * step(f.x, 0.77) * step(0.27, f.y) * step(f.y, 0.75));
            float mullion = 1.0 - smoothstep(0.0, 0.035, abs(f.x - 0.5));
            float frameMask = clamp(frame + mullion * 0.65, 0.0, 1.0);

            float rnd = hash21(cell);
            float tintRnd = hash21(cell + 19.7);
            vec3 dayGlass = mix(vec3(0.14, 0.24, 0.35), uSkyColor * 0.92, 0.38 + f.y * 0.28);

            float onProb = vPowered > 0.5 ? 0.78 : 0.07;
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor;
            vec3 warmLamp = mix(vec3(1.0, 0.81, 0.44), vec3(0.72, 0.91, 1.0), step(0.76, tintRnd));
            vec3 paneCol = mix(dayGlass, warmLamp * (vPowered > 0.5 ? 1.38 : 0.42), windowLit);
            litWall = mix(paneCol, vec3(0.16, 0.19, 0.23), frameMask * 0.75);
          }
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        litWall = mix(litWall, uFogColor, clamp(fogF, 0.0, 0.84));

        gl_FragColor = vec4(litWall, 1.0);
      }
    `,
  });
}
