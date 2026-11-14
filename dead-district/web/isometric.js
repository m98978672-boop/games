(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};
  var T = DD.TILE, HALF_W = 16, HALF_H = 8, W = 480, H = 270;
  function project(x, y, px, py) { return { x: W / 2 + (x - px - y + py) * HALF_W, y: H / 2 + (x - px + y - py) * HALF_H }; }
  function screenToWorld(x, y) { return { x: x / (2 * HALF_W) + y / (2 * HALF_H), y: y / (2 * HALF_H) - x / (2 * HALF_W) }; }
  function polygon(ctx, points, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]); for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]); ctx.closePath(); ctx.fill(); }
  function diamond(ctx, x, y, color) { polygon(ctx, [[x,y-8],[x+16,y],[x,y+8],[x-16,y]], color); }
  function block(ctx, x, y, height, left, right, top) {
    polygon(ctx, [[x-16,y],[x,y+8],[x,y+8-height],[x-16,y-height]], left);
    polygon(ctx, [[x,y+8],[x+16,y],[x+16,y-height],[x,y+8-height]], right);
    polygon(ctx, [[x,y-8-height],[x+16,y-height],[x,y+8-height],[x-16,y-height]], top);
  }
  var ground = {};
  ground[T.GRASS]='#365b43'; ground[T.DIRT]='#735b46'; ground[T.ASPHALT]='#393d46'; ground[T.SIDEWALK]='#737b78';
  ground[T.FLOOR_WOOD]='#a28a68'; ground[T.FLOOR_HOSPITAL]='#a6b4b3'; ground[T.FLOOR_WAREHOUSE]='#797d7d'; ground[T.WATER]='#37636b';

  // Изображения уже загружает Renderer: кэшируем только маленькие
  // изометрические отпечатки, а не пересоздаём canvas для каждого тайла.
  var floorMaterials = {};
  floorMaterials[T.GRASS] = ['tile_grass', 4]; floorMaterials[T.DIRT] = ['tile_dirt', 2];
  floorMaterials[T.ASPHALT] = ['tile_asphalt', 4]; floorMaterials[T.SIDEWALK] = ['tile_sidewalk', 2];
  floorMaterials[T.FLOOR_WOOD] = ['tile_floor_wood', 2]; floorMaterials[T.FLOOR_HOSPITAL] = ['tile_floor_hospital', 2];
  floorMaterials[T.FLOOR_WAREHOUSE] = ['tile_floor_warehouse', 2]; floorMaterials[T.WATER] = ['tile_water', 3];
  var floorStamps = Object.create(null);
  function stampFor(img, name, frame) {
    if (!img || !img.complete || !img.naturalWidth || typeof document === 'undefined') return null;
    var columns = Math.floor(img.naturalWidth / 32), rows = Math.floor(img.naturalHeight / 32);
    if (!columns || !rows || frame < 0 || frame >= columns * rows) return null;
    var key = name + ':' + frame, cached = floorStamps[key];
    if (cached && cached.image === img) return cached.canvas;
    var canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 16;
    var stamp = canvas.getContext('2d'); if (!stamp) return null;
    stamp.imageSmoothingEnabled = false;
    stamp.setTransform(0.5, 0.25, -0.5, 0.25, 16, 0);
    stamp.drawImage(img, (frame % columns) * 32, Math.floor(frame / columns) * 32, 32, 32, 0, 0, 32, 32);
    floorStamps[key] = { image: img, canvas: canvas }; return canvas;
  }
  function floorStamp(sprites, tile, hash, time) {
    var material = floorMaterials[tile]; if (!material) return null;
    // Чётные кадры дороги содержат разметку; рисуем её отдельно в привязке к дороге.
    var frame = tile === T.ASPHALT ? 1 + (hash % 4) * 2 : tile === T.WATER ? (hash + Math.floor(time * 2)) % 3 : hash % material[1];
    return stampFor(sprites[material[0]], material[0], frame);
  }
  var wallStamps = Object.create(null);
  function wallFace(ctx, img, name, frame, x, y, height, right) {
    if (!img || !img.complete || !img.naturalWidth || typeof document === 'undefined') return false;
    var cols = Math.floor(img.naturalWidth / 32), rows = Math.floor(img.naturalHeight / 32);
    if (!cols || !rows || frame < 0 || frame >= cols * rows) return false;
    var key = name + ':' + frame + ':' + height + ':' + (right ? 1 : 0), cached = wallStamps[key];
    if (!cached || cached.image !== img) {
      var canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = height + 8;
      var face = canvas.getContext('2d'); if (!face) return false;
      face.imageSmoothingEnabled = false;
      face.setTransform(0.5, right ? -0.25 : 0.25, 0, height / 32, 0, right ? 8 : 0);
      face.drawImage(img, (frame % cols) * 32, Math.floor(frame / cols) * 32, 32, 32, 0, 0, 32, 32);
      cached = wallStamps[key] = { image: img, canvas: canvas };
    }
    ctx.drawImage(cached.canvas, Math.round(x) + (right ? 0 : -16), Math.round(y - height));
    return true;
  }
  // UV-разметка граней сохраняется и на обычной стене, и на пониженной рядом с игроком.
  function faceRect(ctx, x, y, height, right, u0, v0, u1, v1, color) {
    function at(u, v) { return right ? [x + 16*u, y + 8 - 8*u - height + height*v] : [x - 16 + 16*u, y + 8*u - height + height*v]; }
    polygon(ctx, [at(u0,v0), at(u1,v0), at(u1,v1), at(u0,v1)], color);
  }
  function roadMark(ctx, x, y, tx, ty) {
    var lx = ((tx % 32) + 32) % 32, ly = ((ty % 32) + 32) % 32;
    var crossX = lx >= 13 && lx <= 16, crossY = ly >= 13 && ly <= 16;
    var vertical = lx === 14 && !crossY && ((ty % 4) + 4) % 4 < 2;
    var horizontal = ly === 14 && !crossX && ((tx % 4) + 4) % 4 < 2;
    if (!vertical && !horizontal) return;
    ctx.strokeStyle = '#c9bd89'; ctx.lineWidth = 1.4; ctx.beginPath();
    if (vertical) { ctx.moveTo(x + 5, y - 2.5); ctx.lineTo(x - 5, y + 2.5); }
    else { ctx.moveTo(x - 5, y - 2.5); ctx.lineTo(x + 5, y + 2.5); }
    ctx.stroke(); ctx.lineWidth = 1;
  }
  function render(ctx, state, sprites, drawSpriteCell, animationSettings) {
    var px = state.player.x, py = state.player.y, time = state.elapsed || 0;
    ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#101b1d'; ctx.fillRect(0,0,W,H);
    var items = [], cx = Math.round(px), cy = Math.round(py), radius = 24;
    for (var ty = cy-radius; ty <= cy+radius; ty++) for (var tx = cx-radius; tx <= cx+radius; tx++) {
      var p = project(tx,ty,px,py); if (p.x < -50 || p.x > W+50 || p.y < -65 || p.y > H+40) continue;
      var key = tx+','+ty, visible = !!state.visible[key], explored = !!state.explored[key]; if (!visible && !explored) continue;
      var tile = state.world.getTile(tx,ty), hash = Math.abs(Math.imul(tx,73856093)^Math.imul(ty,19349663));
      var isWall = tile === T.WALL_BRICK || tile === T.WALL_WOOD || tile === T.WALL_PLASTER;
      var tree = tile === T.TREE_OAK || tile === T.TREE_PINE;
      var isStructure = isWall || tile === T.DOOR || tile === T.WINDOW;
      var materialTile = isStructure ? T.FLOOR_WOOD : tree ? T.GRASS : tile;
      if (tile === T.DOOR || tile === T.WINDOW) {
        var neighbours = [[0,1],[0,-1],[1,0],[-1,0]];
        for (var n = 0; n < neighbours.length; n++) {
          var adjacent = state.world.getTile(tx + neighbours[n][0], ty + neighbours[n][1]);
          if (adjacent === T.FLOOR_WOOD || adjacent === T.FLOOR_HOSPITAL || adjacent === T.FLOOR_WAREHOUSE) { materialTile = adjacent; break; }
        }
      }
      var base = ground[materialTile] || '#555d50';
      // Одинаковое округление для соседних клеток исключает дрожание и щели при движении камеры.
      var gx = Math.round(p.x), gy = Math.round(p.y);
      diamond(ctx,gx,gy,base);
      var stamp = floorStamp(sprites, materialTile, hash, time);
      if (stamp) {
        ctx.save(); ctx.globalAlpha = materialTile === T.FLOOR_WOOD ? 0.65 : (materialTile === T.ASPHALT || materialTile === T.GRASS ? 0.72 : 0.85);
        ctx.drawImage(stamp, gx - 16, gy - 8); ctx.restore();
      }
      if (tile === T.ASPHALT) roadMark(ctx,gx,gy,tx,ty);
      if (!visible) diamond(ctx,gx,gy,'rgba(10,24,28,.62)');
      if (isStructure || tree) items.push({type:tree?'tree':'wall', x:tx,y:ty,tile:tile,visible:visible,key:key});
      var cont = state.world.containers[key]; if (cont && !cont.furnished && visible) items.push({type:'crate',x:tx,y:ty,data:cont});
      var furnishing = state.world.furniture && state.world.furniture[key];
      if (furnishing && visible) items.push({type:'furniture',x:tx,y:ty,data:furnishing});
    }
    // Пятна остаются на земле, а свежие капли разлетаются и оседают.
    (state.bloodMarks || []).forEach(function(b) {
      if (!state.visible[Math.round(b.x)+','+Math.round(b.y)]) return;
      var p=project(b.x,b.y,px,py), age=Math.max(0,time-b.time), spread=Math.min(1,age/.35);
      ctx.fillStyle='#591c24'; ctx.beginPath(); ctx.ellipse(p.x,p.y+2,5,2.5,0,0,Math.PI*2); ctx.fill();
      for(var i=0;i<8;i++) {
        var angle=(i*2.4+b.seed)*1.4, distance=(3+(i%4)*2)*spread;
        ctx.fillStyle=i%3===0?'#c84543':'#822a2c';
        ctx.fillRect(p.x+Math.cos(angle)*distance,p.y+Math.sin(angle)*distance*.45-(1-spread)*(5+i),2,2);
      }
    });
    state.farms.forEach(function(f){if(state.visible[f.tx+','+f.ty]) items.push({type:'farm',x:f.tx,y:f.ty, data:f});});
    state.campfires.forEach(function(f){if(state.visible[f.tx+','+f.ty]) items.push({type:'fire',x:f.tx,y:f.ty});});
    state.vehicles.forEach(function(v){if(state.visible[Math.round(v.x)+','+Math.round(v.y)]) items.push({type:'vehicle',x:v.x,y:v.y,data:v});});
    state.zombies.forEach(function(z){if(z.state!==DD.ZSTATE.DEAD && state.visible[Math.round(z.x)+','+Math.round(z.y)]) items.push({type:'zombie',x:z.x,y:z.y,data:z});});
    state.npcs.forEach(function(n){if(n.hp>0 && state.visible[Math.round(n.x)+','+Math.round(n.y)]) items.push({type:'npc',x:n.x,y:n.y,data:n});});
    if (!state.player.inVehicleId) items.push({type:'player',x:px,y:py,data:state.player});
    items.sort(function(a,b){return (a.x+a.y)-(b.x+b.y) || a.x-b.x || (a.type === b.type ? 0 : a.type === 'wall' ? -1 : b.type === 'wall' ? 1 : 0);});
    function actor(item, q) {
      var o=item.data, key, cw=32,ch=32,size=26, dirX=o.dx||0,dirY=o.dy||0, frame=Math.floor(time*6)%4;
      if(item.type==='player') { var attack=o.attackCd>0 && o.attackDuration; key=attack?(o.attackKind==='firearm'?'player_aim':'player_melee'):(o.moving && o.motion==='run'?'player_run':(o.moving && o.motion==='sneak'?'player_sneak':'player')); dirX=attack?o.attackFx:o.fx;dirY=attack?o.attackFy:o.fy;frame=attack?Math.floor((1-o.attackCd/o.attackDuration)*7):(o.moving?Math.floor(time*6*animationSettings.speed):0); }
      else if(item.type==='zombie') {key=o.type; if(key==='brute'){cw=40;ch=48;size=32;}
        frame=o.moving?Math.floor(time*(o.type==='runner'?12:7)):0;
        if(o.moving && !o.crippled) q={x:q.x,y:q.y-Math.abs(Math.sin(time*(o.type==='runner'?12:7)))*(o.type==='runner'?2:1)};
      }
      else key='npc_'+(o.archetype||'scavenger');
      var img=sprites[key] || sprites.walker;
      ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(q.x,q.y+3,7,3,0,0,Math.PI*2);ctx.fill();
      if(img && img.complete && img.naturalWidth){var idx=DD.GameplayHelpers.directionalFrame(img,cw,ch,dirX,dirY,frame);drawSpriteCell(ctx,img,idx,cw,ch,q.x-size/2,q.y-size+5,size,size);}
      else {ctx.fillStyle=item.type==='zombie'?'#779b70':'#b3c5d3';ctx.fillRect(q.x-4,q.y-16,8,14);ctx.fillStyle='#d1a29a';ctx.fillRect(q.x-3,q.y-20,6,6);}
      if (item.type==='player' && o.attackCd>0) { var end=project(px+(o.attackFx||0)*1.2,py+(o.attackFy||0)*1.2,px,py); ctx.strokeStyle='#f8d98f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x,q.y-8);ctx.lineTo(end.x,end.y-8);ctx.stroke();ctx.lineWidth=1; }
    }
    // Несколько слоёв небольших изометрических объёмов вместо плоских иконок.
    function furniture(item) {
      var f=item.data;
      function pos(x,y,z) { var p=project(item.x+x,item.y+y,px,py);return [p.x,p.y-z]; }
      function part(x,y,w,d,z,h,top,left,right) {
        var a=pos(x-w/2,y-d/2,z), b=pos(x+w/2,y-d/2,z), c=pos(x+w/2,y+d/2,z), e=pos(x-w/2,y+d/2,z);
        polygon(ctx,[e,c,[c[0],c[1]-h],[e[0],e[1]-h]],left);
        polygon(ctx,[c,b,[b[0],b[1]-h],[c[0],c[1]-h]],right);
        polygon(ctx,[[a[0],a[1]-h],[b[0],b[1]-h],[c[0],c[1]-h],[e[0],e[1]-h]],top);
      }
      var kind=f.kind;
      if(kind==='bed'||kind==='hospital_bed') {
        part(0,0,.88,.72,0,4,'#8b684b','#614735','#4d392e');
        part(0,0,.78,.62,4,3,kind==='hospital_bed'?'#b5c7c2':'#8a9d87','#71887d','#526e68');
        part(-.24,0,.22,.5,7,2,'#e0dbbf','#bfbda9','#abae9d');
      } else if(kind==='sofa') {
        part(0,0,.85,.66,0,6,'#7e6058','#62463f','#4c3735');
        part(-.30,0,.2,.68,6,6,'#aa8372','#7c5c52','#684a45');
        part(.12,0,.5,.57,6,2,'#a78376','#805f58','#694d48');
      } else if(kind==='table'||kind==='workbench') {
        part(-.3,-.24,.12,.12,0,7,'#806248','#624635','#4c352c');
        part(.3,.24,.12,.12,0,7,'#806248','#624635','#4c352c');
        part(0,0,.84,.7,7,3,'#b18c61','#7b5d41','#624833');
        if(kind==='workbench') part(0,0,.3,.25,10,2,'#8a9a9b','#657477','#465961');
      } else if(kind==='fridge'||kind==='cabinet') {
        part(0,0,.68,.67,0,17,kind==='fridge'?'#d6d7c7':'#9b7650',kind==='fridge'?'#aabdb7':'#765438',kind==='fridge'?'#829b9a':'#59412e');
        part(.36,0,.04,.45,8,1,kind==='fridge'?'#536b69':'#c5a36c','#536b69','#536b69');
      } else if(kind==='shelf') {
        part(0,0,.75,.58,0,15,'#a68760','#6b4b35','#523a2e');
        part(.36,0,.04,.46,5,2,'#c9a97c','#c9a97c','#c9a97c');
        part(.36,0,.04,.46,10,2,'#c9a97c','#c9a97c','#c9a97c');
      } else part(0,0,.7,.7,0,8,'#bd9865','#87613e','#674b32');
    }
    function vehicle(v) {
      var a=v.angle || 0, c=Math.cos(a), s=Math.sin(a);
      var longBody=v.type==='veh_van'||v.type==='veh_truck'||v.type==='veh_ambulance';
      function point(f,side,h){f*=longBody?1.15:1;return project(v.x+c*f-s*side,v.y+s*f+c*side,px,py+h/8);}
      // Высота смещает экранную Y, не мировую позицию.
      function p(f,side,h){var z=point(f,side,0);return [z.x,z.y-h];}
      function face(coords,col){polygon(ctx,coords.map(function(t){return p(t[0],t[1],t[2]);}),col);}
      var palettes = {
        veh_sedan:['#728b91','#9caead'], veh_police:['#394f5f','#a7bdc0'], veh_pickup:['#95554a','#c08970'],
        veh_van:['#8f9a7f','#c0c8ac'], veh_truck:['#a78a58','#d3bc84'], veh_ambulance:['#d9d9c9','#eef0e2']
      };
      var palette=palettes[v.type] || palettes.veh_sedan, body=palette[0], highlight=palette[1];
      function line(points,color,width) { ctx.strokeStyle=color;ctx.lineWidth=width||1;ctx.beginPath();points.forEach(function(t,i){var point=p(t[0],t[1],t[2]);if(i)ctx.lineTo(point[0],point[1]);else ctx.moveTo(point[0],point[1]);});ctx.stroke();ctx.lineWidth=1; }
      var shadow=project(v.x,v.y,px,py);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(shadow.x,shadow.y+4,20,7,0,0,Math.PI*2);ctx.fill();
      // Колёса, бамперы и кузов в координатах автомобиля поворачиваются вместе с ним.
      [[-.68,-.49],[.65,-.49],[-.68,.49],[.65,.49]].forEach(function(w){
        var wheel=p(w[0],w[1],1); ctx.fillStyle='#172125';ctx.beginPath();ctx.ellipse(wheel[0],wheel[1],3.5,4,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#879091';ctx.fillRect(wheel[0]-1,wheel[1]-1,2,2);
      });
      face([[-1,-.48,0],[1,-.48,0],[1,-.48,7],[-1,-.48,7]],'#344047');
      face([[-1,.48,0],[1,.48,0],[1,.48,7],[-1,.48,7]],'#29343a');
      face([[-1,-.48,7],[1,-.48,7],[1,.48,7],[-1,.48,7]],body);
      face([[.53,-.38,7.2],[.91,-.38,7.2],[.91,.38,7.2],[.53,.38,7.2]],highlight);
      line([[.53,-.37,7.4],[.92,-.37,7.4],[.92,.37,7.4],[.53,.37,7.4]],'#52666a',.7);
      line([[-.86,.49,3],[.86,.49,3]],'#172b30',1);
      line([[-.13,.49,3],[-.13,.49,7]],'#263d40',.8);
      face([[.97,-.48,1],[.97,.48,1],[.97,.48,6],[.97,-.48,6]],'#596970');
      face([[1.01,-.28,2],[1.01,.28,2],[1.01,.28,4],[1.01,-.28,4]],'#263638');
      face([[-.88,.49,4],[.85,.49,4],[.85,.49,5],[-.88,.49,5]],v.type==='veh_ambulance'?'#bb4844':v.type==='veh_police'?'#d4d6c8':'#87969a');
      if(v.type==='veh_pickup') face([[-.92,-.36,8],[-.55,-.36,8],[-.55,.36,8],[-.92,.36,8]],'#423d36');
      if(longBody) {
        face([[-.97,-.42,7],[-.48,-.42,7],[-.48,-.42,15],[-.97,-.42,15]],body);
        face([[-.97,.42,7],[-.48,.42,7],[-.48,.42,15],[-.97,.42,15]],body);
        face([[-.97,-.42,15],[-.48,-.42,15],[-.48,.42,15],[-.97,.42,15]],body);
      }
      face([[-.5,-.40,7],[.45,-.40,7],[.25,-.36,14],[-.4,-.36,14]],'#557b87');
      face([[-.5,.40,7],[.45,.40,7],[.25,.36,14],[-.4,.36,14]],'#314f59');
      face([[.45,-.40,7],[.45,.40,7],[.25,.36,14],[.25,-.36,14]],'#8eafb4');
      line([[.43,-.35,8],[.26,-.32,13],[.26,.32,13]],'#d4dfd8',.9);
      line([[-.06,.40,7],[-.08,.37,14]],'#253d43',1.2);
      line([[.28,-.40,8],[.08,-.37,14]],'#304d54',1);
      face([[-.09,.50,5],[.08,.50,5],[.08,.50,6],[-.09,.50,6]],'#c5c9b9');
      if (state.player.inVehicleId===v.id) {
        // Видимый водитель за лобовым стеклом, без отдельного спрайта поверх машины.
        var driver=p(.31,-.13,10);ctx.fillStyle='#273844';ctx.fillRect(driver[0]-3,driver[1]-3,6,5);ctx.fillStyle='#d7aa90';ctx.fillRect(driver[0]-2,driver[1]-5,4,4);ctx.fillStyle='#292b30';ctx.fillRect(driver[0]-2,driver[1]-6,4,2);
      }
      face([[-.4,-.36,14],[.25,-.36,14],[.25,.36,14],[-.4,.36,14]],body);
      line([[-.36,-.30,14.5],[.18,-.30,14.5],[.18,.30,14.5]],highlight,1);
      var head=p(.99,-.31,5);ctx.fillStyle='#ffefb5';ctx.fillRect(head[0]-2,head[1]-1,4,3);head=p(.99,.31,5);ctx.fillRect(head[0]-2,head[1]-1,4,3);
      var tail=p(-.99,.33,5);ctx.fillStyle='#c65e4c';ctx.fillRect(tail[0]-2,tail[1]-1,3,3);
      line([[1.02,-.38,1],[1.02,.38,1]],'#adbdb6',1.3);
      var mirror=p(.32,.52,10);ctx.fillStyle='#263b3c';ctx.fillRect(mirror[0]-2,mirror[1]-1,4,2);
      if(v.type==='veh_ambulance'){var cross=p(-.06,0,15);ctx.fillStyle='#c5403d';ctx.fillRect(cross[0]-3,cross[1]-1,6,2);ctx.fillRect(cross[0]-1,cross[1]-3,2,6);}
      if(v.type==='veh_police'){var beacon=p(-.05,0,15);ctx.fillStyle='#d75555';ctx.fillRect(beacon[0]-3,beacon[1]-1,3,2);ctx.fillStyle='#80bad4';ctx.fillRect(beacon[0],beacon[1]-1,3,2);}
      // Колёса поверх боковины, иначе кузов закрывает их почти полностью.
      var visibleSide=(c-s)>=0 ? .50 : -.50;
      [[-.68,visibleSide],[.65,visibleSide]].forEach(function(w){
        var wheel=p(w[0],w[1],1); ctx.fillStyle='#111b1e';ctx.beginPath();ctx.ellipse(wheel[0],wheel[1],3.4,3.7,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#a2acad';ctx.fillRect(wheel[0]-1,wheel[1]-1,2,2);
      });
    }
    items.forEach(function(item) {
      var q=project(item.x,item.y,px,py);
      if(item.type==='wall') {
        var tile=item.tile, door=state.world.doors[item.key], near=Math.abs(item.x-px)+Math.abs(item.y-py)<3;
        // Передняя стена опускается, когда игрок в помещении: она не прячет мебель.
        var indoors = state.world.isIndoor && state.world.isIndoor(Math.round(px),Math.round(py));
        var foreground = indoors && item.x+item.y > px+py && Math.abs(item.x-px)+Math.abs(item.y-py)<12;
        var h = tile === T.DOOR || tile === T.WINDOW ? 18 : (foreground ? 4 : (near ? 8 : 18));
        var doorProgress = door && door.animStart != null ? door.animFrom + ((door.open ? 1 : 0)-door.animFrom)*Math.min(1,Math.max(0,(time-door.animStart)/.4)) : (door && door.open ? 1 : 0);
        if(tile===T.DOOR && door && (doorProgress > .01 || door.broken)) {
          var fullHeight=h; h=3;block(ctx,q.x,q.y,h,'#634c37','#46392f','#9a8060');
          if(!door.broken) {
            var hinge=project(item.x-.46,item.y,px,py), ang=doorProgress*Math.PI/2;
            var tip=project(item.x-.46+Math.cos(ang)*.92,item.y+Math.sin(ang)*.92,px,py);
            polygon(ctx,[[hinge.x,hinge.y],[tip.x,tip.y],[tip.x,tip.y-fullHeight],[hinge.x,hinge.y-fullHeight]],'#a87950');
            ctx.strokeStyle='#51382d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hinge.x,hinge.y-fullHeight);ctx.lineTo(tip.x,tip.y-fullHeight);ctx.lineTo(tip.x,tip.y);ctx.stroke();ctx.lineWidth=1;
            ctx.fillStyle='#f2d584';ctx.fillRect(tip.x-3,tip.y-fullHeight*.5,2,2);
          }
        }
        else {var colors=tile===T.WALL_WOOD?['#674736','#4c352e','#9c7958']:tile===T.WALL_PLASTER?['#b3aaa0','#938c87','#ded4c6']:['#85554d','#693f3a','#ac7565'];if(tile===T.DOOR)colors=['#71503a','#563b30','#a8845a'];if(tile===T.WINDOW)colors=['#62818a','#476570','#b5c7c6'];block(ctx,q.x,q.y,h,colors[0],colors[1],colors[2]);
          if (tile===T.WALL_WOOD || tile===T.WALL_BRICK || tile===T.WALL_PLASTER) {
            var material = tile===T.WALL_WOOD?'tile_wall_wood':tile===T.WALL_BRICK?'tile_wall_brick':'tile_wall_plaster';
            var frame = Math.abs(Math.imul(item.x,73856093)^Math.imul(item.y,19349663)) % 4;
            if (wallFace(ctx,sprites[material],material,frame,q.x,q.y,h,false)) {
              wallFace(ctx,sprites[material],material,frame,q.x,q.y,h,true);
              polygon(ctx,[[q.x,q.y+8],[q.x+16,q.y],[q.x+16,q.y-h],[q.x,q.y+8-h]],'rgba(0,0,0,.18)');
              var wallTop = stampFor(sprites[material],material,frame);
              if (wallTop) { ctx.save(); ctx.globalAlpha = 0.4; ctx.drawImage(wallTop, Math.round(q.x)-16, Math.round(q.y-h)-8); ctx.restore(); }
            }
          }
          if(tile===T.DOOR || tile===T.WINDOW) {
            var win = tile === T.WINDOW ? state.world.windows[item.key] : null;
            for (var side = 0; side < 2; side++) {
              var right = side === 1;
              faceRect(ctx,q.x,q.y,h,right,.10,.08,.90,.95,tile===T.DOOR?'#483229':'#405d63');
              faceRect(ctx,q.x,q.y,h,right,.18,.14,.82,.88,tile===T.DOOR?'#ad8051':(win && win.broken?'#39575d':'#a8cbd0'));
              if (tile===T.DOOR) {
                faceRect(ctx,q.x,q.y,h,right,.24,.25,.76,.32,'#755439');
                faceRect(ctx,q.x,q.y,h,right,.69,.53,.78,.62,'#f3dc85');
              } else {
                faceRect(ctx,q.x,q.y,h,right,.46,.14,.54,.88,'#536e75');
                faceRect(ctx,q.x,q.y,h,right,.18,.48,.82,.55,'#536e75');
                if (win && win.broken) faceRect(ctx,q.x,q.y,h,right,.22,.20,.42,.40,'#d3e5df');
                if (win && win.barricade > 0) faceRect(ctx,q.x,q.y,h,right,.08,.53,.92,.72,'#8c6746');
              }
            }
          }
        }
        if(tile===T.WINDOW && item.visible) {
          var brokenWindow=state.world.windows[item.key];
          if(brokenWindow && brokenWindow.broken && brokenWindow.breakTime != null) {
            var age=Math.max(0,time-brokenWindow.breakTime);
            if(age<.8) for(var sh=0;sh<9;sh++) {
              var progress=age/.8, sx=q.x+(sh-4)*progress*3, sy=q.y-h*.55+progress*progress*15-(sh%3)*progress*8;
              ctx.fillStyle=sh%2?'#daf2ed':'#81bbc5';polygon(ctx,[[sx,sy],[sx+3,sy+1],[sx+1,sy+4]],ctx.fillStyle);
            }
          }
        }
        if(!item.visible) {
          // Не затемнять соседние клетки прямоугольником вокруг стены.
          var fog='rgba(10,24,28,.48)';
          polygon(ctx,[[q.x-16,q.y],[q.x,q.y+8],[q.x,q.y+8-h],[q.x-16,q.y-h]],fog);
          polygon(ctx,[[q.x,q.y+8],[q.x+16,q.y],[q.x+16,q.y-h],[q.x,q.y+8-h]],fog);
          polygon(ctx,[[q.x,q.y-8-h],[q.x+16,q.y-h],[q.x,q.y+8-h],[q.x-16,q.y-h]],fog);
        }
      } else if(item.type==='tree') {ctx.fillStyle='#564332';ctx.fillRect(q.x-2,q.y-20,4,20);ctx.fillStyle=item.tile===T.TREE_PINE?'#275044':'#3b6945';ctx.beginPath();ctx.arc(q.x,q.y-23,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#648e58';ctx.beginPath();ctx.arc(q.x-4,q.y-27,6,0,Math.PI*2);ctx.fill();}
      else if(item.type==='crate') {
        block(ctx,q.x,q.y,7,'#87613d','#674b32',item.data && item.data.kind==='chest'?'#a87846':'#bc9862');
        if(item.data && item.data.kind==='chest') {ctx.fillStyle='#e0c47b';ctx.fillRect(q.x-2,q.y-2,4,3);ctx.fillStyle='#56402c';ctx.fillRect(q.x-1,q.y-1,2,1);}
        else {ctx.strokeStyle='#69462e';ctx.beginPath();ctx.moveTo(q.x-10,q.y-5);ctx.lineTo(q.x,q.y);ctx.lineTo(q.x+10,q.y-5);ctx.stroke();}
      }
      else if(item.type==='farm'){diamond(ctx,q.x,q.y,'#664735');if(item.data.stage>0){ctx.fillStyle='#80a85a';ctx.fillRect(q.x-2,q.y-5,4,5);}}
      else if(item.type==='fire'){ctx.fillStyle='#f3af49';ctx.fillRect(q.x-2,q.y-7,4,7);}
      else if(item.type==='vehicle') vehicle(item.data);
      else if(item.type==='furniture') furniture(item);
      else actor(item,q);
    });
    var target=state.interactionTarget;
    if(target && target.x != null && state.visible[Math.round(target.x)+','+Math.round(target.y)]) {
      var mark=project(target.x,target.y,px,py);
      ctx.strokeStyle='rgba(255,221,137,.95)';ctx.lineWidth=1.5;ctx.beginPath();
      ctx.moveTo(mark.x,mark.y-8);ctx.lineTo(mark.x+16,mark.y);ctx.lineTo(mark.x,mark.y+8);ctx.lineTo(mark.x-16,mark.y);ctx.closePath();ctx.stroke();ctx.lineWidth=1;
    }
    if(state.tw.darkness>0.02){ctx.fillStyle='rgba(10,23,34,'+(state.tw.darkness*.65).toFixed(2)+')';ctx.fillRect(0,0,W,H);}
    if(state.tw.rainIntensity>0.1){ctx.fillStyle='rgba(185,205,215,.55)';for(var r=0;r<45;r++)ctx.fillRect((r*73+Math.floor(time*100))%W,(r*47+Math.floor(time*260))%H,1,4);}
    var blood=1-state.health.bloodMl/state.health.maxBloodMl;if(blood>.08){ctx.strokeStyle='rgba(113,53,63,'+Math.min(.85,blood*1.4)+')';ctx.lineWidth=6;ctx.strokeRect(0,0,W,H);ctx.lineWidth=1;}
  }
  DD.Isometric = { project:project, screenToWorld:screenToWorld, render:render };
})(window);
