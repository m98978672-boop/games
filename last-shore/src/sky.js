// ============================================================
//  Небо, солнце, луна, звёзды и суточный цикл.
// ============================================================

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { clamp, smoothstep } from './noise.js';

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uNight;
  varying vec3 vDir;

  void main() {
    float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uBottom, uTop, pow(h, 0.85));

    // тёплое свечение вокруг солнца
    float d = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
    col += uSunColor * pow(d, 12.0) * 0.55 * (1.0 - uNight);
    col += uSunColor * pow(d, 220.0) * 1.4;

    // звёздная дымка по краю
    col += vec3(0.02, 0.03, 0.06) * uNight;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export class Sky {
  constructor(scene, renderer, textures = null) {
    this.scene = scene;
    this.textures = textures;
    this.renderer = renderer;
    this.hour = CONFIG.time.startHour;
    this.day = 1;

    // --- источник света: солнце ---
    this.sun = new THREE.DirectionalLight(0xfff2d0, 2.0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.near = 1;
    sc.far = 220;
    sc.left = -65;
    sc.right = 65;
    sc.top = 65;
    sc.bottom = -65;
    this.sun.shadow.bias = -0.0007;
    this.sun.shadow.normalBias = 0.035;
    scene.add(this.sun);
    scene.add(this.sun.target);

    // --- луна: слабый синий свет ночью ---
    this.moon = new THREE.DirectionalLight(0x9db8e8, 0.0);
    this.moon.castShadow = false;
    scene.add(this.moon);
    scene.add(this.moon.target);

    // --- заполняющий свет ---
    this.hemi = new THREE.HemisphereLight(0xc6e0f4, 0x6b7a52, 0.95);
    scene.add(this.hemi);

    this.ambient = new THREE.AmbientLight(0x4d6478, 0.25);
    scene.add(this.ambient);

    // --- небесный купол ---
    this.skyUniforms = {
      uTop: { value: new THREE.Color(0x2f7fd0) },
      uBottom: { value: new THREE.Color(0xbfe0f0) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.7, 0.3) },
      uSunColor: { value: new THREE.Color(0xffe6b0) },
      uNight: { value: 0 },
    };
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms,
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyDome = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 20), this.skyMat);
    this.skyDome.renderOrder = -10;
    scene.add(this.skyDome);

    // --- звёзды ---
    const starCount = 1400;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random() * 0.85 + 0.15; // только верхняя полусфера
      const theta = u * Math.PI * 2;
      const phi = Math.acos(1 - v);
      const r = 820;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.9 + 40;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xdfe9ff,
      size: 2.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.stars.renderOrder = -9;
    scene.add(this.stars);

    // --- диск солнца и луны ---
    this.sunDisk = new THREE.Mesh(
      new THREE.SphereGeometry(14, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false })
    );
    this.sunDisk.renderOrder = -8;
    scene.add(this.sunDisk);

    this.moonDisk = new THREE.Mesh(
      new THREE.SphereGeometry(9, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xdfe8ff, fog: false })
    );
    this.moonDisk.renderOrder = -8;
    scene.add(this.moonDisk);

    // --- облака: несколько рыхлых «пятен» на высоте, медленно плывут ---
    this.clouds = new THREE.Group();
    this.cloudMaterials = [];
    scene.add(this.clouds);
    const cloudGeo = new THREE.PlaneGeometry(180, 110);
    for (let i = 0; i < 9; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: textures ? textures.cloud : null,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        fog: false,
      });
      this.cloudMaterials.push(mat);
      const mesh = new THREE.Mesh(cloudGeo, mat);
      const angle = (i / 9) * Math.PI * 2 + Math.random();
      const radius = 260 + Math.random() * 260;
      mesh.position.set(Math.cos(angle) * radius, 95 + Math.random() * 60, Math.sin(angle) * radius);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.scale.setScalar(0.7 + Math.random() * 0.9);
      mesh.renderOrder = -7;
      this.clouds.add(mesh);
    }

    // туман
    scene.fog = new THREE.Fog(0xbfe0f0, 60, 340);

    this.sunDir = new THREE.Vector3(0.4, 0.7, 0.3).normalize();
    this.nightFactor = 0;
    this.fogColor = new THREE.Color(0xbfe0f0);

    this.nightTop = new THREE.Color(0x050a18);
    this.nightBottom = new THREE.Color(0x0c1c2e);
    this.dayTop = new THREE.Color(0x2b78c8);
    this.dayBottom = new THREE.Color(0xbfe4f2);
    this.duskTop = new THREE.Color(0x27315e);
    this.duskBottom = new THREE.Color(0xf28a4b);

    this.tmpA = new THREE.Color();
    this.tmpB = new THREE.Color();
  }

  /** Возвращает фактор ночи и цвет тумана — их использует вода */
  update(dt, playerPos) {
    const dayLen = CONFIG.time.dayLength;
    const prevHour = this.hour;
    this.hour += (dt / dayLen) * 24;
    if (this.hour >= 24) {
      this.hour -= 24;
      this.day += 1;
      this.onNewDay?.();
    }
    if (prevHour < 6 && this.hour >= 6) this.onSunrise?.();

    const t = this.hour / 24;
    const angle = (t - 0.25) * Math.PI * 2;
    const elev = Math.sin(angle);
    this.sunDir.set(Math.cos(angle) * 0.92, elev, 0.36).normalize();

    // солнце светит по направлению к сцене
    const lightDir = this.sunDir.clone().multiplyScalar(120);
    this.sun.position.copy(playerPos).add(lightDir);
    this.sun.target.position.copy(playerPos);

    const lightUp = smoothstep(-0.06, 0.22, elev);
    this.sun.intensity = 2.1 * lightUp;
    this.sun.color.setRGB(1.0, 0.94 - (1 - lightUp) * 0.05, 0.82 + (1 - lightUp) * 0.12);

    const night = clamp(smoothstep(0.10, -0.16, elev), 0, 1);
    this.nightFactor = night;

    // луна: противоположная солнцу точка, светит только ночью
    const moonDir = this.sunDir.clone().multiplyScalar(-1);
    this.moon.position.copy(playerPos).add(moonDir.multiplyScalar(100));
    this.moon.target.position.copy(playerPos);
    this.moon.intensity = 1.5 * night;

    this.hemi.intensity = 0.8 + 0.85 * lightUp + 0.35 * night;
    this.hemi.color.setHex(0x9fc6e8).lerp(new THREE.Color(0x3d4f74), night);
    this.ambient.intensity = 0.5 + 0.45 * (1 - night) + 0.3 * night;

    // солнце/луна на небе
    this.sunDisk.position.copy(this.sunDir).multiplyScalar(760);
    this.sunDisk.visible = elev > -0.15;
    this.moonDisk.position.copy(this.sunDir).multiplyScalar(-760);
    this.moonDisk.visible = elev < 0.20;

    // --- цвет неба ---
    const dusk = clamp(1 - Math.abs(elev) / 0.35, 0, 1);
    const dayMix = clamp(smoothstep(-0.02, 0.3, elev), 0, 1);

    // ночь -> закат -> день
    this.tmpA.copy(this.nightTop).lerp(this.duskTop, clamp(dayMix * 1.4, 0, 1));
    this.skyUniforms.uTop.value.copy(this.tmpA).lerp(this.dayTop, dayMix * dayMix);

    this.tmpB.copy(this.nightBottom).lerp(this.duskBottom, clamp(dusk * 1.2, 0, 1) * 0.9 + dayMix * 0.2);
    this.skyUniforms.uBottom.value.copy(this.tmpB).lerp(this.dayBottom, clamp(dayMix * 1.15, 0, 1));

    this.skyUniforms.uSunDir.value.copy(this.sunDir);
    this.skyUniforms.uSunColor.value.setHex(0xffcf80).lerp(new THREE.Color(0xfff4cf), dayMix);
    this.skyUniforms.uNight.value = night;

    this.starMat.opacity = clamp(smoothstep(0.25, 0.9, night), 0, 1) * 0.9;

    // туман = цвет горизонта, чуть темнее
    this.fogColor.copy(this.skyUniforms.uBottom.value).multiplyScalar(0.92);
    this.scene.fog.color.copy(this.fogColor);
    this.scene.fog.near = 95 - night * 30;
    this.scene.fog.far = 430 - night * 170;

    this.skyDome.position.copy(playerPos);
    this.stars.position.copy(playerPos);

    // облака: держим вокруг игрока и крутим медленно по кругу
    this.clouds.position.set(playerPos.x, 0, playerPos.z);
    this.clouds.rotation.y += dt * 0.004;
    const cloudTint = 0.55 + dayMix * 0.45;
    for (const mat of this.cloudMaterials) {
      mat.color.setRGB(cloudTint, cloudTint * 0.98, cloudTint * 0.95);
      mat.opacity = (0.18 + dayMix * 0.42) * (this.cloudiness ?? 1);
    }

    return { night, sunDir: this.sunDir, fogColor: this.fogColor };
  }

  /** Часы в формате ЧЧ:ММ */
  clockString() {
    const h = Math.floor(this.hour);
    const m = Math.floor((this.hour - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  isNight() {
    const h = this.hour;
    return h >= CONFIG.time.nightStart || h < CONFIG.time.dayStart;
  }
}
