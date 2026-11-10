(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};

  var TILE = {
    GRASS: 0, DIRT: 1, ASPHALT: 2, SIDEWALK: 3, FLOOR_WOOD: 4,
    FLOOR_HOSPITAL: 5, FLOOR_WAREHOUSE: 6, WATER: 7,
    WALL_BRICK: 8, WALL_WOOD: 9, WALL_PLASTER: 10,
    DOOR: 11, WINDOW: 12, TREE_OAK: 13, TREE_PINE: 14
  };
  DD.TILE = TILE;

  function hash2i(x, y, seed) {
    var h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function hashFloat(x, y, seed) {
    return hash2i(x, y, seed) / 4294967295;
  }

  // 2D Simplex-style градиентный шум (fBm)
  var GRADS = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  function simplex2d(x, y, seed) {
    var F2 = 0.3660254037844386;
    var G2 = 0.21132486540518713;
    var s = (x + y) * F2;
    var i = Math.floor(x + s);
    var j = Math.floor(y + s);
    var t = (i + j) * G2;
    var x0 = x - (i - t);
    var y0 = y - (j - t);
    var i1 = x0 > y0 ? 1 : 0;
    var j1 = x0 > y0 ? 0 : 1;
    var x1 = x0 - i1 + G2;
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2;
    var y2 = y0 - 1 + 2 * G2;

    function contrib(gx, gy, ix, iy) {
      var t0 = 0.5 - gx * gx - gy * gy;
      if (t0 < 0) return 0;
      t0 *= t0;
      var g = GRADS[hash2i(ix, iy, seed) & 7];
      return t0 * t0 * (g[0] * gx + g[1] * gy);
    }
    return 70 * (contrib(x0, y0, i, j) + contrib(x1, y1, i + i1, j + j1) + contrib(x2, y2, i + 1, j + 1));
  }

  function fbm2d(x, y, seed) {
    return simplex2d(x, y, seed) * 0.65 + simplex2d(x * 2.1, y * 2.1, seed + 17) * 0.35;
  }

  // Районы по диаграмме Вороного
  var ZONES = ['residential', 'downtown', 'commercial', 'hospital', 'industrial', 'forest'];
  function getVoronoiDistrict(wx, wy, seed) {
    var cell = 64;
    var gx = Math.floor(wx / cell);
    var gy = Math.floor(wy / cell);
    var bestD = 1e12;
    var bestZ = 'residential';
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        var cx = gx + dx;
        var cy = gy + dy;
        var sx = (cx + 0.15 + 0.7 * hashFloat(cx, cy, seed + 101)) * cell;
        var sy = (cy + 0.15 + 0.7 * hashFloat(cx, cy, seed + 202)) * cell;
        var d2 = (wx - sx) * (wx - sx) + (wy - sy) * (wy - sy);
        if (d2 < bestD) {
          bestD = d2;
          if (cx === 0 && cy === 0) bestZ = 'residential';
          else bestZ = ZONES[hash2i(cx, cy, seed + 303) % ZONES.length];
        }
      }
    }
    return bestZ;
  }

  var CHUNK_SIZE = 32;

  function ChunkWorld(seed) {
    this.seed = seed || 20261110;
    this.chunks = {};
    this.overrides = {};
    this.doors = {};
    this.windows = {};
    this.containers = {};
  }

  ChunkWorld.prototype.key = function (cx, cy) {
    return cx + ',' + cy;
  };

  ChunkWorld.prototype.tileKey = function (tx, ty) {
    return tx + ',' + ty;
  };

  ChunkWorld.prototype.generateChunk = function (cx, cy) {
    var k = this.key(cx, cy);
    if (this.chunks[k]) return this.chunks[k];

    var tiles = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
    var ox = cx * CHUNK_SIZE;
    var oy = cy * CHUNK_SIZE;
    var zone = getVoronoiDistrict(ox + 16, oy + 16, this.seed);
    var doors = [];
    var windows = [];
    var containers = [];
    var vehicleSpawns = [];

    // 1. Биом и дороги L-системы
    for (var ly = 0; ly < CHUNK_SIZE; ly++) {
      for (var lx = 0; lx < CHUNK_SIZE; lx++) {
        var wx = ox + lx;
        var wy = oy + ly;
        var n = fbm2d(wx * 0.032, wy * 0.032, this.seed);
        var t = TILE.GRASS;
        if (n < -0.52 && zone === 'forest') t = TILE.WATER;
        else if (zone === 'forest' && hashFloat(wx, wy, this.seed + 19) < 0.14) t = (n > 0 ? TILE.TREE_OAK : TILE.TREE_PINE);
        else if (n > 0.35 && hashFloat(wx, wy, this.seed + 29) < 0.05) t = TILE.TREE_OAK;
        else if (n < -0.2) t = TILE.DIRT;

        var onRoad = (lx >= 13 && lx <= 16) || (ly >= 13 && ly <= 16);
        var onSidewalk = ((lx === 12 || lx === 17) || (ly === 12 || ly === 17)) && !onRoad;
        if (onRoad) t = TILE.ASPHALT;
        else if (onSidewalk && zone !== 'forest') t = TILE.SIDEWALK;

        tiles[ly * CHUNK_SIZE + lx] = t;
      }
    }

    // 2. Здания по BSP разбиению в 4 кварталах вокруг перекрёстка
    var bZones = [
      { x: 2, y: 2, w: 9, h: 9 },
      { x: 19, y: 2, w: 10, h: 9 },
      { x: 2, y: 19, w: 9, h: 10 },
      { x: 19, y: 19, w: 10, h: 10 }
    ];
    if (zone !== 'forest') {
      for (var bi = 0; bi < bZones.length; bi++) {
        // Оставляем стартовую площадку (0,0) вокруг (16,16) свободной на дорогах
        if (hashFloat(cx * 4 + bi, cy * 4 + bi, this.seed + 77) > 0.78) continue;
        var bz = bZones[bi];
        var wallT = zone === 'residential' ? TILE.WALL_WOOD : (zone === 'hospital' ? TILE.WALL_PLASTER : TILE.WALL_BRICK);
        var floorT = zone === 'hospital' ? TILE.FLOOR_HOSPITAL : (zone === 'industrial' ? TILE.FLOOR_WAREHOUSE : TILE.FLOOR_WOOD);
        for (var y = bz.y; y < bz.y + bz.h; y++) {
          for (var x = bz.x; x < bz.x + bz.w; x++) {
            var border = (x === bz.x || x === bz.x + bz.w - 1 || y === bz.y || y === bz.y + bz.h - 1);
            tiles[y * CHUNK_SIZE + x] = border ? wallT : floorT;
          }
        }
        // Внутренняя перегородка BSP
        var splitX = bz.x + Math.floor(bz.w / 2);
        for (var sy = bz.y + 1; sy < bz.y + bz.h - 1; sy++) {
          if (sy !== bz.y + Math.floor(bz.h / 2)) {
            tiles[sy * CHUNK_SIZE + splitX] = wallT;
          }
        }
        // Дверь к дороге и окно
        var doorX = bz.x + Math.floor(bz.w / 2);
        var doorY = bz.y < 14 ? bz.y + bz.h - 1 : bz.y;
        tiles[doorY * CHUNK_SIZE + doorX] = TILE.DOOR;
        var dObj = { tx: ox + doorX, ty: oy + doorY, hp: 100, open: false, broken: false };
        doors.push(dObj);
        this.doors[this.tileKey(dObj.tx, dObj.ty)] = dObj;

        var winX = bz.x + 2;
        tiles[doorY * CHUNK_SIZE + winX] = TILE.WINDOW;
        var wObj = { tx: ox + winX, ty: oy + doorY, broken: false, barricade: 0 };
        windows.push(wObj);
        this.windows[this.tileKey(wObj.tx, wObj.ty)] = wObj;

        // Контейнер лута внутри здания
        var lootZone = zone === 'hospital' ? 'pharmacy' : (zone === 'commercial' ? 'supermarket' : zone);
        var cObj = { tx: ox + bz.x + 2, ty: oy + bz.y + 2, zone: lootZone, looted: false };
        containers.push(cObj);
        this.containers[this.tileKey(cObj.tx, cObj.ty)] = cObj;
      }
    }

    // 3. Спавн брошенной 3D/2D машины на дороге
    if (hashFloat(cx, cy, this.seed + 555) < 0.65) {
      var vTypes = ['veh_sedan', 'veh_police', 'veh_pickup', 'veh_van', 'veh_truck', 'veh_ambulance'];
      var vt = zone === 'hospital' ? 'veh_ambulance' : vTypes[hash2i(cx, cy, this.seed + 99) % vTypes.length];
      vehicleSpawns.push({ type: vt, tx: ox + 14, ty: oy + (cx === 0 && cy === 0 ? 11 : 14) });
    }

    var chunk = {
      cx: cx, cy: cy, zone: zone, tiles: tiles,
      doors: doors, windows: windows, containers: containers, vehicleSpawns: vehicleSpawns
    };
    this.chunks[k] = chunk;
    return chunk;
  };

  ChunkWorld.prototype.getTile = function (tx, ty) {
    var tk = this.tileKey(tx, ty);
    if (tk in this.overrides) return this.overrides[tk];
    var cx = Math.floor(tx / CHUNK_SIZE);
    var cy = Math.floor(ty / CHUNK_SIZE);
    var chunk = this.generateChunk(cx, cy);
    var lx = ((tx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    var ly = ((ty % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk.tiles[ly * CHUNK_SIZE + lx];
  };

  ChunkWorld.prototype.setTile = function (tx, ty, val) {
    this.overrides[this.tileKey(tx, ty)] = val;
  };

  ChunkWorld.prototype.isWalkable = function (tx, ty) {
    var t = this.getTile(tx, ty);
    if (t === TILE.WALL_BRICK || t === TILE.WALL_WOOD || t === TILE.WALL_PLASTER || t === TILE.WATER || t === TILE.TREE_OAK || t === TILE.TREE_PINE) {
      return false;
    }
    if (t === TILE.DOOR) {
      var d = this.doors[this.tileKey(tx, ty)];
      return Boolean(d && (d.open || d.broken));
    }
    return true;
  };

  ChunkWorld.prototype.isOpaque = function (tx, ty) {
    var t = this.getTile(tx, ty);
    if (t === TILE.WALL_BRICK || t === TILE.WALL_WOOD || t === TILE.WALL_PLASTER || t === TILE.TREE_OAK || t === TILE.TREE_PINE) {
      return true;
    }
    if (t === TILE.DOOR) {
      var d = this.doors[this.tileKey(tx, ty)];
      return !(d && (d.open || d.broken));
    }
    return false;
  };

  ChunkWorld.prototype.isIndoor = function (tx, ty) {
    var t = this.getTile(tx, ty);
    return t === TILE.FLOOR_WOOD || t === TILE.FLOOR_HOSPITAL || t === TILE.FLOOR_WAREHOUSE;
  };

  ChunkWorld.prototype.toggleDoor = function (tx, ty) {
    var d = this.doors[this.tileKey(tx, ty)];
    if (!d || d.broken) return false;
    d.open = !d.open;
    return true;
  };

  ChunkWorld.prototype.damageDoor = function (tx, ty, dmg) {
    var d = this.doors[this.tileKey(tx, ty)];
    if (!d || d.broken) return true;
    d.hp = Math.max(0, d.hp - dmg);
    if (d.hp <= 0) {
      d.broken = true;
      d.open = true;
      return true;
    }
    return false;
  };

  DD.ChunkWorld = ChunkWorld;

  // Spatial Hash Grid O(1) для толп зомби и звука
  function SpatialHash(cellSize) {
    this.cellSize = cellSize || 8;
    this.buckets = {};
  }
  SpatialHash.prototype.clear = function () { this.buckets = {}; };
  SpatialHash.prototype.insert = function (id, x, y) {
    var cx = Math.floor(x / this.cellSize);
    var cy = Math.floor(y / this.cellSize);
    var k = cx + ',' + cy;
    if (!this.buckets[k]) this.buckets[k] = [];
    this.buckets[k].push(id);
  };
  SpatialHash.prototype.queryRadius = function (x, y, r) {
    var cr = Math.ceil(r / this.cellSize);
    var cx0 = Math.floor(x / this.cellSize);
    var cy0 = Math.floor(y / this.cellSize);
    var out = [];
    for (var dy = -cr; dy <= cr; dy++) {
      for (var dx = -cr; dx <= cr; dx++) {
        var b = this.buckets[(cx0 + dx) + ',' + (cy0 + dy)];
        if (b) {
          for (var i = 0; i < b.length; i++) out.push(b[i]);
        }
      }
    }
    return out;
  };
  DD.SpatialHash = SpatialHash;

  // Flow Field (Дейкстра) для одновременного поиска пути 150 зомби
  function computeFlowField(goalX, goalY, radius, world) {
    var dist = {};
    var queue = [[goalX, goalY, 0]];
    dist[goalX + ',' + goalY] = 0;
    var head = 0;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < queue.length) {
      var cur = queue[head++];
      var cx = cur[0], cy = cur[1], cd = cur[2];
      if (cd >= radius) continue;
      for (var i = 0; i < 4; i++) {
        var nx = cx + dirs[i][0];
        var ny = cy + dirs[i][1];
        if (Math.abs(nx - goalX) > radius || Math.abs(ny - goalY) > radius) continue;
        var k = nx + ',' + ny;
        if (k in dist) continue;
        var t = world.getTile(nx, ny);
        if (!world.isWalkable(nx, ny) && t !== TILE.DOOR && t !== TILE.WINDOW) continue;
        var cost = (t === TILE.DOOR || t === TILE.WINDOW) ? 3 : 1;
        dist[k] = cd + cost;
        queue.push([nx, ny, cd + cost]);
      }
    }
    return dist;
  }

  function sampleFlow(field, tx, ty) {
    var k0 = tx + ',' + ty;
    var bestD = (k0 in field) ? field[k0] : 999999;
    var bx = 0, by = 0;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (var i = 0; i < dirs.length; i++) {
      var k = (tx + dirs[i][0]) + ',' + (ty + dirs[i][1]);
      if ((k in field) && field[k] < bestD) {
        bestD = field[k];
        bx = dirs[i][0];
        by = dirs[i][1];
      }
    }
    var len = Math.hypot(bx, by);
    return len > 0 ? { x: bx / len, y: by / len } : { x: 0, y: 0 };
  }

  DD.computeFlowField = computeFlowField;
  DD.sampleFlow = sampleFlow;

  // 8-октантный Shadowcasting FOV
  var MULT = [
    [1, 0, 0, -1, -1, 0, 0, 1],
    [0, 1, -1, 0, 0, -1, 1, 0],
    [0, 1, 1, 0, 0, -1, -1, 0],
    [1, 0, 0, 1, -1, 0, 0, -1]
  ];

  function computeFov(ox, oy, radius, world) {
    var visible = {};
    visible[ox + ',' + oy] = true;
    var r2 = radius * radius;

    function cast(row, startSlope, endSlope, xx, xy, yx, yy) {
      if (startSlope < endSlope) return;
      var nextStart = startSlope;
      for (var i = row; i <= radius; i++) {
        var blocked = false;
        for (var dx = -i, dy = -i; dx <= 0; dx++) {
          var lSlope = (dx - 0.5) / (dy + 0.5);
          var rSlope = (dx + 0.5) / (dy - 0.5);
          if (startSlope < rSlope) continue;
          if (endSlope > lSlope) break;
          var wx = ox + dx * xx + dy * xy;
          var wy = oy + dx * yx + dy * yy;
          if (dx * dx + dy * dy <= r2) {
            visible[wx + ',' + wy] = true;
          }
          var opaque = world.isOpaque(wx, wy);
          if (blocked) {
            if (opaque) {
              nextStart = rSlope;
            } else {
              blocked = false;
              startSlope = nextStart;
            }
          } else if (opaque && i < radius) {
            blocked = true;
            cast(i + 1, startSlope, lSlope, xx, xy, yx, yy);
            nextStart = rSlope;
          }
        }
        if (blocked) break;
      }
    }

    for (var oct = 0; oct < 8; oct++) {
      cast(1, 1.0, 0.0, MULT[0][oct], MULT[1][oct], MULT[2][oct], MULT[3][oct]);
    }
    return visible;
  }
  DD.computeFov = computeFov;

  // Акустика по закону обратных квадратов (-6.02 дБ за удвоение) + затухание сквозь стены
  DD.NoiseSystem = {
    doublingLossDb: 6.02,
    maxRadiusTiles: function (db, floorDb) {
      var loss = DD.DataDB.getReal('acoustics_inverse_square_attenuation', 6.02);
      var eff = Math.max(32, floorDb || 32);
      var delta = db - eff;
      if (delta <= 0) return 0;
      return Math.min(120, Math.pow(2, delta / loss));
    },
    receivedDb: function (sx, sy, dx, dy, sourceDb, world) {
      var dist = Math.max(1, Math.hypot(dx - sx, dy - sy));
      var loss = DD.DataDB.getReal('acoustics_inverse_square_attenuation', 6.02);
      var distLoss = loss * (Math.log(dist) / Math.LN2);
      var steps = Math.ceil(dist);
      var wallLoss = 0;
      var lastK = '';
      for (var i = 1; i < steps; i++) {
        var t = i / steps;
        var tx = Math.round(sx + (dx - sx) * t);
        var ty = Math.round(sy + (dy - sy) * t);
        var k = tx + ',' + ty;
        if (k === lastK) continue;
        lastK = k;
        var tt = world.getTile(tx, ty);
        if (tt === TILE.WALL_BRICK || tt === TILE.WALL_WOOD || tt === TILE.WALL_PLASTER) wallLoss += 12;
        else if (tt === TILE.DOOR && world.doors[k] && !world.doors[k].open) wallLoss += 5;
      }
      return sourceDb - distLoss - wallLoss;
    }
  };
})(window);
