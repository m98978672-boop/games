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
  TILE_COLORS[TILE.TREE_OAK] = '#41745a';
  TILE_COLORS[TILE.TREE_PINE] = '#20494b';

  var sprites = {};
  var animationSettings = { speed: 1, bob: 1 };
  function loadSprite(key, relPath) {
    if (typeof global.Image !== 'function') return;
    try {
      var img = new global.Image();
      img.onload = function () { sprites[key] = img; };
      img.src = relPath + '?v=20261110b';
    } catch (err) {
      DD.ErrorManager.warn('E101', 'Renderer', 'Ошибка загрузки спрайта', { key: key, err: String(err) });
    }
  }

  function initSprites() {
    loadSprite('player', 'assets/sprites/player/player_base_walk.png');
    loadSprite('player_run', 'assets/sprites/player/player_base_run.png');
    loadSprite('player_sneak', 'assets/sprites/player/player_base_sneak.png');
    loadSprite('player_melee', 'assets/sprites/player/player_melee_swing.png');
    loadSprite('player_aim', 'assets/sprites/player/player_aim_fire.png');
    loadSprite('walker', 'assets/sprites/zombies/zombie_walker_sheet.png');
    loadSprite('runner', 'assets/sprites/zombies/zombie_runner_sheet.png');
    loadSprite('crawler', 'assets/sprites/zombies/zombie_crawler_sheet.png');
    loadSprite('brute', 'assets/sprites/zombies/zombie_brute_sheet.png');
    loadSprite('infected', 'assets/sprites/zombies/zombie_infected_sheet.png');
    loadSprite('npc_medic', 'assets/sprites/npcs/npc_medic_sheet.png');
    loadSprite('npc_mechanic', 'assets/sprites/npcs/npc_mechanic_sheet.png');
    loadSprite('npc_scavenger', 'assets/sprites/npcs/npc_scavenger_sheet.png');
    loadSprite('npc_raider', 'assets/sprites/npcs/npc_raider_sheet.png');
    loadSprite('npc_farmer', 'assets/sprites/npcs/npc_farmer_sheet.png');
    loadSprite('npc_cop', 'assets/sprites/npcs/npc_cop_sheet.png');

    loadSprite('tile_grass', 'assets/tiles/tile_grass_variants.png');
    loadSprite('tile_dirt', 'assets/tiles/tile_dirt_path.png');
    loadSprite('tile_asphalt', 'assets/tiles/tile_asphalt_road.png');
    loadSprite('tile_sidewalk', 'assets/tiles/tile_sidewalk_curb.png');
    loadSprite('tile_floor_wood', 'assets/tiles/tile_wood_floor.png');
    loadSprite('tile_floor_hospital', 'assets/tiles/tile_hospital_tile.png');
    loadSprite('tile_floor_warehouse', 'assets/tiles/tile_warehouse_concrete.png');
    loadSprite('tile_water', 'assets/tiles/tile_water_puddle.png');
    loadSprite('tile_wall_brick', 'assets/tiles/tile_wall_brick.png');
    loadSprite('tile_wall_wood', 'assets/tiles/tile_wall_wood.png');
    loadSprite('tile_wall_plaster', 'assets/tiles/tile_wall_plaster.png');
    loadSprite('tile_door', 'assets/tiles/tile_door_states.png');
    loadSprite('tile_window', 'assets/tiles/tile_window_states.png');
    loadSprite('tile_farm_soil', 'assets/tiles/tile_farm_soil_stages.png');
    loadSprite('tile_crops', 'assets/tiles/tile_crops_sheet.png');
  }

  function tileHash(tx, ty) {
    var h = (Math.imul(tx | 0, 374761393) + Math.imul(ty | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  function drawTileCell(ctx, img, frameIdx, framesPerRow, sx, sy, T) {
    var cols = Math.max(1, framesPerRow || Math.floor(img.width / 32));
    var fx = (frameIdx % cols) * 32;
    var fy = Math.floor(frameIdx / cols) * 32;
    if (fy + 32 <= img.height && fx + 32 <= img.width) {
      ctx.drawImage(img, fx, fy, 32, 32, sx, sy, T, T);
      return true;
    }
    return false;
  }

  function drawSpriteCell(ctx, img, frameIdx, cw, ch, dx, dy, dw, dh) {
    var cols = Math.max(1, Math.floor((img.width || 256) / cw));
    var fx = (frameIdx % cols) * cw;
    var fy = Math.floor(frameIdx / cols) * ch;
    if (fy + ch <= (img.height || ch) && fx + cw <= (img.width || cw)) {
      ctx.drawImage(img, fx, fy, cw, ch, dx, dy, dw, dh);
      return true;
    }
    return false;
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
    var waterPhase = Math.floor((state.elapsed || 0) * 2.5);

    // 1. Тайл-карта и туман войны с реальными 32x32 текстурами
    for (var ty = cy - halfH; ty <= cy + halfH; ty++) {
      for (var tx = cx - halfW; tx <= cx + halfW; tx++) {
        var k = tx + ',' + ty;
        var vis = Boolean(state.visible[k]);
        var exp = Boolean(state.explored[k]);
        var sx = Math.floor(originX + (tx - 0.5) * T);
        var sy = Math.floor(originY + (ty - 0.5) * T);
        if (!vis && !exp) continue;

        var tt = state.world.getTile(tx, ty);
        var th = tileHash(tx, ty);
        ctx.fillStyle = TILE_COLORS[tt] || '#2d2738';
        ctx.fillRect(sx, sy, T, T);

        var drew = false;
        if (tt === TILE.GRASS && sprites.tile_grass && sprites.tile_grass.complete) {
          drew = drawTileCell(ctx, sprites.tile_grass, th % 4, 4, sx, sy, T);
        } else if (tt === TILE.DIRT && sprites.tile_dirt && sprites.tile_dirt.complete) {
          drew = drawTileCell(ctx, sprites.tile_dirt, th % 2, 2, sx, sy, T);
        } else if (tt === TILE.ASPHALT && sprites.tile_asphalt && sprites.tile_asphalt.complete) {
          drew = drawTileCell(ctx, sprites.tile_asphalt, th % 8, 4, sx, sy, T);
        } else if (tt === TILE.SIDEWALK && sprites.tile_sidewalk && sprites.tile_sidewalk.complete) {
          drew = drawTileCell(ctx, sprites.tile_sidewalk, th % 2, 2, sx, sy, T);
        } else if (tt === TILE.FLOOR_WOOD && sprites.tile_floor_wood && sprites.tile_floor_wood.complete) {
          drew = drawTileCell(ctx, sprites.tile_floor_wood, th % 2, 2, sx, sy, T);
        } else if (tt === TILE.FLOOR_HOSPITAL && sprites.tile_floor_hospital && sprites.tile_floor_hospital.complete) {
          drew = drawTileCell(ctx, sprites.tile_floor_hospital, th % 2, 2, sx, sy, T);
        } else if (tt === TILE.FLOOR_WAREHOUSE && sprites.tile_floor_warehouse && sprites.tile_floor_warehouse.complete) {
          drew = drawTileCell(ctx, sprites.tile_floor_warehouse, th % 2, 2, sx, sy, T);
        } else if (tt === TILE.WATER && sprites.tile_water && sprites.tile_water.complete) {
          drew = drawTileCell(ctx, sprites.tile_water, (th + waterPhase) % 3, 3, sx, sy, T);
        } else if (tt === TILE.WALL_BRICK && sprites.tile_wall_brick && sprites.tile_wall_brick.complete) {
          drew = drawTileCell(ctx, sprites.tile_wall_brick, th % 4, 2, sx, sy, T);
        } else if (tt === TILE.WALL_WOOD && sprites.tile_wall_wood && sprites.tile_wall_wood.complete) {
          drew = drawTileCell(ctx, sprites.tile_wall_wood, th % 4, 2, sx, sy, T);
        } else if (tt === TILE.WALL_PLASTER && sprites.tile_wall_plaster && sprites.tile_wall_plaster.complete) {
          drew = drawTileCell(ctx, sprites.tile_wall_plaster, th % 4, 2, sx, sy, T);
        } else if (tt === TILE.DOOR && sprites.tile_door && sprites.tile_door.complete) {
          var dr = state.world.doors[k];
          drew = drawTileCell(ctx, sprites.tile_door, dr && dr.open ? 1 : 0, 3, sx, sy, T);
        } else if (tt === TILE.WINDOW && sprites.tile_window && sprites.tile_window.complete) {
          drew = drawTileCell(ctx, sprites.tile_window, th % 3, 4, sx, sy, T);
        }

        // Процедурные акценты поверх тайла или если PNG ещё грузится
        if (!drew) {
          if (tt === TILE.WALL_BRICK) {
            ctx.fillStyle = '#b7c0c7';
            ctx.fillRect(sx, sy + 5, T, 1);
            ctx.fillRect(sx, sy + 11, T, 1);
            ctx.fillStyle = '#000000';
            ctx.strokeRect(sx + 0.5, sy + 0.5, T - 1, T - 1);
          } else if (tt === TILE.GRASS && (th % 3 === 0)) {
            ctx.fillStyle = '#95bf91';
            ctx.fillRect(sx + 3 + (th % 7), sy + 4, 1, 3);
            ctx.fillRect(sx + 9, sy + 10, 2, 2);
          } else if (tt === TILE.ASPHALT && (th % 4 === 0)) {
            ctx.fillStyle = '#c9cb9f';
            ctx.fillRect(sx + 7, sy + 3, 2, 6);
          }
        }

        if (tt === TILE.TREE_OAK || tt === TILE.TREE_PINE) {
          if (sprites.tile_grass && sprites.tile_grass.complete) {
            drawTileCell(ctx, sprites.tile_grass, th % 4, 4, sx, sy, T);
          }
          // Ствол + многослойная крона
          ctx.fillStyle = '#000000';
          ctx.fillRect(sx + 6, sy + 9, 4, 6);
          ctx.fillStyle = '#805947';
          ctx.fillRect(sx + 7, sy + 10, 2, 5);
          ctx.fillStyle = '#000000';
          ctx.fillRect(sx + 1, sy + 1, T - 2, T - 5);
          ctx.fillStyle = tt === TILE.TREE_PINE ? '#20494b' : '#41745a';
          ctx.fillRect(sx + 2, sy + 2, T - 4, T - 7);
          ctx.fillStyle = tt === TILE.TREE_PINE ? '#41745a' : '#679a73';
          ctx.fillRect(sx + 4, sy + 3, T - 8, T - 10);
          ctx.fillStyle = '#95bf91';
          ctx.fillRect(sx + 5, sy + 4, 4, 3);
        }

        // Небольшой рельеф на стенах: свет сверху и боковая тень.
        if (tt === TILE.WALL_BRICK || tt === TILE.WALL_WOOD || tt === TILE.WALL_PLASTER) {
          ctx.fillStyle = 'rgba(0,0,0,0.32)';
          ctx.fillRect(sx + T - 3, sy + 2, 3, T - 2);
          ctx.fillRect(sx, sy + T - 3, T, 3);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(sx + 1, sy + 1, T - 4, 2);
        }

        // Индикатор контейнера лута (деревянный/армейский ящик с окантовкой)
        var cont = state.world.containers[k];
        if (vis && cont && !cont.looted) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(sx + 3, sy + 3, 10, 10);
          ctx.fillStyle = '#a99a73';
          ctx.fillRect(sx + 4, sy + 4, 8, 8);
          ctx.fillStyle = '#c9cb9f';
          ctx.fillRect(sx + 4, sy + 6, 8, 2);
        }

        if (!vis) {
          ctx.fillStyle = 'rgba(15, 41, 53, 0.56)';
          ctx.fillRect(sx, sy, T, T);
        }
      }
    }

    // 2. Постройки и грядки
    for (var fi = 0; fi < state.farms.length; fi++) {
      var fp = state.farms[fi];
      if (!state.visible[fp.tx + ',' + fp.ty]) continue;
      var fsx = Math.floor(originX + (fp.tx - 0.5) * T);
      var fsy = Math.floor(originY + (fp.ty - 0.5) * T);
      if (sprites.tile_farm_soil && sprites.tile_farm_soil.complete) {
        drawTileCell(ctx, sprites.tile_farm_soil, Math.min(4, fp.stage + 1), 5, fsx, fsy, T);
      } else {
        ctx.fillStyle = '#623333';
        ctx.fillRect(fsx + 1, fsy + 1, 14, 14);
      }
      if (fp.stage > 0) {
        if (sprites.tile_crops && sprites.tile_crops.complete) {
          drawTileCell(ctx, sprites.tile_crops, Math.min(3, fp.stage), 6, fsx, fsy, T);
        } else {
          ctx.fillStyle = fp.dead ? '#805947' : '#95bf91';
          ctx.fillRect(fsx + 4, fsy + 4, 3 + fp.stage * 2, 3 + fp.stage * 2);
        }
      }
    }
    for (var bi = 0; bi < state.campfires.length; bi++) {
      var cf = state.campfires[bi];
      var csx = Math.floor(originX + (cf.tx - 0.5) * T);
      var csy = Math.floor(originY + (cf.ty - 0.5) * T);
      ctx.fillStyle = '#000000';
      ctx.fillRect(csx + 2, csy + 6, 12, 5);
      ctx.fillStyle = '#805947';
      ctx.fillRect(csx + 3, csy + 7, 10, 3);
      ctx.fillStyle = '#9e6363';
      ctx.fillRect(csx + 5, csy + 3, 6, 6);
      ctx.fillStyle = '#c9cb9f';
      ctx.fillRect(csx + 6, csy + 4 + ((waterPhase) % 2), 4, 4);
    }

    // 3. Детализированные 3D-машины сверху (кузов, крыша, лобовое стекло, колёса, фары/мигалка)
    for (var vi = 0; vi < state.vehicles.length; vi++) {
      var v = state.vehicles[vi];
      var vx = Math.floor(originX + v.x * T);
      var vy = Math.floor(originY + v.y * T);
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(v.angle);
      // Тень + колёса
      ctx.fillStyle = '#000000';
      ctx.fillRect(-15, -10, 30, 20);
      ctx.fillStyle = '#2d2738';
      ctx.fillRect(-12, -10, 6, 2);
      ctx.fillRect(6, -10, 6, 2);
      ctx.fillRect(-12, 8, 6, 2);
      ctx.fillRect(6, 8, 6, 2);
      // Кузов
      var carCol = v.type === 'veh_ambulance' ? '#b7c0c7' : (v.type === 'veh_police' ? '#2d2738' : (v.type === 'veh_pickup' ? '#71353f' : '#5c6174'));
      ctx.fillStyle = carCol;
      ctx.fillRect(-14, -8, 28, 16);
      // Капот + крыша + стекло
      ctx.fillStyle = '#96a5bc';
      ctx.fillRect(2, -6, 5, 12);
      ctx.fillRect(-8, -5, 4, 10);
      ctx.fillStyle = v.type === 'veh_police' ? '#ffffff' : carCol;
      ctx.fillRect(-4, -6, 6, 12);
      // Фары и мигалка
      ctx.fillStyle = '#c9cb9f';
      ctx.fillRect(12, -7, 2, 3);
      ctx.fillRect(12, 4, 2, 3);
      if (v.type === 'veh_police') {
        ctx.fillStyle = waterPhase % 2 === 0 ? '#9e6363' : '#96a5bc';
        ctx.fillRect(-2, -4, 2, 8);
      } else if (v.type === 'veh_ambulance') {
        ctx.fillStyle = '#9e6363';
        ctx.fillRect(-3, -1, 4, 2);
        ctx.fillRect(-2, -2, 2, 4);
      }
      ctx.restore();
    }

    var animStep = Math.floor((state.elapsed || 0) * 6) % 4;

    // 4. Зомби (реальные 32x32 / 40x48 кадры)
    for (var zi = 0; zi < state.zombies.length; zi++) {
      var z = state.zombies[zi];
      if (z.state === DD.ZSTATE.DEAD) continue;
      if (!state.visible[Math.round(z.x) + ',' + Math.round(z.y)]) continue;
      var zx = Math.floor(originX + z.x * T);
      var zy = Math.floor(originY + z.y * T);
      var zSpr = sprites[z.type] || sprites.walker;
      var zW = z.type === 'brute' ? 40 : 32;
      var zH = z.type === 'brute' ? 48 : 32;
      var drawZ = z.type === 'brute' ? 24 : 18;
      if (!zSpr || !zSpr.complete || !drawSpriteCell(ctx, zSpr, DD.GameplayHelpers.directionalFrame(zSpr, zW, zH, z.dx, z.dy, animStep), zW, zH, zx - drawZ * 0.5, zy - drawZ * 0.5, drawZ, drawZ)) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(zx - 6, zy - 8, 12, 16);
        ctx.fillStyle = z.type === 'brute' ? '#71353f' : (z.type === 'runner' ? '#9e6363' : '#679a73');
        ctx.fillRect(zx - 5, zy - 7, 10, 14);
      }
    }

    // 5. Выжившие NPC (реальные 32x32 кадры по архетипу)
    for (var ni = 0; ni < state.npcs.length; ni++) {
      var npc = state.npcs[ni];
      if (npc.hp <= 0 || !state.visible[Math.round(npc.x) + ',' + Math.round(npc.y)]) continue;
      var nx = Math.floor(originX + npc.x * T);
      var ny = Math.floor(originY + npc.y * T);
      var npcKey = 'npc_' + (npc.archetype || 'scavenger');
      var nSpr = sprites[npcKey] || sprites.npc_scavenger;
      if (!nSpr || !nSpr.complete || !drawSpriteCell(ctx, nSpr, DD.GameplayHelpers.directionalFrame(nSpr, 32, 32, npc.dx, npc.dy, animStep), 32, 32, nx - 9, ny - 9, 18, 18)) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(nx - 6, ny - 8, 12, 16);
        ctx.fillStyle = npc.hostility >= 0.6 ? '#8b5084' : '#96a5bc';
        ctx.fillRect(nx - 5, ny - 7, 10, 14);
      }
    }

    // 6. Направленный спрайт, бег/крадущийся шаг и удар в сторону прицела.
    var ppx = W * 0.5, ppy = H * 0.5;
    var player = state.player;
    var attacking = player.attackCd > 0 && player.attackDuration;
    var pSpr = attacking ? (player.attackKind === 'firearm' ? sprites.player_aim : sprites.player_melee) :
      (player.moving && player.motion === 'run' ? sprites.player_run : (player.moving && player.motion === 'sneak' ? sprites.player_sneak : sprites.player));
    var cols = pSpr ? Math.max(1, Math.floor(pSpr.width / 32)) : 8;
    var facingX = attacking ? player.attackFx : player.fx;
    var facingY = attacking ? player.attackFy : player.fy;
    var row = DD.GameplayHelpers.directionRow(facingX, facingY);
    var phase = attacking ? Math.min(cols - 1, Math.floor((1 - player.attackCd / player.attackDuration) * cols)) : (player.moving ? Math.floor(state.elapsed * (player.motion === 'run' ? 10 : 6) * animationSettings.speed) % cols : 0);
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.fillRect(ppx - 7, ppy + 6, 14, 4);
    var bob = player.moving && !attacking ? Math.round(Math.sin(state.elapsed * 12 * animationSettings.speed) * animationSettings.bob) : 0;
    if (!pSpr || !pSpr.complete || !drawSpriteCell(ctx, pSpr, row * cols + phase, 32, 32, ppx - 9, ppy - 11 + bob, 18, 18)) {
      ctx.fillStyle = '#000000'; ctx.fillRect(ppx - 6, ppy - 8, 12, 16);
      ctx.fillStyle = '#96a5bc'; ctx.fillRect(ppx - 5, ppy - 3, 10, 9);
      ctx.fillStyle = '#cea19d'; ctx.fillRect(ppx - 4, ppy - 7, 8, 5);
    }
    if (attacking) {
      var progress = 1 - player.attackCd / player.attackDuration;
      var angle = Math.atan2(facingY, facingX) + (player.attackKind === 'melee' ? (progress - 0.5) * 1.4 : 0);
      ctx.strokeStyle = player.attackKind === 'melee' ? '#e7c88d' : '#fff3a4';
      ctx.lineWidth = player.attackKind === 'melee' ? 3 : 1;
      ctx.beginPath(); ctx.moveTo(ppx, ppy); ctx.lineTo(ppx + Math.cos(angle) * 20, ppy + Math.sin(angle) * 20); ctx.stroke();
      ctx.lineWidth = 1;
    }
    if (player.hitFlash > 0) {
      ctx.strokeStyle = '#fff2bc'; ctx.beginPath();
      ctx.arc(ppx + (player.hitX - player.x) * T, ppy + (player.hitY - player.y) * T, 4, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = player.flashlightOn ? '#c9cb9f' : '#8c929e';
    ctx.beginPath(); ctx.moveTo(ppx, ppy); ctx.lineTo(ppx + player.fx * 15, ppy + player.fy * 15); ctx.stroke();

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

  function renderAnimationPreview(canvas, preset, elapsed) {
    if (!canvas || !preset) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#14242c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    var key = ['player', 'player', 'player_run', 'player_sneak', 'player_melee'][preset.action];
    var img = sprites[key];
    var cols = img ? Math.max(1, Math.floor(img.width / 32)) : 8;
    var frame = preset.action === 0 ? 0 : Math.floor(elapsed * 6 * preset.speed) % cols;
    var bob = preset.action === 0 ? 0 : Math.round(Math.sin(elapsed * 12 * preset.speed) * preset.bob * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(28, 73, 40, 8);
    if (img && img.complete) drawSpriteCell(ctx, img, preset.direction * cols + frame, 32, 32, 16, 10 + bob, 64, 64);
  }

  DD.Renderer = {
    initSprites: initSprites,
    renderAnimationPreview: renderAnimationPreview,
    setAnimationStyle: function (preset) { if (preset) animationSettings = { speed: preset.speed, bob: preset.bob }; },
    renderFrame: renderFrame,
    playSfx: playSfx,
    setMuted: function (m) { audioMuted = Boolean(m); },
    isMuted: function () { return audioMuted; }
  };
})(window);
