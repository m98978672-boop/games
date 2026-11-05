// ============================================================
// ШОУРУМ: сцена, свет, пол, фоны и «студийные» отражения.
// Никаких внешних файлов: окружение рисуется на canvas и
// превращается в HDRI-карту через PMREM.
// ============================================================
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { canvasTexture, HAS_DOM } from './lib/kit.js';

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0d0c');
  scene.fog = new THREE.Fog('#0b0d0c', 42, 120);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 400);
  camera.position.set(8, 3.4, -9);

  // ---------------------------------------------------------- свет
  const hemi = new THREE.HemisphereLight(0xdfe9f2, 0x16191a, 1.15);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff4e2, 2.6);
  key.position.set(7, 13, -9);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -16;
  key.shadow.camera.right = 16;
  key.shadow.camera.top = 16;
  key.shadow.camera.bottom = -16;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 46;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 2.5;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbcd8ff, 0.85);
  fill.position.set(-10, 6, 7);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffd9a8, 1.5);
  rim.position.set(-4, 5, 12);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x9fe4ff, 0.7);
  rim2.position.set(9, 2.4, 9);
  scene.add(rim2);

  // «софиты» над сценой — видны в отражениях и как блики
  const spots = [];
  for (const [x, z, c] of [[-6, -6, 0xfff0d8], [6, -6, 0xdff3ff], [0, 7.5, 0xffe4c0]]) {
    const sp = new THREE.SpotLight(c, 130, 34, 0.55, 0.55, 1.6);
    sp.position.set(x, 11.5, z);
    sp.target.position.set(0, 1, 0);
    scene.add(sp, sp.target);
    spots.push(sp);
  }

  // ---------------------------------------------------------- окружение (HDRI)
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  let envRT = null;
  try {
    if (HAS_DOM) {
      const tex = studioEnvTexture();
      if (tex) {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        envRT = pmrem.fromEquirectangular(tex);
        scene.environment = envRT.texture;
        tex.dispose();
      }
    }
  } catch (e) {
    console.warn('env fallback', e);
  }
  if (!scene.environment) {
    try {
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    } catch (e) {
      console.warn('RoomEnvironment недоступен', e);
    }
  }
  scene.environmentIntensity = 0.9;

  // ---------------------------------------------------------- пол и подиум
  const stage = new THREE.Group();
  scene.add(stage);

  const floorTex = HAS_DOM
    ? canvasTexture(1024, 1024, (ctx, w, h) => {
        ctx.fillStyle = '#14171a';
        ctx.fillRect(0, 0, w, h);
        const cell = w / 8;
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            ctx.fillStyle = (x + y) % 2 ? '#171a1e' : '#111417';
            ctx.fillRect(x * cell, y * cell, cell, cell);
          }
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.045)';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 8; i++) {
          ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, h); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(w, i * cell); ctx.stroke();
        }
        // лёгкая шероховатость
        for (let i = 0; i < 9000; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
          ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
      }, { repeat: [6, 6] })
    : null;
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a2f33,
    roughness: 0.32,
    metalness: 0.55,
    map: floorTex,
    envMapIntensity: 0.65,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  stage.add(floor);

  // подиум-круг
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(9.2, 9.5, 0.1, 72, 1, false),
    new THREE.MeshStandardMaterial({ color: 0x1c2024, roughness: 0.2, metalness: 0.75, envMapIntensity: 0.9 })
  );
  podium.position.y = 0.05;
  podium.receiveShadow = true;
  stage.add(podium);
  const podiumRing = new THREE.Mesh(
    new THREE.TorusGeometry(9.32, 0.025, 6, 96),
    new THREE.MeshStandardMaterial({ color: 0xe8b45a, emissive: 0xe8b45a, emissiveIntensity: 1.3, roughness: 0.4 })
  );
  podiumRing.rotation.x = Math.PI / 2;
  podiumRing.position.y = 0.1;
  stage.add(podiumRing);

  // светлый зал: панорамная стена, чтобы из салона был виден шоурум, а не чернота
  const hallTex = HAS_DOM
    ? canvasTexture(1024, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#161c20');
        g.addColorStop(0.55, '#2a333a');
        g.addColorStop(0.72, '#5d6a72');
        g.addColorStop(0.88, '#39434a');
        g.addColorStop(1, '#151a1d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        // световые панели на стене
        for (let i = 0; i < 9; i++) {
          const x = 40 + i * 112;
          const lg = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.62);
          lg.addColorStop(0, 'rgba(255,244,224,0.85)');
          lg.addColorStop(1, 'rgba(255,244,224,0)');
          ctx.fillStyle = lg;
          ctx.fillRect(x, h * 0.2, 62, h * 0.42);
        }
        // тёмные колонны
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = 'rgba(10,12,14,0.55)';
          ctx.fillRect(20 + i * 112, h * 0.16, 12, h * 0.68);
        }
        // линия пола
        ctx.fillStyle = 'rgba(232,180,90,0.35)';
        ctx.fillRect(0, h * 0.7, w, 3);
      })
    : null;
  const hallMat = new THREE.MeshBasicMaterial({ map: hallTex, side: THREE.BackSide, fog: true });
  const hall = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 26, 48, 1, true), hallMat);
  hall.position.y = 12;
  stage.add(hall);
  // мягкий купол сверху
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(46, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x1b2227, side: THREE.BackSide, fog: true })
  );
  stage.add(dome);

  // декоративные дуги-арки над подиумом
  const arcMat = new THREE.MeshStandardMaterial({ color: 0x252b30, roughness: 0.35, metalness: 0.85 });
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(10.5 + i * 1.6, 0.07, 6, 120, Math.PI), arcMat);
    arc.rotation.z = Math.PI;
    arc.position.y = 0.5;
    arc.rotation.x = 0;
    arc.rotation.y = i * 0.35;
    stage.add(arc);
  }
  // линии на полу, уходящие вдаль
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x3a4248, transparent: true, opacity: 0.6 });
  for (let i = -6; i <= 6; i++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 60), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(i * 3, 0.011, -26);
    stage.add(line);
  }

  // ---------------------------------------------------------- режимы сцены
  const presets = {
    studio: {
      bg: '#0b0d0c', fog: ['#0b0d0c', 42, 120], floor: 0x2a2f33, floorRough: 0.32, floorMetal: 0.55,
      hemi: 1.15, key: 2.6, rim: 1.5, env: 0.9, exposure: 1.02, grid: true,
    },
    dark: {
      bg: '#050607', fog: ['#050607', 30, 90], floor: 0x0d1012, floorRough: 0.18, floorMetal: 0.8,
      hemi: 0.5, key: 1.8, rim: 2.6, env: 0.65, exposure: 0.92, grid: true,
    },
    show: {
      bg: '#101418', fog: ['#101418', 50, 130], floor: 0x3a4046, floorRough: 0.5, floorMetal: 0.35,
      hemi: 1.6, key: 3.2, rim: 1.2, env: 1.05, exposure: 1.06, grid: true,
    },
    garage: {
      bg: '#0e1112', fog: ['#0e1112', 38, 105], floor: 0x24282a, floorRough: 0.82, floorMetal: 0.15,
      hemi: 0.9, key: 2.2, rim: 0.9, env: 0.7, exposure: 1.0, grid: false,
    },
  };
  let presetName = 'studio';
  function setPreset(name) {
    const p = presets[name] || presets.studio;
    presetName = name;
    scene.background = new THREE.Color(p.bg);
    scene.fog = new THREE.Fog(p.fog[0], p.fog[1], p.fog[2]);
    floorMat.color.setHex(p.floor);
    floorMat.roughness = p.floorRough;
    floorMat.metalness = p.floorMetal;
    hemi.intensity = p.hemi;
    key.intensity = p.key;
    rim.intensity = p.rim;
    scene.environmentIntensity = p.env;
    renderer.toneMappingExposure = p.exposure;
    lineMat.opacity = p.grid ? 0.6 : 0.12;
    podiumRing.visible = name !== 'garage';
    for (const arc of stage.children) if (arc.geometry?.type === 'TorusGeometry' && arc !== podiumRing) arc.visible = name !== 'garage';
  }

  // ---------------------------------------------------------- размер canvas
  function resize() {
    const parent = canvas.parentElement;
    const w = Math.max(320, parent?.clientWidth || canvas.clientWidth || 900);
    const h = Math.max(240, parent?.clientHeight || canvas.clientHeight || 560);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement);
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera, stage, lights: { hemi, key, fill, rim, rim2, spots }, setPreset, resize, get preset() { return presetName; } };
}

/** Рисует «студийную» панораму 2:1: тёмный зал, полосы софтбоксов, градиент. */
function studioEnvTexture() {
  return canvasTexture(2048, 1024, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2a3339');
    sky.addColorStop(0.45, '#1a2025');
    sky.addColorStop(0.55, '#0d1114');
    sky.addColorStop(1, '#05080a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // «трубы» с лампами по потолку
    const lamp = (cx, cy, wid, hei, color, alpha = 1) => {
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, wid);
      g.addColorStop(0, color);
      g.addColorStop(0.55, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, wid, hei, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    // длинные софтбоксы (горизонтальные полосы) — главные блики на кузове
    for (let i = 0; i < 5; i++) {
      const y = 150 + i * 46;
      const g = ctx.createLinearGradient(0, y, w, y);
      g.addColorStop(0, 'rgba(255,244,225,0)');
      g.addColorStop(0.2, 'rgba(255,246,230,0.85)');
      g.addColorStop(0.5, 'rgba(255,250,240,1)');
      g.addColorStop(0.8, 'rgba(255,246,230,0.85)');
      g.addColorStop(1, 'rgba(255,244,225,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, w, 14 + i * 2);
    }
    // холодные полосы справа
    for (let i = 0; i < 3; i++) {
      const y = 360 + i * 40;
      const g = ctx.createLinearGradient(0, y, w, y);
      g.addColorStop(0, 'rgba(180,220,255,0)');
      g.addColorStop(0.55, 'rgba(200,232,255,0.55)');
      g.addColorStop(1, 'rgba(180,220,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, w, 10);
    }
    // круглые «софтбоксы» на стенах
    lamp(w * 0.15, h * 0.42, 190, 120, 'rgba(255,240,214,0.9)', 0.9);
    lamp(w * 0.62, h * 0.38, 230, 150, 'rgba(214,238,255,0.85)', 0.85);
    lamp(w * 0.88, h * 0.46, 160, 100, 'rgba(255,226,190,0.8)', 0.8);
    // отражение пола
    const g = ctx.createLinearGradient(0, h * 0.6, 0, h);
    g.addColorStop(0, 'rgba(60,70,78,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
  }, { srgb: true });
}

// ------------------------------------------------------------ без WebGL
// Минимальная «сцена-заглушка»: каталог, спецификации и виды остаются
// рабочими, а вместо картинки показывается пояснение в интерфейсе.
export function createFallbackStage() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0d0c');
  const camera = new THREE.PerspectiveCamera(38, 1.5, 0.05, 400);
  const domElement = HAS_DOM ? document.createElement('canvas') : null;
  const renderer = {
    domElement,
    capabilities: { getMaxAnisotropy: () => 1 },
    shadowMap: { enabled: false, type: 0 },
    outputColorSpace: THREE.SRGBColorSpace,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1,
    render() {},
    setPixelRatio() {},
    setSize() {},
    dispose() {},
  };
  return {
    renderer, scene, camera, lights: {},
    fallback: true,
    setPreset() {},
    resize() {},
  };
}
