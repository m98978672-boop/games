// ============================================================================
//  ФОТОРЕАЛИСТИЧНЫЕ ШЕЙДЕРЫ ВОДЫ, РЕЛЬЕФА И АРХИТЕКТУРЫ ГОРОДОВ «REAL-LIFE OPTICS»
//  - Преломление дна по закону Снеллиуса (галька, песок и швы бетонного канала)
//  - Закон Бугера — Ламберта — Бера (кристальная отмель -> изумруд реки -> сапфир бьефа)
//  - Рассеяние света взвешенным илом/глиной от копки каналов и эрозии
//  - Двухфазная адвекция волновых нормалей по реальному вектору скорости (u, v)
//  - Отражения Френеля, солнечная дорожка, каустика и анизотропная пена
//  - Многоэтажные светящиеся фасады растущих городов (0 лишних draw calls!)
// ============================================================================

import * as THREE from 'three';

/** Генерирует тайловую процедурную текстуру волновых нормалей, каустики и ячеек пены */
export function createWaterDetailTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const tau = Math.PI * 2;

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const h1 = Math.sin(u * tau * 3.0 + v * tau * 2.0) * 0.35
               + Math.cos(u * tau * 5.0 - v * tau * 4.0 + 1.1) * 0.25
               + Math.sin(u * tau * 9.0 + v * tau * 7.0 + 2.4) * 0.18
               + Math.cos(u * tau * 14.0 - v * tau * 11.0 + 0.7) * 0.12;

      const dhdu = (
        Math.cos(u * tau * 3.0 + v * tau * 2.0) * 3.0 * 0.35
        - Math.sin(u * tau * 5.0 - v * tau * 4.0 + 1.1) * 5.0 * 0.25
        + Math.cos(u * tau * 9.0 + v * tau * 7.0 + 2.4) * 9.0 * 0.18
      ) / 5.2;

      const dhdv = (
        Math.cos(u * tau * 3.0 + v * tau * 2.0) * 2.0 * 0.35
        + Math.sin(u * tau * 5.0 - v * tau * 4.0 + 1.1) * 4.0 * 0.25
        + Math.cos(u * tau * 9.0 + v * tau * 7.0 + 2.4) * 7.0 * 0.18
      ) / 5.2;

      const c1 = Math.abs(Math.sin(u * tau * 4.0 + Math.sin(v * tau * 3.0) * 0.85));
      const c2 = Math.abs(Math.cos(v * tau * 4.0 - Math.sin(u * tau * 3.0) * 0.85));
      const caustic = Math.pow(1.0 - Math.min(1.0, (c1 + c2) * 0.60), 2.8);

      const cellA = Math.sin(u * tau * 8.0) * Math.sin(v * tau * 8.0);
      const cellB = Math.cos((u + v) * tau * 11.0) * Math.sin((u - v) * tau * 9.0);
      const foamLace = Math.max(0, Math.min(1, 0.52 + cellA * 0.35 + cellB * 0.28 + h1 * 0.15));

      const idx = (y * size + x) * 4;
      data[idx] = Math.max(0, Math.min(255, Math.round((dhdu * 0.5 + 0.5) * 255)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round((dhdv * 0.5 + 0.5) * 255)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(caustic * 255)));
      data[idx + 3] = Math.max(0, Math.min(255, Math.round(foamLace * 255)));
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/** Материал рельефа с породами, бетоном плотин, мокрыми берегами и изолиниями */
export function createValleyTerrainMaterial(detailTex) {
  const uniforms = {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
    uSunColor: { value: new THREE.Color(0xfff4dc) },
    uSkyColor: { value: new THREE.Color(0x6da8e8) },
    uFogColor: { value: new THREE.Color(0xa8cae8) },
    uFogDensity: { value: 0.00066 },
    uShowContours: { value: 0.0 },
    uDetailTex: { value: detailTex },
  };

  return new THREE.ShaderMaterial({
    uniforms,
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

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec4 vMeta;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float slope = 1.0 - clamp(N.y, 0.0, 1.0);
        float soil = vMeta.x;
        float concrete = vMeta.y;
        float wetness = clamp(vMeta.z, 0.0, 1.0);
        float subDepth = max(0.0, vMeta.w);

        float grain = hash21(floor(vWorldPos.xz * 2.4)) * 0.08 - 0.04;
        float strata = sin(vWorldPos.y * 2.3 + vWorldPos.x * 0.14) * 0.05;

        vec3 lushGrass = vec3(0.28, 0.51, 0.21) + grain * 0.5;
        vec3 alpineMeadow = vec3(0.41, 0.56, 0.26);
        vec3 claySoil = vec3(0.54, 0.40, 0.26) + grain;
        vec3 riverSand = vec3(0.62, 0.57, 0.47) + grain * 1.2;
        vec3 graniteRock = vec3(0.45, 0.44, 0.42) + strata + grain * 0.6;
        vec3 snowCap = vec3(0.92, 0.95, 0.98);

        float meadowMix = smoothstep(22.0, 44.0, vWorldPos.y);
        vec3 grassCol = mix(lushGrass, alpineMeadow, meadowMix);

        float bareSoil = clamp(smoothstep(0.27, 0.56, slope) + (1.0 - smoothstep(0.35, 1.4, soil)) * 0.58, 0.0, 1.0);
        vec3 groundCol = mix(grassCol, claySoil, bareSoil * 0.72);
        groundCol = mix(groundCol, riverSand, clamp(wetness * 0.72 + smoothstep(0.01, 0.25, subDepth) * 0.55, 0.0, 0.88));

        float rockMask = clamp(smoothstep(0.34, 0.62, slope) + (1.0 - smoothstep(0.2, 0.85, soil)) * 0.75, 0.0, 1.0);
        vec3 col = mix(groundCol, graniteRock, rockMask);

        float snowMask = smoothstep(52.0, 62.0, vWorldPos.y) * (1.0 - smoothstep(0.45, 0.75, slope));
        col = mix(col, snowCap, snowMask);

        if (concrete > 0.05) {
          float concMask = clamp(concrete * 2.5, 0.0, 1.0);
          float seamX = step(0.955, fract(vWorldPos.x * 0.25));
          float seamZ = step(0.955, fract(vWorldPos.z * 0.25));
          float seamY = step(0.935, fract(vWorldPos.y * 0.33));
          float joints = clamp(seamX + seamZ + seamY * 0.6, 0.0, 1.0);
          vec3 concCol = vec3(0.70, 0.72, 0.74) - joints * 0.13 + grain * 0.35;
          col = mix(col, concCol, concMask);
        }

        // Мокрый берег и ватерлиния плотины физически темнеют от воды!
        col *= mix(1.0, 0.62, wetness);

        float NdotL = max(0.0, dot(N, uSunDir));
        float hemi = 0.5 + 0.5 * N.y;
        vec3 lighting = uSunColor * (NdotL * 0.92) + uSkyColor * (0.28 + 0.28 * hemi);

        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 H = normalize(uSunDir + V);
        float wetSpec = pow(max(0.0, dot(N, H)), 42.0) * wetness * 0.34;
        vec3 litCol = col * lighting + uSunColor * wetSpec;

        if (uShowContours > 0.5) {
          float minor = abs(fract(vWorldPos.y * 0.5) - 0.5);
          float major = abs(fract(vWorldPos.y * 0.1) - 0.5);
          float lineMinor = 1.0 - smoothstep(0.015, 0.045, minor);
          float lineMajor = 1.0 - smoothstep(0.012, 0.032, major);
          litCol = mix(litCol, vec3(0.95, 0.86, 0.42), lineMinor * 0.30);
          litCol = mix(litCol, vec3(1.0, 0.96, 0.72), lineMajor * 0.70);
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        litCol = mix(litCol, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `,
  });
}

/** Фотореалистичный шейдер воды с преломлением Снеллиуса, каустикой и Бугером — Ламбертом */
export function createRealisticWaterMaterial(detailTex) {
  const uniforms = {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.52, 0.74, 0.42).normalize() },
    uSunColor: { value: new THREE.Color(0xfff5e0) },
    uSkyZenith: { value: new THREE.Color(0x2864ad) },
    uSkyHorizon: { value: new THREE.Color(0xa6cde8) },
    uFogColor: { value: new THREE.Color(0xa8cae8) },
    uFogDensity: { value: 0.00066 },
    uDetailTex: { value: detailTex },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      // aHydro1: x = depth, y = u, z = v, w = foam
      // aHydro2: x = sediment, y = vorticity, z = linedFlag, w = wetMask
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

        // --- 1. Двухфазная адвекция волновых нормалей строго по реальной скорости (u, v) ---
        vec2 flowDir = speed > 0.02 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 flowStep = vel * 0.052;
        float cycle = 1.15;
        float p0 = fract(uTime / cycle);
        float p1 = fract(uTime / cycle + 0.5);
        float blend = abs(2.0 * p0 - 1.0);

        vec2 baseUv = vWorldPos.xz * 0.082;
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = vWorldPos.xz * 0.22 + vec2(vort * 0.07, -vort * 0.07);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.65));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.65) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float chopAmp = (0.17 + clamp(speed * 0.048 + froude * 0.12, 0.0, 0.45)) * (1.0 - smoothstep(170.0, 430.0, dist) * 0.65);

        vec2 dN = ((waveSample.xy * 2.0 - 1.0) * 0.68 + (fineSample.xy * 2.0 - 1.0) * 0.38) * chopAmp;
        vec3 N = normalize(vec3(vMacroNormal.x + dN.x, vMacroNormal.y, vMacroNormal.z + dN.y));

        // --- 2. Преломление подводного дна по закону Снеллиуса + солнечная каустика! ---
        float daySun = max(0.14, clamp(uSunDir.y + 0.18, 0.0, 1.0));
        vec2 refrXZ = vWorldPos.xz - N.xz * min(depth, 3.8) * 0.52;

        // Текстура речной гальки / песка или бетонных плит канала на преломлённом дне
        float pebble = hash21(floor(refrXZ * 3.6)) * 0.16 - 0.08;
        float cobble = hash21(floor(refrXZ * 1.3)) * 0.12 - 0.06;
        vec3 gravelBed = vec3(0.48, 0.44, 0.36) + pebble + cobble;
        float slabJoint = clamp(step(0.95, fract(refrXZ.x * 0.25)) + step(0.95, fract(refrXZ.y * 0.25)), 0.0, 1.0);
        vec3 concBed = vec3(0.56, 0.59, 0.61) - slabJoint * 0.14 + pebble * 0.3;
        vec3 bedAlbedo = mix(gravelBed, concBed, isConcreteBed);

        // Двойная танцующая солнечная каустика на преломлённом дне
        vec2 cUv1 = refrXZ * 0.115 + vec2(uTime * 0.042, uTime * 0.028);
        vec2 cUv2 = refrXZ * 0.145 - vec2(uTime * 0.033, -uTime * 0.036);
        float caust = (texture2D(uDetailTex, cUv1).b + texture2D(uDetailTex, cUv2).b) * 0.72 * exp(-depth * 0.32) * daySun;
        vec3 sunlitBed = bedAlbedo * (0.35 + 0.85 * daySun) + uSunColor * caust * 0.45;

        // --- 3. Закон Бугера — Ламберта — Бера: спектральное поглощение и цвет толщи ---
        float viewCos = max(0.30, abs(dot(N, V)));
        float opticalPath = depth / viewCos;

        // Чистая горная река: красный поглощается первым -> изумрудно-бирюзовый оттенок -> глубокий сапфир водохранилища!
        vec3 sigmaPure = vec3(0.42, 0.095, 0.068);
        vec3 transmittance = exp(-sigmaPure * opticalPath);

        vec3 pureScatter = mix(vec3(0.04, 0.32, 0.35), vec3(0.018, 0.13, 0.22), smoothstep(1.5, 11.0, depth)) * (0.28 + 0.82 * daySun);
        vec3 mudScatter = vec3(0.49, 0.36, 0.20) * (0.30 + 0.75 * daySun);
        float mudMask = clamp(sediment * 0.72, 0.0, 0.88);
        vec3 inScatter = mix(pureScatter, mudScatter, mudMask);

        // В мутной воде дно быстро скрывается взвесью ила
        vec3 effTrans = transmittance * (1.0 - mudMask * 0.88);
        vec3 underwaterRadiance = sunlitBed * effTrans + inScatter * (1.0 - effTrans);

        // Бирюзовое просвечивание бегущих волн на солнце (SSS)
        float sss = pow(clamp(dot(V, -uSunDir + N * 0.6), 0.0, 1.0), 3.0) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.05, 0.30, 0.28) * sss * max(0.0, uSunDir.y);

        // --- 4. Френелевские отражения неба, гор и солнечных бликов ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = 0.025 + 0.88 * pow(1.0 - NdotV, 4.6);
        fresnel = clamp(fresnel, 0.025, 0.86);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.18, R.y) * 0.25;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.75)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 380.0) * 2.6;
        float specSparkle = pow(max(0.0, dot(N, H)), 52.0) * 0.28;
        vec3 sunSpec = uSunColor * (specCore + specSparkle) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. Белая пена бурунов, гидравлического прыжка и водосброса ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(dot(vWorldPos.xz, flowDir) * 0.075 - uTime * (0.26 + speed * 0.042),
                            dot(vWorldPos.xz, orthoDir) * 0.20);
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.62
                          + texture2D(uDetailTex, anisoUv * 2.1 + vec2(0.31, -uTime * 0.08)).a * 0.38;

        float shoreMeniscus = (1.0 - smoothstep(0.015, 0.17, depth)) * clamp(speed * 0.24, 0.10, 0.68);
        float totalFoamDrive = clamp(foamVal * 1.18 + shoreMeniscus + clamp(froude - 1.10, 0.0, 0.65) * 0.58, 0.0, 1.0);
        float foamMask = smoothstep(0.36 - totalFoamDrive * 0.30, 0.76 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.48);
        vec3 foamColor = vec3(0.95, 0.98, 1.0) * (0.35 + 0.68 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.7);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        finalCol = mix(finalCol, uFogColor, clamp(distFog, 0.0, 0.82));

        // Мягкий миллиметровый урез воды на самом берегу, глубже — полноценная преломляющая толща!
        float edgeAlpha = smoothstep(0.010, 0.075, depth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `,
  });
}

/** Шейдер растущих городских зданий с процедурными этажами и тёплыми окнами ночью (1 InstancedMesh!) */
export function createCityFacadeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.4).normalize() },
      uSunColor: { value: new THREE.Color(0xfff4dc) },
      uSkyColor: { value: new THREE.Color(0x7fb3e8) },
      uNightFactor: { value: 0.0 },
      uFogColor: { value: new THREE.Color(0xa8cae8) },
      uFogDensity: { value: 0.00066 },
    },
    vertexShader: /* glsl */ `
      attribute float aPowered;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;

      void main() {
        vLocalPos = position; // x,z in [-0.5..0.5], y in [0..1]
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
        vec3 litWall = vColor * (uSunColor * NdotL * 0.85 + uSkyColor * (0.30 + 0.25 * max(0.0, N.y)));

        // Боковые стены с сеткой окон по этажам (шаг этажа ~2.8 м в мировых координатах!)
        if (abs(N.y) < 0.45) {
          float uCoord = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 winGrid = vec2(uCoord * 0.52, vWorldPos.y * 0.36);
          vec2 cell = floor(winGrid);
          vec2 f = fract(winGrid);
          float inWin = step(0.20, f.x) * step(f.x, 0.80) * step(0.24, f.y) * step(f.y, 0.78);
          inWin *= step(0.08, vLocalPos.y) * step(vLocalPos.y, 0.94);

          if (inWin > 0.5) {
            float rnd = hash21(cell);
            // Днём окна отражают небо, а вечером и ночью зажигаются от энергии вашей ГЭС!
            vec3 dayGlass = mix(vec3(0.18, 0.28, 0.38), uSkyColor * 0.85, 0.45);
            float onProb = vPowered > 0.5 ? 0.76 : 0.08; // без энергии ГЭС горит лишь редкий дежурный свет!
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor;
            vec3 warmLamp = mix(vec3(1.0, 0.80, 0.42), vec3(0.68, 0.90, 1.0), step(0.78, rnd));
            litWall = mix(dayGlass, warmLamp * (vPowered > 0.5 ? 1.35 : 0.45), windowLit);
          }
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        litWall = mix(litWall, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litWall, 1.0);
      }
    `,
  });
}
