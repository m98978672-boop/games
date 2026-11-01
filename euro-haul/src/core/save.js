// Профили, сохранения и настройки в localStorage.
import { TRUCK_MODELS, levelForXp } from '../data/trucks.js';

const KEY = 'eurotrak.saves.v1';
const SETTINGS_KEY = 'eurotrak.settings.v1';
export const SAVE_VERSION = 1;

export const DEFAULT_SETTINGS = {
  sound: true,
  volume: 0.65,
  camera: '',
  units: 'kmh',
  quality: 'auto',
  touchControls: 'auto',
  showFps: false,
  invertY: false,
  timeScale: 3,
};

export function createProfile(name = 'Водитель', truckId = 'auriga-3') {
  const truck = TRUCK_MODELS.find((t) => t.id === truckId) || TRUCK_MODELS[0];
  return {
    version: SAVE_VERSION,
    id: 'p' + Date.now().toString(36),
    name,
    created: Date.now(),
    lastPlayed: Date.now(),
    money: 9200,
    xp: 0,
    level: 1,
    skills: { long: 0, value: 0, fragile: 0, urgent: 0, adr: 0, eco: 0 },
    truck: {
      modelId: truck.id,
      paint: 'ocean',
      engine: 0,
      tires: 0,
      retarder: 0,
      condition: { engine: 88, tires: 74, brakes: 82 },
      odometer: 21400,
      fuel: Math.round(truck.tank * 0.55),
    },
    currentCity: 'berlin',
    garages: [],
    drivers: [],
    stats: {
      distance: 0,
      deliveries: 0,
      earnings: 0,
      fines: 0,
      collisions: 0,
      late: 0,
      fuelSpent: 0,
      topSpeed: 0,
    },
    achievements: [],
    clock: { day: 1, minutes: 8 * 60 },
    activeJob: null,
  };
}

export function loadSaves() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { slots: [null, null, null], lastSlot: 0 };
    const data = JSON.parse(raw);
    return {
      slots: Array.isArray(data.slots) ? [data.slots[0] || null, data.slots[1] || null, data.slots[2] || null] : [null, null, null],
      lastSlot: data.lastSlot || 0,
    };
  } catch {
    return { slots: [null, null, null], lastSlot: 0 };
  }
}

export function saveGame(slots, lastSlot) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ slots, lastSlot, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* приватный режим — играть можно, сохранение настроек недоступно */
  }
}

export function resetAll() {
  localStorage.removeItem(KEY);
}

export function upgradeProfile(profile) {
  if (!profile) return profile;
  const base = createProfile(profile.name || 'Водитель');
  const merged = {
    ...base,
    ...profile,
    skills: { ...base.skills, ...(profile.skills || {}) },
    truck: { ...base.truck, ...(profile.truck || {}), condition: { ...base.truck.condition, ...(profile.truck?.condition || {}) } },
    stats: { ...base.stats, ...(profile.stats || {}) },
    clock: { ...base.clock, ...(profile.clock || {}) },
  };
  merged.level = levelForXp(merged.xp || 0).level;
  return merged;
}

export function skillPrice(profile, skill) {
  const lvl = profile.skills[skill] || 0;
  return 1200 + lvl * 1400;
}

export function applyPurchase(profile, cost) {
  if (profile.money < cost) return false;
  profile.money -= cost;
  return true;
}
