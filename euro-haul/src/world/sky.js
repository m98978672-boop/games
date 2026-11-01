// Небо, солнце, луна, звёзды, облака, дождь и туман. Полные сутки за игровое время.
import * as THREE from 'three';
import { clamp, lerp, rng, smoothstep } from '../core/math.js';

const COL = {
  topDay: new THREE.Color(0x2f6fbf),
  topNight: new THREE.Color(0x050a1a),
  horizonDay: new THREE.Color(0xcfe0ea),
  horizonNight: new THREE.Color(0x121a2a),
  sunset: new THREE.Color(0xe58a52),
  greyTop: new THREE.Color(0x6b7787),
  greyHorizon: new THREE.Color(0x8e99a4),
  fogGrey: new THREE.Color(0x9aa6ad),
  sunWarm: new THREE.Color(0xfff3c4),
  sunLightWarm: new THREE.Color(0xfff0d0),
  hemiDay: new THREE.Color(0xbfd8f0),
  hemiNight: new THREE.Color(0x22304a),
};

const SKY_VERT = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const SKY_FRAG = `
uniform vec3 topColor;
uniform vec3 horizonColor;
uniform vec3 sunColor;
uniform vec3 sunDir;
uniform float sunStrength;
uniform float cloudiness;
uniform float cloudShift;
uniform vec3 cloudColor;
varying vec3 vDir;

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = h21(i);
  float b = h21(i + vec2(1.0, 0.0));
  float c = h21(i + vec2(0.0, 1.0));
  float d = h21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 dir = normalize(vDir);
  float h = clamp(dir.y * 1.4 + 0.05, 0.0, 1.0);
  vec3 col = mix(horizonColor, topColor, pow(h, 0.55));
  // плотная дымка у самой кромки земли
  float haze = pow(1.0 - clamp(dir.y * 3.2, 0.0, 1.0), 3.0);
  col = mix(col, horizonColor * 1.06, haze * 0.55);
  float sun = max(dot(dir, normalize(sunDir)), 0.0);
  col += sunColor * pow(sun, 240.0) * 2.6 * sunStrength;
  col += sunColor * pow(sun, 14.0) * 0.3 * sunStrength;
  col += sunColor * pow(sun, 3.0) * 0.12 * sunStrength;

  // Облака: плоская проекция направления на «небесный свод», 5 октав шума.
  float up = max(dir.y, 0.02);
  vec2 uv = dir.xz / (up + 0.28) * 1.15 + vec2(cloudShift * 0.35, cloudShift * 0.08);
  float n = fbm(uv);
  float cover = mix(0.62, 0.1, cloudiness);
  float c = smoothstep(cover, cover + 0.28, n);
  c *= smoothstep(0.0, 0.22, dir.y);
  float shade = smoothstep(0.35, 0.85, fbm(uv * 2.1 + 4.0));
  vec3 cc = mix(cloudColor * 0.78, cloudColor * 1.08, shade);
  col = mix(col, cc, c * 0.92);
  // подсветка краёв облаков у солнца
  col += sunColor * pow(sun, 8.0) * c * 0.35 * sunStrength;

  // ShaderMaterial не проходит через автоматическое преобразование цвета — кодируем в sRGB сами.
  gl_FragColor = vec4(pow(clamp(col, 0.0, 4.0), vec3(0.4545)), 1.0);
}`;

export const WEATHERS = {
  clear: { id: 'clear', name: 'Ясно', fog: 0.00045, rain: 0, cloud: 0.15, sun: 1, wet: 0, wind: 0.15 },
  cloudy: { id: 'cloudy', name: 'Переменная облачность', fog: 0.00068, rain: 0, cloud: 0.55, sun: 0.72, wet: 0, wind: 0.35 },
  overcast: { id: 'overcast', name: 'Пасмурно', fog: 0.00068, rain: 0, cloud: 0.9, sun: 0.4, wet: 0.05, wind: 0.5 },
  rain: { id: 'rain', name: 'Дождь', fog: 0.00085, rain: 0.55, cloud: 1, sun: 0.22, wet: 0.7, wind: 0.6 },
  storm: { id: 'storm', name: 'Гроза', fog: 0.0010, rain: 1, cloud: 1, sun: 0.12, wet: 1, wind: 1 },
  fog: { id: 'fog', name: 'Туман', fog: 0.0017, rain: 0, cloud: 0.85, sun: 0.25, wet: 0.35, wind: 0.05 },
};

export class SkySystem {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.weather = WEATHERS.clear;
    this.targetWeather = WEATHERS.clear;
    this.weatherBlend = 1;
    this.minutes = 8 * 60;
    this.night = 0;
    this.sunDir = new THREE.Vector3(0.4, 0.7, 0.2);

    this.dome = new THREE.Mesh(
      new THREE.SphereGeometry(4200, 32, 16),
      new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color(0x2a6fbb) },
          horizonColor: { value: new THREE.Color(0xbcd3e6) },
          sunColor: { value: new THREE.Color(0xfff1c4) },
          sunDir: { value: new THREE.Vector3(0.4, 0.7, 0.2) },
          sunStrength: { value: 1 },
          cloudiness: { value: 0.2 },
          cloudShift: { value: 0 },
          cloudColor: { value: new THREE.Color(0xffffff) },
        },
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      })
    );
    this.dome.frustumCulled = false;
    scene.add(this.dome);

    // Звёзды.
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    const r = rng(42);
    for (let i = 0; i < starCount; i++) {
      const theta = r() * Math.PI * 2;
      const phi = Math.acos(0.05 + r() * 0.95);
      const rr = 3800;
      starPos[i * 3] = Math.sin(phi) * Math.cos(theta) * rr;
      starPos[i * 3 + 1] = Math.cos(phi) * rr;
      starPos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rr;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 9, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.stars.frustumCulled = false;
    scene.add(this.stars);

    // Солнце и луна.
    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(90, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false })
    );
    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(58, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xdfe7f2, fog: false })
    );
    scene.add(this.sun, this.moon);

    // Свет.
    this.sunLight = new THREE.DirectionalLight(0xfff0d0, 2.6);
    this.sunLight.position.set(200, 400, 120);
    scene.add(this.sunLight);
    scene.add(this.sunLight.target);
    // Тень считается вокруг игрока, а не вокруг камеры: ортокамера 110×110 м.
    this.focus = new THREE.Vector3();
    this.shadowSpan = 60;
    this.hemi = new THREE.HemisphereLight(0xbcd6ef, 0x4b5540, 1.0);
    scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.28);
    scene.add(this.ambient);

    // Облака.
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 512;
    cloudCanvas.height = 512;
    const c = cloudCanvas.getContext('2d');
    const cr = rng(9);
    c.clearRect(0, 0, 512, 512);
    for (let i = 0; i < 130; i++) {
      const x = cr() * 512;
      const y = cr() * 512;
      const rad = 18 + cr() * 62;
      const grad = c.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, `rgba(255,255,255,${0.12 + cr() * 0.2})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
      c.fill();
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
    cloudTex.repeat.set(3, 3);
    this.cloudMat = new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.5, depthWrite: false, fog: false, color: 0xffffff });
    this.clouds = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), this.cloudMat);
    this.clouds.rotation.x = -Math.PI / 2;
    this.clouds.position.y = 900;
    this.clouds.frustumCulled = false;
    scene.add(this.clouds);
    this.cloudTex = cloudTex;

    // Дождь.
    this.rainCount = 3200;
    const rainPos = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 120;
      rainPos[i * 3 + 1] = Math.random() * 40;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    // Капля — не квадрат, а тонкая вертикальная черта: так дождь читается даже вблизи.
    const dropCanvas = document.createElement('canvas');
    dropCanvas.width = 16;
    dropCanvas.height = 64;
    const dctx = dropCanvas.getContext('2d');
    const dgrad = dctx.createLinearGradient(0, 0, 0, 64);
    dgrad.addColorStop(0, 'rgba(210,226,236,0)');
    dgrad.addColorStop(0.45, 'rgba(214,230,240,0.85)');
    dgrad.addColorStop(1, 'rgba(210,226,236,0)');
    dctx.fillStyle = dgrad;
    dctx.fillRect(6, 0, 4, 64);
    const dropTex = new THREE.CanvasTexture(dropCanvas);
    dropTex.colorSpace = THREE.SRGBColorSpace;
    this.rainMat = new THREE.PointsMaterial({
      color: 0xcfdfe8,
      size: 0.42,
      map: dropTex,
      transparent: true,
      opacity: 0.42,
      alphaTest: 0.02,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.rain = new THREE.Points(rainGeo, this.rainMat);
    this.rain.frustumCulled = false;
    this.rain.visible = false;
    scene.add(this.rain);
    this.rainSpeeds = new Float32Array(this.rainCount).map(() => 18 + Math.random() * 14);

    this.fog = new THREE.FogExp2(0xaebfcb, 0.0003);
    scene.fog = this.fog;
    this._tmpColor = new THREE.Color();
    this.lightning = 0;

    // Ореол вокруг солнца: мягкое аддитивное пятно, дешёвая замена блуму.
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const gc = glowCanvas.getContext('2d');
    const gg = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
    gg.addColorStop(0, 'rgba(255,246,214,0.95)');
    gg.addColorStop(0.18, 'rgba(255,238,190,0.55)');
    gg.addColorStop(0.45, 'rgba(255,226,168,0.16)');
    gg.addColorStop(1, 'rgba(255,220,160,0)');
    gc.fillStyle = gg;
    gc.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    this.sunGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, fog: false })
    );
    this.sunGlow.scale.setScalar(760);
    scene.add(this.sunGlow);

    // Дальние холмы: кольцо с неровным профилем, даёт глубину за туманом.
    const SEG = 220;
    const hpos = [];
    const hcol = [];
    const hidx = [];
    const hr = rng(19);
    const heights = Array.from({ length: SEG }, () => 26 + hr() * 34 + Math.sin(hr() * 6) * 22);
    for (let i = 0; i < SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const a2 = ((i + 1) / SEG) * Math.PI * 2;
      const R = 2350;
      const h0 = heights[i];
      const h1 = heights[(i + 1) % SEG];
      const x0 = Math.cos(a) * R;
      const z0 = Math.sin(a) * R;
      const x1 = Math.cos(a2) * R;
      const z1 = Math.sin(a2) * R;
      const base = hpos.length / 3;
      hpos.push(x0, -120, z0, x0, h0, z0, x1, -120, z1, x1, h1, z1);
      const low = new THREE.Color(0x22303a);
      const high = new THREE.Color(0x4a6070);
      hcol.push(low.r, low.g, low.b, high.r, high.g, high.b, low.r, low.g, low.b, high.r, high.g, high.b);
      hidx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
    }
    const hillGeo = new THREE.BufferGeometry();
    hillGeo.setAttribute('position', new THREE.Float32BufferAttribute(hpos, 3));
    hillGeo.setAttribute('color', new THREE.Float32BufferAttribute(hcol, 3));
    hillGeo.setIndex(hidx);
    hillGeo.computeVertexNormals();
    this.hills = new THREE.Mesh(
      hillGeo,
      new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: true, depthWrite: false })
    );
    this.hills.frustumCulled = false;
    scene.add(this.hills);

    this.envCanvas = document.createElement('canvas');
    this.envCanvas.width = 128;
    this.envCanvas.height = 64;
    this.envTex = new THREE.CanvasTexture(this.envCanvas);
    this.envTex.mapping = THREE.EquirectangularReflectionMapping;
    this.envTex.colorSpace = THREE.SRGBColorSpace;
    this.envAccum = 5;
    this.envSunY = -9;
    this.pmrem = null;
  }

  /** Включает солнце как источник теней. */
  enableShadows() {
    this.sunLight.castShadow = true;
    const cam = this.sunLight.shadow.camera;
    cam.left = -this.shadowSpan;
    cam.right = this.shadowSpan;
    cam.top = this.shadowSpan;
    cam.bottom = -this.shadowSpan;
    cam.near = 20;
    cam.far = 420;
    cam.updateProjectionMatrix();
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.06;
    this.sunLight.shadow.radius = 2.4;
  }

  /** Качество теней под устройство. */
  shadowQuality(q) {
    if (!this.sunLight) return;
    const size = q === 'low' ? 512 : q === 'medium' ? 1024 : 2048;
    if (this.sunLight.shadow.mapSize.x !== size) {
      this.sunLight.shadow.mapSize.set(size, size);
      if (this.sunLight.shadow.map) {
        this.sunLight.shadow.map.dispose();
        this.sunLight.shadow.map = null;
      }
    }
    this.sunLight.shadow.radius = q === 'low' ? 1.2 : q === 'medium' ? 2 : 3;
    this.shadowSpan = q === 'low' ? 40 : q === 'medium' ? 50 : 62;
    const cam = this.sunLight.shadow.camera;
    cam.left = -this.shadowSpan;
    cam.right = this.shadowSpan;
    cam.top = this.shadowSpan;
    cam.bottom = -this.shadowSpan;
    cam.updateProjectionMatrix();
  }

  /**
   * Небо как источник отражений для PBR-материалов (краска, хром, стекло).
   * Без этого металл и лак выглядят «пластиковыми».
   */
  applyEnvironment(renderer, scene) {
    if (!renderer || this.envReady) return;
    const g = this.envCanvas.getContext('2d');
    const w = 128;
    const h = 64;
    const top = this.dome.material.uniforms.topColor.value;
    const horizon = this.dome.material.uniforms.horizonColor.value;
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#' + top.getHexString());
    grd.addColorStop(0.46, '#' + horizon.getHexString());
    grd.addColorStop(0.5, '#' + horizon.getHexString());
    grd.addColorStop(0.56, '#3c4238');
    grd.addColorStop(1, '#2a2e28');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    // солнце в эквиректангулярных координатах
    const dir = this.sunDir;
    const u = (Math.atan2(dir.z, dir.x) / (Math.PI * 2) + 0.5) * w;
    const v = (1 - (Math.asin(clamp(dir.y, -1, 1)) / Math.PI + 0.5)) * h;
    const sg = g.createRadialGradient(u, v, 0, u, v, 16);
    sg.addColorStop(0, 'rgba(255,250,225,1)');
    sg.addColorStop(0.35, 'rgba(255,238,190,0.55)');
    sg.addColorStop(1, 'rgba(255,230,180,0)');
    g.fillStyle = sg;
    g.fillRect(0, 0, w, h);
    this.envTex.needsUpdate = true;
    try {
      if (!this.pmrem) this.pmrem = new THREE.PMREMGenerator(renderer);
      const rt = this.pmrem.fromEquirectangular(this.envTex);
      if (this.envRT) this.envRT.dispose();
      this.envRT = rt;
      scene.environment = rt.texture;
      if ('environmentIntensity' in scene) scene.environmentIntensity = 0.75;
      this.envReady = true;
    } catch (err) {
      this.envReady = false;
    }
  }

  /** Урезает частицы на слабых устройствах. */
  setQuality(q) {
    this.quality = q;
    const rain = q === 'low' ? 1100 : q === 'medium' ? 2200 : 3200;
    const stars = q === 'low' ? 700 : q === 'medium' ? 1100 : 1400;
    this.rain.geometry.setDrawRange(0, rain);
    this.stars.geometry.setDrawRange(0, stars);
    this.cloudMat.opacity = Math.min(this.cloudMat.opacity, q === 'low' ? 0.5 : 1);
  }

  setWeather(id, instant = false) {
    const w = WEATHERS[id] || WEATHERS.clear;
    if (instant) {
      this.weather = w;
      this.targetWeather = w;
      this.weatherBlend = 1;
    } else {
      this.targetWeather = w;
      this.weatherBlend = 0;
    }
  }

  setTime(minutes) {
    this.minutes = minutes;
  }

  /** Цвет неба и освещение по игровому времени и погоде. */
  update(dt, camera, minutes) {
    this.minutes = minutes;
    this.weatherBlend = Math.min(1, this.weatherBlend + dt * 0.25);
    const t = this.weatherBlend;
    const w = this.weather;
    const w2 = this.targetWeather;
    const mix = (a, b) => lerp(a, b, t);
    const fogDensity = mix(w.fog, w2.fog);
    const rainAmt = mix(w.rain, w2.rain);
    const cloudAmt = mix(w.cloud, w2.cloud);
    const sunAmt = mix(w.sun, w2.sun);
    if (t >= 1) this.weather = w2;
    const wet = mix(w.wet, w2.wet);

    // Солнце: дуга по времени суток.
    const dayPhase = ((minutes - 360) / 720) * Math.PI; // 6:00 -> 0, 18:00 -> π
    const elev = Math.sin(dayPhase);
    const azim = dayPhase * 0.9 - 0.5;
    const sunY = elev;
    const sunX = Math.cos(azim) * Math.sqrt(Math.max(0, 1 - elev * elev));
    const sunZ = Math.sin(azim) * Math.sqrt(Math.max(0, 1 - elev * elev));
    this.sunDir.set(sunX, sunY, sunZ).normalize();
    const night = clamp(-elev * 4 + 0.25, 0, 1);
    this.night = night;
    const day = 1 - night;

    // Цвета неба (константы созданы один раз).
    const topDay = COL.topDay;
    const topNight = COL.topNight;
    const horizonDay = COL.horizonDay;
    const horizonNight = COL.horizonNight;
    const sunset = clamp(1 - Math.abs(elev) * 6, 0, 1) * day;
    const top = topNight.clone().lerp(topDay, day);
    const horizon = horizonNight.clone().lerp(horizonDay, day).lerp(COL.sunset, sunset * 0.65);
    top.lerp(COL.greyTop, cloudAmt * 0.55);
    horizon.lerp(COL.greyHorizon, cloudAmt * 0.5);
    this.dome.material.uniforms.topColor.value.copy(top);
    this.dome.material.uniforms.horizonColor.value.copy(horizon);
    this.dome.material.uniforms.sunDir.value.copy(this.sunDir);
    this.dome.material.uniforms.sunStrength.value = sunAmt;
    const cu = this.dome.material.uniforms;
    cu.cloudiness.value = cloudAmt;
    cu.cloudShift.value = (this.cloudShift = (this.cloudShift || 0) + dt * 0.012);
    cu.cloudColor.value.setHex(night > 0.5 ? 0x39424f : 0xffffff).lerp(COL.sunset, sunset * 0.35);
    cu.cloudColor.value.multiplyScalar(0.55 + 0.45 * day);
    this.dome.position.copy(camera.position);

    this.stars.position.copy(camera.position);
    this.starMat.opacity = clamp(night * (1 - cloudAmt * 0.85), 0, 1) * 0.9;
    this.sun.position.copy(camera.position).addScaledVector(this.sunDir, 3400);
    this.sun.visible = elev > -0.1 && cloudAmt < 0.95;
    this.moon.position.copy(camera.position).addScaledVector(this.sunDir.clone().negate(), 3200);
    this.moon.visible = night > 0.2;
    this.sun.material.color.copy(COL.sunWarm).lerp(COL.sunset, sunset);
    this.sun.scale.setScalar(1 + sunset * 0.5);
    this.sunGlow.position.copy(this.sun.position);
    this.sunGlow.material.opacity = clamp(elev * 2.2, 0, 1) * sunAmt * (1 - cloudAmt * 0.7) * 0.9;
    this.sunGlow.scale.setScalar(620 + sunset * 320);
    this.hills.position.set(camera.position.x, camera.position.y - 40, camera.position.z);
    this.hills.material.color.setHex(0xffffff).multiplyScalar(0.35 + day * 0.65);
    this.hills.material.opacity = 1;

    this.clouds.position.set(camera.position.x, camera.position.y + 700, camera.position.z);
    this.cloudMat.opacity = 0.15 + cloudAmt * 0.62;
    this.cloudMat.color.setHex(night > 0.5 ? 0x2b3340 : 0xffffff);
    this.cloudTex.offset.x += dt * 0.0025;

    // Свет.
    this.sunLight.intensity = (0.15 + 3.1 * day) * sunAmt;
    this.sunLight.color.copy(COL.sunLightWarm).lerp(COL.sunset, sunset * 0.9);
    const focus = this.focus.lengthSq() > 1 ? this.focus : camera.position;
    this.sunLight.position.copy(focus).addScaledVector(this.sunDir, 200);
    this.sunLight.target.position.copy(focus);
    this.sunLight.target.updateMatrixWorld();
    if (this.sunLight.shadow.camera.near > 0) {
      const cam = this.sunLight.shadow.camera;
      cam.near = 20;
      cam.far = 420;
      cam.updateProjectionMatrix();
    }
    this.hemi.intensity = 0.22 + day * 1.0;
    this.hemi.color.copy(COL.hemiDay).lerp(COL.hemiNight, night);
    this.ambient.intensity = 0.1 + day * 0.3;

    // Туман.
    const fogColor = horizon.clone().lerp(COL.fogGrey, cloudAmt * 0.3);
    this.fog.color.copy(fogColor);
    this.fog.density = lerp(fogDensity, 0.0009, rainAmt * 0.35);
    this.scene.background = fogColor.clone();

    // Дождь.
    this.rain.visible = rainAmt > 0.02;
    if (this.rain.visible) {
      const pos = this.rain.geometry.attributes.position;
      for (let i = 0; i < this.rainCount; i++) {
        let y = pos.array[i * 3 + 1] - this.rainSpeeds[i] * dt * (0.6 + rainAmt);
        let x = pos.array[i * 3] + 6 * dt;
        let z = pos.array[i * 3 + 2] + 9 * dt;
        if (y < -2) {
          y = 38 + Math.random() * 12;
          x = (Math.random() - 0.5) * 120;
          z = (Math.random() - 0.5) * 170;
        }
        pos.array[i * 3] = x;
        pos.array[i * 3 + 1] = y;
        pos.array[i * 3 + 2] = z;
      }
      pos.needsUpdate = true;
      this.rain.position.set(camera.position.x, camera.position.y - 8, camera.position.z);
      this.rainMat.opacity = 0.4 + rainAmt * 0.4;
      this.rainMat.size = 0.13 + rainAmt * 0.1;
    }

    // Молнии.
    if (rainAmt > 0.9 && Math.random() < dt * 0.12) this.lightning = 1;
    if (this.lightning > 0) {
      this.lightning = Math.max(0, this.lightning - dt * 4);
      this.sunLight.intensity += this.lightning * 5;
      this.hemi.intensity += this.lightning * 1.5;
    }

    // Окружение (отражения) пересобираем не чаще раза в 1.2 с и только при заметной смене света.
    this.envAccum += dt;
    if (this.envAccum > 1.2 && this.renderer && Math.abs(elev - this.envSunY) > 0.035) {
      this.envAccum = 5;
      this.envSunY = elev;
      this.applyEnvironment(this.renderer, this.scene);
    }

    const nightLights = clamp(night * 1.6 + rainAmt * 0.35 + (1 - day) * 0.4, 0, 1);
    return {
      night: nightLights,
      wet,
      rain: rainAmt,
      fog: this.fog.density,
      day,
      weatherName: (t >= 1 ? w2 : w).name,
      sunElevation: elev,
    };
  }
}
