// Автопилот фракции по областям: один и тот же код для игрока и ИИ (симметрия).
// Игрок может выключить любую область; у ИИ-фракции области включены всегда.
export class Autopilot {
  constructor(game) {
    this.game = game;
    this.state = new Map();
    for (const f of game.cfg.factions) {
      const areas = {};
      for (const a of game.cfg.autopilot.areas) areas[a.id] = !!a.default;
      this.state.set(f.id, { areas, profile: 'medium' });
    }
    // у ИИ-фракции включаем всё: сражение, стройку, снабжение, производство, формирование
    for (const f of game.cfg.factions) {
      if (f.id !== game.playerFaction) for (const a of game.cfg.autopilot.areas) this.state.get(f.id).areas[a.id] = true;
    }
  }

  areas(faction) { return this.state.get(faction)?.areas || {}; }

  areaEnabled(faction, area) {
    const g = this.game;
    if (faction !== g.playerFaction) return true;
    if (g.mode === 'soldier' && g.settings.autopilotInSoldier !== false && g.cfg.autopilot.soldierModeForcesAll) {
      if (g.autopilotOverride && area in g.autopilotOverride) return g.autopilotOverride[area];
      return true;
    }
    return !!this.state.get(faction).areas[area];
  }

  setArea(faction, area, on) {
    const st = this.state.get(faction);
    if (!st) return;
    st.areas[area] = !!on;
    this.game.events.emit('autopilotChanged', { faction, area, on: !!on, t: this.game.time });
  }

  toggle(faction, area) { this.setArea(faction, area, !this.areaEnabled(faction, area)); }

  update(dt) {
    this.timer = (this.timer || 0) - dt;
    if (this.timer > 0) return;
    this.timer = 2.0;
    for (const f of this.game.cfg.factions) {
      const faction = f.id;
      if (this.areaEnabled(faction, 'formation')) this.maintainSquads(faction);
      if (this.areaEnabled(faction, 'production')) this.game.logistics.autoProduction(faction);
      if (this.areaEnabled(faction, 'build')) this.game.build.autoRepair(faction);
      if (this.areaEnabled(faction, 'supply')) this.game.logistics.maintainTrucks(faction);
    }
  }

  maintainSquads(faction) {
    const g = this.game;
    const limit = g.squadLimit(faction);
    const mine = [...g.squads.values()].filter((s) => s.faction === faction && s.state !== 'destroyed' && s.count() > 0);
    // пополнение неполных отрядов
    for (const sq of mine) {
      const need = g.templateSize(sq.templateId);
      if (sq.count() < Math.ceil(need * 0.5) && g.time - (sq.lastReinforce || 0) > 25) {
        sq.lastReinforce = g.time;
        g.api.issue({
          source: faction === g.playerFaction ? 'autopilot' : 'enemyAI',
          type: 'reinforce', faction,
          target: { x: sq.centroid().x, y: sq.centroid().y },
          params: { squadId: sq.id }, priority: 2, reason: 'пополнение потерь отряда',
        });
      }
    }
    const reserve = [...g.units.values()].filter((u) => u.faction === faction && u.alive && !u.downed && u.squadId == null && !u.isVehicle);
    // Аварийная сборка: армия без отрядов не должна стоять без приказов —
    // собираем неполный отряд из того, что есть на поле, не дожидаясь очереди у базы.
    if (mine.length === 0 && reserve.length >= 3) {
      const ids = reserve.slice(0, 8).map((u) => u.id);
      const res = g.createSquadFromUnits(ids, 'Сводный отряд');
      if (res.ok) {
        res.squad.reason = 'сводный отряд из резерва';
        return;
      }
    }
    if (mine.length >= limit) return;
    const templateId = this.chooseTemplate(faction);
    const need = g.templateSize(templateId);
    if (reserve.length >= need || g.canAffordSquad(faction, templateId)) {
      const base = g.world.hqOf(faction);
      if (!base) return;
      g.api.issue({
        source: faction === g.playerFaction ? 'autopilot' : 'enemyAI',
        type: 'create_squad', faction,
        target: { x: base.x, y: base.y },
        params: { templateId, reason: 'нехватка отрядов на фронте' },
        priority: 2, reason: 'автосоздание отряда',
      });
    }
  }

  chooseTemplate(faction) {
    const g = this.game;
    const mine = [...g.squads.values()].filter((s) => s.faction === faction && s.state !== 'destroyed');
    const counts = { assault: 0, defense: 0, engineer: 0, supply: 0, armor: 0, recon: 0 };
    for (const s of mine) counts[s.templateId] = (counts[s.templateId] || 0) + 1;
    if (counts.supply < 1) return 'supply';
    if (counts.engineer < 1) return 'engineer';
    if (counts.armor < 1 && g.canAffordSquad(faction, 'armor')) return 'armor';
    if (counts.recon < 1) return 'recon';
    return counts.assault <= counts.defense ? 'assault' : 'defense';
  }

  onSectorSecured(faction, point) {
    const g = this.game;
    const profile = this.state.get(faction)?.profile || g.cfg.autopilot.thresholds.autoProfile;
    if (!point || !point.owner === faction) return;
    // строим только когда армия и склад в норме, иначе производство важнее
    if (!g.build.buildWanted(faction)) return;
    const sector = g.world.sectorAt(point.x, point.y);
    if (!sector) return;
    g.api.issue({
      source: faction === g.playerFaction ? 'autopilot' : 'enemyAI',
      type: 'build_profile', faction,
      target: { x: point.x, y: point.y, sectorId: sector.id },
      params: { profile, pointId: point.id, reason: 'сектор захвачен — строим оборону' },
      priority: 2, reason: 'профиль обороны после захвата',
    });
    g.build.noteBuild(faction);
  }
}
