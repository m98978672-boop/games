// Загрузка конфигов: JSON правится без перекомпиляции. Работает в браузере и в Node.
export const DATA_FILES = [
  'weapons', 'units', 'factions', 'resources', 'buildings', 'skills', 'ai_weights',
  'sectors', 'squad_templates', 'strategies', 'build_profiles', 'rules_presets',
  'autopilot', 'difficulty', 'input_map', 'ui_hints', 'audio',
  'build_templates', 'feature_flags', 'regression_thresholds',
  'wall_materials', 'cover', 'nav_budget', 'outlines/index'
];

export async function loadConfig({ baseUrl = 'data/', raw = null } = {}) {
  const data = {};
  if (raw) return buildConfig(raw);
  const isNode = typeof process !== 'undefined' && process.versions?.node;
  if (isNode) {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const url = await import('node:url');
    const here = path.dirname(url.fileURLToPath(import.meta.url));
    const dir = path.resolve(here, '../../', baseUrl);
    for (const name of DATA_FILES) {
      data[name] = JSON.parse(await fs.readFile(path.join(dir, `${name}.json`), 'utf8'));
    }
    // контуры стен лежат отдельными файлами: data/outlines/<type>.json
    const idx = data['outlines/index'];
    data['outlines'] = {};
    for (const t of idx.types || []) {
      data['outlines'][t.type] = JSON.parse(await fs.readFile(path.join(dir, 'outlines', `${t.type}.json`), 'utf8'));
    }
  } else {
    const res = await Promise.all(DATA_FILES.map((name) => fetch(baseUrl + name + '.json').then((r) => r.json())));
    DATA_FILES.forEach((name, i) => { data[name] = res[i]; });
    const idx = data['outlines/index'];
    data['outlines'] = {};
    const outlineRes = await Promise.all((idx.types || []).map((t) => fetch(`${baseUrl}outlines/${t.type}.json`).then((r) => r.json())));
    (idx.types || []).forEach((t, i) => { data['outlines'][t.type] = outlineRes[i]; });
  }
  return buildConfig(data);
}

export function buildConfig(data) {
  const cfg = {
    raw: data,
    weapons: data.weapons,
    units: data.units,
    factions: data.factions,
    resources: data.resources,
    buildings: data.buildings,
    skills: data.skills,
    ai: data.ai_weights,
    sectors: data.sectors,
    templates: data.squad_templates,
    strategies: data.strategies,
    profiles: data.build_profiles,
    rules: data.rules_presets,
    autopilot: data.autopilot,
    difficulty: data.difficulty,
    input: data.input_map,
    hints: data.ui_hints,
    audio: data.audio,
    buildTemplates: data.build_templates,
    thresholds: data.regression_thresholds,
    wallMaterials: data.wall_materials,
    coverRules: data.cover,
    navBudget: data.nav_budget,
    outlines: data['outlines'] || {},
  };
  // Флаги функций: каждая новая механика включается и отключается из feature_flags.json.
  cfg.flags = {};
  for (const f of data.feature_flags?.flags || []) cfg.flags[f.id] = !!f.enabled;
  cfg.flag = (id, def = false) => (id in cfg.flags ? cfg.flags[id] : def);
  cfg.template = (id) => cfg.buildTemplates?.[id] || null;
  cfg.weapon = (id) => cfg.weapons[id] || cfg.weapons.none;
  cfg.unit = (id) => cfg.units[id] || cfg.units.infantry;
  cfg.building = (id) => cfg.buildings[id] || null;
  cfg.strategy = (id) => cfg.strategies[id] || cfg.strategies.cautious;
  cfg.faction = (id) => cfg.factions[id] || cfg.factions[0];
  cfg.difficultyOf = (id) => cfg.difficulty[id] || cfg.difficulty.regular;
  return cfg;
}
