(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};

  function directionRow(x, y) {
    return Math.abs(x) > Math.abs(y) ? (x < 0 ? 2 : 3) : (y < 0 ? 1 : 0);
  }
  function nearestWalkable(world, x, y) {
    var cx = Math.round(x), cy = Math.round(y);
    if (world.isWalkable(cx, cy)) return { x: x, y: y };
    for (var r = 1; r <= 12; r++) {
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r && world.isWalkable(cx + dx, cy + dy)) return { x: cx + dx, y: cy + dy };
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
  DD.GameplayHelpers = { directionRow: directionRow, nearestWalkable: nearestWalkable, meleeTarget: meleeTarget };
})(window);
