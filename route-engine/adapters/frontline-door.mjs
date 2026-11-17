// Extract metadata only. The host must separately construct and validate both
// approach nodes and all connecting edges against real terrain and wall geometry.
export function frontlineDoorEdge(game, building, openingId, { id, from, to, cost, openCost = 0 }) {
  const state = game.walls.state(building);
  const opening = state?.outline?.openings?.find(o => o.id === openingId);
  const door = state?.doors?.[openingId];
  if (!opening || !door || !['door','gate'].includes(opening.type)) throw new TypeError('not a live Frontline door or gate');
  const width = Math.hypot(opening.p2[0] - opening.p1[0], opening.p2[1] - opening.p1[1]);
  return { id, from, to, cost, portal:{ id:`${building.id}:${opening.id}`, kind:opening.type,
    state:door.state === 'open' ? 'open' : 'closed', width, openable:!door.broken, openCost } };
}
