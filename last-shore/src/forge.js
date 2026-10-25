// ============================================================
//  Кузница: предмет, которого нет в рецептах.
//
//  На верстаке игрок выбирает форму (клинок, топор, кирка, копьё,
//  кинжал) и материал. Игра собирает предмет процедурно: имя,
//  значок, характеристики и 3D-модельку — всё генерируется здесь,
//  поэтому двух одинаковых вещей почти не бывает.
//
//  Такой предмет выходит «из-под молота»: он не заточен.
//  Заточить его можно на точильном станке — и тогда урон растёт.
//  Инструменты из обычных рецептов уже заточены и станку не подлежат.
// ============================================================

import * as THREE from 'three';
import { ITEMS, BAG_ORDER } from './items.js';

/** Материалы: цвет, блеск, множители и цена */
export const MATERIALS = {
  flint: {
    id: 'flint', name: 'кремня', gen: 'кремнёвый', cost: { flint: 3, wood: 1 },
    color: 0x8d94a1, edge: 0xd9e0e8, metal: 0.05, rough: 0.7, mul: 1.0, tier: 0,
  },
  iron: {
    id: 'iron', name: 'железа', gen: 'железный', cost: { iron: 2, wood: 1 },
    color: 0x9aa3ad, edge: 0xe8eef5, metal: 0.65, rough: 0.35, mul: 1.35, tier: 1,
  },
  crystal: {
    id: 'crystal', name: 'кристалла', gen: 'кристальный', cost: { crystal: 2, iron: 1 },
    color: 0x6fe3d2, edge: 0xd8fff9, metal: 0.35, rough: 0.2, mul: 1.7, tier: 2, glow: 0x2fd8c0,
  },
  obsidian: {
    id: 'obsidian', name: 'обсидиана', gen: 'обсидиановый', cost: { obsidian: 2, crystal: 1 },
    color: 0x3a2b56, edge: 0xb083ff, metal: 0.4, rough: 0.25, mul: 2.1, tier: 3, glow: 0x7a3cff,
  },
};

/** Формы: как выглядит и как бьёт */
export const FORMS = {
  sword: {
    id: 'sword', name: 'Клинок', noun: 'Клинок', icon: 'sword',
    base: { weapon: 26, chop: 1.1, mine: 0.5 },
    note: 'длинное лезвие — против зверя и человека',
  },
  axe: {
    id: 'axe', name: 'Боевой топор', noun: 'Топор', icon: 'axe',
    base: { weapon: 22, chop: 3.2, mine: 1.0 },
    note: 'валит деревья и разрубает шкуру',
  },
  pick: {
    id: 'pick', name: 'Клевец', noun: 'Клевец', icon: 'pick',
    base: { weapon: 17, chop: 1.0, mine: 3.6 },
    note: 'пробивает камень и руду в шахте',
  },
  spear: {
    id: 'spear', name: 'Копьё', noun: 'Копьё', icon: 'spear',
    base: { weapon: 30, chop: 0.8, mine: 0.4 },
    note: 'держит зверя на расстоянии',
  },
  dagger: {
    id: 'dagger', name: 'Кинжал', noun: 'Кинжал', icon: 'dagger',
    base: { weapon: 19, chop: 1.6, mine: 0.5 },
    note: 'быстрый и точный',
  },
};

const QUALITY = [
  { max: 0.34, name: 'грубый', mul: 0.86 },
  { max: 0.72, name: 'ладный', mul: 1.0 },
  { max: 0.93, name: 'добротный', mul: 1.14 },
  { max: 1.01, name: 'отменный', mul: 1.3 },
];

const SHARPEN_STEP = 0.16;
const MAX_SHARP = 1;

let counter = 0;

function rngFrom(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const hex = (n) => '#' + n.toString(16).padStart(6, '0');

function iconFor(formId, matId) {
  const m = MATERIALS[matId] || MATERIALS.flint;
  const c = hex(m.color);
  const e = hex(m.edge);
  const shapes = {
    sword: `<path d="M9 19l7-7 2-6 1-1 1 1-1 6-7 7z" fill="${e}"/><path d="M7 15l2 2" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="M6 20l3-3" stroke="#8a6a42" stroke-width="2.6" stroke-linecap="round"/>`,
    axe: `<path d="M6 20l8-8" stroke="#8a6a42" stroke-width="2.4" stroke-linecap="round"/><path d="M12 5q6 0 7 5-3 1-4 4l-5-3z" fill="${c}"/><path d="M18 4l2 6" stroke="${e}" stroke-width="1.4"/>`,
    pick: `<path d="M6 20l8-8" stroke="#8a6a42" stroke-width="2.4" stroke-linecap="round"/><path d="M8 8q5-4 10-1-4 0-5 4l-3 1z" fill="${c}"/><circle cx="9" cy="8" r="1.4" fill="${e}"/>`,
    spear: `<path d="M4 20L16 7" stroke="#8a6a42" stroke-width="2"/><path d="M16 3l5 5-6 1z" fill="${e}"/><path d="M17 8l2 2" stroke="${c}" stroke-width="1.6"/>`,
    dagger: `<path d="M9 18l5-5 1-5 1 0 0 5-5 5z" fill="${e}"/><path d="M8 15l3 3" stroke="${c}" stroke-width="2"/><path d="M7 20l3-3" stroke="#8a6a42" stroke-width="2.4" stroke-linecap="round"/>`,
  };
  const glow = m.glow ? `<circle cx="12" cy="12" r="11" fill="${hex(m.glow)}" opacity="0.12"/>` : '';
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${glow}${shapes[formId] || shapes.sword}</svg>`;
}

/** Зарегистрировать предмет в общем словаре по сохранённым данным */
export function registerForged(meta) {
  if (!meta || !meta.id) return null;
  const form = FORMS[meta.form] || FORMS.sword;
  const mat = MATERIALS[meta.mat] || MATERIALS.flint;
  const def = {
    id: meta.id,
    name: meta.name || `${form.noun} из ${mat.name}`,
    icon: meta.icon || iconFor(form.id, mat.id),
    kind: 'tool',
    hotbar: true,
    forged: true,
    form: form.id,
    mat: mat.id,
    sharp: typeof meta.sharp === 'number' ? meta.sharp : 0,
    tuned: !!meta.tuned,          // заточен ли на станке
    quality: meta.quality || 'ладный',
    roll: meta.roll || 1,
    tool: meta.tool || { weapon: 20, chop: 1, mine: 1 },
  };
  ITEMS[def.id] = def;
  if (!BAG_ORDER.includes(def.id)) BAG_ORDER.push(def.id);
  return def;
}

/**
 * Собрать новый предмет: характеристики считаются от формы, материала
 * и случайного зерна, чтобы каждая ковка выходила своей.
 */
export function forge(formId, matId, seed = Date.now()) {
  const form = FORMS[formId] || FORMS.sword;
  const mat = MATERIALS[matId] || MATERIALS.flint;
  const rnd = rngFrom(seed ^ (form.id.length * 7919) ^ (mat.tier * 104729) ^ (counter * 2654435761));
  const qRoll = rnd();
  const quality = QUALITY.find((q) => qRoll < q.max) || QUALITY[1];
  const roll = 0.88 + rnd() * 0.26;           // разброс характеристик
  const suffix = Math.floor(rnd() * 900 + 100);
  const id = `forge_${form.id}_${mat.id}_${suffix}${counter++ % 10}`;

  const k = mat.mul * quality.mul * roll;
  const tool = {
    weapon: Math.round(form.base.weapon * k),
    chop: +(form.base.chop * (0.8 + mat.mul * 0.35) * roll).toFixed(2),
    mine: +(form.base.mine * (0.8 + mat.mul * 0.35) * roll).toFixed(2),
  };

  const meta = {
    id,
    form: form.id,
    mat: mat.id,
    name: `${form.noun} из ${mat.name} (${quality.name})`,
    quality: quality.name,
    roll,
    tool,
    sharp: 0,
    tuned: false,
    icon: iconFor(form.id, mat.id),
    seed: seed >>> 0,
  };
  registerForged(meta);
  return ITEMS[id];
}

/** Сколько стоит ковка (материалы + палка на рукоять) */
export function forgeCost(formId, matId) {
  const mat = MATERIALS[matId] || MATERIALS.flint;
  return { ...mat.cost };
}

/** Множитель урона от заточки: кованое без заточки бьёт вполсилы */
export function edgeMultiplier(def) {
  if (!def) return 1;
  if (def.forged) return 0.55 + (def.sharp || 0) * 0.95;
  return 1;
}

/** Урон оружия с учётом заточки */
export function effectiveWeapon(def) {
  if (!def || !def.tool) return 4;
  return (def.tool.weapon || 4) * edgeMultiplier(def);
}

/** Характеристики с учётом заточки — для панели и подсказок */
export function effectiveTool(def) {
  if (!def || !def.tool) return null;
  const m = edgeMultiplier(def);
  return {
    weapon: +(def.tool.weapon * m).toFixed(1),
    chop: +(def.tool.chop * (def.forged ? 0.7 + m * 0.4 : 1)).toFixed(2),
    mine: +(def.tool.mine * (def.forged ? 0.7 + m * 0.4 : 1)).toFixed(2),
  };
}

/** Можно ли точить: только кованое и пока не выведено в идеал */
export function canSharpen(def) {
  return !!(def && def.forged && (def.sharp || 0) < MAX_SHARP - 0.001);
}

/**
 * Заточить на станке. Возвращает { ok, sharp, text }.
 * Каждое прохождение добавляет ступень, но не больше единицы.
 */
export function sharpen(def, abrasive = 1) {
  if (!def) return { ok: false, text: 'Нечего точить' };
  if (!def.forged) {
    return { ok: false, text: `${def.name} уже заточен — станок ему не нужен` };
  }
  if (!canSharpen(def)) {
    return { ok: false, text: `${def.name} и так остёр как бритва` };
  }
  const before = def.sharp || 0;
  def.sharp = Math.min(MAX_SHARP, before + SHARPEN_STEP * abrasive);
  def.tuned = true;
  const pct = Math.round(def.sharp * 100);
  const grade = def.sharp > 0.9 ? 'бритва' : def.sharp > 0.6 ? 'острый' : def.sharp > 0.3 ? 'подправлен' : 'слегка';
  return { ok: true, sharp: def.sharp, text: `${def.name}: ${grade} (${pct}%)` };
}

// ------------------------------------------------------------
//  3D-модель кованого предмета
// ------------------------------------------------------------

const matCache = new Map();
function material(key, opts) {
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ flatShading: true, ...opts });
  matCache.set(key, m);
  return m;
}

const box = (w, h, d, x, y, z, mat, parent, rot) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
};

/**
 * Собрать модель по данным предмета. Формы действительно разные:
 * у клинка — дол и гарда, у топора — широкое полотно, у клевца —
 * загнутый клюв, у копья — гранёное острие, у кинжала — короткий
 * клин с упором. Материал задаёт цвет, блеск и камень в навершии.
 */
export function buildModel(def) {
  const form = FORMS[def?.form] || FORMS.sword;
  const mat = MATERIALS[def?.mat] || MATERIALS.flint;
  const group = new THREE.Group();

  const steel = material(`steel-${mat.id}`, {
    color: mat.color, metalness: mat.metal, roughness: mat.rough, flatShading: true,
    emissive: mat.glow || 0x000000, emissiveIntensity: mat.glow ? 0.55 : 0,
  });
  const edge = material(`edge-${mat.id}`, {
    color: mat.edge, metalness: Math.min(0.9, mat.metal + 0.2), roughness: 0.18, flatShading: true,
    emissive: mat.glow || 0x000000, emissiveIntensity: mat.glow ? 0.3 : 0,
  });
  const wood = material('grip-wood', { color: 0x6f5233, roughness: 0.92, flatShading: true });
  const wrap = material('grip-wrap', { color: 0x3f3123, roughness: 1, flatShading: true });

  // рукоять — общая для всех форм, но длина своя
  const gripLen = form.id === 'dagger' ? 0.26 : 0.42;
  box(0.085, 0.085, gripLen, 0, 0, 0, wood, group);
  for (let i = 0; i < 3; i++) {
    box(0.095, 0.095, 0.03, 0, 0, -gripLen / 2 + 0.07 + i * (gripLen / 3.4), wrap, group);
  }
  // навершие с камнем
  box(0.13, 0.13, 0.07, 0, 0, -gripLen / 2 - 0.03, steel, group);
  if (mat.glow) {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), edge);
    gem.position.set(0, 0, -gripLen / 2 - 0.08);
    group.add(gem);
  }

  const spine = gripLen / 2;   // с этого места начинается рабочая часть

  if (form.id === 'sword') {
    box(0.34, 0.06, 0.07, 0, 0, spine + 0.02, steel, group);       // гарда
    box(0.13, 0.035, 1.0, 0, 0, spine + 0.52, steel, group);       // лезвие
    box(0.06, 0.045, 1.04, 0, 0, spine + 0.54, edge, group);      // кромка/дол
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.24, 4), edge);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0, 0, spine + 1.14);
    group.add(tip);
  } else if (form.id === 'axe') {
    box(0.1, 0.1, 0.16, 0, 0, spine + 0.08, wood, group);         // обух
    box(0.07, 0.42, 0.34, 0.14, 0.06, spine + 0.2, steel, group);  // полотно
    box(0.03, 0.46, 0.12, 0.185, 0.08, spine + 0.34, edge, group); // заточенная кромка
    box(0.07, 0.16, 0.14, -0.1, -0.02, spine + 0.12, steel, group, [0, 0, 0.5]); // клюв сзади
  } else if (form.id === 'pick') {
    box(0.09, 0.09, 0.1, 0, 0, spine + 0.04, steel, group);
    const beak = box(0.08, 0.09, 0.46, 0, 0.16, spine + 0.28, steel, group, [0.7, 0, 0]);
    beak.scale.set(1, 0.7, 1);
    box(0.06, 0.06, 0.2, 0, 0.34, spine + 0.44, edge, group, [0.7, 0, 0]);
    box(0.07, 0.2, 0.12, 0, -0.14, spine + 0.18, steel, group, [-0.6, 0, 0]); // противовес-зуб
  } else if (form.id === 'spear') {
    box(0.05, 0.05, 0.9, 0, 0, spine + 0.45, wood, group);        // древко
    box(0.12, 0.03, 0.06, 0, 0, spine + 0.9, steel, group);       // перевязь
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 5), steel);
    blade.rotation.x = Math.PI / 2;
    blade.position.set(0, 0, spine + 1.14);
    group.add(blade);
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), edge);
    point.rotation.x = Math.PI / 2;
    point.position.set(0, 0, spine + 1.42);
    group.add(point);
  } else {
    // кинжал
    box(0.24, 0.05, 0.05, 0, 0, spine + 0.02, steel, group);
    box(0.1, 0.03, 0.42, 0, 0, spine + 0.24, steel, group);
    box(0.045, 0.04, 0.44, 0, 0, spine + 0.25, edge, group, [0, 0, 0.0]);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 4), edge);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0, 0, spine + 0.53);
    group.add(tip);
  }

  // лёгкое покачивание «камень светится» задаёт игра (см. animateForged)
  return group;
}

/** Мерцание камня в навершии — маленькая, но живая деталь */
export function animateForged(group, t) {
  if (!group) return;
  group.children.forEach((child, i) => {
    if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined && child.material.emissive) {
      if (child.material.emissive.getHex() !== 0) {
        child.material.emissiveIntensity = 0.42 + Math.sin(t * 2.4 + i) * 0.2;
      }
    }
  });
}

// ------------------------------------------------------------
//  Верстак и точильный станок — как предметы мира
// ------------------------------------------------------------

export function buildWorkbench() {
  const g = new THREE.Group();
  const wood = material('bench-wood', { color: 0x8a6a42, roughness: 0.94, flatShading: true });
  const dark = material('bench-dark', { color: 0x5d4529, roughness: 1, flatShading: true });
  const iron = material('bench-iron', { color: 0x8d96a0, metalness: 0.6, roughness: 0.4, flatShading: true });

  box(1.5, 0.12, 0.8, 0, 0.92, 0, wood, g);
  for (const sx of [-0.62, 0.62]) {
    for (const sz of [-0.3, 0.3]) box(0.12, 0.9, 0.12, sx, 0.46, sz, dark, g);
  }
  box(1.3, 0.06, 0.5, 0, 0.42, 0, dark, g);
  // тиски и пара инструментов на столе
  box(0.22, 0.14, 0.2, 0.55, 1.02, 0.16, iron, g);
  box(0.06, 0.28, 0.06, -0.45, 1.12, -0.1, iron, g, [0.2, 0, 0.35]);
  box(0.05, 0.05, 0.34, -0.45, 1.26, -0.1, iron, g, [0.9, 0, 0.35]);
  box(0.3, 0.03, 0.16, -0.1, 0.99, 0.2, wood, g, [0, 0.4, 0]);
  return g;
}

export function buildGrindstone() {
  const g = new THREE.Group();
  const wood = material('bench-wood', { color: 0x8a6a42, roughness: 0.94, flatShading: true });
  const stone = material('grind-stone', { color: 0x9a9488, roughness: 0.8, flatShading: true });
  const iron = material('bench-iron', { color: 0x8d96a0, metalness: 0.6, roughness: 0.4, flatShading: true });

  for (const sx of [-0.34, 0.34]) box(0.12, 0.62, 0.12, sx, 0.31, 0, wood, g);
  box(0.86, 0.1, 0.16, 0, 0.62, 0, wood, g);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 12), stone);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, 0.86, 0);
  wheel.castShadow = true;
  g.add(wheel);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), iron);
  axle.rotation.z = Math.PI / 2;
  axle.position.set(0, 0.86, 0);
  g.add(axle);
  box(0.5, 0.08, 0.3, 0, 0.42, 0.24, wood, g);   // лоток с водой
  box(0.44, 0.04, 0.24, 0, 0.46, 0.24, material('grind-water', { color: 0x2f8ba8, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 }), g);
  g.userData.wheel = wheel;
  return g;
}
