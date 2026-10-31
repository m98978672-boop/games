// ============================================================================
//  СИСТЕМА СОХРАНЕНИЯ И ЗАГРУЗКИ ДАННЫХ КАСКАДА (save-system.js, v0.6.1)
//  Компактно сериализует в localStorage (и JSON-файл) прорытые каналы, плотины,
//  построенные Целые ГЭС и инфраструктуру, казну, кредиты и состояние 8 городов!
// ============================================================================

export const SAVE_STORAGE_KEY = 'cascade.save.v06';

/**
 * Запоминает эталонное стартовое состояние рельефа карты (после генерации долины
 * и постановки стартовой Целой ГЭС-1), чтобы сохранять только изменённые игроком ячейки!
 */
export function captureBaselineTerrain(hydro) {
  hydro._baseline = {
    bedrock: new Float32Array(hydro.bedrock),
    soil: new Float32Array(hydro.soil),
    concrete: new Float32Array(hydro.concrete),
    linedMask: new Uint8Array(hydro.linedMask),
    earthDamMask: new Uint8Array(hydro.earthDamMask),
    foundationMask: new Uint8Array(hydro.foundationMask),
  };
}

/**
 * Собирает компактный JSON-слепок всего состояния игры (рельеф/каналы, ГЭС, экономика, города, камера).
 */
export function serializeCascadeSave({
  scaleId,
  presetId,
  hydro,
  economy,
  camCtrl = null,
}) {
  const base = hydro._baseline;
  const n = hydro.grid * hydro.grid;
  const cells = [];

  for (let i = 0; i < n; i++) {
    const bDiff = !base || Math.abs(hydro.bedrock[i] - base.bedrock[i]) > 0.015;
    const sDiff = !base || Math.abs(hydro.soil[i] - base.soil[i]) > 0.015;
    const cDiff = !base || Math.abs(hydro.concrete[i] - base.concrete[i]) > 0.015 || Math.abs(hydro.targetConcrete[i] - hydro.concrete[i]) > 0.015;
    const mDiff = !base
      || hydro.linedMask[i] !== base.linedMask[i]
      || hydro.earthDamMask[i] !== base.earthDamMask[i]
      || hydro.foundationMask[i] !== base.foundationMask[i];

    if (bDiff || sDiff || cDiff || mDiff) {
      const cVal = Math.max(hydro.concrete[i], hydro.targetConcrete[i]);
      cells.push([
        i,
        +hydro.bedrock[i].toFixed(2),
        +hydro.soil[i].toFixed(2),
        +cVal.toFixed(2),
        hydro.linedMask[i] | (hydro.earthDamMask[i] << 1) | (hydro.foundationMask[i] << 2),
        +hydro.h[i].toFixed(2),
      ]);
    }
  }

  return {
    format: 'cascade-hydro-save',
    version: '0.6.1',
    savedAt: new Date().toISOString(),
    scaleId: scaleId || 'km5',
    presetId: presetId || hydro.presetId || 'bystritsa',
    economy: {
      cash: Math.round(economy.cash),
      loan: Math.round(economy.loan || 0),
      creative: !!economy.creative,
      day: economy.day || 1,
      hour: +(economy.hour ?? 8.5).toFixed(2),
      weatherId: economy.weatherId || 'normal',
      cities: economy.cities.map((c) => ({
        id: c.id,
        connected: !!c.connected,
        focusMode: c.focusMode || 'balanced',
        aqueductRewardClaimed: !!c.aqueductRewardClaimed,
        canalAqueductConnected: !!c.canalAqueductConnected,
        targetBuildings: c.buildingIndices.length,
        growthProgress: +(c.growthProgress || 0).toFixed(3),
      })),
    },
    structures: {
      starterHpp: (() => {
        const st = hydro.turbines.find((t) => t.isStarterReady);
        return st ? {
          present: true,
          throttle: +(st.throttle ?? 1).toFixed(2),
          autoDispatch: !!st.autoDispatch,
          pumpedStorage: !!st.pumpedStorage,
        } : { present: false };
      })(),
      turbines: hydro.turbines
        .filter((t) => !t.isStarterReady)
        .map((t) => ({
          type: t.type || 'hpp',
          wx: +t.wx.toFixed(2),
          wz: +t.wz.toFixed(2),
          yaw: +t.yaw.toFixed(4),
          throttle: +(t.throttle ?? 1).toFixed(2),
          autoDispatch: !!t.autoDispatch,
          pumpedStorage: !!t.pumpedStorage,
        })),
      substations: (hydro.substations || []).map((s) => ({ wx: +s.wx.toFixed(2), wz: +s.wz.toFixed(2) })),
      concretePlants: (hydro.concretePlants || []).map((p) => ({ wx: +p.wx.toFixed(2), wz: +p.wz.toFixed(2), yaw: +(p.yaw || 0).toFixed(3) })),
      pumpStations: (hydro.pumpStations || []).map((p) => ({ wx: +p.wx.toFixed(2), wz: +p.wz.toFixed(2), yaw: +(p.yaw || 0).toFixed(3) })),
      windMeteoStations: (hydro.windMeteoStations || []).map((w) => ({ wx: +w.wx.toFixed(2), wz: +w.wz.toFixed(2) })),
      navLocks: (hydro.navLocks || []).map((l) => ({ wx: +l.wx.toFixed(2), wz: +l.wz.toFixed(2), yaw: +(l.yaw || 0).toFixed(3) })),
      fishFarms: (hydro.fishFarms || []).map((f) => ({ wx: +f.wx.toFixed(2), wz: +f.wz.toFixed(2) })),
      spillways: (hydro.spillways || []).map((s) => ({ wx: +s.wx.toFixed(2), wz: +s.wz.toFixed(2), yaw: +(s.yaw || 0).toFixed(3), openRatio: +(s.openRatio ?? 0.5).toFixed(2) })),
    },
    terrainDiff: cells,
    camera: camCtrl ? {
      tx: +camCtrl.target.x.toFixed(1),
      tz: +camCtrl.target.z.toFixed(1),
      ty: +camCtrl.target.y.toFixed(1),
      dist: +camCtrl.distance.toFixed(1),
      yaw: +camCtrl.yaw.toFixed(3),
      pitch: +camCtrl.pitch.toFixed(3),
    } : null,
  };
}

/**
 * Применяет сохранённый слепок поверх только что инициализированной долины (scaleId + presetId).
 */
export function applyCascadeSave(snapshot, { hydro, economy, worldView = null, camCtrl = null }) {
  if (!snapshot || snapshot.format !== 'cascade-hydro-save') {
    return { ok: false, reason: 'Некорректный формат сохранения' };
  }

  const st = snapshot.structures || {};
  // 1. Стартовая ГЭС
  if (st.starterHpp && st.starterHpp.present === false) {
    const starter = hydro.turbines.find((t) => t.isStarterReady);
    if (starter) hydro.demolishAt(starter.wx, starter.wz);
  } else if (st.starterHpp) {
    const starter = hydro.turbines.find((t) => t.isStarterReady);
    if (starter) {
      if (typeof st.starterHpp.throttle === 'number') starter.throttle = st.starterHpp.throttle;
      starter.autoDispatch = !!st.starterHpp.autoDispatch;
      starter.pumpedStorage = !!st.starterHpp.pumpedStorage;
    }
  }

  // 2. Восстанавливаем все построенные игроком Целые ГЭС и инженерные сооружения (бесплатно при загрузке)
  for (const t of (st.turbines || [])) {
    const res = hydro.placeTurbine(t.type || 'hpp', t.wx, t.wz, t.yaw, 1e9, true);
    if (res.ok && res.structure) {
      res.structure.throttle = t.throttle ?? 1.0;
      res.structure.autoDispatch = !!t.autoDispatch;
      res.structure.pumpedStorage = !!t.pumpedStorage;
    }
  }
  for (const s of (st.substations || [])) hydro.placeSubstation(s.wx, s.wz, 1e9, true);
  for (const p of (st.concretePlants || [])) hydro.placeConcretePlant(p.wx, p.wz, p.yaw, 1e9, true);
  for (const p of (st.pumpStations || [])) hydro.placePumpStation(p.wx, p.wz, p.yaw, 1e9, true);
  for (const w of (st.windMeteoStations || [])) hydro.placeWindMeteo(w.wx, w.wz, 1e9, true);
  for (const l of (st.navLocks || [])) hydro.placeNavLock(l.wx, l.wz, l.yaw, 1e9, true);
  for (const f of (st.fishFarms || [])) hydro.placeFishFarm(f.wx, f.wz, 1e9, true);
  for (const sp of (st.spillways || [])) {
    const res = hydro.placeSpillway(sp.wx, sp.wz, sp.yaw, 1e9, true);
    if (res.ok && res.structure) res.structure.openRatio = sp.openRatio ?? 0.5;
  }

  // 3. Восстанавливаем вырытые каналы, бетонную облицовку и плотины по ячейкам terrainDiff
  const n = hydro.grid * hydro.grid;
  if (Array.isArray(snapshot.terrainDiff)) {
    for (const row of snapshot.terrainDiff) {
      const [i, bedVal, soilVal, concVal, masks, hVal] = row;
      if (i < 0 || i >= n) continue;
      hydro.bedrock[i] = bedVal;
      hydro.soil[i] = soilVal;
      hydro.concrete[i] = concVal;
      hydro.targetConcrete[i] = concVal;
      hydro.formworkWall[i] = 0;
      hydro.buildProgress[i] = concVal > 0.05 ? 1.0 : 0;
      hydro.linedMask[i] = masks & 1;
      hydro.earthDamMask[i] = (masks >> 1) & 1;
      hydro.foundationMask[i] = (masks >> 2) & 1;
      if (typeof hVal === 'number' && hVal >= 0) {
        hydro.h[i] = hVal;
      }
    }
  }
  hydro._activateArea(1, 1, hydro.grid - 2, hydro.grid - 2);
  hydro.recomputeZbRange(0, 0, hydro.grid - 1, hydro.grid - 1);
  hydro.engineeredDirty = true;

  // 4. Восстанавливаем казну, кредиты, погоду, подключения и кварталы 8 городов
  if (snapshot.economy) {
    const ec = snapshot.economy;
    if (typeof ec.cash === 'number') economy.cash = ec.cash;
    if (typeof ec.loan === 'number') economy.loan = ec.loan;
    economy.creative = !!ec.creative;
    if (typeof ec.day === 'number') economy.day = ec.day;
    if (typeof ec.hour === 'number') economy.hour = ec.hour;
    if (ec.weatherId) economy.setWeather(ec.weatherId);

    if (Array.isArray(ec.cities)) {
      for (const sc of ec.cities) {
        const city = economy.cities.find((c) => c.id === sc.id);
        if (!city) continue;
        city.connected = !!sc.connected;
        if (sc.focusMode) city.focusMode = sc.focusMode;
        city.aqueductRewardClaimed = !!sc.aqueductRewardClaimed;
        city.canalAqueductConnected = !!sc.canalAqueductConnected;
        if (typeof sc.growthProgress === 'number') city.growthProgress = sc.growthProgress;
        const targetCount = Math.min(city.lots.length, sc.targetBuildings || city.buildingIndices.length);
        while (city.buildingIndices.length < targetCount) {
          const freeLot = city.lots.find((l) => !l.occupied);
          if (!freeLot) break;
          economy._spawnBuildingInCity(city, freeLot, 1.0);
        }
        economy._recalcCityTier(city);
      }
    }
    economy.buildingsDirty = true;
    economy.powerLinesDirty = true;
  }

  // 5. Обновляем 3D-сцену и камеру
  if (worldView) {
    worldView.rebuildTerrainMesh(true);
    worldView.syncEngineeredVolumes();
    worldView.syncStructures(0);
    worldView.syncCityInstances();
    worldView.syncPowerLines();
  }
  if (camCtrl && snapshot.camera) {
    camCtrl.flyTo(snapshot.camera.tx, snapshot.camera.tz, snapshot.camera.dist, snapshot.camera.ty);
  }

  return { ok: true };
}

export function hasCascadeSaveInStorage() {
  try {
    return !!localStorage.getItem(SAVE_STORAGE_KEY);
  } catch {
    return false;
  }
}

export function readCascadeSaveMeta() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.format !== 'cascade-hydro-save') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCascadeSaveToStorage(snapshot) {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}
