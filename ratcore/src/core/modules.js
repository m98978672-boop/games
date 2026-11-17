// RatCore — 3-уровневый резолвер модулей по выбору (Zero-Cost Opt-In, F-166..F-170, A-110..A-111, RC-108)

export const CORE_BRANCHES = Object.freeze([
  'build', 'move', 'remove', 'watch', 'look', 'see', 'input', 'ui', 'save', 'stream',
]);

export const STANDARD_MODULES = Object.freeze([
  'anim', 'phys', 'nav', 'env', 'fx', 'ai', 'sim', 'audio', 'hear', 'test',
]);

export const OPTIONAL_PACKS = Object.freeze({
  'pack:multiplayer': Object.freeze({ branches: ['net'], deps: ['audio'], estKB: 18 }),
  'pack:destruction': Object.freeze({ branches: ['destroy'], deps: ['phys'], estKB: 14 }),
  'pack:narrative': Object.freeze({ branches: ['story', 'quest'], deps: ['sim'], estKB: 15 }),
  'pack:mods': Object.freeze({ branches: ['mod'], deps: [], estKB: 12 }),
  'pack:cinema': Object.freeze({ branches: ['cutscene'], deps: [], estKB: 11 }),
  'pack:styles': Object.freeze({ branches: ['shader'], deps: [], estKB: 10 }),
  'pack:voice': Object.freeze({ branches: ['voice'], deps: ['audio'], estKB: 12 }),
  'pack:ecology': Object.freeze({ branches: ['eco'], deps: ['env'], estKB: 13 }),
  'pack:companion': Object.freeze({ branches: ['coopAi'], deps: ['ai', 'hear'], estKB: 14 }),
  'pack:assist': Object.freeze({ branches: ['assist'], deps: [], estKB: 8 }),
  'pack:webgpu': Object.freeze({ branches: ['webgpu'], deps: [], estKB: 16 }),
  'pack:wasm-accel': Object.freeze({ branches: ['wasm'], deps: [], estKB: 24 }),
  'pack:studio': Object.freeze({ branches: ['studio'], deps: ['test'], estKB: 22, devOnly: true }),
  'pack:ai-team': Object.freeze({ branches: ['think', 'guess', 'comm', 'bugs', 'bridge'], deps: [], estKB: 26 }),
});

export const PRESETS = Object.freeze({
  'minimal-2d': Object.freeze({ modules: [], packs: [] }),
  'arcade-3d': Object.freeze({ modules: ['anim', 'phys', 'fx', 'audio'], packs: [] }),
  'rpg-3d': Object.freeze({ modules: ['anim', 'phys', 'nav', 'env', 'sim', 'audio'], packs: ['pack:narrative'] }),
  'shooter-fps': Object.freeze({ modules: ['anim', 'phys', 'nav', 'fx', 'ai', 'audio', 'hear'], packs: [] }),
  'citybuilder': Object.freeze({ modules: ['nav', 'env', 'sim', 'audio'], packs: [] }),
  'survival': Object.freeze({ modules: ['anim', 'phys', 'nav', 'env', 'fx', 'ai', 'sim', 'audio', 'hear'], packs: [] }),
  'multiplayer-sandbox': Object.freeze({ modules: ['phys', 'nav', 'fx', 'audio'], packs: ['pack:multiplayer', 'pack:mods'] }),
  'ai-dev-full': Object.freeze({ modules: [...STANDARD_MODULES], packs: Object.keys(OPTIONAL_PACKS) }),
});

const BRANCH_TO_OWNER = new Map();
for (const b of CORE_BRANCHES) BRANCH_TO_OWNER.set(b, { tier: 'core', id: b });
for (const m of STANDARD_MODULES) BRANCH_TO_OWNER.set(m, { tier: 'module', id: m });
for (const [packId, spec] of Object.entries(OPTIONAL_PACKS)) {
  for (const b of spec.branches) BRANCH_TO_OWNER.set(b, { tier: 'pack', id: packId });
}

export function resolveModuleProfile({ preset = 'minimal-2d', modules = [], packs = [], exclude = [] } = {}) {
  const base = PRESETS[preset] || PRESETS['minimal-2d'];
  const enabledModules = new Set(base.modules);
  const enabledPacks = new Set(base.packs);

  for (const m of modules) {
    if (STANDARD_MODULES.includes(m)) enabledModules.add(m);
  }
  for (const p of packs) {
    if (OPTIONAL_PACKS[p]) enabledPacks.add(p);
  }
  for (const ex of exclude) {
    enabledModules.delete(ex);
    enabledPacks.delete(ex);
  }

  // F-167: замыкание зависимостей выбранных пакетов
  for (const p of [...enabledPacks]) {
    for (const dep of OPTIONAL_PACKS[p].deps) {
      if (STANDARD_MODULES.includes(dep)) enabledModules.add(dep);
    }
  }

  const activeBranches = new Set([...CORE_BRANCHES, ...enabledModules]);
  for (const p of enabledPacks) {
    for (const b of OPTIONAL_PACKS[p].branches) activeBranches.add(b);
  }

  const allOptionalKB = Object.values(OPTIONAL_PACKS).reduce((s, x) => s + x.estKB, 0) + STANDARD_MODULES.length * 8;
  const enabledOptionalKB =
    [...enabledPacks].reduce((s, p) => s + OPTIONAL_PACKS[p].estKB, 0) + enabledModules.size * 8;
  const savingsPct = Math.round((1 - (32 + enabledOptionalKB) / (32 + allOptionalKB)) * 100);

  return {
    preset: PRESETS[preset] ? preset : 'minimal-2d',
    core: [...CORE_BRANCHES],
    modules: [...enabledModules],
    packs: [...enabledPacks],
    activeBranches,
    estBundleKB: 32 + enabledOptionalKB,
    savingsPct: Math.max(0, savingsPct),
  };
}

export function createDisabledBranchProxy(branchName) {
  const owner = BRANCH_TO_OWNER.get(branchName) || { tier: 'pack', id: `pack:${branchName}` };
  const fix = owner.tier === 'pack'
    ? `Добавь '${owner.id}' в createEngine({ packs: ['${owner.id}'] }) или вызови engine.enablePack('${owner.id}').`
    : `Добавь '${owner.id}' в createEngine({ modules: ['${owner.id}'] }).`;

  return new Proxy({}, {
    get(_, prop) {
      if (prop === '__disabled') return true;
      if (prop === '__owner') return owner;
      if (typeof prop === 'symbol') return undefined;
      return function disabledToolCall() {
        return {
          ok: false,
          data: null,
          error: {
            code: 'RC-108',
            message: `OPTIONAL_MODULE_DISABLED: ветка tools.${branchName}.${String(prop)} отключена (Zero-Cost Opt-In)`,
            autoFixHint: fix,
            extra: { branch: branchName, required: owner.id, tier: owner.tier },
          },
          tick: 0,
          costMs: 0,
          traceId: 'rc-disabled',
        };
      };
    },
  });
}
