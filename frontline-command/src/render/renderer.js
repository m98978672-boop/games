// Рендер: только растровые спрайты (PNG) и тайлы. Кодом рисуется лишь отладочный оверлей (F3).
import { clamp, dist, hexCenter, angleTo } from '../core/mathx.js';

const TILE = 32;
const CHUNK = 512;

const TILE_NAMES = {
  0: ['grass_0', 'grass_1', 'grass_2'],
  1: ['dirt_0', 'dirt_1'],
  2: ['forest_0', 'forest_1', 'forest_2'],
  3: ['water_0', 'water_1'],
  4: ['road_0', 'road_1'],
  5: ['city_0', 'city_1'],
};

// ---------- загрузка спрайтов ----------
export class SpriteBank {
  constructor(base = 'assets/') {
    this.base = base;
    this.images = new Map();
    this.ready = false;
  }
  async loadAll() {
    const list = await fetch(`${this.base}manifest.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const files = list || await this._fallbackList();
    await Promise.all(files.map((f) => this.load(f)));
    this.ready = true;
    return this;
  }
  async _fallbackList() {
    // если манифеста нет — собираем список по известным именам
    const names = [];
    for (const arr of Object.values(TILE_NAMES)) for (const n of arr) names.push(`tiles/${n}`);
    for (const f of [0, 1]) {
      for (const role of ['infantry', 'mg', 'medic', 'engineer', 'scout', 'driver', 'tanker', 'tank', 'truck']) {
        for (let d = 0; d < 4; d++) names.push(`sprites/${role}_${f}_${d}`);
      }
    }
    for (const t of ['sandbags', 'wire', 'trench', 'mg_nest', 'bunker', 'watchtower', 'depot', 'factory', 'farm', 'hq', 'city', 'bridge']) {
      for (const f of ['0', '1', 'n']) names.push(`sprites/${t}_${f}`);
    }
    for (const fx of ['muzzle', 'explosion', 'smoke', 'blood']) names.push(`fx/${fx}`);
    for (const ui of ['role_infantry', 'role_mg', 'role_medic', 'role_engineer', 'role_scout', 'role_tank', 'role_truck', 'role_driver',
      'res_ammo', 'res_materials', 'res_fuel', 'res_meds', 'order_move', 'order_attack', 'order_hold', 'order_build', 'order_supply',
      'alert_capture', 'pause', 'play', 'logo']) names.push(`ui/${ui}`);
    return names;
  }
  load(name) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { this.images.set(name, img); resolve(img); };
      img.onerror = () => { this.images.set(name, null); resolve(null); };
      img.src = `${this.base}${name}.png`;
    });
  }
  get(name) { return this.images.get(name) || null; }
}

// ---------- рендерер ----------
export class Renderer {
  constructor(canvas, game, bank) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.bank = bank;
    this.camera = { x: game.world.W / 2, y: game.world.H / 2, zoom: 1 };
    this.chunkCache = new Map();
    this.showGrid = false;
    this.showDebug = false;
    this.fogEnabled = true;
    this.visCols = Math.ceil(game.world.W / 64);
    this.visRows = Math.ceil(game.world.H / 64);
    this.visible = new Uint8Array(this.visCols * this.visRows);
    this.explored = new Uint8Array(this.visCols * this.visRows);
    this.visTimer = 0;
    this.fps = 60;
    this.frames = 0;
    this.fpsTimer = 0;
    this.drag = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.dpr = dpr;
    this.ctx.imageSmoothingEnabled = false;
  }

  get viewW() { return this.canvas.width / this.dpr; }
  get viewH() { return this.canvas.height / this.dpr; }

  worldToScreen(x, y) {
    return {
      x: (x - this.camera.x) * this.camera.zoom + this.viewW / 2,
      y: (y - this.camera.y) * this.camera.zoom + this.viewH / 2,
    };
  }
  screenToWorld(x, y) {
    return {
      x: (x - this.viewW / 2) / this.camera.zoom + this.camera.x,
      y: (y - this.viewH / 2) / this.camera.zoom + this.camera.y,
    };
  }

  // ---------- туман войны ----------
  updateFog(dt) {
    this.visTimer -= dt;
    if (this.visTimer > 0) return;
    this.visTimer = 0.35;
    this.visible.fill(0);
    const game = this.game;
    const sources = [];
    if (game.playerUnit && game.playerUnit.alive) sources.push({ x: game.playerUnit.x, y: game.playerUnit.y, r: game.playerUnit.vision });
    for (const u of game.units.values()) {
      if (!u.alive || u.downed) continue;
      const isPlayerSide = game.playerFaction == null ? false : u.faction === game.playerFaction;
      if (!isPlayerSide) continue;
      sources.push({ x: u.x, y: u.y, r: u.vision });
    }
    for (const s of game.world.sectors) if (s.owner === game.playerFaction) sources.push({ x: s.cx, y: s.cy, r: 420 });
    const cell = 64;
    for (const src of sources) {
      const c0 = Math.max(0, Math.floor((src.x - src.r) / cell)), c1 = Math.min(this.visCols - 1, Math.floor((src.x + src.r) / cell));
      const r0 = Math.max(0, Math.floor((src.y - src.r) / cell)), r1 = Math.min(this.visRows - 1, Math.floor((src.y + src.r) / cell));
      for (let cy = r0; cy <= r1; cy++) {
        for (let cx = c0; cx <= c1; cx++) {
          const wx = cx * cell + cell / 2, wy = cy * cell + cell / 2;
          if (dist(src.x, src.y, wx, wy) > src.r) continue;
          const i = cx + cy * this.visCols;
          if (this.visible[i]) continue;
          if (!game.world.hasLOS(src.x, src.y, wx, wy, true)) continue;
          this.visible[i] = 1;
          this.explored[i] = 1;
        }
      }
    }
    if (game.playerFaction == null) { this.visible.fill(1); this.explored.fill(1); } // режим ИИ против ИИ — без тумана
  }

  isVisible(x, y) {
    if (!this.fogEnabled) return true;
    const cx = clamp(Math.floor(x / 64), 0, this.visCols - 1);
    const cy = clamp(Math.floor(y / 64), 0, this.visRows - 1);
    return this.visible[cx + cy * this.visCols] === 1;
  }

  // ---------- тайлы ----------
  terrainChunk(cx, cy) {
    const key = cx + ':' + cy;
    let c = this.chunkCache.get(key);
    if (c) return c;
    const world = this.game.world;
    const cv = document.createElement('canvas');
    cv.width = CHUNK; cv.height = CHUNK;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    const cols = Math.ceil(CHUNK / TILE);
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < cols; i++) {
        const tx = cx * cols + i, ty = cy * cols + j;
        if (tx >= world.cols || ty >= world.rows) continue;
        const t = world.terrain[tx + ty * world.cols];
        const names = TILE_NAMES[t] || TILE_NAMES[0];
        const variant = ((tx * 7 + ty * 13) >>> 0) % names.length;
        const img = this.bank.get('tiles/' + names[variant]) || this.bank.get('tiles/' + names[0]);
        if (img) g.drawImage(img, i * TILE, j * TILE, TILE, TILE);
        else { g.fillStyle = '#3d4c30'; g.fillRect(i * TILE, j * TILE, TILE, TILE); }
      }
    }
    this.chunkCache.set(key, cv);
    if (this.chunkCache.size > 120) this.chunkCache.delete(this.chunkCache.keys().next().value);
    return cv;
  }

  drawTerrain() {
    const z = this.camera.zoom;
    const halfW = this.viewW / 2 / z, halfH = this.viewH / 2 / z;
    const x0 = this.camera.x - halfW, y0 = this.camera.y - halfH;
    const x1 = this.camera.x + halfW, y1 = this.camera.y + halfH;
    const c0 = Math.floor(x0 / CHUNK), c1 = Math.floor(x1 / CHUNK);
    const r0 = Math.floor(y0 / CHUNK), r1 = Math.floor(y1 / CHUNK);
    for (let cy = r0; cy <= r1; cy++) {
      for (let cx = c0; cx <= c1; cx++) {
        const chunk = this.terrainChunk(cx, cy);
        const p = this.worldToScreen(cx * CHUNK, cy * CHUNK);
        this.ctx.drawImage(chunk, p.x, p.y, CHUNK * z, CHUNK * z);
      }
    }
  }

  // ---------- основной кадр ----------
  draw(dt) {
    this.frames++;
    this.fpsTimer += dt;
    if (this.fpsTimer > 0.5) { this.fps = Math.round(this.frames / this.fpsTimer); this.frames = 0; this.fpsTimer = 0; }
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#191d17';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    this.updateFog(dt);

    this.drawTerrain();
    this.drawBuildings();
    this.drawBlueprints();
    this.drawDecals();
    this.drawPoints();
    this.drawUnits();
    this.drawSelection();
    this.drawEffects();
    // сектора показываем в «стратегическом» масштабе, чтобы карта не пестрела вблизи
    if ((this.game.mode === 'commander' && this.camera.zoom < 0.62) || this.showGrid) this.drawSectors();
    this.drawFog();
    if (this.showDebug) this.drawDebug();
    this.drawVignette();
  }

  drawBuildings() {
    const ctx = this.ctx;
    const z = this.camera.zoom;
    const halfW = this.viewW / 2 / z, halfH = this.viewH / 2 / z;
    const cx = this.camera.x, cy = this.camera.y;
    for (const b of this.game.world.buildings) {
      if (b.dead || !b.built) continue;
      if (Math.abs(b.x - cx) > halfW + 120 || Math.abs(b.y - cy) > halfH + 120) continue;
      const visible = this.isVisible(b.x, b.y);
      const def = b.def || this.game.cfg.building(b.type);
      const size = Math.max(24, (def.size || 32) * (b.type === 'city' || b.type === 'hq' ? 3 : b.pointId ? 2 : 1));
      const key = `${b.type}_${b.faction >= 0 ? b.faction : 'n'}`;
      const img = this.bank.get('sprites/' + key);
      const p = this.worldToScreen(b.x, b.y);
      const s = size * z * (def.category === 'point' ? 1 : 1);
      ctx.globalAlpha = visible ? 1 : 0.35;
      if (img) ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
      else { ctx.fillStyle = b.faction === 1 ? '#b5503a' : b.faction === 0 ? '#4a7fb5' : '#8a7d5c'; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s); }
      ctx.globalAlpha = 1;
      // полоска здоровья построек, которым нанесли урон
      if (b.hp < (def.hp || 100)) {
        const w = Math.max(20, s * 0.7);
        ctx.fillStyle = '#00000090';
        ctx.fillRect(p.x - w / 2, p.y + s / 2 + 2, w, 3);
        ctx.fillStyle = b.hp / (def.hp || 100) > 0.5 ? '#9bbf6a' : '#d9b45a';
        ctx.fillRect(p.x - w / 2, p.y + s / 2 + 2, w * (b.hp / (def.hp || 100)), 3);
      }
    }
  }

  drawBlueprints() {
    const ctx = this.ctx;
    const z = this.camera.zoom;
    for (const b of this.game.build.blueprints) {
      if (b.built || b.dead) continue;
      const def = this.game.cfg.building(b.type);
      const size = (def.size || 32) * z;
      const p = this.worldToScreen(b.x, b.y);
      ctx.globalAlpha = 0.45;
      const img = this.bank.get(`sprites/${b.type}_${b.faction}`);
      if (img) ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#e8b45a';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
      ctx.setLineDash([]);
      if (b.progress > 0) {
        ctx.fillStyle = '#e8b45a';
        ctx.fillRect(p.x - size / 2, p.y + size / 2 + 2, size * clamp(b.progress, 0, 1), 2);
      }
    }
  }

  drawDecals() {
    const ctx = this.ctx;
    for (const d of this.game.decals.slice(-160)) {
      const p = this.worldToScreen(d.x, d.y);
      const img = this.bank.get('fx/blood');
      if (img) ctx.drawImage(img, p.x - 12 * this.camera.zoom, p.y - 12 * this.camera.zoom, 24 * this.camera.zoom, 24 * this.camera.zoom);
    }
  }

  drawPoints() {
    const ctx = this.ctx;
    const z = this.camera.zoom;
    ctx.textAlign = 'center';
    for (const p of this.game.world.points) {
      const s = this.worldToScreen(p.x, p.y);
      if (s.x < -120 || s.y < -120 || s.x > this.viewW + 120 || s.y > this.viewH + 120) continue;
      const visible = this.isVisible(p.x, p.y);
      const color = p.owner === 0 ? '#4a7fb5' : p.owner === 1 ? '#b5503a' : '#9a9a90';
      // флаг
      const r = 14 * z;
      ctx.globalAlpha = visible ? 1 : 0.4;
      ctx.fillStyle = '#10130fcc';
      ctx.fillRect(s.x - 1 * z, s.y - r - 16 * z, 2 * z, 16 * z);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - r - 16 * z);
      ctx.lineTo(s.x + 16 * z, s.y - r - 12 * z);
      ctx.lineTo(s.x, s.y - r - 8 * z);
      ctx.fill();
      // прогресс захвата
      if (p.capture) {
        ctx.strokeStyle = '#e8b45a';
        ctx.lineWidth = 3 * z;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 6 * z, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.capture / 12));
        ctx.stroke();
      }
      // название точки
      if (z > 0.5) {
        ctx.font = `${Math.round(11 * Math.min(1.4, z))}px "Trebuchet MS", sans-serif`;
        ctx.fillStyle = '#0d0f0bcc';
        ctx.fillRect(s.x - 48, s.y + r + 6 * z, 96, 14);
        ctx.fillStyle = color;
        ctx.fillText(p.name, s.x, s.y + r + 17 * z);
      }
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  }

  unitDir(u) {
    const a = u.turretAngle != null && u.isVehicle ? u.turretAngle : u.facing;
    let d = Math.round(a / (Math.PI / 2));
    d = ((d % 4) + 4) % 4;
    return d;
  }

  drawUnits() {
    const ctx = this.ctx;
    const z = this.camera.zoom;
    const game = this.game;
    const halfW = this.viewW / 2 / z, halfH = this.viewH / 2 / z;
    const list = [];
    for (const u of game.units.values()) {
      const onScreen = Math.abs(u.x - this.camera.x) < halfW + 60 && Math.abs(u.y - this.camera.y) < halfH + 60;
      if (!onScreen) continue;
      const visible = this.isVisible(u.x, u.y);
      const isMine = game.playerFaction != null && u.faction === game.playerFaction;
      if (!u.alive) { if (u.deadTimer < 12 && visible) this.drawCorpse(u); continue; }
      if (!visible && !isMine) continue;
      if (!visible && isMine) {
        // своих видно сквозь дымку
      }
      list.push(u);
    }
    list.sort((a, b) => a.y - b.y);
    for (const u of list) {
      const p = this.worldToScreen(u.x, u.y);
      const dir = this.unitDir(u);
      const isVehicle = u.kind === 'vehicle';
      const img = this.bank.get(`sprites/${u.role}_${u.faction}_${dir}`) || this.bank.get(`sprites/infantry_${u.faction}_0`);
      const size = (isVehicle ? 52 : 32) * z * (u.downed ? 0.85 : 1);
      const selected = game.selectedUnits.has(u.id) || (u.squadId != null && game.selectedSquads.has(u.squadId));
      // тень/подсветка выбранного
      if (selected) {
        ctx.strokeStyle = u.faction === 0 ? '#8fc0ea' : '#e89077';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y + size * 0.28, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = u.downed ? 0.55 : 1;
      if (img) ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
      else {
        ctx.fillStyle = u.faction === 0 ? '#4a7fb5' : '#b5503a';
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.35, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (u.downed) {
        ctx.strokeStyle = '#d7dcd2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - 6, p.y - 6); ctx.lineTo(p.x + 6, p.y + 6);
        ctx.moveTo(p.x + 6, p.y - 6); ctx.lineTo(p.x - 6, p.y + 6);
        ctx.stroke();
      }
      // здоровье и мораль
      const showHp = u.hp < u.maxHp || selected;
      if (showHp) {
        const w = isVehicle ? 42 * z : 26 * z;
        const y = p.y - size * 0.55 - 6;
        ctx.fillStyle = '#000000aa';
        ctx.fillRect(p.x - w / 2, y, w, 4);
        const hpK = clamp(u.hp / u.maxHp, 0, 1);
        ctx.fillStyle = hpK > 0.6 ? '#8fbf6a' : hpK > 0.3 ? '#d9b45a' : '#c4553f';
        ctx.fillRect(p.x - w / 2, y, w * hpK, 4);
        if (z > 0.75) {
          ctx.fillStyle = '#00000088';
          ctx.fillRect(p.x - w / 2, y + 5, w, 2);
          ctx.fillStyle = u.morale < 40 ? '#d9b45a' : '#9db9d6';
          ctx.fillRect(p.x - w / 2, y + 5, w * clamp(u.morale / 100, 0, 1), 2);
        }
      }
      // значок командира
      if (u.squad && u.squad.commander === u && z > 0.6) {
        ctx.fillStyle = '#e8b45a';
        ctx.fillRect(p.x - 2, p.y - size * 0.62 - 3, 4, 4);
      }
      // индикатор перезарядки игрока
      if (u === game.playerUnit && game.playerFaction != null) {
        ctx.strokeStyle = '#e8b45a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (u.reloading ? u.reloadT / u.weapon.reload : 0)));
        ctx.stroke();
      }
    }
  }

  drawCorpse(u) {
    const ctx = this.ctx;
    const p = this.worldToScreen(u.x, u.y);
    const z = this.camera.zoom;
    ctx.globalAlpha = clamp(1 - u.deadTimer / 12, 0, 1) * 0.6;
    ctx.fillStyle = '#2a2620';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 10 * z, 5 * z, u.facing, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawSelection() {
    const game = this.game;
    const ctx = this.ctx;
    const z = this.camera.zoom;
    for (const id of game.selectedSquads) {
      const sq = game.squads.get(id);
      if (!sq || sq.state === 'destroyed') continue;
      const c = sq.centroid();
      const p = this.worldToScreen(c.x, c.y);
      ctx.strokeStyle = sq.faction === 0 ? '#8fc0ea' : '#e89077';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      const r = 34 * z;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      if (sq.objective) {
        const o = this.worldToScreen(sq.objective.x, sq.objective.y);
        ctx.strokeStyle = '#e8b45a88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(o.x, o.y);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(o.x, o.y, 8, 0, Math.PI * 2); ctx.stroke();
      }
    }
    if (this.drag) {
      const { x0, y0, x1, y1 } = this.drag;
      ctx.fillStyle = '#e8b45a22';
      ctx.strokeStyle = '#e8b45a';
      ctx.lineWidth = 1;
      ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
      ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    }
    // призрак постройки под курсором
    if (game.buildPreview) {
      const { type, x, y, ok } = game.buildPreview;
      const def = game.cfg.building(type);
      const p = this.worldToScreen(x, y);
      const size = (def.size || 32) * z;
      ctx.globalAlpha = 0.5;
      const img = this.bank.get(`sprites/${type}_${game.playerFaction}`);
      if (img) ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? '#9bbf6a' : '#c4553f';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
      if (!ok) {
        ctx.fillStyle = '#c4553f33';
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    // множественный призрак: линия / зона / шаблон
    const multi = game.buildPreviewMulti;
    if (multi) {
      if (multi.rect) {
        const a = this.worldToScreen(Math.min(multi.rect.x0, multi.rect.x1), Math.min(multi.rect.y0, multi.rect.y1));
        const b = this.worldToScreen(Math.max(multi.rect.x0, multi.rect.x1), Math.max(multi.rect.y0, multi.rect.y1));
        ctx.strokeStyle = '#9bbf6a';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
        ctx.setLineDash([]);
        ctx.fillStyle = '#9bbf6a22';
        ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
      }
      const limit = 160;
      multi.items.slice(0, limit).forEach((it) => {
        const def = game.cfg.building(it.type);
        if (!def) return;
        const p = this.worldToScreen(it.x, it.y);
        const size = (def.size || 32) * z;
        const check = multi.kind === 'zone' ? { ok: true } : game.build.canPlace(it.type, it.x, it.y, game.playerFaction);
        ctx.globalAlpha = 0.4;
        const img = this.bank.get(`sprites/${it.type}_${game.playerFaction}`);
        if (img) ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = check.ok ? '#9bbf6a' : '#c4553f';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
      });
      if (multi.items.length > limit) {
        const p = this.worldToScreen(multi.items[0].x, multi.items[0].y);
        ctx.fillStyle = '#e6ecde';
        ctx.font = '11px monospace';
        ctx.fillText(`+${multi.items.length - limit}`, p.x + 8, p.y - 8);
      }
    }
  }

  drawEffects() {
    const ctx = this.ctx;
    const z = this.camera.zoom;
    for (const t of this.game.tracers) {
      const a = this.worldToScreen(t.x1, t.y1);
      const b = this.worldToScreen(t.x2, t.y2);
      ctx.globalAlpha = clamp(1 - t.t / t.life, 0, 1);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = Math.max(1, 1.6 * z);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (const f of this.game.fx) {
      const p = this.worldToScreen(f.x, f.y);
      const k = f.t / f.life;
      if (f.type === 'muzzle') {
        const img = this.bank.get('fx/muzzle');
        const s = 22 * z;
        ctx.globalAlpha = 1 - k;
        if (img) ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
        ctx.globalAlpha = 1;
      } else if (f.type === 'explosion') {
        const img = this.bank.get('fx/explosion');
        const s = (40 + 90 * k) * z;
        ctx.globalAlpha = 1 - k;
        if (img) ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
        ctx.globalAlpha = 1;
      } else if (f.type === 'blood') {
        const img = this.bank.get('fx/blood');
        const s = (16 + 16 * k) * z;
        ctx.globalAlpha = (1 - k) * 0.8;
        if (img) ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
        ctx.globalAlpha = 1;
      } else if (f.type === 'smoke') {
        const img = this.bank.get('fx/smoke');
        const s = (20 + 40 * k) * z;
        ctx.globalAlpha = (1 - k) * 0.6;
        if (img) ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
        ctx.globalAlpha = 1;
      }
    }
  }

  drawSectors() {
    const ctx = this.ctx;
    const world = this.game.world;
    const z = this.camera.zoom;
    const hex = this.game.cfg.sectors.hex;
    for (const s of world.sectors) {
      const c = this.worldToScreen(s.cx, s.cy);
      const r = hex.size * z;
      if (c.x < -r || c.y < -r || c.x > this.viewW + r || c.y > this.viewH + r) continue;
      const inf = s.influence;
      const owner = s.owner;
      ctx.globalAlpha = 0.16 + Math.min(0.22, Math.abs(inf) * 0.3);
      ctx.fillStyle = owner === 0 ? '#4a7fb5' : owner === 1 ? '#b5503a' : inf > 0.05 ? '#6f8fa8' : inf < -0.05 ? '#a9705f' : '#7a7a70';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = c.x + Math.cos(a) * r, y = c.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = owner === 0 ? '#4a7fb5' : owner === 1 ? '#b5503a' : '#5b5b52';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (z > 0.45) {
        ctx.fillStyle = '#0d0f0bcc';
        ctx.font = '12px "Trebuchet MS", sans-serif';
        const label = `${s.name}`;
        ctx.fillText(label, c.x - 46, c.y - 2);
        ctx.fillStyle = '#aab3a2';
        ctx.font = '11px "Trebuchet MS", sans-serif';
        ctx.fillText(`${inf > 0 ? 'Альянс +' : inf < 0 ? 'Легион +' : 'нейтрально '}${Math.abs(inf).toFixed(2)}`, c.x - 46, c.y + 13);
      }
    }
    // линия фронта
    ctx.strokeStyle = '#e8b45a';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.85;
    for (const f of this.game.influence.front) {
      const a = this.worldToScreen(f.ax, f.ay);
      const b = this.worldToScreen(f.bx, f.by);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawFog() {
    if (!this.fogEnabled) return;
    const ctx = this.ctx;
    const z = this.camera.zoom;
    const cell = 64;
    const halfW = this.viewW / 2 / z, halfH = this.viewH / 2 / z;
    const c0 = Math.max(0, Math.floor((this.camera.x - halfW) / cell));
    const c1 = Math.min(this.visCols - 1, Math.ceil((this.camera.x + halfW) / cell));
    const r0 = Math.max(0, Math.floor((this.camera.y - halfH) / cell));
    const r1 = Math.min(this.visRows - 1, Math.ceil((this.camera.y + halfH) / cell));
    for (let cy = r0; cy <= r1; cy++) {
      for (let cx = c0; cx <= c1; cx++) {
        const i = cx + cy * this.visCols;
        if (this.visible[i]) continue;
        const p = this.worldToScreen(cx * cell, cy * cell);
        ctx.fillStyle = this.explored[i] ? 'rgba(9,11,8,0.55)' : 'rgba(7,8,6,0.9)';
        ctx.fillRect(p.x, p.y, cell * z + 1, cell * z + 1);
      }
    }
  }

  drawDebug() {
    const ctx = this.ctx;
    const game = this.game;
    const z = this.camera.zoom;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#000000aa';
    ctx.fillRect(8, 8, 300, 132);
    ctx.fillStyle = '#9bbf6a';
    const lines = [
      `FPS ${this.fps}  юнитов ${[...game.units.values()].filter((u) => u.alive).length}  отрядов ${game.squads.size}`,
      `камера ${this.camera.x | 0},${this.camera.y | 0} zoom ${this.camera.zoom.toFixed(2)}`,
      `заказов в очереди ${game.api.orders.filter((o) => o.status === 'queued').length}`,
      `снабжение A ${Math.round(game.logistics.sectorSupply[0].get(0) * 100)}%`,
      `тик ${(game.dt * 1000).toFixed(1)} мс  время ${game.time.toFixed(0)} с`,
      `убито ${game.stats.kills.join('/')} захвачено ${game.stats.captures.join('/')}`,
    ];
    lines.forEach((l, i) => ctx.fillText(l, 14, 24 + i * 16));
    // навигационная сетка
    ctx.globalAlpha = 0.25;
    const nav = game.nav;
    const cs = nav.cell;
    const halfW = this.viewW / 2 / z, halfH = this.viewH / 2 / z;
    for (let i = 0; i < nav.openArr.length; i++) {
      if (!nav.openArr[i]) continue;
      const cx = i % nav.cols, cy = Math.floor(i / nav.cols);
      const wx = cx * cs, wy = cy * cs;
      if (Math.abs(wx - this.camera.x) > halfW + cs || Math.abs(wy - this.camera.y) > halfH + cs) continue;
      const p = this.worldToScreen(wx, wy);
      ctx.strokeStyle = '#7fa2c9';
      ctx.strokeRect(p.x, p.y, cs * z, cs * z);
    }
    ctx.globalAlpha = 1;
    // состояния юнитов
    ctx.fillStyle = '#d7dcd2';
    for (const u of game.units.values()) {
      if (!u.alive || !this.isVisible(u.x, u.y)) continue;
      const p = this.worldToScreen(u.x, u.y);
      ctx.fillText(`${u.state}/${u.activity}`, p.x + 10, p.y - 10);
    }
  }

  drawVignette() {
    const ctx = this.ctx;
    const w = this.viewW, h = this.viewH;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Мини-карта рисуется в отдельный canvas в HUD
  drawMinimap(canvas, game) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const kx = w / game.world.W, ky = h / game.world.H;
    ctx.fillStyle = '#1b2018';
    ctx.fillRect(0, 0, w, h);
    // сектора
    for (const s of game.world.sectors) {
      ctx.fillStyle = s.owner === 0 ? 'rgba(74,127,181,0.35)' : s.owner === 1 ? 'rgba(181,80,58,0.35)' : 'rgba(120,120,110,0.2)';
      ctx.beginPath();
      const r = game.cfg.sectors.hex.size * kx;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = s.cx * kx + Math.cos(a) * r, y = s.cy * ky + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
    // точки
    for (const p of game.world.points) {
      ctx.fillStyle = p.owner === 0 ? '#7fb2e0' : p.owner === 1 ? '#e08a72' : '#cfcfc4';
      const r = p.type === 'hq' ? 4 : p.type === 'city' ? 3 : 2;
      ctx.fillRect(p.x * kx - r / 2, p.y * ky - r / 2, r, r);
    }
    // юниты
    for (const u of game.units.values()) {
      if (!u.alive) continue;
      const isMine = game.playerFaction != null && u.faction === game.playerFaction;
      if (!isMine && !this.isVisible(u.x, u.y)) continue;
      ctx.fillStyle = u.faction === 0 ? '#a9d1f5' : '#f0a48c';
      ctx.fillRect(u.x * kx - 1, u.y * ky - 1, 2, 2);
    }
    // рамка камеры
    const vw = (this.viewW / this.camera.zoom) * kx;
    const vh = (this.viewH / this.camera.zoom) * ky;
    ctx.strokeStyle = '#e8b45a';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.camera.x * kx - vw / 2, this.camera.y * ky - vh / 2, vw, vh);
  }
}
