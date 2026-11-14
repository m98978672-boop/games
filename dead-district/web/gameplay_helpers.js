(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};

  function directionRow(x, y) {
    return Math.abs(x) > Math.abs(y) ? (x < 0 ? 2 : 3) : (y < 0 ? 1 : 0);
  }
  // Тайлы физики имеют центры в целых координатах; радиус не даёт
  // срезать угол стены, а маленькие шаги не позволяют проскочить сквозь неё.
  function canOccupy(world, x, y, radius) {
    radius = radius == null ? 0.2 : radius;
    var epsilon = 1e-7;
    var left = Math.floor(x - radius + 0.5 + epsilon);
    var right = Math.floor(x + radius + 0.5 - epsilon);
    var top = Math.floor(y - radius + 0.5 + epsilon);
    var bottom = Math.floor(y + radius + 0.5 - epsilon);
    for (var ty = top; ty <= bottom; ty++) for (var tx = left; tx <= right; tx++) {
      if (!world.isWalkable(tx, ty)) return false;
    }
    return true;
  }
  function moveWithCollision(world, x, y, dx, dy, radius) {
    var steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.15));
    var sx = dx / steps, sy = dy / steps;
    for (var i = 0; i < steps; i++) {
      if (canOccupy(world, x + sx, y, radius)) x += sx;
      if (canOccupy(world, x, y + sy, radius)) y += sy;
    }
    return { x: x, y: y };
  }
  function directionalFrame(img, width, height, dx, dy, frame) {
    var cols = Math.max(1, Math.floor(img.width / width));
    var rows = Math.max(1, Math.floor(img.height / height));
    var row = Math.min(rows - 1, directionRow(dx || 0, dy || 0));
    return row * cols + (frame % cols);
  }
  function nearestWalkable(world, x, y) {
    var cx = Math.round(x), cy = Math.round(y);
    if (canOccupy(world, x, y, 0.2)) return { x: x, y: y };
    if (canOccupy(world, cx, cy, 0.2)) return { x: cx, y: cy };
    for (var r = 1; r <= 12; r++) {
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r && canOccupy(world, cx + dx, cy + dy, 0.2)) return { x: cx + dx, y: cy + dy };
      }
    }
    return { x: 15, y: 15 };
  }
  function meleeTarget(zombies, player, range, deadState) {
    var best = null, bestDistance = Infinity;
    for (var i = 0; i < zombies.length; i++) {
      var z = zombies[i];
      if (!z || z.state === deadState) continue;
      var dx = z.x - player.x, dy = z.y - player.y;
      var distance = Math.hypot(dx, dy);
      if (distance <= range && distance < bestDistance && (distance < 0.15 || (dx * player.fx + dy * player.fy) / distance >= 0.35)) {
        best = z; bestDistance = distance;
      }
    }
    return best;
  }
  // Подсказка и действие используют один и тот же выбор цели и приоритет.
  function interactionTarget(state) {
    var p=state.player, world=state.world, T=DD.TILE;
    if (p.inVehicleId) return {type:'exitVehicle'};
    var candidates=[[Math.round(p.x+p.fx),Math.round(p.y+p.fy)],[Math.round(p.x),Math.round(p.y)]];
    for (var i=0;i<candidates.length;i++) {
      var tx=candidates[i][0],ty=candidates[i][1],key=tx+','+ty,tile=world.getTile(tx,ty);
      var door=world.doors[key], win=world.windows[key];
      if (tile===T.DOOR && door && !door.broken) {
        var blocked=door.open && Math.abs(p.x-tx)<0.7 && Math.abs(p.y-ty)<0.7;
        return {type:'door',x:tx,y:ty,object:door,blocked:blocked};
      }
      if (tile===T.WINDOW && win && !win.broken && !(win.barricade>0)) return {type:'window',x:tx,y:ty,object:win};
      var cont=world.containers[key];
      if (cont) return {type:'storage',x:tx,y:ty,object:cont};
      for(var j=0;j<state.farms.length;j++) {
        var f=state.farms[j];
        if(f.tx===tx && f.ty===ty && f.stage>=3 && !f.dead) return {type:'farm',x:tx,y:ty,object:f,index:j};
      }
    }
    for(var v=0;v<state.vehicles.length;v++) {
      var veh=state.vehicles[v];
      if(Math.hypot(veh.x-p.x,veh.y-p.y)<=2.5) return {type:'vehicle',x:veh.x,y:veh.y,object:veh};
    }
    for(var n=0;n<state.npcs.length;n++) {
      var npc=state.npcs[n];
      if(npc.hp>0 && Math.hypot(npc.x-p.x,npc.y-p.y)<=2.8) return {type:'npc',x:npc.x,y:npc.y,object:npc};
    }
    return null;
  }
  DD.GameplayHelpers = { directionRow: directionRow, directionalFrame: directionalFrame, canOccupy: canOccupy, moveWithCollision: moveWithCollision, nearestWalkable: nearestWalkable, meleeTarget: meleeTarget, interactionTarget: interactionTarget };
})(window);
