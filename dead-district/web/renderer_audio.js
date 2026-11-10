(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};
  var TILE = DD.TILE;

  // Цвета палитры Survival Horror 32 (Lospec)
  var TILE_COLORS = {};
  TILE_COLORS[TILE.GRASS] = '#41745a';
  TILE_COLORS[TILE.DIRT] = '#805947';
  TILE_COLORS[TILE.ASPHALT] = '#403e52';
  TILE_COLORS[TILE.SIDEWALK] = '#8c929e';
  TILE_COLORS[TILE.FLOOR_WOOD] = '#a99a73';
  TILE_COLORS[TILE.FLOOR_HOSPITAL] = '#b7c0c7';
  TILE_COLORS[TILE.FLOOR_WAREHOUSE] = '#5c6174';
  TILE_COLORS[TILE.WATER] = '#20494b';
  TILE_COLORS[TILE.WALL_BRICK] = '#623333';
  TILE_COLORS[TILE.WALL_WOOD] = '#471f1f';
  TILE_COLORS[TILE.WALL_PLASTER] = '#cea19d';
  TILE_COLORS[TILE.DOOR] = '#805947';
  TILE_COLORS[TILE.WINDOW] = '#96a5bc';
  TILE_COLORS[TILE.TREE_OAK] = '#20494b';
  TILE_COLORS[TILE.TREE_PINE] = '#20494b';

  var sprites = {};
  function loadSprite(key, relPath) {
    if (typeof global.Image !== 'function') return;
    try {
      var img = new global.Image();
      img.onload = function () { sprites[key] = img; };
      img.src = relPath;
    } catch (err) {
      DD.ErrorManager.warn('E101', 'Renderer', 'Ошибка загрузки спрайта', { key: key, err: String(err) });
    }
  }

  function initSprites() {
    loadSprite('player', 'assets/sprites/player/player_base_walk.png');
    loadSprite('walker', 'assets/sprites/zombies/zombie_walker_sheet.png');
    loadSprite('runner', 'assets/sprites/zombies/zombie_runner_sheet.png');
    loadSprite('crawler', 'assets/sprites/zombies/zombie_crawler_sheet.png');
    loadSprite('brute', 'assets/sprites/zombies/zombie_brute_sheet.png');
    loadSprite('infected', 'assets/sprites/zombies/zombie_infected_sheet.png');
    loadSprite('npc', 'assets/sprites/npcs/npc_scavenger_sheet.png');
    loadSprite('grass', 'assets/tiles/tile_grass_variants.png');
    loadSprite('asphalt', 'assets/tiles/tile_asphalt_road.png');
  }

  var audioCache = {};
  var audioMuted = false;

  function playSfx(name) {
    if (audioMuted || typeof global.Audio !== 'function') return;
    try {
      var s = audioCache[name];
      if (!s) {
        s = new global.Audio('assets/audio/' + name);
        audioCache[name] = s;
      }
      s.currentTime = 0;
      var p = s.play();
      if (p && typeof p.catch === 'function') p.catch(function (e) { return e; });
    } catch (err) {
      DD.ErrorManager.warn('E805', 'AudioMgr', 'Ошибка проигрывания WAV', { name: name, err: String(err) });
    }
  }

  function renderFrame(canvas, state) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    var W = 480, H = 270, T = 16;
    ctx.fillStyle = '#0f2935';
    ctx.fillRect(0, 0, W, H);

    var px = state.player.x;
    var py = state.player.y;
    var originX = W * 0.5 - px * T;
    var originY = H * 0.5 - py * T;
    var halfW = Math.floor(W / T / 2) + 2;
    var halfH = Math.floor(H / T / 2) + 2;
    var cx = Math.round(px);
    var cy = Math.round(py);

    // 1. Тайл-карта и туман войны
    for (var ty = cy - halfH; ty <= cy + halfH; ty++) {
      for (var tx = cx - halfW; tx <= cx + halfW; tx++) {
        var k = tx + ',' + ty;
        var vis = Boolean(state.visible[k]);
        var exp = Boolean(state.explored[k]);
        var sx = Math.floor(originX + tx * T);
        var sy = Math.floor(originY + ty * T);
        if (!vis && !exp) continue;

        var tt = state.world.getTile(tx, ty);
        ctx.fillStyle = TILE_COLORS[tt] || '#2d2738';
        ctx.fillRect(sx, sy, T, T);

        if (tt === TILE.GRASS && sprites.grass && sprites.grass.complete) {
          ctx.drawImage(sprites.grass, 0, 0, 16, 16, sx, sy, T, T);
        } else if (tt === TILE.ASPHALT && sprites.asphalt && sprites.asphalt.complete) {
          ctx.drawImage(sprites.asphalt, 0, 0, 16, 16, sx, sy, T, T);
        }

        if (tt === TILE.WALL_BRICK || tt === TILE.WALL_WOOD || tt === TILE.WALL_PLASTER) {
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(sx + 0.5, sy + 0.5, T - 1, T - 1);
        } else if (tt === TILE.DOOR) {
          var d = state.world.doors[k];
          if (d && !d.open) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(sx + 1, sy + 4, T - 2, 7);
            ctx.fillStyle = '#805947';
            ctx.fillRect(sx + 2, sy + 5, T - 4, 5);
          }
        } else if (tt === TILE.WINDOW) {
          ctx.fillStyle = '#96a5bc';
          ctx.fillRect(sx + 2, sy + 6, T - 4, 4);
        } else if (tt === TILE.TREE_OAK || tt === TILE.TREE_PINE) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          ctx.fillStyle = '#41745a';
          ctx.fillRect(sx + 3, sy + 3, T - 6, T - 6);
        }

        // Индикатор контейнера лута
        var cont = state.world.containers[k];
        if (vis && cont && !cont.looted) {
          ctx.fillStyle = '#c9cb9f';
          ctx.fillRect(sx + 4, sy + 4, 8, 8);
          ctx.fillStyle = '#805947';
          ctx.fillRect(sx + 5, sy + 5, 6, 6);
        }

        if (!vis) {
          ctx.fillStyle = 'rgba(15, 41, 53, 0.52)';
          ctx.fillRect(sx, sy, T, T);
        }
      }
    }

    // 2. Постройки и грядки
    for (var fi = 0; fi < state.farms.length; fi++) {
      var fp = state.farms[fi];
      if (!state.visible[fp.tx + ',' + fp.ty]) continue;
      var fsx = Math.floor(originX + fp.tx * T);
      var fsy = Math.floor(originY + fp.ty * T);
      ctx.fillStyle = '#623333';
      ctx.fillRect(fsx + 2, fsy + 2, 12, 12);
      if (fp.stage > 0) {
        ctx.fillStyle = fp.dead ? '#805947' : '#95bf91';
        ctx.fillRect(fsx + 4, fsy + 4, 3 + fp.stage * 2, 3 + fp.stage * 2);
      }
    }
    for (var bi = 0; bi < state.campfires.length; bi++) {
      var cf = state.campfires[bi];
      var csx = Math.floor(originX + cf.tx * T);
      var csy = Math.floor(originY + cf.ty * T);
      ctx.fillStyle = '#d3564c';
      ctx.fillRect(csx + 4, csy + 4, 8, 8);
      ctx.fillStyle = '#c9cb9f';
      ctx.fillRect(csx + 6, csy + 6, 4, 4);
    }

    // 3. Машины (3D-проекция сверху с пиксельной обводкой и фарами)
    for (var vi = 0; vi < state.vehicles.length; vi++) {
      var v = state.vehicles[vi];
      var vx = Math.floor(originX + v.x * T);
      var vy = Math.floor(originY + v.y * T);
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(v.angle);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-13, -8, 26, 16);
      ctx.fillStyle = v.type === 'veh_ambulance' ? '#b7c0c7' : (v.type === 'veh_police' ? '#403e52' : '#5c6174');
      ctx.fillRect(-12, -7, 24, 14);
      ctx.fillStyle = '#96a5bc';
      ctx.fillRect(-3, -5, 8, 10);
      ctx.restore();
    }

    // 4. Зомби
    for (var zi = 0; zi < state.zombies.length; zi++) {
      var z = state.zombies[zi];
      if (z.state === DD.ZSTATE.DEAD) continue;
      if (!state.visible[Math.round(z.x) + ',' + Math.round(z.y)]) continue;
      var zx = Math.floor(originX + z.x * T);
      var zy = Math.floor(originY + z.y * T);
      var zSpr = sprites[z.type] || sprites.walker;
      if (zSpr && zSpr.complete) {
        ctx.drawImage(zSpr, 0, 0, 16, 16, zx - 8, zy - 8, 16, 16);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(zx - 5, zy - 6, 10, 12);
        ctx.fillStyle = z.type === 'brute' ? '#71353f' : (z.type === 'runner' ? '#9e6363' : '#679a73');
        ctx.fillRect(zx - 4, zy - 5, 8, 10);
      }
    }

    // 5. Выжившие NPC
    for (var ni = 0; ni < state.npcs.length; ni++) {
      var npc = state.npcs[ni];
      if (npc.hp <= 0 || !state.visible[Math.round(npc.x) + ',' + Math.round(npc.y)]) continue;
      var nx = Math.floor(originX + npc.x * T);
      var ny = Math.floor(originY + npc.y * T);
      if (sprites.npc && sprites.npc.complete) {
        ctx.drawImage(sprites.npc, 0, 0, 16, 16, nx - 8, ny - 8, 16, 16);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(nx - 5, ny - 6, 10, 12);
        ctx.fillStyle = npc.hostility >= 0.6 ? '#8b5084' : '#96a5bc';
        ctx.fillRect(nx - 4, ny - 5, 8, 10);
      }
    }

    // 6. Персонаж игрока в центре
    var ppx = W * 0.5, ppy = H * 0.5;
    if (sprites.player && sprites.player.complete) {
      ctx.drawImage(sprites.player, 0, 0, 16, 16, ppx - 8, ppy - 8, 16, 16);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(ppx - 5, ppy - 6, 10, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ppx - 4, ppy - 5, 8, 10);
    }
    // Луч прицела / фонарика
    ctx.strokeStyle = state.player.flashlightOn ? '#c9cb9f' : '#8c929e';
    ctx.beginPath();
    ctx.moveTo(ppx, ppy);
    ctx.lineTo(ppx + state.player.fx * 14, ppy + state.player.fy * 14);
    ctx.stroke();

    // 7. Звуковые кольца
    for (var ri = 0; ri < state.noiseRings.length; ri++) {
      var nr = state.noiseRings[ri];
      var rsx = Math.floor(originX + nr.x * T);
      var rsy = Math.floor(originY + nr.y * T);
      ctx.strokeStyle = '#c9cb9f';
      ctx.beginPath();
      ctx.arc(rsx, rsy, Math.max(4, Math.min(120, nr.r * T * (1 - nr.ttl * 1.8))), 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8. Тьма, дождь/снег и виньетка крови/холода
    if (state.tw.darkness > 0.02) {
      ctx.fillStyle = 'rgba(15, 41, 53, ' + (state.tw.darkness * 0.72).toFixed(2) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    if (state.tw.rainIntensity > 0.1) {
      ctx.fillStyle = 'rgba(150, 165, 188, 0.55)';
      for (var d = 0; d < 40; d++) {
        var rx = ((d * 73 + Math.floor(state.elapsed * 220)) % W);
        var ry = ((d * 41 + Math.floor(state.elapsed * 340)) % H);
        ctx.fillRect(rx, ry, 1, 5);
      }
    }
    var bloodRatio = 1 - state.health.bloodMl / state.health.maxBloodMl;
    if (bloodRatio > 0.08) {
      ctx.strokeStyle = 'rgba(113, 53, 63, ' + Math.min(0.85, bloodRatio * 1.4).toFixed(2) + ')';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, W, H);
      ctx.lineWidth = 1;
    }
  }

  DD.Renderer = {
    initSprites: initSprites,
    renderFrame: renderFrame,
    playSfx: playSfx,
    setMuted: function (m) { audioMuted = Boolean(m); },
    isMuted: function () { return audioMuted; }
  };
})(window);
