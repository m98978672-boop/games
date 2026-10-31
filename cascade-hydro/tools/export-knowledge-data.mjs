import fs from 'node:fs';
import path from 'node:path';
import {
  MAP_SCALES,
  VALLEY_PRESETS,
  STARTER_READY_HPP_SITES,
  TURBINE_SPECS,
  TOOLS,
  CITY_DEFS,
  BUILDING_ARCHETYPES,
  ECONOMY,
  applyMapScale,
} from '../src/config.js';
import { REVENUE_STREAM_DEFS } from '../src/economy.js';
import { CITY_FOCUS_MODES, AQUEDUCT_CONNECT_REWARD } from '../src/city-logic.js';

const rootDir = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

applyMapScale('km5');

const payload = {
  project: 'КАСКАД: Живая Вода (CASCADE: Living Water)',
  version: pkg.version,
  liveUrls: {
    showcase: 'https://m98978672-boop.github.io/games/',
    gameDirect: 'https://m98978672-boop.github.io/games/cascade-hydro/',
    repository: 'https://github.com/m98978672-boop/games',
  },
  engineSummary: {
    hydroGrid: '208x208 Well-Balanced 2D SWE (Kurganov-Petrova + active 8x8 tile bitmask)',
    stepTimeMsOn10x10Km: '~1.4-2.1 ms',
    proceduralTextureVariants: 480,
    livingWorldAnimations: 300,
    buildingArchetypesCount: BUILDING_ARCHETYPES.length,
    architectural3DPools: ['gable', 'box', 'step', 'tower', 'arch', 'spire', 'silo'],
    shaderPartKinds: {
      0: 'Основной фасад с антиалиасным LOD окон (winLod)',
      1: 'Рустованный гранитный цоколь и тёплые витрины 1-го этажа',
      2: 'Яркая скатная черепичная / медная / сланцевая / сводчатая кровля',
      3: 'Белокаменные карнизы, колонны портиков, пилястры, балконы и шпили',
      4: 'Кроны садовых деревьев во дворах и зелёные террасы',
      5: 'Стеклянные зенитные фонари / солнечные панели / полосатые трубы заводов',
    },
    saveSystemKey: 'cascade.save.v06',
  },
  mapScales: MAP_SCALES,
  valleyPresets: VALLEY_PRESETS,
  starterReadyHppSites: STARTER_READY_HPP_SITES,
  hppSpecsAt5x5Km: TURBINE_SPECS,
  tools: TOOLS,
  economyConfig: {
    ...ECONOMY,
    aqueductConnectReward: AQUEDUCT_CONNECT_REWARD,
  },
  revenueStreams: REVENUE_STREAM_DEFS,
  cityFocusModes: CITY_FOCUS_MODES,
  citiesAt5x5Km: CITY_DEFS,
  buildingArchetypes: BUILDING_ARCHETYPES,
};

const outDir = path.join(rootDir, 'data');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'game-knowledge-data.json');
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Экспортированы структурированные данные игры -> ${outPath}`);
