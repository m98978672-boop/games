// Экономика и логистика: склады фракции, добыча на точках, грузовики, снабжение секторов.
import { clamp, dist } from '../core/mathx.js';
import { updateTimers, moveAlongFlow } from './units.js';

export class Logistics {
  constructor(game) {
    this.game = game;
    this.stock = game.cfg.factions.map(() => ({ ...game.cfg.resources.start }));
    this.sectorSupply = game.cfg.factions.map(() => new Map());
    this.requests = [];
    this.productionAcc = 0;
    this.supplyAcc = 0;
    this.requestAcc = 0;
    this.resupplyAcc = 0;
    this.alertCooldown = [0, 0];
    this.priorities = ['balanced', 'balanced'];
    this.delivered = [0, 0];
    this.initSupply();
  }

  initSupply() {
    const world = this.game.world;
    for (const f of this.game.cfg.factions) {
      const hq = world.hqOf(f.id);
      for (const s of world.sectors) {
        const d = hq ? dist(s.cx, s.cy, hq.x, hq.y) : 2000;
        this.sectorSupply[f.id].set(s.id, clamp(1 - d / 3200, 0.3, 1));
      }
    }
  }

  supply(faction) { return this.stock[faction]; }
  sectorSupplyFor(faction, sectorId) {
    return this.sectorSupply[faction]?.get(sectorId) ?? 1;
  }
  add(faction, res, amount) {
    if (this.stock[faction][res] == null) return;
    this.stock[faction][res] = Math.max(0, this.stock[faction][res] + amount);
  }
  canAfford(faction, cost) {
    const s = this.stock[faction];
    for (const [k, v] of Object.entries(cost || {})) if ((s[k] || 0) < v) return false;
    return true;
  }
  spend(faction, cost) {
    if (!this.canAfford(faction, cost)) return false;
    const s = this.stock[faction];
    for (const [k, v] of Object.entries(cost || {})) s[k] -= v;
    return true;
  }
  missing(faction, cost) {
    const s = this.stock[faction];
    return Object.entries(cost || {}).filter(([k, v]) => (s[k] || 0) < v)
      .map(([k, v]) => `${this.game.cfg.resources.types[k].name}: ${Math.ceil(v - (s[k] || 0))}`);
  }

  update(dt) {
    const game = this.game;
    this.productionAcc += dt;
    if (this.productionAcc >= 1) { this.stepProduction(this.productionAcc); this.productionAcc = 0; }
    this.supplyAcc += dt;
    if (this.supplyAcc >= 1) { this.stepSupply(this.supplyAcc); this.supplyAcc = 0; }
    this.requestAcc += dt;
    if (this.requestAcc >= 4) { this.createDemand(); this.requestAcc = 0; }
    this.resupplyAcc += dt;
    if (this.resupplyAcc >= 2) { this.resupplyNearPoints(); this.resupplyAcc = 0; }
    this.moveTrucks(dt);
    this.alertCooldown[0] = Math.max(0, this.alertCooldown[0] - dt);
    this.alertCooldown[1] = Math.max(0, this.alertCooldown[1] - dt);
  }

  stepProduction(dt) {
    const game = this.game;
    const prod = game.cfg.resources.production;
    for (const f of game.cfg.factions) {
      const faction = f.id;
      for (const p of game.world.points) {
        if (p.owner !== faction || p.hp <= 0) continue;
        const rates = prod[p.type];
        if (!rates) continue;
        for (const [res, amount] of Object.entries(rates)) this.add(faction, res, amount * dt);
      }
      // приоритеты производства на заводе: снабжение / техника / стройка / оружие
      const factories = game.world.points.filter((p) => p.owner === faction && p.type === 'factory' && p.hp > 0).length;
      if (factories > 0) {
        const pr = this.priorities[faction];
        if (pr === 'supply') this.add(faction, 'ammo', 0.6 * factories * dt);
        else if (pr === 'build') this.add(faction, 'materials', 0.5 * factories * dt);
        else if (pr === 'weapons') this.add(faction, 'ammo', 0.35 * factories * dt);
        else if (pr === 'vehicles') this.add(faction, 'fuel', 0.2 * factories * dt);
      }
    }
  }

  stepSupply(dt) {
    const game = this.game;
    const cfg = game.cfg.resources.supply;
    const world = game.world;
    for (const f of game.cfg.factions) {
      const faction = f.id;
      const map = this.sectorSupply[faction];
      // точки, которые «подпитывают» свои сектора
      const sources = world.points.filter((p) => p.owner === faction && p.hp > 0 &&
        ['hq', 'depot', 'factory', 'farm'].includes(p.type));
      for (const s of world.sectors) {
        let value = map.get(s.id) ?? 1;
        const src = sources.find((p) => world.sectorAt(p.x, p.y)?.id === s.id);
        if (src) value = Math.min(1, value + 0.02 * dt);
        else {
          const nearSrc = sources.some((p) => world.sectorDistance(world.sectorAt(p.x, p.y), s) <= 1);
          value = Math.max(nearSrc ? 0.55 : 0.24, value - cfg.decayPerSecond * dt);
        }
        map.set(s.id, clamp(value, 0, 1));
      }
      // тревога о снабжении у ключевых секторов
      if (this.alertCooldown[faction] <= 0) {
        for (const s of world.sectors) {
          if ((map.get(s.id) ?? 1) >= cfg.lowThreshold) continue;
          const own = s.units[faction] > 0.5;
          const point = world.points.find((p) => p.owner === faction && world.sectorAt(p.x, p.y)?.id === s.id);
          if (!own && !point) continue;
          this.alertCooldown[faction] = 25;
          game.alertLog.push({ kind: 'supply', text: `Сектор «${s.name}»: нехватка снабжения`, sectorId: s.id, x: s.cx, y: s.cy, t: game.time });
          if (faction === game.playerFaction) game.sound('alert_supply', s.cx, s.cy);
          break;
        }
      }
      if (game.alertLog.length > 120) game.alertLog.splice(0, game.alertLog.length - 120);
    }
  }

  createDemand() {
    const game = this.game;
    for (const f of game.cfg.factions) {
      const faction = f.id;
      const map = this.sectorSupply[faction];
      for (const s of game.world.sectors) {
        if (this.requests.filter((r) => r.faction === faction).length >= 6) break;
        if ((map.get(s.id) ?? 1) > 0.5) continue;
        if (s.units[faction] < 0.3) continue;
        if (this.requests.some((r) => r.faction === faction && r.sectorId === s.id)) continue;
        this.requests.push({ faction, kind: 'sector', sectorId: s.id, x: s.cx, y: s.cy, created: game.time, priority: 1 });
      }
    }
  }

  requestSquadSupply(squad) {
    const c = squad.centroid();
    const sector = this.game.world.sectorAt(c.x, c.y);
    if (!sector) return;
    if (this.requests.some((r) => r.faction === squad.faction && r.squadId === squad.id)) return;
    this.requests.push({
      faction: squad.faction, kind: 'squad', squadId: squad.id, sectorId: sector.id,
      x: c.x, y: c.y, created: this.game.time, priority: 2,
    });
    this.game.events.emit('supplyRequested', { squad, t: this.game.time });
  }

  requestSector(sectorId, faction) {
    const s = this.game.world.sectorById(sectorId);
    if (!s) return;
    if (this.requests.some((r) => r.faction === faction && r.sectorId === sectorId)) return;
    this.requests.push({ faction, kind: 'sector', sectorId, x: s.cx, y: s.cy, created: this.game.time, priority: 1 });
  }

  trucksOf(faction) {
    return [...this.game.units.values()].filter((u) => u.faction === faction && u.alive && u.role === 'truck');
  }

  // Logistics-only opt-in: candidates are outside buildings and checked
  // against actual unit positions, not a potentially stale grid snapshot.
  // No unchecked fallback and no charge if a site cannot be found.
  vehicleProductionSpot(hq, role, x, y, reserved=[]) {
    const game=this.game, w=game.world, walls=game.walls;
    const radius=(game.cfg.unit(role).size || 44)*0.42;
    const free=(px,py)=>{
      if(px-radius<0 || py-radius<0 || px+radius>w.W || py+radius>w.H ||
         walls?.buildingAtPoint(px,py) || !w.isBaseWalkable(px,py) ||
         !w.isBaseWalkable(px-radius,py-radius) || !w.isBaseWalkable(px+radius,py-radius) ||
         !w.isBaseWalkable(px-radius,py+radius) || !w.isBaseWalkable(px+radius,py+radius) ||
         (walls?.enabled() && walls.blocksMove(px,py,radius,{isVehicle:true}))) return false;
      return ![...game.units.values(),...reserved].some(u=>u.alive!==false && !u.downed && Math.hypot(u.x-px,u.y-py)<u.radius+radius+2);
    };
    if(free(x,y))return {x,y};
    for(let r=120;r<=360;r+=30)for(let k=0;k<24;k++){
      const a=2*Math.PI*k/24,px=hq.x+Math.cos(a)*r,py=hq.y+Math.sin(a)*r;
      if(free(px,py))return {x:px,y:py};
    }
    return null;
  }

  maintainTrucks(faction) {
    const game = this.game;
    const trucks = this.trucksOf(faction);
    const hq = game.world.hqOf(faction);
    const hasFactory = game.world.points.some((p) => p.owner === faction && p.type === 'factory' && p.hp > 0);
    if (trucks.length >= 3 || !hq || !hasFactory) return;
    if (!this.canAfford(faction, game.cfg.unit('truck').cost)) return;
    if (game.cfg.flag('safe_vehicle_spawn_v1', false) || game.cfg.flag('movement_occupancy_v1', false)) {
      const spot=this.vehicleProductionSpot(hq,'truck',hq.x+game.rng.range(-90,90),hq.y+game.rng.range(-90,90));
      if(!spot || !this.spend(faction,game.cfg.unit('truck').cost))return;
      game.spawnUnit(faction,'truck',spot.x,spot.y,{spawnPoint:hq.id});
    } else {
      if (!this.spend(faction, game.cfg.unit('truck').cost)) return;
      game.spawnUnit(faction, 'truck', hq.x + game.rng.range(-90, 90), hq.y + game.rng.range(-90, 90), { spawnPoint: hq.id });
    }
  }

  autoProduction(faction) {
    const game = this.game;
    const stockA = this.stock[faction].ammo, stockM = this.stock[faction].materials;
    if (stockA < 300) this.priorities[faction] = 'supply';
    else if (stockM < 250) this.priorities[faction] = 'build';
    else this.priorities[faction] = 'vehicles';
    // танк в резерв, если есть завод и материалы
    const tanks = [...game.units.values()].filter((u) => u.faction === faction && u.alive && u.role === 'tank').length;
    const cap = 2 + (game.techLevel(faction) || 0);
    if (tanks < cap && this.canAfford(faction, game.cfg.unit('tank').cost) && game.time - (this.lastTank?.[faction] || 0) > 45) {
      if (game.cfg.flag('safe_vehicle_spawn_v1', false) || game.cfg.flag('movement_occupancy_v1', false)) {
        const hq=game.world.hqOf(faction);if(!hq)return;
        const spot=this.vehicleProductionSpot(hq,'tank',hq.x+game.rng.range(-100,100),hq.y+game.rng.range(-100,100));
        if(!spot || !this.spend(faction,game.cfg.unit('tank').cost))return;
        if(!this.lastTank)this.lastTank=[0,0];
        this.lastTank[faction]=game.time;
        game.spawnUnit(faction,'tank',spot.x,spot.y,{spawnPoint:hq.id});
      } else {
        if (!this.lastTank) this.lastTank = [0, 0];
        if (this.spend(faction, game.cfg.unit('tank').cost)) {
          this.lastTank[faction] = game.time;
          const hq = game.world.hqOf(faction);
          if (hq) game.spawnUnit(faction, 'tank', hq.x + game.rng.range(-100, 100), hq.y + game.rng.range(-100, 100), { spawnPoint: hq.id });
        }
      }
    }
  }

  safeTransportEnabled() {
    // Полный legacy-режим при отключённых стенах/новой навигации нужен для
    // воспроизводимости старых игр; исправление доступно в современной конфигурации.
    return (this.game.cfg.flag('safe_logistics_v2', false) ||
      (this.game.cfg.flag('safe_vehicle_spawn_v1', false) && this.game.cfg.flag('vehicle_pickup_exterior_v1', false))) &&
      this.game.cfg.flag('pathing_v2', false) && this.game.cfg.flag('wall_collision_v2', true);
  }

  moveTrucks(dt) {
    if (!this.safeTransportEnabled()) return this.moveTrucksLegacy(dt);
    const game = this.game;
    for (const f of game.cfg.factions) {
      const faction = f.id;
      const trucks = this.trucksOf(faction);
      // Заявка остаётся в общем списке до доставки, но активный рейс уже её
      // зарезервировал. Не назначаем один и тот же груз нескольким машинам.
      const activeRequests = new Set(trucks.filter((t) => t.truckTask?.state === 'toSource' || t.truckTask?.state === 'toTarget')
        .map((t) => t.truckTask.request));
      // Повреждённый старый рейс может оставить груз на стоянке; повторная
      // загрузка не должна незаметно перезаписать его.
      const idle = trucks.filter((t) => !(t.cargo > 0) && (!t.truckTask || t.truckTask.state === 'idle' || t.truckTask.state === 'idleTruck'));
      const pending = [...new Set(this.requests.filter((r) => r.faction === faction && !activeRequests.has(r)))].sort((a, b) => b.priority - a.priority || a.created - b.created);
      for (const truck of idle) {
        if (!pending.length) break;
        const req = pending.shift();
        this.assignTruck(truck, req);
      }
      for (const truck of trucks) {
        updateTimers(game, truck, dt);
        if (!truck.truckTask) continue;
        const task = truck.truckTask;
        // При угрозе груз и заявка остаются за машиной; после ухода врага
        // рейс продолжается. Иначе вторая машина могла забрать ту же заявку,
        // пока первая всё ещё везёт груз.
        const foes = game.nearbyEnemies(truck, 300);
        if (foes.length && (task.state === 'toSource' || task.state === 'toTarget')) {
          truck._supplyRetreating = true;
          const home = game.world.nearestPoint(truck.x, truck.y, (p) => p.owner === truck.faction && ['hq', 'depot'].includes(p.type)).point;
          truck.goal = home ? { x: home.x, y: home.y } : null;
          moveAlongFlow(game, truck, dt);
          continue;
        }
        if (truck._supplyRetreating) { truck.goal = null; truck._supplyRetreating = false; }
        if (task.state === 'toSource') {
          if (task.source.owner !== faction || task.source.hp <= 0) {
            truck.truckTask = null; truck.goal = null; continue;
          }
          if (task.pickup && task.pickupVersion !== game.world.navVersion) {
            if (!this.pickupPassable(truck, task.pickup)) task.pickup = null;
            task.pickupVersion = game.world.navVersion;
          }
          if (!task.pickup) {
            task.pickup = this.pickupPoint(truck, task.source);
            task.pickupVersion = game.world.navVersion;
          }
          if (!task.pickup) { truck.goal = null; continue; }
          if (!truck.goal || truck.goal.x !== task.pickup.x || truck.goal.y !== task.pickup.y) {
            truck.goal = { ...task.pickup }; truck.pathFailed = false;
          }
          moveAlongFlow(game, truck, dt);
          if (dist(truck.x, truck.y, task.pickup.x, task.pickup.y) < 34) this.loadTruck(truck, task);
        } else if (task.state === 'toTarget') {
          let target=task.request, range=110;
          if(game.cfg.flag('logistics_dropoff_v1',false)) {
            const b=game.walls.buildingAtPoint(task.request.x,task.request.y);
            if(b){
              // Re-evaluate when the destination or geometry changes. Loading
              // and unloading use physical exterior points, never pathFailed.
              if(task.dropoff && (task.dropoffBuilding!==b.id || task.dropoffVersion!==game.world.navVersion ||
                 task.dropoffRequestX!==task.request.x || task.dropoffRequestY!==task.request.y ||
                 !this.pickupPassable(truck,task.dropoff)))task.dropoff=null;
              if(!task.dropoff){task.dropoff=this.exteriorPoint(truck,b);task.dropoffBuilding=b.id;
                task.dropoffVersion=game.world.navVersion;task.dropoffRequestX=task.request.x;task.dropoffRequestY=task.request.y;}
              if(!task.dropoff){truck.goal=null;continue;}
              target=task.dropoff;range=34;
            } else {task.dropoff=null;}
          }
          if (!truck.goal || truck.goal.x !== target.x || truck.goal.y !== target.y) {
            truck.goal = { x: target.x, y: target.y }; truck.pathFailed = false;
          }
          moveAlongFlow(game, truck, dt);
          // A blocked path is not a delivery; the cargo and reservation stay.
          if (dist(truck.x, truck.y, target.x, target.y) < range) this.unloadTruck(truck, task);
        } else if (task.state === 'idleTruck') {
          truck.goal = null;
        }
      }
      // запросы, которые никто не забрал, через 2 минуты обслуживает резервная колонна
      for (const req of [...this.requests]) {
        if (game.time - req.created > 120 && req.faction === faction &&
            !trucks.some((t) => (t.truckTask?.state === 'toSource' || t.truckTask?.state === 'toTarget') && t.truckTask.request === req)) {
          this.applyDelivery(faction, req, 0.18);
          this.requests.splice(this.requests.indexOf(req), 1);
          game.alertLog.push({ kind: 'supply', text: 'Резервная колонна доставила снабжение', x: req.x, y: req.y, t: game.time });
        }
      }
    }
  }

  // Исходный алгоритм для честного отката флага и старого режима без стен.
  moveTrucksLegacy(dt) {
    const game = this.game;
    for (const f of game.cfg.factions) {
      const faction = f.id;
      const trucks = this.trucksOf(faction);
      const idle = trucks.filter((t) => !t.truckTask || t.truckTask.state === 'idle');
      const pending = this.requests.filter((r) => r.faction === faction).sort((a, b) => b.priority - a.priority || a.created - b.created);
      for (const truck of idle) {
        if (!pending.length) break;
        const req = pending.shift();
        this.assignTruck(truck, req);
      }
      for (const truck of trucks) {
        updateTimers(game, truck, dt);
        if (!truck.truckTask) continue;
        const task = truck.truckTask;
        // водитель не едет в бой: враг рядом — бросаем рейс и уходим к своей точке
        const foes = game.nearbyEnemies(truck, 300);
        if (foes.length) {
          if (task.request && task.state !== 'toSource') this.requests.push(task.request);
          truck.truckTask = null;
          const home = game.world.nearestPoint(truck.x, truck.y, (p) => p.owner === truck.faction && ['hq', 'depot'].includes(p.type));
          if (home) truck.goal = { x: home.x, y: home.y };
          truck.goal = truck.goal || null;
          moveAlongFlow(game, truck, dt);
          continue;
        }
        if (task.state === 'toSource') {
          if (!truck.goal) truck.goal = { x: task.source.x, y: task.source.y };
          moveAlongFlow(game, truck, dt);
          if (dist(truck.x, truck.y, task.source.x, task.source.y) < 80) this.loadTruck(truck, task);
        } else if (task.state === 'toTarget') {
          if (!truck.goal) truck.goal = { x: task.request.x, y: task.request.y };
          moveAlongFlow(game, truck, dt);
          if (dist(truck.x, truck.y, task.request.x, task.request.y) < 110 || truck.pathFailed) this.unloadTruck(truck, task);
        } else if (task.state === 'idleTruck') {
          truck.goal = null;
        }
      }
      // запросы, которые никто не забрал, через 2 минуты обслуживает резервная колонна
      for (const req of [...this.requests]) {
        if (game.time - req.created > 120 && req.faction === faction) {
          this.applyDelivery(faction, req, 0.18);
          this.requests.splice(this.requests.indexOf(req), 1);
          game.alertLog.push({ kind: 'supply', text: 'Резервная колонна доставила снабжение', x: req.x, y: req.y, t: game.time });
        }
      }
    }
  }


  pickupPassable(truck, point) {
    const { world, walls } = this.game, { x, y } = point, r = truck.radius;
    return [[-r,-r],[-r,r],[r,-r],[r,r],[0,0]].every(([dx,dy]) => world.isBaseWalkable(x+dx,y+dy)) &&
      !walls.blocksMove(x,y,r,truck);
  }

  // Внешняя точка погрузки: грузовик не должен целиться в центр штаба,
  // где вообще нет ворот для техники. Точка выбирается только на рельефе
  // и без пересечения стены для полного радиуса машины.
  pickupPoint(truck, source) {
    const { world, walls } = this.game;
    const building = world.buildingAtPoint(source.id);
    if (!building || !walls?.state(building)) return { x: source.x, y: source.y };
    return this.exteriorPoint(truck,building);
  }

  exteriorPoint(truck, building) {
    const walls=this.game.walls, st=walls?.state(building);
    if (!st) return null;
    const half = (st.outline.size || Math.max(building.w, building.h)) / 2;
    const offset = half + (st.outline.thickness || 0) / 2 + truck.radius + 18;
    let best = null, bestDistance = Infinity;
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI * 2 / 16;
      // Проекция на квадрат, а не окружность внутри его углов.
      const cx = Math.cos(a), cy = Math.sin(a), scale = offset / Math.max(Math.abs(cx), Math.abs(cy));
      const x = building.x + cx * scale, y = building.y + cy * scale;
      if (!this.pickupPassable(truck, {x,y})) continue;
      const d = dist(truck.x,truck.y,x,y);
      if (d < bestDistance) { bestDistance = d; best = {x,y}; }
    }
    return best;
  }

  assignTruck(truck, req) {
    const game = this.game;
    const stock = this.stock[truck.faction];
    if (stock.ammo < 80 || stock.fuel < 6) { truck.truckTask = null; return; }
    const sources = game.world.points.filter((p) => p.owner === truck.faction && p.hp > 0 && ['depot', 'hq', 'factory'].includes(p.type));
    if (!sources.length) { truck.truckTask = null; return; }
    let source = sources[0], bd = Infinity;
    for (const p of sources) {
      const d = dist(truck.x, truck.y, p.x, p.y);
      if (d < bd) { bd = d; source = p; }
    }
    truck.truckTask = { state: 'toSource', request: req, source, amount: 0 };
    truck.goal = { x: source.x + game.rng.range(-40, 40), y: source.y + game.rng.range(-40, 40) };
    truck.pathFailed = false;
  }

  loadTruck(truck, task) {
    const game = this.game;
    const stock = this.stock[truck.faction];
    const cargoMult = game.modsFor(truck.faction).cargo_mult || 1;
    const amount = Math.min(truck.def.cargo * cargoMult, stock.ammo - 40, 240);
    if (amount <= 0 || stock.fuel < 4) {
      if (!this.safeTransportEnabled() || (task.request && !this.requests.includes(task.request))) this.requests.push(task.request);
      truck.truckTask = null;
      return;
    }
    stock.ammo -= amount;
    stock.fuel -= 4;
    truck.cargo = amount;
    truck.cargoType = 'ammo';
    task.amount = amount;
    task.state = 'toTarget';
    truck.goal = { x: task.request.x, y: task.request.y };
    truck.pathFailed = false;
  }

  unloadTruck(truck, task) {
    const game = this.game;
    const req = task.request;
    const amount = truck.cargo || 0;
    truck.cargo = 0;
    if (this.safeTransportEnabled()) truck.cargoType = null;
    this.applyDelivery(truck.faction, req, Math.max(0.2, amount / 240));
    this.delivered[truck.faction]++;
    game.awardXP(truck.faction, 'logistics', 'deliver', 1);
    if (req.squadId) {
      const sq = game.squads.get(req.squadId);
      if (sq) sq.requestedSupply = false;
    }
    const idx = this.requests.indexOf(req);
    if (idx >= 0) this.requests.splice(idx, 1);
    truck.truckTask = { state: 'idleTruck' };
    truck.goal = null;
    game.sound('build_done', truck.x, truck.y);
  }

  applyDelivery(faction, req, strength) {
    const game = this.game;
    const cfg = game.cfg.resources.supply;
    const map = this.sectorSupply[faction];
    const sectorId = req.sectorId;
    if (sectorId != null) {
      const cur = map.get(sectorId) ?? 0.3;
      map.set(sectorId, clamp(cur + cfg.delivery * strength, 0, 1));
      const sector = game.world.sectorById(sectorId);
      if (sector) for (const nid of sector.neighbors) {
        map.set(nid, clamp((map.get(nid) ?? 0.3) + cfg.delivery * strength * 0.35, 0, 1));
      }
    }
    // пополнить бойцов рядом
    let given = 0;
    for (const u of game.unitsNear(req.x, req.y, 240)) {
      if (u.faction !== faction || !u.alive) continue;
      u.reserve = u.reserveCapacity;
      if (u.role === 'medic') u.medkits = Math.max(u.medkits, (u.def.medkit || 1));
      given++;
    }
    game.events.emit('supplyDelivered', { faction, req, units: given, t: game.time });
  }

  resupplyNearPoints() {
    const game = this.game;
    for (const f of game.cfg.factions) {
      const faction = f.id;
      const stock = this.stock[faction];
      const points = game.world.points.filter((p) => p.owner === faction && p.hp > 0 && ['hq', 'depot', 'factory'].includes(p.type));
      for (const p of points) {
        for (const u of game.unitsNear(p.x, p.y, 260)) {
          if (u.faction !== faction || !u.alive || u.downed) continue;
          if (u.reserve >= u.reserveCapacity && u.hp >= u.maxHp) continue;
          const need = u.reserveCapacity - u.reserve;
          const cost = need * 0.02;
          if (stock.ammo < cost + 10) continue;
          stock.ammo -= cost;
          u.reserve = u.reserveCapacity;
          if (u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.15);
        }
      }
    }
  }

  onPointCaptured(point, faction) {
    // захваченный склад/город поднимает снабжение сектора
    const sector = this.game.world.sectorAt(point.x, point.y);
    if (!sector) return;
    if (point.type === 'depot' || point.type === 'city' || point.type === 'hq') {
      this.sectorSupply[faction].set(sector.id, 1);
    }
  }
}
